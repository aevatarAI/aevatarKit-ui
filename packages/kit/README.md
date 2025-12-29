# @aevatar/kit

> Complete TypeScript SDK for Aevatar Agent Framework

## Overview

This is the main package of AevatarKit SDK. It re-exports all sub-packages for convenience, allowing you to import everything from a single entry point.

## Installation

```bash
# Using pnpm (recommended)
pnpm add @aevatar/kit

# Using npm
npm install @aevatar/kit

# Using yarn
yarn add @aevatar/kit
```

## Quick Start

### Basic Usage (Vanilla JS/TS)

```typescript
import { createAevatarClient } from '@aevatar/kit';

const client = createAevatarClient({
  baseUrl: 'http://localhost:5001',
  apiKey: 'your-api-key',
});

await client.connect();
const session = await client.createSession();
await session.sendMessage('Hello, Aevatar!');

session.onEvent((event) => {
  if (event.type === 'TEXT_MESSAGE_CONTENT') {
    process.stdout.write(event.delta);
  }
});
```

### React Usage

```tsx
import {
  AevatarProvider,
  useSession,
  ChatPanel,
} from '@aevatar/kit';

function App() {
  return (
    <AevatarProvider client={{ baseUrl: 'http://localhost:5001' }}>
      <Chat />
    </AevatarProvider>
  );
}

function Chat() {
  const { session, createSession } = useSession();
  
  useEffect(() => {
    createSession();
  }, []);
  
  return <ChatPanel />;
}
```

## What's Included

This package re-exports everything from:

| Sub-package | What it provides |
|-------------|------------------|
| [`@aevatar/kit-types`](../kit-types) | TypeScript type definitions |
| [`@aevatar/kit-protocol`](../kit-protocol) | AG-UI protocol implementation |
| [`@aevatar/kit-core`](../kit-core) | Client, session, run management |
| [`@aevatar/kit-react`](../kit-react) | React hooks and components |

## Exports Overview

### Types

```typescript
import type {
  // AG-UI Events
  AgUiEvent,
  AgUiEventType,
  AgUiMessage,
  RunStartedEvent,
  TextMessageContentEvent,
  StateSnapshotEvent,
  CustomEvent,
  
  // Session
  Session,
  SessionState,
  SessionStatus,
  CreateSessionOptions,
  
  // Run
  Run,
  RunStatus,
  RunInput,
  StepInfo,
  
  // Agent
  AgentInfo,
  AgentCapability,
  AgentTool,
  
  // Graph
  GraphDefinition,
  GraphNode,
  GraphEdge,
  
  // Memory
  Memory,
  MemorySearchOptions,
  MemorySearchResult,
  
  // Client
  ClientOptions,
  ConnectionStatus,
  
  // Utilities
  Unsubscribe,
  EventHandler,
} from '@aevatar/kit';
```

### Type Guards

```typescript
import {
  isRunStartedEvent,
  isRunFinishedEvent,
  isTextMessageContentEvent,
  isStateSnapshotEvent,
  isCustomEvent,
  // ... more
} from '@aevatar/kit';
```

### Core Functions

```typescript
import {
  createAevatarClient,
  createSessionManager,
  createRunManager,
  createStateStore,
  createConnection,
  createEventStream,
  createEventRouter,
  createLogger,
  createRetryManager,
} from '@aevatar/kit';
```

### React Context & Hooks

```typescript
import {
  // Context
  AevatarProvider,
  AevatarContext,
  
  // Hooks
  useAevatar,
  useSession,
  useRun,
  useMessages,
  useEventStream,
  useProgress,
  useConnection,
} from '@aevatar/kit';
```

### React Components

```typescript
import {
  // Chat
  ChatPanel,
  MessageList,
  MessageBubble,
  InputArea,
  
  // Timeline
  TimelineView,
  StepCard,
  StreamingText,
  
  // Common
  ConnectionStatus,
  ProgressBar,
  LoadingSpinner,
} from '@aevatar/kit';
```

### Aevatar Extensions

```typescript
import type {
  AevatarCustomEventName,
  AevatarProgressEvent,
  AevatarGraphEvent,
  AevatarVotingEvent,
  AevatarWorkerStartedEvent,
  AevatarTaskDecomposedEvent,
} from '@aevatar/kit';
```

## Bundle Optimization

For smaller bundle sizes, import from individual packages:

```typescript
// Instead of:
import { createAevatarClient, useSession } from '@aevatar/kit';

// Do:
import { createAevatarClient } from '@aevatar/kit-core';
import { useSession } from '@aevatar/kit-react';
```

### Package Sizes

| Package | Approximate Size |
|---------|------------------|
| `@aevatar/kit-types` | ~0KB (types only) |
| `@aevatar/kit-protocol` | ~5KB |
| `@aevatar/kit-core` | ~15KB |
| `@aevatar/kit-react` | ~30KB |

## Peer Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

> Note: React is optional. If not using React, only the core/protocol exports will work.

## Theming

Import styles for pre-built components:

```tsx
import '@aevatar/kit/styles.css';
```

Customize with CSS variables:

```css
:root {
  --aevatar-primary: #6366f1;
  --aevatar-background: #ffffff;
  --aevatar-text: #1e293b;
  --aevatar-radius: 8px;
}
```

## Architecture

```
@aevatar/kit (this package)
├── Re-exports from:
│   ├── @aevatar/kit-types      (types only)
│   ├── @aevatar/kit-protocol   (SSE, parsing, routing)
│   ├── @aevatar/kit-core       (client, session, run)
│   └── @aevatar/kit-react      (hooks, components)
│
└── Depends on:
    └── react (peer, optional)
```

## Related Documentation

- [Main README](../../README.md) - Full documentation
- [Design Document](../../docs/DESIGN.md) - Architecture details
- [Examples](../../examples/) - Usage examples

## Sub-packages

- [`@aevatar/kit-types`](../kit-types/README.md) - Type definitions
- [`@aevatar/kit-protocol`](../kit-protocol/README.md) - Protocol layer
- [`@aevatar/kit-core`](../kit-core/README.md) - Core logic
- [`@aevatar/kit-react`](../kit-react/README.md) - React bindings

## License

MIT © [Aevatar Team](https://github.com/aevatar)

