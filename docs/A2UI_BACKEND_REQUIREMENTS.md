# A2UI 后端接口需求文档

> AevatarKit SDK 前端 ↔ Agent 后端 的 A2UI 协议对接规范

---

## 📋 文档信息

| 项目 | 值 |
|------|-----|
| 版本 | 1.0 |
| 创建日期 | 2025-12-31 |
| A2UI 协议版本 | v0.8 (Google) |
| 前端 SDK | @aevatar/kit |
| 传输协议 | SSE (Server-Sent Events) |

---

## 1. 概述

### 1.1 什么是 A2UI？

A2UI（Agent-to-User Interface）是 Google 开源的面向 AI Agent 的界面协议。**Agent 不直接返回纯文本，而是用 JSON 描述「UI 长什么样」**，前端 SDK 负责渲染。

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│   ┌────────────┐       JSON (A2UI)       ┌────────────┐          │
│   │   Agent    │  ──────────────────────► │   前端     │          │
│   │   (后端)   │    组件树 + 数据绑定     │   (SDK)    │          │
│   └────────────┘                          └────────────┘          │
│        │                                        │                  │
│        │   SSE 流式传输                         │   React 渲染     │
│        └────────────────────────────────────────┘                  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 1.2 后端职责

| 职责 | 说明 |
|------|------|
| **生成 A2UI JSON** | 根据用户意图，输出组件树描述 |
| **通过 SSE 推送** | 使用 AG-UI CUSTOM 事件包装 A2UI 消息 |
| **接收用户操作** | 处理前端上报的 `userAction` |
| **管理 Surface 生命周期** | 创建、更新、删除 UI 区域 |

---

## 2. 传输协议

### 2.1 SSE 端点

后端需要提供一个 SSE 端点，用于向前端推送 A2UI 消息：

```
GET /api/sessions/{sessionId}/events
Accept: text/event-stream
Authorization: Bearer <token>
```

### 2.2 消息封装格式

A2UI 消息通过 **AG-UI 的 CUSTOM 事件** 传输：

```
data: {"type":"CUSTOM","name":"a2ui.message","value":{"message":{...A2UI消息...}}}
```

**完整格式说明：**

```typescript
interface AgUiCustomEvent {
  type: 'CUSTOM';
  name: 'a2ui.message';  // 固定值
  value: {
    message: A2uiServerMessage;  // 具体 A2UI 消息
    metadata?: {
      sequence?: number;  // 可选：消息序号
      batchId?: string;   // 可选：批次 ID
    };
  };
}
```

---

## 3. A2UI 消息类型 (Server → Client)

后端需要发送 **4 种类型** 的消息：

| 消息类型 | 作用 | 必要性 |
|----------|------|--------|
| `surfaceUpdate` | 发送/更新组件树 | ✅ 必须 |
| `dataModelUpdate` | 更新数据模型 | ⚡ 常用 |
| `beginRendering` | 通知前端开始渲染 | ✅ 必须 |
| `deleteSurface` | 删除 UI 区域 | 🔹 可选 |

---

### 3.1 surfaceUpdate - 组件树更新

**用途：** 发送 UI 组件树描述

```typescript
interface A2uiSurfaceUpdate {
  type: 'surfaceUpdate';
  surfaceId?: string;  // 默认 'default'
  components: Array<{
    id: string;              // 组件唯一 ID
    component: {
      [componentType: string]: ComponentProps;  // 如 { Button: {...} }
    };
  }>;
}
```

**SSE 发送示例：**

```
data: {"type":"CUSTOM","name":"a2ui.message","value":{"message":{"type":"surfaceUpdate","components":[{"id":"root","component":{"Column":{"children":{"explicitList":["title","form"]}}}}{"id":"title","component":{"Text":{"text":{"literalString":"预订表单"},"usageHint":"h2"}}},{"id":"form","component":{"Card":{"children":{"explicitList":["name_input","submit_btn"]}}}}]}}}
```

**JSON 格式化后：**

```json
{
  "type": "surfaceUpdate",
  "surfaceId": "default",
  "components": [
    {
      "id": "root",
      "component": {
        "Column": {
          "gap": "16px",
          "children": {
            "explicitList": ["title", "form"]
          }
        }
      }
    },
    {
      "id": "title",
      "component": {
        "Text": {
          "text": { "literalString": "预订表单" },
          "usageHint": "h2"
        }
      }
    },
    {
      "id": "form",
      "component": {
        "Card": {
          "children": {
            "explicitList": ["name_input", "date_input", "submit_btn"]
          }
        }
      }
    },
    {
      "id": "name_input",
      "component": {
        "TextField": {
          "label": { "literalString": "姓名" },
          "placeholder": { "literalString": "请输入姓名" },
          "value": { "path": "/form/name" }
        }
      }
    },
    {
      "id": "date_input",
      "component": {
        "DateTimeInput": {
          "label": { "literalString": "预订日期" },
          "value": { "path": "/form/date" },
          "type": "date"
        }
      }
    },
    {
      "id": "submit_btn",
      "component": {
        "Button": {
          "label": { "literalString": "提交预订" },
          "variant": "primary",
          "action": {
            "name": "submit",
            "context": [
              { "key": "formData", "value": { "path": "/form" } }
            ]
          }
        }
      }
    }
  ]
}
```

---

### 3.2 dataModelUpdate - 数据模型更新

**用途：** 更新组件绑定的数据

```typescript
interface A2uiDataModelUpdate {
  type: 'dataModelUpdate';
  surfaceId?: string;      // 默认 'default'
  path?: string;           // 更新路径，如 '/form'
  contents: Array<{
    key: string;
    valueString?: string;
    valueNumber?: number;
    valueBoolean?: boolean;
    valueMap?: DataEntry[];   // 嵌套对象
    valueArray?: ArrayItem[]; // 数组
  }>;
}
```

**SSE 发送示例：**

```
data: {"type":"CUSTOM","name":"a2ui.message","value":{"message":{"type":"dataModelUpdate","path":"/form","contents":[{"key":"name","valueString":"张三"},{"key":"date","valueString":"2025-01-15"}]}}}
```

**JSON 格式化后：**

```json
{
  "type": "dataModelUpdate",
  "path": "/form",
  "contents": [
    { "key": "name", "valueString": "张三" },
    { "key": "date", "valueString": "2025-01-15" },
    { "key": "guests", "valueNumber": 2 },
    { "key": "vip", "valueBoolean": true }
  ]
}
```

**嵌套对象示例：**

```json
{
  "type": "dataModelUpdate",
  "contents": [
    {
      "key": "user",
      "valueMap": [
        { "key": "name", "valueString": "张三" },
        { "key": "age", "valueNumber": 28 },
        {
          "key": "address",
          "valueMap": [
            { "key": "city", "valueString": "北京" },
            { "key": "district", "valueString": "朝阳区" }
          ]
        }
      ]
    }
  ]
}
```

**数组示例：**

```json
{
  "type": "dataModelUpdate",
  "path": "/",
  "contents": [
    {
      "key": "items",
      "valueArray": [
        { "mapItem": [
          { "key": "id", "valueString": "1" },
          { "key": "name", "valueString": "商品A" },
          { "key": "price", "valueNumber": 99.9 }
        ]},
        { "mapItem": [
          { "key": "id", "valueString": "2" },
          { "key": "name", "valueString": "商品B" },
          { "key": "price", "valueNumber": 199.9 }
        ]}
      ]
    }
  ]
}
```

---

### 3.3 beginRendering - 开始渲染

**用途：** 通知前端组件树已准备好，可以开始渲染

```typescript
interface A2uiBeginRendering {
  type: 'beginRendering';
  surfaceId?: string;   // 默认 'default'
  root: string;         // 根组件 ID（必须）
  catalogId?: string;   // 组件目录 ID（可选）
}
```

**SSE 发送示例：**

```
data: {"type":"CUSTOM","name":"a2ui.message","value":{"message":{"type":"beginRendering","root":"root"}}}
```

**⚠️ 重要：** `beginRendering` 必须在 `surfaceUpdate` 之后发送，否则前端无法知道从哪个组件开始渲染。

---

### 3.4 deleteSurface - 删除 Surface

**用途：** 删除一个 UI 区域（如关闭弹窗）

```typescript
interface A2uiDeleteSurface {
  type: 'deleteSurface';
  surfaceId: string;  // 必须指定
}
```

**SSE 发送示例：**

```
data: {"type":"CUSTOM","name":"a2ui.message","value":{"message":{"type":"deleteSurface","surfaceId":"dialog-1"}}}
```

---

## 4. 标准消息发送顺序

一个完整的 A2UI 渲染流程：

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         A2UI 消息发送顺序                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   1. surfaceUpdate    ─────►  发送组件树描述                              │
│                               (可以分多次发送，增量更新)                   │
│                                                                          │
│   2. dataModelUpdate  ─────►  发送初始数据                                │
│                               (可选，如果组件有数据绑定)                   │
│                                                                          │
│   3. beginRendering   ─────►  通知前端开始渲染                            │
│                               (必须在最后发送)                            │
│                                                                          │
│   4. [后续更新]                                                           │
│      • dataModelUpdate ────► 更新数据（实时反映到 UI）                    │
│      • surfaceUpdate   ────► 更新组件树（添加/修改组件）                  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 数据绑定 (BoundValue)

组件属性支持两种值类型：

### 5.1 字面值 (Literal)

直接使用固定值：

```json
{
  "text": { "literalString": "Hello World" },
  "count": { "literalNumber": 42 },
  "enabled": { "literalBoolean": true }
}
```

### 5.2 路径绑定 (Path)

绑定到数据模型的某个路径：

```json
{
  "value": { "path": "/form/name" },
  "items": { "path": "/products" }
}
```

### 5.3 带默认值的绑定

当路径不存在时使用默认值：

```json
{
  "value": { 
    "path": "/user/nickname",
    "literalString": "匿名用户"  // 路径不存在时的默认值
  }
}
```

---

## 6. 子组件定义 (Children)

### 6.1 显式列表

明确列出子组件 ID：

```json
{
  "children": {
    "explicitList": ["header", "content", "footer"]
  }
}
```

### 6.2 动态模板

根据数据数组动态生成子组件：

```json
{
  "children": {
    "template": {
      "dataBinding": "/items",        // 数据源路径
      "componentId": "item_template"  // 模板组件 ID
    }
  }
}
```

---

## 7. 用户操作 (userAction)

### 7.1 定义交互动作

在组件中定义 `action`：

```json
{
  "id": "submit_btn",
  "component": {
    "Button": {
      "label": { "literalString": "提交" },
      "action": {
        "name": "submit_form",
        "context": [
          { "key": "formData", "value": { "path": "/form" } },
          { "key": "timestamp", "value": { "literalNumber": 1735000000 } }
        ]
      }
    }
  }
}
```

### 7.2 接收用户操作

前端会通过 POST 请求发送用户操作：

```
POST /api/sessions/{sessionId}/actions
Content-Type: application/json
```

```json
{
  "userAction": {
    "name": "submit_form",
    "surfaceId": "default",
    "sourceComponentId": "submit_btn",
    "timestamp": "2025-12-31T10:30:00.000Z",
    "context": {
      "formData": {
        "name": "张三",
        "date": "2025-01-15",
        "guests": 2
      },
      "timestamp": 1735000000
    }
  }
}
```

### 7.3 常见操作类型

| 操作名 | 场景 | context 示例 |
|--------|------|--------------|
| `click` | 按钮点击 | `{}` |
| `change` | 输入变更 | `{ "value": "新值" }` |
| `submit` | 表单提交 | `{ "formData": {...} }` |
| `select` | 选择项目 | `{ "selectedId": "item-1" }` |
| `dismiss` | 关闭/取消 | `{}` |

---

## 8. 支持的标准组件

前端 SDK 内置 43 个标准组件，后端可直接使用：

### 8.1 布局组件 (Layout)

| 组件 | 说明 | 核心属性 |
|------|------|----------|
| `Container` | 容器 | `padding`, `margin`, `maxWidth` |
| `Row` | 横向排列 | `gap`, `alignment`, `children` |
| `Column` | 纵向排列 | `gap`, `alignment`, `children` |
| `Grid` | 网格布局 | `columns`, `gap`, `children` |
| `Card` | 卡片 | `elevation`, `children` |
| `Divider` | 分割线 | `orientation` |
| `Spacer` | 间距 | `size` |

### 8.2 内容组件 (Content)

| 组件 | 说明 | 核心属性 |
|------|------|----------|
| `Text` | 文本 | `text`, `usageHint` (h1/h2/h3/body/caption) |
| `Heading` | 标题 | `level`, `text` |
| `Paragraph` | 段落 | `text` |
| `Link` | 链接 | `href`, `text`, `target` |
| `Badge` | 徽章 | `text`, `variant` |
| `Image` | 图片 | `url`, `alt`, `width`, `height`, `fit` |
| `Icon` | 图标 | `name`, `size`, `color` |
| `Avatar` | 头像 | `src`, `name`, `size` |
| `Progress` | 进度条 | `value`, `max`, `variant` |
| `Skeleton` | 骨架屏 | `width`, `height`, `variant` |

### 8.3 输入组件 (Input)

| 组件 | 说明 | 核心属性 |
|------|------|----------|
| `TextField` | 文本输入 | `label`, `placeholder`, `value`, `type` |
| `TextArea` | 多行文本 | `label`, `placeholder`, `value`, `rows` |
| `NumberInput` | 数字输入 | `label`, `value`, `min`, `max`, `step` |
| `Checkbox` | 复选框 | `label`, `checked`, `disabled` |
| `Radio` | 单选 | `label`, `value`, `options` |
| `Switch` | 开关 | `label`, `checked`, `disabled` |
| `Select` | 下拉选择 | `label`, `value`, `options`, `placeholder` |
| `DateTimeInput` | 日期时间 | `label`, `value`, `type` (date/time/datetime-local) |
| `Slider` | 滑块 | `value`, `min`, `max`, `step` |
| `FileUpload` | 文件上传 | `label`, `accept`, `multiple` |

### 8.4 按钮组件 (Button)

| 组件 | 说明 | 核心属性 |
|------|------|----------|
| `Button` | 按钮 | `label`, `variant`, `size`, `disabled`, `action` |
| `IconButton` | 图标按钮 | `icon`, `size`, `action` |
| `ButtonGroup` | 按钮组 | `children`, `orientation` |

### 8.5 反馈组件 (Feedback)

| 组件 | 说明 | 核心属性 |
|------|------|----------|
| `Alert` | 警告框 | `title`, `message`, `variant` (info/warning/error/success) |
| `Toast` | 提示 | `message`, `duration`, `variant` |
| `Dialog` | 对话框 | `title`, `children`, `open` |
| `Tooltip` | 提示气泡 | `content`, `children` |
| `Popover` | 弹出框 | `content`, `children`, `trigger` |

### 8.6 导航组件 (Navigation)

| 组件 | 说明 | 核心属性 |
|------|------|----------|
| `Tabs` | 标签页 | `tabs`, `activeTab`, `children` |
| `Breadcrumb` | 面包屑 | `items` |
| `Pagination` | 分页 | `current`, `total`, `pageSize` |
| `Menu` | 菜单 | `items`, `children` |

---

## 9. 完整示例

### 9.1 预订表单

**SSE 流：**

```
data: {"type":"CUSTOM","name":"a2ui.message","value":{"message":{"type":"surfaceUpdate","components":[{"id":"root","component":{"Column":{"gap":"24px","children":{"explicitList":["header","form_card","actions"]}}}},{"id":"header","component":{"Text":{"text":{"literalString":"酒店预订"},"usageHint":"h1"}}},{"id":"form_card","component":{"Card":{"children":{"explicitList":["name_field","date_field","guests_field"]}}}},{"id":"name_field","component":{"TextField":{"label":{"literalString":"姓名"},"placeholder":{"literalString":"请输入您的姓名"},"value":{"path":"/form/name"}}}},{"id":"date_field","component":{"DateTimeInput":{"label":{"literalString":"入住日期"},"value":{"path":"/form/checkin"},"type":"date"}}},{"id":"guests_field","component":{"Select":{"label":{"literalString":"入住人数"},"value":{"path":"/form/guests"},"options":{"literalArray":[{"value":"1","label":"1人"},{"value":"2","label":"2人"},{"value":"3","label":"3人"},{"value":"4","label":"4人"}]}}}},{"id":"actions","component":{"Row":{"alignment":"end","gap":"12px","children":{"explicitList":["cancel_btn","submit_btn"]}}}},{"id":"cancel_btn","component":{"Button":{"label":{"literalString":"取消"},"variant":"outline","action":{"name":"cancel"}}}},{"id":"submit_btn","component":{"Button":{"label":{"literalString":"提交预订"},"variant":"primary","action":{"name":"submit","context":[{"key":"formData","value":{"path":"/form"}}]}}}}]}}}

data: {"type":"CUSTOM","name":"a2ui.message","value":{"message":{"type":"dataModelUpdate","path":"/form","contents":[{"key":"name","valueString":""},{"key":"checkin","valueString":""},{"key":"guests","valueString":"2"}]}}}

data: {"type":"CUSTOM","name":"a2ui.message","value":{"message":{"type":"beginRendering","root":"root"}}}
```

### 9.2 商品列表

**SSE 流：**

```
data: {"type":"CUSTOM","name":"a2ui.message","value":{"message":{"type":"surfaceUpdate","components":[{"id":"root","component":{"Column":{"gap":"16px","children":{"explicitList":["title","product_list"]}}}},{"id":"title","component":{"Text":{"text":{"literalString":"热门商品"},"usageHint":"h2"}}},{"id":"product_list","component":{"Column":{"gap":"12px","children":{"template":{"dataBinding":"/products","componentId":"product_card"}}}}},{"id":"product_card","component":{"Card":{"children":{"explicitList":["product_row"]}}}},{"id":"product_row","component":{"Row":{"gap":"16px","alignment":"space-between","children":{"explicitList":["product_info","product_price"]}}}},{"id":"product_info","component":{"Column":{"gap":"4px","children":{"explicitList":["product_name","product_desc"]}}}},{"id":"product_name","component":{"Text":{"text":{"path":"/_item/name"},"usageHint":"h4"}}},{"id":"product_desc","component":{"Text":{"text":{"path":"/_item/description"},"usageHint":"caption"}}},{"id":"product_price","component":{"Text":{"text":{"path":"/_item/price"},"color":"#e53935"}}}]}}}

data: {"type":"CUSTOM","name":"a2ui.message","value":{"message":{"type":"dataModelUpdate","contents":[{"key":"products","valueArray":[{"mapItem":[{"key":"id","valueString":"1"},{"key":"name","valueString":"无线蓝牙耳机"},{"key":"description","valueString":"高品质音频，续航30小时"},{"key":"price","valueString":"¥299"}]},{"mapItem":[{"key":"id","valueString":"2"},{"key":"name","valueString":"智能手表"},{"key":"description","valueString":"健康监测，运动追踪"},{"key":"price","valueString":"¥599"}]},{"mapItem":[{"key":"id","valueString":"3"},{"key":"name","valueString":"便携充电宝"},{"key":"description","valueString":"20000mAh，快充支持"},{"key":"price","valueString":"¥159"}]}]}]}}}

data: {"type":"CUSTOM","name":"a2ui.message","value":{"message":{"type":"beginRendering","root":"root"}}}
```

---

## 10. 错误处理

### 10.1 前端错误上报

前端可能发送错误报告：

```json
{
  "error": {
    "code": "COMPONENT_NOT_FOUND",
    "message": "Component type 'UnknownWidget' is not registered",
    "surfaceId": "default",
    "componentId": "widget_1"
  }
}
```

### 10.2 常见错误码

| 错误码 | 说明 | 建议处理 |
|--------|------|----------|
| `COMPONENT_NOT_FOUND` | 组件类型不存在 | 使用标准组件或确保前端已注册 |
| `BINDING_ERROR` | 数据绑定路径无效 | 检查路径是否正确 |
| `PARSE_ERROR` | JSON 解析失败 | 检查消息格式 |
| `ROOT_NOT_FOUND` | 根组件 ID 不存在 | 确保 beginRendering 的 root 在 components 中 |

---

## 11. 最佳实践

### 11.1 消息设计原则

1. **组件 ID 唯一** - 同一 Surface 内组件 ID 不能重复
2. **先组件后数据** - surfaceUpdate 应在 dataModelUpdate 之前
3. **最后渲染** - beginRendering 必须最后发送
4. **增量更新** - 只发送变化的组件/数据，减少传输量

### 11.2 性能优化

1. **分批发送** - 大组件树可拆分多个 surfaceUpdate
2. **数据分离** - 频繁变化的数据放 dataModel，静态内容放 literalString
3. **模板复用** - 列表使用 template 而非重复定义组件

### 11.3 调试技巧

1. **添加 sequence** - 在 metadata 中添加序号便于排查
2. **使用 surfaceId** - 多区域 UI 用不同 surfaceId 隔离
3. **日志追踪** - 记录发送的每条 A2UI 消息

---

## 12. API 端点汇总

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` | `/api/sessions/{sessionId}/events` | SSE 事件流 |
| `POST` | `/api/sessions/{sessionId}/actions` | 接收用户操作 |
| `POST` | `/api/sessions/{sessionId}/errors` | 接收前端错误 |

---

## 13. 快速检查清单

✅ SSE 端点返回 `Content-Type: text/event-stream`  
✅ 消息格式：`data: {"type":"CUSTOM","name":"a2ui.message","value":{...}}`  
✅ 组件 ID 在 Surface 内唯一  
✅ beginRendering 的 root 指向已定义的组件  
✅ 数据绑定路径以 `/` 开头  
✅ 用户操作接口能正确解析 userAction  

---

*文档版本: 1.0*  
*创建日期: 2025-12-31*  
*协议参考: [Google A2UI v0.8](https://github.com/AstroAir/a2ui)*

