# @aevatar/kit-core

> Core client and business logic for AevatarKit SDK

## Overview

This package provides the main client implementation for connecting to Aevatar Agent Framework backends. It handles session management, run execution, state synchronization, and resource access.

## Installation

```bash
pnpm add @aevatar/kit-core
```

## Features

- 🔗 **Client Connection** - Connect to Aevatar backend
- 📋 **Session Management** - Create, manage, close sessions
- 🏃 **Run Execution** - Start runs, track progress
- 🗄️ **State Management** - Snapshot + JSON Patch delta
- 🔄 **Retry Logic** - Automatic retry with backoff

## Quick Start

```typescript
import { createAevatarClient } from '@aevatar/kit-core';

// Create client
const client = createAevatarClient({
  baseUrl: 'http://localhost:5001',
  apiKey: 'your-api-key', // optional
  timeout: 30000,
});

// Connect
await client.connect();

// Create session
const session = await client.createSession({
  config: {
    agentId: 'my-agent',
    systemPrompt: 'You are helpful assistant.',
  },
});

// Send message
await session.sendMessage('Hello!');

// Subscribe to events
session.onEvent((event) => {
  if (event.type === 'TEXT_MESSAGE_CONTENT') {
    process.stdout.write(event.delta);
  }
});

// Cleanup
await session.close();
client.disconnect();
```

## Core Modules

### Client (`client.ts`)

Main entry point for SDK:

```typescript
import { createAevatarClient, type AevatarClient } from '@aevatar/kit-core';

const client = createAevatarClient({
  baseUrl: 'http://localhost:5001',
  apiKey: 'optional-api-key',
  timeout: 30000,
  logger: { level: 'info' },
  onConnectionChange: (status) => console.log('Status:', status),
});
```

**Client Interface:**

```typescript
interface AevatarClient {
  readonly baseUrl: string;
  readonly status: ConnectionStatus;
  
  // Connection
  connect(): Promise<void>;
  disconnect(): void;
  onConnectionChange(callback: (status: ConnectionStatus) => void): Unsubscribe;
  
  // Sessions
  createSession(options?: CreateSessionOptions): Promise<SessionInstance>;
  getSession(sessionId: string): Promise<Session | null>;
  listSessions(): Promise<SessionSummary[]>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Runs
  getRun(runId: string): Promise<Run | null>;
  listRuns(sessionId: string): Promise<RunSummary[]>;
  
  // Agents
  getAgent(agentId: string): Promise<AgentInfo | null>;
  listAgents(): Promise<AgentSummary[]>;
  
  // Graphs
  getGraph(graphId: string): Promise<GraphDefinition | null>;
  listGraphs(): Promise<GraphSummary[]>;
  
  // Memory
  getMemory(memoryId: string): Promise<Memory | null>;
  searchMemory(options: MemorySearchOptions): Promise<MemorySearchResult[]>;
}
```

### Session Manager (`session.ts`)

Session lifecycle and state management:

```typescript
import { createSessionManager, type SessionInstance } from '@aevatar/kit-core';

const manager = createSessionManager({
  baseUrl: 'http://localhost:5001',
  apiKey: 'optional',
  logger: createLogger(),
});

const session = await manager.create({
  config: { agentId: 'my-agent' },
  autoStart: false,
});
```

**SessionInstance Interface:**

```typescript
interface SessionInstance {
  readonly id: string;
  readonly data: Session;
  readonly status: SessionStatus;
  readonly state: SessionState;
  readonly messages: AgUiMessage[];
  readonly currentRun: RunInstance | null;
  
  // Operations
  startRun(input?: RunInput): Promise<RunInstance>;
  sendMessage(content: string): Promise<void>;
  stopRun(): Promise<void>;
  close(): Promise<void>;
  
  // Subscriptions
  onStateChange(callback: (state: SessionState) => void): Unsubscribe;
  onMessage(callback: (message: AgUiMessage) => void): Unsubscribe;
  onEvent(callback: (event: AgUiEvent) => void): Unsubscribe;
}
```

### Run Manager (`run.ts`)

Run execution and tracking:

```typescript
import { createRunManager, type RunInstance } from '@aevatar/kit-core';

const runManager = createRunManager({
  baseUrl: 'http://localhost:5001',
  sessionId: 'session-123',
  logger: createLogger(),
});

const run = await runManager.start({
  message: 'What is the weather today?',
});

run.onStep((step) => console.log('Step:', step.name));
await run.waitForCompletion();
```

**RunInstance Interface:**

```typescript
interface RunInstance {
  readonly id: string;
  readonly status: RunStatus;
  readonly steps: StepInfo[];
  
  // Operations
  stop(): Promise<void>;
  waitForCompletion(): Promise<void>;
  
  // Subscriptions
  onStatusChange(callback: (status: RunStatus) => void): Unsubscribe;
  onStep(callback: (step: StepInfo) => void): Unsubscribe;
}
```

### State Store (`state.ts`)

State synchronization with JSON Patch:

```typescript
import { createStateStore, type StateStore } from '@aevatar/kit-core';

const store = createStateStore({
  status: 'idle',
  customState: {},
});

// Apply snapshot
store.setSnapshot({ user: 'Alice', tasks: [] });

// Apply delta (JSON Patch)
store.applyDelta([
  { op: 'add', path: '/tasks/-', value: { id: 1, title: 'Task 1' } },
]);

// Subscribe to changes
store.subscribe((state) => {
  console.log('State updated:', state);
});
```

### Utilities

**Logger (`utils/logger.ts`):**

```typescript
import { createLogger, type Logger } from '@aevatar/kit-core';

const logger = createLogger({ level: 'debug' });
logger.debug('Debug message');
logger.info('Info message', { key: 'value' });
logger.error('Error message', { error });
```

**Retry Manager (`utils/retry.ts`):**

```typescript
import { createRetryManager } from '@aevatar/kit-core';

const retry = createRetryManager({
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
});

const result = await retry.execute(async () => {
  return await fetch('/api/data');
});
```

## File Structure

```
src/
├── index.ts         # Re-exports all
├── client.ts        # Main client implementation
├── session.ts       # Session management
├── run.ts           # Run execution
├── state.ts         # State store (snapshot + delta)
└── utils/
    ├── logger.ts    # Logging utility
    └── retry.ts     # Retry with backoff
```

## State Management

The SDK supports AG-UI state synchronization:

```typescript
// Full state snapshot
session.onEvent((event) => {
  if (event.type === 'STATE_SNAPSHOT') {
    // Replace entire state
    console.log('New state:', event.snapshot);
  }
  
  if (event.type === 'STATE_DELTA') {
    // Apply JSON Patch (RFC 6902)
    console.log('Patches:', event.delta);
    // [{ op: 'add', path: '/tasks/-', value: {...} }]
  }
});
```

## Error Handling

```typescript
try {
  await client.connect();
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Authentication failed');
  } else if (error.message.includes('network')) {
    console.error('Network error');
  }
}

// Or use connection status
client.onConnectionChange((status) => {
  if (status === 'error') {
    console.error('Connection error');
  }
});
```

## Dependencies

- `@aevatar/kit-types` - Type definitions
- `@aevatar/kit-protocol` - SSE/event handling

## Design Principles

1. **Framework Agnostic** - No React/Vue/Angular dependency
2. **Stateful Sessions** - Full lifecycle management
3. **Type Safe** - Complete TypeScript coverage
4. **Testable** - All modules can be mocked

## Related Packages

- [`@aevatar/kit-types`](../kit-types) - Type definitions
- [`@aevatar/kit-protocol`](../kit-protocol) - Protocol layer
- [`@aevatar/kit-react`](../kit-react) - React bindings
- [`@aevatar/kit`](../kit) - Main package

## License

MIT

