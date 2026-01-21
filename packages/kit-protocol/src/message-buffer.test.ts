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
  createToolBuffer,
  bindToolAggregation,
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
      role: 'assistant',
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
      role: 'assistant',
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
      role: 'assistant',
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
      role: 'assistant',
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
      role: 'assistant',
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

  it('should parse agent name and normalize assistant', () => {
    const result = parseMessageId('msg:session-123:assistant:run-456');

    expect(result.role).toBe('assistant');
    expect(result.agentName).toBe('research_assistant');
    expect(result.runId).toBe('run-456');
    expect(result.isAssistant).toBe(true);
    expect(result.isUser).toBe(false);
  });

  it('should identify user messages', () => {
    const result = parseMessageId('msg:session-123:user:run-456');

    expect(result.role).toBe('user');
    expect(result.agentName).toBe('user');
    expect(result.isUser).toBe(true);
    expect(result.isAssistant).toBe(false);
  });

  it('should handle custom agent names', () => {
    const result = parseMessageId('msg:session-123:research_coordinator:run-456');

    expect(result.role).toBe('research_coordinator');
    expect(result.agentName).toBe('research_coordinator');
    expect(result.isAssistant).toBe(true);
    expect(result.isUser).toBe(false);
  });

  it('should handle worker IDs correctly', () => {
    const result = parseMessageId('msg:session-123:worker-1:step-1');

    expect(result.workerId).toBe('worker-1');
    expect(result.agentName).toBe('worker-1');
    expect(result.isAssistant).toBe(false);
    expect(result.isUser).toBe(false);
  });
});

describe('createToolBuffer', () => {
  it('should start and end tool tracking', () => {
    const buffer = createToolBuffer();

    buffer.start('msg-1', 'tc-1', 'search');
    
    const tool = buffer.get('msg-1', 'tc-1');
    expect(tool).toBeDefined();
    expect(tool?.toolCallId).toBe('tc-1');
    expect(tool?.toolName).toBe('search');
    expect(tool?.status).toBe('running');

    const final = buffer.end('msg-1', 'tc-1');
    expect(final?.status).toBe('done');
    expect(final?.endTime).toBeDefined();
  });

  it('should accumulate args', () => {
    const buffer = createToolBuffer();

    buffer.start('msg-1', 'tc-1', 'search');
    
    let args = buffer.appendArgs('msg-1', 'tc-1', '{"query":');
    expect(args).toBe('{"query":');

    args = buffer.appendArgs('msg-1', 'tc-1', '"test"}');
    expect(args).toBe('{"query":"test"}');

    const tool = buffer.get('msg-1', 'tc-1');
    expect(tool?.args).toBe('{"query":"test"}');
  });

  it('should set result', () => {
    const buffer = createToolBuffer();

    buffer.start('msg-1', 'tc-1', 'search');
    buffer.setResult('msg-1', 'tc-1', '["result1", "result2"]');

    const tool = buffer.get('msg-1', 'tc-1');
    expect(tool?.result).toBe('["result1", "result2"]');
  });

  it('should handle multiple tools per message', () => {
    const buffer = createToolBuffer();

    buffer.start('msg-1', 'tc-1', 'search');
    buffer.start('msg-1', 'tc-2', 'calculate');

    const msgTools = buffer.getByMessage('msg-1');
    expect(msgTools.size).toBe(2);
    expect(msgTools.get('tc-1')?.toolName).toBe('search');
    expect(msgTools.get('tc-2')?.toolName).toBe('calculate');
  });

  it('should clear all buffers', () => {
    const buffer = createToolBuffer();

    buffer.start('msg-1', 'tc-1', 'search');
    buffer.start('msg-2', 'tc-2', 'calculate');

    buffer.clear();

    expect(buffer.getByMessage('msg-1').size).toBe(0);
    expect(buffer.getByMessage('msg-2').size).toBe(0);
  });
});

describe('bindToolAggregation', () => {
  it('should call onToolStart when TOOL_CALL_START fires', () => {
    const router = createEventRouter();
    const onToolStart = vi.fn();

    bindToolAggregation(router, { onToolStart });

    router.route({
      type: 'TOOL_CALL_START',
      messageId: 'msg-1',
      toolCallId: 'tc-1',
      toolName: 'search',
      timestamp: Date.now(),
    });

    expect(onToolStart).toHaveBeenCalledWith('msg-1', 'tc-1', 'search');
  });

  it('should call onToolArgs with accumulated args', () => {
    const router = createEventRouter();
    const onToolArgs = vi.fn();

    bindToolAggregation(router, { onToolArgs });

    router.route({
      type: 'TOOL_CALL_START',
      messageId: 'msg-1',
      toolCallId: 'tc-1',
      toolName: 'search',
      timestamp: Date.now(),
    });

    router.route({
      type: 'TOOL_CALL_ARGS',
      messageId: 'msg-1',
      toolCallId: 'tc-1',
      argsDelta: '{"query":',
      timestamp: Date.now(),
    });

    expect(onToolArgs).toHaveBeenCalledWith('msg-1', 'tc-1', '{"query":', '{"query":');

    router.route({
      type: 'TOOL_CALL_ARGS',
      messageId: 'msg-1',
      toolCallId: 'tc-1',
      argsDelta: '"test"}',
      timestamp: Date.now(),
    });

    expect(onToolArgs).toHaveBeenCalledWith('msg-1', 'tc-1', '{"query":"test"}', '"test"}');
  });

  it('should call onToolResult when TOOL_CALL_RESULT fires', () => {
    const router = createEventRouter();
    const onToolResult = vi.fn();

    bindToolAggregation(router, { onToolResult });

    router.route({
      type: 'TOOL_CALL_START',
      messageId: 'msg-1',
      toolCallId: 'tc-1',
      toolName: 'search',
      timestamp: Date.now(),
    });

    router.route({
      type: 'TOOL_CALL_RESULT',
      messageId: 'msg-1',
      toolCallId: 'tc-1',
      result: '["found"]',
      timestamp: Date.now(),
    });

    expect(onToolResult).toHaveBeenCalledWith('msg-1', 'tc-1', '["found"]');
  });

  it('should call onToolEnd with final state', () => {
    const router = createEventRouter();
    const onToolEnd = vi.fn();

    bindToolAggregation(router, { onToolEnd });

    router.route({
      type: 'TOOL_CALL_START',
      messageId: 'msg-1',
      toolCallId: 'tc-1',
      toolName: 'search',
      timestamp: Date.now(),
    });

    router.route({
      type: 'TOOL_CALL_END',
      messageId: 'msg-1',
      toolCallId: 'tc-1',
      timestamp: Date.now(),
    });

    expect(onToolEnd).toHaveBeenCalled();
    const finalState = onToolEnd.mock.calls[0][2];
    expect(finalState.toolCallId).toBe('tc-1');
    expect(finalState.status).toBe('done');
  });

  it('should unsubscribe and clear buffer', () => {
    const router = createEventRouter();
    const onToolStart = vi.fn();

    const { buffer, unsubscribe } = bindToolAggregation(router, { onToolStart });

    router.route({
      type: 'TOOL_CALL_START',
      messageId: 'msg-1',
      toolCallId: 'tc-1',
      toolName: 'search',
      timestamp: Date.now(),
    });

    expect(buffer.get('msg-1', 'tc-1')).toBeDefined();
    expect(onToolStart).toHaveBeenCalledTimes(1);

    unsubscribe();

    // Buffer should be cleared
    expect(buffer.get('msg-1', 'tc-1')).toBeUndefined();

    // Events should no longer be handled
    router.route({
      type: 'TOOL_CALL_START',
      messageId: 'msg-2',
      toolCallId: 'tc-2',
      toolName: 'calculate',
      timestamp: Date.now(),
    });

    expect(onToolStart).toHaveBeenCalledTimes(1);
  });
});

