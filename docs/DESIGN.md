# AevatarKit SDK Design Document

> 详细设计文档请参考：[aevatar-kit/docs/AEVATARKIT_SDK_DESIGN.md](../aevatar-kit/docs/AEVATARKIT_SDK_DESIGN.md)

## 架构概览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      @aevatar/kit (主包 - 重导出)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
┌───────────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│  @aevatar/kit-react   │ │ @aevatar/kit-core│ │  @aevatar/kit-types    │
│                       │ │                 │ │                         │
│  • AevatarProvider    │ │ • AevatarClient │ │  • AgUiEventType        │
│  • useSession         │ │ • createSession │ │  • Session              │
│  • useAgent           │ │ • EventEmitter  │ │  • Run                  │
│  • ChatPanel          │ │ • RetryManager  │ │  • Agent                │
│  • TimelineView       │ │ • StateManager  │ │  • Graph                │
└───────────────────────┘ └─────────────────┘ └─────────────────────────┘
          │                       │
          │                       │
          ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     @aevatar/kit-protocol (协议层)                       │
│                                                                          │
│   AG-UI 协议内嵌实现 + Aevatar 扩展事件定义                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## 设计原则

1. **协议标准化** - 基于 AG-UI 协议
2. **零依赖核心** - Core 层不依赖第三方库
3. **渐进式采用** - 可单独使用 Core
4. **类型优先** - TypeScript 完整类型推导
5. **可测试性** - 所有模块可独立测试

## 包职责

| 包 | 职责 | 依赖 |
|---|------|------|
| `kit-types` | 纯类型定义 | 无 |
| `kit-protocol` | AG-UI 协议实现 | types |
| `kit-core` | 业务逻辑 | protocol, types |
| `kit-react` | React 组件 | core, protocol, types |
| `kit` | 统一入口 | 全部 |

