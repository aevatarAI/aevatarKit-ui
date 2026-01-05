/**
 * ============================================================================
 * @aevatar/kit-react
 * ============================================================================
 * React components and hooks for AevatarKit SDK
 * 
 * This package provides:
 * - AevatarProvider for context management
 * - Hooks for session, run, and event handling
 * - UI components for chat, timeline, and graph visualization
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────
export { AevatarProvider, type AevatarProviderProps } from './context/AevatarProvider';
export { AevatarContext, type AevatarContextValue } from './context/AevatarContext';

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────
export { useAevatar } from './hooks/useAevatar';
export { useSession, type UseSessionResult } from './hooks/useSession';
export { useRun, type UseRunResult } from './hooks/useRun';
export { useEventStream, type UseEventStreamResult } from './hooks/useEventStream';
export { useMessages, type UseMessagesResult } from './hooks/useMessages';
export { useProgress, type UseProgressResult } from './hooks/useProgress';
export { useConnection, type UseConnectionResult } from './hooks/useConnection';
export { 
  useToolCalls, 
  type UseToolCallsResult, 
  type UseToolCallsOptions,
  type ToolCallState,
  type ToolCallStatus,
} from './hooks/useToolCalls';

// ─────────────────────────────────────────────────────────────────────────────
// Components - Chat
// ─────────────────────────────────────────────────────────────────────────────
export { ChatPanel, type ChatPanelProps } from './components/chat/ChatPanel';
export { MessageList, type MessageListProps } from './components/chat/MessageList';
export { MessageBubble, type MessageBubbleProps } from './components/chat/MessageBubble';
export { InputArea, type InputAreaProps } from './components/chat/InputArea';

// ─────────────────────────────────────────────────────────────────────────────
// Components - Timeline
// ─────────────────────────────────────────────────────────────────────────────
export { TimelineView, type TimelineViewProps } from './components/timeline/TimelineView';
export { StepCard, type StepCardProps } from './components/timeline/StepCard';
export { StreamingText, type StreamingTextProps } from './components/timeline/StreamingText';

// ─────────────────────────────────────────────────────────────────────────────
// Components - Common
// ─────────────────────────────────────────────────────────────────────────────
export { LoadingSpinner, type LoadingSpinnerProps } from './components/common/LoadingSpinner';
export { ConnectionStatus, type ConnectionStatusProps } from './components/common/ConnectionStatus';
export { ProgressBar, type ProgressBarProps } from './components/common/ProgressBar';

// ─────────────────────────────────────────────────────────────────────────────
// Components - Tool Call
// ─────────────────────────────────────────────────────────────────────────────
export { ToolCallCard, type ToolCallCardProps } from './components/toolcall/ToolCallCard';
export { ToolCallList, type ToolCallListProps } from './components/toolcall/ToolCallList';
export { ToolCallBadge, type ToolCallBadgeProps } from './components/toolcall/ToolCallBadge';
export { ToolCallPanel, type ToolCallPanelProps } from './components/toolcall/ToolCallPanel';

// ─────────────────────────────────────────────────────────────────────────────
// A2UI (Agent-to-User Interface)
// ─────────────────────────────────────────────────────────────────────────────
export * from './a2ui';

// ─────────────────────────────────────────────────────────────────────────────
// Theme System
// ─────────────────────────────────────────────────────────────────────────────
export * from './theme';

// ─────────────────────────────────────────────────────────────────────────────
// Re-export core and types
// ─────────────────────────────────────────────────────────────────────────────
export {
  createAevatarClient,
  createEventStream,
  type AevatarClient,
} from '@aevatar/kit-core';

export type {
  AgUiEvent,
  AgUiEventType,
  AgUiMessage,
  Session,
  SessionState,
  Run,
  RunStatus,
  StepInfo,
  ConnectionStatus as ConnectionStatusType,
} from '@aevatar/kit-types';

