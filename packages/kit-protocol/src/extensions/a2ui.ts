/**
 * ============================================================================
 * A2UI Protocol Extension for AG-UI
 * ============================================================================
 * 
 * 将 A2UI 消息集成到 AG-UI 的 CUSTOM 事件流中
 * 提供解析、验证和路由功能
 * 
 * ============================================================================
 */

import type {
  CustomEvent,
  A2uiServerMessage,
  A2uiSurfaceUpdate,
  A2uiDataModelUpdate,
  A2uiBeginRendering,
  A2uiDeleteSurface,
  A2uiCustomEventValue,
  A2uiUserAction,
} from '@aevatar/kit-types';

import {
  A2UI_CUSTOM_EVENT_NAME,
  isA2uiSurfaceUpdate,
  isA2uiDataModelUpdate,
  isA2uiBeginRendering,
  isA2uiDeleteSurface,
} from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 检查 CustomEvent 是否为 A2UI 消息
 */
export function isA2uiEvent(event: CustomEvent): boolean {
  return event.name === A2UI_CUSTOM_EVENT_NAME;
}

/**
 * 从 CustomEvent 中提取 A2UI 消息
 */
export function extractA2uiMessage(event: CustomEvent): A2uiServerMessage | null {
  if (!isA2uiEvent(event)) {
    return null;
  }

  const value = event.value as A2uiCustomEventValue | undefined;
  if (!value?.message) {
    return null;
  }

  return value.message;
}

/**
 * 获取 A2UI 消息的元数据
 */
export function extractA2uiMetadata(event: CustomEvent): A2uiCustomEventValue['metadata'] | undefined {
  if (!isA2uiEvent(event)) {
    return undefined;
  }

  const value = event.value as A2uiCustomEventValue | undefined;
  return value?.metadata;
}

// ─────────────────────────────────────────────────────────────────────────────
// A2UI Event Router
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A2UI 事件处理器配置
 */
export interface A2uiEventHandlers {
  onSurfaceUpdate?: (msg: A2uiSurfaceUpdate, surfaceId: string) => void;
  onDataModelUpdate?: (msg: A2uiDataModelUpdate, surfaceId: string) => void;
  onBeginRendering?: (msg: A2uiBeginRendering, surfaceId: string) => void;
  onDeleteSurface?: (msg: A2uiDeleteSurface) => void;
  onError?: (error: Error, rawEvent?: CustomEvent) => void;
}

/**
 * 创建 A2UI 事件路由器
 * 将 AG-UI CustomEvent 路由到具体的 A2UI 处理器
 */
export function createA2uiEventRouter(handlers: A2uiEventHandlers) {
  const DEFAULT_SURFACE_ID = 'default';

  return (event: CustomEvent) => {
    try {
      const message = extractA2uiMessage(event);
      if (!message) {
        return; // Not an A2UI event, ignore
      }

      const surfaceId = message.surfaceId || DEFAULT_SURFACE_ID;

      if (isA2uiSurfaceUpdate(message)) {
        handlers.onSurfaceUpdate?.(message, surfaceId);
      } else if (isA2uiDataModelUpdate(message)) {
        handlers.onDataModelUpdate?.(message, surfaceId);
      } else if (isA2uiBeginRendering(message)) {
        handlers.onBeginRendering?.(message, surfaceId);
      } else if (isA2uiDeleteSurface(message)) {
        handlers.onDeleteSurface?.(message);
      }
    } catch (error) {
      handlers.onError?.(error instanceof Error ? error : new Error(String(error)), event);
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// A2UI Message Builder (用于测试和模拟)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 创建 A2UI CustomEvent 包装
 */
export function createA2uiCustomEvent(
  message: A2uiServerMessage,
  metadata?: A2uiCustomEventValue['metadata']
): CustomEvent {
  return {
    type: 'CUSTOM',
    name: A2UI_CUSTOM_EVENT_NAME,
    value: {
      message,
      metadata,
    } satisfies A2uiCustomEventValue,
  };
}

/**
 * 创建 Surface Update 事件
 */
export function createSurfaceUpdateEvent(
  components: A2uiSurfaceUpdate['components'],
  surfaceId?: string
): CustomEvent {
  return createA2uiCustomEvent({
    type: 'surfaceUpdate',
    surfaceId,
    components,
  });
}

/**
 * 创建 Data Model Update 事件
 */
export function createDataModelUpdateEvent(
  contents: A2uiDataModelUpdate['contents'],
  surfaceId?: string,
  path?: string
): CustomEvent {
  return createA2uiCustomEvent({
    type: 'dataModelUpdate',
    surfaceId,
    path,
    contents,
  });
}

/**
 * 创建 Begin Rendering 事件
 */
export function createBeginRenderingEvent(
  root: string,
  surfaceId?: string,
  catalogId?: string
): CustomEvent {
  return createA2uiCustomEvent({
    type: 'beginRendering',
    surfaceId,
    root,
    catalogId,
  });
}

/**
 * 创建 Delete Surface 事件
 */
export function createDeleteSurfaceEvent(surfaceId: string): CustomEvent {
  return createA2uiCustomEvent({
    type: 'deleteSurface',
    surfaceId,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// User Action Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 创建用户操作对象
 */
export function createUserAction(
  name: string,
  surfaceId: string,
  sourceComponentId: string,
  context: Record<string, unknown> = {}
): A2uiUserAction {
  return {
    name,
    surfaceId,
    sourceComponentId,
    timestamp: new Date().toISOString(),
    context,
  };
}

/**
 * 创建点击操作
 */
export function createClickAction(
  surfaceId: string,
  componentId: string,
  context?: Record<string, unknown>
): A2uiUserAction {
  return createUserAction('click', surfaceId, componentId, context);
}

/**
 * 创建值变更操作
 */
export function createChangeAction(
  surfaceId: string,
  componentId: string,
  newValue: unknown
): A2uiUserAction {
  return createUserAction('change', surfaceId, componentId, { value: newValue });
}

/**
 * 创建表单提交操作
 */
export function createSubmitAction(
  surfaceId: string,
  componentId: string,
  formData: Record<string, unknown>
): A2uiUserAction {
  return createUserAction('submit', surfaceId, componentId, { formData });
}


