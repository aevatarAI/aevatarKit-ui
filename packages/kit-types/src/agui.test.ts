/**
 * ============================================================================
 * AG-UI Type Guards Unit Tests
 * ============================================================================
 * Tests for all AG-UI event type guard functions
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import {
  isRunStartedEvent,
  isRunFinishedEvent,
  isRunErrorEvent,
  isStepStartedEvent,
  isStepFinishedEvent,
  isTextMessageStartEvent,
  isTextMessageContentEvent,
  isTextMessageEndEvent,
  isToolCallStartEvent,
  isToolCallResultEvent,
  isStateSnapshotEvent,
  isStateDeltaEvent,
  isMessagesSnapshotEvent,
  isCustomEvent,
  type AgUiEvent,
  type RunStartedEvent,
  type RunFinishedEvent,
  type RunErrorEvent,
  type TextMessageStartEvent,
  type TextMessageContentEvent,
  type CustomEvent,
  type StateSnapshotEvent,
  type StateDeltaEvent,
} from './agui';

// ─────────────────────────────────────────────────────────────────────────────
// Test Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const createRunStartedEvent = (): RunStartedEvent => ({
  type: 'RUN_STARTED',
  runId: 'run-123',
  threadId: 'thread-456',
  timestamp: Date.now(),
});

const createRunFinishedEvent = (): RunFinishedEvent => ({
  type: 'RUN_FINISHED',
  runId: 'run-123',
  threadId: 'thread-456',
  result: { success: true },
});

const createRunErrorEvent = (): RunErrorEvent => ({
  type: 'RUN_ERROR',
  runId: 'run-123',
  message: 'Something went wrong',
  code: 'ERR_001',
});

const createTextMessageStartEvent = (): TextMessageStartEvent => ({
  type: 'TEXT_MESSAGE_START',
  messageId: 'msg-001',
  role: 'assistant',
});

const createTextMessageContentEvent = (): TextMessageContentEvent => ({
  type: 'TEXT_MESSAGE_CONTENT',
  messageId: 'msg-001',
  delta: 'Hello, ',
});

const createCustomEvent = (): CustomEvent => ({
  type: 'CUSTOM',
  name: 'aevatar.progress',
  value: { phase: 'reasoning', percent: 50 },
});

const createStateSnapshotEvent = (): StateSnapshotEvent => ({
  type: 'STATE_SNAPSHOT',
  snapshot: { count: 1, items: [] },
});

const createStateDeltaEvent = (): StateDeltaEvent => ({
  type: 'STATE_DELTA',
  delta: [
    { op: 'replace', path: '/count', value: 2 },
    { op: 'add', path: '/items/0', value: 'item1' },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle Event Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Lifecycle Event Type Guards', () => {
  describe('isRunStartedEvent', () => {
    it('should return true for RUN_STARTED event', () => {
      const event = createRunStartedEvent();
      expect(isRunStartedEvent(event)).toBe(true);
    });

    it('should return false for other event types', () => {
      const event = createRunFinishedEvent();
      expect(isRunStartedEvent(event)).toBe(false);
    });

    it('should narrow type correctly', () => {
      const event: AgUiEvent = createRunStartedEvent();
      if (isRunStartedEvent(event)) {
        // TypeScript should recognize runId
        expect(event.runId).toBe('run-123');
        expect(event.threadId).toBe('thread-456');
      }
    });
  });

  describe('isRunFinishedEvent', () => {
    it('should return true for RUN_FINISHED event', () => {
      const event = createRunFinishedEvent();
      expect(isRunFinishedEvent(event)).toBe(true);
    });

    it('should return false for RUN_STARTED event', () => {
      const event = createRunStartedEvent();
      expect(isRunFinishedEvent(event)).toBe(false);
    });
  });

  describe('isRunErrorEvent', () => {
    it('should return true for RUN_ERROR event', () => {
      const event = createRunErrorEvent();
      expect(isRunErrorEvent(event)).toBe(true);
    });

    it('should return false for non-error events', () => {
      const event = createRunFinishedEvent();
      expect(isRunErrorEvent(event)).toBe(false);
    });

    it('should narrow type to access error fields', () => {
      const event: AgUiEvent = createRunErrorEvent();
      if (isRunErrorEvent(event)) {
        expect(event.message).toBe('Something went wrong');
        expect(event.code).toBe('ERR_001');
      }
    });
  });

  describe('isStepStartedEvent', () => {
    it('should return true for STEP_STARTED event', () => {
      const event: AgUiEvent = {
        type: 'STEP_STARTED',
        stepId: 'step-1',
        stepName: 'reasoning',
        stepType: 'llm',
      };
      expect(isStepStartedEvent(event)).toBe(true);
    });

    it('should return false for STEP_FINISHED event', () => {
      const event: AgUiEvent = {
        type: 'STEP_FINISHED',
        stepName: 'reasoning',
        stepId: 'step-1',
      };
      expect(isStepStartedEvent(event)).toBe(false);
    });
  });

  describe('isStepFinishedEvent', () => {
    it('should return true for STEP_FINISHED event', () => {
      const event: AgUiEvent = {
        type: 'STEP_FINISHED',
        stepName: 'reasoning',
        stepId: 'step-1',
        result: { output: 'done' },
      };
      expect(isStepFinishedEvent(event)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Text Message Event Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Text Message Event Type Guards', () => {
  describe('isTextMessageStartEvent', () => {
    it('should return true for TEXT_MESSAGE_START event', () => {
      const event = createTextMessageStartEvent();
      expect(isTextMessageStartEvent(event)).toBe(true);
    });

    it('should return false for TEXT_MESSAGE_CONTENT event', () => {
      const event = createTextMessageContentEvent();
      expect(isTextMessageStartEvent(event)).toBe(false);
    });

    it('should narrow type to access role', () => {
      const event: AgUiEvent = createTextMessageStartEvent();
      if (isTextMessageStartEvent(event)) {
        expect(event.role).toBe('assistant');
        expect(event.messageId).toBe('msg-001');
      }
    });
  });

  describe('isTextMessageContentEvent', () => {
    it('should return true for TEXT_MESSAGE_CONTENT event', () => {
      const event = createTextMessageContentEvent();
      expect(isTextMessageContentEvent(event)).toBe(true);
    });

    it('should narrow type to access delta', () => {
      const event: AgUiEvent = createTextMessageContentEvent();
      if (isTextMessageContentEvent(event)) {
        expect(event.delta).toBe('Hello, ');
      }
    });
  });

  describe('isTextMessageEndEvent', () => {
    it('should return true for TEXT_MESSAGE_END event', () => {
      const event: AgUiEvent = {
        type: 'TEXT_MESSAGE_END',
        messageId: 'msg-001',
      };
      expect(isTextMessageEndEvent(event)).toBe(true);
    });

    it('should return false for TEXT_MESSAGE_START event', () => {
      const event = createTextMessageStartEvent();
      expect(isTextMessageEndEvent(event)).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tool Call Event Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Tool Call Event Type Guards', () => {
  describe('isToolCallStartEvent', () => {
    it('should return true for TOOL_CALL_START event', () => {
      const event: AgUiEvent = {
        type: 'TOOL_CALL_START',
        messageId: 'msg-001',
        toolCallId: 'tc-001',
        toolName: 'search',
        parentMessageId: 'msg-001',
      };
      expect(isToolCallStartEvent(event)).toBe(true);
    });

    it('should return false for TOOL_CALL_RESULT event', () => {
      const event: AgUiEvent = {
        type: 'TOOL_CALL_RESULT',
        messageId: 'msg-001',
        toolCallId: 'tc-001',
        result: '{"data": []}',
      };
      expect(isToolCallStartEvent(event)).toBe(false);
    });
  });

  describe('isToolCallResultEvent', () => {
    it('should return true for TOOL_CALL_RESULT event', () => {
      const event: AgUiEvent = {
        type: 'TOOL_CALL_RESULT',
        messageId: 'msg-001',
        toolCallId: 'tc-001',
        result: '{"success": true}',
      };
      expect(isToolCallResultEvent(event)).toBe(true);
    });

    it('should narrow type to access result', () => {
      const event: AgUiEvent = {
        type: 'TOOL_CALL_RESULT',
        messageId: 'msg-001',
        toolCallId: 'tc-001',
        result: '{"success": true}',
      };
      if (isToolCallResultEvent(event)) {
        expect(event.result).toBe('{"success": true}');
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// State Management Event Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('State Management Event Type Guards', () => {
  describe('isStateSnapshotEvent', () => {
    it('should return true for STATE_SNAPSHOT event', () => {
      const event = createStateSnapshotEvent();
      expect(isStateSnapshotEvent(event)).toBe(true);
    });

    it('should return false for STATE_DELTA event', () => {
      const event = createStateDeltaEvent();
      expect(isStateSnapshotEvent(event)).toBe(false);
    });

    it('should narrow type to access snapshot', () => {
      const event: AgUiEvent = createStateSnapshotEvent();
      if (isStateSnapshotEvent(event)) {
        expect(event.snapshot).toEqual({ count: 1, items: [] });
      }
    });
  });

  describe('isStateDeltaEvent', () => {
    it('should return true for STATE_DELTA event', () => {
      const event = createStateDeltaEvent();
      expect(isStateDeltaEvent(event)).toBe(true);
    });

    it('should narrow type to access delta operations', () => {
      const event: AgUiEvent = createStateDeltaEvent();
      if (isStateDeltaEvent(event)) {
        expect(event.delta).toHaveLength(2);
        expect(event.delta[0].op).toBe('replace');
        expect(event.delta[0].path).toBe('/count');
      }
    });
  });

  describe('isMessagesSnapshotEvent', () => {
    it('should return true for MESSAGES_SNAPSHOT event', () => {
      const event: AgUiEvent = {
        type: 'MESSAGES_SNAPSHOT',
        messages: [
          { id: 'msg-1', role: 'user', content: 'Hello' },
          { id: 'msg-2', role: 'assistant', content: 'Hi there!' },
        ],
      };
      expect(isMessagesSnapshotEvent(event)).toBe(true);
    });

    it('should narrow type to access messages', () => {
      const event: AgUiEvent = {
        type: 'MESSAGES_SNAPSHOT',
        messages: [{ id: 'msg-1', role: 'user', content: 'Hello' }],
      };
      if (isMessagesSnapshotEvent(event)) {
        expect(event.messages).toHaveLength(1);
        expect(event.messages[0].content).toBe('Hello');
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Custom Event Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Custom Event Type Guards', () => {
  describe('isCustomEvent', () => {
    it('should return true for CUSTOM event', () => {
      const event = createCustomEvent();
      expect(isCustomEvent(event)).toBe(true);
    });

    it('should return false for standard events', () => {
      const event = createRunStartedEvent();
      expect(isCustomEvent(event)).toBe(false);
    });

    it('should narrow type to access name and value', () => {
      const event: AgUiEvent = createCustomEvent();
      if (isCustomEvent(event)) {
        expect(event.name).toBe('aevatar.progress');
        expect(event.value).toEqual({ phase: 'reasoning', percent: 50 });
      }
    });

    it('should handle various Aevatar custom events', () => {
      const progressEvent: CustomEvent = {
        type: 'CUSTOM',
        name: 'aevatar.progress',
        value: { phase: 'voting', percent: 75 },
      };
      const graphEvent: CustomEvent = {
        type: 'CUSTOM',
        name: 'aevatar.graph',
        value: { nodes: [], edges: [] },
      };

      expect(isCustomEvent(progressEvent)).toBe(true);
      expect(isCustomEvent(graphEvent)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge Cases
// ─────────────────────────────────────────────────────────────────────────────

describe('Edge Cases', () => {
  it('should handle events without optional fields', () => {
    const minimalRunStarted: RunStartedEvent = {
      type: 'RUN_STARTED',
      runId: 'run-minimal',
      threadId: 'thread-minimal',
    };
    expect(isRunStartedEvent(minimalRunStarted)).toBe(true);
  });

  it('should handle events with extra fields', () => {
    const eventWithExtra = {
      type: 'RUN_STARTED' as const,
      runId: 'run-123',
      threadId: 'thread-456',
      extraField: 'should be ignored',
      nested: { data: true },
    };
    expect(isRunStartedEvent(eventWithExtra)).toBe(true);
  });

  it('all type guards should return false for invalid types', () => {
    const invalidEvent = { type: 'INVALID_TYPE' } as unknown as AgUiEvent;
    
    expect(isRunStartedEvent(invalidEvent)).toBe(false);
    expect(isRunFinishedEvent(invalidEvent)).toBe(false);
    expect(isRunErrorEvent(invalidEvent)).toBe(false);
    expect(isStepStartedEvent(invalidEvent)).toBe(false);
    expect(isStepFinishedEvent(invalidEvent)).toBe(false);
    expect(isTextMessageStartEvent(invalidEvent)).toBe(false);
    expect(isTextMessageContentEvent(invalidEvent)).toBe(false);
    expect(isTextMessageEndEvent(invalidEvent)).toBe(false);
    expect(isToolCallStartEvent(invalidEvent)).toBe(false);
    expect(isToolCallResultEvent(invalidEvent)).toBe(false);
    expect(isStateSnapshotEvent(invalidEvent)).toBe(false);
    expect(isStateDeltaEvent(invalidEvent)).toBe(false);
    expect(isMessagesSnapshotEvent(invalidEvent)).toBe(false);
    expect(isCustomEvent(invalidEvent)).toBe(false);
  });
});


