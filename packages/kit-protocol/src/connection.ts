/**
 * ============================================================================
 * SSE Connection Management
 * ============================================================================
 * Lightweight SSE connection wrapper with auto-reconnect
 * ============================================================================
 */

import type { ConnectionStatus, Unsubscribe } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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
  
  /** Error callback */
  onError?: (error: Error) => void;
}

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
  
  /** Subscribe to errors */
  onError(callback: (error: Error) => void): Unsubscribe;
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
  } = options;

  let eventSource: EventSource | null = null;
  let status: ConnectionStatus = 'disconnected';
  let reconnectAttempts = 0;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  // Listener sets
  const messageListeners = new Set<(data: string) => void>();
  const statusListeners = new Set<(status: ConnectionStatus) => void>();
  const errorListeners = new Set<(error: Error) => void>();

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

  function emitError(error: Error) {
    errorListeners.forEach((cb) => cb(error));
    externalError?.(error);
  }

  function buildUrl(): string {
    // Append headers as query params (EventSource doesn't support custom headers)
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined);
    Object.entries(headers).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
    return urlObj.toString();
  }

  function scheduleReconnect() {
    if (!autoReconnect || reconnectAttempts >= maxReconnectAttempts) {
      setStatus('error');
      return;
    }

    setStatus('reconnecting');
    reconnectAttempts++;
    
    // Exponential backoff with jitter
    const delay = Math.min(
      reconnectDelayMs * Math.pow(2, reconnectAttempts - 1) + Math.random() * 1000,
      30000
    );

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

    try {
      eventSource = new EventSource(buildUrl());

      eventSource.onopen = () => {
        setStatus('connected');
        reconnectAttempts = 0;
      };

      eventSource.onmessage = (event) => {
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

  function onStatusChange(callback: (status: ConnectionStatus) => void): Unsubscribe {
    statusListeners.add(callback);
    return () => statusListeners.delete(callback);
  }

  function onError(callback: (error: Error) => void): Unsubscribe {
    errorListeners.add(callback);
    return () => errorListeners.delete(callback);
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
  };
}

