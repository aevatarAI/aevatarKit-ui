# AevatarKit SDK

> TypeScript SDK for Aevatar Agent Framework - AG-UI Protocol Integration

[![npm version](https://badge.fury.io/js/%40aevatar%2Fkit.svg)](https://www.npmjs.com/package/@aevatar/kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **轻量** - 零外部依赖，AG-UI 协议内嵌实现
- ⚡ **高性能** - 原生 EventSource，最小化抽象层
- 🔌 **可扩展** - 插件机制支持自定义事件处理
- 📦 **模块化** - 按需引入，tree-shakable
- 🎨 **组件化** - React 组件开箱即用
- 🔒 **类型安全** - 完整 TypeScript 类型定义

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add @aevatar/kit

# Using npm
npm install @aevatar/kit

# Using yarn
yarn add @aevatar/kit
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { createAevatarClient } from '@aevatar/kit';

// Create client
const client = createAevatarClient({
  baseUrl: 'http://localhost:5001',
  apiKey: 'your-api-key', // optional
});

// Connect
await client.connect();

// Create session
const session = await client.createSession();

// Send message
await session.sendMessage('Hello, Aevatar!');

// Subscribe to events
session.onEvent((event) => {
  console.log('Event:', event);
});
```

### React Usage

```tsx
import { 
  AevatarProvider, 
  useSession, 
  ChatPanel 
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

## 📚 Packages

| Package | Description | Size |
|---------|-------------|------|
| [`@aevatar/kit`](./packages/kit) | Main package (re-exports all) | - |
| [`@aevatar/kit-types`](./packages/kit-types) | Type definitions | ~0KB |
| [`@aevatar/kit-protocol`](./packages/kit-protocol) | AG-UI protocol implementation | ~5KB |
| [`@aevatar/kit-core`](./packages/kit-core) | Core client and logic | ~15KB |
| [`@aevatar/kit-react`](./packages/kit-react) | React components and hooks | ~30KB |

## 🔧 API Reference

### Client

```typescript
interface AevatarClient {
  // Connection
  connect(): Promise<void>;
  disconnect(): void;
  onConnectionChange(callback: (status: ConnectionStatus) => void): Unsubscribe;
  
  // Sessions
  createSession(options?: CreateSessionOptions): Promise<SessionInstance>;
  getSession(sessionId: string): Promise<Session | null>;
  listSessions(): Promise<SessionSummary[]>;
  
  // Runs
  getRun(runId: string): Promise<Run | null>;
  listRuns(sessionId: string): Promise<RunSummary[]>;
  
  // Resources
  getAgent(agentId: string): Promise<AgentInfo | null>;
  listAgents(): Promise<AgentSummary[]>;
  getGraph(graphId: string): Promise<GraphDefinition | null>;
  listGraphs(): Promise<GraphSummary[]>;
}
```

### Session

```typescript
interface SessionInstance {
  id: string;
  status: SessionStatus;
  state: SessionState;
  messages: AgUiMessage[];
  
  // Operations
  startRun(input?: RunInput): Promise<RunInstance>;
  sendMessage(content: string): Promise<void>;
  close(): Promise<void>;
  
  // Subscriptions
  onStateChange(callback: (state: SessionState) => void): Unsubscribe;
  onMessage(callback: (message: AgUiMessage) => void): Unsubscribe;
  onEvent(callback: (event: AgUiEvent) => void): Unsubscribe;
}
```

### React Hooks

```typescript
// Context
useAevatar(): AevatarContextValue;

// Session
useSession(): {
  session: SessionInstance | null;
  state: SessionState | null;
  messages: AgUiMessage[];
  createSession: (options?) => Promise<SessionInstance>;
  sendMessage: (content: string) => Promise<void>;
};

// Run
useRun(): {
  run: RunInstance | null;
  status: RunStatus | null;
  steps: StepInfo[];
  isRunning: boolean;
};

// Events
useEventStream(): {
  latestEvent: AgUiEvent | null;
  events: AgUiEvent[];
  subscribe: (callback) => Unsubscribe;
};

// Messages
useMessages(): {
  messages: AgUiMessage[];
  streamingMessage: StreamingMessage | null;
  isStreaming: boolean;
};

// Progress
useProgress(): {
  progress: AevatarProgressEvent | null;
  percent: number;
  phase: string | null;
};

// Connection
useConnection(): {
  status: ConnectionStatus;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};
```

### React Components

```tsx
// Chat
<ChatPanel placeholder="Type a message..." />
<MessageList messages={messages} />
<MessageBubble role="assistant" content="Hello!" />
<InputArea onSend={(content) => {}} />

// Timeline
<TimelineView steps={steps} />
<StepCard step={step} />
<StreamingText content={text} isStreaming />

// Common
<ConnectionStatus showLabel />
<ProgressBar value={50} />
<LoadingSpinner size={24} />
```

## 🎨 Theming

```css
:root {
  --aevatar-primary: #6366f1;
  --aevatar-background: #ffffff;
  --aevatar-surface: #f8fafc;
  --aevatar-text: #1e293b;
  --aevatar-text-muted: #64748b;
  --aevatar-border: #e2e8f0;
  --aevatar-success: #22c55e;
  --aevatar-warning: #f59e0b;
  --aevatar-error: #ef4444;
  --aevatar-radius: 8px;
}

/* Dark theme */
[data-theme="dark"] {
  --aevatar-background: #0f172a;
  --aevatar-surface: #1e293b;
  --aevatar-text: #f8fafc;
  --aevatar-text-muted: #94a3b8;
  --aevatar-border: #334155;
}
```

## 🔌 AG-UI Protocol

This SDK implements the [AG-UI Protocol](https://docs.ag-ui.com/) for standardized Agent-UI communication.

### Supported Events

| Event Type | Description |
|------------|-------------|
| `RUN_STARTED` | Run has started |
| `RUN_FINISHED` | Run completed successfully |
| `RUN_ERROR` | Run failed with error |
| `STEP_STARTED` | Step has started |
| `STEP_FINISHED` | Step completed |
| `TEXT_MESSAGE_START` | Streaming text started |
| `TEXT_MESSAGE_CONTENT` | Text content delta |
| `TEXT_MESSAGE_END` | Streaming text ended |
| `STATE_SNAPSHOT` | Full state snapshot |
| `STATE_DELTA` | JSON Patch state update |
| `MESSAGES_SNAPSHOT` | Message history snapshot |
| `CUSTOM` | Custom/extension events |

### Aevatar Extensions

| Event Name | Description |
|------------|-------------|
| `aevatar.progress` | Detailed progress updates |
| `aevatar.graph` | Knowledge graph updates |
| `aevatar.voting` | Voting progress |
| `aevatar.consensus` | Consensus reached |
| `aevatar.worker_started` | Worker started |
| `aevatar.worker_completed` | Worker completed |
| `aevatar.task_decomposed` | Task decomposition |

## 📖 Documentation

- [Design Document](./docs/DESIGN.md)
- [API Reference](./docs/API.md)
- [Examples](./examples/)

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## 📄 License

MIT © [Aevatar Team](https://github.com/aevatar)

---

*Built with ❤️ for the Aevatar Agent Framework*

