/**
 * ============================================================================
 * State Store Unit Tests
 * ============================================================================
 * Tests for createStateStore and JSON Patch operations
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStateStore, type StateStore } from './state';

// ─────────────────────────────────────────────────────────────────────────────
// Store Creation Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('createStateStore', () => {
  it('should create store with default initial state', () => {
    const store = createStateStore();
    const state = store.getState();

    expect(state).toEqual({
      status: 'idle',
      customState: {},
    });
  });

  it('should create store with custom initial state', () => {
    const initialState = {
      status: 'running' as const,
      customState: { count: 10, items: ['a', 'b'] },
    };

    const store = createStateStore(initialState);
    const state = store.getState();

    expect(state).toEqual(initialState);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Snapshot Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('setSnapshot()', () => {
  let store: StateStore;

  beforeEach(() => {
    store = createStateStore();
  });

  it('should replace customState with new snapshot', () => {
    store.setSnapshot({ count: 5, name: 'test' });
    
    const state = store.getState();
    expect(state.customState).toEqual({ count: 5, name: 'test' });
  });

  it('should completely replace previous customState', () => {
    store.setSnapshot({ oldField: 'old' });
    store.setSnapshot({ newField: 'new' });

    const state = store.getState();
    expect(state.customState).toEqual({ newField: 'new' });
    expect((state.customState as any).oldField).toBeUndefined();
  });

  it('should preserve status when setting snapshot', () => {
    const store = createStateStore({ status: 'running', customState: {} });
    store.setSnapshot({ data: 'new' });

    expect(store.getState().status).toBe('running');
  });

  it('should handle nested objects', () => {
    store.setSnapshot({
      level1: {
        level2: {
          level3: 'deep value',
        },
      },
    });

    const state = store.getState();
    expect((state.customState as any).level1.level2.level3).toBe('deep value');
  });

  it('should handle arrays', () => {
    store.setSnapshot({
      items: [1, 2, 3],
      objects: [{ id: 1 }, { id: 2 }],
    });

    const state = store.getState();
    expect((state.customState as any).items).toEqual([1, 2, 3]);
    expect((state.customState as any).objects).toEqual([{ id: 1 }, { id: 2 }]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// JSON Patch Delta Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('applyDelta()', () => {
  let store: StateStore;

  beforeEach(() => {
    store = createStateStore({
      status: 'idle',
      customState: {
        count: 0,
        items: [],
        nested: { a: 1 },
      },
    });
  });

  describe('add operation', () => {
    it('should add new property', () => {
      store.applyDelta([
        { op: 'add', path: '/newProp', value: 'new value' },
      ]);

      expect((store.getState().customState as any).newProp).toBe('new value');
    });

    it('should add nested property', () => {
      store.applyDelta([
        { op: 'add', path: '/nested/b', value: 2 },
      ]);

      expect((store.getState().customState as any).nested.b).toBe(2);
    });

    it('should add array element', () => {
      store.applyDelta([
        { op: 'add', path: '/items/0', value: 'first' },
      ]);

      expect((store.getState().customState as any).items[0]).toBe('first');
    });
  });

  describe('replace operation', () => {
    it('should replace existing property', () => {
      store.applyDelta([
        { op: 'replace', path: '/count', value: 42 },
      ]);

      expect((store.getState().customState as any).count).toBe(42);
    });

    it('should replace nested property', () => {
      store.applyDelta([
        { op: 'replace', path: '/nested/a', value: 100 },
      ]);

      expect((store.getState().customState as any).nested.a).toBe(100);
    });

    it('should replace entire nested object', () => {
      store.applyDelta([
        { op: 'replace', path: '/nested', value: { x: 1, y: 2 } },
      ]);

      expect((store.getState().customState as any).nested).toEqual({ x: 1, y: 2 });
    });
  });

  describe('remove operation', () => {
    it('should remove property', () => {
      store.applyDelta([
        { op: 'remove', path: '/count' },
      ]);

      expect((store.getState().customState as any).count).toBeUndefined();
    });

    it('should remove nested property', () => {
      store.applyDelta([
        { op: 'remove', path: '/nested/a' },
      ]);

      expect((store.getState().customState as any).nested.a).toBeUndefined();
    });
  });

  describe('move operation', () => {
    it('should move property to new location', () => {
      store.setSnapshot({ source: 'value', target: {} });
      
      store.applyDelta([
        { op: 'move', from: '/source', path: '/destination' },
      ]);

      const state = store.getState().customState as any;
      expect(state.source).toBeUndefined();
      expect(state.destination).toBe('value');
    });
  });

  describe('copy operation', () => {
    it('should copy property to new location', () => {
      store.setSnapshot({ source: 'original' });

      store.applyDelta([
        { op: 'copy', from: '/source', path: '/copied' },
      ]);

      const state = store.getState().customState as any;
      expect(state.source).toBe('original');
      expect(state.copied).toBe('original');
    });

    it('should deep copy objects', () => {
      store.setSnapshot({ source: { nested: { value: 1 } } });

      store.applyDelta([
        { op: 'copy', from: '/source', path: '/copied' },
      ]);

      const state = store.getState().customState as any;
      // Modify original should not affect copy
      state.source.nested.value = 999;
      expect(state.copied.nested.value).toBe(1);
    });
  });

  describe('test operation', () => {
    it('should not modify state (test is read-only)', () => {
      const originalState = store.getState();

      store.applyDelta([
        { op: 'test', path: '/count', value: 0 },
      ]);

      expect(store.getState().customState).toEqual(originalState.customState);
    });
  });

  describe('root operation', () => {
    it('should handle replace at root path', () => {
      store.applyDelta([
        { op: 'replace', path: '', value: { newRoot: true } },
      ]);

      expect((store.getState().customState as any).newRoot).toBe(true);
    });
  });

  describe('multiple operations', () => {
    it('should apply multiple operations in order', () => {
      store.applyDelta([
        { op: 'replace', path: '/count', value: 1 },
        { op: 'add', path: '/newField', value: 'added' },
        { op: 'replace', path: '/count', value: 2 },
      ]);

      const state = store.getState().customState as any;
      expect(state.count).toBe(2);
      expect(state.newField).toBe('added');
    });
  });

  describe('edge cases', () => {
    it('should handle empty delta array', () => {
      const before = store.getState();
      store.applyDelta([]);
      const after = store.getState();

      expect(before.customState).toEqual(after.customState);
    });

    it('should handle non-existent path gracefully', () => {
      // Should not throw
      store.applyDelta([
        { op: 'remove', path: '/nonexistent/deep/path' },
      ]);
    });

    it('should handle add to existing nested path', () => {
      // Note: JSON Patch doesn't auto-create intermediate paths
      // The parent must exist first
      store.setSnapshot({ a: { b: {} } });

      store.applyDelta([
        { op: 'add', path: '/a/b/c', value: 'deep' },
      ]);

      expect((store.getState().customState as any).a.b.c).toBe('deep');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('subscribe()', () => {
  let store: StateStore;

  beforeEach(() => {
    store = createStateStore();
  });

  it('should notify subscribers on setSnapshot', () => {
    const callback = vi.fn();
    store.subscribe(callback);

    store.setSnapshot({ count: 1 });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(store.getState());
  });

  it('should notify subscribers on applyDelta', () => {
    const callback = vi.fn();
    store.subscribe(callback);

    store.applyDelta([{ op: 'add', path: '/test', value: 1 }]);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should support multiple subscribers', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    store.subscribe(callback1);
    store.subscribe(callback2);

    store.setSnapshot({ data: true });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should return unsubscribe function', () => {
    const callback = vi.fn();
    const unsubscribe = store.subscribe(callback);

    store.setSnapshot({ a: 1 });
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();

    store.setSnapshot({ b: 2 });
    expect(callback).toHaveBeenCalledTimes(1); // Still 1
  });

  it('should provide current state to callback', () => {
    const states: any[] = [];
    store.subscribe((state) => states.push(state.customState));

    store.setSnapshot({ step: 1 });
    store.applyDelta([{ op: 'replace', path: '/step', value: 2 }]);

    expect(states).toEqual([{ step: 1 }, { step: 2 }]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Integration', () => {
  it('should handle realistic AG-UI state flow', () => {
    const store = createStateStore();
    const stateHistory: any[] = [];

    store.subscribe((state) => {
      stateHistory.push({ ...state.customState });
    });

    // 1. Initial snapshot from server
    store.setSnapshot({
      sessionId: 'sess-123',
      runId: null,
      messages: [],
    });

    // 2. Run starts - delta update
    store.applyDelta([
      { op: 'add', path: '/runId', value: 'run-456' },
      { op: 'replace', path: '/messages', value: [] },
    ]);

    // 3. Message added
    store.applyDelta([
      { op: 'add', path: '/messages/0', value: { id: 'm1', role: 'user', content: 'Hello' } },
    ]);

    // 4. Response added
    store.applyDelta([
      { op: 'add', path: '/messages/1', value: { id: 'm2', role: 'assistant', content: 'Hi!' } },
    ]);

    expect(stateHistory).toHaveLength(4);
    
    const finalState = store.getState().customState as any;
    expect(finalState.sessionId).toBe('sess-123');
    expect(finalState.runId).toBe('run-456');
    expect(finalState.messages).toHaveLength(2);
    expect(finalState.messages[1].content).toBe('Hi!');
  });
});


