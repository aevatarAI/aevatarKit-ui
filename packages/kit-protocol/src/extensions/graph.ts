/**
 * ============================================================================
 * Graph Extension Event
 * ============================================================================
 * Event name: aevatar.graph
 * Generic graph/DAG visualization support for SSE events
 * 
 * NOTE: This module provides generic graph primitives for event streaming.
 * These types are distinct from kit-types/graph.ts which defines workflow graph schema.
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Generic Graph Event (for SSE streaming)
// ─────────────────────────────────────────────────────────────────────────────

export interface AevatarGraphEvent {
  /** Current iteration/version */
  iteration: number;
  
  /** Graph nodes */
  nodes: EventGraphNode[];
  
  /** Edges between nodes */
  edges: EventGraphEdge[];
  
  /** Graph metadata */
  metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic Graph Primitives (for event streaming)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generic graph node for event streaming
 * Business-specific node types can extend this
 */
export interface EventGraphNode {
  /** Unique node ID */
  id: string;
  
  /** Node type (e.g., 'axiom', 'theorem', 'task', 'agent') */
  type: string;
  
  /** Display label */
  label?: string;
  
  /** Node data (type-specific payload) */
  data?: Record<string, unknown>;
  
  /** Optional grouping key */
  group?: string;
}

/**
 * Generic graph edge for event streaming
 */
export interface EventGraphEdge {
  /** Source node ID */
  source: string;
  
  /** Target node ID */
  target: string;
  
  /** Edge type/relation */
  type?: string;
  
  /** Display label */
  label?: string;
  
  /** Edge weight */
  weight?: number;
  
  /** Edge metadata */
  data?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Graph Update Events
// ─────────────────────────────────────────────────────────────────────────────

export interface AevatarGraphUpdateEvent {
  /** Update type */
  action: 'add_node' | 'remove_node' | 'update_node' | 'add_edge' | 'remove_edge';
  
  /** Target node (for node operations) */
  node?: EventGraphNode;
  
  /** Target edge (for edge operations) */
  edge?: EventGraphEdge;
}

