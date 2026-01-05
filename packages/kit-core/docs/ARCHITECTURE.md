# kit-core Architecture

> Backend adapter pattern for flexible API integration

## 目录结构

```
kit-core/src/
├── adapter.ts           # BackendAdapter 接口 + 默认实现
├── adapters/            # 预构建适配器
│   ├── index.ts         # 适配器导出
│   └── axiom.ts         # Axiom Reasoning 适配器
├── client.ts            # AevatarClient 主入口
├── session.ts           # Session 生命周期管理
├── run.ts               # Run 执行管理
├── state.ts             # 状态存储 (JSON Patch)
├── utils/
│   ├── logger.ts        # 日志工具
│   └── retry.ts         # 重试管理
└── index.ts             # 模块导出
```

## 核心设计：适配器模式

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Adapter Pattern                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────────┐                                                   │
│   │  AevatarClient   │                                                   │
│   │                  │                                                   │
│   │  • connect()     │                                                   │
│   │  • createSession │                                                   │
│   │  • getSession    │                                                   │
│   └────────┬─────────┘                                                   │
│            │                                                             │
│            │ uses                                                        │
│            ▼                                                             │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                    BackendAdapter (Interface)                 │      │
│   │                                                               │      │
│   │  • healthCheck()                                              │      │
│   │  • createSession(options) → Session                          │      │
│   │  • getEventStreamUrl(sessionId) → string                     │      │
│   │  • startRun(sessionId, input) → Run                          │      │
│   │  • stopRun(runId)                                            │      │
│   │  • getAgent?(agentId)                                        │      │
│   │  • ...                                                        │      │
│   └──────────────────────────┬───────────────────────────────────┘      │
│                              │                                           │
│              ┌───────────────┼───────────────┐                          │
│              │               │               │                          │
│              ▼               ▼               ▼                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│   │ DefaultAdapter│  │AxiomAdapter │  │ CustomAdapter│                  │
│   │              │  │              │  │              │                  │
│   │ /api/sessions│  │ /api/sessions│  │ 用户自定义   │                  │
│   │ /api/.../runs│  │ /api/.../run │  │              │                  │
│   │ /.../events  │  │ /.../agui/   │  │              │                  │
│   │              │  │    events    │  │              │                  │
│   └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## BackendAdapter 接口

```typescript
interface BackendAdapter {
  readonly name: string;

  // Health
  healthCheck(): Promise<void>;

  // Sessions
  createSession(options?: CreateSessionOptions): Promise<Session>;
  getSession(sessionId: string): Promise<Session | null>;
  listSessions(): Promise<SessionSummary[]>;
  deleteSession(sessionId: string): Promise<void>;
  getEventStreamUrl(sessionId: string): string;

  // Runs
  startRun(sessionId: string, input?: RunInput): Promise<Run>;
  getRun(runId: string): Promise<Run | null>;
  listRuns(sessionId: string): Promise<RunSummary[]>;
  stopRun(runId: string): Promise<void>;

  // Optional: Agents/Graphs/Memory
  getAgent?(agentId: string): Promise<AgentInfo | null>;
  listAgents?(): Promise<AgentSummary[]>;
  getGraph?(graphId: string): Promise<GraphDefinition | null>;
  listGraphs?(): Promise<GraphSummary[]>;
  getMemory?(memoryId: string): Promise<Memory | null>;
  searchMemory?(options: MemorySearchOptions): Promise<MemorySearchResult[]>;
}
```

## 使用示例

### 默认适配器

```typescript
import { createAevatarClient } from '@aevatar/kit-core';

// 使用默认适配器 (自动创建)
const client = createAevatarClient({
  baseUrl: 'http://localhost:5001',
  apiKey: 'your-api-key',
});
```

### Axiom Reasoning 适配器

```typescript
import { createAevatarClient, createAxiomAdapter } from '@aevatar/kit-core';

const adapter = createAxiomAdapter({
  baseUrl: 'http://localhost:5001',
  defaultWorkflow: 'adaptive',
});

const client = createAevatarClient({
  baseUrl: 'http://localhost:5001',
  adapter,
});

// 创建会话需要 axioms 和 goal
const session = await client.createSession({
  axioms: [
    { id: 'a1', content: 'All humans are mortal', type: 'fact' },
    { id: 'a2', content: 'Socrates is human', type: 'fact' },
  ],
  goal: 'Determine if Socrates is mortal',
});
```

### 自定义适配器

```typescript
import { createAevatarClient, type BackendAdapter, createFetchHelper } from '@aevatar/kit-core';

function createMyCustomAdapter(options): BackendAdapter {
  const fetchApi = createFetchHelper(options);

  return {
    name: 'my-custom',

    async healthCheck() {
      await fetchApi('/health');
    },

    async createSession(opts) {
      // 自定义逻辑
      return fetchApi('/v2/conversations', {
        method: 'POST',
        body: JSON.stringify({ ...opts, customField: 'value' }),
      });
    },

    getEventStreamUrl(sessionId) {
      return `${options.baseUrl}/v2/conversations/${sessionId}/stream`;
    },

    // ... 实现其他方法
  };
}

const client = createAevatarClient({
  baseUrl: 'http://my-backend.com',
  adapter: createMyCustomAdapter({ baseUrl: 'http://my-backend.com' }),
});
```

## 适配器差异对比

| 操作 | DefaultAdapter | AxiomAdapter |
|------|---------------|--------------|
| 创建会话 | `POST /api/sessions` (空 body 可选) | `POST /api/sessions` (需要 axioms, goal) |
| 启动运行 | `POST /api/sessions/:id/runs` | `POST /api/sessions/:id/run` (单数) |
| SSE 事件流 | `/api/sessions/:id/events` | `/api/sessions/:id/agui/events` |
| 停止运行 | `POST /api/runs/:id/stop` | `POST /api/runs/:id/stop` |

## 依赖关系

```
adapter.ts ← session.ts ← client.ts
     ↑           ↑
     └── run.ts ──┘
           ↑
      state.ts (独立)
```

---

*kit-core v0.1.0 | Adapter Pattern Refactoring*


