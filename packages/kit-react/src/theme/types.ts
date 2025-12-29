/**
 * ============================================================================
 * A2UI Theme System - Type Definitions
 * ============================================================================
 * 
 * 可配置的主题系统，支持自定义颜色、明暗模式切换
 * 
 * ============================================================================
 */

/**
 * HSL 颜色值 (不含 hsl() 包装)
 * 格式: "210 40% 98%"
 */
export type HSLValue = string;

/**
 * 主题颜色配置
 * 所有颜色使用 HSL 格式，便于动态调整
 */
export interface ThemeColors {
  /** 背景色 */
  background: HSLValue;
  /** 前景色 (文本) */
  foreground: HSLValue;
  
  /** 卡片背景 */
  card: HSLValue;
  cardForeground: HSLValue;
  
  /** 弹出层背景 */
  popover: HSLValue;
  popoverForeground: HSLValue;
  
  /** 主色调 */
  primary: HSLValue;
  primaryForeground: HSLValue;
  
  /** 次要色 */
  secondary: HSLValue;
  secondaryForeground: HSLValue;
  
  /** 柔和色 (用于次要文本) */
  muted: HSLValue;
  mutedForeground: HSLValue;
  
  /** 强调色 */
  accent: HSLValue;
  accentForeground: HSLValue;
  
  /** 警告/危险色 */
  destructive: HSLValue;
  destructiveForeground: HSLValue;
  
  /** 成功色 */
  success?: HSLValue;
  successForeground?: HSLValue;
  
  /** 警告色 */
  warning?: HSLValue;
  warningForeground?: HSLValue;
  
  /** 信息色 */
  info?: HSLValue;
  infoForeground?: HSLValue;
  
  /** 边框色 */
  border: HSLValue;
  /** 输入框边框 */
  input: HSLValue;
  /** 焦点环 */
  ring: HSLValue;
  
  /** 图表颜色 */
  chart1?: HSLValue;
  chart2?: HSLValue;
  chart3?: HSLValue;
  chart4?: HSLValue;
  chart5?: HSLValue;
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 浅色模式颜色 */
  light: ThemeColors;
  /** 深色模式颜色 */
  dark: ThemeColors;
  /** 圆角大小 */
  radius?: string;
  /** 字体系列 */
  fontFamily?: string;
}

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 主题预设名称
 */
export type ThemePreset = 
  | 'default'    // 默认灰蓝色
  | 'ocean'      // 海洋蓝
  | 'forest'     // 森林绿
  | 'sunset'     // 日落橙
  | 'rose'       // 玫瑰粉
  | 'violet'     // 紫罗兰
  | 'slate'      // 石板灰
  | 'zinc';      // 锌灰

/**
 * 主题上下文值
 */
export interface ThemeContextValue {
  /** 当前主题模式 */
  mode: ThemeMode;
  /** 实际应用的模式 (system 会解析为 light/dark) */
  resolvedMode: 'light' | 'dark';
  /** 当前主题配置 */
  config: ThemeConfig;
  /** 当前预设名称 */
  preset: ThemePreset;
  /** 设置主题模式 */
  setMode: (mode: ThemeMode) => void;
  /** 切换明暗模式 */
  toggleMode: () => void;
  /** 设置主题预设 */
  setPreset: (preset: ThemePreset) => void;
  /** 自定义颜色配置 */
  setColors: (colors: Partial<ThemeColors>, mode?: 'light' | 'dark' | 'both') => void;
  /** 重置为预设默认值 */
  reset: () => void;
}

/**
 * ThemeProvider Props
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  /** 默认主题模式 */
  defaultMode?: ThemeMode;
  /** 默认预设 */
  defaultPreset?: ThemePreset;
  /** 自定义主题配置 (覆盖预设) */
  customConfig?: Partial<ThemeConfig>;
  /** 存储主题偏好的 key */
  storageKey?: string;
  /** 是否禁用系统主题检测 */
  disableSystemDetection?: boolean;
  /** 主题变更回调 */
  onThemeChange?: (mode: ThemeMode, resolvedMode: 'light' | 'dark') => void;
}

