# A2UI Theme System

> SDK 可配置主题系统 - 支持 8 种预设主题 + 自定义颜色 + 明暗模式

## 快速开始

### 1. 包装应用

```tsx
import { ThemeProvider } from '@aevatar/kit-react';

function App() {
  return (
    <ThemeProvider defaultPreset="ocean" defaultMode="system">
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. 使用主题切换

```tsx
import { ThemeModeToggle, useTheme } from '@aevatar/kit-react';

function Header() {
  const { preset, setPreset, mode, setMode } = useTheme();
  
  return (
    <div>
      <ThemeModeToggle />
      <button onClick={() => setPreset('forest')}>Forest Theme</button>
    </div>
  );
}
```

## 预设主题

| 预设 | 主色调 | 风格描述 |
|------|--------|----------|
| `default` | 灰蓝 | 默认中性主题 |
| `ocean` | 海蓝 🌊 | 清爽专业 |
| `forest` | 森绿 🌲 | 自然舒适 |
| `sunset` | 日落橙 🌅 | 温暖活力 |
| `rose` | 玫瑰粉 🌹 | 柔和优雅 |
| `violet` | 紫罗兰 💜 | 神秘高端 |
| `slate` | 石板灰 | 专业商务 |
| `zinc` | 锌灰 | 极简现代 |

## API 参考

### ThemeProvider Props

```ts
interface ThemeProviderProps {
  children: React.ReactNode;
  
  /** 默认主题模式 */
  defaultMode?: 'light' | 'dark' | 'system';  // default: 'system'
  
  /** 默认预设 */
  defaultPreset?: ThemePreset;  // default: 'default'
  
  /** 自定义主题配置 (覆盖预设) */
  customConfig?: Partial<ThemeConfig>;
  
  /** 存储主题偏好的 localStorage key */
  storageKey?: string;  // default: 'a2ui-theme'
  
  /** 禁用系统主题跟随 */
  disableSystemDetection?: boolean;
  
  /** 主题变更回调 */
  onThemeChange?: (mode: ThemeMode, resolvedMode: 'light' | 'dark') => void;
}
```

### useTheme Hook

```ts
const {
  mode,           // 当前模式: 'light' | 'dark' | 'system'
  resolvedMode,   // 实际应用的模式: 'light' | 'dark'
  preset,         // 当前预设名称
  config,         // 完整主题配置
  
  setMode,        // (mode: ThemeMode) => void
  toggleMode,     // () => void
  setPreset,      // (preset: ThemePreset) => void
  setColors,      // (colors: Partial<ThemeColors>, target?: 'light' | 'dark' | 'both') => void
  reset,          // () => void
} = useTheme();
```

### 内置组件

#### ThemeModeToggle
明暗模式切换按钮

```tsx
<ThemeModeToggle size="sm" />       // 小尺寸
<ThemeModeToggle showLabel />       // 显示文字标签
```

#### ThemeModeSelector
三态选择器 (Light / Dark / System)

```tsx
<ThemeModeSelector />
```

#### ThemePresetSelector
预设主题网格选择器

```tsx
<ThemePresetSelector showColors />
```

## 自定义颜色

### 方式一: Provider 配置

```tsx
<ThemeProvider
  defaultPreset="default"
  customConfig={{
    light: {
      primary: '201 96% 32%',  // HSL 格式
    },
    dark: {
      primary: '201 96% 55%',
    },
    radius: '0.75rem',  // 圆角
  }}
>
  <App />
</ThemeProvider>
```

### 方式二: 运行时调整

```tsx
const { setColors } = useTheme();

// 同时修改明暗模式
setColors({ primary: '142 70% 35%' }, 'both');

// 仅修改浅色模式
setColors({ accent: '24 95% 53%' }, 'light');
```

## CSS 变量

所有颜色通过 CSS 变量注入，可在 CSS 中直接使用：

```css
.my-component {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}

.my-button {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

### 可用变量

| 变量 | 用途 |
|------|------|
| `--background` | 页面背景 |
| `--foreground` | 主文本色 |
| `--card` | 卡片背景 |
| `--card-foreground` | 卡片文本 |
| `--primary` | 主色调 |
| `--primary-foreground` | 主色调上的文本 |
| `--secondary` | 次要色 |
| `--muted` | 柔和背景 |
| `--muted-foreground` | 次要文本 |
| `--accent` | 强调色 |
| `--destructive` | 危险/错误色 |
| `--border` | 边框色 |
| `--input` | 输入框边框 |
| `--ring` | 焦点环 |
| `--radius` | 基础圆角 |

## 本地存储

主题偏好自动保存到 localStorage：

- `a2ui-theme-mode`: 当前模式
- `a2ui-theme-preset`: 当前预设
- `a2ui-theme-custom`: 自定义颜色

可通过 `storageKey` prop 自定义前缀。

## 最佳实践

### 1. 使用 system 模式作为默认

```tsx
<ThemeProvider defaultMode="system">
```

用户系统偏好会自动应用，提供更好的首次体验。

### 2. 品牌色定制

```tsx
const brandConfig = {
  light: {
    primary: '220 80% 50%',  // 品牌蓝
    accent: '160 60% 45%',   // 辅助绿
  },
  dark: {
    primary: '220 80% 60%',
    accent: '160 60% 55%',
  },
};

<ThemeProvider customConfig={brandConfig}>
```

### 3. 监听主题变化

```tsx
<ThemeProvider
  onThemeChange={(mode, resolved) => {
    analytics.track('theme_changed', { mode, resolved });
  }}
>
```

## 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    ThemeProvider                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              ThemeContext                        │    │
│  │  - mode / resolvedMode                          │    │
│  │  - preset / config                              │    │
│  │  - setMode / setPreset / setColors              │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │            CSS Variable Injection                │    │
│  │  :root { --primary: 201 96% 32%; ... }          │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │             localStorage Sync                    │    │
│  │  a2ui-theme-mode / a2ui-theme-preset            │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 文件结构

```
packages/kit-react/src/theme/
├── types.ts              # 类型定义
├── presets.ts            # 8 个预设主题配置
├── ThemeProvider.tsx     # 上下文提供者
├── ThemeToggle.tsx       # 切换组件
└── index.ts              # 导出入口
```

---

*Theme System v1.0 | AevatarKit SDK | shadcn/ui + Tailwind CSS*

