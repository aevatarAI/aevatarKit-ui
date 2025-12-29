/**
 * ============================================================================
 * Graph Extension Event
 * ============================================================================
 * Event name: aevatar.graph
 * Used for knowledge graph / axiom reasoning visualization
 * ============================================================================
 */

export interface AevatarGraphEvent {
  /** Current iteration */
  iteration: number;
  
  /** Axioms in the graph */
  axioms: GraphAxiom[];
  
  /** Theorems derived */
  theorems: GraphTheorem[];
  
  /** Edges between nodes */
  edges?: GraphEdge[];
  
  /** Graph metadata */
  metadata?: Record<string, unknown>;
}

export interface GraphAxiom {
  id: string;
  content: string;
  confidence?: number;
  source?: string;
  tags?: string[];
}

export interface GraphTheorem {
  id: string;
  content: string;
  derivedFrom: string[];
  confidence?: number;
  proofSteps?: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  weight?: number;
}

