/**
 * ============================================================================
 * AG-UI Protocol Type Definitions
 * ============================================================================
 * Based on AG-UI Protocol specification
 * @see https://docs.ag-ui.com/
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Event Type Enumeration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AG-UI standard event types
 */
export type AgUiEventType =
  // Lifecycle events
  | 'RUN_STARTED'
  | 'RUN_FINISHED'
  | 'RUN_ERROR'
  | 'STEP_STARTED'
  | 'STEP_FINISHED'
  // Text message events
  | 'TEXT_MESSAGE_START'
  | 'TEXT_MESSAGE_CONTENT'
  | 'TEXT_MESSAGE_END'
  // Tool call events
  | 'TOOL_CALL_START'
  | 'TOOL_CALL_ARGS'
  | 'TOOL_CALL_END'
  | 'TOOL_CALL_RESULT'
  // State management events
  | 'STATE_SNAPSHOT'
  | 'STATE_DELTA'
  | 'MESSAGES_SNAPSHOT'
  // Pivot events (research direction change)
  | 'PIVOT_DETECTED'
  | 'PIVOT_STARTED'
  | 'PIVOT_PROGRESS'
  | 'PIVOT_COMPLETED'
  | 'PIVOT_ERROR'
  | 'PIVOT_CLARIFICATION_REQUEST'
  // Agent status events
  | 'AGENT_STATUS_REPORT'
  | 'ACTIVE_PLAN_CHANGED'
  // Custom events
  | 'CUSTOM';

// ─────────────────────────────────────────────────────────────────────────────
// Base Event Interface
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base interface for all AG-UI events
 */
export interface AgUiBaseEvent {
  type: AgUiEventType;
  timestamp?: number;
  rawEvent?: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle Events
// ─────────────────────────────────────────────────────────────────────────────

export interface RunStartedEvent extends AgUiBaseEvent {
  type: 'RUN_STARTED';
  runId: string;
  threadId: string;
}

export interface RunFinishedEvent extends AgUiBaseEvent {
  type: 'RUN_FINISHED';
  runId: string;
  threadId: string;
  result?: unknown;
}

export interface RunErrorEvent extends AgUiBaseEvent {
  type: 'RUN_ERROR';
  message: string;
  code?: string;
  /** Optional: some implementations include runId */
  runId?: string;
}

export interface StepStartedEvent extends AgUiBaseEvent {
  type: 'STEP_STARTED';
  /** Step name - primary identifier in backend */
  stepName: string;
  /** Optional step ID for frontend tracking */
  stepId?: string;
  /** Optional step type (e.g., 'llm_call', 'tool_call', 'vote') */
  stepType?: string;
}

export interface StepFinishedEvent extends AgUiBaseEvent {
  type: 'STEP_FINISHED';
  /** Step name - primary identifier in backend */
  stepName: string;
  /** Optional step ID for frontend tracking */
  stepId?: string;
  /** Optional result data */
  result?: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Text Message Events
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Message role - extensible to support custom roles
 * Common roles: 'user', 'assistant', 'system', 'tool'
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool' | string;

export interface TextMessageStartEvent extends AgUiBaseEvent {
  type: 'TEXT_MESSAGE_START';
  messageId: string;
  role: MessageRole;
}

export interface TextMessageContentEvent extends AgUiBaseEvent {
  type: 'TEXT_MESSAGE_CONTENT';
  messageId: string;
  delta: string;
}

export interface TextMessageEndEvent extends AgUiBaseEvent {
  type: 'TEXT_MESSAGE_END';
  messageId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool Call Events
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolCallStartEvent extends AgUiBaseEvent {
  type: 'TOOL_CALL_START';
  /** Message ID this tool call belongs to */
  messageId: string;
  toolCallId: string;
  toolName: string;
  /** @deprecated Use messageId instead */
  parentMessageId?: string;
}

export interface ToolCallArgsEvent extends AgUiBaseEvent {
  type: 'TOOL_CALL_ARGS';
  /** Message ID this tool call belongs to */
  messageId: string;
  toolCallId: string;
  /** Arguments delta (backend field name) */
  argsDelta: string;
  /** @deprecated Use argsDelta instead - kept for backward compatibility */
  delta?: string;
}

export interface ToolCallEndEvent extends AgUiBaseEvent {
  type: 'TOOL_CALL_END';
  /** Message ID this tool call belongs to */
  messageId: string;
  toolCallId: string;
}

export interface ToolCallResultEvent extends AgUiBaseEvent {
  type: 'TOOL_CALL_RESULT';
  /** Message ID this tool call belongs to */
  messageId: string;
  toolCallId: string;
  result: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// State Management Events
// ─────────────────────────────────────────────────────────────────────────────

export interface StateSnapshotEvent extends AgUiBaseEvent {
  type: 'STATE_SNAPSHOT';
  snapshot: Record<string, unknown>;
}

/**
 * JSON Patch operation (RFC 6902)
 */
export interface JsonPatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: unknown;
  from?: string;
}

export interface StateDeltaEvent extends AgUiBaseEvent {
  type: 'STATE_DELTA';
  delta: JsonPatchOperation[];
}

export interface MessagesSnapshotEvent extends AgUiBaseEvent {
  type: 'MESSAGES_SNAPSHOT';
  messages: AgUiMessage[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Pivot Events (Research Direction Change)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Emitted when the system detects a potential research direction change
 */
export interface PivotDetectedEvent extends AgUiBaseEvent {
  type: 'PIVOT_DETECTED';
  sessionId: string;
  pivotId: string;
  detectedIntent: string;
  confidence: number;
  newTopic?: string;
  needsClarification: boolean;
  preserveAspects?: string[];
}

/**
 * Emitted when a pivot operation begins executing
 */
export interface PivotStartedEvent extends AgUiBaseEvent {
  type: 'PIVOT_STARTED';
  sessionId: string;
  pivotId: string;
  oldDirection?: string;
  newDirection?: string;
}

/**
 * Emitted during pivot execution to report progress
 */
export interface PivotProgressEvent extends AgUiBaseEvent {
  type: 'PIVOT_PROGRESS';
  sessionId: string;
  pivotId: string;
  /** Stage name - flexible string to support future stages */
  stage: string;
  message: string;
  progress?: number;
}

/**
 * Well-known pivot progress stages
 * @description These are common stages, but backend may emit additional custom stages
 */
export type PivotProgressStage =
  | 'CancellingPlans'
  | 'PreservingKnowledge'
  | 'NotifyingAgents'
  | 'UpdatingDag'
  | string;

/**
 * Emitted when a pivot operation completes successfully
 */
export interface PivotCompletedEvent extends AgUiBaseEvent {
  type: 'PIVOT_COMPLETED';
  sessionId: string;
  pivotId: string;
  cancelledCount: number;
  preservedCount: number;
  newCount: number;
  /** Duration in milliseconds (defaults to 0 if not measured) */
  durationMs: number;
  summary?: string;
}

/**
 * Emitted when a pivot operation fails
 */
export interface PivotErrorEvent extends AgUiBaseEvent {
  type: 'PIVOT_ERROR';
  sessionId: string;
  pivotId: string;
  errorMessage: string;
  errorCode?: string;
}

/**
 * Emitted to request user clarification for low-confidence direction changes
 */
export interface PivotClarificationRequestEvent extends AgUiBaseEvent {
  type: 'PIVOT_CLARIFICATION_REQUEST';
  sessionId: string;
  pivotId: string;
  question: string;
  suggestedTopic?: string;
  confidence: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Status Events
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Emitted periodically by agents to report their current work status
 */
export interface AgentStatusReportEvent extends AgUiBaseEvent {
  type: 'AGENT_STATUS_REPORT';
  agentId: string;
  agentName: string;
  statusText: string;
  sessionId?: string;
  progress?: number;
}

/**
 * Emitted when the active (executing) plan node changes
 */
export interface ActivePlanChangedEvent extends AgUiBaseEvent {
  type: 'ACTIVE_PLAN_CHANGED';
  sessionId: string;
  activePlanNodeId?: string;
  previousPlanNodeId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Events
// ─────────────────────────────────────────────────────────────────────────────

export interface CustomEvent extends AgUiBaseEvent {
  type: 'CUSTOM';
  name: string;
  /** Event payload - may be undefined/null */
  value?: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Union Type for All Events
// ─────────────────────────────────────────────────────────────────────────────

export type AgUiEvent =
  | RunStartedEvent
  | RunFinishedEvent
  | RunErrorEvent
  | StepStartedEvent
  | StepFinishedEvent
  | TextMessageStartEvent
  | TextMessageContentEvent
  | TextMessageEndEvent
  | ToolCallStartEvent
  | ToolCallArgsEvent
  | ToolCallEndEvent
  | ToolCallResultEvent
  | StateSnapshotEvent
  | StateDeltaEvent
  | MessagesSnapshotEvent
  | PivotDetectedEvent
  | PivotStartedEvent
  | PivotProgressEvent
  | PivotCompletedEvent
  | PivotErrorEvent
  | PivotClarificationRequestEvent
  | AgentStatusReportEvent
  | ActivePlanChangedEvent
  | CustomEvent;

// ─────────────────────────────────────────────────────────────────────────────
// Message Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AG-UI Message representation
 */
export interface AgUiMessage {
  id: string;
  role: MessageRole;
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: AgUiToolCall[];
}

/**
 * Tool call within a message
 */
export interface AgUiToolCall {
  id: string;
  name: string;
  args: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Type Guards
// ─────────────────────────────────────────────────────────────────────────────

export function isRunStartedEvent(event: AgUiEvent): event is RunStartedEvent {
  return event.type === 'RUN_STARTED';
}

export function isRunFinishedEvent(event: AgUiEvent): event is RunFinishedEvent {
  return event.type === 'RUN_FINISHED';
}

export function isRunErrorEvent(event: AgUiEvent): event is RunErrorEvent {
  return event.type === 'RUN_ERROR';
}

export function isStepStartedEvent(event: AgUiEvent): event is StepStartedEvent {
  return event.type === 'STEP_STARTED';
}

export function isStepFinishedEvent(event: AgUiEvent): event is StepFinishedEvent {
  return event.type === 'STEP_FINISHED';
}

export function isTextMessageStartEvent(event: AgUiEvent): event is TextMessageStartEvent {
  return event.type === 'TEXT_MESSAGE_START';
}

export function isTextMessageContentEvent(event: AgUiEvent): event is TextMessageContentEvent {
  return event.type === 'TEXT_MESSAGE_CONTENT';
}

export function isTextMessageEndEvent(event: AgUiEvent): event is TextMessageEndEvent {
  return event.type === 'TEXT_MESSAGE_END';
}

export function isToolCallStartEvent(event: AgUiEvent): event is ToolCallStartEvent {
  return event.type === 'TOOL_CALL_START';
}

export function isToolCallResultEvent(event: AgUiEvent): event is ToolCallResultEvent {
  return event.type === 'TOOL_CALL_RESULT';
}

export function isStateSnapshotEvent(event: AgUiEvent): event is StateSnapshotEvent {
  return event.type === 'STATE_SNAPSHOT';
}

export function isStateDeltaEvent(event: AgUiEvent): event is StateDeltaEvent {
  return event.type === 'STATE_DELTA';
}

export function isMessagesSnapshotEvent(event: AgUiEvent): event is MessagesSnapshotEvent {
  return event.type === 'MESSAGES_SNAPSHOT';
}

export function isCustomEvent(event: AgUiEvent): event is CustomEvent {
  return event.type === 'CUSTOM';
}

// ─────────────────────────────────────────────────────────────────────────────
// Pivot Event Type Guards
// ─────────────────────────────────────────────────────────────────────────────

export function isPivotDetectedEvent(event: AgUiEvent): event is PivotDetectedEvent {
  return event.type === 'PIVOT_DETECTED';
}

export function isPivotStartedEvent(event: AgUiEvent): event is PivotStartedEvent {
  return event.type === 'PIVOT_STARTED';
}

export function isPivotProgressEvent(event: AgUiEvent): event is PivotProgressEvent {
  return event.type === 'PIVOT_PROGRESS';
}

export function isPivotCompletedEvent(event: AgUiEvent): event is PivotCompletedEvent {
  return event.type === 'PIVOT_COMPLETED';
}

export function isPivotErrorEvent(event: AgUiEvent): event is PivotErrorEvent {
  return event.type === 'PIVOT_ERROR';
}

export function isPivotClarificationRequestEvent(event: AgUiEvent): event is PivotClarificationRequestEvent {
  return event.type === 'PIVOT_CLARIFICATION_REQUEST';
}

/** Check if event is any pivot-related event */
export function isPivotEvent(event: AgUiEvent): event is
  | PivotDetectedEvent
  | PivotStartedEvent
  | PivotProgressEvent
  | PivotCompletedEvent
  | PivotErrorEvent
  | PivotClarificationRequestEvent {
  return event.type.startsWith('PIVOT_');
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Status Event Type Guards
// ─────────────────────────────────────────────────────────────────────────────

export function isAgentStatusReportEvent(event: AgUiEvent): event is AgentStatusReportEvent {
  return event.type === 'AGENT_STATUS_REPORT';
}

export function isActivePlanChangedEvent(event: AgUiEvent): event is ActivePlanChangedEvent {
  return event.type === 'ACTIVE_PLAN_CHANGED';
}

