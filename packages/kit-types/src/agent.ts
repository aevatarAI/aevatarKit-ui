/**
 * ============================================================================
 * Agent Type Definitions
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Agent Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Agent summary (for listing)
 */
export interface AgentSummary {
  id: string;
  name: string;
  type: string;
  category?: string;
  description?: string;
}

/**
 * Full agent info
 */
export interface AgentInfo extends AgentSummary {
  /** Agent capabilities */
  capabilities?: AgentCapability[];
  
  /** Available tools */
  tools?: AgentTool[];
  
  /** Configuration schema */
  configSchema?: Record<string, unknown>;
  
  /** Current configuration */
  config?: Record<string, unknown>;
  
  /** Creation time */
  createdAt?: string;
  
  /** Last update time */
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Capability
// ─────────────────────────────────────────────────────────────────────────────

export type AgentCapability =
  | 'chat'
  | 'reasoning'
  | 'tool_calling'
  | 'code_generation'
  | 'image_generation'
  | 'voice'
  | 'memory'
  | 'planning';

// ─────────────────────────────────────────────────────────────────────────────
// Agent Tool
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Creation Options
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateAgentOptions {
  name: string;
  type: string;
  category?: string;
  description?: string;
  config?: Record<string, unknown>;
}

