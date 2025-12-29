# @aevatar/kit-a2ui

A2UI (Agent-to-User Interface) Engine for AevatarKit SDK.

## Overview

A2UI 是 Google 开源的面向 AI Agent 的界面协议/规范，用于解决 "Agent 不是只回一串文本，而是能安全地'说'出一个可交互 UI" 的问题。

### 核心特性

- **声明式 UI**: Agent 描述组件、布局、数据绑定，前端负责渲染
- **安全性**: 白名单组件机制，前端保留最终控制权
- **跨端跨框架**: 同一份 JSON 可在不同端用原生组件渲染
- **流式生成**: 支持 JSONL 增量消息，边生成边渲染

## Installation

```bash
pnpm add @aevatar/kit-a2ui
```

## Quick Start

```typescript
import { 
  createA2uiEngine, 
  createComponentRegistry 
} from '@aevatar/kit-a2ui';
import type { ReactNode } from 'react';

// 1. 创建组件注册表
const registry = createComponentRegistry<ReactNode>();

// 2. 注册组件
registry.register('Button', (props) => (
  <button onClick={props.onClick}>{props.label}</button>
));

registry.register('TextField', (props) => (
  <input 
    type="text" 
    value={props.value} 
    onChange={(e) => props.onChange?.(e.target.value)} 
  />
));

// 3. 创建引擎
const engine = createA2uiEngine(registry, {
  events: {
    onRenderTreeUpdated: (surfaceId, tree) => {
      console.log('Render tree updated:', tree);
    },
    onUserAction: (action) => {
      // 发送给服务端
      sendToServer(action);
    },
  },
});

// 4. 处理服务端消息
engine.processMessage({
  type: 'surfaceUpdate',
  components: [
    {
      id: 'btn1',
      component: {
        Button: { label: { literalString: 'Click Me' } }
      }
    }
  ]
});

engine.processMessage({
  type: 'beginRendering',
  root: 'btn1'
});

// 5. 获取渲染树
const tree = engine.getRenderTree();
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      A2uiEngine                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Surface Manager                      │   │
│  │  - Surface lifecycle                                 │   │
│  │  - Component tree management                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│          ┌───────────────┼───────────────┐                 │
│          ▼               ▼               ▼                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐       │
│  │  DataModel  │ │  Registry   │ │ BindingResolver │       │
│  │  /path/val  │ │  Button →   │ │  ${path} →     │       │
│  │  订阅/更新  │ │  <btn/>     │ │  actual value   │       │
│  └─────────────┘ └─────────────┘ └─────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

### A2uiEngine

核心协调器，处理 A2UI 消息和管理 Surface。

```typescript
const engine = createA2uiEngine(registry, {
  defaultSurfaceId: 'main',
  events: {
    onSurfaceCreated: (id) => {},
    onRenderTreeUpdated: (id, tree) => {},
    onDataChanged: (event) => {},
    onUserAction: (action) => {},
  },
});
```

### A2uiDataModel

数据模型存储，支持路径式访问和变更订阅。

```typescript
const dataModel = createDataModel();

// 设置数据
dataModel.set('/booking/date', '2024-01-15');
dataModel.set('/user/name', 'John');

// 获取数据
const date = dataModel.get('/booking/date');

// 订阅变更
const unsubscribe = dataModel.subscribe((event) => {
  console.log(`${event.path} changed from ${event.oldValue} to ${event.newValue}`);
});
```

### A2uiComponentRegistry

组件注册表，提供白名单安全机制。

```typescript
const registry = createComponentRegistry<ReactNode>({
  allowUnregistered: false, // 禁止未注册组件
});

// 注册组件
registry.register('Card', (props) => (
  <div className="card">
    <h3>{props.title}</h3>
    {props.children}
  </div>
));

// 检查组件是否允许
if (registry.isAllowed('Card')) {
  const renderer = registry.getRenderer('Card');
}
```

### A2uiBindingResolver

数据绑定解析器，将 BoundValue 解析为实际值。

```typescript
const resolver = createBindingResolver(dataModel);

// 解析绑定值
const value = resolver.resolve({
  path: '/booking/date'
});

// 解析带字面量的值
const literal = resolver.resolve({
  literalString: 'Hello World'
});
```

## Integration with AG-UI

A2UI 消息通过 AG-UI 的 CUSTOM 事件传输：

```typescript
import { createA2uiEventRouter } from '@aevatar/kit-protocol';

const router = createEventRouter({
  onCustom: (event) => {
    // 路由 A2UI 事件到引擎
    engine.processEvent(event);
  },
});
```

## License

MIT

