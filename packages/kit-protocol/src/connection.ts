/**
 * ============================================================================
 * SSE Connection Management
 * ============================================================================
 * Lightweight SSE connection wrapper with auto-reconnect
 * Provides rich callbacks for connection lifecycle events
 * ============================================================================
 */

import type { ConnectionStatus, Unsubscribe } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Context information provided with error callbacks
 */
export interface ErrorContext {
  /** Last successful event ID (if available) */
  lastEventId?: string;
  /** How long the connection was active before error (ms) */
  connectionDuration: number;
  /** Current reconnect attempt number */
  reconnectAttempt: number;
  /** Maximum reconnect attempts */
  maxReconnectAttempts: number;
  /** Connection URL */
  url: string;
}

/**
 * Connection options
 */
export interface ConnectionOptions {
  /** SSE endpoint URL */
  url: string;
  
  /** Auto-reconnect on disconnect */
  autoReconnect?: boolean;
  
  /** Reconnect delay in milliseconds */
  reconnectDelayMs?: number;
  
  /** Max reconnect attempts */
  maxReconnectAttempts?: number;
  
  /** Custom headers (via query params for EventSource) */
  headers?: Record<string, string>;
  
  /** Status change callback */
  onStatusChange?: (status: ConnectionStatus) => void;
  
  /** Error callback with context */
  onError?: (error: Error, context: ErrorContext) => void;

  /** Called when reconnection attempt starts */
  onReconnecting?: (attempt: number, maxAttempts: number, delayMs: number) => void;

  /** Called when all reconnection attempts have failed */
  onReconnectFailed?: (context: ErrorContext) => void;

  /** Called when successfully reconnected after a disconnect */
  onReconnected?: () => void;
}

/**
 * Connection instance
 */
export interface Connection {
  /** Current connection status */
  status: ConnectionStatus;
  
  /** Connect to SSE endpoint */
  connect(): void;
  
  /** Disconnect from SSE endpoint */
  disconnect(): void;
  
  /** Force reconnect */
  reconnect(): void;
  
  /** Subscribe to raw messages */
  onMessage(callback: (data: string) => void): Unsubscribe;
  
  /** Subscribe to status changes */
  onStatusChange(callback: (status: ConnectionStatus) => void): Unsubscribe;
  
  /** Subscribe to errors with context */
  onError(callback: (error: Error, context: ErrorContext) => void): Unsubscribe;

  /** Get current connection metrics */
  getMetrics(): ConnectionMetrics;
}

/**
 * Connection metrics for debugging/monitoring
 */
export interface ConnectionMetrics {
  /** Current status */
  status: ConnectionStatus;
  /** Total connection attempts */
  totalConnectAttempts: number;
  /** Successful connections */
  successfulConnections: number;
  /** Current reconnect attempt */
  currentReconnectAttempt: number;
  /** Time of last successful connection */
  lastConnectedAt: number | null;
  /** Time of last error */
  lastErrorAt: number | null;
  /** Total messages received */
  messagesReceived: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export function createConnection(options: ConnectionOptions): Connection {
  const {
    url,
    autoReconnect = true,
    reconnectDelayMs = 1000,
    maxReconnectAttempts = 10,
    headers = {},
    onStatusChange: externalStatusChange,
    onError: externalError,
    onReconnecting: externalReconnecting,
    onReconnectFailed: externalReconnectFailed,
    onReconnected: externalReconnected,
  } = options;

  let eventSource: EventSource | null = null;
  let status: ConnectionStatus = 'disconnected';
  let reconnectAttempts = 0;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  // Metrics tracking
  let totalConnectAttempts = 0;
  let successfulConnections = 0;
  let lastConnectedAt: number | null = null;
  let lastErrorAt: number | null = null;
  let messagesReceived = 0;
  let connectionStartTime: number | null = null;
  let lastEventId: string | undefined;
  let wasConnected = false; // Track if we were connected before for onReconnected

  // Listener sets
  const messageListeners = new Set<(data: string) => void>();
  const statusListeners = new Set<(status: ConnectionStatus) => void>();
  const errorListeners = new Set<(error: Error, context: ErrorContext) => void>();

  // ───────────────────────────────────────────────────────────────────────────
  // Internal helpers
  // ───────────────────────────────────────────────────────────────────────────

  function setStatus(newStatus: ConnectionStatus) {
    if (status !== newStatus) {
      status = newStatus;
      statusListeners.forEach((cb) => cb(status));
      externalStatusChange?.(status);
    }
  }

  function createErrorContext(): ErrorContext {
    return {
      lastEventId,
      connectionDuration: connectionStartTime
        ? Date.now() - connectionStartTime
        : 0,
      reconnectAttempt: reconnectAttempts,
      maxReconnectAttempts,
      url,
    };
  }

  function emitError(error: Error) {
    lastErrorAt = Date.now();
    const context = createErrorContext();
    errorListeners.forEach((cb) => cb(error, context));
    externalError?.(error, context);
  }

  function buildUrl(): string {
    // Append headers as query params (EventSource doesn't support custom headers)
    const urlObj = new URL(
      url,
      typeof window !== 'undefined' ? window.location.origin : undefined
    );
    Object.entries(headers).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
    return urlObj.toString();
  }

  function scheduleReconnect() {
    if (!autoReconnect || reconnectAttempts >= maxReconnectAttempts) {
      setStatus('error');
      externalReconnectFailed?.(createErrorContext());
      return;
    }

    setStatus('reconnecting');
    reconnectAttempts++;
    
    // Exponential backoff with jitter
    const delay = Math.min(
      reconnectDelayMs * Math.pow(2, reconnectAttempts - 1) + Math.random() * 1000,
      30000
    );

    // Notify about reconnection attempt
    externalReconnecting?.(reconnectAttempts, maxReconnectAttempts, delay);

    reconnectTimeout = setTimeout(() => {
      connect();
    }, delay);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Public API
  // ───────────────────────────────────────────────────────────────────────────

  function connect() {
    if (eventSource) {
      eventSource.close();
    }

    setStatus('connecting');
    totalConnectAttempts++;
    connectionStartTime = Date.now();

    try {
      eventSource = new EventSource(buildUrl());

      eventSource.onopen = () => {
        const wasReconnect = wasConnected && reconnectAttempts > 0;
        setStatus('connected');
        lastConnectedAt = Date.now();
        successfulConnections++;
        wasConnected = true;
        reconnectAttempts = 0;

        // Notify if this was a successful reconnection
        if (wasReconnect) {
          externalReconnected?.();
        }
      };

      eventSource.onmessage = (event) => {
        messagesReceived++;
        lastEventId = event.lastEventId || lastEventId;
        messageListeners.forEach((cb) => cb(event.data));
      };

      eventSource.onerror = () => {
        eventSource?.close();
        eventSource = null;
        
        if (status === 'connected' || status === 'connecting') {
          emitError(new Error('SSE connection error'));
          scheduleReconnect();
        }
      };
    } catch (error) {
      emitError(error instanceof Error ? error : new Error(String(error)));
      scheduleReconnect();
    }
  }

  function disconnect() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    
    reconnectAttempts = 0;
    connectionStartTime = null;
    setStatus('disconnected');
  }

  function reconnect() {
    disconnect();
    connect();
  }

  function onMessage(callback: (data: string) => void): Unsubscribe {
    messageListeners.add(callback);
    return () => messageListeners.delete(callback);
  }

  function onStatusChange(
    callback: (status: ConnectionStatus) => void
  ): Unsubscribe {
    statusListeners.add(callback);
    return () => statusListeners.delete(callback);
  }

  function onError(
    callback: (error: Error, context: ErrorContext) => void
  ): Unsubscribe {
    errorListeners.add(callback);
    return () => errorListeners.delete(callback);
  }

  function getMetrics(): ConnectionMetrics {
    return {
      status,
      totalConnectAttempts,
      successfulConnections,
      currentReconnectAttempt: reconnectAttempts,
      lastConnectedAt,
      lastErrorAt,
      messagesReceived,
    };
  }

  return {
    get status() {
      return status;
    },
    connect,
    disconnect,
    reconnect,
    onMessage,
    onStatusChange,
    onError,
    getMetrics,
  };
}
