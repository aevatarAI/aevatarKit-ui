/**
 * ============================================================================
 * A2UI Component Registry
 * ============================================================================
 * 
 * 组件注册表 - 管理 A2UI 组件类型到实际渲染组件的映射
 * 
 * A2UI 的核心安全机制: Agent 只能使用注册的白名单组件
 * 
 * ============================================================================
 */

import type { 
  A2uiComponentCatalog, 
  A2uiComponentDefinition,
  A2uiStandardComponentType,
} from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 组件渲染器函数签名
 * 接收组件属性，返回渲染结果
 */
export type ComponentRenderer<Props = Record<string, unknown>, Result = unknown> = 
  (props: Props & { children?: Result[] }) => Result;

/**
 * 组件注册项
 */
export interface ComponentRegistryEntry<R = unknown> {
  /** 组件类型名 */
  type: string;
  /** 渲染器函数 */
  renderer: ComponentRenderer<Record<string, unknown>, R>;
  /** 组件定义 (Schema) */
  definition?: A2uiComponentDefinition;
}

/**
 * 注册表配置选项
 */
export interface ComponentRegistryOptions {
  /** 是否允许未注册的组件 (默认 false) */
  allowUnregistered?: boolean;
  /** 未注册组件的回退渲染器 */
  fallbackRenderer?: ComponentRenderer;
  /** 目录 ID (用于多目录场景) */
  catalogId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Registry
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A2UI 组件注册表
 */
export class A2uiComponentRegistry<R = unknown> {
  private components: Map<string, ComponentRegistryEntry<R>> = new Map();
  private options: ComponentRegistryOptions;

  constructor(options: ComponentRegistryOptions = {}) {
    this.options = {
      allowUnregistered: false,
      ...options,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Registration
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 注册单个组件
   */
  register<P extends Record<string, unknown>>(
    type: string,
    renderer: ComponentRenderer<P, R>,
    definition?: A2uiComponentDefinition
  ): this {
    this.components.set(type, {
      type,
      renderer: renderer as ComponentRenderer<Record<string, unknown>, R>,
      definition,
    });
    return this;
  }

  /**
   * 批量注册组件
   */
  registerAll(
    entries: Array<{
      type: string;
      renderer: ComponentRenderer<Record<string, unknown>, R>;
      definition?: A2uiComponentDefinition;
    }>
  ): this {
    for (const entry of entries) {
      this.register(entry.type, entry.renderer, entry.definition);
    }
    return this;
  }

  /**
   * 从目录批量注册组件
   */
  registerFromCatalog(
    catalog: A2uiComponentCatalog,
    renderers: Record<string, ComponentRenderer<Record<string, unknown>, R>>
  ): this {
    for (const [type, definition] of Object.entries(catalog.components)) {
      const renderer = renderers[type];
      if (renderer) {
        this.register(type, renderer, definition);
      }
    }
    return this;
  }

  /**
   * 注销组件
   */
  unregister(type: string): boolean {
    return this.components.delete(type);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lookup
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 获取组件渲染器
   */
  getRenderer(type: string): ComponentRenderer<Record<string, unknown>, R> | null {
    const entry = this.components.get(type);
    
    if (entry) {
      return entry.renderer;
    }
    
    if (this.options.allowUnregistered && this.options.fallbackRenderer) {
      return this.options.fallbackRenderer as ComponentRenderer<Record<string, unknown>, R>;
    }
    
    return null;
  }

  /**
   * 获取组件定义
   */
  getDefinition(type: string): A2uiComponentDefinition | null {
    return this.components.get(type)?.definition ?? null;
  }

  /**
   * 检查组件是否已注册
   */
  has(type: string): boolean {
    return this.components.has(type);
  }

  /**
   * 获取所有已注册的组件类型
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.components.keys());
  }

  /**
   * 导出为目录对象
   */
  toCatalog(id: string, name: string, version: string): A2uiComponentCatalog {
    const components: Record<string, A2uiComponentDefinition> = {};
    
    for (const [type, entry] of this.components) {
      components[type] = entry.definition ?? {
        type,
        description: `Component: ${type}`,
      };
    }
    
    return { id, name, version, components };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 验证组件类型是否允许使用
   */
  isAllowed(type: string): boolean {
    return this.has(type) || this.options.allowUnregistered === true;
  }

  /**
   * 验证组件属性
   */
  validateProps(type: string, props: Record<string, unknown>): string[] {
    const definition = this.getDefinition(type);
    if (!definition?.propsSchema) {
      return [];
    }

    const errors: string[] = [];
    
    for (const [propName, schema] of Object.entries(definition.propsSchema)) {
      const value = props[propName];
      
      // 检查必需属性
      if (schema.required && value === undefined) {
        errors.push(`Missing required prop: ${propName}`);
        continue;
      }
      
      if (value === undefined) continue;
      
      // 类型验证
      const expectedType = schema.type;
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      
      if (expectedType !== 'boundValue' && actualType !== expectedType) {
        errors.push(`Prop "${propName}" expected ${expectedType}, got ${actualType}`);
      }
      
      // 枚举验证
      if (schema.enum && typeof value === 'string' && !schema.enum.includes(value)) {
        errors.push(`Prop "${propName}" must be one of: ${schema.enum.join(', ')}`);
      }
    }
    
    return errors;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 创建组件注册表
 */
export function createComponentRegistry<R = unknown>(
  options?: ComponentRegistryOptions
): A2uiComponentRegistry<R> {
  return new A2uiComponentRegistry<R>(options);
}

/**
 * 标准组件列表 (供参考)
 */
export const STANDARD_COMPONENT_TYPES: A2uiStandardComponentType[] = [
  // Layout
  'Container', 'Row', 'Column', 'Grid', 'Card', 'Divider', 'Spacer',
  // Text
  'Text', 'Heading', 'Paragraph', 'Link', 'Badge',
  // Input
  'TextField', 'TextArea', 'NumberInput', 'Checkbox', 'Radio', 'Switch',
  'Select', 'DatePicker', 'TimePicker', 'DateTimePicker', 'Slider', 'FileUpload',
  // Button
  'Button', 'IconButton', 'ButtonGroup',
  // Data Display
  'Table', 'List', 'Avatar', 'Image', 'Icon', 'Progress', 'Skeleton',
  // Feedback
  'Alert', 'Toast', 'Dialog', 'Tooltip', 'Popover',
  // Navigation
  'Tabs', 'Breadcrumb', 'Pagination', 'Menu',
  // Chart
  'LineChart', 'BarChart', 'PieChart',
];


