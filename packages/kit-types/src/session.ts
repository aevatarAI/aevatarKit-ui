/**
 * ============================================================================
 * Session Type Definitions
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Session Status
// ─────────────────────────────────────────────────────────────────────────────

export type SessionStatus = 'idle' | 'running' | 'completed' | 'failed' | 'closed';

// ─────────────────────────────────────────────────────────────────────────────
// Session Configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionConfig {
  /** Graph to execute */
  graphId?: string;
  
  /** Agent to interact with */
  agentId?: string;
  
  /** Custom system prompt */
  systemPrompt?: string;
  
  /** Initial variables */
  variables?: Record<string, unknown>;
  
  /** Memory configuration */
  memory?: SessionMemoryConfig;
  
  /** Timeout in milliseconds */
  timeout?: number;
}

export interface SessionMemoryConfig {
  /** Enable memory persistence */
  enabled?: boolean;
  
  /** Memory scope */
  scope?: 'private' | 'session' | 'run' | 'graph' | 'tenant';
  
  /** Existing memory ID to attach */
  memoryId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session State
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionState {
  /** Current status */
  status: SessionStatus;
  
  /** Current run ID if running */
  currentRunId?: string;
  
  /** Custom state from STATE_SNAPSHOT/STATE_DELTA */
  customState: Record<string, unknown>;
  
  /** Last error message */
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Session summary (for listing)
 */
export interface SessionSummary {
  id: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt?: string;
  graphId?: string;
  agentId?: string;
  runCount: number;
}

/**
 * Full session data
 */
export interface Session extends SessionSummary {
  config: SessionConfig;
  state: SessionState;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Creation Options
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateSessionOptions {
  /** Optional custom session ID */
  id?: string;
  
  /** Session configuration */
  config?: SessionConfig;
  
  /** Auto-start first run */
  autoStart?: boolean;
  
  /** Initial user message for auto-start */
  initialMessage?: string;
}

