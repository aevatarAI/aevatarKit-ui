# AevatarKit TypeScript SDK 设计文档

> **目标**：构建一套轻量、高性能、可扩展的 TypeScript SDK，让前端应用能够与 Aevatar Agent Framework 无缝交互，基于 AG-UI 协议标准化通讯。

---

## 📚 目录

1. [设计目标](#1-设计目标)
2. [架构概览](#2-架构概览)
3. [包结构设计](#3-包结构设计)
4. [核心模块详解](#4-核心模块详解)
5. [AG-UI 协议集成](#5-ag-ui-协议集成)
6. [React 组件库](#6-react-组件库)
7. [类型系统](#7-类型系统)
8. [扩展机制](#8-扩展机制)
9. [开发规范](#9-开发规范)
10. [里程碑规划](#10-里程碑规划)

---

## 1. 设计目标

### 1.1 核心价值

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AevatarKit SDK 核心价值                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🎯 轻量         - 零外部依赖（AG-UI 协议内嵌实现）                       │
│  ⚡ 高性能       - 原生 EventSource，最小化抽象层                        │
│  🔌 可扩展      - 插件机制支持自定义事件处理                              │
│  📦 模块化      - 按需引入，tree-shakable                                │
│  🎨 组件化      - React 组件开箱即用                                     │
│  🔒 类型安全    - 完整 TypeScript 类型定义                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 设计原则

| 原则 | 描述 |
|------|------|
| **协议标准化** | 基于 AG-UI 协议，通用事件走标准路径，特有功能走 CUSTOM 扩展 |
| **零依赖核心** | Core 层不依赖任何第三方库，React 层仅依赖 React |
| **渐进式采用** | 可单独使用 Core，也可搭配 React 组件 |
| **类型优先** | TypeScript 优先，完整类型推导 |
| **可测试性** | 所有模块可独立测试，提供 Mock 工具 |

### 1.3 非目标

- ❌ 不重新发明 AG-UI 协议（只做内嵌实现）
- ❌ 不构建完整 UI 框架（只提供基础组件）
- ❌ 不处理后端逻辑（纯前端 SDK）

---

## 2. 架构概览

### 2.1 分层架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         应用层 (Your App)                                │
│                                                                          │
│   import { AevatarProvider, useSession, ChatPanel } from '@aevatar/kit' │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      @aevatar/kit (主包 - 重导出)                        │
│                                                                          │
│   统一入口，按需重导出以下子包的 public API                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
┌───────────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│  @aevatar/kit-react   │ │ @aevatar/kit-core│ │  @aevatar/kit-types    │
│                       │ │                 │ │                         │
│  • AevatarProvider    │ │ • AevatarClient │ │  • AgUiEventType        │
│  • useSession         │ │ • createSession │ │  • AevatarSession       │
│  • useAgent           │ │ • EventEmitter  │ │  • AgentConfig          │
│  • ChatPanel          │ │ • RetryManager  │ │  • GraphDefinition      │
│  • GraphCanvas        │ │ • StateManager  │ │  • MemoryEntry          │
│  • TimelineView       │ │                 │ │  • ...                  │
│  • ProgressIndicator  │ │                 │ │                         │
│  • VotingPanel        │ │                 │ │                         │
└───────────────────────┘ └─────────────────┘ └─────────────────────────┘
          │                       │
          │                       │
          ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     @aevatar/kit-protocol (协议层)                       │
│                                                                          │
│   AG-UI 协议内嵌实现 + Aevatar 扩展事件定义                              │
│   • AgUiEvent 类型                                                       │
│   • SSE 连接管理                                                         │
│   • 事件解析与路由                                                        │
│   • CUSTOM 事件处理                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
┌──────────────┐      SSE/WebSocket      ┌──────────────────────┐
│   Aevatar    │  ──────────────────────▶│  @aevatar/kit-protocol│
│   Backend    │       AG-UI Events      │                      │
│              │                         │  解析 → 路由 → 分发   │
└──────────────┘                         └──────────┬───────────┘
                                                    │
                                                    ▼
                                         ┌──────────────────────┐
                                         │  @aevatar/kit-core   │
                                         │                      │
                                         │  状态管理 → 事件发布  │
                                         └──────────┬───────────┘
                                                    │
                                                    ▼
                                         ┌──────────────────────┐
                                         │  @aevatar/kit-react  │
                                         │                      │
                                         │  Context → Hooks → UI│
                                         └──────────────────────┘
```

---

## 3. 包结构设计

### 3.1 Monorepo 结构

```
aevatar-kit/
├── packages/
│   ├── kit/                          # 主包 (统一入口)
│   │   ├── src/
│   │   │   └── index.ts              # 重导出所有子包
│   │   └── package.json
│   │
│   ├── kit-types/                    # 类型定义包
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── agui.ts               # AG-UI 标准类型
│   │   │   ├── aevatar.ts            # Aevatar 扩展类型
│   │   │   ├── session.ts            # Session 相关类型
│   │   │   ├── agent.ts              # Agent 相关类型
│   │   │   ├── graph.ts              # Graph 相关类型
│   │   │   ├── memory.ts             # Memory 相关类型
│   │   │   └── events.ts             # 事件类型
│   │   └── package.json
│   │
│   ├── kit-protocol/                 # AG-UI 协议层
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── types.ts              # AG-UI 事件类型
│   │   │   ├── connection.ts         # SSE/WebSocket 连接
│   │   │   ├── parser.ts             # 事件解析器
│   │   │   ├── router.ts             # 事件路由器
│   │   │   └── extensions/           # Aevatar 扩展事件
│   │   │       ├── progress.ts
│   │   │       ├── graph.ts
│   │   │       └── voting.ts
│   │   └── package.json
│   │
│   ├── kit-core/                     # 核心功能包
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── client.ts             # AevatarClient 主类
│   │   │   ├── session.ts            # Session 管理
│   │   │   ├── agent.ts              # Agent 交互
│   │   │   ├── run.ts                # Run 执行管理
│   │   │   ├── memory.ts             # Memory 操作
│   │   │   ├── state.ts              # 状态管理
│   │   │   └── utils/
│   │   │       ├── retry.ts          # 重试逻辑
│   │   │       ├── queue.ts          # 事件队列
│   │   │       └── logger.ts         # 日志工具
│   │   └── package.json
│   │
│   └── kit-react/                    # React 组件包
│       ├── src/
│       │   ├── index.ts
│       │   ├── context/
│       │   │   ├── AevatarProvider.tsx
│       │   │   └── AevatarContext.ts
│       │   ├── hooks/
│       │   │   ├── useAevatar.ts
│       │   │   ├── useSession.ts
│       │   │   ├── useAgent.ts
│       │   │   ├── useRun.ts
│       │   │   ├── useMemory.ts
│       │   │   └── useEventStream.ts
│       │   ├── components/
│       │   │   ├── chat/
│       │   │   │   ├── ChatPanel.tsx
│       │   │   │   ├── MessageList.tsx
│       │   │   │   ├── MessageBubble.tsx
│       │   │   │   └── InputArea.tsx
│       │   │   ├── timeline/
│       │   │   │   ├── TimelineView.tsx
│       │   │   │   ├── StepCard.tsx
│       │   │   │   └── StreamingText.tsx
│       │   │   ├── graph/
│       │   │   │   ├── GraphCanvas.tsx
│       │   │   │   ├── NodeRenderer.tsx
│       │   │   │   └── EdgeRenderer.tsx
│       │   │   ├── progress/
│       │   │   │   ├── ProgressBar.tsx
│       │   │   │   └── ProgressIndicator.tsx
│       │   │   ├── voting/
│       │   │   │   ├── VotingPanel.tsx
│       │   │   │   └── CandidateCard.tsx
│       │   │   └── common/
│       │   │       ├── LoadingSpinner.tsx
│       │   │       ├── ErrorBoundary.tsx
│       │   │       └── ConnectionStatus.tsx
│       │   └── styles/
│       │       └── index.css
│       └── package.json
│
├── docs/                             # 文档
│   ├── AEVATARKIT_SDK_DESIGN.md     # 本文档
│   ├── API.md                        # API 参考
│   ├── EXAMPLES.md                   # 使用示例
│   └── MIGRATION.md                  # 迁移指南
│
├── examples/                         # 示例项目
│   ├── basic-chat/
│   ├── axiom-reasoning-ui/
│   └── graph-editor/
│
├── package.json                      # Monorepo 根配置
├── pnpm-workspace.yaml               # pnpm workspace
├── tsconfig.json                     # TypeScript 配置
└── vitest.config.ts                  # 测试配置
```

### 3.2 包依赖关系

```
@aevatar/kit
├── @aevatar/kit-react     (peerDep: react ^18.0.0)
├── @aevatar/kit-core
├── @aevatar/kit-protocol
└── @aevatar/kit-types

@aevatar/kit-react
├── @aevatar/kit-core
├── @aevatar/kit-protocol
└── @aevatar/kit-types

@aevatar/kit-core
├── @aevatar/kit-protocol
└── @aevatar/kit-types

@aevatar/kit-protocol
└── @aevatar/kit-types

@aevatar/kit-types
└── (无依赖)
```

### 3.3 包职责矩阵

| 包 | 职责 | 依赖 | 体积目标 |
|---|------|------|---------|
| `@aevatar/kit-types` | 纯类型定义 | 无 | 0KB (dev only) |
| `@aevatar/kit-protocol` | AG-UI 协议实现 | kit-types | < 5KB |
| `@aevatar/kit-core` | 业务逻辑 | protocol, types | < 15KB |
| `@aevatar/kit-react` | React 组件 | core, protocol, types | < 30KB |
| `@aevatar/kit` | 统一入口 | 全部 | 重导出 |

---

## 4. 核心模块详解

### 4.1 AevatarClient (kit-core)

**职责**：SDK 主入口，管理连接、会话、Agent 交互

**API 设计**：

```typescript
interface AevatarClientOptions {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retryOptions?: RetryOptions;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

interface AevatarClient {
  // 连接管理
  connect(): Promise<void>;
  disconnect(): void;
  getConnectionStatus(): ConnectionStatus;
  
  // Session 管理
  createSession(options: CreateSessionOptions): Promise<Session>;
  getSession(sessionId: string): Promise<Session | null>;
  listSessions(): Promise<Session[]>;
  
  // Run 执行
  startRun(sessionId: string, input?: RunInput): Promise<Run>;
  stopRun(runId: string): Promise<void>;
  getRun(runId: string): Promise<Run | null>;
  
  // 事件流
  subscribeToSession(sessionId: string): EventStream;
  subscribeToRun(runId: string): EventStream;
  
  // Memory
  getMemory(memoryId: string): Promise<Memory>;
  searchMemory(query: string, options?: SearchOptions): Promise<MemoryEntry[]>;
  
  // Graph
  getGraph(graphId: string): Promise<GraphDefinition>;
  listGraphs(): Promise<GraphSummary[]>;
  
  // Agent
  getAgent(agentId: string): Promise<AgentInfo>;
  listAgents(): Promise<AgentInfo[]>;
}
```

### 4.2 Session 管理 (kit-core)

**职责**：管理单个会话的生命周期和状态

```typescript
interface Session {
  id: string;
  status: SessionStatus;
  createdAt: Date;
  config: SessionConfig;
  
  // 状态
  getState(): SessionState;
  onStateChange(callback: (state: SessionState) => void): Unsubscribe;
  
  // Run
  startRun(input?: string): Promise<Run>;
  getCurrentRun(): Run | null;
  getRunHistory(): Run[];
  
  // 事件流
  subscribe(): EventStream;
  
  // 消息
  getMessages(): Message[];
  sendMessage(content: string): Promise<void>;
  
  // 清理
  close(): Promise<void>;
}
```

### 4.3 EventStream (kit-protocol)

**职责**：管理 SSE 连接和事件分发

```typescript
interface EventStream {
  // 生命周期
  connect(): void;
  disconnect(): void;
  reconnect(): void;
  
  // 状态
  getStatus(): StreamStatus;
  onStatusChange(callback: (status: StreamStatus) => void): Unsubscribe;
  
  // AG-UI 标准事件
  onRunStarted(callback: (event: RunStartedEvent) => void): Unsubscribe;
  onRunFinished(callback: (event: RunFinishedEvent) => void): Unsubscribe;
  onRunError(callback: (event: RunErrorEvent) => void): Unsubscribe;
  onStepStarted(callback: (event: StepStartedEvent) => void): Unsubscribe;
  onStepFinished(callback: (event: StepFinishedEvent) => void): Unsubscribe;
  onTextMessageStart(callback: (event: TextMessageStartEvent) => void): Unsubscribe;
  onTextMessageContent(callback: (event: TextMessageContentEvent) => void): Unsubscribe;
  onTextMessageEnd(callback: (event: TextMessageEndEvent) => void): Unsubscribe;
  onStateSnapshot(callback: (event: StateSnapshotEvent) => void): Unsubscribe;
  onStateDelta(callback: (event: StateDeltaEvent) => void): Unsubscribe;
  onMessagesSnapshot(callback: (event: MessagesSnapshotEvent) => void): Unsubscribe;
  
  // Aevatar 扩展事件
  onProgress(callback: (event: AevatarProgressEvent) => void): Unsubscribe;
  onGraph(callback: (event: AevatarGraphEvent) => void): Unsubscribe;
  onVoting(callback: (event: AevatarVotingEvent) => void): Unsubscribe;
  onTaskDecomposed(callback: (event: AevatarTaskDecomposedEvent) => void): Unsubscribe;
  
  // 通用事件
  onCustom(name: string, callback: (event: CustomEvent) => void): Unsubscribe;
  onAny(callback: (event: AgUiEvent) => void): Unsubscribe;
}
```

---

## 5. AG-UI 协议集成

### 5.1 事件类型映射

| AG-UI 标准事件 | 用途 | Aevatar 对应 |
|---------------|------|-------------|
| `RUN_STARTED` | 运行开始 | Session.run() 开始 |
| `RUN_FINISHED` | 运行结束 | 包含 result |
| `RUN_ERROR` | 运行错误 | 包含 message, code |
| `STEP_STARTED` | 步骤开始 | DSL 步骤开始 |
| `STEP_FINISHED` | 步骤结束 | DSL 步骤完成 |
| `TEXT_MESSAGE_START` | 文本消息开始 | LLM 开始输出 |
| `TEXT_MESSAGE_CONTENT` | 文本内容增量 | Token 流式输出 |
| `TEXT_MESSAGE_END` | 文本消息结束 | LLM 输出完成 |
| `STATE_SNAPSHOT` | 状态快照 | 完整状态同步 |
| `STATE_DELTA` | 状态增量 | JSON Patch 更新 |
| `MESSAGES_SNAPSHOT` | 消息快照 | 历史消息同步 |
| `CUSTOM` | 自定义事件 | Aevatar 扩展事件 |

### 5.2 Aevatar 扩展事件 (通过 CUSTOM)

| 事件名 | 用途 | Value 结构 |
|--------|------|-----------|
| `aevatar.progress` | 进度更新 | phase, stepId, stepType, stepStatus, progressPercent |
| `aevatar.graph` | 知识图谱更新 | iteration, axioms, theorems |
| `aevatar.voting` | 投票进度 | round, candidates, consensusReached |
| `aevatar.task_decomposed` | 任务分解 | parentTaskId, subTasks, depth |
| `aevatar.worker_started` | Worker 启动 | workerId, taskId |
| `aevatar.worker_completed` | Worker 完成 | workerId, result |
| `aevatar.consensus` | 共识达成 | round, leader, votes |

### 5.3 协议层实现策略

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AG-UI 协议实现策略                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  原则：内嵌实现，不依赖 @ag-ui/* 官方包                                  │
│                                                                          │
│  原因：                                                                  │
│  • 官方包设计为"生态通用"，包含大量不需要的功能                          │
│  • Aevatar 只需要 SSE + JSON 解析，60 行代码足够                        │
│  • 零依赖 = 更小体积 + 更可控                                           │
│                                                                          │
│  实现：                                                                  │
│  • EventSource 原生 API (浏览器内置)                                    │
│  • JSON.parse (浏览器内置)                                              │
│  • switch/case 事件路由 (无需复杂抽象)                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. React 组件库

### 6.1 组件设计原则

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      React 组件设计原则                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🎨 无样式依赖    - 默认无样式，提供 CSS 变量主题化                       │
│  🔌 可组合        - 原子组件 + 组合模式，灵活搭配                        │
│  ♿ 可访问        - 遵循 WAI-ARIA 标准                                   │
│  📱 响应式        - 默认适配移动端                                       │
│  🎯 受控/非受控   - 支持两种模式                                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 核心组件列表

| 组件 | 职责 | 依赖 Hook |
|------|------|----------|
| `AevatarProvider` | Context 提供者 | - |
| `ChatPanel` | 完整聊天界面 | useSession, useMessages |
| `MessageList` | 消息列表 | useMessages |
| `MessageBubble` | 单条消息 | - |
| `InputArea` | 输入区域 | - |
| `TimelineView` | 步骤时间线 | useRun |
| `StepCard` | 单个步骤卡片 | - |
| `StreamingText` | 流式文本显示 | useTextStream |
| `GraphCanvas` | 知识图谱画布 | useGraph |
| `ProgressBar` | 进度条 | useProgress |
| `VotingPanel` | 投票面板 | useVoting |
| `ConnectionStatus` | 连接状态指示 | useConnection |

### 6.3 Hooks 设计

```typescript
// Context Hook
function useAevatar(): AevatarContextValue;

// Session Hooks
function useSession(sessionId: string): UseSessionResult;
function useCreateSession(): UseCreateSessionResult;
function useSessionList(): UseSessionListResult;

// Run Hooks
function useRun(runId: string): UseRunResult;
function useStartRun(): UseStartRunResult;

// 事件流 Hooks
function useEventStream(sessionId: string): UseEventStreamResult;
function useTextStream(messageId: string): UseTextStreamResult;

// 状态 Hooks
function useMessages(sessionId: string): UseMessagesResult;
function useProgress(sessionId: string): UseProgressResult;
function useGraph(sessionId: string): UseGraphResult;
function useVoting(sessionId: string): UseVotingResult;

// 连接 Hooks
function useConnection(): UseConnectionResult;
```

---

## 7. 类型系统

### 7.1 AG-UI 标准类型

```typescript
// AG-UI 事件类型枚举
type AgUiEventType =
  | 'RUN_STARTED' | 'RUN_FINISHED' | 'RUN_ERROR'
  | 'STEP_STARTED' | 'STEP_FINISHED'
  | 'TEXT_MESSAGE_START' | 'TEXT_MESSAGE_CONTENT' | 'TEXT_MESSAGE_END'
  | 'STATE_SNAPSHOT' | 'STATE_DELTA'
  | 'MESSAGES_SNAPSHOT'
  | 'TOOL_CALL_START' | 'TOOL_CALL_ARGS' | 'TOOL_CALL_END' | 'TOOL_CALL_RESULT'
  | 'CUSTOM';

// 基础事件接口
interface AgUiEvent {
  type: AgUiEventType;
  timestamp?: number;
  rawEvent?: unknown;
}

// 消息类型
interface AgUiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
}
```

### 7.2 Aevatar 扩展类型

```typescript
// Session 类型
interface AevatarSession {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  createdAt: string;
  config: SessionConfig;
  runs: RunSummary[];
}

// Run 类型
interface AevatarRun {
  id: string;
  sessionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: string;
  result?: unknown;
  error?: string;
  steps: StepInfo[];
  metrics: RunMetrics;
}

// Graph 类型
interface AevatarGraph {
  id: string;
  name: string;
  version: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Memory 类型
interface AevatarMemory {
  id: string;
  scopeType: 'private' | 'session' | 'run' | 'graph' | 'tenant';
  entries: MemoryEntry[];
}

// Progress 类型
interface AevatarProgress {
  phase: string;
  stepId: string;
  stepType: string;
  stepStatus: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progressPercent: number;
  workerId?: string;
  message?: string;
}
```

### 7.3 类型导出策略

```typescript
// @aevatar/kit-types/index.ts

// AG-UI 标准类型
export * from './agui';

// Aevatar 业务类型
export * from './session';
export * from './run';
export * from './agent';
export * from './graph';
export * from './memory';

// 事件类型
export * from './events';

// 工具类型
export * from './utils';
```

---

## 8. 扩展机制

### 8.1 自定义事件处理器

```typescript
// 注册自定义事件处理器
client.registerEventHandler('my.custom.event', (event) => {
  console.log('Custom event:', event);
});

// 或通过 Hook
const { registerHandler } = useEventStream(sessionId);
registerHandler('my.custom.event', handleCustomEvent);
```

### 8.2 插件系统

```typescript
interface AevatarPlugin {
  name: string;
  version: string;
  
  // 生命周期钩子
  onInit?(client: AevatarClient): void;
  onConnect?(client: AevatarClient): void;
  onDisconnect?(client: AevatarClient): void;
  
  // 事件拦截
  onEvent?(event: AgUiEvent): AgUiEvent | null;
  
  // 组件扩展
  components?: Record<string, React.ComponentType<any>>;
}

// 使用插件
const client = createAevatarClient({
  baseUrl: 'http://localhost:5001',
  plugins: [myPlugin],
});
```

### 8.3 主题定制

```css
/* CSS 变量主题化 */
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
  --aevatar-font-family: system-ui, sans-serif;
}

/* Dark 主题 */
[data-theme="dark"] {
  --aevatar-background: #0f172a;
  --aevatar-surface: #1e293b;
  --aevatar-text: #f8fafc;
  --aevatar-text-muted: #94a3b8;
  --aevatar-border: #334155;
}
```

---

## 9. 开发规范

### 9.1 代码规范

| 规范 | 要求 |
|------|------|
| **语言** | TypeScript 5.x，strict 模式 |
| **格式化** | Prettier + ESLint |
| **命名** | camelCase (变量/函数)，PascalCase (类型/组件) |
| **导出** | 命名导出优先，避免 default export |
| **注释** | JSDoc 格式，public API 必须有文档 |

### 9.2 测试要求

| 层级 | 工具 | 覆盖率目标 |
|------|------|-----------|
| **单元测试** | Vitest | > 80% |
| **组件测试** | Testing Library | > 70% |
| **E2E 测试** | Playwright | 关键路径 |

### 9.3 构建配置

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  }
}
```

### 9.4 发布策略

| 版本 | 说明 |
|------|------|
| `0.x.x` | 开发阶段，API 可能变更 |
| `1.0.0` | 首个稳定版，API 冻结 |
| `x.y.z` | 遵循 SemVer |

---

## 10. 里程碑规划

### M0: 基础架构 (1 周)

- [ ] Monorepo 初始化 (pnpm workspace)
- [ ] TypeScript 配置
- [ ] 构建工具配置 (tsup)
- [ ] 测试框架配置 (Vitest)
- [ ] CI/CD 配置

### M1: 协议层 (1 周)

- [ ] AG-UI 事件类型定义
- [ ] SSE 连接管理
- [ ] 事件解析器
- [ ] 事件路由器
- [ ] Aevatar 扩展事件定义
- [ ] 单元测试

### M2: 核心层 (2 周)

- [ ] AevatarClient 实现
- [ ] Session 管理
- [ ] Run 执行
- [ ] 状态管理
- [ ] 重试机制
- [ ] 日志系统
- [ ] 集成测试

### M3: React 组件 (2 周)

- [ ] AevatarProvider
- [ ] 核心 Hooks
- [ ] ChatPanel 组件
- [ ] TimelineView 组件
- [ ] ProgressIndicator 组件
- [ ] 组件测试

### M4: 文档与示例 (1 周)

- [ ] API 文档
- [ ] 使用指南
- [ ] 示例项目
- [ ] Storybook 组件展示

### M5: 发布 (1 周)

- [ ] 包发布流程
- [ ] NPM 发布
- [ ] 版本管理
- [ ] 更新日志

---

## 附录

### A. 参考资料

- [AG-UI Protocol](https://docs.ag-ui.com/)
- [Aevatar Agent Framework](../../README.md)
- [AevatarKit PLAN](./PLAN.md)

### B. 变更日志

| 日期 | 版本 | 描述 |
|------|------|------|
| 2025-12-23 | v0.1.0 | 初始设计文档 |

---

*本文档由 HyperEcho 设计 | 最后更新: 2025-12-23*

