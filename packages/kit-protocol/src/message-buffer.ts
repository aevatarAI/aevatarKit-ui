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
  /** Worker/Agent ID (from position 2 in messageId) */
  workerId: string;
  /** Role or agent name (alias for workerId for clarity) */
  role: string;
  /** Agent name (normalized: 'assistant' -> 'research_assistant') */
  agentName: string;
  /** Step/Action name or Run ID */
  stepId: string;
  /** Run ID (alias for stepId when format is msg:session:agent:runId) */
  runId: string;
  /** Raw message ID */
  raw: string;
  /** Whether this is a user message */
  isUser: boolean;
  /** Whether this is an assistant/agent message */
  isAssistant: boolean;
}

/**
 * Parse AG-UI messageId to extract components
 * Common formats:
 * - msg:{sessionId}:{role}:{runId}
 * - msg:{sessionId}:{agentName}:{runId}
 * - msg:{sessionId}:worker-{n}:{stepName}
 *
 * @example
 * parseMessageId('msg:sess-123:assistant:run-456')
 * // => { sessionId: 'sess-123', workerId: 'assistant', agentName: 'research_assistant', ... }
 *
 * @example
 * parseMessageId('msg:sess-123:worker-1:reasoning')
 * // => { sessionId: 'sess-123', workerId: 'worker-1', agentName: 'worker-1', ... }
 */
export function parseMessageId(messageId: string): ParsedMessageId {
  const parts = String(messageId || '').split(':');

  if (parts.length < 4 || parts[0] !== 'msg') {
    return {
      sessionId: '',
      workerId: 'default',
      role: 'unknown',
      agentName: 'default',
      stepId: '',
      runId: '',
      raw: messageId,
      isUser: false,
      isAssistant: false,
    };
  }

  const sessionId = parts[1] || '';
  const workerId = parts[2] || 'default';
  const stepId = parts.slice(3).join(':'); // May contain ':'

  // Normalize agent name
  const agentName = workerId === 'assistant' ? 'research_assistant' : workerId;

  // Determine role flags
  const isUser = workerId === 'user';
  const isAssistant = workerId === 'assistant' || 
    (!isUser && !workerId.startsWith('worker') && !workerId.startsWith('tool'));

  return {
    sessionId,
    workerId,
    role: workerId,
    agentName,
    stepId,
    runId: stepId, // In most cases, the last part is runId
    raw: messageId,
    isUser,
    isAssistant,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool Aggregation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tool output state during tracking
 */
export interface ToolOutputState {
  toolCallId: string;
  toolName: string;
  messageId: string;
  status: 'pending' | 'running' | 'done';
  args?: string;
  result?: string;
  error?: string;
  startTime: number;
  endTime?: number;
}

/**
 * Tool buffer interface for tracking tool calls
 */
export interface ToolBuffer {
  /** Start tracking a tool call */
  start(messageId: string, toolCallId: string, toolName: string): void;

  /** Append args delta to a tool call */
  appendArgs(messageId: string, toolCallId: string, argsDelta: string): string;

  /** Set tool result */
  setResult(messageId: string, toolCallId: string, result: string): void;

  /** End tool call tracking */
  end(messageId: string, toolCallId: string): ToolOutputState | undefined;

  /** Get tool state */
  get(messageId: string, toolCallId: string): ToolOutputState | undefined;

  /** Get all tools for a message */
  getByMessage(messageId: string): Map<string, ToolOutputState>;

  /** Clear all buffers */
  clear(): void;
}

/**
 * Create a tool buffer for tracking tool calls
 */
export function createToolBuffer(): ToolBuffer {
  // Map<messageId, Map<toolCallId, ToolOutputState>>
  const buffers = new Map<string, Map<string, ToolOutputState>>();

  function getOrCreateMessageMap(messageId: string): Map<string, ToolOutputState> {
    let map = buffers.get(messageId);
    if (!map) {
      map = new Map();
      buffers.set(messageId, map);
    }
    return map;
  }

  return {
    start(messageId: string, toolCallId: string, toolName: string): void {
      const msgTools = getOrCreateMessageMap(messageId);
      msgTools.set(toolCallId, {
        toolCallId,
        toolName,
        messageId,
        status: 'running',
        args: '',
        startTime: Date.now(),
      });
    },

    appendArgs(messageId: string, toolCallId: string, argsDelta: string): string {
      const msgTools = buffers.get(messageId);
      const tool = msgTools?.get(toolCallId);
      if (tool) {
        tool.args = (tool.args || '') + argsDelta;
        return tool.args;
      }
      return argsDelta;
    },

    setResult(messageId: string, toolCallId: string, result: string): void {
      const msgTools = buffers.get(messageId);
      const tool = msgTools?.get(toolCallId);
      if (tool) {
        tool.result = result;
      }
    },

    end(messageId: string, toolCallId: string): ToolOutputState | undefined {
      const msgTools = buffers.get(messageId);
      const tool = msgTools?.get(toolCallId);
      if (tool) {
        tool.status = 'done';
        tool.endTime = Date.now();
        return tool;
      }
      return undefined;
    },

    get(messageId: string, toolCallId: string): ToolOutputState | undefined {
      return buffers.get(messageId)?.get(toolCallId);
    },

    getByMessage(messageId: string): Map<string, ToolOutputState> {
      return buffers.get(messageId) || new Map();
    },

    clear(): void {
      buffers.clear();
    },
  };
}

/**
 * Callbacks for tool aggregation
 */
export interface ToolAggregationCallbacks {
  /** Called when a tool call starts */
  onToolStart?: (messageId: string, toolCallId: string, toolName: string) => void;

  /** Called when tool args are received (streaming) */
  onToolArgs?: (messageId: string, toolCallId: string, accumulatedArgs: string, argsDelta: string) => void;

  /** Called when tool result is received */
  onToolResult?: (messageId: string, toolCallId: string, result: string) => void;

  /** Called when tool call ends */
  onToolEnd?: (messageId: string, toolCallId: string, finalState: ToolOutputState) => void;
}

/**
 * Tool aggregation binding result
 */
export interface ToolAggregation {
  /** The underlying tool buffer */
  buffer: ToolBuffer;

  /** Unsubscribe from all events */
  unsubscribe: Unsubscribe;
}

/**
 * Bind tool call aggregation to an EventRouter
 * Automatically handles TOOL_CALL_* events and provides high-level callbacks
 *
 * @example
 * const router = createEventRouter()
 * const { buffer, unsubscribe } = bindToolAggregation(router, {
 *   onToolStart: (msgId, toolId, name) => console.log('Tool started:', name),
 *   onToolResult: (msgId, toolId, result) => console.log('Result:', result),
 *   onToolEnd: (msgId, toolId, state) => saveToolOutput(state),
 * })
 */
export function bindToolAggregation(
  router: EventRouter,
  callbacks: ToolAggregationCallbacks = {}
): ToolAggregation {
  const buffer = createToolBuffer();
  const { onToolStart, onToolArgs, onToolResult, onToolEnd } = callbacks;

  const unsubscribes: Unsubscribe[] = [];

  // TOOL_CALL_START
  unsubscribes.push(
    router.on('TOOL_CALL_START', (event) => {
      const { messageId, toolCallId, toolName } = event;
      if (messageId && toolCallId && toolName) {
        buffer.start(messageId, toolCallId, toolName);
        onToolStart?.(messageId, toolCallId, toolName);
      }
    })
  );

  // TOOL_CALL_ARGS
  unsubscribes.push(
    router.on('TOOL_CALL_ARGS', (event) => {
      const { messageId, toolCallId } = event;
      // Support both 'argsDelta' (new) and 'delta' (legacy)
      const argsDelta = (event as { argsDelta?: string; delta?: string }).argsDelta ?? 
                        (event as { delta?: string }).delta ?? '';
      if (messageId && toolCallId) {
        const accumulated = buffer.appendArgs(messageId, toolCallId, argsDelta);
        onToolArgs?.(messageId, toolCallId, accumulated, argsDelta);
      }
    })
  );

  // TOOL_CALL_RESULT
  unsubscribes.push(
    router.on('TOOL_CALL_RESULT', (event) => {
      const { messageId, toolCallId, result } = event;
      if (messageId && toolCallId) {
        buffer.setResult(messageId, toolCallId, result ?? '');
        onToolResult?.(messageId, toolCallId, result ?? '');
      }
    })
  );

  // TOOL_CALL_END
  unsubscribes.push(
    router.on('TOOL_CALL_END', (event) => {
      const { messageId, toolCallId } = event;
      if (messageId && toolCallId) {
        const finalState = buffer.end(messageId, toolCallId);
        if (finalState) {
          onToolEnd?.(messageId, toolCallId, finalState);
        }
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
