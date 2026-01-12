/**
 * ============================================================================
 * Message Buffer
 * ============================================================================
 * Handles TEXT_MESSAGE_START/CONTENT/END event aggregation
 * Provides clean API for streaming message handling
 * ============================================================================
 */

import type { EventRouter } from './router';
import type { Unsubscribe } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MessageBuffer {
  /** Start tracking a new message */
  start(messageId: string): void;

  /** Append content to a message, returns accumulated content */
  append(messageId: string, delta: string): string;

  /** End message tracking, returns final content and removes from buffer */
  end(messageId: string): string;

  /** Get current accumulated content for a message */
  get(messageId: string): string | undefined;

  /** Check if a message is being tracked */
  has(messageId: string): boolean;

  /** Get all active message IDs */
  getActiveIds(): string[];

  /** Clear all buffers */
  clear(): void;
}

export interface MessageAggregationCallbacks {
  /** Called when a new message starts streaming */
  onMessageStart?: (messageId: string) => void;

  /** Called on each content chunk, receives accumulated content */
  onMessageChunk?: (messageId: string, accumulated: string, delta: string) => void;

  /** Called when message streaming completes */
  onMessageComplete?: (messageId: string, fullContent: string) => void;
}

export interface MessageAggregation {
  /** The underlying message buffer */
  buffer: MessageBuffer;

  /** Unsubscribe from all events */
  unsubscribe: Unsubscribe;
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Buffer Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a message buffer for handling streaming messages
 *
 * @example
 * const buffer = createMessageBuffer()
 *
 * router.on('TEXT_MESSAGE_START', (e) => buffer.start(e.messageId))
 * router.on('TEXT_MESSAGE_CONTENT', (e) => {
 *   const content = buffer.append(e.messageId, e.delta)
 *   console.log('Current content:', content)
 * })
 * router.on('TEXT_MESSAGE_END', (e) => {
 *   const final = buffer.end(e.messageId)
 *   console.log('Final message:', final)
 * })
 */
export function createMessageBuffer(): MessageBuffer {
  const buffers = new Map<string, string>();

  return {
    start(messageId: string): void {
      buffers.set(messageId, '');
    },

    append(messageId: string, delta: string): string {
      const current = buffers.get(messageId) ?? '';
      const updated = current + delta;
      buffers.set(messageId, updated);
      return updated;
    },

    end(messageId: string): string {
      const content = buffers.get(messageId) ?? '';
      buffers.delete(messageId);
      return content;
    },

    get(messageId: string): string | undefined {
      return buffers.get(messageId);
    },

    has(messageId: string): boolean {
      return buffers.has(messageId);
    },

    getActiveIds(): string[] {
      return Array.from(buffers.keys());
    },

    clear(): void {
      buffers.clear();
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Aggregation (Router Integration)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bind message aggregation to an EventRouter
 * Automatically handles TEXT_MESSAGE_* events and provides high-level callbacks
 *
 * @example
 * const router = createEventRouter()
 * const { buffer, unsubscribe } = bindMessageAggregation(router, {
 *   onMessageStart: (id) => console.log('Started:', id),
 *   onMessageChunk: (id, content) => updateUI(content),
 *   onMessageComplete: (id, content) => saveMessage(content),
 * })
 *
 * // Later: cleanup
 * unsubscribe()
 */
export function bindMessageAggregation(
  router: EventRouter,
  callbacks: MessageAggregationCallbacks = {}
): MessageAggregation {
  const buffer = createMessageBuffer();
  const { onMessageStart, onMessageChunk, onMessageComplete } = callbacks;

  const unsubscribes: Unsubscribe[] = [];

  // TEXT_MESSAGE_START
  unsubscribes.push(
    router.on('TEXT_MESSAGE_START', (event) => {
      const messageId = event.messageId;
      if (messageId) {
        buffer.start(messageId);
        onMessageStart?.(messageId);
      }
    })
  );

  // TEXT_MESSAGE_CONTENT
  unsubscribes.push(
    router.on('TEXT_MESSAGE_CONTENT', (event) => {
      const messageId = event.messageId;
      const delta = event.delta ?? '';
      if (messageId) {
        const accumulated = buffer.append(messageId, delta);
        onMessageChunk?.(messageId, accumulated, delta);
      }
    })
  );

  // TEXT_MESSAGE_END
  unsubscribes.push(
    router.on('TEXT_MESSAGE_END', (event) => {
      const messageId = event.messageId;
      if (messageId) {
        const fullContent = buffer.end(messageId);
        onMessageComplete?.(messageId, fullContent);
      }
    })
  );

  return {
    buffer,
    unsubscribe: () => {
      unsubscribes.forEach((unsub) => unsub());
      buffer.clear();
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Parse Message ID
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedMessageId {
  /** Session ID */
  sessionId: string;
  /** Worker/Agent ID */
  workerId: string;
  /** Step/Action name */
  stepId: string;
  /** Raw message ID */
  raw: string;
}

/**
 * Parse AG-UI messageId to extract components
 * Common format: msg:{sessionId}:{workerId}:{stepName}
 *
 * @example
 * parseMessageId('msg:sess-123:worker-1:reasoning')
 * // => { sessionId: 'sess-123', workerId: 'worker-1', stepId: 'reasoning', raw: '...' }
 */
export function parseMessageId(messageId: string): ParsedMessageId {
  const parts = String(messageId || '').split(':');

  if (parts.length < 4 || parts[0] !== 'msg') {
    return {
      sessionId: '',
      workerId: 'default',
      stepId: '',
      raw: messageId,
    };
  }

  return {
    sessionId: parts[1] || '',
    workerId: parts[2] || 'default',
    stepId: parts.slice(3).join(':'), // stepName may contain ':'
    raw: messageId,
  };
}

