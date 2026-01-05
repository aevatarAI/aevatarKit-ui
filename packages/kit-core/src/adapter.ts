/**
 * ============================================================================
 * Backend Adapter
 * ============================================================================
 * Adapter pattern for backend API abstraction
 * Enables SDK to work with different backend implementations
 * ============================================================================
 */

import type {
  Session,
  SessionSummary,
  CreateSessionOptions,
  Run,
  RunSummary,
  RunInput,
  AgentInfo,
  AgentSummary,
  GraphDefinition,
  GraphSummary,
  Memory,
  MemorySearchOptions,
  MemorySearchResult,
} from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Adapter Interface
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Backend adapter interface
 * Abstracts all backend API operations
 */
export interface BackendAdapter {
  /** Adapter name for debugging */
  readonly name: string;

  // ─────────────────────────────────────────────────────────────────────────
  // Health Check
  // ─────────────────────────────────────────────────────────────────────────

  /** Check backend health/connectivity */
  healthCheck(): Promise<void>;

  // ─────────────────────────────────────────────────────────────────────────
  // Sessions
  // ─────────────────────────────────────────────────────────────────────────

  /** Create a new session */
  createSession(options?: CreateSessionOptions): Promise<Session>;

  /** Get session by ID */
  getSession(sessionId: string): Promise<Session | null>;

  /** List all sessions */
  listSessions(): Promise<SessionSummary[]>;

  /** Delete a session */
  deleteSession(sessionId: string): Promise<void>;

  /** Get SSE event stream URL for session */
  getEventStreamUrl(sessionId: string): string;

  // ─────────────────────────────────────────────────────────────────────────
  // Runs
  // ─────────────────────────────────────────────────────────────────────────

  /** Start a new run for session */
  startRun(sessionId: string, input?: RunInput): Promise<Run>;

  /** Get run by ID */
  getRun(runId: string): Promise<Run | null>;

  /** List runs for session */
  listRuns(sessionId: string): Promise<RunSummary[]>;

  /** Stop a run */
  stopRun(runId: string): Promise<void>;

  // ─────────────────────────────────────────────────────────────────────────
  // Agents (Optional)
  // ─────────────────────────────────────────────────────────────────────────

  /** Get agent by ID */
  getAgent?(agentId: string): Promise<AgentInfo | null>;

  /** List available agents */
  listAgents?(): Promise<AgentSummary[]>;

  // ─────────────────────────────────────────────────────────────────────────
  // Graphs (Optional)
  // ─────────────────────────────────────────────────────────────────────────

  /** Get graph by ID */
  getGraph?(graphId: string): Promise<GraphDefinition | null>;

  /** List available graphs */
  listGraphs?(): Promise<GraphSummary[]>;

  // ─────────────────────────────────────────────────────────────────────────
  // Memory (Optional)
  // ─────────────────────────────────────────────────────────────────────────

  /** Get memory by ID */
  getMemory?(memoryId: string): Promise<Memory | null>;

  /** Search memory */
  searchMemory?(options: MemorySearchOptions): Promise<MemorySearchResult[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapter Options
// ─────────────────────────────────────────────────────────────────────────────

export interface AdapterOptions {
  /** Backend base URL */
  baseUrl: string;

  /** API key for authentication */
  apiKey?: string;

  /** Request timeout in ms */
  timeout?: number;

  /** Custom headers */
  headers?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch Helper
// ─────────────────────────────────────────────────────────────────────────────

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Create a fetch helper with common options
 */
export function createFetchHelper(options: AdapterOptions) {
  const { baseUrl, apiKey, timeout = 30000, headers: customHeaders = {} } = options;

  return async function fetchApi<T>(
    path: string,
    init?: FetchOptions
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...customHeaders,
      ...(init?.headers as Record<string, string> ?? {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      init?.timeout ?? timeout
    );

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) as T : {} as T;
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Adapter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default backend adapter
 * Standard AG-UI compatible backend
 */
export function createDefaultAdapter(options: AdapterOptions): BackendAdapter {
  const { baseUrl } = options;
  const fetchApi = createFetchHelper(options);

  return {
    name: 'default',

    // ─────────────────────────────────────────────────────────────────────────
    // Health Check
    // ─────────────────────────────────────────────────────────────────────────

    async healthCheck(): Promise<void> {
      await fetchApi('/api/health');
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Sessions
    // ─────────────────────────────────────────────────────────────────────────

    async createSession(opts?: CreateSessionOptions): Promise<Session> {
      return fetchApi<Session>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(opts ?? {}),
      });
    },

    async getSession(sessionId: string): Promise<Session | null> {
      return fetchApi<Session>(`/api/sessions/${sessionId}`).catch(() => null);
    },

    async listSessions(): Promise<SessionSummary[]> {
      return fetchApi<SessionSummary[]>('/api/sessions');
    },

    async deleteSession(sessionId: string): Promise<void> {
      await fetchApi(`/api/sessions/${sessionId}`, { method: 'DELETE' });
    },

    getEventStreamUrl(sessionId: string): string {
      return `${baseUrl}/api/sessions/${sessionId}/events`;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Runs
    // ─────────────────────────────────────────────────────────────────────────

    async startRun(sessionId: string, input?: RunInput): Promise<Run> {
      return fetchApi<Run>(`/api/sessions/${sessionId}/runs`, {
        method: 'POST',
        body: JSON.stringify(input ?? {}),
      });
    },

    async getRun(runId: string): Promise<Run | null> {
      return fetchApi<Run>(`/api/runs/${runId}`).catch(() => null);
    },

    async listRuns(sessionId: string): Promise<RunSummary[]> {
      return fetchApi<RunSummary[]>(`/api/sessions/${sessionId}/runs`);
    },

    async stopRun(runId: string): Promise<void> {
      await fetchApi(`/api/runs/${runId}/stop`, { method: 'POST' });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Agents
    // ─────────────────────────────────────────────────────────────────────────

    async getAgent(agentId: string): Promise<AgentInfo | null> {
      return fetchApi<AgentInfo>(`/api/agents/${agentId}`).catch(() => null);
    },

    async listAgents(): Promise<AgentSummary[]> {
      return fetchApi<AgentSummary[]>('/api/agents');
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Graphs
    // ─────────────────────────────────────────────────────────────────────────

    async getGraph(graphId: string): Promise<GraphDefinition | null> {
      return fetchApi<GraphDefinition>(`/api/graphs/${graphId}`).catch(() => null);
    },

    async listGraphs(): Promise<GraphSummary[]> {
      return fetchApi<GraphSummary[]>('/api/graphs');
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Memory
    // ─────────────────────────────────────────────────────────────────────────

    async getMemory(memoryId: string): Promise<Memory | null> {
      return fetchApi<Memory>(`/api/memory/${memoryId}`).catch(() => null);
    },

    async searchMemory(searchOptions: MemorySearchOptions): Promise<MemorySearchResult[]> {
      return fetchApi<MemorySearchResult[]>('/api/memory/search', {
        method: 'POST',
        body: JSON.stringify(searchOptions),
      });
    },
  };
}


