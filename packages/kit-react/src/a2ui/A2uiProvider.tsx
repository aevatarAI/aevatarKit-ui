/**
 * ============================================================================
 * A2UI Provider
 * ============================================================================
 * 
 * A2UI Context Provider - 为子组件提供 A2UI 引擎和状态
 * 
 * ============================================================================
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { CustomEvent, A2uiUserAction } from '@aevatar/kit-types';
import type { A2uiEngine, A2uiComponentRegistry, RenderTreeNode, DataChangeEvent } from '@aevatar/kit-a2ui';
import { useA2ui } from './useA2ui';
import { createStandardRegistry } from './createStandardRegistry';

// ─────────────────────────────────────────────────────────────────────────────
// Context Types
// ─────────────────────────────────────────────────────────────────────────────

export interface A2uiContextValue {
  /** 渲染树 */
  tree: RenderTreeNode<ReactNode> | null;
  /** A2UI 引擎 */
  engine: A2uiEngine<ReactNode>;
  /** 组件注册表 */
  registry: A2uiComponentRegistry<ReactNode>;
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
// Context
// ─────────────────────────────────────────────────────────────────────────────

const A2uiContext = createContext<A2uiContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider Props
// ─────────────────────────────────────────────────────────────────────────────

export interface A2uiProviderProps {
  /** 子组件 */
  children: ReactNode;
  /** 组件注册表 (可选，默认使用标准注册表) */
  registry?: A2uiComponentRegistry<ReactNode>;
  /** Surface ID */
  surfaceId?: string;
  /** 数据变更回调 */
  onDataChange?: (event: DataChangeEvent) => void;
  /** 用户操作回调 */
  onUserAction?: (action: A2uiUserAction) => void;
  /** 错误回调 */
  onError?: (error: Error, context?: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A2UI Provider
 * 
 * @example
 * ```tsx
 * function App() {
 *   const handleUserAction = useCallback((action) => {
 *     // 发送给服务端
 *     sendToServer(action);
 *   }, []);
 * 
 *   return (
 *     <A2uiProvider onUserAction={handleUserAction}>
 *       <MyComponent />
 *     </A2uiProvider>
 *   );
 * }
 * 
 * function MyComponent() {
 *   const { tree, processEvent } = useA2uiContext();
 *   // ...
 * }
 * ```
 */
export function A2uiProvider({
  children,
  registry: customRegistry,
  surfaceId = 'default',
  onDataChange,
  onUserAction,
  onError,
}: A2uiProviderProps): ReactNode {
  // 使用自定义注册表或创建标准注册表
  const registry = useMemo(
    () => customRegistry || createStandardRegistry(),
    [customRegistry]
  );

  // 使用 A2UI Hook
  const {
    tree,
    engine,
    processEvent,
    updateData,
    dispatchUserAction,
    isRendering,
  } = useA2ui(registry, {
    surfaceId,
    onDataChange,
    onUserAction,
    onError,
  });

  // Context 值
  const contextValue = useMemo<A2uiContextValue>(
    () => ({
      tree,
      engine,
      registry,
      processEvent,
      updateData,
      dispatchUserAction,
      surfaceId,
      isRendering,
    }),
    [tree, engine, registry, processEvent, updateData, dispatchUserAction, surfaceId, isRendering]
  );

  return (
    <A2uiContext.Provider value={contextValue}>
      {children}
    </A2uiContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 获取 A2UI Context
 */
export function useA2uiContext(): A2uiContextValue {
  const context = useContext(A2uiContext);
  
  if (!context) {
    throw new Error('useA2uiContext must be used within an A2uiProvider');
  }
  
  return context;
}

/**
 * 安全地获取 A2UI Context (可能为 null)
 */
export function useA2uiContextSafe(): A2uiContextValue | null {
  return useContext(A2uiContext);
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 获取当前渲染树
 */
export function useA2uiTree(): RenderTreeNode<ReactNode> | null {
  const { tree } = useA2uiContext();
  return tree;
}

/**
 * 获取 A2UI 引擎
 */
export function useA2uiEngine(): A2uiEngine<ReactNode> {
  const { engine } = useA2uiContext();
  return engine;
}

/**
 * 获取组件注册表
 */
export function useA2uiRegistry(): A2uiComponentRegistry<ReactNode> {
  const { registry } = useA2uiContext();
  return registry;
}

/**
 * 获取事件处理函数
 */
export function useA2uiEventProcessor(): (event: CustomEvent) => void {
  const { processEvent } = useA2uiContext();
  return processEvent;
}

/**
 * 获取数据更新函数
 */
export function useA2uiDataUpdater(): (path: string, value: unknown) => void {
  const { updateData } = useA2uiContext();
  return updateData;
}

/**
 * 获取用户操作分发函数
 */
export function useA2uiActionDispatcher(): (action: A2uiUserAction) => void {
  const { dispatchUserAction } = useA2uiContext();
  return dispatchUserAction;
}


