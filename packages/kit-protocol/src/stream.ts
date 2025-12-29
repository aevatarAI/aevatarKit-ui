/**
 * ============================================================================
 * Event Stream
 * ============================================================================
 * High-level SSE event stream with parsing and routing
 * ============================================================================
 */

import type {
  AgUiEvent,
  AgUiEventType,
  CustomEvent,
  ConnectionStatus,
  Unsubscribe,
  EventHandler,
} from '@aevatar/kit-types';
import { createConnection, type Connection, type ConnectionOptions } from './connection';
import { parseAgUiEvent } from './parser';
import { createEventRouter, type EventRouter } from './router';
import type { AevatarCustomEventName } from './extensions';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StreamStatus = ConnectionStatus;

export interface EventStream {
  /** Current stream status */
  status: StreamStatus;
  
  /** Connect and start receiving events */
  connect(): void;
  
  /** Disconnect from stream */
  disconnect(): void;
  
  /** Force reconnect */
  reconnect(): void;
  
  // ─────────────────────────────────────────────────────────────────────────
  // AG-UI Event Subscriptions
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Subscribe to specific event type */
  on<T extends AgUiEventType>(type: T, handler: EventHandler<Extract<AgUiEvent, { type: T }>>): Unsubscribe;
  
  /** Subscribe to CUSTOM events by name */
  onCustom(name: string, handler: EventHandler<CustomEvent>): Unsubscribe;
  
  /** Subscribe to Aevatar extension events */
  onAevatar<T extends AevatarCustomEventName>(name: T, handler: EventHandler<CustomEvent>): Unsubscribe;
  
  /** Subscribe to all events */
  onAny(handler: EventHandler<AgUiEvent>): Unsubscribe;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Status Subscriptions
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Subscribe to status changes */
  onStatusChange(handler: (status: StreamStatus) => void): Unsubscribe;
  
  /** Subscribe to errors */
  onError(handler: (error: Error) => void): Unsubscribe;
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

export interface EventStreamOptions extends Omit<ConnectionOptions, 'onStatusChange' | 'onError'> {
  /** Called when stream status changes */
  onStatusChange?: (status: StreamStatus) => void;
  
  /** Called on stream error */
  onError?: (error: Error) => void;
}

export function createEventStream(options: EventStreamOptions): EventStream {
  const router: EventRouter = createEventRouter();
  
  let connection: Connection | null = null;
  let unsubscribeMessage: Unsubscribe | null = null;

  // ───────────────────────────────────────────────────────────────────────────
  // Message Handler
  // ───────────────────────────────────────────────────────────────────────────

  function handleMessage(data: string): void {
    const event = parseAgUiEvent(data);
    if (event) {
      router.route(event);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Public API
  // ───────────────────────────────────────────────────────────────────────────

  function connect(): void {
    if (connection) {
      disconnect();
    }

    connection = createConnection({
      ...options,
      onStatusChange: options.onStatusChange,
      onError: options.onError,
    });

    unsubscribeMessage = connection.onMessage(handleMessage);
    connection.connect();
  }

  function disconnect(): void {
    if (unsubscribeMessage) {
      unsubscribeMessage();
      unsubscribeMessage = null;
    }
    
    if (connection) {
      connection.disconnect();
      connection = null;
    }
    
    router.clear();
  }

  function reconnect(): void {
    connection?.reconnect();
  }

  function on<T extends AgUiEventType>(
    type: T,
    handler: EventHandler<Extract<AgUiEvent, { type: T }>>
  ): Unsubscribe {
    return router.on(type, handler);
  }

  function onCustom(name: string, handler: EventHandler<CustomEvent>): Unsubscribe {
    return router.onCustom(name, handler);
  }

  function onAevatar<T extends AevatarCustomEventName>(
    name: T,
    handler: EventHandler<CustomEvent>
  ): Unsubscribe {
    return router.onAevatar(name, handler);
  }

  function onAny(handler: EventHandler<AgUiEvent>): Unsubscribe {
    return router.onAny(handler);
  }

  function onStatusChange(handler: (status: StreamStatus) => void): Unsubscribe {
    return connection?.onStatusChange(handler) ?? (() => {});
  }

  function onError(handler: (error: Error) => void): Unsubscribe {
    return connection?.onError(handler) ?? (() => {});
  }

  return {
    get status() {
      return connection?.status ?? 'disconnected';
    },
    connect,
    disconnect,
    reconnect,
    on,
    onCustom,
    onAevatar,
    onAny,
    onStatusChange,
    onError,
  };
}

