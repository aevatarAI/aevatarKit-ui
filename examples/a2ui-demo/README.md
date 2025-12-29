# A2UI Demo - JSON to UI Renderer

🎯 **核心功能**: 给定 A2UI JSON → 渲染出对应的 UI

## 快速开始

```bash
cd examples/a2ui-demo
pnpm install
pnpm dev
```

访问 http://localhost:5173

## 功能特性

- **实时渲染**: 左侧输入 A2UI JSON，右侧实时渲染 UI
- **7 个示例模板**: 快速加载预设的 UI 示例
- **用户操作日志**: 显示所有用户交互事件
- **JSON 格式化**: 一键格式化 JSON 代码

## A2UI JSON 格式

```json
{
  "type": "surfaceUpdate",
  "surfaceId": "my-surface",
  "components": [
    {
      "id": "root",
      "component": {
        "Card": {
          "title": "Card Title",
          "children": { "explicitList": ["child-1", "child-2"] }
        }
      }
    },
    {
      "id": "child-1",
      "component": {
        "Text": { "text": "Hello World" }
      }
    },
    {
      "id": "child-2",
      "component": {
        "Button": { "text": "Click Me", "variant": "default" }
      }
    }
  ]
}
```

## 组件格式详解

每个组件实例遵循以下结构:

```typescript
interface A2uiComponentInstance {
  id: string;                    // 唯一标识
  component: {
    [ComponentType]: {           // 组件类型名
      [prop]: value,             // 属性
      children?: {               // 子组件引用
        explicitList: string[]   // 子组件 ID 列表
      }
    }
  }
}
```

## 可用组件 (43个)

### Layout (7)
`Container`, `Row`, `Column`, `Grid`, `Card`, `Divider`, `Spacer`

### Input (12)
`TextField`, `TextArea`, `Checkbox`, `Switch`, `Select`, `NumberInput`, `Radio`, `Slider`, `DatePicker`, `TimePicker`, `DateTimePicker`, `FileUpload`

### Content (15)
`Text`, `Heading`, `Paragraph`, `Link`, `Badge`, `Button`, `Image`, `Progress`, `Alert`, `Avatar`, `Code`, `List`, `Table`, `Icon`, `Tooltip`

### Feedback (5)
`Dialog`, `AlertDialog`, `Toast`, `Popover`, `Skeleton`

### Navigation (4)
`Tabs`, `Accordion`, `DropdownMenu`, `Breadcrumb`

## 示例模板

| 模板名 | 描述 |
|-------|------|
| Simple Card | 最简单的卡片示例 |
| User Profile | 用户资料卡片 |
| Login Form | 登录表单 |
| Dashboard Alerts | 仪表板告警列表 |
| Product Card | 电商产品卡片 |
| Settings Form | 设置表单 |
| Progress Dashboard | 项目进度面板 |

## 架构

```
Agent (LLM)
    ↓ 生成 A2UI JSON
A2UI Engine
    ↓ 解析组件树
A2uiRenderer
    ↓ 映射到 React 组件
shadcn/ui + Radix UI
    ↓ 渲染
用户界面
```

## 用户操作回传

当用户与 UI 交互时，会生成 `UserAction` 事件：

```json
{
  "name": "click",
  "surfaceId": "my-surface",
  "sourceComponentId": "button-1",
  "timestamp": "2025-12-26T12:00:00.000Z",
  "context": {}
}
```

这些事件可以发送回 Agent，实现双向交互。

## 技术栈

- React 18
- Tailwind CSS + shadcn/ui
- Radix UI Primitives
- AevatarKit SDK (`kit-a2ui`, `kit-react`)
