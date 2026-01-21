/**
 * ============================================================================
 * Agent Status Extension Events
 * ============================================================================
 * Event names for agent status reporting and plan tracking
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Agent Status Event Value Types (for CUSTOM events)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Agent status report event value (via CUSTOM)
 * Emitted periodically by agents to report their current work status
 */
export interface AevatarAgentStatusReportValue {
  /** Unique identifier for the agent */
  agentId: string;
  /** Display name of the agent */
  agentName: string;
  /** Brief, single-line status text describing current work */
  statusText: string;
  /** Optional session this agent is working on */
  sessionId?: string;
  /** Optional progress percentage (0.0 to 1.0) */
  progress?: number;
}

/**
 * Active plan changed event value (via CUSTOM)
 * Emitted when the active (executing) plan node changes
 */
export interface AevatarActivePlanChangedValue {
  /** Session ID */
  sessionId: string;
  /** The plan node ID that is now active (or null if none) */
  activePlanNodeId?: string;
  /** The plan node ID that was previously active (or null if none) */
  previousPlanNodeId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Status Custom Event Names
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Custom event names for agent status operations
 */
export const AgentStatusCustomEventNames = {
  STATUS_REPORT: 'aevatar.vibe.agent_status_report',
  ACTIVE_PLAN_CHANGED: 'aevatar.vibe.active_plan_changed',
} as const;

export type AgentStatusCustomEventName = typeof AgentStatusCustomEventNames[keyof typeof AgentStatusCustomEventNames];

