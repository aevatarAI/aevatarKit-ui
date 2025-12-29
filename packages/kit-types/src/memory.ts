/**
 * ============================================================================
 * Memory Type Definitions
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Memory Scope
// ─────────────────────────────────────────────────────────────────────────────

export type MemoryScope = 'private' | 'session' | 'run' | 'graph' | 'tenant';

// ─────────────────────────────────────────────────────────────────────────────
// Memory Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Memory resource summary
 */
export interface MemorySummary {
  id: string;
  scope: MemoryScope;
  scopeId?: string;
  entryCount: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Full memory resource
 */
export interface Memory extends MemorySummary {
  /** Memory entries */
  entries: MemoryEntry[];
  
  /** Memory tags */
  tags?: string[];
  
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Memory Entry Types
// ─────────────────────────────────────────────────────────────────────────────

export type MemoryEntryType = 
  | 'conversation'
  | 'event'
  | 'fact'
  | 'summary'
  | 'embedding'
  | 'custom';

export interface MemoryEntry {
  id: string;
  type: MemoryEntryType;
  content: string;
  role?: 'user' | 'assistant' | 'system';
  timestamp: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  
  /** Source agent/run ID */
  sourceId?: string;
  sourceType?: 'agent' | 'run' | 'user';
}

// ─────────────────────────────────────────────────────────────────────────────
// Memory Search
// ─────────────────────────────────────────────────────────────────────────────

export interface MemorySearchOptions {
  /** Search query */
  query: string;
  
  /** Filter by scope */
  scope?: MemoryScope;
  
  /** Filter by scope ID */
  scopeId?: string;
  
  /** Filter by entry type */
  entryType?: MemoryEntryType;
  
  /** Filter by tags */
  tags?: string[];
  
  /** Max results */
  limit?: number;
  
  /** Use semantic search */
  semantic?: boolean;
}

export interface MemorySearchResult {
  entry: MemoryEntry;
  score?: number;
  memoryId: string;
}

