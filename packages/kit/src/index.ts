/**
 * ============================================================================
 * @aevatar/kit
 * ============================================================================
 * AevatarKit SDK - Complete TypeScript SDK for Aevatar Agent Framework
 * 
 * This is the main package that re-exports all sub-packages for convenience.
 * You can also import individual packages for smaller bundle sizes.
 * 
 * @example
 * // Full import
 * import { createAevatarClient, AevatarProvider, useSession } from '@aevatar/kit';
 * 
 * // Individual imports for smaller bundles
 * import { createAevatarClient } from '@aevatar/kit-core';
 * import { AevatarProvider, useSession } from '@aevatar/kit-react';
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types (from @aevatar/kit-types)
// ─────────────────────────────────────────────────────────────────────────────
export type {
  // AG-UI types
  AgUiEvent,
  AgUiEventType,
  AgUiBaseEvent,
  AgUiMessage,
  AgUiToolCall,
  MessageRole,
  JsonPatchOperation,
  CustomEvent,
  RunStartedEvent,
  RunFinishedEvent,
  RunErrorEvent,
  StepStartedEvent,
  StepFinishedEvent,
  TextMessageStartEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  ToolCallStartEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  ToolCallResultEvent,
  StateSnapshotEvent,
  StateDeltaEvent,
  MessagesSnapshotEvent,
  
  // Session types
  Session,
  SessionSummary,
  SessionConfig,
  SessionState,
  SessionStatus,
  CreateSessionOptions,
  
  // Run types
  Run,
  RunSummary,
  RunInput,
  RunStatus,
  StepInfo,
  StepStatus,
  RunMetrics,
  
  // Agent types
  AgentInfo,
  AgentSummary,
  AgentCapability,
  AgentTool,
  
  // Graph types
  GraphDefinition,
  GraphSummary,
  GraphNode,
  GraphEdge,
  GraphNodeType,
  
  // Memory types
  Memory,
  MemorySummary,
  MemoryEntry,
  MemoryScope,
  MemorySearchOptions,
  MemorySearchResult,
  
  // Client types
  ClientOptions,
  ConnectionStatus as ConnectionStatusType,
  RetryOptions,
  LogLevel,
  LoggerOptions,
  EventStreamOptions,
  
  // Utility types
  Unsubscribe,
  AsyncResult,
  PaginatedResponse,
  ApiError,
  EventHandler,
} from '@aevatar/kit-types';

// Type guards
export {
  isRunStartedEvent,
  isRunFinishedEvent,
  isRunErrorEvent,
  isStepStartedEvent,
  isStepFinishedEvent,
  isTextMessageStartEvent,
  isTextMessageContentEvent,
  isTextMessageEndEvent,
  isToolCallStartEvent,
  isToolCallResultEvent,
  isStateSnapshotEvent,
  isStateDeltaEvent,
  isMessagesSnapshotEvent,
  isCustomEvent,
} from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Protocol (from @aevatar/kit-protocol)
// ─────────────────────────────────────────────────────────────────────────────
export {
  createConnection,
  createEventStream,
  parseAgUiEvent,
  parseCustomEvent,
  createEventRouter,
  type Connection,
  type ConnectionOptions,
  type EventStream,
  type StreamStatus,
  type EventRouter,
} from '@aevatar/kit-protocol';

// Aevatar extension types (for SSE event streaming)
export type {
  AevatarCustomEventName,
  AevatarCustomEvent,
  AevatarProgressEvent,
  AevatarGraphEvent,
  AevatarGraphUpdateEvent,
  AevatarVotingEvent,
  AevatarConsensusEvent,
  AevatarWorkerStartedEvent,
  AevatarWorkerCompletedEvent,
  AevatarTaskDecomposedEvent,
  EventGraphNode,
  EventGraphEdge,
  VotingCandidate,
  SubTask,
} from '@aevatar/kit-protocol';

// ─────────────────────────────────────────────────────────────────────────────
// Core (from @aevatar/kit-core)
// ─────────────────────────────────────────────────────────────────────────────
export {
  createAevatarClient,
  createSessionManager,
  createRunManager,
  createStateStore,
  createLogger,
  createRetryManager,
  type AevatarClient,
  type SessionManager,
  type SessionInstance,
  type RunManager,
  type RunInstance,
  type StateStore,
  type Logger,
  type RetryManager,
} from '@aevatar/kit-core';

// ─────────────────────────────────────────────────────────────────────────────
// React (from @aevatar/kit-react)
// ─────────────────────────────────────────────────────────────────────────────
export {
  // Context
  AevatarProvider,
  AevatarContext,
  type AevatarProviderProps,
  type AevatarContextValue,
  
  // Hooks
  useAevatar,
  useSession,
  useRun,
  useEventStream,
  useMessages,
  useProgress,
  useConnection,
  type UseSessionResult,
  type UseRunResult,
  type UseEventStreamResult,
  type UseMessagesResult,
  type UseProgressResult,
  type UseConnectionResult,
  
  // Components - Chat
  ChatPanel,
  MessageList,
  MessageBubble,
  InputArea,
  type ChatPanelProps,
  type MessageListProps,
  type MessageBubbleProps,
  type InputAreaProps,
  
  // Components - Timeline
  TimelineView,
  StepCard,
  StreamingText,
  type TimelineViewProps,
  type StepCardProps,
  type StreamingTextProps,
  
  // Components - Common
  LoadingSpinner,
  ConnectionStatus,
  ProgressBar,
  type LoadingSpinnerProps,
  type ConnectionStatusProps,
  type ProgressBarProps,
  
  // A2UI (Agent-to-User Interface)
  A2uiProvider,
  A2uiRenderer,
  createStandardRegistry,
  useA2ui,
  useA2uiContext,
  useA2uiData,
  useA2uiAction,
  type A2uiProviderProps,
  type A2uiContextValue,
  type A2uiRendererProps,
  type UseA2uiOptions,
  type UseA2uiResult,
} from '@aevatar/kit-react';

// ─────────────────────────────────────────────────────────────────────────────
// A2UI Engine (from @aevatar/kit-a2ui)
// ─────────────────────────────────────────────────────────────────────────────
export {
  createA2uiEngine,
  createDataModel,
  createComponentRegistry,
  createBindingResolver,
  A2uiEngine,
  A2uiDataModel,
  A2uiComponentRegistry,
  A2uiBindingResolver,
  STANDARD_COMPONENT_TYPES,
  type RenderTreeNode,
  type SurfaceState,
  type A2uiEngineEvents,
  type A2uiEngineOptions,
  type DataValue,
  type DataMap,
  type DataChangeEvent,
  type ComponentRenderer,
  type ResolvedValue,
} from '@aevatar/kit-a2ui';

// A2UI Protocol Types
export type {
  A2uiServerMessage,
  A2uiSurfaceUpdate,
  A2uiDataModelUpdate,
  A2uiBeginRendering,
  A2uiDeleteSurface,
  A2uiBoundValue,
  A2uiComponentInstance,
  A2uiChildren,
  A2uiUserAction,
  A2uiComponentCatalog,
  A2uiStandardComponentType,
} from '@aevatar/kit-types';

