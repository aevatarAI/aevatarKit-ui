/**
 * ============================================================================
 * Message Buffer Tests
 * ============================================================================
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createMessageBuffer,
  bindMessageAggregation,
  parseMessageId,
} from './message-buffer';
import { createEventRouter } from './router';

describe('createMessageBuffer', () => {
  it('should start and end message tracking', () => {
    const buffer = createMessageBuffer();

    buffer.start('msg-1');
    expect(buffer.has('msg-1')).toBe(true);
    expect(buffer.get('msg-1')).toBe('');

    const content = buffer.end('msg-1');
    expect(content).toBe('');
    expect(buffer.has('msg-1')).toBe(false);
  });

  it('should accumulate content', () => {
    const buffer = createMessageBuffer();

    buffer.start('msg-1');
    let result = buffer.append('msg-1', 'Hello');
    expect(result).toBe('Hello');

    result = buffer.append('msg-1', ' World');
    expect(result).toBe('Hello World');

    expect(buffer.get('msg-1')).toBe('Hello World');

    const final = buffer.end('msg-1');
    expect(final).toBe('Hello World');
  });

  it('should handle multiple concurrent messages', () => {
    const buffer = createMessageBuffer();

    buffer.start('msg-1');
    buffer.start('msg-2');

    buffer.append('msg-1', 'A');
    buffer.append('msg-2', 'X');
    buffer.append('msg-1', 'B');
    buffer.append('msg-2', 'Y');

    expect(buffer.get('msg-1')).toBe('AB');
    expect(buffer.get('msg-2')).toBe('XY');

    expect(buffer.getActiveIds()).toContain('msg-1');
    expect(buffer.getActiveIds()).toContain('msg-2');
  });

  it('should clear all buffers', () => {
    const buffer = createMessageBuffer();

    buffer.start('msg-1');
    buffer.start('msg-2');
    buffer.append('msg-1', 'test');

    buffer.clear();

    expect(buffer.has('msg-1')).toBe(false);
    expect(buffer.has('msg-2')).toBe(false);
    expect(buffer.getActiveIds()).toHaveLength(0);
  });

  it('should handle append without start', () => {
    const buffer = createMessageBuffer();

    // Should not throw, just accumulate
    const result = buffer.append('msg-1', 'test');
    expect(result).toBe('test');
  });
});

describe('bindMessageAggregation', () => {
  it('should call onMessageStart when TEXT_MESSAGE_START fires', () => {
    const router = createEventRouter();
    const onMessageStart = vi.fn();

    bindMessageAggregation(router, { onMessageStart });

    router.route({
      type: 'TEXT_MESSAGE_START',
      messageId: 'msg-1',
      timestamp: Date.now(),
    });

    expect(onMessageStart).toHaveBeenCalledWith('msg-1');
  });

  it('should call onMessageChunk with accumulated content', () => {
    const router = createEventRouter();
    const onMessageChunk = vi.fn();

    bindMessageAggregation(router, { onMessageChunk });

    router.route({
      type: 'TEXT_MESSAGE_START',
      messageId: 'msg-1',
      timestamp: Date.now(),
    });

    router.route({
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'msg-1',
      delta: 'Hello',
      timestamp: Date.now(),
    });

    expect(onMessageChunk).toHaveBeenCalledWith('msg-1', 'Hello', 'Hello');

    router.route({
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'msg-1',
      delta: ' World',
      timestamp: Date.now(),
    });

    expect(onMessageChunk).toHaveBeenCalledWith('msg-1', 'Hello World', ' World');
  });

  it('should call onMessageComplete with full content', () => {
    const router = createEventRouter();
    const onMessageComplete = vi.fn();

    bindMessageAggregation(router, { onMessageComplete });

    router.route({
      type: 'TEXT_MESSAGE_START',
      messageId: 'msg-1',
      timestamp: Date.now(),
    });

    router.route({
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'msg-1',
      delta: 'Full message',
      timestamp: Date.now(),
    });

    router.route({
      type: 'TEXT_MESSAGE_END',
      messageId: 'msg-1',
      timestamp: Date.now(),
    });

    expect(onMessageComplete).toHaveBeenCalledWith('msg-1', 'Full message');
  });

  it('should unsubscribe and clear buffer', () => {
    const router = createEventRouter();
    const onMessageStart = vi.fn();
    const onMessageComplete = vi.fn();

    const { buffer, unsubscribe } = bindMessageAggregation(router, {
      onMessageStart,
      onMessageComplete,
    });

    // Start a message
    router.route({
      type: 'TEXT_MESSAGE_START',
      messageId: 'msg-1',
      timestamp: Date.now(),
    });

    expect(buffer.has('msg-1')).toBe(true);
    expect(onMessageStart).toHaveBeenCalled();

    // Unsubscribe
    unsubscribe();

    // Buffer should be cleared
    expect(buffer.has('msg-1')).toBe(false);

    // Events should no longer be handled
    router.route({
      type: 'TEXT_MESSAGE_START',
      messageId: 'msg-2',
      timestamp: Date.now(),
    });

    expect(onMessageStart).toHaveBeenCalledTimes(1); // Not called again
  });
});

describe('parseMessageId', () => {
  it('should parse standard message ID format', () => {
    const result = parseMessageId('msg:session-123:worker-1:reasoning-step');

    expect(result.sessionId).toBe('session-123');
    expect(result.workerId).toBe('worker-1');
    expect(result.stepId).toBe('reasoning-step');
    expect(result.raw).toBe('msg:session-123:worker-1:reasoning-step');
  });

  it('should handle stepId with colons', () => {
    const result = parseMessageId('msg:sess:worker:step:with:colons');

    expect(result.sessionId).toBe('sess');
    expect(result.workerId).toBe('worker');
    expect(result.stepId).toBe('step:with:colons');
  });

  it('should handle invalid format gracefully', () => {
    const result = parseMessageId('invalid-format');

    expect(result.sessionId).toBe('');
    expect(result.workerId).toBe('default');
    expect(result.stepId).toBe('');
    expect(result.raw).toBe('invalid-format');
  });

  it('should handle empty string', () => {
    const result = parseMessageId('');

    expect(result.sessionId).toBe('');
    expect(result.workerId).toBe('default');
    expect(result.stepId).toBe('');
  });
});

