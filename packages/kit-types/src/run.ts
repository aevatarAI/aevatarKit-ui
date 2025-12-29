/**
 * ============================================================================
 * Run Type Definitions
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Run Status
// ─────────────────────────────────────────────────────────────────────────────

export type RunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// ─────────────────────────────────────────────────────────────────────────────
// Run Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run summary (for listing)
 */
export interface RunSummary {
  id: string;
  sessionId: string;
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  error?: string;
}

/**
 * Full run data
 */
export interface Run extends RunSummary {
  /** User input that started the run */
  input?: string;
  
  /** Final result */
  result?: unknown;
  
  /** Steps executed */
  steps: StepInfo[];
  
  /** Run metrics */
  metrics: RunMetrics;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StepInfo {
  id: string;
  name?: string;
  type: string;
  status: StepStatus;
  startedAt?: string;
  finishedAt?: string;
  result?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Run Metrics
// ─────────────────────────────────────────────────────────────────────────────

export interface RunMetrics {
  /** Total duration in milliseconds */
  durationMs?: number;
  
  /** Total tokens used */
  totalTokens?: number;
  
  /** Input tokens */
  inputTokens?: number;
  
  /** Output tokens */
  outputTokens?: number;
  
  /** Number of LLM calls */
  llmCalls?: number;
  
  /** Number of tool calls */
  toolCalls?: number;
  
  /** Number of steps */
  stepCount?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Run Input
// ─────────────────────────────────────────────────────────────────────────────

export interface RunInput {
  /** User message */
  message?: string;
  
  /** Variables to pass */
  variables?: Record<string, unknown>;
  
  /** Attachments */
  attachments?: RunAttachment[];
}

export interface RunAttachment {
  type: 'file' | 'image' | 'url';
  name: string;
  url?: string;
  content?: string;
  mimeType?: string;
}

