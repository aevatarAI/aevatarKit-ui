/**
 * ============================================================================
 * Aevatar Extension Event Types
 * ============================================================================
 * Centralized type definitions for all Aevatar custom events
 * ============================================================================
 */

import type { AevatarProgressEvent } from './progress';
import type { AevatarGraphEvent } from './graph';
import type { AevatarVotingEvent, AevatarConsensusEvent } from './voting';
import type { AevatarWorkerStartedEvent, AevatarWorkerCompletedEvent, AevatarTaskDecomposedEvent } from './worker';
import type {
  AevatarPivotDetectedValue,
  AevatarPivotStartedValue,
  AevatarPivotProgressValue,
  AevatarPivotCompletedValue,
  AevatarPivotErrorValue,
  AevatarPivotClarificationValue,
} from './pivot';
import type {
  AevatarAgentStatusReportValue,
  AevatarActivePlanChangedValue,
} from './agent-status';
import type { WorkflowExecutionEventValue } from './workflow';
import type {
  // Vibe event values
  VibeAgentsSnapshotValue,
  VibeAgentProvidersSnapshotValue,
  VibeMessageMetaValue,
  VibeDagSnapshotValue,
  VibeDagUpdatedValue,
  VibeMilestoneStartedValue,
  VibeMilestoneFinishedValue,
  VibeMilestoneErrorValue,
  VibeBriefValue,
  VibeRoundSummaryValue,
  // Scientific event values
  ScientificToolsSnapshotValue,
  ScientificSessionValue,
  ScientificToolStartValue,
  ScientificToolEndValue,
  ScientificMcpReconnectStartedValue,
  ScientificMcpReconnectFinishedValue,
  ScientificMcpReconnectErrorValue,
  AxiomStatusSnapshotValue,
} from './vibe-events';

// ─────────────────────────────────────────────────────────────────────────────
// Event Name Union
// ─────────────────────────────────────────────────────────────────────────────

export type AevatarCustomEventName =
  // Core events
  | 'aevatar.progress'
  | 'aevatar.graph'
  | 'aevatar.voting'
  | 'aevatar.consensus'
  | 'aevatar.task_decomposed'
  | 'aevatar.worker_started'
  | 'aevatar.worker_completed'
  // Workflow events
  | 'aevatar.workflow.execution_event'
  | 'aevatar.llm.trace'
  // Pivot events
  | 'aevatar.vibe.pivot_detected'
  | 'aevatar.vibe.pivot_initiated'
  | 'aevatar.vibe.pivot_progress'
  | 'aevatar.vibe.pivot_completed'
  | 'aevatar.vibe.pivot_error'
  | 'aevatar.vibe.pivot_clarification'
  // Agent status events
  | 'aevatar.vibe.agent_status_report'
  | 'aevatar.vibe.active_plan_changed'
  // Vibe snapshot events
  | 'aevatar.vibe.agents_snapshot'
  | 'aevatar.vibe.agent_providers_snapshot'
  | 'aevatar.vibe.message_meta'
  | 'aevatar.vibe.dag_snapshot'
  | 'aevatar.vibe.dag_updated'
  // Vibe milestone events
  | 'aevatar.vibe.milestone_started'
  | 'aevatar.vibe.milestone_finished'
  | 'aevatar.vibe.milestone_error'
  // Vibe brief events
  | 'aevatar.vibe.brief_updated'
  | 'aevatar.vibe.brief_snapshot'
  | 'aevatar.vibe.round_summary'
  // Scientific events
  | 'aevatar.scientific.tools_snapshot'
  | 'aevatar.scientific.session'
  | 'aevatar.scientific.tool_start'
  | 'aevatar.scientific.tool_end'
  | 'aevatar.scientific.mcp_reconnect_started'
  | 'aevatar.scientific.mcp_reconnect_finished'
  | 'aevatar.scientific.mcp_reconnect_error'
  // Axiom events
  | 'aevatar.axiom.status_snapshot';

// ─────────────────────────────────────────────────────────────────────────────
// Event Type Map
// ─────────────────────────────────────────────────────────────────────────────

export interface AevatarCustomEventMap {
  // Core events
  'aevatar.progress': AevatarProgressEvent;
  'aevatar.graph': AevatarGraphEvent;
  'aevatar.voting': AevatarVotingEvent;
  'aevatar.consensus': AevatarConsensusEvent;
  'aevatar.task_decomposed': AevatarTaskDecomposedEvent;
  'aevatar.worker_started': AevatarWorkerStartedEvent;
  'aevatar.worker_completed': AevatarWorkerCompletedEvent;
  // Workflow events
  'aevatar.workflow.execution_event': WorkflowExecutionEventValue;
  'aevatar.llm.trace': WorkflowExecutionEventValue;
  // Pivot events
  'aevatar.vibe.pivot_detected': AevatarPivotDetectedValue;
  'aevatar.vibe.pivot_initiated': AevatarPivotStartedValue;
  'aevatar.vibe.pivot_progress': AevatarPivotProgressValue;
  'aevatar.vibe.pivot_completed': AevatarPivotCompletedValue;
  'aevatar.vibe.pivot_error': AevatarPivotErrorValue;
  'aevatar.vibe.pivot_clarification': AevatarPivotClarificationValue;
  // Agent status events
  'aevatar.vibe.agent_status_report': AevatarAgentStatusReportValue;
  'aevatar.vibe.active_plan_changed': AevatarActivePlanChangedValue;
  // Vibe snapshot events
  'aevatar.vibe.agents_snapshot': VibeAgentsSnapshotValue;
  'aevatar.vibe.agent_providers_snapshot': VibeAgentProvidersSnapshotValue;
  'aevatar.vibe.message_meta': VibeMessageMetaValue;
  'aevatar.vibe.dag_snapshot': VibeDagSnapshotValue;
  'aevatar.vibe.dag_updated': VibeDagUpdatedValue;
  // Vibe milestone events
  'aevatar.vibe.milestone_started': VibeMilestoneStartedValue;
  'aevatar.vibe.milestone_finished': VibeMilestoneFinishedValue;
  'aevatar.vibe.milestone_error': VibeMilestoneErrorValue;
  // Vibe brief events
  'aevatar.vibe.brief_updated': VibeBriefValue;
  'aevatar.vibe.brief_snapshot': VibeBriefValue;
  'aevatar.vibe.round_summary': VibeRoundSummaryValue;
  // Scientific events
  'aevatar.scientific.tools_snapshot': ScientificToolsSnapshotValue;
  'aevatar.scientific.session': ScientificSessionValue;
  'aevatar.scientific.tool_start': ScientificToolStartValue;
  'aevatar.scientific.tool_end': ScientificToolEndValue;
  'aevatar.scientific.mcp_reconnect_started': ScientificMcpReconnectStartedValue;
  'aevatar.scientific.mcp_reconnect_finished': ScientificMcpReconnectFinishedValue;
  'aevatar.scientific.mcp_reconnect_error': ScientificMcpReconnectErrorValue;
  // Axiom events
  'aevatar.axiom.status_snapshot': AxiomStatusSnapshotValue;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic Custom Event Type
// ─────────────────────────────────────────────────────────────────────────────

export type AevatarCustomEvent<T extends AevatarCustomEventName> = AevatarCustomEventMap[T];

