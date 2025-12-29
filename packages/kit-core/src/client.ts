/**
 * ============================================================================
 * Aevatar Client
 * ============================================================================
 * Main entry point for AevatarKit SDK
 * ============================================================================
 */

import type {
  ClientOptions,
  ConnectionStatus,
  Session,
  SessionSummary,
  CreateSessionOptions,
  Run,
  RunSummary,
  AgentInfo,
  AgentSummary,
  GraphDefinition,
  GraphSummary,
  Memory,
  MemorySearchOptions,
  MemorySearchResult,
  Unsubscribe,
} from '@aevatar/kit-types';
import { createSessionManager, type SessionManager, type SessionInstance } from './session';
import { createLogger, type Logger } from './utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AevatarClient {
  /** Base URL */
  readonly baseUrl: string;
  
  /** Connection status */
  readonly status: ConnectionStatus;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Connection
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Connect to Aevatar backend */
  connect(): Promise<void>;
  
  /** Disconnect from Aevatar backend */
  disconnect(): void;
  
  /** Subscribe to connection status changes */
  onConnectionChange(callback: (status: ConnectionStatus) => void): Unsubscribe;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Sessions
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Create a new session */
  createSession(options?: CreateSessionOptions): Promise<SessionInstance>;
  
  /** Get session by ID */
  getSession(sessionId: string): Promise<Session | null>;
  
  /** List all sessions */
  listSessions(): Promise<SessionSummary[]>;
  
  /** Delete a session */
  deleteSession(sessionId: string): Promise<void>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Runs
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Get run by ID */
  getRun(runId: string): Promise<Run | null>;
  
  /** List runs for a session */
  listRuns(sessionId: string): Promise<RunSummary[]>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Agents
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Get agent by ID */
  getAgent(agentId: string): Promise<AgentInfo | null>;
  
  /** List available agents */
  listAgents(): Promise<AgentSummary[]>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Graphs
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Get graph by ID */
  getGraph(graphId: string): Promise<GraphDefinition | null>;
  
  /** List available graphs */
  listGraphs(): Promise<GraphSummary[]>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Memory
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Get memory by ID */
  getMemory(memoryId: string): Promise<Memory | null>;
  
  /** Search memory */
  searchMemory(options: MemorySearchOptions): Promise<MemorySearchResult[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export function createAevatarClient(options: ClientOptions): AevatarClient {
  const { baseUrl, apiKey, timeout = 30000 } = options;
  
  const logger: Logger = createLogger(options.logger);
  const statusListeners = new Set<(status: ConnectionStatus) => void>();
  
  let currentStatus: ConnectionStatus = 'disconnected';
  let sessionManager: SessionManager | null = null;

  // ───────────────────────────────────────────────────────────────────────────
  // Internal Helpers
  // ───────────────────────────────────────────────────────────────────────────

  function setStatus(status: ConnectionStatus): void {
    if (currentStatus !== status) {
      currentStatus = status;
      statusListeners.forEach((cb) => cb(status));
      options.onConnectionChange?.(status);
    }
  }

  async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...(init?.headers as Record<string, string> ?? {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Public API
  // ───────────────────────────────────────────────────────────────────────────

  async function connect(): Promise<void> {
    setStatus('connecting');
    
    try {
      // Health check
      await fetchApi('/api/health');
      
      sessionManager = createSessionManager({ baseUrl, apiKey, logger });
      setStatus('connected');
      
      logger.info('Connected to Aevatar backend', { baseUrl });
    } catch (error) {
      setStatus('error');
      logger.error('Failed to connect', { error });
      throw error;
    }
  }

  function disconnect(): void {
    sessionManager = null;
    setStatus('disconnected');
    logger.info('Disconnected from Aevatar backend');
  }

  function onConnectionChange(callback: (status: ConnectionStatus) => void): Unsubscribe {
    statusListeners.add(callback);
    return () => statusListeners.delete(callback);
  }

  // Session methods
  async function createSession(opts?: CreateSessionOptions): Promise<SessionInstance> {
    if (!sessionManager) throw new Error('Not connected');
    return sessionManager.create(opts);
  }

  async function getSession(sessionId: string): Promise<Session | null> {
    return fetchApi<Session>(`/api/sessions/${sessionId}`).catch(() => null);
  }

  async function listSessions(): Promise<SessionSummary[]> {
    return fetchApi<SessionSummary[]>('/api/sessions');
  }

  async function deleteSession(sessionId: string): Promise<void> {
    await fetchApi(`/api/sessions/${sessionId}`, { method: 'DELETE' });
  }

  // Run methods
  async function getRun(runId: string): Promise<Run | null> {
    return fetchApi<Run>(`/api/runs/${runId}`).catch(() => null);
  }

  async function listRuns(sessionId: string): Promise<RunSummary[]> {
    return fetchApi<RunSummary[]>(`/api/sessions/${sessionId}/runs`);
  }

  // Agent methods
  async function getAgent(agentId: string): Promise<AgentInfo | null> {
    return fetchApi<AgentInfo>(`/api/agents/${agentId}`).catch(() => null);
  }

  async function listAgents(): Promise<AgentSummary[]> {
    return fetchApi<AgentSummary[]>('/api/agents');
  }

  // Graph methods
  async function getGraph(graphId: string): Promise<GraphDefinition | null> {
    return fetchApi<GraphDefinition>(`/api/graphs/${graphId}`).catch(() => null);
  }

  async function listGraphs(): Promise<GraphSummary[]> {
    return fetchApi<GraphSummary[]>('/api/graphs');
  }

  // Memory methods
  async function getMemory(memoryId: string): Promise<Memory | null> {
    return fetchApi<Memory>(`/api/memory/${memoryId}`).catch(() => null);
  }

  async function searchMemory(searchOptions: MemorySearchOptions): Promise<MemorySearchResult[]> {
    return fetchApi<MemorySearchResult[]>('/api/memory/search', {
      method: 'POST',
      body: JSON.stringify(searchOptions),
    });
  }

  return {
    get baseUrl() {
      return baseUrl;
    },
    get status() {
      return currentStatus;
    },
    connect,
    disconnect,
    onConnectionChange,
    createSession,
    getSession,
    listSessions,
    deleteSession,
    getRun,
    listRuns,
    getAgent,
    listAgents,
    getGraph,
    listGraphs,
    getMemory,
    searchMemory,
  };
}

