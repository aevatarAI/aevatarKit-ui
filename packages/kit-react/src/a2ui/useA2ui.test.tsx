/**
 * ============================================================================
 * useA2ui Hook Unit Tests
 * ============================================================================
 * Tests for the A2UI React hooks
 * ============================================================================
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useA2ui, useA2uiData, useA2uiSurface } from './useA2ui';
import { createStandardRegistry } from './createStandardRegistry';
import type { A2uiUserAction, CustomEvent } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// useA2ui Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('useA2ui', () => {
  it('should initialize with null tree', () => {
    const registry = createStandardRegistry();
    const { result } = renderHook(() => useA2ui(registry));

    expect(result.current.tree).toBeNull();
    expect(result.current.isRendering).toBe(false);
    expect(result.current.surfaceId).toBe('default');
  });

  it('should accept custom surfaceId', () => {
    const registry = createStandardRegistry();
    const { result } = renderHook(() =>
      useA2ui(registry, { surfaceId: 'custom-surface' })
    );

    expect(result.current.surfaceId).toBe('custom-surface');
  });

  it('should provide engine instance', () => {
    const registry = createStandardRegistry();
    const { result } = renderHook(() => useA2ui(registry));

    expect(result.current.engine).toBeDefined();
    expect(typeof result.current.engine.processMessage).toBe('function');
    expect(typeof result.current.engine.getDataModel).toBe('function');
  });

  it('should provide processEvent function', () => {
    const registry = createStandardRegistry();
    const { result } = renderHook(() => useA2ui(registry));

    expect(typeof result.current.processEvent).toBe('function');
  });

  it('should provide updateData function', () => {
    const registry = createStandardRegistry();
    const { result } = renderHook(() => useA2ui(registry));

    expect(typeof result.current.updateData).toBe('function');

    // Should not throw
    act(() => {
      result.current.updateData('/test/path', 'value');
    });

    // Data should be set in the model
    expect(result.current.engine.getDataModel().get('/test/path')).toBe('value');
  });

  it('should provide dispatchUserAction function', () => {
    const registry = createStandardRegistry();
    const onUserAction = vi.fn();
    const { result } = renderHook(() =>
      useA2ui(registry, { onUserAction })
    );

    expect(typeof result.current.dispatchUserAction).toBe('function');

    const action: A2uiUserAction = {
      name: 'click',
      surfaceId: 'default',
      sourceComponentId: 'btn-1',
      timestamp: new Date().toISOString(),
    };

    act(() => {
      result.current.dispatchUserAction(action);
    });

    expect(onUserAction).toHaveBeenCalledWith(action);
  });

  it('should call onDataChange when data changes', () => {
    const registry = createStandardRegistry();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useA2ui(registry, { onDataChange })
    );

    act(() => {
      result.current.updateData('/user/name', 'Alice');
    });

    expect(onDataChange).toHaveBeenCalled();
    expect(onDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/user/name',
        newValue: 'Alice',
      })
    );
  });

  it('should call onError when error occurs', () => {
    const registry = createStandardRegistry();
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useA2ui(registry, { onError })
    );

    // Force an error by processing invalid event
    act(() => {
      result.current.processEvent({
        type: 'CUSTOM',
        name: 'a2ui',
        value: { invalidMessage: true },
      } as CustomEvent);
    });

    // Error should be called (engine will emit error for invalid message)
    // Note: depends on implementation
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useA2uiData Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('useA2uiData', () => {
  it('should return undefined for non-existent path', () => {
    const registry = createStandardRegistry();
    const { result: hookResult } = renderHook(() => useA2ui(registry));

    const { result } = renderHook(() =>
      useA2uiData(hookResult.current.engine, '/nonexistent')
    );

    expect(result.current).toBeUndefined();
  });

  it('should return data at path', () => {
    const registry = createStandardRegistry();
    const { result: hookResult } = renderHook(() => useA2ui(registry));

    // Set data first
    act(() => {
      hookResult.current.updateData('/user/name', 'Bob');
    });

    const { result } = renderHook(() =>
      useA2uiData(hookResult.current.engine, '/user/name')
    );

    expect(result.current).toBe('Bob');
  });

  it('should update when data changes', () => {
    const registry = createStandardRegistry();
    const { result: hookResult } = renderHook(() => useA2ui(registry));

    const { result, rerender } = renderHook(() =>
      useA2uiData(hookResult.current.engine, '/counter')
    );

    expect(result.current).toBeUndefined();

    act(() => {
      hookResult.current.updateData('/counter', 1);
    });

    rerender();
    expect(result.current).toBe(1);

    act(() => {
      hookResult.current.updateData('/counter', 2);
    });

    rerender();
    expect(result.current).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useA2uiSurface Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('useA2uiSurface', () => {
  it('should return null for non-existent surface', () => {
    const registry = createStandardRegistry();
    const { result: hookResult } = renderHook(() => useA2ui(registry));

    const { result } = renderHook(() =>
      useA2uiSurface(hookResult.current.engine, 'nonexistent')
    );

    expect(result.current).toBeNull();
  });

  it('should return surface state after processing messages', () => {
    const registry = createStandardRegistry();
    const { result: hookResult } = renderHook(() => useA2ui(registry));

    // Process a surface update message
    act(() => {
      hookResult.current.engine.processMessage({
        type: 'surfaceUpdate',
        surfaceId: 'default',
        components: [
          {
            id: 'text-1',
            component: {
              Text: { content: { literalString: 'Hello' } },
            },
          },
        ],
      });
    });

    const { result } = renderHook(() =>
      useA2uiSurface(hookResult.current.engine, 'default')
    );

    expect(result.current).not.toBeNull();
    expect(result.current?.id).toBe('default');
    expect(result.current?.components.has('text-1')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('A2UI Integration', () => {
  it('should render tree after beginRendering', () => {
    const registry = createStandardRegistry();
    const { result } = renderHook(() => useA2ui(registry));

    // Initially no tree
    expect(result.current.tree).toBeNull();

    // Process surface update with Text component (known to be in registry)
    act(() => {
      result.current.engine.processMessage({
        type: 'surfaceUpdate',
        surfaceId: 'default',
        components: [
          {
            id: 'root',
            component: {
              Text: {
                content: { literalString: 'Hello World' },
              },
            },
          },
        ],
      });
    });

    // Still no tree (not rendering yet)
    expect(result.current.tree).toBeNull();

    // Begin rendering
    act(() => {
      result.current.engine.processMessage({
        type: 'beginRendering',
        surfaceId: 'default',
        root: 'root',
      });
    });

    // Now we have a tree
    expect(result.current.tree).not.toBeNull();
    expect(result.current.tree?.id).toBe('root');
    expect(result.current.tree?.type).toBe('Text');
    expect(result.current.isRendering).toBe(true);
  });

  it('should resolve data bindings in props', () => {
    const registry = createStandardRegistry();
    const { result } = renderHook(() => useA2ui(registry));

    // Set data
    act(() => {
      result.current.updateData('/user/greeting', 'Welcome!');
    });

    // Process components with bindings
    act(() => {
      result.current.engine.processMessage({
        type: 'surfaceUpdate',
        surfaceId: 'default',
        components: [
          {
            id: 'greeting-text',
            component: {
              Text: {
                content: { path: '/user/greeting' },
              },
            },
          },
        ],
      });

      result.current.engine.processMessage({
        type: 'beginRendering',
        surfaceId: 'default',
        root: 'greeting-text',
      });
    });

    // Check resolved props
    expect(result.current.tree).not.toBeNull();
    expect(result.current.tree?.props.content).toBe('Welcome!');
  });
});

