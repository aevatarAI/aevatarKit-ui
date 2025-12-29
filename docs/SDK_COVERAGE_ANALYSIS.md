# Aevatar SDK 覆盖度分析报告

## 📋 执行摘要

本报告分析当前 Aevatar SDK 对 AG-UI 协议的覆盖情况，以及是否满足 Aevatar Framework 后端的功能场景需求。

**结论**：
- ✅ **协议层完整**：`kit-protocol` 和 `kit-types` 完整实现了 AG-UI 标准事件类型
- ⚠️ **业务层受限**：`kit-core` 硬编码了特定 API 格式，无法适配不同后端
- ❌ **功能缺失**：缺少 Tool Call、Graph、Voting、Worker 等 Aevatar 扩展场景的完整支持

---

## 1. AG-UI 协议覆盖度

### 1.1 标准事件类型 ✅

| AG-UI 事件类型 | SDK 类型定义 | SDK 解析器 | SDK 路由 | 后端实现 |
|---------------|-------------|-----------|---------|---------|
| `RUN_STARTED` | ✅ | ✅ | ✅ | ✅ |
| `RUN_FINISHED` | ✅ | ✅ | ✅ | ✅ |
| `RUN_ERROR` | ✅ | ✅ | ✅ | ✅ |
| `STEP_STARTED` | ✅ | ✅ | ✅ | ✅ |
| `STEP_FINISHED` | ✅ | ✅ | ✅ | ✅ |
| `TEXT_MESSAGE_START` | ✅ | ✅ | ✅ | ✅ |
| `TEXT_MESSAGE_CONTENT` | ✅ | ✅ | ✅ | ✅ |
| `TEXT_MESSAGE_END` | ✅ | ✅ | ✅ | ✅ |
| `TOOL_CALL_START` | ✅ | ✅ | ✅ | ❓ |
| `TOOL_CALL_ARGS` | ✅ | ✅ | ✅ | ❓ |
| `TOOL_CALL_END` | ✅ | ✅ | ✅ | ❓ |
| `TOOL_CALL_RESULT` | ✅ | ✅ | ✅ | ❓ |
| `STATE_SNAPSHOT` | ✅ | ✅ | ✅ | ✅ |
| `STATE_DELTA` | ✅ | ✅ | ✅ | ✅ |
| `MESSAGES_SNAPSHOT` | ✅ | ✅ | ✅ | ✅ |
| `CUSTOM` | ✅ | ✅ | ✅ | ✅ |

**结论**：协议层完整覆盖所有 AG-UI 标准事件类型。

---

## 2. Aevatar Framework 后端功能场景

### 2.1 核心场景分析

#### ✅ **场景 1：基础会话管理**
**后端实现**：`AxiomReasoningService`
- `POST /api/sessions` - 创建会话（需要 `axioms`, `goal`, `workflow` 等）
- `GET /api/sessions/:id` - 获取会话
- `POST /api/sessions/:id/run` - 启动运行
- `GET /api/sessions/:id/agui/events` - SSE 事件流

**SDK 支持**：
- ✅ `kit-protocol`: SSE 连接和事件解析
- ⚠️ `kit-core`: 硬编码 `/api/sessions` 和 `/runs`，无法适配 `/run` 单数形式
- ❌ 缺少 AxiomReasoning 特定的会话创建参数（`axioms`, `goal`, `workflow`）

**问题**：
```typescript
// kit-core/src/session.ts - 硬编码端点
const response = await fetch(`${baseUrl}/api/sessions`, {
  method: 'POST',
  // 空 body，但 AxiomReasoning 需要 { axioms, goal, ... }
});

// kit-core/src/run.ts - 硬编码复数形式
const response = await fetch(`${baseUrl}/api/sessions/${sessionId}/runs`, {
  // AxiomReasoning 实际是 /run (单数)
});
```

#### ✅ **场景 2：消息快照（重连优化）**
**后端实现**：`AgUiBootstrap.CollectAssistantMessagesAsync()`
- 重连时发送 `MESSAGES_SNAPSHOT` 而非重放所有事件
- 从 Actor State 和 Memory 收集消息

**SDK 支持**：
- ✅ `kit-protocol`: 支持 `MESSAGES_SNAPSHOT` 事件
- ✅ `kit-react`: `useMessages` hook 正确处理快照
- ✅ `kit-core`: `StateStore` 支持快照更新

**结论**：✅ 完整支持

#### ⚠️ **场景 3：状态同步（JSON Patch）**
**后端实现**：`STATE_SNAPSHOT` + `STATE_DELTA` (JSON Patch RFC 6902)

**SDK 支持**：
- ✅ `kit-types`: 定义了 `JsonPatchOperation`
- ✅ `kit-core`: `StateStore` 实现了 JSON Patch 应用
- ⚠️ 缺少状态合并策略配置（冲突处理）

**结论**：✅ 基本支持，可增强

#### ❌ **场景 4：Tool Call 流式调用**
**后端实现**：`TOOL_CALL_START` → `TOOL_CALL_ARGS` → `TOOL_CALL_END` → `TOOL_CALL_RESULT`

**SDK 支持**：
- ✅ `kit-types`: 定义了所有 Tool Call 事件类型
- ✅ `kit-protocol`: 解析和路由支持
- ❌ `kit-react`: 缺少 Tool Call UI 组件
- ❌ `kit-core`: 缺少 Tool Call 状态管理

**缺失**：
- Tool Call 参数流式拼接
- Tool Call 结果展示
- Tool Call 错误处理

#### ❌ **场景 5：Aevatar 扩展事件**

##### 5.1 Progress 事件
**后端实现**：`aevatar.axiom.progress`, `aevatar.axiom.status_snapshot`

**SDK 支持**：
- ✅ `kit-protocol/extensions/progress.ts`: 定义了类型
- ✅ `kit-protocol`: `onAevatar('aevatar.progress')` 支持
- ⚠️ `kit-react`: `useProgress` hook 存在但功能简单

**缺失**：
- Progress 历史记录
- Progress 阶段转换动画
- Progress 预算超限警告

##### 5.2 Graph 事件
**后端实现**：`aevatar.graph` (DAG 结构)

**SDK 支持**：
- ✅ `kit-protocol/extensions/graph.ts`: 定义了 `GraphAxiom`, `GraphTheorem`
- ✅ `kit-protocol`: `onAevatar('aevatar.graph')` 支持
- ❌ `kit-react`: 缺少 Graph 可视化组件

**缺失**：
- DAG 渲染组件
- Graph 节点交互（展开/折叠）
- Graph 搜索和过滤

##### 5.3 Voting 事件
**后端实现**：`aevatar.voting` (多 Worker 投票)

**SDK 支持**：
- ✅ `kit-protocol/extensions/voting.ts`: 定义了 `VotingCandidate`
- ✅ `kit-protocol`: `onAevatar('aevatar.voting')` 支持
- ❌ `kit-react`: 缺少 Voting UI 组件

**缺失**：
- 投票结果可视化
- 投票进度展示
- 共识达成动画

##### 5.4 Worker 事件
**后端实现**：`aevatar.worker_started`, `aevatar.worker_completed`

**SDK 支持**：
- ✅ `kit-protocol/extensions/worker.ts`: 定义了 Worker 事件类型
- ✅ `kit-protocol`: `onAevatar('aevatar.worker_*')` 支持
- ❌ `kit-react`: 缺少 Worker 状态展示

**缺失**：
- Worker 列表组件
- Worker 并行度可视化
- Worker 失败重试 UI

---

## 3. SDK 模块能力矩阵

### 3.1 `kit-types` ✅

| 功能 | 状态 | 说明 |
|------|------|------|
| AG-UI 标准类型 | ✅ | 完整 |
| Aevatar 扩展类型 | ✅ | 完整 |
| 业务类型 (Session/Run) | ✅ | 完整但可能过于具体 |

### 3.2 `kit-protocol` ✅

| 功能 | 状态 | 说明 |
|------|------|------|
| SSE 连接管理 | ✅ | `createConnection()` |
| 事件解析 | ✅ | `parseAgUiEvent()` |
| 事件路由 | ✅ | `createEventRouter()` |
| 事件流 | ✅ | `createEventStream()` |
| Aevatar 扩展路由 | ✅ | `onAevatar()` |

**结论**：协议层完整，零业务假设 ✅

### 3.3 `kit-core` ⚠️

| 功能 | 状态 | 问题 |
|------|------|------|
| Session 管理 | ⚠️ | 硬编码 API 端点 |
| Run 管理 | ⚠️ | 硬编码 API 端点 |
| State 管理 | ✅ | JSON Patch 支持完整 |
| 消息管理 | ✅ | 支持快照和增量 |
| Tool Call 管理 | ❌ | 未实现 |
| Graph 管理 | ❌ | 未实现 |
| Voting 管理 | ❌ | 未实现 |
| Worker 管理 | ❌ | 未实现 |

**核心问题**：
```typescript
// 硬编码端点格式
POST /api/sessions          // 无法适配 /api/sessions (需要 body)
POST /api/sessions/:id/runs // 无法适配 /api/sessions/:id/run
GET  /api/sessions/:id/events // 无法适配 /api/sessions/:id/agui/events
```

### 3.4 `kit-react` ⚠️

| 功能 | 状态 | 问题 |
|------|------|------|
| 基础 Hooks | ✅ | `useSession`, `useRun`, `useMessages` |
| Chat UI | ✅ | `ChatPanel`, `MessageList` |
| Timeline UI | ✅ | `TimelineView`, `StepCard` |
| Connection UI | ✅ | `ConnectionStatus` |
| Progress UI | ⚠️ | `ProgressBar` 功能简单 |
| Tool Call UI | ❌ | 未实现 |
| Graph UI | ❌ | 未实现 |
| Voting UI | ❌ | 未实现 |
| Worker UI | ❌ | 未实现 |

---

## 4. 功能场景覆盖度

### 4.1 AxiomReasoning 场景

| 功能 | 后端实现 | SDK 支持 | 状态 |
|------|---------|---------|------|
| 会话创建（Axioms/Goal） | ✅ | ⚠️ | 需要自定义 API 调用 |
| 启动推理运行 | ✅ | ⚠️ | 端点不匹配 |
| SSE 事件流 | ✅ | ✅ | 完整支持 |
| 消息快照 | ✅ | ✅ | 完整支持 |
| Progress 展示 | ✅ | ⚠️ | 基础支持 |
| Graph 可视化 | ✅ | ❌ | 未实现 |
| Voting 展示 | ✅ | ❌ | 未实现 |
| Worker 状态 | ✅ | ❌ | 未实现 |

### 4.2 PaperReview 场景（推测）

| 功能 | 后端实现 | SDK 支持 | 状态 |
|------|---------|---------|------|
| 论文上传 | ✅ | ❌ | 需要文件上传 API |
| Review 流程 | ✅ | ⚠️ | 基础支持（Step 事件） |
| 评论流 | ✅ | ✅ | 消息流支持 |
| 状态同步 | ✅ | ✅ | State 管理支持 |

### 4.3 通用 Agent 场景

| 功能 | 后端实现 | SDK 支持 | 状态 |
|------|---------|---------|------|
| Agent 列表 | ✅ | ⚠️ | `kit-core` 有 API，但端点硬编码 |
| Agent 详情 | ✅ | ⚠️ | 同上 |
| Graph 定义 | ✅ | ⚠️ | 同上 |
| Memory 搜索 | ✅ | ⚠️ | 同上 |

---

## 5. 关键问题总结

### 5.1 协议层 ✅
- **状态**：完整实现 AG-UI 协议
- **问题**：无

### 5.2 业务层 ⚠️
- **状态**：功能完整但通用性差
- **问题**：
  1. API 端点硬编码（`/sessions`, `/runs`）
  2. 请求格式硬编码（空 body vs 需要参数）
  3. 无法适配不同后端（AxiomReasoning vs PaperReview）

### 5.3 UI 层 ⚠️
- **状态**：基础组件完整，扩展组件缺失
- **问题**：
  1. 缺少 Tool Call UI
  2. 缺少 Graph 可视化
  3. 缺少 Voting/Worker 状态展示
  4. Progress UI 功能简单

---

## 6. 改进建议

### 6.1 短期（协议层已完整，无需改动）

### 6.2 中期（业务层适配器模式）

**方案**：引入 `BackendAdapter` 接口

```typescript
interface BackendAdapter {
  createSession(params: unknown): Promise<{ sessionId: string }>;
  startRun(sessionId: string, params?: unknown): Promise<void>;
  getEventStreamUrl(sessionId: string): string;
  getSession(sessionId: string): Promise<Session>;
  // ...
}

// AxiomReasoning 适配器
const axiomAdapter: BackendAdapter = {
  createSession: async (p) => {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        axioms: p.axioms,
        goal: p.goal,
        workflow: p.workflow,
        // ...
      }),
    });
    return res.json();
  },
  startRun: async (id) => {
    await fetch(`/api/sessions/${id}/run`, { method: 'POST' });
  },
  getEventStreamUrl: (id) => `/api/sessions/${id}/agui/events`,
  // ...
};

// 使用
const client = createAevatarClient({
  baseUrl: '/api',
  adapter: axiomAdapter, // 注入适配器
});
```

### 6.3 长期（UI 组件扩展）

1. **Tool Call UI**
   - `ToolCallCard` 组件
   - `ToolCallArgs` 流式展示
   - `ToolCallResult` 结果展示

2. **Graph UI**
   - `GraphView` DAG 可视化（使用 D3.js 或 Cytoscape.js）
   - `GraphNode` 节点组件
   - `GraphEdge` 边组件

3. **Voting UI**
   - `VotingPanel` 投票结果展示
   - `ConsensusIndicator` 共识达成指示器

4. **Worker UI**
   - `WorkerList` Worker 列表
   - `WorkerStatus` Worker 状态卡片
   - `ParallelismIndicator` 并行度可视化

---

## 7. 结论

### ✅ 满足的部分
1. **AG-UI 协议**：完整实现所有标准事件类型
2. **基础场景**：消息流、状态同步、会话管理（需适配）
3. **协议层设计**：零业务假设，通用性强

### ⚠️ 需要改进的部分
1. **业务层通用性**：硬编码 API 端点，需要适配器模式
2. **扩展场景支持**：Tool Call、Graph、Voting、Worker 缺少完整实现
3. **UI 组件**：基础组件完整，扩展组件缺失

### ❌ 缺失的部分
1. **Tool Call 完整流程**：类型有，但缺少状态管理和 UI
2. **Graph 可视化**：类型有，但缺少渲染组件
3. **Voting/Worker UI**：类型有，但缺少展示组件

---

## 8. 优先级建议

### P0（必须）
- ✅ 协议层已完整，无需改动

### P1（重要）
- 🔧 业务层适配器模式重构
- 🔧 Tool Call 状态管理

### P2（增强）
- 🎨 Graph 可视化组件
- 🎨 Voting UI 组件
- 🎨 Worker UI 组件

### P3（优化）
- ⚡ Progress UI 增强
- ⚡ State 冲突处理策略
- ⚡ 错误重试机制优化

---

*报告生成时间：2025-01-XX*
*SDK 版本：0.1.0*

