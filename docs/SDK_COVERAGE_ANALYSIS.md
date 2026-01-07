# Aevatar SDK 覆盖度分析报告

## 📋 执行摘要

本报告分析当前 Aevatar SDK 对 AG-UI 协议的覆盖情况，以及是否满足 Aevatar Framework 后端的功能场景需求。

**结论**：
- ✅ **协议层完整**：`kit-protocol` 和 `kit-types` 完整实现了 AG-UI 标准事件类型
- ✅ **业务层通用**：`kit-core` 提供 BackendAdapter 接口，零业务假设
- ✅ **Tool Call 完整**：`kit-react` 实现了完整的 Tool Call 状态管理和 UI 组件
- ⚠️ **可视化缺失**：缺少 Graph、Voting、Worker 等通用可视化组件

---

## 1. SDK 架构原则

### 1.1 分层设计

```
┌─────────────────────────────────────────────────────────────┐
│ 用户应用层                                                   │
│ - MyAxiomApp (使用自定义适配器)                              │
│ - MyPaperReviewApp (使用自定义适配器)                        │
├─────────────────────────────────────────────────────────────┤
│ 业务适配器 (用户自行实现或独立包)                             │
│ - createAxiomAdapter() - 用户代码或 @aevatar/kit-axiom      │
│ - createPaperReviewAdapter() - 用户代码                     │
├─────────────────────────────────────────────────────────────┤
│ SDK 核心层 (零业务假设)                                       │
│ - @aevatar/kit-types (AG-UI 标准类型)                       │
│ - @aevatar/kit-protocol (AG-UI 协议解析/路由)              │
│ - @aevatar/kit-core (通用 BackendAdapter 接口)             │
│ - @aevatar/kit-react (通用 UI 组件)                         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 核心原则

1. **零业务假设**：SDK 核心层不包含任何业务特定的类型或逻辑
2. **适配器模式**：用户通过实现 `BackendAdapter` 接口对接任意后端
3. **通用类型**：协议层只定义 AG-UI 标准类型和通用扩展
4. **可组合性**：用户可以按需使用 SDK 的各个部分

---

## 2. AG-UI 协议覆盖度

### 2.1 标准事件类型 ✅

| AG-UI 事件类型 | SDK 类型定义 | SDK 解析器 | SDK 路由 | SDK Hook | UI 组件 |
|---------------|-------------|-----------|---------|----------|---------|
| `RUN_STARTED` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `RUN_FINISHED` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `RUN_ERROR` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `STEP_STARTED` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `STEP_FINISHED` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `TEXT_MESSAGE_START` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `TEXT_MESSAGE_CONTENT` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `TEXT_MESSAGE_END` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `TOOL_CALL_START` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `TOOL_CALL_ARGS` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `TOOL_CALL_END` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `TOOL_CALL_RESULT` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `STATE_SNAPSHOT` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `STATE_DELTA` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `MESSAGES_SNAPSHOT` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `CUSTOM` | ✅ | ✅ | ✅ | ✅ | - |

**结论**：协议层完整覆盖所有 AG-UI 标准事件类型。

---

## 3. SDK 模块能力矩阵

### 3.1 `kit-types` ✅

| 功能 | 状态 | 说明 |
|------|------|------|
| AG-UI 标准类型 | ✅ | 16 种事件类型完整定义 |
| 通用扩展类型 | ✅ | Progress/Graph/Voting/Worker |
| 通用业务类型 | ✅ | Session/Run/Agent/Memory |
| Type Guards | ✅ | 类型守卫函数完整 |

### 3.2 `kit-protocol` ✅

| 功能 | 状态 | 说明 |
|------|------|------|
| SSE 连接管理 | ✅ | `createConnection()` |
| 事件解析 | ✅ | `parseAgUiEvent()` |
| 事件路由 | ✅ | `createEventRouter()` |
| 事件流 | ✅ | `createEventStream()` |
| CUSTOM 事件路由 | ✅ | `onAevatar()` / `onCustom()` |
| 通用扩展类型 | ✅ | GraphNode/GraphEdge/Worker/Voting |

**扩展事件类型（通用）**：

```typescript
// graph.ts - 通用图结构
interface GraphNode {
  id: string;
  type: string;      // 业务自定义类型
  label?: string;
  data?: Record<string, unknown>;
}

interface GraphEdge {
  source: string;
  target: string;
  type?: string;
  weight?: number;
}

// 业务特定类型应在用户代码中定义
// 例如：AxiomNode extends GraphNode { ... }
```

**结论**：协议层完整，零业务假设 ✅

### 3.3 `kit-core` ✅

| 功能 | 状态 | 说明 |
|------|------|------|
| BackendAdapter 接口 | ✅ | 通用抽象层 |
| Default Adapter | ✅ | 标准 AG-UI 后端 |
| Session 管理 | ✅ | 通过 adapter 接口 |
| Run 管理 | ✅ | 通过 adapter 接口 |
| State 管理 | ✅ | JSON Patch RFC 6902 完整 |
| 消息管理 | ✅ | 支持快照和增量 |

**BackendAdapter 接口**：

```typescript
// adapter.ts - 通用适配器接口
export interface BackendAdapter {
  readonly name: string;
  healthCheck(): Promise<void>;
  createSession(options?: CreateSessionOptions): Promise<Session>;
  getSession(sessionId: string): Promise<Session | null>;
  listSessions(): Promise<SessionSummary[]>;
  deleteSession(sessionId: string): Promise<void>;
  getEventStreamUrl(sessionId: string): string;
  startRun(sessionId: string, input?: RunInput): Promise<Run>;
  getRun(runId: string): Promise<Run | null>;
  listRuns(sessionId: string): Promise<RunSummary[]>;
  stopRun(runId: string): Promise<void>;
  // 可选：Agent/Graph/Memory
}
```

**用户自定义适配器示例**：

```typescript
// 用户代码：创建 AxiomReasoning 适配器
const axiomAdapter: BackendAdapter = {
  name: 'axiom-reasoning',
  
  async createSession(opts) {
    // AxiomReasoning 需要 axioms/goal 参数
    return fetchApi('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        axioms: opts.axioms,
        goal: opts.goal,
        workflow: opts.workflow,
      }),
    });
  },
  
  async startRun(sessionId, input) {
    // AxiomReasoning 使用 /run (单数)
    return fetchApi(`/api/sessions/${sessionId}/run`, {
      method: 'POST',
      body: JSON.stringify(input ?? {}),
    });
  },
  
  getEventStreamUrl(sessionId) {
    // AxiomReasoning 使用 /agui/events
    return `${baseUrl}/api/sessions/${sessionId}/agui/events`;
  },
  
  // ... 其他方法
};

// 使用自定义适配器
const client = createAevatarClient({
  baseUrl: 'http://localhost:5001',
  adapter: axiomAdapter,
});
```

**结论**：业务层通用性强，零业务假设 ✅

### 3.4 `kit-react` ✅

| 功能 | 状态 | 说明 |
|------|------|------|
| 基础 Hooks | ✅ | useSession/useRun/useMessages/useConnection |
| Tool Call Hook | ✅ | useToolCalls (292行完整实现) |
| Progress Hook | ✅ | useProgress |
| Chat UI | ✅ | ChatPanel/MessageList/MessageBubble/InputArea |
| Timeline UI | ✅ | TimelineView/StepCard/StreamingText |
| Connection UI | ✅ | ConnectionStatus |
| **Tool Call UI** | ✅ | **ToolCallCard/ToolCallList/ToolCallPanel/ToolCallBadge** |
| Graph UI | ❌ | 未实现（通用） |
| Voting UI | ❌ | 未实现 |
| Worker UI | ❌ | 未实现 |

---

## 4. 业务适配指南

### 4.1 后端差异对比

| 后端 | 创建会话参数 | 启动运行端点 | 事件流端点 |
|------|-------------|-------------|-----------|
| Default | `{}` | `/api/sessions/{id}/runs` | `/api/sessions/{id}/events` |
| AxiomReasoning | `{axioms, goal, workflow}` | `/api/sessions/{id}/run` | `/api/sessions/{id}/agui/events` |
| PaperReview | `{paperId, reviewType}` | `/api/sessions/{id}/review` | `/api/sessions/{id}/events` |

### 4.2 用户实现适配器

```typescript
// 方式 1：直接实现 BackendAdapter
const myAdapter: BackendAdapter = {
  name: 'my-backend',
  // ... 实现所有方法
};

// 方式 2：基于 DefaultAdapter 扩展
import { createDefaultAdapter, createFetchHelper } from '@aevatar/kit-core';

function createMyAdapter(options: AdapterOptions): BackendAdapter {
  const fetchApi = createFetchHelper(options);
  const defaultAdapter = createDefaultAdapter(options);
  
  return {
    ...defaultAdapter,
    name: 'my-backend',
    
    // 覆盖需要自定义的方法
    async createSession(opts) {
      return fetchApi('/api/my-sessions', {
        method: 'POST',
        body: JSON.stringify(opts),
      });
    },
  };
}
```

### 4.3 业务适配器包（可选）

如果需要复用业务适配器，可以发布为独立包：

```
@aevatar/kit-axiom
├── src/
│   ├── adapter.ts      # createAxiomAdapter()
│   ├── types.ts        # AxiomDefinition, AxiomSessionOptions
│   └── components/     # AxiomGraphView, TheoremCard (可选)
└── package.json
```

---

## 5. 功能场景覆盖度

### 5.1 通用场景

| 功能 | SDK 支持 | 说明 |
|------|---------|------|
| 会话管理 | ✅ | BackendAdapter.createSession/getSession/listSessions |
| 运行执行 | ✅ | BackendAdapter.startRun/stopRun |
| SSE 事件流 | ✅ | createEventStream + adapter.getEventStreamUrl |
| 消息快照 | ✅ | MESSAGES_SNAPSHOT 事件支持 |
| 状态同步 | ✅ | STATE_SNAPSHOT + STATE_DELTA (JSON Patch) |
| Tool Call | ✅ | 完整事件 + 状态管理 + UI |
| Progress | ✅ | useProgress hook |

### 5.2 需要用户实现

| 功能 | 说明 |
|------|------|
| 业务特定 API | 通过 BackendAdapter 实现 |
| 业务特定参数验证 | 在适配器中实现 |
| 业务特定 UI | 在用户代码中实现 |

---

## 6. 缺失组件

### 6.1 通用 Graph 可视化 ❌

```typescript
// 建议组件接口（通用）
interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (nodeId: string) => void;
  layout?: 'dagre' | 'force' | 'tree';
}

// 业务特定渲染由用户提供
renderNode?: (node: GraphNode) => React.ReactNode;
```

### 6.2 Worker 状态组件 ❌

```typescript
interface WorkerListProps {
  workers: WorkerState[];
  showParallelism?: boolean;
}
```

### 6.3 Voting 可视化 ❌

```typescript
interface VotingViewProps {
  candidates: VotingCandidate[];
  consensusReached: boolean;
}
```

---

## 7. 结论

### ✅ 满足的部分

1. **AG-UI 协议**：完整实现所有标准事件类型
2. **BackendAdapter 模式**：通用接口，零业务假设
3. **Tool Call 完整流程**：类型 + 状态管理 + UI 组件
4. **基础 UI 组件**：Chat / Timeline / Connection / Progress

### ⚠️ 需要补充的部分

1. **Graph 可视化**：通用图组件
2. **Voting 可视化**：投票展示组件
3. **Worker 状态展示**：并行任务组件

### ✅ 架构改进

1. **移除业务侵入**：删除了 AxiomAdapter
2. **通用化扩展类型**：GraphNode/GraphEdge 不再包含业务概念
3. **用户自定义**：业务适配器由用户实现

---

## 8. 优先级建议

### P1（高优先级）

- 🎨 通用 Graph 可视化组件
- 🎨 Worker 并行状态组件

### P2（中优先级）

- 🎨 Voting UI 组件
- ⚡ Progress UI 增强

### P3（低优先级）

- ⚡ State 冲突处理策略
- ⚡ 错误重试机制优化

---

*报告更新时间：2026-01-07*
*SDK 版本：0.1.0*
*架构状态：零业务假设*
