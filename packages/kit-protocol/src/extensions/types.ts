/**
 * ============================================================================
 * Aevatar Extension Event Types
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
  | 'aevatar.vibe.active_plan_changed';

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
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic Custom Event Type
// ─────────────────────────────────────────────────────────────────────────────

export type AevatarCustomEvent<T extends AevatarCustomEventName> = AevatarCustomEventMap[T];

