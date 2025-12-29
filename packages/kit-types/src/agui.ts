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
  threadId?: string;
}

export interface RunFinishedEvent extends AgUiBaseEvent {
  type: 'RUN_FINISHED';
  runId: string;
  result?: unknown;
}

export interface RunErrorEvent extends AgUiBaseEvent {
  type: 'RUN_ERROR';
  runId: string;
  message: string;
  code?: string;
}

export interface StepStartedEvent extends AgUiBaseEvent {
  type: 'STEP_STARTED';
  stepId: string;
  stepName?: string;
  stepType?: string;
}

export interface StepFinishedEvent extends AgUiBaseEvent {
  type: 'STEP_FINISHED';
  stepId: string;
  result?: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Text Message Events
// ─────────────────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

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
  toolCallId: string;
  toolName: string;
  parentMessageId?: string;
}

export interface ToolCallArgsEvent extends AgUiBaseEvent {
  type: 'TOOL_CALL_ARGS';
  toolCallId: string;
  delta: string;
}

export interface ToolCallEndEvent extends AgUiBaseEvent {
  type: 'TOOL_CALL_END';
  toolCallId: string;
}

export interface ToolCallResultEvent extends AgUiBaseEvent {
  type: 'TOOL_CALL_RESULT';
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
// Custom Events
// ─────────────────────────────────────────────────────────────────────────────

export interface CustomEvent extends AgUiBaseEvent {
  type: 'CUSTOM';
  name: string;
  value: unknown;
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

