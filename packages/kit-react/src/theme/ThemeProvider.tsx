/**
 * ============================================================================
 * A2UI Theme Provider
 * ============================================================================
 * 
 * 主题上下文提供者，支持：
 * - 明暗模式切换
 * - 预设主题选择
 * - 自定义颜色配置
 * - 系统主题跟随
 * - 本地存储持久化
 * 
 * ============================================================================
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import type {
  ThemeMode,
  ThemePreset,
  ThemeConfig,
  ThemeColors,
  ThemeContextValue,
  ThemeProviderProps,
} from './types';

import { getPreset } from './presets';

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// CSS Variable Injection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 将主题颜色注入为 CSS 变量
 */
function injectThemeColors(colors: ThemeColors, mode: 'light' | 'dark'): void {
  const root = document.documentElement;
  
  // 移除旧的 dark class
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // 设置 CSS 变量
  const cssVars: Record<string, string> = {
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--card': colors.card,
    '--card-foreground': colors.cardForeground,
    '--popover': colors.popover,
    '--popover-foreground': colors.popoverForeground,
    '--primary': colors.primary,
    '--primary-foreground': colors.primaryForeground,
    '--secondary': colors.secondary,
    '--secondary-foreground': colors.secondaryForeground,
    '--muted': colors.muted,
    '--muted-foreground': colors.mutedForeground,
    '--accent': colors.accent,
    '--accent-foreground': colors.accentForeground,
    '--destructive': colors.destructive,
    '--destructive-foreground': colors.destructiveForeground,
    '--border': colors.border,
    '--input': colors.input,
    '--ring': colors.ring,
  };
  
  // 可选颜色
  if (colors.success) cssVars['--success'] = colors.success;
  if (colors.successForeground) cssVars['--success-foreground'] = colors.successForeground;
  if (colors.warning) cssVars['--warning'] = colors.warning;
  if (colors.warningForeground) cssVars['--warning-foreground'] = colors.warningForeground;
  if (colors.info) cssVars['--info'] = colors.info;
  if (colors.infoForeground) cssVars['--info-foreground'] = colors.infoForeground;
  if (colors.chart1) cssVars['--chart-1'] = colors.chart1;
  if (colors.chart2) cssVars['--chart-2'] = colors.chart2;
  if (colors.chart3) cssVars['--chart-3'] = colors.chart3;
  if (colors.chart4) cssVars['--chart-4'] = colors.chart4;
  if (colors.chart5) cssVars['--chart-5'] = colors.chart5;
  
  // 应用到 :root
  for (const [key, value] of Object.entries(cssVars)) {
    root.style.setProperty(key, value);
  }
}

/**
 * 注入圆角和字体
 */
function injectThemeExtras(config: ThemeConfig): void {
  const root = document.documentElement;
  
  if (config.radius) {
    root.style.setProperty('--radius', config.radius);
  }
  
  if (config.fontFamily) {
    root.style.setProperty('--font-family', config.fontFamily);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// System Theme Detection
// ─────────────────────────────────────────────────────────────────────────────

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getStoredValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredValue<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider Component
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeProvider({
  children,
  defaultMode = 'system',
  defaultPreset = 'default',
  customConfig,
  storageKey = 'a2ui-theme',
  disableSystemDetection = false,
  onThemeChange,
}: ThemeProviderProps): ReactNode {
  // 从存储恢复状态
  const [mode, setModeState] = useState<ThemeMode>(() => 
    getStoredValue(`${storageKey}-mode`, defaultMode)
  );
  const [preset, setPresetState] = useState<ThemePreset>(() => 
    getStoredValue(`${storageKey}-preset`, defaultPreset)
  );
  const [customColors, setCustomColors] = useState<{
    light?: Partial<ThemeColors>;
    dark?: Partial<ThemeColors>;
  }>(() => getStoredValue(`${storageKey}-custom`, {}));
  
  // 计算实际模式
  const resolvedMode = useMemo((): 'light' | 'dark' => {
    if (mode === 'system' && !disableSystemDetection) {
      return getSystemTheme();
    }
    return mode === 'dark' ? 'dark' : 'light';
  }, [mode, disableSystemDetection]);
  
  // 合并配置
  const config = useMemo((): ThemeConfig => {
    const baseConfig = getPreset(preset);
    
    return {
      light: {
        ...baseConfig.light,
        ...customConfig?.light,
        ...customColors.light,
      },
      dark: {
        ...baseConfig.dark,
        ...customConfig?.dark,
        ...customColors.dark,
      },
      radius: customConfig?.radius ?? baseConfig.radius,
      fontFamily: customConfig?.fontFamily ?? baseConfig.fontFamily,
    };
  }, [preset, customConfig, customColors]);
  
  // 应用主题
  useEffect(() => {
    const colors = resolvedMode === 'dark' ? config.dark : config.light;
    injectThemeColors(colors, resolvedMode);
    injectThemeExtras(config);
    onThemeChange?.(mode, resolvedMode);
  }, [config, resolvedMode, mode, onThemeChange]);
  
  // 监听系统主题变化
  useEffect(() => {
    if (mode !== 'system' || disableSystemDetection) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const newResolved = mediaQuery.matches ? 'dark' : 'light';
      const colors = newResolved === 'dark' ? config.dark : config.light;
      injectThemeColors(colors, newResolved);
      onThemeChange?.(mode, newResolved);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mode, config, disableSystemDetection, onThemeChange]);
  
  // Actions
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    setStoredValue(`${storageKey}-mode`, newMode);
  }, [storageKey]);
  
  const toggleMode = useCallback(() => {
    const newMode = resolvedMode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  }, [resolvedMode, setMode]);
  
  const setPreset = useCallback((newPreset: ThemePreset) => {
    setPresetState(newPreset);
    setStoredValue(`${storageKey}-preset`, newPreset);
    // 重置自定义颜色
    setCustomColors({});
    setStoredValue(`${storageKey}-custom`, {});
  }, [storageKey]);
  
  const setColors = useCallback((
    colors: Partial<ThemeColors>,
    target: 'light' | 'dark' | 'both' = 'both'
  ) => {
    setCustomColors(prev => {
      const next = { ...prev };
      if (target === 'light' || target === 'both') {
        next.light = { ...prev.light, ...colors };
      }
      if (target === 'dark' || target === 'both') {
        next.dark = { ...prev.dark, ...colors };
      }
      setStoredValue(`${storageKey}-custom`, next);
      return next;
    });
  }, [storageKey]);
  
  const reset = useCallback(() => {
    setModeState(defaultMode);
    setPresetState(defaultPreset);
    setCustomColors({});
    setStoredValue(`${storageKey}-mode`, defaultMode);
    setStoredValue(`${storageKey}-preset`, defaultPreset);
    setStoredValue(`${storageKey}-custom`, {});
  }, [defaultMode, defaultPreset, storageKey]);
  
  // Context value
  const value = useMemo((): ThemeContextValue => ({
    mode,
    resolvedMode,
    config,
    preset,
    setMode,
    toggleMode,
    setPreset,
    setColors,
    reset,
  }), [mode, resolvedMode, config, preset, setMode, toggleMode, setPreset, setColors, reset]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 获取主题上下文
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * 安全获取主题上下文 (可能返回 null)
 */
export function useThemeSafe(): ThemeContextValue | null {
  return useContext(ThemeContext);
}

