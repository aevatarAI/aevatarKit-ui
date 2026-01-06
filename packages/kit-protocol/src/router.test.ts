/**
 * ============================================================================
 * Event Router Unit Tests
 * ============================================================================
 * Tests for createEventRouter and event routing functionality
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEventRouter, type EventRouter } from './router';
import type { AgUiEvent, CustomEvent, RunStartedEvent } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Test Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const createRunStartedEvent = (runId = 'run-123'): RunStartedEvent => ({
  type: 'RUN_STARTED',
  runId,
  timestamp: Date.now(),
});

const createCustomEvent = (name: string, value: unknown): CustomEvent => ({
  type: 'CUSTOM',
  name,
  value,
  timestamp: Date.now(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Router Creation Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('createEventRouter', () => {
  it('should create a router with all required methods', () => {
    const router = createEventRouter();

    expect(router).toHaveProperty('route');
    expect(router).toHaveProperty('on');
    expect(router).toHaveProperty('onCustom');
    expect(router).toHaveProperty('onAevatar');
    expect(router).toHaveProperty('onAny');
    expect(router).toHaveProperty('clear');
  });

  it('should create independent router instances', () => {
    const router1 = createEventRouter();
    const router2 = createEventRouter();

    const handler1 = vi.fn();
    const handler2 = vi.fn();

    router1.on('RUN_STARTED', handler1);
    router2.on('RUN_STARTED', handler2);

    const event = createRunStartedEvent();
    router1.route(event);

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Type-Specific Handler Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('on() - Type-Specific Handlers', () => {
  let router: EventRouter;

  beforeEach(() => {
    router = createEventRouter();
  });

  it('should route RUN_STARTED events to registered handler', () => {
    const handler = vi.fn();
    router.on('RUN_STARTED', handler);

    const event = createRunStartedEvent();
    router.route(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should route multiple event types independently', () => {
    const runStartedHandler = vi.fn();
    const runFinishedHandler = vi.fn();

    router.on('RUN_STARTED', runStartedHandler);
    router.on('RUN_FINISHED', runFinishedHandler);

    router.route(createRunStartedEvent());
    router.route({ type: 'RUN_FINISHED', runId: 'run-123' });

    expect(runStartedHandler).toHaveBeenCalledTimes(1);
    expect(runFinishedHandler).toHaveBeenCalledTimes(1);
  });

  it('should support multiple handlers for same event type', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();

    router.on('RUN_STARTED', handler1);
    router.on('RUN_STARTED', handler2);
    router.on('RUN_STARTED', handler3);

    router.route(createRunStartedEvent());

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler3).toHaveBeenCalledTimes(1);
  });

  it('should not route events to handlers of different types', () => {
    const handler = vi.fn();
    router.on('RUN_FINISHED', handler);

    router.route(createRunStartedEvent());

    expect(handler).not.toHaveBeenCalled();
  });

  it('should return unsubscribe function that removes handler', () => {
    const handler = vi.fn();
    const unsubscribe = router.on('RUN_STARTED', handler);

    router.route(createRunStartedEvent());
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();

    router.route(createRunStartedEvent());
    expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  it('should handle all AG-UI event types', () => {
    const handlers: Record<string, ReturnType<typeof vi.fn>> = {};
    const eventTypes: AgUiEvent['type'][] = [
      'RUN_STARTED',
      'RUN_FINISHED',
      'RUN_ERROR',
      'STEP_STARTED',
      'STEP_FINISHED',
      'TEXT_MESSAGE_START',
      'TEXT_MESSAGE_CONTENT',
      'TEXT_MESSAGE_END',
      'TOOL_CALL_START',
      'TOOL_CALL_ARGS',
      'TOOL_CALL_END',
      'TOOL_CALL_RESULT',
      'STATE_SNAPSHOT',
      'STATE_DELTA',
      'MESSAGES_SNAPSHOT',
      'CUSTOM',
    ];

    // Register handlers for all types
    eventTypes.forEach((type) => {
      handlers[type] = vi.fn();
      router.on(type, handlers[type]);
    });

    // Route events for each type
    router.route({ type: 'RUN_STARTED', runId: 'r1' });
    router.route({ type: 'RUN_FINISHED', runId: 'r1' });
    router.route({ type: 'RUN_ERROR', runId: 'r1', message: 'error' });
    router.route({ type: 'STEP_STARTED', stepId: 's1' });
    router.route({ type: 'STEP_FINISHED', stepId: 's1' });
    router.route({ type: 'TEXT_MESSAGE_START', messageId: 'm1', role: 'assistant' });
    router.route({ type: 'TEXT_MESSAGE_CONTENT', messageId: 'm1', delta: 'hi' });
    router.route({ type: 'TEXT_MESSAGE_END', messageId: 'm1' });
    router.route({ type: 'TOOL_CALL_START', toolCallId: 't1', toolName: 'search' });
    router.route({ type: 'TOOL_CALL_ARGS', toolCallId: 't1', delta: '{"q":' });
    router.route({ type: 'TOOL_CALL_END', toolCallId: 't1' });
    router.route({ type: 'TOOL_CALL_RESULT', toolCallId: 't1', result: '{}' });
    router.route({ type: 'STATE_SNAPSHOT', snapshot: {} });
    router.route({ type: 'STATE_DELTA', delta: [] });
    router.route({ type: 'MESSAGES_SNAPSHOT', messages: [] });
    router.route({ type: 'CUSTOM', name: 'test', value: null });

    // Verify each handler was called once
    eventTypes.forEach((type) => {
      expect(handlers[type]).toHaveBeenCalledTimes(1);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Custom Event Handler Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('onCustom() - Custom Event Handlers', () => {
  let router: EventRouter;

  beforeEach(() => {
    router = createEventRouter();
  });

  it('should route CUSTOM events by name', () => {
    const handler = vi.fn();
    router.onCustom('my.custom.event', handler);

    const event = createCustomEvent('my.custom.event', { data: 'test' });
    router.route(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should not route CUSTOM events with different names', () => {
    const handler = vi.fn();
    router.onCustom('event.a', handler);

    router.route(createCustomEvent('event.b', {}));

    expect(handler).not.toHaveBeenCalled();
  });

  it('should support multiple handlers for same custom event name', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    router.onCustom('shared.event', handler1);
    router.onCustom('shared.event', handler2);

    router.route(createCustomEvent('shared.event', { x: 1 }));

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should return unsubscribe function for custom handlers', () => {
    const handler = vi.fn();
    const unsubscribe = router.onCustom('test.event', handler);

    router.route(createCustomEvent('test.event', {}));
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();

    router.route(createCustomEvent('test.event', {}));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should route to both type and custom handlers for CUSTOM events', () => {
    const typeHandler = vi.fn();
    const customHandler = vi.fn();

    router.on('CUSTOM', typeHandler);
    router.onCustom('specific.event', customHandler);

    const event = createCustomEvent('specific.event', {});
    router.route(event);

    expect(typeHandler).toHaveBeenCalledTimes(1);
    expect(customHandler).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Aevatar Extension Handler Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('onAevatar() - Aevatar Extension Handlers', () => {
  let router: EventRouter;

  beforeEach(() => {
    router = createEventRouter();
  });

  it('should route aevatar.progress events', () => {
    const handler = vi.fn();
    router.onAevatar('aevatar.progress', handler);

    const event = createCustomEvent('aevatar.progress', {
      phase: 'reasoning',
      percent: 50,
    });
    router.route(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should route aevatar.graph events', () => {
    const handler = vi.fn();
    router.onAevatar('aevatar.graph', handler);

    const event = createCustomEvent('aevatar.graph', {
      iteration: 1,
      axioms: [],
    });
    router.route(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should route aevatar.voting events', () => {
    const handler = vi.fn();
    router.onAevatar('aevatar.voting', handler);

    const event = createCustomEvent('aevatar.voting', {
      round: 3,
      candidates: [],
    });
    router.route(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should route aevatar.consensus events', () => {
    const handler = vi.fn();
    router.onAevatar('aevatar.consensus', handler);

    const event = createCustomEvent('aevatar.consensus', {
      round: 5,
      leader: 'agent-1',
    });
    router.route(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Any Handler Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('onAny() - Catch-All Handlers', () => {
  let router: EventRouter;

  beforeEach(() => {
    router = createEventRouter();
  });

  it('should receive all events', () => {
    const handler = vi.fn();
    router.onAny(handler);

    router.route(createRunStartedEvent());
    router.route({ type: 'RUN_FINISHED', runId: 'run-123' });
    router.route(createCustomEvent('test', {}));

    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('should receive event even without type-specific handler', () => {
    const anyHandler = vi.fn();
    router.onAny(anyHandler);

    const event: AgUiEvent = {
      type: 'STEP_STARTED',
      stepId: 'step-1',
    };
    router.route(event);

    expect(anyHandler).toHaveBeenCalledTimes(1);
    expect(anyHandler).toHaveBeenCalledWith(event);
  });

  it('should support multiple any handlers', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    router.onAny(handler1);
    router.onAny(handler2);

    router.route(createRunStartedEvent());

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should return unsubscribe function', () => {
    const handler = vi.fn();
    const unsubscribe = router.onAny(handler);

    router.route(createRunStartedEvent());
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();

    router.route(createRunStartedEvent());
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should receive events alongside type-specific handlers', () => {
    const typeHandler = vi.fn();
    const anyHandler = vi.fn();

    router.on('RUN_STARTED', typeHandler);
    router.onAny(anyHandler);

    router.route(createRunStartedEvent());

    expect(typeHandler).toHaveBeenCalledTimes(1);
    expect(anyHandler).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Clear Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('clear() - Handler Cleanup', () => {
  let router: EventRouter;

  beforeEach(() => {
    router = createEventRouter();
  });

  it('should remove all type handlers', () => {
    const handler = vi.fn();
    router.on('RUN_STARTED', handler);
    router.on('RUN_FINISHED', handler);

    router.clear();

    router.route(createRunStartedEvent());
    router.route({ type: 'RUN_FINISHED', runId: 'run-123' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should remove all custom handlers', () => {
    const handler = vi.fn();
    router.onCustom('event.a', handler);
    router.onCustom('event.b', handler);

    router.clear();

    router.route(createCustomEvent('event.a', {}));
    router.route(createCustomEvent('event.b', {}));

    expect(handler).not.toHaveBeenCalled();
  });

  it('should remove all any handlers', () => {
    const handler = vi.fn();
    router.onAny(handler);

    router.clear();

    router.route(createRunStartedEvent());

    expect(handler).not.toHaveBeenCalled();
  });

  it('should allow registering new handlers after clear', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    router.on('RUN_STARTED', handler1);
    router.clear();
    router.on('RUN_STARTED', handler2);

    router.route(createRunStartedEvent());

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Error Handling Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Error Handling', () => {
  let router: EventRouter;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    router = createEventRouter();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should catch and log errors in type handlers', () => {
    const errorHandler = vi.fn(() => {
      throw new Error('Handler error');
    });
    const normalHandler = vi.fn();

    router.on('RUN_STARTED', errorHandler);
    router.on('RUN_STARTED', normalHandler);

    router.route(createRunStartedEvent());

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(normalHandler).toHaveBeenCalledTimes(1);
  });

  it('should catch and log errors in custom handlers', () => {
    const errorHandler = vi.fn(() => {
      throw new Error('Custom handler error');
    });

    router.onCustom('test.event', errorHandler);

    router.route(createCustomEvent('test.event', {}));

    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should catch and log errors in any handlers', () => {
    const errorHandler = vi.fn(() => {
      throw new Error('Any handler error');
    });

    router.onAny(errorHandler);

    router.route(createRunStartedEvent());

    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should continue routing after handler error', () => {
    const handlers = [
      vi.fn(),
      vi.fn(() => { throw new Error('Error in middle'); }),
      vi.fn(),
    ];

    handlers.forEach((h) => router.on('RUN_STARTED', h));

    router.route(createRunStartedEvent());

    expect(handlers[0]).toHaveBeenCalledTimes(1);
    expect(handlers[1]).toHaveBeenCalledTimes(1);
    expect(handlers[2]).toHaveBeenCalledTimes(1);
  });
});


