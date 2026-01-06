/**
 * ============================================================================
 * AG-UI Event Parser Unit Tests
 * ============================================================================
 * Tests for parseAgUiEvent, parseCustomEvent, and parseAgUiEvents
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAgUiEvent, parseCustomEvent, parseAgUiEvents } from './parser';
import type { CustomEvent } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// parseAgUiEvent Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('parseAgUiEvent', () => {
  describe('valid events', () => {
    it('should parse RUN_STARTED event', () => {
      const data = JSON.stringify({
        type: 'RUN_STARTED',
        runId: 'run-123',
        threadId: 'thread-456',
      });

      const result = parseAgUiEvent(data);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('RUN_STARTED');
      expect((result as any).runId).toBe('run-123');
    });

    it('should parse TEXT_MESSAGE_CONTENT event', () => {
      const data = JSON.stringify({
        type: 'TEXT_MESSAGE_CONTENT',
        messageId: 'msg-001',
        delta: 'Hello, world!',
      });

      const result = parseAgUiEvent(data);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('TEXT_MESSAGE_CONTENT');
      expect((result as any).delta).toBe('Hello, world!');
    });

    it('should parse CUSTOM event', () => {
      const data = JSON.stringify({
        type: 'CUSTOM',
        name: 'aevatar.progress',
        value: { phase: 'reasoning', percent: 50 },
      });

      const result = parseAgUiEvent(data);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('CUSTOM');
      expect((result as CustomEvent).name).toBe('aevatar.progress');
      expect((result as CustomEvent).value).toEqual({ phase: 'reasoning', percent: 50 });
    });

    it('should parse STATE_DELTA event with JSON Patch operations', () => {
      const data = JSON.stringify({
        type: 'STATE_DELTA',
        delta: [
          { op: 'add', path: '/items/0', value: 'new item' },
          { op: 'replace', path: '/count', value: 5 },
        ],
      });

      const result = parseAgUiEvent(data);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('STATE_DELTA');
      expect((result as any).delta).toHaveLength(2);
    });

    it('should parse TOOL_CALL_RESULT event', () => {
      const data = JSON.stringify({
        type: 'TOOL_CALL_RESULT',
        toolCallId: 'tc-001',
        result: '{"success": true, "data": [1, 2, 3]}',
      });

      const result = parseAgUiEvent(data);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('TOOL_CALL_RESULT');
      expect((result as any).result).toBe('{"success": true, "data": [1, 2, 3]}');
    });
  });

  describe('timestamp handling', () => {
    it('should preserve existing timestamp', () => {
      const existingTimestamp = 1704067200000;
      const data = JSON.stringify({
        type: 'RUN_STARTED',
        runId: 'run-123',
        timestamp: existingTimestamp,
      });

      const result = parseAgUiEvent(data);

      expect(result?.timestamp).toBe(existingTimestamp);
    });

    it('should add timestamp if missing', () => {
      const beforeParse = Date.now();
      const data = JSON.stringify({
        type: 'RUN_STARTED',
        runId: 'run-123',
      });

      const result = parseAgUiEvent(data);
      const afterParse = Date.now();

      expect(result?.timestamp).toBeGreaterThanOrEqual(beforeParse);
      expect(result?.timestamp).toBeLessThanOrEqual(afterParse);
    });
  });

  describe('invalid inputs', () => {
    it('should return null for invalid JSON', () => {
      const result = parseAgUiEvent('{ invalid json }');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = parseAgUiEvent('');
      expect(result).toBeNull();
    });

    it('should return null for null input as string', () => {
      const result = parseAgUiEvent('null');
      expect(result).toBeNull();
    });

    it('should return null for object without type field', () => {
      const data = JSON.stringify({
        runId: 'run-123',
        threadId: 'thread-456',
      });

      const result = parseAgUiEvent(data);
      expect(result).toBeNull();
    });

    it('should return null for object with non-string type', () => {
      const data = JSON.stringify({
        type: 123,
        runId: 'run-123',
      });

      const result = parseAgUiEvent(data);
      expect(result).toBeNull();
    });

    it('should return null for array input', () => {
      const result = parseAgUiEvent('[]');
      expect(result).toBeNull();
    });

    it('should return null for primitive values', () => {
      expect(parseAgUiEvent('"string"')).toBeNull();
      expect(parseAgUiEvent('123')).toBeNull();
      expect(parseAgUiEvent('true')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle events with extra fields', () => {
      const data = JSON.stringify({
        type: 'RUN_STARTED',
        runId: 'run-123',
        extraField: 'should be preserved',
        nested: { deep: { value: true } },
      });

      const result = parseAgUiEvent(data);

      expect(result).not.toBeNull();
      expect((result as any).extraField).toBe('should be preserved');
      expect((result as any).nested).toEqual({ deep: { value: true } });
    });

    it('should handle unicode content', () => {
      const data = JSON.stringify({
        type: 'TEXT_MESSAGE_CONTENT',
        messageId: 'msg-001',
        delta: '你好世界 🌍 مرحبا',
      });

      const result = parseAgUiEvent(data);

      expect(result).not.toBeNull();
      expect((result as any).delta).toBe('你好世界 🌍 مرحبا');
    });

    it('should handle large payload', () => {
      const largeContent = 'x'.repeat(100000);
      const data = JSON.stringify({
        type: 'TEXT_MESSAGE_CONTENT',
        messageId: 'msg-001',
        delta: largeContent,
      });

      const result = parseAgUiEvent(data);

      expect(result).not.toBeNull();
      expect((result as any).delta).toBe(largeContent);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseCustomEvent Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('parseCustomEvent', () => {
  describe('Aevatar extension events', () => {
    it('should parse aevatar.progress event', () => {
      const event: CustomEvent = {
        type: 'CUSTOM',
        name: 'aevatar.progress',
        value: {
          phase: 'reasoning',
          stepId: 'step-1',
          stepType: 'llm',
          stepStatus: 'running',
          progressPercent: 50,
        },
      };

      const result = parseCustomEvent(event);

      expect(result).toEqual({
        phase: 'reasoning',
        stepId: 'step-1',
        stepType: 'llm',
        stepStatus: 'running',
        progressPercent: 50,
      });
    });

    it('should parse aevatar.graph event', () => {
      const event: CustomEvent = {
        type: 'CUSTOM',
        name: 'aevatar.graph',
        value: {
          iteration: 3,
          axioms: [{ id: 'a1', content: 'All men are mortal' }],
          theorems: [{ id: 't1', content: 'Socrates is mortal' }],
        },
      };

      const result = parseCustomEvent(event);

      expect(result).toEqual(event.value);
    });

    it('should parse aevatar.voting event', () => {
      const event: CustomEvent = {
        type: 'CUSTOM',
        name: 'aevatar.voting',
        value: {
          round: 2,
          candidates: [
            { id: 'c1', votes: 3 },
            { id: 'c2', votes: 2 },
          ],
          consensusReached: false,
        },
      };

      const result = parseCustomEvent(event);

      expect(result).toEqual(event.value);
    });

    it('should parse aevatar.task_decomposed event', () => {
      const event: CustomEvent = {
        type: 'CUSTOM',
        name: 'aevatar.task_decomposed',
        value: {
          parentTaskId: 'task-main',
          subTasks: ['task-1', 'task-2', 'task-3'],
          depth: 1,
        },
      };

      const result = parseCustomEvent(event);

      expect(result).toEqual(event.value);
    });

    it('should parse aevatar.worker_started event', () => {
      const event: CustomEvent = {
        type: 'CUSTOM',
        name: 'aevatar.worker_started',
        value: {
          workerId: 'worker-001',
          taskId: 'task-123',
        },
      };

      const result = parseCustomEvent(event);

      expect(result).toEqual(event.value);
    });

    it('should parse aevatar.worker_completed event', () => {
      const event: CustomEvent = {
        type: 'CUSTOM',
        name: 'aevatar.worker_completed',
        value: {
          workerId: 'worker-001',
          result: { success: true, output: 'done' },
        },
      };

      const result = parseCustomEvent(event);

      expect(result).toEqual(event.value);
    });

    it('should parse aevatar.consensus event', () => {
      const event: CustomEvent = {
        type: 'CUSTOM',
        name: 'aevatar.consensus',
        value: {
          round: 5,
          leader: 'agent-1',
          votes: { 'agent-1': 3, 'agent-2': 2 },
        },
      };

      const result = parseCustomEvent(event);

      expect(result).toEqual(event.value);
    });
  });

  describe('unknown custom events', () => {
    it('should return raw value for unknown event names', () => {
      const event: CustomEvent = {
        type: 'CUSTOM',
        name: 'my.custom.event',
        value: { foo: 'bar', count: 42 },
      };

      const result = parseCustomEvent(event);

      expect(result).toEqual({ foo: 'bar', count: 42 });
    });

    it('should handle custom events with primitive values', () => {
      const stringEvent: CustomEvent = {
        type: 'CUSTOM',
        name: 'custom.string',
        value: 'just a string',
      };

      const numberEvent: CustomEvent = {
        type: 'CUSTOM',
        name: 'custom.number',
        value: 42,
      };

      expect(parseCustomEvent(stringEvent)).toBe('just a string');
      expect(parseCustomEvent(numberEvent)).toBe(42);
    });

    it('should handle custom events with array values', () => {
      const event: CustomEvent = {
        type: 'CUSTOM',
        name: 'custom.array',
        value: [1, 2, 3, 'four', { five: 5 }],
      };

      const result = parseCustomEvent(event);

      expect(result).toEqual([1, 2, 3, 'four', { five: 5 }]);
    });

    it('should handle custom events with null value', () => {
      const event: CustomEvent = {
        type: 'CUSTOM',
        name: 'custom.null',
        value: null,
      };

      const result = parseCustomEvent(event);

      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle event with non-CUSTOM type gracefully', () => {
      // This tests the guard in parseCustomEvent
      const event = {
        type: 'RUN_STARTED',
        name: 'should.not.matter',
        value: { data: 'test' },
      } as unknown as CustomEvent;

      const result = parseCustomEvent(event);

      // Should return the value since type check fails
      expect(result).toEqual({ data: 'test' });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseAgUiEvents (Batch) Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('parseAgUiEvents', () => {
  it('should parse multiple valid events', () => {
    const dataList = [
      JSON.stringify({ type: 'RUN_STARTED', runId: 'run-1' }),
      JSON.stringify({ type: 'TEXT_MESSAGE_START', messageId: 'msg-1', role: 'assistant' }),
      JSON.stringify({ type: 'TEXT_MESSAGE_CONTENT', messageId: 'msg-1', delta: 'Hello' }),
    ];

    const results = parseAgUiEvents(dataList);

    expect(results).toHaveLength(3);
    expect(results[0].type).toBe('RUN_STARTED');
    expect(results[1].type).toBe('TEXT_MESSAGE_START');
    expect(results[2].type).toBe('TEXT_MESSAGE_CONTENT');
  });

  it('should filter out invalid events', () => {
    const dataList = [
      JSON.stringify({ type: 'RUN_STARTED', runId: 'run-1' }),
      '{ invalid json }',
      JSON.stringify({ noType: 'missing type field' }),
      JSON.stringify({ type: 'RUN_FINISHED', runId: 'run-1' }),
    ];

    const results = parseAgUiEvents(dataList);

    expect(results).toHaveLength(2);
    expect(results[0].type).toBe('RUN_STARTED');
    expect(results[1].type).toBe('RUN_FINISHED');
  });

  it('should handle empty array', () => {
    const results = parseAgUiEvents([]);
    expect(results).toEqual([]);
  });

  it('should handle array with all invalid events', () => {
    const dataList = [
      '{ invalid }',
      'not json',
      JSON.stringify({ noType: true }),
    ];

    const results = parseAgUiEvents(dataList);
    expect(results).toEqual([]);
  });

  it('should preserve order of valid events', () => {
    const dataList = [
      JSON.stringify({ type: 'STEP_STARTED', stepId: 'step-1' }),
      JSON.stringify({ type: 'STEP_STARTED', stepId: 'step-2' }),
      JSON.stringify({ type: 'STEP_STARTED', stepId: 'step-3' }),
    ];

    const results = parseAgUiEvents(dataList);

    expect(results).toHaveLength(3);
    expect((results[0] as any).stepId).toBe('step-1');
    expect((results[1] as any).stepId).toBe('step-2');
    expect((results[2] as any).stepId).toBe('step-3');
  });
});


