/**
 * ============================================================================
 * Utility Type Definitions
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Generic Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Unsubscribe function returned by event listeners
 */
export type Unsubscribe = () => void;

/**
 * Async result wrapper
 */
export type AsyncResult<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Handler Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generic event handler
 */
export type EventHandler<T> = (event: T) => void | Promise<void>;

/**
 * Event handler with context
 */
export type ContextualEventHandler<T, C> = (event: T, context: C) => void | Promise<void>;

// ─────────────────────────────────────────────────────────────────────────────
// Deep Partial
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deep partial type
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// ─────────────────────────────────────────────────────────────────────────────
// Extract Event Type
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract specific event type from union
 */
export type ExtractEvent<T, K> = T extends { type: K } ? T : never;

