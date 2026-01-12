/**
 * ============================================================================
 * JSON Patch Tests
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import {
  applyJsonPatch,
  applyJsonPatchMutable,
  validateJsonPatch,
  type JsonPatchOperation,
} from './json-patch';

describe('applyJsonPatch', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // Add Operation
  // ─────────────────────────────────────────────────────────────────────────

  describe('add operation', () => {
    it('should add a property to object', () => {
      const obj = { a: 1 };
      const result = applyJsonPatch(obj, [
        { op: 'add', path: '/b', value: 2 },
      ]);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should add nested property', () => {
      const obj = { a: { b: 1 } };
      const result = applyJsonPatch(obj, [
        { op: 'add', path: '/a/c', value: 2 },
      ]);
      expect(result).toEqual({ a: { b: 1, c: 2 } });
    });

    it('should add to array end with -', () => {
      const obj = { items: [1, 2] };
      const result = applyJsonPatch(obj, [
        { op: 'add', path: '/items/-', value: 3 },
      ]);
      expect(result).toEqual({ items: [1, 2, 3] });
    });

    it('should insert into array at index', () => {
      const obj = { items: [1, 3] };
      const result = applyJsonPatch(obj, [
        { op: 'add', path: '/items/1', value: 2 },
      ]);
      expect(result).toEqual({ items: [1, 2, 3] });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Remove Operation
  // ─────────────────────────────────────────────────────────────────────────

  describe('remove operation', () => {
    it('should remove property from object', () => {
      const obj = { a: 1, b: 2 };
      const result = applyJsonPatch(obj, [{ op: 'remove', path: '/b' }]);
      expect(result).toEqual({ a: 1 });
    });

    it('should remove item from array', () => {
      const obj = { items: [1, 2, 3] };
      const result = applyJsonPatch(obj, [
        { op: 'remove', path: '/items/1' },
      ]);
      expect(result).toEqual({ items: [1, 3] });
    });

    it('should remove nested property', () => {
      const obj = { a: { b: 1, c: 2 } };
      const result = applyJsonPatch(obj, [{ op: 'remove', path: '/a/b' }]);
      expect(result).toEqual({ a: { c: 2 } });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Replace Operation
  // ─────────────────────────────────────────────────────────────────────────

  describe('replace operation', () => {
    it('should replace property value', () => {
      const obj = { a: 1 };
      const result = applyJsonPatch(obj, [
        { op: 'replace', path: '/a', value: 2 },
      ]);
      expect(result).toEqual({ a: 2 });
    });

    it('should replace array item', () => {
      const obj = { items: [1, 2, 3] };
      const result = applyJsonPatch(obj, [
        { op: 'replace', path: '/items/1', value: 20 },
      ]);
      expect(result).toEqual({ items: [1, 20, 3] });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Move Operation
  // ─────────────────────────────────────────────────────────────────────────

  describe('move operation', () => {
    it('should move property', () => {
      const obj = { a: 1, b: { c: 2 } };
      const result = applyJsonPatch(obj, [
        { op: 'move', from: '/a', path: '/b/a' },
      ]);
      expect(result).toEqual({ b: { c: 2, a: 1 } });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Copy Operation
  // ─────────────────────────────────────────────────────────────────────────

  describe('copy operation', () => {
    it('should copy property', () => {
      const obj = { a: 1 };
      const result = applyJsonPatch(obj, [
        { op: 'copy', from: '/a', path: '/b' },
      ]);
      expect(result).toEqual({ a: 1, b: 1 });
    });

    it('should deep copy objects', () => {
      const obj = { a: { nested: 1 } };
      const result = applyJsonPatch(obj, [
        { op: 'copy', from: '/a', path: '/b' },
      ]);
      expect(result).toEqual({ a: { nested: 1 }, b: { nested: 1 } });
      // Verify deep copy - modifying original shouldn't affect copy
      expect(result.a).not.toBe(result.b);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Immutability
  // ─────────────────────────────────────────────────────────────────────────

  describe('immutability', () => {
    it('should not mutate original object', () => {
      const original = { a: 1, b: { c: 2 } };
      const result = applyJsonPatch(original, [
        { op: 'replace', path: '/a', value: 10 },
        { op: 'add', path: '/b/d', value: 3 },
      ]);
      expect(original).toEqual({ a: 1, b: { c: 2 } });
      expect(result).toEqual({ a: 10, b: { c: 2, d: 3 } });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Multiple Operations
  // ─────────────────────────────────────────────────────────────────────────

  describe('multiple operations', () => {
    it('should apply multiple operations in order', () => {
      const obj = { count: 0, items: [] };
      const result = applyJsonPatch(obj, [
        { op: 'replace', path: '/count', value: 1 },
        { op: 'add', path: '/items/-', value: 'a' },
        { op: 'add', path: '/items/-', value: 'b' },
        { op: 'add', path: '/status', value: 'active' },
      ]);
      expect(result).toEqual({
        count: 1,
        items: ['a', 'b'],
        status: 'active',
      });
    });
  });
});

describe('applyJsonPatchMutable', () => {
  it('should mutate the original object', () => {
    const obj = { a: 1 };
    const result = applyJsonPatchMutable(obj, [
      { op: 'add', path: '/b', value: 2 },
    ]);
    expect(obj).toEqual({ a: 1, b: 2 });
    expect(result).toBe(obj); // Same reference
  });
});

describe('validateJsonPatch', () => {
  it('should validate correct operations', () => {
    const ops: JsonPatchOperation[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'remove', path: '/b' },
      { op: 'replace', path: '/c', value: 2 },
    ];
    expect(validateJsonPatch(ops)).toBe(true);
  });

  it('should reject invalid operations', () => {
    expect(validateJsonPatch([{ op: 'invalid', path: '/a' }])).toBe(false);
    expect(validateJsonPatch([{ op: 'add' }])).toBe(false); // Missing path
    expect(validateJsonPatch([{ path: '/a' }])).toBe(false); // Missing op
    expect(validateJsonPatch('not an array' as unknown as unknown[])).toBe(false);
  });
});

