/**
 * ============================================================================
 * A2UI Data Model Store
 * ============================================================================
 * 
 * 管理 A2UI 的数据模型，支持:
 * - 路径式数据访问 (/path/to/value)
 * - 数据变更订阅
 * - 数据绑定解析
 * 
 * ============================================================================
 */

import type {
  A2uiDataEntry,
  A2uiDataModelUpdate,
  A2uiDataArrayItem,
} from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

// 使用 interface 解决循环引用
export interface DataMap {
  [key: string]: DataValue;
}

export type DataPrimitive = string | number | boolean;
export type DataValue = DataPrimitive | DataValue[] | DataMap;

export interface DataChangeEvent {
  path: string;
  oldValue: DataValue | undefined;
  newValue: DataValue | undefined;
  source: 'server' | 'client';
}

export type DataChangeListener = (event: DataChangeEvent) => void;

// ─────────────────────────────────────────────────────────────────────────────
// Data Model Store
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A2UI 数据模型存储
 * 采用扁平化路径存储，支持高效的路径查询和更新
 */
export class A2uiDataModel {
  private data: DataMap = {};
  private listeners: Set<DataChangeListener> = new Set();
  private pathListeners: Map<string, Set<DataChangeListener>> = new Map();

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 获取指定路径的值
   * @param path 数据路径 (如 /booking/date)
   */
  get<T = DataValue>(path: string): T | undefined {
    const normalizedPath = this.normalizePath(path);
    return this.getByPath(normalizedPath) as T | undefined;
  }

  /**
   * 设置指定路径的值
   * @param path 数据路径
   * @param value 新值
   * @param source 变更来源 (server 或 client)
   */
  set(path: string, value: DataValue, source: 'server' | 'client' = 'client'): void {
    const normalizedPath = this.normalizePath(path);
    const oldValue = this.getByPath(normalizedPath);
    
    this.setByPath(normalizedPath, value);
    
    this.notifyChange({
      path: normalizedPath,
      oldValue,
      newValue: value,
      source,
    });
  }

  /**
   * 删除指定路径的值
   */
  delete(path: string, source: 'server' | 'client' = 'client'): void {
    const normalizedPath = this.normalizePath(path);
    const oldValue = this.getByPath(normalizedPath);
    
    this.deleteByPath(normalizedPath);
    
    this.notifyChange({
      path: normalizedPath,
      oldValue,
      newValue: undefined,
      source,
    });
  }

  /**
   * 应用服务端的数据更新消息
   */
  applyUpdate(update: A2uiDataModelUpdate): void {
    const basePath = update.path || '';
    
    for (const entry of update.contents) {
      const entryPath = basePath 
        ? `${basePath}/${entry.key}` 
        : `/${entry.key}`;
      
      const value = this.dataEntryToValue(entry);
      if (value !== undefined) {
        this.set(entryPath, value, 'server');
      }
    }
  }

  /**
   * 获取整个数据模型的快照
   */
  getSnapshot(): DataMap {
    return JSON.parse(JSON.stringify(this.data));
  }

  /**
   * 清空数据模型
   */
  clear(): void {
    this.data = {};
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Subscription
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 订阅所有数据变更
   */
  subscribe(listener: DataChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 订阅特定路径的数据变更
   */
  subscribeToPath(path: string, listener: DataChangeListener): () => void {
    const normalizedPath = this.normalizePath(path);
    
    if (!this.pathListeners.has(normalizedPath)) {
      this.pathListeners.set(normalizedPath, new Set());
    }
    
    this.pathListeners.get(normalizedPath)!.add(listener);
    
    return () => {
      this.pathListeners.get(normalizedPath)?.delete(listener);
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ─────────────────────────────────────────────────────────────────────────

  private normalizePath(path: string): string {
    // 确保路径以 / 开头，移除尾部 /
    let normalized = path.startsWith('/') ? path : `/${path}`;
    normalized = normalized.endsWith('/') && normalized.length > 1 
      ? normalized.slice(0, -1) 
      : normalized;
    return normalized;
  }

  private getByPath(path: string): DataValue | undefined {
    if (path === '/') return this.data;
    
    const parts = path.split('/').filter(Boolean);
    let current: DataValue = this.data;
    
    for (const part of parts) {
      if (typeof current !== 'object' || current === null || Array.isArray(current)) {
        return undefined;
      }
      current = (current as DataMap)[part];
      if (current === undefined) {
        return undefined;
      }
    }
    
    return current;
  }

  private setByPath(path: string, value: DataValue): void {
    if (path === '/') {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.data = value as DataMap;
      }
      return;
    }
    
    const parts = path.split('/').filter(Boolean);
    const lastKey = parts.pop()!;
    let current: DataMap = this.data;
    
    for (const part of parts) {
      if (!(part in current) || typeof current[part] !== 'object' || Array.isArray(current[part])) {
        current[part] = {};
      }
      current = current[part] as DataMap;
    }
    
    current[lastKey] = value;
  }

  private deleteByPath(path: string): void {
    if (path === '/') {
      this.data = {};
      return;
    }
    
    const parts = path.split('/').filter(Boolean);
    const lastKey = parts.pop()!;
    let current: DataMap = this.data;
    
    for (const part of parts) {
      if (!(part in current) || typeof current[part] !== 'object') {
        return;
      }
      current = current[part] as DataMap;
    }
    
    delete current[lastKey];
  }

  private notifyChange(event: DataChangeEvent): void {
    // 通知全局监听器
    for (const listener of this.listeners) {
      listener(event);
    }
    
    // 通知路径监听器
    const pathListeners = this.pathListeners.get(event.path);
    if (pathListeners) {
      for (const listener of pathListeners) {
        listener(event);
      }
    }
    
    // 通知父路径监听器 (冒泡)
    const parts = event.path.split('/').filter(Boolean);
    while (parts.length > 0) {
      parts.pop();
      const parentPath = '/' + parts.join('/');
      const parentListeners = this.pathListeners.get(parentPath || '/');
      if (parentListeners) {
        for (const listener of parentListeners) {
          listener(event);
        }
      }
    }
  }

  private dataEntryToValue(entry: A2uiDataEntry): DataValue | undefined {
    if (entry.valueString !== undefined) return entry.valueString;
    if (entry.valueNumber !== undefined) return entry.valueNumber;
    if (entry.valueBoolean !== undefined) return entry.valueBoolean;
    
    if (entry.valueArray !== undefined) {
      return entry.valueArray.map(item => this.arrayItemToValue(item));
    }
    
    if (entry.valueMap !== undefined) {
      const result: DataMap = {};
      for (const subEntry of entry.valueMap) {
        const subValue = this.dataEntryToValue(subEntry);
        if (subValue !== undefined) {
          result[subEntry.key] = subValue;
        }
      }
      return result;
    }
    
    return undefined;
  }

  private arrayItemToValue(item: A2uiDataArrayItem): DataValue {
    if (item.stringItem !== undefined) return item.stringItem;
    if (item.numberItem !== undefined) return item.numberItem;
    if (item.booleanItem !== undefined) return item.booleanItem;
    
    if (item.mapItem !== undefined) {
      const result: DataMap = {};
      for (const entry of item.mapItem) {
        const value = this.dataEntryToValue(entry);
        if (value !== undefined) {
          result[entry.key] = value;
        }
      }
      return result;
    }
    
    return '';
  }
}

/**
 * 创建数据模型实例
 */
export function createDataModel(): A2uiDataModel {
  return new A2uiDataModel();
}


