/**
 * ============================================================================
 * Vibe Event Names & Types
 * ============================================================================
 * Well-known CUSTOM event names and value types for Vibe Researching system
 * Mirrors backend VibeEventNames constants
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Vibe Event Value Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Agent roster item in agents_snapshot
 */
export interface VibeAgentRosterItem {
  agent: string;
  agentId?: string;
  description?: string;
  capabilities?: string[];
}

/**
 * Value for aevatar.vibe.agents_snapshot
 */
export interface VibeAgentsSnapshotValue {
  agents: VibeAgentRosterItem[];
}

/**
 * Value for aevatar.vibe.agent_providers_snapshot
 */
export interface VibeAgentProvidersSnapshotValue {
  providers: Record<string, string>;
}

/**
 * Value for aevatar.vibe.message_meta
 * Per-message metadata linking to agent/step/provider
 */
export interface VibeMessageMetaValue {
  messageId: string;
  agent: string;
  stepName?: string;
  providerName?: string;
  runId?: string;
}

/**
 * DAG Node in snapshot
 */
export interface VibeDagNode {
  id: string;
  label?: string;
  type?: string;
  kind?: 'Plan' | 'Knowledge';
  status?: string;
  owner?: string;
  proof?: string;
  attestations?: Array<{ pubkey?: string; signature?: string }>;
  attestationsCount?: number;
  sessionId?: string;
  planStatus?: 'Pending' | 'Active' | 'Completed';
}

/**
 * DAG Edge in snapshot
 */
export interface VibeDagEdge {
  fromId: string;
  toId: string;
  type?: string;
}

/**
 * Value for aevatar.vibe.dag_snapshot
 */
export interface VibeDagSnapshotValue {
  sessionId?: string;
  updatedAt?: string;
  nodes: VibeDagNode[];
  edges: VibeDagEdge[];
  truncated?: boolean;
}

/**
 * Value for aevatar.vibe.dag_updated
 */
export interface VibeDagUpdatedValue {
  sessionId?: string;
  reason?: string;
  affectedNodeIds?: string[];
}

/**
 * Value for aevatar.vibe.milestone_started
 */
export interface VibeMilestoneStartedValue {
  sessionId?: string;
  milestoneNodeId: string;
  milestoneIndex?: number;
  totalMilestones?: number;
  title?: string;
}

/**
 * Value for aevatar.vibe.milestone_finished
 */
export interface VibeMilestoneFinishedValue {
  sessionId?: string;
  milestoneNodeId: string;
  milestoneIndex?: number;
  success?: boolean;
  error?: string;
}

/**
 * Value for aevatar.vibe.milestone_error
 */
export interface VibeMilestoneErrorValue {
  sessionId?: string;
  milestoneNodeId: string;
  error: string;
  recoverable?: boolean;
}

/**
 * Value for aevatar.vibe.brief_updated / brief_snapshot
 */
export interface VibeBriefValue {
  sessionId?: string;
  title?: string;
  summary?: string;
  keywords?: string[];
  sources?: string[];
  updatedAt?: string;
}

/**
 * Value for aevatar.vibe.round_summary
 */
export interface VibeRoundSummaryValue {
  sessionId?: string;
  round: number;
  summary: string;
  keyFindings?: string[];
  nextSteps?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Vibe Core Event Names
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Well-known CustomEvent names for the aevatar.vibe namespace
 * Use these constants when subscribing to CUSTOM events for type safety
 */
export const VibeEventNames = {
  // Agent Status
  AGENT_STATUS_REPORT: 'aevatar.vibe.agent_status_report',
  ACTIVE_PLAN_CHANGED: 'aevatar.vibe.active_plan_changed',

  // DAG Operations
  DAG_UPDATED: 'aevatar.vibe.dag_updated',
  DAG_SNAPSHOT: 'aevatar.vibe.dag_snapshot',

  // Pivot Operations
  PIVOT_DETECTED: 'aevatar.vibe.pivot_detected',
  PIVOT_STARTED: 'aevatar.vibe.pivot_initiated',
  PIVOT_PROGRESS: 'aevatar.vibe.pivot_progress',
  PIVOT_COMPLETED: 'aevatar.vibe.pivot_completed',
  PIVOT_ERROR: 'aevatar.vibe.pivot_error',

  // Mesh Operations
  MESH_STARTED: 'aevatar.vibe.mesh_started',
  MESH_NODE_STARTED: 'aevatar.vibe.mesh_node_started',
  MESH_NODE_FINISHED: 'aevatar.vibe.mesh_node_finished',
  MESH_FINISHED: 'aevatar.vibe.mesh_finished',
  MESH_MISSING: 'aevatar.vibe.mesh_missing',
  MESH_SAVED: 'aevatar.vibe.mesh_saved',

  // Milestone Operations
  MILESTONE_STARTED: 'aevatar.vibe.milestone_started',
  MILESTONE_ERROR: 'aevatar.vibe.milestone_error',
  MILESTONE_FINISHED: 'aevatar.vibe.milestone_finished',

  // Brief/Summary
  BRIEF_UPDATED: 'aevatar.vibe.brief_updated',
  BRIEF_SNAPSHOT: 'aevatar.vibe.brief_snapshot',
  ROUND_SUMMARY: 'aevatar.vibe.round_summary',

  // Delivery
  DELIVERY_SNAPSHOT: 'aevatar.vibe.delivery_snapshot',

  // Trace/Debug
  TRACE_SNAPSHOT: 'aevatar.vibe.trace_snapshot',

  // Agent Providers
  AGENTS_SNAPSHOT: 'aevatar.vibe.agents_snapshot',
  AGENT_PROVIDERS_SNAPSHOT: 'aevatar.vibe.agent_providers_snapshot',

  // Message Metadata
  MESSAGE_META: 'aevatar.vibe.message_meta',
  MESSAGE_META_SNAPSHOT: 'aevatar.vibe.message_meta_snapshot',

  // Plan DAG
  PLAN_DAG_WRITTEN: 'aevatar.vibe.plan_dag_written',
  MILESTONES_PLAN_DAG_WRITTEN: 'aevatar.vibe.milestones_plan_dag_written',
} as const;

export type VibeEventName = typeof VibeEventNames[keyof typeof VibeEventNames];

// ─────────────────────────────────────────────────────────────────────────────
// Scientific Events
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scientific/system signal event names
 */
export const ScientificEventNames = {
  SESSION: 'aevatar.scientific.session',
  RUN_CANCELED: 'aevatar.scientific.run_canceled',
  RUN_INTERRUPTED: 'aevatar.scientific.run_interrupted',
  TOOLS_SNAPSHOT: 'aevatar.scientific.tools_snapshot',
  TOOL_START: 'aevatar.scientific.tool_start',
  TOOL_END: 'aevatar.scientific.tool_end',
  FACT_PROPOSED: 'aevatar.scientific.fact_proposed',
  MCP_RECONNECT_STARTED: 'aevatar.scientific.mcp_reconnect_started',
  MCP_RECONNECT_FINISHED: 'aevatar.scientific.mcp_reconnect_finished',
  MCP_RECONNECT_ERROR: 'aevatar.scientific.mcp_reconnect_error',
} as const;

export type ScientificEventName = typeof ScientificEventNames[keyof typeof ScientificEventNames];

// ─────────────────────────────────────────────────────────────────────────────
// Scientific Event Value Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tool summary in tools_snapshot
 */
export interface ScientificToolSummary {
  name: string;
  description?: string;
  category?: string;
  source?: 'MCP' | 'AGENT_SKILLS' | string;
  tags?: string[];
}

/**
 * Value for aevatar.scientific.tools_snapshot
 */
export interface ScientificToolsSnapshotValue {
  tools: ScientificToolSummary[];
}

/**
 * Value for aevatar.scientific.session
 */
export interface ScientificSessionValue {
  runId?: string;
  prompt?: string;
  mode?: 'chat' | 'vibe' | 'vibe_loop';
  sessionId?: string;
}

/**
 * Value for aevatar.scientific.tool_start
 */
export interface ScientificToolStartValue {
  runId: string;
  toolCallId: string;
  toolName: string;
  isMcp?: boolean;
  args?: Record<string, unknown>;
}

/**
 * Value for aevatar.scientific.tool_end
 */
export interface ScientificToolEndValue {
  runId: string;
  toolCallId: string;
  toolName: string;
  isMcp?: boolean;
  success: boolean;
  durationMs?: number;
  error?: string;
  resultPreview?: string;
}

/**
 * Value for aevatar.scientific.mcp_reconnect_started
 */
export interface ScientificMcpReconnectStartedValue {
  sessionId?: string;
  reason?: string;
}

/**
 * Value for aevatar.scientific.mcp_reconnect_finished
 */
export interface ScientificMcpReconnectFinishedValue {
  sessionId?: string;
  toolsCount?: number;
}

/**
 * Value for aevatar.scientific.mcp_reconnect_error
 */
export interface ScientificMcpReconnectErrorValue {
  sessionId?: string;
  error: string;
}

/**
 * Value for aevatar.axiom.status_snapshot
 */
export interface AxiomStatusSnapshotValue {
  status: string;
  phase: string;
  progressPercent: number;
  totalTokens?: number;
  totalLlmCalls?: number;
}

/**
 * Axiom-specific event names
 */
export const AxiomEventNames = {
  STATUS_SNAPSHOT: 'aevatar.axiom.status_snapshot',
  GRAPH: 'aevatar.axiom.graph',
} as const;

export type AxiomEventName = typeof AxiomEventNames[keyof typeof AxiomEventNames];

// ─────────────────────────────────────────────────────────────────────────────
// UI Events
// ─────────────────────────────────────────────────────────────────────────────

/**
 * UI-specific event names
 */
export const UiEventNames = {
  TOOLS_SNAPSHOT: 'aevatar.ui.tools_snapshot',
  RUN_STEPS_SNAPSHOT: 'aevatar.ui.run_steps_snapshot',
} as const;

export type UiEventName = typeof UiEventNames[keyof typeof UiEventNames];

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Events
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Workflow execution event names (from AgUiExecutionTraceMapper)
 */
export const WorkflowEventNames = {
  EXECUTION_EVENT: 'aevatar.workflow.execution_event',
  LLM_TRACE: 'aevatar.llm.trace',
} as const;

export type WorkflowEventName = typeof WorkflowEventNames[keyof typeof WorkflowEventNames];

// ─────────────────────────────────────────────────────────────────────────────
// All Event Names
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All known Aevatar CUSTOM event names
 */
export const AevatarEventNames = {
  ...VibeEventNames,
  ...ScientificEventNames,
  ...UiEventNames,
  ...WorkflowEventNames,
} as const;

export type AevatarEventName =
  | VibeEventName
  | ScientificEventName
  | UiEventName
  | WorkflowEventName;

