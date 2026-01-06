/**
 * ============================================================================
 * A2UI Binding Resolver Unit Tests
 * ============================================================================
 * Tests for A2uiBindingResolver class and data binding resolution
 * ============================================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { A2uiBindingResolver, createBindingResolver, type ResolveContext } from './binding-resolver';
import { A2uiDataModel } from './data-model';
import type { A2uiBoundValue, A2uiComponentProps, A2uiChildren } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Test Setup
// ─────────────────────────────────────────────────────────────────────────────

describe('A2uiBindingResolver', () => {
  let dataModel: A2uiDataModel;
  let resolver: A2uiBindingResolver;

  beforeEach(() => {
    dataModel = new A2uiDataModel();
    resolver = new A2uiBindingResolver(dataModel);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Factory Tests
  // ─────────────────────────────────────────────────────────────────────────

  describe('createBindingResolver', () => {
    it('should create resolver instance', () => {
      const created = createBindingResolver(dataModel);
      expect(created).toBeInstanceOf(A2uiBindingResolver);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // resolve() - Literal Values
  // ─────────────────────────────────────────────────────────────────────────

  describe('resolve() - literal values', () => {
    it('should resolve literalString', () => {
      const bound: A2uiBoundValue = { literalString: 'Hello World' };
      expect(resolver.resolve(bound)).toBe('Hello World');
    });

    it('should resolve literalNumber', () => {
      const bound: A2uiBoundValue = { literalNumber: 42 };
      expect(resolver.resolve(bound)).toBe(42);
    });

    it('should resolve literalBoolean true', () => {
      const bound: A2uiBoundValue = { literalBoolean: true };
      expect(resolver.resolve(bound)).toBe(true);
    });

    it('should resolve literalBoolean false', () => {
      const bound: A2uiBoundValue = { literalBoolean: false };
      expect(resolver.resolve(bound)).toBe(false);
    });

    it('should resolve literalArray', () => {
      const bound: A2uiBoundValue = {
        literalArray: [
          { literalString: 'a' },
          { literalNumber: 1 },
          { literalBoolean: true },
        ],
      };
      expect(resolver.resolve(bound)).toEqual(['a', 1, true]);
    });

    it('should resolve literalMap', () => {
      const bound: A2uiBoundValue = {
        literalMap: {
          name: { literalString: 'Alice' },
          age: { literalNumber: 30 },
        },
      };
      expect(resolver.resolve(bound)).toEqual({ name: 'Alice', age: 30 });
    });

    it('should return undefined for empty bound value', () => {
      const bound: A2uiBoundValue = {};
      expect(resolver.resolve(bound)).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // resolve() - Path Bindings
  // ─────────────────────────────────────────────────────────────────────────

  describe('resolve() - path bindings', () => {
    beforeEach(() => {
      dataModel.set('/user/name', 'Bob');
      dataModel.set('/user/age', 25);
      dataModel.set('/items', ['a', 'b', 'c']);
      dataModel.set('/settings', { theme: 'dark', lang: 'en' });
    });

    it('should resolve path to string value', () => {
      const bound: A2uiBoundValue = { path: '/user/name' };
      expect(resolver.resolve(bound)).toBe('Bob');
    });

    it('should resolve path to number value', () => {
      const bound: A2uiBoundValue = { path: '/user/age' };
      expect(resolver.resolve(bound)).toBe(25);
    });

    it('should resolve path to array', () => {
      const bound: A2uiBoundValue = { path: '/items' };
      expect(resolver.resolve(bound)).toEqual(['a', 'b', 'c']);
    });

    it('should resolve path to object', () => {
      const bound: A2uiBoundValue = { path: '/settings' };
      expect(resolver.resolve(bound)).toEqual({ theme: 'dark', lang: 'en' });
    });

    it('should return undefined for non-existent path', () => {
      const bound: A2uiBoundValue = { path: '/nonexistent' };
      expect(resolver.resolve(bound)).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // resolve() - Context Variables
  // ─────────────────────────────────────────────────────────────────────────

  describe('resolve() - context variables', () => {
    it('should resolve $item in loop context', () => {
      const context: ResolveContext = {
        item: 'loop item value',
        index: 0,
      };
      const bound: A2uiBoundValue = { path: '$item' };
      
      expect(resolver.resolve(bound, context)).toBe('loop item value');
    });

    it('should resolve $index in loop context', () => {
      const context: ResolveContext = {
        item: 'value',
        index: 5,
      };
      const bound: A2uiBoundValue = { path: '$index' };

      expect(resolver.resolve(bound, context)).toBe(5);
    });

    it('should resolve $item with nested path', () => {
      const context: ResolveContext = {
        item: { name: 'Alice', age: 30 },
        index: 0,
      };
      const bound: A2uiBoundValue = { path: '$item/name' };

      expect(resolver.resolve(bound, context)).toBe('Alice');
    });

    it('should resolve custom variable names', () => {
      const context: ResolveContext = {
        item: 'custom value',
        index: 3,
        itemVariable: 'row',
        indexVariable: 'i',
      };

      const itemBound: A2uiBoundValue = { path: '$row' };
      const indexBound: A2uiBoundValue = { path: '$i' };

      expect(resolver.resolve(itemBound, context)).toBe('custom value');
      expect(resolver.resolve(indexBound, context)).toBe(3);
    });

    it('should fall through to data model if not context variable', () => {
      dataModel.set('/global', 'from model');
      
      const context: ResolveContext = {
        item: 'item value',
        index: 0,
      };
      const bound: A2uiBoundValue = { path: '/global' };

      expect(resolver.resolve(bound, context)).toBe('from model');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // resolveProps()
  // ─────────────────────────────────────────────────────────────────────────

  describe('resolveProps()', () => {
    beforeEach(() => {
      dataModel.set('/title', 'Dynamic Title');
      dataModel.set('/count', 10);
    });

    it('should resolve all bound values in props', () => {
      const props: A2uiComponentProps = {
        text: { literalString: 'Static Text' },
        title: { path: '/title' },
        count: { path: '/count' },
      };

      const resolved = resolver.resolveProps(props);

      expect(resolved).toEqual({
        text: 'Static Text',
        title: 'Dynamic Title',
        count: 10,
      });
    });

    it('should skip children key', () => {
      const props: A2uiComponentProps = {
        text: { literalString: 'Hello' },
        children: { explicitList: ['child1', 'child2'] },
      };

      const resolved = resolver.resolveProps(props);

      expect(resolved).toEqual({ text: 'Hello' });
      expect(resolved.children).toBeUndefined();
    });

    it('should handle raw primitive values', () => {
      const props = {
        staticString: 'raw string',
        staticNumber: 42,
        staticBoolean: true,
      } as A2uiComponentProps;

      const resolved = resolver.resolveProps(props);

      expect(resolved).toEqual({
        staticString: 'raw string',
        staticNumber: 42,
        staticBoolean: true,
      });
    });

    it('should handle mixed bound and raw values', () => {
      const props: A2uiComponentProps = {
        label: { literalString: 'Bound Label' },
        value: 'raw value',
        dynamic: { path: '/title' },
      };

      const resolved = resolver.resolveProps(props);

      expect(resolved).toEqual({
        label: 'Bound Label',
        value: 'raw value',
        dynamic: 'Dynamic Title',
      });
    });

    it('should use context for resolution', () => {
      const context: ResolveContext = {
        item: { name: 'Loop Item' },
        index: 2,
      };
      const props: A2uiComponentProps = {
        itemName: { path: '$item/name' },
        position: { path: '$index' },
      };

      const resolved = resolver.resolveProps(props, context);

      expect(resolved).toEqual({
        itemName: 'Loop Item',
        position: 2,
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // resolveChildren()
  // ─────────────────────────────────────────────────────────────────────────

  describe('resolveChildren()', () => {
    it('should return empty array for undefined children', () => {
      expect(resolver.resolveChildren(undefined)).toEqual([]);
    });

    it('should return explicit list as-is', () => {
      const children: A2uiChildren = {
        explicitList: ['child1', 'child2', 'child3'],
      };

      expect(resolver.resolveChildren(children)).toEqual(['child1', 'child2', 'child3']);
    });

    it('should resolve template children', () => {
      dataModel.set('/items', [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);

      const children: A2uiChildren = {
        template: {
          dataBinding: '/items',
          componentId: 'item-template',
        },
      };

      const resolved = resolver.resolveChildren(children);

      expect(resolved).toEqual([
        'item-template_0',
        'item-template_1',
        'item-template_2',
      ]);
    });

    it('should return empty array for template with non-array data', () => {
      dataModel.set('/notArray', 'string value');

      const children: A2uiChildren = {
        template: {
          dataBinding: '/notArray',
          componentId: 'template',
        },
      };

      expect(resolver.resolveChildren(children)).toEqual([]);
    });

    it('should return empty array for template with missing data', () => {
      const children: A2uiChildren = {
        template: {
          dataBinding: '/missing',
          componentId: 'template',
        },
      };

      expect(resolver.resolveChildren(children)).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // isBoundValue()
  // ─────────────────────────────────────────────────────────────────────────

  describe('isBoundValue()', () => {
    it('should return true for literalString', () => {
      expect(resolver.isBoundValue({ literalString: 'test' })).toBe(true);
    });

    it('should return true for literalNumber', () => {
      expect(resolver.isBoundValue({ literalNumber: 42 })).toBe(true);
    });

    it('should return true for literalBoolean', () => {
      expect(resolver.isBoundValue({ literalBoolean: false })).toBe(true);
    });

    it('should return true for literalArray', () => {
      expect(resolver.isBoundValue({ literalArray: [] })).toBe(true);
    });

    it('should return true for literalMap', () => {
      expect(resolver.isBoundValue({ literalMap: {} })).toBe(true);
    });

    it('should return true for path', () => {
      expect(resolver.isBoundValue({ path: '/test' })).toBe(true);
    });

    it('should return false for null', () => {
      expect(resolver.isBoundValue(null)).toBe(false);
    });

    it('should return false for primitives', () => {
      expect(resolver.isBoundValue('string')).toBe(false);
      expect(resolver.isBoundValue(42)).toBe(false);
      expect(resolver.isBoundValue(true)).toBe(false);
    });

    it('should return false for plain object', () => {
      expect(resolver.isBoundValue({ foo: 'bar' })).toBe(false);
    });

    it('should return false for array', () => {
      expect(resolver.isBoundValue([1, 2, 3])).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Integration Tests
  // ─────────────────────────────────────────────────────────────────────────

  describe('Integration', () => {
    it('should handle realistic A2UI component props', () => {
      // Setup data model
      dataModel.set('/booking/date', '2025-01-15');
      dataModel.set('/booking/time', '14:00');
      dataModel.set('/user/name', 'Alice');

      // Props from A2UI surfaceUpdate
      const props: A2uiComponentProps = {
        title: { literalString: 'Booking Confirmation' },
        subtitle: { path: '/booking/date' },
        description: { 
          literalMap: {
            date: { path: '/booking/date' },
            time: { path: '/booking/time' },
            guest: { path: '/user/name' },
          },
        },
        actions: {
          literalArray: [
            { literalString: 'confirm' },
            { literalString: 'cancel' },
          ],
        },
      };

      const resolved = resolver.resolveProps(props);

      expect(resolved).toEqual({
        title: 'Booking Confirmation',
        subtitle: '2025-01-15',
        description: {
          date: '2025-01-15',
          time: '14:00',
          guest: 'Alice',
        },
        actions: ['confirm', 'cancel'],
      });
    });

    it('should handle list rendering with template', () => {
      dataModel.set('/products', [
        { id: 'p1', name: 'Product A', price: 100 },
        { id: 'p2', name: 'Product B', price: 200 },
      ]);

      // Resolve children to get IDs
      const children: A2uiChildren = {
        template: {
          dataBinding: '/products',
          componentId: 'product-card',
        },
      };

      const childIds = resolver.resolveChildren(children);
      expect(childIds).toEqual(['product-card_0', 'product-card_1']);

      // Then for each item, resolve props with context
      const products = dataModel.get<Array<{ name: string; price: number }>>('/products')!;
      
      const item0Props: A2uiComponentProps = {
        name: { path: '$item/name' },
        price: { path: '$item/price' },
      };

      const resolved0 = resolver.resolveProps(item0Props, {
        item: products[0],
        index: 0,
      });

      expect(resolved0).toEqual({ name: 'Product A', price: 100 });
    });
  });
});


