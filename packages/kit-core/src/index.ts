/**
 * ============================================================================
 * @aevatar/kit-core
 * ============================================================================
 * Core client and business logic for AevatarKit SDK
 * 
 * This package provides:
 * - AevatarClient for connecting to Aevatar backend
 * - Backend adapter pattern for flexibility
 * - Session management
 * - Run execution
 * - State management
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Client
// ─────────────────────────────────────────────────────────────────────────────
export { createAevatarClient, type AevatarClient, type AevatarClientOptions } from './client';

// ─────────────────────────────────────────────────────────────────────────────
// Backend Adapter
// ─────────────────────────────────────────────────────────────────────────────
export {
  type BackendAdapter,
  type AdapterOptions,
  createDefaultAdapter,
  createFetchHelper,
} from './adapter';

// ─────────────────────────────────────────────────────────────────────────────
// Custom Adapters
// ─────────────────────────────────────────────────────────────────────────────
// Business-specific adapters should be published as separate packages:
// - @aevatar/kit-axiom (AxiomReasoning adapter)
// - @aevatar/kit-paper-review (PaperReview adapter)
// Users can create custom adapters by implementing BackendAdapter interface.

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

