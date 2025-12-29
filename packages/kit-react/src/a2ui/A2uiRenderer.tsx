/**
 * ============================================================================
 * A2UI React Renderer
 * ============================================================================
 * 
 * A2UI 渲染树到 React 元素的转换器
 * 
 * ============================================================================
 */

import React, { useCallback } from 'react';
import type { ReactNode } from 'react';
import type { RenderTreeNode, A2uiComponentRegistry, ResolvedValue } from '@aevatar/kit-a2ui';
import type { A2uiUserAction } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface A2uiRendererProps {
  /** 渲染树 */
  tree: RenderTreeNode<ReactNode> | null;
  /** 组件注册表 */
  registry: A2uiComponentRegistry<ReactNode>;
  /** 用户操作回调 */
  onUserAction?: (action: A2uiUserAction) => void;
  /** Surface ID */
  surfaceId?: string;
  /** 包装器类名 */
  className?: string;
  /** 错误渲染器 */
  renderError?: (error: Error, componentId: string) => ReactNode;
  /** 加载中渲染器 */
  renderLoading?: () => ReactNode;
}

export interface A2uiActionContext {
  surfaceId: string;
  componentId: string;
  dispatchAction: (name: string, context?: Record<string, unknown>) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Action Context
// ─────────────────────────────────────────────────────────────────────────────

export const A2uiActionContext = React.createContext<A2uiActionContext | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Renderer Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A2UI React 渲染器
 */
export function A2uiRenderer({
  tree,
  registry,
  onUserAction,
  surfaceId = 'default',
  className,
  renderError,
  renderLoading,
}: A2uiRendererProps): ReactNode {
  // 默认错误渲染
  const defaultRenderError = useCallback((error: Error, componentId: string) => (
    <div className="a2ui-error" data-component-id={componentId}>
      <span>Error: {error.message}</span>
    </div>
  ), []);

  // 默认加载渲染
  const defaultRenderLoading = useCallback(() => (
    <div className="a2ui-loading">Loading...</div>
  ), []);

  // 创建操作分发器
  const createActionDispatcher = useCallback(
    (componentId: string) => (name: string, context: Record<string, unknown> = {}) => {
      if (onUserAction) {
        onUserAction({
          name,
          surfaceId,
          sourceComponentId: componentId,
          timestamp: new Date().toISOString(),
          context,
        });
      }
    },
    [onUserAction, surfaceId]
  );

  // 递归渲染节点
  const renderNode = useCallback(
    (node: RenderTreeNode<ReactNode>): ReactNode => {
      const renderer = registry.getRenderer(node.type);
      
      if (!renderer) {
        const errorFn = renderError || defaultRenderError;
        return errorFn(new Error(`Unknown component: ${node.type}`), node.id);
      }

      try {
        // 准备 props
        const props = convertPropsForReact(node.props);
        
        // 递归渲染子节点
        const children = node.children.map(child => renderNode(child));
        
        // 创建操作上下文
        const actionContext: A2uiActionContext = {
          surfaceId,
          componentId: node.id,
          dispatchAction: createActionDispatcher(node.id),
        };

        // 渲染组件
        const element = renderer({
          ...props,
          children: children.length > 0 ? children : undefined,
          __a2uiContext: actionContext,
        });

        return (
          <A2uiActionContext.Provider key={node.id} value={actionContext}>
            {element}
          </A2uiActionContext.Provider>
        );
      } catch (error) {
        const errorFn = renderError || defaultRenderError;
        return errorFn(error instanceof Error ? error : new Error(String(error)), node.id);
      }
    },
    [registry, surfaceId, createActionDispatcher, renderError, defaultRenderError]
  );

  // 渲染
  if (!tree) {
    const loadingFn = renderLoading || defaultRenderLoading;
    return loadingFn();
  }

  return (
    <div className={`a2ui-surface ${className || ''}`.trim()} data-surface-id={surfaceId}>
      {renderNode(tree)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 转换属性为 React 兼容格式
 */
function convertPropsForReact(props: Record<string, ResolvedValue>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(props)) {
    // 转换常见的 A2UI 属性名到 React 属性名
    const reactKey = convertPropName(key);
    result[reactKey] = value;
  }
  
  return result;
}

/**
 * 转换属性名
 */
function convertPropName(name: string): string {
  // A2UI 使用 snake_case，React 使用 camelCase
  const camelCase = name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  
  // 特殊属性映射
  const propMap: Record<string, string> = {
    'class': 'className',
    'for': 'htmlFor',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
    'maxlength': 'maxLength',
    'minlength': 'minLength',
    'colspan': 'colSpan',
    'rowspan': 'rowSpan',
  };
  
  return propMap[camelCase] || camelCase;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook for Action Context
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 获取 A2UI 操作上下文
 */
export function useA2uiAction(): A2uiActionContext | null {
  return React.useContext(A2uiActionContext);
}

/**
 * 创建点击处理器
 */
export function useA2uiClickHandler(
  handler?: () => void,
  context?: Record<string, unknown>
): () => void {
  const actionCtx = useA2uiAction();
  
  return useCallback(() => {
    handler?.();
    actionCtx?.dispatchAction('click', context);
  }, [handler, actionCtx, context]);
}

/**
 * 创建值变更处理器
 */
export function useA2uiChangeHandler(
  handler?: (value: unknown) => void
): (value: unknown) => void {
  const actionCtx = useA2uiAction();
  
  return useCallback((value: unknown) => {
    handler?.(value);
    actionCtx?.dispatchAction('change', { value });
  }, [handler, actionCtx]);
}


