/**
 * ============================================================================
 * @aevatar/kit-core
 * ============================================================================
 * Core client and business logic for AevatarKit SDK
 * 
 * This package provides:
 * - AevatarClient for connecting to Aevatar backend
 * - Session management
 * - Run execution
 * - State management
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Client
// ─────────────────────────────────────────────────────────────────────────────
export { createAevatarClient, type AevatarClient } from './client';

// ─────────────────────────────────────────────────────────────────────────────
// Session
// ─────────────────────────────────────────────────────────────────────────────
export { createSessionManager, type SessionManager, type SessionInstance } from './session';

// ─────────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────────
export { createRunManager, type RunManager, type RunInstance } from './run';

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────
export { createStateStore, type StateStore } from './state';

// ─────────────────────────────────────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────────────────────────────────────
export { createLogger, type Logger } from './utils/logger';
export { createRetryManager, type RetryManager } from './utils/retry';

// ─────────────────────────────────────────────────────────────────────────────
// Re-export from protocol
// ─────────────────────────────────────────────────────────────────────────────
export {
  createEventStream,
  createConnection,
  parseAgUiEvent,
  createEventRouter,
  type EventStream,
  type Connection,
  type EventRouter,
} from '@aevatar/kit-protocol';

// ─────────────────────────────────────────────────────────────────────────────
// Re-export types
// ─────────────────────────────────────────────────────────────────────────────
export type {
  ClientOptions,
  Session,
  SessionConfig,
  SessionState,
  Run,
  RunInput,
  ConnectionStatus,
  AgUiEvent,
  AgUiEventType,
} from '@aevatar/kit-types';

