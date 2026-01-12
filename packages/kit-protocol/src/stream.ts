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
import {
  createConnection,
  type Connection,
  type ConnectionOptions,
  type ErrorContext,
  type ConnectionMetrics,
} from './connection';
import { parseAgUiEvent } from './parser';
import {
  createEventRouter,
  type EventRouter,
  type CustomEventMap,
  type EventRouterOptions,
} from './router';
import type { AevatarCustomEventName } from './extensions';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StreamStatus = ConnectionStatus;

export interface EventStream<T extends CustomEventMap = CustomEventMap> {
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
  on<K extends AgUiEventType>(
    type: K,
    handler: EventHandler<Extract<AgUiEvent, { type: K }>>
  ): Unsubscribe;
  
  /** Subscribe to CUSTOM events by name (type-safe if generic provided) */
  onCustom<K extends keyof T & string>(
    name: K,
    handler: EventHandler<CustomEvent & { value: T[K] }>
  ): Unsubscribe;

  /** Subscribe to CUSTOM events by name (untyped) */
  onCustom(name: string, handler: EventHandler<CustomEvent>): Unsubscribe;
  
  /** Subscribe to Aevatar extension events */
  onAevatar<K extends AevatarCustomEventName>(
    name: K,
    handler: EventHandler<CustomEvent>
  ): Unsubscribe;
  
  /** Subscribe to all events */
  onAny(handler: EventHandler<AgUiEvent>): Unsubscribe;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Status Subscriptions
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Subscribe to status changes */
  onStatusChange(handler: (status: StreamStatus) => void): Unsubscribe;
  
  /** Subscribe to errors with context */
  onError(handler: (error: Error, context: ErrorContext) => void): Unsubscribe;

  // ─────────────────────────────────────────────────────────────────────────
  // Metrics
  // ─────────────────────────────────────────────────────────────────────────

  /** Get connection metrics */
  getMetrics(): ConnectionMetrics;

  /** Get the underlying router (for advanced use) */
  getRouter(): EventRouter<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

export interface EventStreamOptions<T extends CustomEventMap = CustomEventMap>
  extends Omit<
    ConnectionOptions,
    'onStatusChange' | 'onError' | 'onReconnecting' | 'onReconnectFailed' | 'onReconnected'
  > {
  /** Called when stream status changes */
  onStatusChange?: (status: StreamStatus) => void;
  
  /** Called on stream error with context */
  onError?: (error: Error, context: ErrorContext) => void;

  /** Called when reconnection attempt starts */
  onReconnecting?: (attempt: number, maxAttempts: number, delayMs: number) => void;

  /** Called when all reconnection attempts have failed */
  onReconnectFailed?: (context: ErrorContext) => void;

  /** Called when successfully reconnected */
  onReconnected?: () => void;

  /** Initial router configuration for batch event registration */
  router?: EventRouterOptions<T>;
}

/**
 * Create an EventStream for AG-UI protocol
 *
 * @example Basic usage
 * const stream = createEventStream({ url: '/api/events' })
 * stream.on('RUN_STARTED', () => console.log('Started'))
 * stream.connect()
 *
 * @example With type-safe custom events
 * interface MyEvents {
 *   'app.update': { data: string }
 * }
 * const stream = createEventStream<MyEvents>({
 *   url: '/api/events',
 *   router: {
 *     custom: {
 *       'app.update': (e) => console.log(e.value.data) // typed!
 *     }
 *   }
 * })
 *
 * @example With rich error handling
 * const stream = createEventStream({
 *   url: '/api/events',
 *   onError: (error, context) => {
 *     console.log('Connection duration:', context.connectionDuration)
 *     console.log('Reconnect attempt:', context.reconnectAttempt)
 *   },
 *   onReconnecting: (attempt, max, delay) => {
 *     console.log(`Reconnecting ${attempt}/${max} in ${delay}ms`)
 *   },
 *   onReconnectFailed: (context) => {
 *     showError('Connection lost. Please refresh.')
 *   }
 * })
 */
export function createEventStream<T extends CustomEventMap = CustomEventMap>(
  options: EventStreamOptions<T>
): EventStream<T> {
  const router = createEventRouter<T>(options.router);
  
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
      onReconnecting: options.onReconnecting,
      onReconnectFailed: options.onReconnectFailed,
      onReconnected: options.onReconnected,
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

  function on<K extends AgUiEventType>(
    type: K,
    handler: EventHandler<Extract<AgUiEvent, { type: K }>>
  ): Unsubscribe {
    return router.on(type, handler);
  }

  function onCustom(
    name: string,
    handler: EventHandler<CustomEvent>
  ): Unsubscribe {
    return router.onCustom(name, handler);
  }

  function onAevatar<K extends AevatarCustomEventName>(
    name: K,
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

  function onError(
    handler: (error: Error, context: ErrorContext) => void
  ): Unsubscribe {
    return connection?.onError(handler) ?? (() => {});
  }

  function getMetrics(): ConnectionMetrics {
    return (
      connection?.getMetrics() ?? {
        status: 'disconnected',
        totalConnectAttempts: 0,
        successfulConnections: 0,
        currentReconnectAttempt: 0,
        lastConnectedAt: null,
        lastErrorAt: null,
        messagesReceived: 0,
      }
    );
  }

  function getRouter(): EventRouter<T> {
    return router;
  }

  return {
    get status() {
      return connection?.status ?? 'disconnected';
    },
    connect,
    disconnect,
    reconnect,
    on,
    onCustom: onCustom as EventStream<T>['onCustom'],
    onAevatar,
    onAny,
    onStatusChange,
    onError,
    getMetrics,
    getRouter,
  };
}
