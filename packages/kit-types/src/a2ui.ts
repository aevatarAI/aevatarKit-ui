/**
 * ============================================================================
 * A2UI (Agent-to-User Interface) Protocol Type Definitions
 * ============================================================================
 * 
 * A2UI 是 Google 开源的面向 AI Agent 的界面协议/规范
 * 用于解决 "Agent 不是只回一串文本，而是能安全地'说'出一个可交互 UI" 的问题
 * 
 * 核心特性:
 * - 声明式 UI: Agent 描述组件、布局、数据绑定，前端负责渲染
 * - 安全性: 白名单组件，前端保留最终控制权
 * - 跨端跨框架: 同一份 JSON 可在不同端用原生组件渲染
 * - 流式生成: 支持 JSONL 增量消息，边生成边渲染
 * 
 * @see https://github.com/AstroAir/a2ui (Google A2UI)
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// A2UI Message Types (Server → Client)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A2UI 消息类型枚举
 */
export type A2uiMessageType =
  | 'surfaceUpdate'      // 更新 Surface 上的组件树
  | 'dataModelUpdate'    // 更新数据模型
  | 'beginRendering'     // 开始渲染 Surface
  | 'deleteSurface';     // 删除 Surface

/**
 * A2UI 基础消息接口
 */
export interface A2uiBaseMessage {
  type: A2uiMessageType;
  surfaceId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Surface Update
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Surface 更新消息
 * 用于向客户端发送组件树更新
 */
export interface A2uiSurfaceUpdate extends A2uiBaseMessage {
  type: 'surfaceUpdate';
  surfaceId?: string;
  components: A2uiComponentInstance[];
}

/**
 * 组件实例定义
 * 描述一个具体的 UI 组件及其属性
 */
export interface A2uiComponentInstance {
  /** 组件唯一标识 */
  id: string;
  /** 
   * 组件定义 - 动态类型
   * 键为组件类型名 (如 Button, TextField, DatePicker)
   * 值为该组件的属性配置
   */
  component: Record<string, A2uiComponentProps>;
}

/**
 * 组件属性基础接口
 * 所有组件属性都应支持数据绑定
 */
export interface A2uiComponentProps {
  /** 子组件列表 */
  children?: A2uiChildren;
  /** 其他属性（支持 BoundValue） */
  [key: string]: A2uiBoundValue | A2uiChildren | unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Model Update
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 数据模型更新消息
 * 用于更新 Surface 的数据模型
 */
export interface A2uiDataModelUpdate extends A2uiBaseMessage {
  type: 'dataModelUpdate';
  surfaceId?: string;
  /** 可选的路径前缀 */
  path?: string;
  /** 数据条目列表 */
  contents: A2uiDataEntry[];
}

/**
 * 数据条目
 * 支持多种数据类型
 */
export interface A2uiDataEntry {
  /** 数据键名 */
  key: string;
  /** 字符串值 */
  valueString?: string;
  /** 数字值 */
  valueNumber?: number;
  /** 布尔值 */
  valueBoolean?: boolean;
  /** 嵌套对象 (Map) */
  valueMap?: A2uiDataEntry[];
  /** 数组值 */
  valueArray?: A2uiDataArrayItem[];
}

/**
 * 数组项 (用于 valueArray)
 */
export interface A2uiDataArrayItem {
  /** 字符串项 */
  stringItem?: string;
  /** 数字项 */
  numberItem?: number;
  /** 布尔项 */
  booleanItem?: boolean;
  /** 对象项 */
  mapItem?: A2uiDataEntry[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Begin Rendering & Delete Surface
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 开始渲染消息
 * 通知客户端开始渲染指定 Surface
 */
export interface A2uiBeginRendering extends A2uiBaseMessage {
  type: 'beginRendering';
  surfaceId?: string;
  /** 根组件 ID */
  root: string;
  /** 组件目录 ID (用于选择不同的组件集) */
  catalogId?: string;
}

/**
 * 删除 Surface 消息
 */
export interface A2uiDeleteSurface extends A2uiBaseMessage {
  type: 'deleteSurface';
  surfaceId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bound Value (数据绑定核心)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 绑定值
 * 用于将组件属性绑定到数据模型或使用字面量
 */
export interface A2uiBoundValue {
  /** 字面量字符串 */
  literalString?: string;
  /** 字面量数字 */
  literalNumber?: number;
  /** 字面量布尔 */
  literalBoolean?: boolean;
  /** 字面量数组 */
  literalArray?: A2uiBoundValue[];
  /** 字面量对象 */
  literalMap?: Record<string, A2uiBoundValue>;
  /** 
   * 数据模型路径绑定
   * 格式: /path/to/value (如 /booking/date)
   */
  path?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Children Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 子组件定义
 * 支持显式列表或模板循环
 */
export interface A2uiChildren {
  /** 显式子组件 ID 列表 */
  explicitList?: string[];
  /** 
   * 模板循环
   * 用于根据数据数组动态生成子组件
   */
  template?: A2uiChildrenTemplate;
}

/**
 * 子组件模板
 */
export interface A2uiChildrenTemplate {
  /** 绑定的数据数组路径 */
  dataBinding: string;
  /** 模板组件 ID */
  componentId: string;
  /** 可选的循环变量名 (默认 item) */
  itemVariable?: string;
  /** 可选的索引变量名 (默认 index) */
  indexVariable?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// User Action (Client → Server)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 用户操作
 * 客户端向服务端报告用户与 A2UI 组件的交互
 */
export interface A2uiUserAction {
  /** 操作名称 (如 click, change, submit) */
  name: string;
  /** Surface ID */
  surfaceId: string;
  /** 触发操作的组件 ID */
  sourceComponentId: string;
  /** 时间戳 (ISO 8601) */
  timestamp: string;
  /** 上下文数据 */
  context: Record<string, unknown>;
}

/**
 * 常用用户操作类型
 */
export type A2uiUserActionType =
  | 'click'
  | 'change'
  | 'submit'
  | 'focus'
  | 'blur'
  | 'select'
  | 'dismiss';

// ─────────────────────────────────────────────────────────────────────────────
// A2UI Message Union
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 所有 A2UI 服务端消息的联合类型
 */
export type A2uiServerMessage =
  | A2uiSurfaceUpdate
  | A2uiDataModelUpdate
  | A2uiBeginRendering
  | A2uiDeleteSurface;

// ─────────────────────────────────────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────────────────────────────────────

export function isA2uiSurfaceUpdate(msg: A2uiServerMessage): msg is A2uiSurfaceUpdate {
  return msg.type === 'surfaceUpdate';
}

export function isA2uiDataModelUpdate(msg: A2uiServerMessage): msg is A2uiDataModelUpdate {
  return msg.type === 'dataModelUpdate';
}

export function isA2uiBeginRendering(msg: A2uiServerMessage): msg is A2uiBeginRendering {
  return msg.type === 'beginRendering';
}

export function isA2uiDeleteSurface(msg: A2uiServerMessage): msg is A2uiDeleteSurface {
  return msg.type === 'deleteSurface';
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Catalog Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 组件目录定义
 * 定义可用的组件类型及其 schema
 */
export interface A2uiComponentCatalog {
  /** 目录 ID */
  id: string;
  /** 目录名称 */
  name: string;
  /** 目录版本 */
  version: string;
  /** 组件定义映射 */
  components: Record<string, A2uiComponentDefinition>;
}

/**
 * 组件定义
 */
export interface A2uiComponentDefinition {
  /** 组件类型名 */
  type: string;
  /** 组件描述 */
  description?: string;
  /** 属性 Schema */
  propsSchema?: Record<string, A2uiPropSchema>;
  /** 是否支持子组件 */
  allowsChildren?: boolean;
  /** 组件分类标签 */
  tags?: string[];
}

/**
 * 属性 Schema
 */
export interface A2uiPropSchema {
  /** 属性类型 */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'boundValue';
  /** 是否必需 */
  required?: boolean;
  /** 默认值 */
  default?: unknown;
  /** 描述 */
  description?: string;
  /** 枚举值 (仅 string 类型) */
  enum?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Standard Component Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 标准 A2UI 组件类型
 * 这些是跨平台通用的基础组件
 */
export type A2uiStandardComponentType =
  // Layout
  | 'Container'
  | 'Row'
  | 'Column'
  | 'Grid'
  | 'Card'
  | 'Divider'
  | 'Spacer'
  // Text
  | 'Text'
  | 'Heading'
  | 'Paragraph'
  | 'Link'
  | 'Badge'
  // Input
  | 'TextField'
  | 'TextArea'
  | 'NumberInput'
  | 'Checkbox'
  | 'Radio'
  | 'Switch'
  | 'Select'
  | 'DatePicker'
  | 'TimePicker'
  | 'DateTimePicker'
  | 'Slider'
  | 'FileUpload'
  // Button
  | 'Button'
  | 'IconButton'
  | 'ButtonGroup'
  // Data Display
  | 'Table'
  | 'List'
  | 'Avatar'
  | 'Image'
  | 'Icon'
  | 'Progress'
  | 'Skeleton'
  // Feedback
  | 'Alert'
  | 'Toast'
  | 'Dialog'
  | 'Tooltip'
  | 'Popover'
  // Navigation
  | 'Tabs'
  | 'Breadcrumb'
  | 'Pagination'
  | 'Menu'
  // Chart (扩展)
  | 'LineChart'
  | 'BarChart'
  | 'PieChart'
  // Science (科学可视化)
  | 'MoleculeViewer'
  | 'ProteinViewer'
  | 'Molecule3D';

// ─────────────────────────────────────────────────────────────────────────────
// AG-UI Integration Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A2UI 在 AG-UI CUSTOM 事件中的封装
 */
export interface A2uiCustomEventValue {
  /** A2UI 消息 */
  message: A2uiServerMessage;
  /** 可选的元数据 */
  metadata?: {
    /** 消息序号 (用于排序) */
    sequence?: number;
    /** 批次 ID (用于关联多条消息) */
    batchId?: string;
  };
}

/**
 * A2UI Custom 事件名称
 */
export const A2UI_CUSTOM_EVENT_NAME = 'a2ui.message' as const;

/**
 * A2UI 用户操作事件名称
 */
export const A2UI_USER_ACTION_EVENT_NAME = 'a2ui.userAction' as const;


