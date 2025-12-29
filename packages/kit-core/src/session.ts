/**
 * ============================================================================
 * Session Manager
 * ============================================================================
 * Manages session lifecycle and state
 * ============================================================================
 */

import type {
  Session,
  SessionState,
  SessionStatus,
  CreateSessionOptions,
  RunInput,
  AgUiEvent,
  AgUiMessage,
  Unsubscribe,
} from '@aevatar/kit-types';
import { createEventStream, type EventStream } from '@aevatar/kit-protocol';
import { createRunManager, type RunInstance } from './run';
import { createStateStore, type StateStore } from './state';
import type { Logger } from './utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionManagerOptions {
  baseUrl: string;
  apiKey?: string;
  logger: Logger;
}

export interface SessionManager {
  /** Create a new session */
  create(options?: CreateSessionOptions): Promise<SessionInstance>;
  
  /** Get existing session instance */
  get(sessionId: string): SessionInstance | null;
  
  /** Close all sessions */
  closeAll(): void;
}

export interface SessionInstance {
  /** Session ID */
  readonly id: string;
  
  /** Session data */
  readonly data: Session;
  
  /** Current status */
  readonly status: SessionStatus;
  
  /** Current state */
  readonly state: SessionState;
  
  /** Messages in this session */
  readonly messages: AgUiMessage[];
  
  /** Current run if any */
  readonly currentRun: RunInstance | null;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Operations
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Start a new run */
  startRun(input?: RunInput): Promise<RunInstance>;
  
  /** Send a message */
  sendMessage(content: string): Promise<void>;
  
  /** Stop current run */
  stopRun(): Promise<void>;
  
  /** Close session */
  close(): Promise<void>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Subscriptions
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Subscribe to state changes */
  onStateChange(callback: (state: SessionState) => void): Unsubscribe;
  
  /** Subscribe to new messages */
  onMessage(callback: (message: AgUiMessage) => void): Unsubscribe;
  
  /** Subscribe to all events */
  onEvent(callback: (event: AgUiEvent) => void): Unsubscribe;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Manager Implementation
// ─────────────────────────────────────────────────────────────────────────────

export function createSessionManager(options: SessionManagerOptions): SessionManager {
  const { baseUrl, apiKey, logger } = options;
  const sessions = new Map<string, SessionInstance>();

  async function create(opts?: CreateSessionOptions): Promise<SessionInstance> {
    const response = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(opts ?? {}),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    const sessionData = await response.json() as Session;
    const instance = createSessionInstance(sessionData, { baseUrl, apiKey, logger });
    
    sessions.set(sessionData.id, instance);
    logger.info('Session created', { sessionId: sessionData.id });
    
    return instance;
  }

  function get(sessionId: string): SessionInstance | null {
    return sessions.get(sessionId) ?? null;
  }

  function closeAll(): void {
    sessions.forEach((session) => session.close());
    sessions.clear();
  }

  return { create, get, closeAll };
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Instance Implementation
// ─────────────────────────────────────────────────────────────────────────────

interface SessionInstanceOptions {
  baseUrl: string;
  apiKey?: string;
  logger: Logger;
}

function createSessionInstance(
  data: Session,
  options: SessionInstanceOptions
): SessionInstance {
  const { baseUrl, apiKey, logger } = options;
  
  const stateStore: StateStore = createStateStore(data.state);
  const messages: AgUiMessage[] = [];
  const eventListeners = new Set<(event: AgUiEvent) => void>();
  const messageListeners = new Set<(message: AgUiMessage) => void>();
  
  let currentRun: RunInstance | null = null;
  let eventStream: EventStream | null = null;
  let status: SessionStatus = data.status;

  // ───────────────────────────────────────────────────────────────────────────
  // Event Handling
  // ───────────────────────────────────────────────────────────────────────────

  let eventStreamReady: Promise<void> | null = null;

  function setupEventStream(): Promise<void> {
    if (eventStreamReady) return eventStreamReady;

    eventStreamReady = new Promise<void>((resolve) => {
      eventStream = createEventStream({
        url: `${baseUrl}/api/sessions/${data.id}/events`,
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        autoReconnect: true,
        onStatusChange: (status) => {
          if (status === 'connected') {
            resolve();
          }
        },
      });

      // Route events
      eventStream.onAny((event) => {
        eventListeners.forEach((cb) => cb(event));
      });

      // Handle state updates
      eventStream.on('STATE_SNAPSHOT', (event) => {
        stateStore.setSnapshot(event.snapshot);
      });

      eventStream.on('STATE_DELTA', (event) => {
        stateStore.applyDelta(event.delta);
      });

      // Handle messages
      eventStream.on('MESSAGES_SNAPSHOT', (event) => {
        messages.length = 0;
        messages.push(...event.messages);
      });

      eventStream.connect();
      
      // Resolve after a short timeout if connection doesn't complete
      setTimeout(resolve, 500);
    });

    return eventStreamReady;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Public API
  // ───────────────────────────────────────────────────────────────────────────

  async function startRun(input?: RunInput): Promise<RunInstance> {
    if (currentRun && currentRun.status === 'running') {
      throw new Error('A run is already in progress');
    }

    // Wait for SSE connection to be ready before starting run
    await setupEventStream();
    
    const runManager = createRunManager({
      baseUrl,
      apiKey,
      sessionId: data.id,
      logger,
    });

    currentRun = await runManager.start(input);
    status = 'running';
    
    return currentRun;
  }

  async function sendMessage(content: string): Promise<void> {
    await startRun({ message: content });
  }

  async function stopRun(): Promise<void> {
    if (currentRun) {
      await currentRun.stop();
      currentRun = null;
      status = 'idle';
    }
  }

  async function close(): Promise<void> {
    await stopRun();
    eventStream?.disconnect();
    eventStream = null;
    status = 'closed';
    logger.info('Session closed', { sessionId: data.id });
  }

  function onStateChange(callback: (state: SessionState) => void): Unsubscribe {
    return stateStore.subscribe(callback);
  }

  function onMessage(callback: (message: AgUiMessage) => void): Unsubscribe {
    messageListeners.add(callback);
    return () => messageListeners.delete(callback);
  }

  function onEvent(callback: (event: AgUiEvent) => void): Unsubscribe {
    eventListeners.add(callback);
    return () => eventListeners.delete(callback);
  }

  return {
    get id() {
      return data.id;
    },
    get data() {
      return data;
    },
    get status() {
      return status;
    },
    get state() {
      return stateStore.getState();
    },
    get messages() {
      return [...messages];
    },
    get currentRun() {
      return currentRun;
    },
    startRun,
    sendMessage,
    stopRun,
    close,
    onStateChange,
    onMessage,
    onEvent,
  };
}

