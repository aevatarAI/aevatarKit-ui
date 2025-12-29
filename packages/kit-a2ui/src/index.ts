/**
 * ============================================================================
 * @aevatar/kit-a2ui
 * ============================================================================
 * 
 * A2UI (Agent-to-User Interface) Engine for AevatarKit SDK
 * 
 * A2UI 是 Google 开源的面向 AI Agent 的界面协议/规范
 * 本包提供 A2UI 的核心引擎实现:
 * 
 * - A2uiEngine: 核心协调器，处理消息和管理 Surface
 * - A2uiDataModel: 数据模型存储，支持路径式访问和订阅
 * - A2uiComponentRegistry: 组件注册表，白名单机制保障安全
 * - A2uiBindingResolver: 数据绑定解析器
 * 
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Core Engine
// ─────────────────────────────────────────────────────────────────────────────
export {
  A2uiEngine,
  createA2uiEngine,
  type SurfaceState,
  type RenderTreeNode,
  type A2uiEngineEvents,
  type A2uiEngineOptions,
} from './engine';

// ─────────────────────────────────────────────────────────────────────────────
// Data Model
// ─────────────────────────────────────────────────────────────────────────────
export {
  A2uiDataModel,
  createDataModel,
  type DataValue,
  type DataMap,
  type DataChangeEvent,
  type DataChangeListener,
} from './data-model';

// ─────────────────────────────────────────────────────────────────────────────
// Component Registry
// ─────────────────────────────────────────────────────────────────────────────
export {
  A2uiComponentRegistry,
  createComponentRegistry,
  STANDARD_COMPONENT_TYPES,
  type ComponentRenderer,
  type ComponentRegistryEntry,
  type ComponentRegistryOptions,
} from './component-registry';

// ─────────────────────────────────────────────────────────────────────────────
// Binding Resolver
// ─────────────────────────────────────────────────────────────────────────────
export {
  A2uiBindingResolver,
  createBindingResolver,
  type ResolvedValue,
  type ResolveContext,
} from './binding-resolver';


