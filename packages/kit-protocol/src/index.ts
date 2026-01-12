/**
 * ============================================================================
 * @aevatar/kit-protocol
 * ============================================================================
 * AG-UI Protocol implementation for AevatarKit SDK
 * 
 * This package provides:
 * - SSE connection management with rich callbacks
 * - AG-UI event parsing and routing
 * - Batch event registration with type-safe custom events
 * - JSON Patch (RFC 6902) for STATE_DELTA handling
 * - Message buffer for TEXT_MESSAGE_* aggregation
 * - Aevatar extension events
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Connection
// ─────────────────────────────────────────────────────────────────────────────
export {
  createConnection,
  type Connection,
  type ConnectionOptions,
  type ErrorContext,
  type ConnectionMetrics,
} from './connection';

// ─────────────────────────────────────────────────────────────────────────────
// Event Stream
// ─────────────────────────────────────────────────────────────────────────────
export {
  createEventStream,
  type EventStream,
  type EventStreamOptions,
  type StreamStatus,
} from './stream';

// ─────────────────────────────────────────────────────────────────────────────
// Parser
// ─────────────────────────────────────────────────────────────────────────────
export { parseAgUiEvent, parseCustomEvent } from './parser';

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────
export {
  createEventRouter,
  type EventRouter,
  type EventRouterOptions,
  type StandardEventHandlers,
  type CustomEventHandlers,
  type CustomEventMap,
  type TypedCustomEvent,
} from './router';

// ─────────────────────────────────────────────────────────────────────────────
// JSON Patch (RFC 6902)
// ─────────────────────────────────────────────────────────────────────────────
export {
  applyJsonPatch,
  applyJsonPatchMutable,
  validateJsonPatch,
  type JsonPatchOperation,
  type JsonPatchOp,
} from './json-patch';

// ─────────────────────────────────────────────────────────────────────────────
// Message Buffer
// ─────────────────────────────────────────────────────────────────────────────
export {
  createMessageBuffer,
  bindMessageAggregation,
  parseMessageId,
  type MessageBuffer,
  type MessageAggregation,
  type MessageAggregationCallbacks,
  type ParsedMessageId,
} from './message-buffer';

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
