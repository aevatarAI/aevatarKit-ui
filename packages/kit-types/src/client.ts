/**
 * ============================================================================
 * Client Configuration Type Definitions
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Connection Status
// ─────────────────────────────────────────────────────────────────────────────

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

// ─────────────────────────────────────────────────────────────────────────────
// Client Options
// ─────────────────────────────────────────────────────────────────────────────

export interface ClientOptions {
  /** Base URL for Aevatar API */
  baseUrl: string;
  
  /** API key for authentication */
  apiKey?: string;
  
  /** Request timeout in milliseconds */
  timeout?: number;
  
  /** Retry options */
  retry?: RetryOptions;
  
  /** Connection callback */
  onConnectionChange?: (status: ConnectionStatus) => void;
  
  /** Error callback */
  onError?: (error: Error) => void;
  
  /** Logger configuration */
  logger?: LoggerOptions;
}

// ─────────────────────────────────────────────────────────────────────────────
// Retry Options
// ─────────────────────────────────────────────────────────────────────────────

export interface RetryOptions {
  /** Max number of retries */
  maxRetries?: number;
  
  /** Initial delay in milliseconds */
  initialDelayMs?: number;
  
  /** Max delay in milliseconds */
  maxDelayMs?: number;
  
  /** Backoff multiplier */
  backoffMultiplier?: number;
  
  /** Retry on specific status codes */
  retryOnStatus?: number[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Logger Options
// ─────────────────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface LoggerOptions {
  /** Log level */
  level?: LogLevel;
  
  /** Custom logger function */
  logger?: (level: LogLevel, message: string, data?: unknown) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Stream Options
// ─────────────────────────────────────────────────────────────────────────────

export interface EventStreamOptions {
  /** Auto-reconnect on disconnect */
  autoReconnect?: boolean;
  
  /** Reconnect delay in milliseconds */
  reconnectDelayMs?: number;
  
  /** Max reconnect attempts */
  maxReconnectAttempts?: number;
  
  /** Event buffer size */
  bufferSize?: number;
}

