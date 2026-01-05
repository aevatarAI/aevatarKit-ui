/**
 * ============================================================================
 * Aevatar Client
 * ============================================================================
 * Main entry point for AevatarKit SDK
 * 
 * Features:
 * - Adapter pattern for backend flexibility
 * - Connection management
 * - Session/Run/Agent/Graph/Memory APIs
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
import { type BackendAdapter, createDefaultAdapter } from './adapter';
import { createSessionManager, type SessionManager, type SessionInstance } from './session';
import { createLogger, type Logger } from './utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Extended Client Options
// ─────────────────────────────────────────────────────────────────────────────

export interface AevatarClientOptions extends ClientOptions {
  /** Custom backend adapter (optional, uses default if not provided) */
  adapter?: BackendAdapter;
}

// ─────────────────────────────────────────────────────────────────────────────
// Client Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface AevatarClient {
  /** Base URL */
  readonly baseUrl: string;
  
  /** Connection status */
  readonly status: ConnectionStatus;

  /** Backend adapter in use */
  readonly adapter: BackendAdapter;
  
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

export function createAevatarClient(options: AevatarClientOptions): AevatarClient {
  const { baseUrl, apiKey, timeout = 30000 } = options;
  
  const logger: Logger = createLogger(options.logger);
  const statusListeners = new Set<(status: ConnectionStatus) => void>();
  
  // Create adapter - use provided or default
  const adapter: BackendAdapter = options.adapter ?? createDefaultAdapter({
    baseUrl,
    apiKey,
    timeout,
  });

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

  // ───────────────────────────────────────────────────────────────────────────
  // Public API
  // ───────────────────────────────────────────────────────────────────────────

  async function connect(): Promise<void> {
    setStatus('connecting');
    
    try {
      // Health check via adapter
      await adapter.healthCheck();
      
      // Create session manager with adapter
      sessionManager = createSessionManager({ adapter, apiKey, logger });
      setStatus('connected');
      
      logger.info('Connected to Aevatar backend', { 
        baseUrl, 
        adapter: adapter.name,
      });
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

  // ─────────────────────────────────────────────────────────────────────────
  // Session Methods - Delegated to Adapter
  // ─────────────────────────────────────────────────────────────────────────

  async function createSession(opts?: CreateSessionOptions): Promise<SessionInstance> {
    if (!sessionManager) throw new Error('Not connected');
    return sessionManager.create(opts);
  }

  async function getSession(sessionId: string): Promise<Session | null> {
    return adapter.getSession(sessionId);
  }

  async function listSessions(): Promise<SessionSummary[]> {
    return adapter.listSessions();
  }

  async function deleteSession(sessionId: string): Promise<void> {
    return adapter.deleteSession(sessionId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Run Methods - Delegated to Adapter
  // ─────────────────────────────────────────────────────────────────────────

  async function getRun(runId: string): Promise<Run | null> {
    return adapter.getRun(runId);
  }

  async function listRuns(sessionId: string): Promise<RunSummary[]> {
    return adapter.listRuns(sessionId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Agent Methods - Delegated to Adapter (Optional)
  // ─────────────────────────────────────────────────────────────────────────

  async function getAgent(agentId: string): Promise<AgentInfo | null> {
    if (!adapter.getAgent) return null;
    return adapter.getAgent(agentId);
  }

  async function listAgents(): Promise<AgentSummary[]> {
    if (!adapter.listAgents) return [];
    return adapter.listAgents();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Graph Methods - Delegated to Adapter (Optional)
  // ─────────────────────────────────────────────────────────────────────────

  async function getGraph(graphId: string): Promise<GraphDefinition | null> {
    if (!adapter.getGraph) return null;
    return adapter.getGraph(graphId);
  }

  async function listGraphs(): Promise<GraphSummary[]> {
    if (!adapter.listGraphs) return [];
    return adapter.listGraphs();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Memory Methods - Delegated to Adapter (Optional)
  // ─────────────────────────────────────────────────────────────────────────

  async function getMemory(memoryId: string): Promise<Memory | null> {
    if (!adapter.getMemory) return null;
    return adapter.getMemory(memoryId);
  }

  async function searchMemory(searchOptions: MemorySearchOptions): Promise<MemorySearchResult[]> {
    if (!adapter.searchMemory) return [];
    return adapter.searchMemory(searchOptions);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Return Client Instance
  // ─────────────────────────────────────────────────────────────────────────

  return {
    get baseUrl() {
      return baseUrl;
    },
    get status() {
      return currentStatus;
    },
    get adapter() {
      return adapter;
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

