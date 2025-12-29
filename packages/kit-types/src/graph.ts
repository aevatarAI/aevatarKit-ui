/**
 * ============================================================================
 * Graph Type Definitions
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Graph Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Graph summary (for listing)
 */
export interface GraphSummary {
  id: string;
  name: string;
  version: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Full graph definition
 */
export interface GraphDefinition extends GraphSummary {
  /** Graph nodes */
  nodes: GraphNode[];
  
  /** Graph edges */
  edges: GraphEdge[];
  
  /** Input schema */
  inputSchema?: Record<string, unknown>;
  
  /** Output schema */
  outputSchema?: Record<string, unknown>;
  
  /** Graph-level configuration */
  config?: GraphConfig;
}

// ─────────────────────────────────────────────────────────────────────────────
// Graph Node Types
// ─────────────────────────────────────────────────────────────────────────────

export type GraphNodeType =
  | 'start'
  | 'end'
  | 'llm_call'
  | 'tool_call'
  | 'conditional'
  | 'vote'
  | 'fan_out'
  | 'fan_in'
  | 'transform'
  | 'workflow_call'
  | 'agent_call';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  name?: string;
  config?: Record<string, unknown>;
  position?: { x: number; y: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// Graph Edge Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  condition?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Graph Configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface GraphConfig {
  /** Timeout in seconds */
  timeoutSeconds?: number;
  
  /** Max retries for failed steps */
  maxRetries?: number;
  
  /** Enable parallel execution */
  enableParallel?: boolean;
  
  /** Memory configuration */
  memory?: {
    enabled?: boolean;
    scope?: 'private' | 'session' | 'run' | 'graph' | 'tenant';
  };
}

