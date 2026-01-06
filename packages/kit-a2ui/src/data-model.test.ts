/**
 * ============================================================================
 * A2UI Data Model Unit Tests
 * ============================================================================
 * Tests for A2uiDataModel class and path-based data access
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { A2uiDataModel, createDataModel, type DataChangeEvent } from './data-model';

// ─────────────────────────────────────────────────────────────────────────────
// Creation Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('createDataModel', () => {
  it('should create a new data model instance', () => {
    const model = createDataModel();
    expect(model).toBeInstanceOf(A2uiDataModel);
  });

  it('should create independent instances', () => {
    const model1 = createDataModel();
    const model2 = createDataModel();

    model1.set('/foo', 'bar');

    expect(model1.get('/foo')).toBe('bar');
    expect(model2.get('/foo')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Get/Set Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('get() and set()', () => {
  let model: A2uiDataModel;

  beforeEach(() => {
    model = new A2uiDataModel();
  });

  describe('primitive values', () => {
    it('should set and get string value', () => {
      model.set('/name', 'Alice');
      expect(model.get('/name')).toBe('Alice');
    });

    it('should set and get number value', () => {
      model.set('/count', 42);
      expect(model.get('/count')).toBe(42);
    });

    it('should set and get boolean value', () => {
      model.set('/active', true);
      expect(model.get('/active')).toBe(true);
    });
  });

  describe('path handling', () => {
    it('should handle paths without leading slash', () => {
      model.set('name', 'Bob');
      expect(model.get('name')).toBe('Bob');
      expect(model.get('/name')).toBe('Bob');
    });

    it('should handle paths with trailing slash', () => {
      model.set('/name/', 'Carol');
      expect(model.get('/name')).toBe('Carol');
    });

    it('should get root with empty path', () => {
      model.set('/a', 1);
      model.set('/b', 2);
      
      const root = model.get('/');
      expect(root).toEqual({ a: 1, b: 2 });
    });
  });

  describe('nested paths', () => {
    it('should set and get nested value', () => {
      model.set('/user/name', 'David');
      expect(model.get('/user/name')).toBe('David');
    });

    it('should create intermediate objects automatically', () => {
      model.set('/deep/nested/path/value', 'deep');
      expect(model.get('/deep/nested/path/value')).toBe('deep');
    });

    it('should get parent object with partial path', () => {
      model.set('/user/name', 'Eve');
      model.set('/user/age', 30);
      
      expect(model.get('/user')).toEqual({ name: 'Eve', age: 30 });
    });
  });

  describe('complex values', () => {
    it('should set and get array', () => {
      model.set('/items', [1, 2, 3]);
      expect(model.get('/items')).toEqual([1, 2, 3]);
    });

    it('should set and get object', () => {
      model.set('/user', { name: 'Frank', age: 25 });
      expect(model.get('/user')).toEqual({ name: 'Frank', age: 25 });
    });

    it('should set and get nested complex structure', () => {
      const complex = {
        users: [
          { name: 'Alice', roles: ['admin'] },
          { name: 'Bob', roles: ['user'] },
        ],
        settings: {
          theme: 'dark',
          notifications: true,
        },
      };

      model.set('/data', complex);
      expect(model.get('/data')).toEqual(complex);
    });
  });

  describe('edge cases', () => {
    it('should return undefined for non-existent path', () => {
      expect(model.get('/nonexistent')).toBeUndefined();
    });

    it('should return undefined for non-existent nested path', () => {
      model.set('/a', 1);
      expect(model.get('/a/b/c')).toBeUndefined();
    });

    it('should overwrite existing value', () => {
      model.set('/value', 'old');
      model.set('/value', 'new');
      expect(model.get('/value')).toBe('new');
    });

    it('should handle setting root', () => {
      model.set('/', { root: true });
      expect(model.get('/root')).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Delete Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('delete()', () => {
  let model: A2uiDataModel;

  beforeEach(() => {
    model = new A2uiDataModel();
  });

  it('should delete a value at path', () => {
    model.set('/name', 'Alice');
    model.delete('/name');
    expect(model.get('/name')).toBeUndefined();
  });

  it('should delete nested value', () => {
    model.set('/user/name', 'Bob');
    model.set('/user/age', 30);
    
    model.delete('/user/name');
    
    expect(model.get('/user/name')).toBeUndefined();
    expect(model.get('/user/age')).toBe(30);
  });

  it('should delete entire subtree', () => {
    model.set('/a/b/c', 'deep');
    model.delete('/a');
    expect(model.get('/a')).toBeUndefined();
  });

  it('should clear all data when deleting root', () => {
    model.set('/a', 1);
    model.set('/b', 2);
    model.delete('/');
    
    expect(model.get('/a')).toBeUndefined();
    expect(model.get('/b')).toBeUndefined();
  });

  it('should handle deleting non-existent path gracefully', () => {
    // Should not throw
    model.delete('/nonexistent');
    expect(model.get('/nonexistent')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// applyUpdate Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('applyUpdate()', () => {
  let model: A2uiDataModel;

  beforeEach(() => {
    model = new A2uiDataModel();
  });

  it('should apply dataModelUpdate message', () => {
    model.applyUpdate({
      contents: [
        { key: 'name', valueString: 'Alice' },
        { key: 'age', valueNumber: 30 },
        { key: 'active', valueBoolean: true },
      ],
    });

    expect(model.get('/name')).toBe('Alice');
    expect(model.get('/age')).toBe(30);
    expect(model.get('/active')).toBe(true);
  });

  it('should apply update at specific path', () => {
    model.applyUpdate({
      path: '/user',
      contents: [
        { key: 'name', valueString: 'Bob' },
      ],
    });

    expect(model.get('/user/name')).toBe('Bob');
  });

  it('should handle nested valueMap', () => {
    model.applyUpdate({
      contents: [
        {
          key: 'user',
          valueMap: [
            { key: 'name', valueString: 'Carol' },
            { key: 'profile', valueMap: [
              { key: 'avatar', valueString: 'url.jpg' },
            ]},
          ],
        },
      ],
    });

    expect(model.get('/user/name')).toBe('Carol');
    expect(model.get('/user/profile/avatar')).toBe('url.jpg');
  });

  it('should handle valueArray', () => {
    model.applyUpdate({
      contents: [
        {
          key: 'tags',
          valueArray: [
            { stringItem: 'a' },
            { stringItem: 'b' },
            { stringItem: 'c' },
          ],
        },
      ],
    });

    expect(model.get('/tags')).toEqual(['a', 'b', 'c']);
  });

  it('should handle array of objects', () => {
    model.applyUpdate({
      contents: [
        {
          key: 'items',
          valueArray: [
            { mapItem: [
              { key: 'id', valueNumber: 1 },
              { key: 'name', valueString: 'Item 1' },
            ]},
            { mapItem: [
              { key: 'id', valueNumber: 2 },
              { key: 'name', valueString: 'Item 2' },
            ]},
          ],
        },
      ],
    });

    expect(model.get('/items')).toEqual([
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('subscribe()', () => {
  let model: A2uiDataModel;

  beforeEach(() => {
    model = new A2uiDataModel();
  });

  it('should notify listener on set', () => {
    const listener = vi.fn();
    model.subscribe(listener);

    model.set('/name', 'Alice');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      path: '/name',
      oldValue: undefined,
      newValue: 'Alice',
      source: 'client',
    });
  });

  it('should notify listener on delete', () => {
    model.set('/name', 'Bob');
    
    const listener = vi.fn();
    model.subscribe(listener);

    model.delete('/name');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      path: '/name',
      oldValue: 'Bob',
      newValue: undefined,
      source: 'client',
    });
  });

  it('should support multiple listeners', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    model.subscribe(listener1);
    model.subscribe(listener2);

    model.set('/x', 1);

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it('should return unsubscribe function', () => {
    const listener = vi.fn();
    const unsubscribe = model.subscribe(listener);

    model.set('/a', 1);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();

    model.set('/b', 2);
    expect(listener).toHaveBeenCalledTimes(1); // Still 1
  });

  it('should report server source for applyUpdate', () => {
    const listener = vi.fn();
    model.subscribe(listener);

    model.applyUpdate({
      contents: [{ key: 'data', valueString: 'test' }],
    });

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'server' })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Path Subscription Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('subscribeToPath()', () => {
  let model: A2uiDataModel;

  beforeEach(() => {
    model = new A2uiDataModel();
  });

  it('should notify only for matching path', () => {
    const listener = vi.fn();
    model.subscribeToPath('/name', listener);

    model.set('/name', 'Alice');
    model.set('/age', 30);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should notify parent path listeners (bubbling)', () => {
    const rootListener = vi.fn();
    const userListener = vi.fn();

    model.subscribeToPath('/', rootListener);
    model.subscribeToPath('/user', userListener);

    model.set('/user/name', 'Bob');

    expect(userListener).toHaveBeenCalledTimes(1);
    expect(rootListener).toHaveBeenCalledTimes(1);
  });

  it('should return unsubscribe function', () => {
    const listener = vi.fn();
    const unsubscribe = model.subscribeToPath('/test', listener);

    model.set('/test', 'a');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();

    model.set('/test', 'b');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should handle nested path subscriptions', () => {
    const listener = vi.fn();
    model.subscribeToPath('/a/b/c', listener);

    model.set('/a/b/c', 'deep');

    expect(listener).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Snapshot and Clear Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('getSnapshot() and clear()', () => {
  let model: A2uiDataModel;

  beforeEach(() => {
    model = new A2uiDataModel();
  });

  it('should return a deep copy of data', () => {
    model.set('/user', { name: 'Alice' });
    
    const snapshot = model.getSnapshot();
    snapshot.user = { name: 'Modified' };

    expect(model.get('/user')).toEqual({ name: 'Alice' });
  });

  it('should clear all data', () => {
    model.set('/a', 1);
    model.set('/b', 2);
    
    model.clear();

    expect(model.get('/a')).toBeUndefined();
    expect(model.get('/b')).toBeUndefined();
    expect(model.getSnapshot()).toEqual({});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Integration', () => {
  it('should handle realistic A2UI data flow', () => {
    const model = new A2uiDataModel();
    const changes: DataChangeEvent[] = [];
    model.subscribe((event) => changes.push(event));

    // Initial data from server
    model.applyUpdate({
      contents: [
        {
          key: 'booking',
          valueMap: [
            { key: 'date', valueString: '2025-01-01' },
            { key: 'guests', valueNumber: 2 },
            { key: 'confirmed', valueBoolean: false },
          ],
        },
      ],
    });

    // User updates form
    model.set('/booking/guests', 4, 'client');
    model.set('/booking/confirmed', true, 'client');

    expect(model.get('/booking/date')).toBe('2025-01-01');
    expect(model.get('/booking/guests')).toBe(4);
    expect(model.get('/booking/confirmed')).toBe(true);
    // applyUpdate triggers 1 event for the nested structure, then 2 from client set
    expect(changes.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle array operations', () => {
    const model = new A2uiDataModel();

    model.applyUpdate({
      contents: [
        {
          key: 'options',
          valueArray: [
            { mapItem: [{ key: 'value', valueString: 'a' }, { key: 'label', valueString: 'Option A' }] },
            { mapItem: [{ key: 'value', valueString: 'b' }, { key: 'label', valueString: 'Option B' }] },
          ],
        },
        {
          key: 'selected',
          valueString: 'a',
        },
      ],
    });

    const options = model.get<Array<{ value: string; label: string }>>('/options');
    expect(options).toHaveLength(2);
    expect(options![0]).toEqual({ value: 'a', label: 'Option A' });
    expect(model.get('/selected')).toBe('a');
  });
});


