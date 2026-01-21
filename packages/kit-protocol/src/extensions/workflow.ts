/**
 * ============================================================================
 * Workflow Execution Event Types
 * ============================================================================
 * Type definitions for aevatar.workflow.execution_event CUSTOM events
 * Mirrors backend AgUiExecutionTraceMapper output
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Status
// ─────────────────────────────────────────────────────────────────────────────

export type WorkflowStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type WorkflowStepType =
  | 'llm_call'
  | 'vote'
  | 'fan_out'
  | 'workflow_call'
  | string;

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Execution Event Value
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Value structure for CUSTOM event with name "aevatar.workflow.execution_event"
 */
export interface WorkflowExecutionEventValue {
  /** Execution phase name */
  phase: string;
  /** Node identifier */
  nodeId: string;
  /** Human-readable message */
  message: string;
  /** Current status */
  status: WorkflowStatus;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** Extended fields */
  fields: WorkflowExecutionFields;
}

/**
 * Extended fields in workflow execution event
 */
export interface WorkflowExecutionFields {
  // ─────────────────────────────────────────────────────────────────────────
  // Basic Fields
  // ─────────────────────────────────────────────────────────────────────────

  /** Status string */
  status?: string;
  /** Progress (0.0 - 1.0) */
  progress?: number;
  /** Execution run ID */
  execution_id?: string;
  /** Workflow name (e.g., "maker") */
  workflow_name?: string;
  /** Step type */
  step_type?: WorkflowStepType;
  /** Nesting depth */
  depth?: number;
  /** Parent step ID */
  parent_step_id?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // Vote Fields (for consensus)
  // ─────────────────────────────────────────────────────────────────────────

  /** Current vote round */
  vote_round?: number;
  /** Maximum vote rounds */
  vote_max_rounds?: number;
  /** Required votes for consensus (k) */
  vote_k?: number;
  /** Current vote count */
  vote_current_votes?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Winner Fields (after consensus)
  // ─────────────────────────────────────────────────────────────────────────

  /** Winning proposal ID */
  winner_proposal_id?: string;
  /** Winner content hash */
  winner_hash?: string;
  /** Winner vote count */
  winner_votes?: number;
  /** Runner-up vote count */
  winner_runner_up_votes?: number;
  /** Number of clusters */
  winner_cluster_count?: number;
  /** Semantic description */
  winner_semantic?: string;
  /** Whether consensus was reached */
  winner_is_consensus?: boolean;

  // ─────────────────────────────────────────────────────────────────────────
  // Parallel Execution Fields
  // ─────────────────────────────────────────────────────────────────────────

  /** Total parallel tasks */
  parallel_total?: number;
  /** Completed parallel tasks */
  parallel_completed?: number;
  /** Failed parallel tasks */
  parallel_failed?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Worker Fields
  // ─────────────────────────────────────────────────────────────────────────

  /** Worker identifier */
  worker_id?: string;
  /** Proposal identifier */
  proposal_id?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // Token Usage
  // ─────────────────────────────────────────────────────────────────────────

  /** Total tokens used */
  tokens_used?: number;
  /** Number of LLM calls */
  llm_calls?: number;
  /** Prompt tokens */
  prompt_tokens?: number;
  /** Completion tokens */
  completion_tokens?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // LLM Response
  // ─────────────────────────────────────────────────────────────────────────

  /** Assistant response content (for streaming) */
  assistant_response?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // Index signature for additional fields
  // ─────────────────────────────────────────────────────────────────────────

  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// DAG Consensus Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const DAG_CONSENSUS_PREFIX = 'dag_consensus:';

/**
 * DAG consensus stages
 */
export type DagConsensusStage =
  | 'check_atomic'
  | 'decompose'
  | 'execute_subtasks'
  | 'compose'
  | 'LOADING'
  | 'EXECUTING'
  | 'COMPLETE';

/**
 * Parsed DAG consensus node ID
 */
export interface ParsedDagConsensusNodeId {
  /** Whether this is a DAG consensus node */
  isDagConsensus: boolean;
  /** Step ID (without prefix) */
  stepId: string | null;
  /** Proposal index (from .gen[n] suffix) */
  proposalIndex: number | null;
  /** Whether this is a proposal node */
  isProposal: boolean;
}

/**
 * Parse a nodeId to extract DAG consensus information
 *
 * @example
 * parseDagConsensusNodeId('dag_consensus:decompose')
 * // { isDagConsensus: true, stepId: 'decompose', proposalIndex: null, isProposal: false }
 *
 * @example
 * parseDagConsensusNodeId('dag_consensus:decompose.gen[0]')
 * // { isDagConsensus: true, stepId: 'decompose', proposalIndex: 0, isProposal: true }
 */
export function parseDagConsensusNodeId(nodeId: string): ParsedDagConsensusNodeId {
  if (!nodeId.startsWith(DAG_CONSENSUS_PREFIX)) {
    return {
      isDagConsensus: false,
      stepId: null,
      proposalIndex: null,
      isProposal: false,
    };
  }

  const rest = nodeId.slice(DAG_CONSENSUS_PREFIX.length);
  const genMatch = rest.match(/^(.+)\.gen\[(\d+)\]$/);

  if (genMatch) {
    return {
      isDagConsensus: true,
      stepId: genMatch[1],
      proposalIndex: parseInt(genMatch[2], 10),
      isProposal: true,
    };
  }

  return {
    isDagConsensus: true,
    stepId: rest,
    proposalIndex: null,
    isProposal: false,
  };
}

/**
 * Check if an execution event is for DAG consensus
 */
export function isDagConsensusEvent(event: WorkflowExecutionEventValue): boolean {
  return event.nodeId.startsWith(DAG_CONSENSUS_PREFIX);
}

/**
 * Check if an execution event is a proposal generation
 */
export function isProposalEvent(event: WorkflowExecutionEventValue): boolean {
  const parsed = parseDagConsensusNodeId(event.nodeId);
  return parsed.isProposal;
}

/**
 * Check if an execution event is a vote step
 */
export function isVoteEvent(event: WorkflowExecutionEventValue): boolean {
  return event.fields.step_type === 'vote';
}

/**
 * Check if consensus was reached in a vote event
 */
export function isConsensusReached(event: WorkflowExecutionEventValue): boolean {
  const { vote_current_votes, vote_k } = event.fields;
  if (vote_current_votes === undefined || vote_k === undefined) {
    return false;
  }
  return vote_current_votes >= vote_k;
}
