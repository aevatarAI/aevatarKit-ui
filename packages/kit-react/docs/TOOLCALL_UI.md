# Tool Call UI System

> Complete UI flow for displaying tool call execution

## 概述

Tool Call 是 AI Agent 调用外部工具的核心能力。本模块提供完整的 UI 展示流程：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Tool Call Event Flow                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   TOOL_CALL_START ──→ TOOL_CALL_ARGS ──→ TOOL_CALL_END ──→ TOOL_CALL_RESULT
│         │                   │                  │                  │      │
│         ▼                   ▼                  ▼                  ▼      │
│   ┌─────────┐         ┌─────────┐        ┌─────────┐        ┌─────────┐ │
│   │ pending │   ──→   │streaming│   ──→  │executing│   ──→  │completed│ │
│   └─────────┘         └─────────┘        └─────────┘        └─────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 组件结构

```
components/toolcall/
├── ToolCallCard.tsx      # 单个工具调用卡片
├── ToolCallList.tsx      # 工具调用列表
├── ToolCallBadge.tsx     # 紧凑徽章 (嵌入消息)
├── ToolCallPanel.tsx     # 完整面板 (带标签页)
└── index.ts              # 导出

hooks/
└── useToolCalls.ts       # Tool Call 状态管理
```

## useToolCalls Hook

### 功能
- 监听 `TOOL_CALL_*` 事件
- 流式拼接参数 (streaming args)
- 自动解析 JSON
- 计算执行时长

### 使用

```tsx
import { useToolCalls } from '@aevatar/kit-react';

function ToolCallView() {
  const {
    toolCalls,           // 所有 tool calls
    activeToolCalls,     // 正在执行的
    completedToolCalls,  // 已完成的
    isExecuting,         // 是否有正在执行的
    getToolCall,         // 按 ID 获取
    clear,               // 清空
  } = useToolCalls({
    maxHistory: 50,      // 最大历史记录
    autoParse: true,     // 自动解析 JSON
  });

  return <ToolCallPanel toolCalls={toolCalls} />;
}
```

### ToolCallState 类型

```typescript
interface ToolCallState {
  id: string;                          // Tool Call ID
  name: string;                        // 工具名称
  parentMessageId?: string;            // 关联消息 ID
  status: ToolCallStatus;              // 状态
  args: string;                        // 参数 (JSON string)
  parsedArgs: Record<string, unknown>; // 解析后的参数
  result: string | null;               // 结果 (JSON string)
  parsedResult: unknown;               // 解析后的结果
  error: string | null;                // 错误信息
  startedAt: number;                   // 开始时间
  completedAt: number | null;          // 完成时间
  duration: number | null;             // 执行时长 (ms)
}

type ToolCallStatus = 
  | 'pending'    // 等待参数
  | 'streaming'  // 接收参数中
  | 'executing'  // 执行中
  | 'completed'  // 完成
  | 'error';     // 错误
```

## 组件使用

### ToolCallCard

单个工具调用的详细展示：

```tsx
import { ToolCallCard } from '@aevatar/kit-react';

<ToolCallCard
  toolCall={toolCall}
  defaultExpanded={false}
  renderIcon={(name) => <MyIcon name={name} />}
  renderResult={(result) => <CustomResult data={result} />}
/>
```

**特性**：
- 可展开/折叠的详情
- 流式参数展示 (streaming...)
- JSON 语法高亮
- 执行时长显示
- 状态动画

### ToolCallList

工具调用列表：

```tsx
import { ToolCallList } from '@aevatar/kit-react';

<ToolCallList
  toolCalls={toolCalls}
  statusFilter="active"    // 'all' | 'active' | 'completed' | ToolCallStatus
  maxItems={10}
  emptyMessage="No tool calls"
  gap={12}
/>
```

### ToolCallBadge

紧凑徽章，用于嵌入消息气泡：

```tsx
import { ToolCallBadge } from '@aevatar/kit-react';

<ToolCallBadge
  name="search_web"
  status="executing"
  onClick={() => scrollToToolCall(id)}
  compact={false}         // 是否只显示图标
/>
```

### ToolCallPanel

完整面板，带标签页过滤：

```tsx
import { ToolCallPanel } from '@aevatar/kit-react';

<ToolCallPanel
  toolCalls={toolCalls}
  title="Tool Calls"
  showTabs={true}
  defaultTab="all"        // 'all' | 'active' | 'completed'
  maxHeight="400px"
/>
```

## 完整示例

```tsx
import React from 'react';
import { 
  AevatarProvider, 
  useSession,
  useToolCalls,
  ToolCallPanel,
  ChatPanel,
} from '@aevatar/kit-react';

function App() {
  return (
    <AevatarProvider client={{ baseUrl: 'http://localhost:5001' }}>
      <MainView />
    </AevatarProvider>
  );
}

function MainView() {
  const { session, createSession } = useSession();
  const { toolCalls, isExecuting } = useToolCalls();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 16 }}>
      {/* Chat Area */}
      <div>
        <ChatPanel />
      </div>

      {/* Tool Calls Sidebar */}
      <div>
        <ToolCallPanel 
          toolCalls={toolCalls}
          title={isExecuting ? '🔧 Executing...' : '🔧 Tool Calls'}
        />
      </div>
    </div>
  );
}
```

## 自定义样式

所有组件使用 CSS 变量，可通过主题系统自定义：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --border: 214.3 31.8% 91.4%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --radius: 0.5rem;
}
```

---

*Tool Call UI v1.0 | AevatarKit SDK*


