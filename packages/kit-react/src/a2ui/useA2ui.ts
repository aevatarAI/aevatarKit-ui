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
import { A2UI_CUSTOM_EVENT_NAME } from '@aevatar/kit-types';
import {
  createA2uiEngine,
  type A2uiEngine,
  type A2uiComponentRegistry,
  type RenderTreeNode,
  type DataChangeEvent,
  type A2uiEngineOptions,
} from '@aevatar/kit-a2ui';
import { createEventStream, type EventStream, type StreamStatus } from '@aevatar/kit-protocol';

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
 * 获取特定 Surface 的状态 (事件驱动)
 */
export function useA2uiSurface(
  engine: A2uiEngine<ReactNode>,
  surfaceId?: string
) {
  const [surface, setSurface] = useState(() => engine.getSurface(surfaceId));

  useEffect(() => {
    // 初始化
    setSurface(engine.getSurface(surfaceId));

    // 订阅数据变更来触发 surface 更新
    const unsubscribe = engine.getDataModel().subscribe(() => {
      const newSurface = engine.getSurface(surfaceId);
        setSurface(newSurface);
    });

    return unsubscribe;
  }, [engine, surfaceId]);

  return surface;
}

// ─────────────────────────────────────────────────────────────────────────────
// useA2uiStream Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SSE 流配置选项
 */
export interface UseA2uiStreamOptions extends UseA2uiOptions {
  /** 是否自动连接 (默认 true) */
  autoConnect?: boolean;
  /** 自动重连 (默认 true) */
  autoReconnect?: boolean;
  /** 重连延迟 (ms, 默认 1000) */
  reconnectDelayMs?: number;
  /** 最大重连次数 (默认 10) */
  maxReconnectAttempts?: number;
  /** 自定义 headers (通过 query params 传递) */
  headers?: Record<string, string>;
  /** 连接状态变更回调 */
  onStatusChange?: (status: StreamStatus) => void;
  /** 连接错误回调 */
  onStreamError?: (error: Error) => void;
}

/**
 * useA2uiStream 返回值
 */
export interface UseA2uiStreamResult extends UseA2uiResult {
  /** SSE 连接状态 */
  status: StreamStatus;
  /** 是否已连接 */
  isConnected: boolean;
  /** 是否正在连接 */
  isConnecting: boolean;
  /** 连接错误 */
  error: Error | null;
  /** 手动连接 */
  connect: () => void;
  /** 手动断开 */
  disconnect: () => void;
  /** 强制重连 */
  reconnect: () => void;
}

/**
 * A2UI 流式 Hook - SSE 连接 + A2UI 引擎一体化
 * 
 * 开箱即用地将 SSE 事件流与 A2UI 引擎集成
 * 
 * @param url - SSE 端点 URL (null 时不连接)
 * @param registry - 组件注册表
 * @param options - 配置选项
 * 
 * @example
 * ```tsx
 * const registry = createStandardRegistry();
 * 
 * function App() {
 *   const { 
 *     tree, 
 *     status, 
 *     isConnected,
 *     dispatchUserAction 
 *   } = useA2uiStream('/api/agent/events', registry, {
 *     onUserAction: (action) => {
 *       // 发送用户操作到服务端
 *       fetch('/api/agent/action', {
 *         method: 'POST',
 *         body: JSON.stringify({ userAction: action }),
 *       });
 *     },
 *   });
 * 
 *   if (!isConnected) return <div>连接中...</div>;
 *   if (!tree) return <div>等待 Agent 响应...</div>;
 * 
 *   return <A2uiRenderer tree={tree} registry={registry} />;
 * }
 * ```
 */
export function useA2uiStream(
  url: string | null,
  registry: A2uiComponentRegistry<ReactNode>,
  options: UseA2uiStreamOptions = {}
): UseA2uiStreamResult {
  const {
    // A2UI options
    surfaceId = 'default',
    onDataChange,
    onUserAction,
    onError,
    // Stream options
    autoConnect = true,
    autoReconnect = true,
    reconnectDelayMs = 1000,
    maxReconnectAttempts = 10,
    headers,
    onStatusChange,
    onStreamError,
  } = options;

  // A2UI 核心 Hook
  const a2ui = useA2ui(registry, {
    surfaceId,
    onDataChange,
    onUserAction,
    onError,
  });

  // Stream 状态
  const [status, setStatus] = useState<StreamStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  
  // Stream 引用
  const streamRef = useRef<EventStream | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Refs for callbacks
  const onStatusChangeRef = useRef(onStatusChange);
  const onStreamErrorRef = useRef(onStreamError);
  
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
    onStreamErrorRef.current = onStreamError;
  }, [onStatusChange, onStreamError]);

  // ─────────────────────────────────────────────────────────────────────────
  // Stream Management
  // ─────────────────────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    if (!url) return;
    
    // 清理旧连接
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.disconnect();
    }

    setError(null);

    // 创建新的事件流
    const stream = createEventStream({
      url,
      autoReconnect,
      reconnectDelayMs,
      maxReconnectAttempts,
      headers,
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
        onStatusChangeRef.current?.(newStatus);
      },
      onError: (err) => {
        setError(err);
        onStreamErrorRef.current?.(err);
      },
    });

    streamRef.current = stream;

    // 订阅 A2UI 事件
    const unsubscribeA2ui = stream.onCustom(A2UI_CUSTOM_EVENT_NAME, (event) => {
      a2ui.processEvent(event);
    });

    // 也订阅所有 CUSTOM 事件作为后备 (兼容不同的服务端实现)
    const unsubscribeCustom = stream.on('CUSTOM', (event) => {
      // 只处理 A2UI 相关的事件
      if (event.name === A2UI_CUSTOM_EVENT_NAME) {
        a2ui.processEvent(event);
      }
    });

    unsubscribeRef.current = () => {
      unsubscribeA2ui();
      unsubscribeCustom();
    };

    // 连接
    stream.connect();
  }, [url, autoReconnect, reconnectDelayMs, maxReconnectAttempts, headers, a2ui]);

  const disconnect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.disconnect();
      streamRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  // 自动连接
  useEffect(() => {
    if (autoConnect && url) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, autoConnect]); // 注意：不包含 connect/disconnect 避免循环

  // URL 变更时重连
  useEffect(() => {
    if (url && streamRef.current && status === 'connected') {
      reconnect();
    }
  }, [url]);

  // ─────────────────────────────────────────────────────────────────────────
  // Computed Values
  // ─────────────────────────────────────────────────────────────────────────

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || status === 'reconnecting';

  return {
    // A2UI results
    ...a2ui,
    // Stream results
    status,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    reconnect,
  };
}


