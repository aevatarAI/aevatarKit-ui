/**
 * ============================================================================
 * @aevatar/kit-protocol
 * ============================================================================
 * AG-UI Protocol implementation for AevatarKit SDK
 * 
 * This package provides:
 * - SSE connection management
 * - AG-UI event parsing and routing
 * - Aevatar extension events
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Connection
// ─────────────────────────────────────────────────────────────────────────────
export { createConnection, type Connection, type ConnectionOptions } from './connection';

// ─────────────────────────────────────────────────────────────────────────────
// Event Stream
// ─────────────────────────────────────────────────────────────────────────────
export { createEventStream, type EventStream, type StreamStatus } from './stream';

// ─────────────────────────────────────────────────────────────────────────────
// Parser
// ─────────────────────────────────────────────────────────────────────────────
export { parseAgUiEvent, parseCustomEvent } from './parser';

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────
export { createEventRouter, type EventRouter } from './router';

// ─────────────────────────────────────────────────────────────────────────────
// Aevatar Extensions
// ─────────────────────────────────────────────────────────────────────────────
export * from './extensions';

// ─────────────────────────────────────────────────────────────────────────────
// Re-export types
// ─────────────────────────────────────────────────────────────────────────────
export type {
  AgUiEvent,
  AgUiEventType,
  AgUiBaseEvent,
  AgUiMessage,
  CustomEvent,
} from '@aevatar/kit-types';

