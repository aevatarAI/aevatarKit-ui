# AevatarKit SDK

> TypeScript SDK for Aevatar Agent Framework - AG-UI Protocol Integration

[![npm version](https://img.shields.io/npm/v/@aevatar/kit?color=6366f1)](https://www.npmjs.com/package/@aevatar/kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

## ✨ Features

- 🎯 **轻量** - 零外部依赖，AG-UI 协议内嵌实现
- ⚡ **高性能** - 原生 EventSource，最小化抽象层
- 🔌 **可扩展** - BackendAdapter 支持自定义后端适配
- 📦 **模块化** - 按需引入，tree-shakable
- 🎨 **组件化** - 43+ React 组件开箱即用
- 🔒 **类型安全** - 完整 TypeScript 类型定义 + 泛型自定义事件
- 🖼️ **A2UI 引擎** - JSON → UI 动态渲染

### 🆕 v1.2.0 新特性

- **Type-safe Custom Events** - 泛型 `CustomEventMap<T>` 支持自定义事件类型推断
- **Message Buffer** - `bindMessageAggregation` 自动处理 TEXT_MESSAGE_* 聚合
- **Batch Registration** - `registerStandard()` / `registerCustom()` 批量注册事件
- **Rich Connection Callbacks** - `onReconnecting` / `onReconnectFailed` / `onReconnected`
- **Connection Metrics** - `getMetrics()` 获取连接统计信息
- **JSON Patch (RFC 6902)** - `applyJsonPatch()` 用于 STATE_DELTA 处理

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add @aevatar/kit

# Using npm
npm install @aevatar/kit

# Using yarn
yarn add @aevatar/kit
```

### Individual Packages

```bash
# Protocol only (SSE + event parsing)
pnpm add @aevatar/kit-protocol

# Core only (client + session management)
pnpm add @aevatar/kit-core

# React components only
pnpm add @aevatar/kit-react

# A2UI engine only
pnpm add @aevatar/kit-a2ui
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { createAevatarClient } from '@aevatar/kit';

// Create client
const client = createAevatarClient({
  baseUrl: 'http://localhost:5001',
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
import { AevatarProvider, useSession, ChatPanel } from '@aevatar/kit';

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

### Protocol-Only Usage (Minimal)

```typescript
import { createEventStream } from '@aevatar/kit-protocol';
import { isTextMessageContentEvent } from '@aevatar/kit-types';

// Direct SSE connection
const stream = createEventStream({
  url: '/api/sessions/123/events',
  onStatusChange: (status) => console.log('Status:', status),
});

// Subscribe to events
stream.onAny((event) => {
  if (isTextMessageContentEvent(event)) {
    console.log('Content:', event.delta);
  }
});

stream.connect();
```

## 🆕 New Features (v1.2.0)

### Type-safe Custom Events

```typescript
import { createEventStream, type CustomEventMap } from '@aevatar/kit-protocol';

// Define your custom event types
interface MyEvents extends CustomEventMap {
  'worker.update': { id: string; status: string };
  'task.complete': { taskId: string; result: unknown };
}

// Create type-safe stream
const stream = createEventStream<MyEvents>({
  url: '/api/events',
});

// event.value is typed as { id: string; status: string }
stream.onCustom('worker.update', (event) => {
  console.log(event.value.id, event.value.status);
});
```

### Message Aggregation

```typescript
import { createEventRouter, bindMessageAggregation } from '@aevatar/kit-protocol';

const router = createEventRouter();

// Automatically handles TEXT_MESSAGE_START/CONTENT/END
const { buffer, unsubscribe } = bindMessageAggregation(router, {
  onMessageStart: (id) => console.log('Started:', id),
  onMessageChunk: (id, accumulated) => updateUI(accumulated),
  onMessageComplete: (id, fullContent) => saveMessage(fullContent),
});
```

### Batch Event Registration

```typescript
import { createEventStream } from '@aevatar/kit-protocol';

const stream = createEventStream({
  url: '/api/events',
  router: {
    standard: {
      RUN_STARTED: () => console.log('Started'),
      RUN_FINISHED: () => console.log('Finished'),
      TEXT_MESSAGE_CONTENT: (e) => console.log(e.delta),
    },
    custom: {
      'app.progress': (e) => console.log('Progress:', e.value),
    },
  },
});
```

### Rich Connection Callbacks

```typescript
const stream = createEventStream({
  url: '/api/events',
  onReconnecting: (attempt, max, delay) => {
    showToast(`Reconnecting ${attempt}/${max} in ${delay}ms`);
  },
  onReconnectFailed: (context) => {
    console.log('Duration:', context.connectionDuration);
    showError('Connection lost permanently');
  },
  onReconnected: () => {
    showSuccess('Reconnected!');
  },
});
```

### JSON Patch for STATE_DELTA

```typescript
import { applyJsonPatch } from '@aevatar/kit-protocol';

const state = { count: 0, items: [] };

stream.on('STATE_DELTA', (event) => {
  const newState = applyJsonPatch(state, event.delta);
  setState(newState);
});
```

### Connection Metrics

```typescript
const metrics = stream.getMetrics();
// {
//   status: 'connected',
//   totalConnectAttempts: 1,
//   successfulConnections: 1,
//   messagesReceived: 42,
//   lastConnectedAt: 1704067200000,
//   lastErrorAt: null,
// }
```

## 📚 Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@aevatar/kit`](./packages/kit) | Main package (re-exports all) | ![npm](https://img.shields.io/npm/v/@aevatar/kit?label=) |
| [`@aevatar/kit-types`](./packages/kit-types) | Type definitions | ![npm](https://img.shields.io/npm/v/@aevatar/kit-types?label=) |
| [`@aevatar/kit-protocol`](./packages/kit-protocol) | AG-UI protocol (SSE, parsing, utilities) | ![npm](https://img.shields.io/npm/v/@aevatar/kit-protocol?label=) |
| [`@aevatar/kit-core`](./packages/kit-core) | Core client and logic | ![npm](https://img.shields.io/npm/v/@aevatar/kit-core?label=) |
| [`@aevatar/kit-react`](./packages/kit-react) | React components (43+) | ![npm](https://img.shields.io/npm/v/@aevatar/kit-react?label=) |
| [`@aevatar/kit-a2ui`](./packages/kit-a2ui) | A2UI rendering engine | ![npm](https://img.shields.io/npm/v/@aevatar/kit-a2ui?label=) |

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                        │
├─────────────────────────────────────────────────────────────┤
│                      @aevatar/kit                           │
│         (Unified entry - re-exports all packages)          │
├──────────────┬──────────────┬───────────────┬──────────────┤
│  kit-react   │   kit-a2ui   │   kit-core    │ kit-protocol │
│  (Components)│ (A2UI Engine)│  (Client)     │ (AG-UI SSE)  │
├──────────────┴──────────────┴───────────────┴──────────────┤
│                      @aevatar/kit-types                     │
│                    (Shared type definitions)               │
└─────────────────────────────────────────────────────────────┘
```

### kit-protocol Utilities

| Utility | Description |
|---------|-------------|
| `createEventStream` | High-level SSE stream with rich callbacks |
| `createEventRouter` | Type-safe event routing with batch registration |
| `createConnection` | Low-level SSE connection with metrics |
| `bindMessageAggregation` | Auto TEXT_MESSAGE_* handling |
| `applyJsonPatch` | RFC 6902 JSON Patch for STATE_DELTA |
| `parseMessageId` | Parse structured message IDs |

## 🔧 API Reference

### Client

```typescript
const client = createAevatarClient({
  baseUrl: 'http://localhost:5001',
  timeout: 30000,
  logger: { level: 'debug' },
  onConnectionChange: (status) => console.log(status),
});

// Connection
await client.connect();
client.disconnect();

// Sessions
const session = await client.createSession({ agentId: 'my-agent' });
const sessions = await client.listSessions();

// Resources
const agents = await client.listAgents();
const graphs = await client.listGraphs();
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
const { client, isConnected } = useAevatar();

// Session
const { session, messages, createSession, sendMessage } = useSession();

// Run
const { run, steps, isRunning } = useRun();

// Events
const { latestEvent, events, subscribe } = useEventStream();

// Messages (with streaming)
const { messages, streamingMessage, isStreaming } = useMessages();

// Progress
const { progress, percent, phase, isActive } = useProgress();

// Tool Calls
const { toolCalls, activeToolCalls, completedToolCalls } = useToolCalls();

// Connection
const { status, isConnected, connect, disconnect } = useConnection();
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

// Tool Calls
<ToolCallPanel toolCalls={toolCalls} />
<ToolCallCard toolCall={toolCall} />

// Common
<ConnectionStatus showLabel />
<ProgressBar value={50} />
<LoadingSpinner size={24} />

// A2UI (JSON → UI)
<A2uiRenderer tree={renderTree} registry={registry} />
```

## 🖼️ A2UI: JSON → UI

A2UI (Agent-to-User Interface) enables dynamic UI rendering from JSON:

```tsx
import { A2uiProvider, A2uiRenderer, createStandardRegistry } from '@aevatar/kit';

const registry = createStandardRegistry();

function DynamicUI({ jsonData }) {
  return (
    <A2uiProvider registry={registry}>
      <A2uiRenderer surfaceId="main" />
    </A2uiProvider>
  );
}
```

**Supported Components**: Button, Input, Select, Checkbox, Card, Alert, Badge, Table, Chart, MoleculeViewer, and 30+ more.

## 🎨 Theming

```tsx
import { ThemeProvider } from '@aevatar/kit';

<ThemeProvider defaultPreset="default" defaultMode="system">
  <App />
</ThemeProvider>
```

**8 Built-in Presets**: default, ocean, forest, sunset, lavender, midnight, coffee, monochrome

```css
/* Custom CSS variables */
:root {
  --primary: oklch(0.6 0.2 260);
  --background: oklch(1 0 0);
  --foreground: oklch(0.1 0 0);
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
| `TEXT_MESSAGE_*` | Streaming text (start/content/end) |
| `TOOL_CALL_*` | Tool calls (start/args/end/result) |
| `STATE_SNAPSHOT` | Full state snapshot |
| `STATE_DELTA` | JSON Patch state update |
| `MESSAGES_SNAPSHOT` | Message history snapshot |
| `CUSTOM` | Custom/extension events |

### Aevatar Extensions (via CUSTOM)

| Event Name | Description |
|------------|-------------|
| `aevatar.progress` | Detailed progress updates |
| `aevatar.graph` | Graph/DAG updates |
| `aevatar.voting` | Voting progress |
| `aevatar.consensus` | Consensus reached |
| `aevatar.worker_*` | Worker lifecycle |

## 📂 Examples

| Demo | Description |
|------|-------------|
| [basic-demo](./examples/basic-demo) | Full-featured chat with `@aevatar/kit` |
| [axiom-demo](./examples/axiom-demo) | **🆕 Protocol-only with new SDK features** |
| [minimal-demo](./examples/minimal-demo) | Pure TypeScript, no React |
| [a2ui-demo](./examples/a2ui-demo) | JSON → UI dynamic rendering |
| [molecule-demo](./examples/molecule-demo) | 3D molecule viewer component |

```bash
# Run examples
cd examples/basic-demo && pnpm dev

# Run axiom-demo to see new SDK features
cd examples/axiom-demo && pnpm dev
```

## 🔧 Custom Backend Adapter

For custom backend APIs, implement `BackendAdapter`:

```typescript
import { createAevatarClient, type BackendAdapter } from '@aevatar/kit-core';

const myAdapter: BackendAdapter = {
  name: 'my-backend',
  async healthCheck() { /* ... */ },
  async createSession(opts) { /* ... */ },
  getEventStreamUrl(sessionId) { return `/my/sse/${sessionId}`; },
  async startRun(sessionId, input) { /* ... */ },
  // ... other methods
};

const client = createAevatarClient({
  baseUrl: 'http://my-backend.com',
  adapter: myAdapter,
});
```

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

# Release (changeset workflow)
pnpm changeset
pnpm version
pnpm release
```

## 📖 Documentation

- [SDK Design](./docs/AEVATARKIT_SDK_DESIGN.md) - Architecture and design decisions
- [A2UI Integration](./docs/A2UI_INTEGRATION_FEASIBILITY.md) - A2UI protocol details
- [Theme System](./docs/THEME_SYSTEM.md) - Theming and customization
- [kit-protocol Architecture](./packages/kit-protocol/docs/ARCHITECTURE.md) - Protocol layer details

## 📄 License

MIT © [Aevatar Team](https://github.com/aevatarAI)

---

*Built with ❤️ for the Aevatar Agent Framework*
