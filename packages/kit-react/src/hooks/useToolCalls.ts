/**
 * ============================================================================
 * useToolCalls Hook
 * ============================================================================
 * Manages Tool Call state with streaming args support
 * 
 * Tool Call Flow:
 * 1. TOOL_CALL_START  → Create tool call entry
 * 2. TOOL_CALL_ARGS   → Append args delta (streaming)
 * 3. TOOL_CALL_END    → Mark args complete
 * 4. TOOL_CALL_RESULT → Set result
 * ============================================================================
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { AgUiEvent } from '@aevatar/kit-types';
import { useAevatar } from './useAevatar';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ToolCallStatus = 
  | 'pending'    // TOOL_CALL_START received, waiting for args
  | 'streaming'  // TOOL_CALL_ARGS being received
  | 'executing'  // TOOL_CALL_END received, waiting for result
  | 'completed'  // TOOL_CALL_RESULT received
  | 'error';     // Error occurred

export interface ToolCallState {
  /** Unique tool call ID */
  id: string;
  
  /** Tool name being called */
  name: string;
  
  /** Parent message ID if part of a message */
  parentMessageId?: string;
  
  /** Current status */
  status: ToolCallStatus;
  
  /** Accumulated arguments (JSON string) */
  args: string;
  
  /** Parsed arguments object */
  parsedArgs: Record<string, unknown> | null;
  
  /** Result (JSON string) */
  result: string | null;
  
  /** Parsed result object */
  parsedResult: unknown | null;
  
  /** Error message if failed */
  error: string | null;
  
  /** Timestamp when started */
  startedAt: number;
  
  /** Timestamp when completed */
  completedAt: number | null;
  
  /** Duration in ms */
  duration: number | null;
}

export interface UseToolCallsResult {
  /** All tool calls in current session */
  toolCalls: ToolCallState[];
  
  /** Currently active (streaming/executing) tool calls */
  activeToolCalls: ToolCallState[];
  
  /** Completed tool calls */
  completedToolCalls: ToolCallState[];
  
  /** Get specific tool call by ID */
  getToolCall: (id: string) => ToolCallState | undefined;
  
  /** Whether any tool is currently executing */
  isExecuting: boolean;
  
  /** Clear all tool calls */
  clear: () => void;
}

export interface UseToolCallsOptions {
  /** Max number of tool calls to keep in history */
  maxHistory?: number;
  
  /** Auto-parse JSON args/results */
  autoParse?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────

export function useToolCalls(options: UseToolCallsOptions = {}): UseToolCallsResult {
  const { maxHistory = 50, autoParse = true } = options;
  const { activeSession } = useAevatar();
  
  const [toolCalls, setToolCalls] = useState<ToolCallState[]>([]);
  
  // Use refs for streaming state to avoid stale closures
  const argsBufferRef = useRef<Map<string, string>>(new Map());

  // ─────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleToolCallStart = useCallback((event: AgUiEvent & { type: 'TOOL_CALL_START' }) => {
    const newToolCall: ToolCallState = {
      id: event.toolCallId,
      name: event.toolName,
      parentMessageId: event.parentMessageId,
      status: 'pending',
      args: '',
      parsedArgs: null,
      result: null,
      parsedResult: null,
      error: null,
      startedAt: event.timestamp ?? Date.now(),
      completedAt: null,
      duration: null,
    };

    // Initialize args buffer
    argsBufferRef.current.set(event.toolCallId, '');

    setToolCalls((prev) => {
      const updated = [newToolCall, ...prev];
      return updated.slice(0, maxHistory);
    });
  }, [maxHistory]);

  const handleToolCallArgs = useCallback((event: AgUiEvent & { type: 'TOOL_CALL_ARGS' }) => {
    // Append to buffer
    const currentArgs = argsBufferRef.current.get(event.toolCallId) ?? '';
    const newArgs = currentArgs + event.delta;
    argsBufferRef.current.set(event.toolCallId, newArgs);

    setToolCalls((prev) =>
      prev.map((tc) => {
        if (tc.id !== event.toolCallId) return tc;
        
        let parsedArgs: Record<string, unknown> | null = null;
        if (autoParse) {
          try {
            parsedArgs = JSON.parse(newArgs);
          } catch {
            // Not yet valid JSON, keep null
          }
        }

        return {
          ...tc,
          status: 'streaming',
          args: newArgs,
          parsedArgs,
        };
      })
    );
  }, [autoParse]);

  const handleToolCallEnd = useCallback((event: AgUiEvent & { type: 'TOOL_CALL_END' }) => {
    setToolCalls((prev) =>
      prev.map((tc) => {
        if (tc.id !== event.toolCallId) return tc;

        // Final parse attempt
        const finalArgs = argsBufferRef.current.get(event.toolCallId) ?? tc.args;
        let parsedArgs: Record<string, unknown> | null = tc.parsedArgs;
        
        if (autoParse && !parsedArgs) {
          try {
            parsedArgs = JSON.parse(finalArgs);
          } catch {
            // Invalid JSON
          }
        }

        return {
          ...tc,
          status: 'executing',
          args: finalArgs,
          parsedArgs,
        };
      })
    );

    // Clear buffer
    argsBufferRef.current.delete(event.toolCallId);
  }, [autoParse]);

  const handleToolCallResult = useCallback((event: AgUiEvent & { type: 'TOOL_CALL_RESULT' }) => {
    const completedAt = event.timestamp ?? Date.now();

    setToolCalls((prev) =>
      prev.map((tc) => {
        if (tc.id !== event.toolCallId) return tc;

        let parsedResult: unknown | null = null;
        if (autoParse) {
          try {
            parsedResult = JSON.parse(event.result);
          } catch {
            // Keep as string if not JSON
            parsedResult = event.result;
          }
        }

        return {
          ...tc,
          status: 'completed',
          result: event.result,
          parsedResult,
          completedAt,
          duration: completedAt - tc.startedAt,
        };
      })
    );
  }, [autoParse]);

  // ─────────────────────────────────────────────────────────────────────────
  // Subscribe to Session Events
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!activeSession) {
      setToolCalls([]);
      argsBufferRef.current.clear();
      return;
    }

    const unsubscribe = activeSession.onEvent((event) => {
      switch (event.type) {
        case 'TOOL_CALL_START':
          handleToolCallStart(event);
          break;
        case 'TOOL_CALL_ARGS':
          handleToolCallArgs(event);
          break;
        case 'TOOL_CALL_END':
          handleToolCallEnd(event);
          break;
        case 'TOOL_CALL_RESULT':
          handleToolCallResult(event);
          break;
      }
    });

    return unsubscribe;
  }, [activeSession, handleToolCallStart, handleToolCallArgs, handleToolCallEnd, handleToolCallResult]);

  // ─────────────────────────────────────────────────────────────────────────
  // Computed Values
  // ─────────────────────────────────────────────────────────────────────────

  const activeToolCalls = toolCalls.filter(
    (tc) => tc.status === 'pending' || tc.status === 'streaming' || tc.status === 'executing'
  );

  const completedToolCalls = toolCalls.filter(
    (tc) => tc.status === 'completed' || tc.status === 'error'
  );

  const isExecuting = activeToolCalls.length > 0;

  const getToolCall = useCallback(
    (id: string) => toolCalls.find((tc) => tc.id === id),
    [toolCalls]
  );

  const clear = useCallback(() => {
    setToolCalls([]);
    argsBufferRef.current.clear();
  }, []);

  return {
    toolCalls,
    activeToolCalls,
    completedToolCalls,
    getToolCall,
    isExecuting,
    clear,
  };
}


