/**
 * ============================================================================
 * A2UI Engine
 * ============================================================================
 * 
 * A2UI 核心引擎 - 协调数据模型、组件注册表和绑定解析器
 * 
 * 职责:
 * - 管理 Surface 生命周期
 * - 处理服务端消息
 * - 协调组件树渲染
 * - 管理用户操作
 * 
 * ============================================================================
 */

import type {
  A2uiServerMessage,
  A2uiSurfaceUpdate,
  A2uiDataModelUpdate,
  A2uiBeginRendering,
  A2uiDeleteSurface,
  A2uiComponentInstance,
  A2uiUserAction,
  CustomEvent,
} from '@aevatar/kit-types';

import {
  isA2uiSurfaceUpdate,
  isA2uiDataModelUpdate,
  isA2uiBeginRendering,
  isA2uiDeleteSurface,
} from '@aevatar/kit-types';

import { createA2uiEventRouter } from '@aevatar/kit-protocol';

import { A2uiDataModel, createDataModel, type DataChangeEvent } from './data-model';
import { A2uiComponentRegistry } from './component-registry';
import { A2uiBindingResolver, createBindingResolver, type ResolveContext, type ResolvedValue } from './binding-resolver';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Surface 状态
 */
export interface SurfaceState {
  /** Surface ID */
  id: string;
  /** 根组件 ID */
  rootId: string | null;
  /** 组件实例映射 */
  components: Map<string, A2uiComponentInstance>;
  /** 使用的目录 ID */
  catalogId?: string;
  /** 是否已开始渲染 */
  isRendering: boolean;
}

/**
 * 渲染树节点
 */
export interface RenderTreeNode<R = unknown> {
  /** 组件 ID */
  id: string;
  /** 组件类型 */
  type: string;
  /** 解析后的属性 */
  props: Record<string, ResolvedValue>;
  /** 子节点 */
  children: RenderTreeNode<R>[];
  /** 渲染结果 (由渲染器填充) */
  rendered?: R;
}

/**
 * 引擎事件
 */
export interface A2uiEngineEvents<R = unknown> {
  onSurfaceCreated?: (surfaceId: string) => void;
  onSurfaceDeleted?: (surfaceId: string) => void;
  onRenderTreeUpdated?: (surfaceId: string, tree: RenderTreeNode<R> | null) => void;
  onDataChanged?: (event: DataChangeEvent) => void;
  onUserAction?: (action: A2uiUserAction) => void;
  onError?: (error: Error, context?: string) => void;
}

/**
 * 引擎配置
 */
export interface A2uiEngineOptions<R = unknown> {
  /** 事件处理器 */
  events?: A2uiEngineEvents<R>;
  /** 默认 Surface ID */
  defaultSurfaceId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// A2UI Engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A2UI 核心引擎
 */
export class A2uiEngine<R = unknown> {
  private surfaces: Map<string, SurfaceState> = new Map();
  private dataModel: A2uiDataModel;
  private registry: A2uiComponentRegistry<R>;
  private resolver: A2uiBindingResolver;
  private options: A2uiEngineOptions<R>;
  private eventRouter: (event: CustomEvent) => void;
  private userActionCallback?: (action: A2uiUserAction) => void;

  constructor(
    registry: A2uiComponentRegistry<R>,
    options: A2uiEngineOptions<R> = {}
  ) {
    this.registry = registry;
    this.options = {
      defaultSurfaceId: 'default',
      ...options,
    };
    
    this.dataModel = createDataModel();
    this.resolver = createBindingResolver(this.dataModel);
    
    // 订阅数据变更
    this.dataModel.subscribe((event) => {
      this.options.events?.onDataChanged?.(event);
      this.rebuildAllSurfaces();
    });
    
    // 创建事件路由器
    this.eventRouter = createA2uiEventRouter({
      onSurfaceUpdate: (msg, surfaceId) => this.handleSurfaceUpdate(msg, surfaceId),
      onDataModelUpdate: (msg, surfaceId) => this.handleDataModelUpdate(msg, surfaceId),
      onBeginRendering: (msg, surfaceId) => this.handleBeginRendering(msg, surfaceId),
      onDeleteSurface: (msg) => this.handleDeleteSurface(msg),
      onError: (error, _event) => this.options.events?.onError?.(error, 'eventRouter'),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 处理 AG-UI CustomEvent
   */
  processEvent(event: CustomEvent): void {
    this.eventRouter(event);
  }

  /**
   * 直接处理 A2UI 消息
   */
  processMessage(message: A2uiServerMessage): void {
    const surfaceId = message.surfaceId || this.options.defaultSurfaceId!;
    
    if (isA2uiSurfaceUpdate(message)) {
      this.handleSurfaceUpdate(message, surfaceId);
    } else if (isA2uiDataModelUpdate(message)) {
      this.handleDataModelUpdate(message, surfaceId);
    } else if (isA2uiBeginRendering(message)) {
      this.handleBeginRendering(message, surfaceId);
    } else if (isA2uiDeleteSurface(message)) {
      this.handleDeleteSurface(message);
    }
  }

  /**
   * 获取指定 Surface 的渲染树
   */
  getRenderTree(surfaceId?: string): RenderTreeNode<R> | null {
    const id = surfaceId || this.options.defaultSurfaceId!;
    const surface = this.surfaces.get(id);
    
    if (!surface || !surface.isRendering || !surface.rootId) {
      return null;
    }
    
    return this.buildRenderTree(surface, surface.rootId);
  }

  /**
   * 获取 Surface 状态
   */
  getSurface(surfaceId?: string): SurfaceState | null {
    const id = surfaceId || this.options.defaultSurfaceId!;
    return this.surfaces.get(id) ?? null;
  }

  /**
   * 获取所有 Surface ID
   */
  getSurfaceIds(): string[] {
    return Array.from(this.surfaces.keys());
  }

  /**
   * 获取数据模型
   */
  getDataModel(): A2uiDataModel {
    return this.dataModel;
  }

  /**
   * 获取组件注册表
   */
  getRegistry(): A2uiComponentRegistry<R> {
    return this.registry;
  }

  /**
   * 获取绑定解析器
   */
  getResolver(): A2uiBindingResolver {
    return this.resolver;
  }

  /**
   * 发送用户操作
   */
  dispatchUserAction(action: A2uiUserAction): void {
    this.options.events?.onUserAction?.(action);
    this.userActionCallback?.(action);
  }

  /**
   * 设置用户操作回调
   */
  setUserActionCallback(callback: (action: A2uiUserAction) => void): void {
    this.userActionCallback = callback;
  }

  /**
   * 手动更新数据模型 (用于双向绑定)
   */
  updateData(path: string, value: unknown): void {
    this.dataModel.set(path, value as import('./data-model').DataValue, 'client');
  }

  /**
   * 重置引擎状态
   */
  reset(): void {
    this.surfaces.clear();
    this.dataModel.clear();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Message Handlers
  // ─────────────────────────────────────────────────────────────────────────

  private handleSurfaceUpdate(msg: A2uiSurfaceUpdate, surfaceId: string): void {
    const surface = this.getOrCreateSurface(surfaceId);
    
    // 更新组件实例
    for (const component of msg.components) {
      surface.components.set(component.id, component);
    }
    
    // 如果已开始渲染，重建渲染树
    if (surface.isRendering) {
      this.notifyRenderTreeUpdate(surfaceId);
    }
  }

  private handleDataModelUpdate(msg: A2uiDataModelUpdate, _surfaceId: string): void {
    this.dataModel.applyUpdate(msg);
    // 数据变更会自动触发重建 (通过订阅)
  }

  private handleBeginRendering(msg: A2uiBeginRendering, surfaceId: string): void {
    const surface = this.getOrCreateSurface(surfaceId);
    
    surface.rootId = msg.root;
    surface.catalogId = msg.catalogId;
    surface.isRendering = true;
    
    this.notifyRenderTreeUpdate(surfaceId);
  }

  private handleDeleteSurface(msg: A2uiDeleteSurface): void {
    const surfaceId = msg.surfaceId;
    
    if (this.surfaces.has(surfaceId)) {
      this.surfaces.delete(surfaceId);
      this.options.events?.onSurfaceDeleted?.(surfaceId);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Surface Management
  // ─────────────────────────────────────────────────────────────────────────

  private getOrCreateSurface(surfaceId: string): SurfaceState {
    let surface = this.surfaces.get(surfaceId);
    
    if (!surface) {
      surface = {
        id: surfaceId,
        rootId: null,
        components: new Map(),
        isRendering: false,
      };
      this.surfaces.set(surfaceId, surface);
      this.options.events?.onSurfaceCreated?.(surfaceId);
    }
    
    return surface;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render Tree Building
  // ─────────────────────────────────────────────────────────────────────────

  private buildRenderTree(
    surface: SurfaceState,
    componentId: string,
    context?: ResolveContext
  ): RenderTreeNode<R> | null {
    const instance = surface.components.get(componentId);
    if (!instance) return null;
    
    // 获取组件类型和属性
    const [componentType, componentProps] = this.extractComponentTypeAndProps(instance);
    if (!componentType) return null;
    
    // 检查组件是否允许
    if (!this.registry.isAllowed(componentType)) {
      this.options.events?.onError?.(
        new Error(`Component type not allowed: ${componentType}`),
        'buildRenderTree'
      );
      return null;
    }
    
    // 解析属性
    const resolvedProps = this.resolver.resolveProps(componentProps, context);
    
    // 解析子组件
    const childIds = this.resolver.resolveChildren(componentProps.children as import('@aevatar/kit-types').A2uiChildren | undefined, context);
    const children: RenderTreeNode<R>[] = [];
    
    for (const childId of childIds) {
      const childNode = this.buildRenderTree(surface, childId, context);
      if (childNode) {
        children.push(childNode);
      }
    }
    
    return {
      id: componentId,
      type: componentType,
      props: resolvedProps,
      children,
    };
  }

  private extractComponentTypeAndProps(
    instance: A2uiComponentInstance
  ): [string | null, Record<string, unknown>] {
    // component 是 { Button: { ... } } 或 { TextField: { ... } } 格式
    const entries = Object.entries(instance.component);
    if (entries.length === 0) return [null, {}];
    
    const [type, props] = entries[0];
    return [type, props as Record<string, unknown>];
  }

  private rebuildAllSurfaces(): void {
    for (const surfaceId of this.surfaces.keys()) {
      const surface = this.surfaces.get(surfaceId);
      if (surface?.isRendering) {
        this.notifyRenderTreeUpdate(surfaceId);
      }
    }
  }

  private notifyRenderTreeUpdate(surfaceId: string): void {
    const tree = this.getRenderTree(surfaceId);
    this.options.events?.onRenderTreeUpdated?.(surfaceId, tree);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 创建 A2UI 引擎
 */
export function createA2uiEngine<R = unknown>(
  registry: A2uiComponentRegistry<R>,
  options?: A2uiEngineOptions<R>
): A2uiEngine<R> {
  return new A2uiEngine(registry, options);
}


