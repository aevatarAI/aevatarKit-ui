/**
 * ============================================================================
 * A2UI Binding Resolver
 * ============================================================================
 * 
 * 数据绑定解析器 - 将 BoundValue 解析为实际值
 * 
 * 支持:
 * - 字面量值 (literalString, literalNumber, etc.)
 * - 路径绑定 (path: /booking/date)
 * - 嵌套结构解析
 * 
 * ============================================================================
 */

import type { 
  A2uiBoundValue, 
  A2uiComponentProps,
  A2uiChildren,
  A2uiChildrenTemplate,
} from '@aevatar/kit-types';

import type { A2uiDataModel, DataValue, DataMap } from './data-model';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 解析后的属性值 Map
 */
export interface ResolvedMap {
  [key: string]: ResolvedValue;
}

/**
 * 解析后的属性值
 */
export type ResolvedPrimitive = string | number | boolean;
export type ResolvedValue = ResolvedPrimitive | ResolvedValue[] | ResolvedMap;

/**
 * 解析上下文
 * 用于模板循环中的变量作用域
 */
export interface ResolveContext {
  /** 当前循环项数据 */
  item?: DataValue;
  /** 当前循环索引 */
  index?: number;
  /** 循环项变量名 (默认 item) */
  itemVariable?: string;
  /** 循环索引变量名 (默认 index) */
  indexVariable?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Binding Resolver
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A2UI 数据绑定解析器
 */
export class A2uiBindingResolver {
  constructor(private dataModel: A2uiDataModel) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 解析 BoundValue 为实际值
   */
  resolve(bound: A2uiBoundValue, context?: ResolveContext): ResolvedValue | undefined {
    // 字面量优先
    if (bound.literalString !== undefined) return bound.literalString;
    if (bound.literalNumber !== undefined) return bound.literalNumber;
    if (bound.literalBoolean !== undefined) return bound.literalBoolean;
    
    // 字面量数组
    if (bound.literalArray !== undefined) {
      return bound.literalArray.map(item => this.resolve(item, context)).filter(v => v !== undefined) as ResolvedValue[];
    }
    
    // 字面量对象
    if (bound.literalMap !== undefined) {
      const result: Record<string, ResolvedValue> = {};
      for (const [key, value] of Object.entries(bound.literalMap)) {
        const resolved = this.resolve(value, context);
        if (resolved !== undefined) {
          result[key] = resolved;
        }
      }
      return result;
    }
    
    // 路径绑定
    if (bound.path !== undefined) {
      return this.resolvePath(bound.path, context);
    }
    
    return undefined;
  }

  /**
   * 解析组件属性对象
   */
  resolveProps(props: A2uiComponentProps, context?: ResolveContext): Record<string, ResolvedValue> {
    const result: Record<string, ResolvedValue> = {};
    
    for (const [key, value] of Object.entries(props)) {
      // 跳过 children，单独处理
      if (key === 'children') continue;
      
      const resolved = this.resolveValue(value, context);
      if (resolved !== undefined) {
        result[key] = resolved;
      }
    }
    
    return result;
  }

  /**
   * 解析子组件引用
   * 返回需要渲染的子组件 ID 列表
   */
  resolveChildren(children: A2uiChildren | undefined, context?: ResolveContext): string[] {
    if (!children) return [];
    
    // 显式列表
    if (children.explicitList) {
      return children.explicitList;
    }
    
    // 模板循环
    if (children.template) {
      return this.resolveTemplate(children.template, context);
    }
    
    return [];
  }

  /**
   * 判断值是否为 BoundValue
   */
  isBoundValue(value: unknown): value is A2uiBoundValue {
    if (typeof value !== 'object' || value === null) return false;
    
    const obj = value as Record<string, unknown>;
    return (
      'literalString' in obj ||
      'literalNumber' in obj ||
      'literalBoolean' in obj ||
      'literalArray' in obj ||
      'literalMap' in obj ||
      'path' in obj
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ─────────────────────────────────────────────────────────────────────────

  private resolveValue(value: unknown, context?: ResolveContext): ResolvedValue | undefined {
    // 如果是 BoundValue，解析它
    if (this.isBoundValue(value)) {
      return this.resolve(value, context);
    }
    
    // 原始类型直接返回
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    
    // 数组
    if (Array.isArray(value)) {
      return value.map(item => this.resolveValue(item, context)).filter(v => v !== undefined) as ResolvedValue[];
    }
    
    // 对象
    if (typeof value === 'object' && value !== null) {
      const result: Record<string, ResolvedValue> = {};
      for (const [k, v] of Object.entries(value)) {
        const resolved = this.resolveValue(v, context);
        if (resolved !== undefined) {
          result[k] = resolved;
        }
      }
      return result;
    }
    
    return undefined;
  }

  private resolvePath(path: string, context?: ResolveContext): ResolvedValue | undefined {
    // 检查是否引用上下文变量
    if (context) {
      const itemVar = context.itemVariable || 'item';
      const indexVar = context.indexVariable || 'index';
      
      // 匹配 $item 或 $item.xxx
      if (path.startsWith(`$${itemVar}`)) {
        const subPath = path.slice(itemVar.length + 1); // +1 for $
        if (subPath === '' || subPath === '/') {
          return this.dataValueToResolved(context.item);
        }
        // 处理子路径 $item/name → context.item.name
        if (subPath.startsWith('/')) {
          return this.resolveSubPath(context.item, subPath);
        }
      }
      
      // 匹配 $index
      if (path === `$${indexVar}`) {
        return context.index;
      }
    }
    
    // 从数据模型获取
    const value = this.dataModel.get(path);
    return this.dataValueToResolved(value);
  }

  private resolveSubPath(data: DataValue | undefined, subPath: string): ResolvedValue | undefined {
    if (data === undefined) return undefined;
    
    const parts = subPath.split('/').filter(Boolean);
    let current: DataValue = data;
    
    for (const part of parts) {
      if (typeof current !== 'object' || current === null || Array.isArray(current)) {
        return undefined;
      }
      current = (current as DataMap)[part];
      if (current === undefined) {
        return undefined;
      }
    }
    
    return this.dataValueToResolved(current);
  }

  private resolveTemplate(template: A2uiChildrenTemplate, _context?: ResolveContext): string[] {
    const dataArray = this.dataModel.get<DataValue[]>(template.dataBinding);
    if (!Array.isArray(dataArray)) {
      return [];
    }
    
    // 返回每个数组项对应的组件 ID
    // 格式: {templateComponentId}_{index}
    return dataArray.map((_, index) => `${template.componentId}_${index}`);
  }

  private dataValueToResolved(value: DataValue | undefined): ResolvedValue | undefined {
    if (value === undefined) return undefined;
    
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    
    if (Array.isArray(value)) {
      return value.map(item => this.dataValueToResolved(item)).filter(v => v !== undefined) as ResolvedValue[];
    }
    
    if (typeof value === 'object' && value !== null) {
      const result: Record<string, ResolvedValue> = {};
      for (const [k, v] of Object.entries(value)) {
        const resolved = this.dataValueToResolved(v);
        if (resolved !== undefined) {
          result[k] = resolved;
        }
      }
      return result;
    }
    
    return undefined;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 创建绑定解析器
 */
export function createBindingResolver(dataModel: A2uiDataModel): A2uiBindingResolver {
  return new A2uiBindingResolver(dataModel);
}


