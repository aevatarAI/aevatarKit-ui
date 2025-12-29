/**
 * ============================================================================
 * useA2ui Hook
 * ============================================================================
 * 
 * A2UI 核心 Hook - 管理 A2UI 引擎和 Surface 状态
 * 
 * ============================================================================
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { CustomEvent, A2uiUserAction } from '@aevatar/kit-types';
import {
  createA2uiEngine,
  type A2uiEngine,
  type A2uiComponentRegistry,
  type RenderTreeNode,
  type DataChangeEvent,
  type A2uiEngineOptions,
} from '@aevatar/kit-a2ui';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UseA2uiOptions {
  /** 默认 Surface ID */
  surfaceId?: string;
  /** 数据变更回调 */
  onDataChange?: (event: DataChangeEvent) => void;
  /** 用户操作回调 */
  onUserAction?: (action: A2uiUserAction) => void;
  /** 错误回调 */
  onError?: (error: Error, context?: string) => void;
}

export interface UseA2uiResult {
  /** 渲染树 */
  tree: RenderTreeNode<ReactNode> | null;
  /** A2UI 引擎实例 */
  engine: A2uiEngine<ReactNode>;
  /** 处理 AG-UI CustomEvent */
  processEvent: (event: CustomEvent) => void;
  /** 更新数据 */
  updateData: (path: string, value: unknown) => void;
  /** 发送用户操作 */
  dispatchUserAction: (action: A2uiUserAction) => void;
  /** Surface ID */
  surfaceId: string;
  /** 是否正在渲染 */
  isRendering: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A2UI 核心 Hook
 * 
 * @example
 * ```tsx
 * const registry = createStandardRegistry();
 * const { tree, processEvent, dispatchUserAction } = useA2ui(registry, {
 *   onUserAction: (action) => sendToServer(action),
 * });
 * 
 * // 处理服务端事件
 * useEventStream({
 *   onCustom: processEvent,
 * });
 * 
 * // 渲染 UI
 * return <A2uiRenderer tree={tree} registry={registry} />;
 * ```
 */
export function useA2ui(
  registry: A2uiComponentRegistry<ReactNode>,
  options: UseA2uiOptions = {}
): UseA2uiResult {
  const {
    surfaceId = 'default',
    onDataChange,
    onUserAction,
    onError,
  } = options;

  // State
  const [tree, setTree] = useState<RenderTreeNode<ReactNode> | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Refs for callbacks (avoid recreation)
  const onDataChangeRef = useRef(onDataChange);
  const onUserActionRef = useRef(onUserAction);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onDataChangeRef.current = onDataChange;
    onUserActionRef.current = onUserAction;
    onErrorRef.current = onError;
  }, [onDataChange, onUserAction, onError]);

  // Create engine
  const engine = useMemo(() => {
    const engineOptions: A2uiEngineOptions<ReactNode> = {
      defaultSurfaceId: surfaceId,
      events: {
        onRenderTreeUpdated: (id, newTree) => {
          if (id === surfaceId) {
            setTree(newTree);
            setIsRendering(newTree !== null);
          }
        },
        onDataChanged: (event) => {
          onDataChangeRef.current?.(event);
        },
        onUserAction: (action) => {
          onUserActionRef.current?.(action);
        },
        onError: (error, context) => {
          onErrorRef.current?.(error, context);
        },
      },
    };

    return createA2uiEngine(registry, engineOptions);
  }, [registry, surfaceId]);

  // Process event
  const processEvent = useCallback((event: CustomEvent) => {
    engine.processEvent(event);
  }, [engine]);

  // Update data
  const updateData = useCallback((path: string, value: unknown) => {
    engine.updateData(path, value);
  }, [engine]);

  // Dispatch user action
  const dispatchUserAction = useCallback((action: A2uiUserAction) => {
    engine.dispatchUserAction(action);
  }, [engine]);

  return {
    tree,
    engine,
    processEvent,
    updateData,
    dispatchUserAction,
    surfaceId,
    isRendering,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useA2uiData Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 订阅 A2UI 数据模型中的特定路径
 */
export function useA2uiData<T = unknown>(
  engine: A2uiEngine<ReactNode>,
  path: string
): T | undefined {
  const [value, setValue] = useState<T | undefined>(() => 
    engine.getDataModel().get<T>(path)
  );

  useEffect(() => {
    // 获取初始值
    setValue(engine.getDataModel().get<T>(path));

    // 订阅变更
    const unsubscribe = engine.getDataModel().subscribeToPath(path, (event) => {
      setValue(event.newValue as T | undefined);
    });

    return unsubscribe;
  }, [engine, path]);

  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// useA2uiSurface Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 获取特定 Surface 的状态
 */
export function useA2uiSurface(
  engine: A2uiEngine<ReactNode>,
  surfaceId?: string
) {
  const [surface, setSurface] = useState(() => engine.getSurface(surfaceId));

  useEffect(() => {
    // 简单轮询检查 surface 状态变化
    // 在生产环境中可以改为事件驱动
    const interval = setInterval(() => {
      const newSurface = engine.getSurface(surfaceId);
      if (newSurface !== surface) {
        setSurface(newSurface);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [engine, surfaceId, surface]);

  return surface;
}


