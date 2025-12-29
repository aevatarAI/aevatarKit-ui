# @aevatar/kit-types

> Pure TypeScript type definitions for AevatarKit SDK

## Overview

This package provides all TypeScript type definitions for the AevatarKit SDK. It has **zero runtime dependencies** and is designed for type-only imports.

## Installation

```bash
pnpm add @aevatar/kit-types
```

## Type Categories

### AG-UI Protocol Types (`agui.ts`)

Standard AG-UI protocol event types:

```typescript
import type {
  AgUiEvent,
  AgUiEventType,
  AgUiMessage,
  AgUiBaseEvent,
  // Lifecycle
  RunStartedEvent,
  RunFinishedEvent,
  RunErrorEvent,
  StepStartedEvent,
  StepFinishedEvent,
  // Text streaming
  TextMessageStartEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  // Tool calls
  ToolCallStartEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  ToolCallResultEvent,
  // State
  StateSnapshotEvent,
  StateDeltaEvent,
  MessagesSnapshotEvent,
  // Extension
  CustomEvent,
} from '@aevatar/kit-types';
```

### Session Types (`session.ts`)

```typescript
import type {
  Session,
  SessionSummary,
  SessionStatus,
  SessionState,
  SessionConfig,
  CreateSessionOptions,
} from '@aevatar/kit-types';

// Status: 'idle' | 'running' | 'completed' | 'failed' | 'closed'
```

### Run Types (`run.ts`)

```typescript
import type {
  Run,
  RunSummary,
  RunStatus,
  RunInput,
  StepInfo,
} from '@aevatar/kit-types';

// Status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
```

### Agent Types (`agent.ts`)

```typescript
import type {
  AgentInfo,
  AgentSummary,
  AgentCapability,
  AgentTool,
  CreateAgentOptions,
} from '@aevatar/kit-types';

// Capabilities: 'chat' | 'reasoning' | 'tool_calling' | 'code_generation' | ...
```

### Graph Types (`graph.ts`)

```typescript
import type {
  GraphDefinition,
  GraphSummary,
  GraphNode,
  GraphEdge,
} from '@aevatar/kit-types';
```

### Memory Types (`memory.ts`)

```typescript
import type {
  Memory,
  MemorySearchOptions,
  MemorySearchResult,
} from '@aevatar/kit-types';
```

### Client Configuration (`client.ts`)

```typescript
import type {
  ClientOptions,
  ConnectionStatus,
  LogLevel,
  LoggerOptions,
} from '@aevatar/kit-types';

// ConnectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
```

### Utility Types (`utils.ts`)

```typescript
import type {
  Unsubscribe,
  EventHandler,
  DeepPartial,
} from '@aevatar/kit-types';
```

## Type Guards

The package includes type guards for AG-UI events:

```typescript
import {
  isRunStartedEvent,
  isRunFinishedEvent,
  isTextMessageContentEvent,
  isStateSnapshotEvent,
  isCustomEvent,
} from '@aevatar/kit-types';

// Usage
if (isTextMessageContentEvent(event)) {
  console.log(event.delta); // TypeScript knows this is TextMessageContentEvent
}
```

## File Structure

```
src/
├── index.ts      # Re-exports all
├── agui.ts       # AG-UI protocol types
├── session.ts    # Session types
├── run.ts        # Run types
├── agent.ts      # Agent types
├── graph.ts      # Graph types
├── memory.ts     # Memory types
├── client.ts     # Client config types
└── utils.ts      # Utility types
```

## Design Principles

1. **Zero Runtime** - Types only, no JavaScript output
2. **Tree-shakable** - Each module can be imported separately
3. **AG-UI Aligned** - Follows AG-UI protocol specification
4. **Strict Types** - No `any`, full type safety

## Related Packages

- [`@aevatar/kit-protocol`](../kit-protocol) - Uses these types
- [`@aevatar/kit-core`](../kit-core) - Uses these types
- [`@aevatar/kit-react`](../kit-react) - Uses these types

## License

MIT

