/**
 * ============================================================================
 * A2UI Theme System
 * ============================================================================
 * 
 * 可配置的主题系统，支持：
 * - 8 种预设主题 (default, ocean, forest, sunset, rose, violet, slate, zinc)
 * - 明暗模式切换 (light/dark/system)
 * - 自定义颜色配置
 * - 本地存储持久化
 * - 系统主题跟随
 * 
 * 使用示例:
 * 
 * ```tsx
 * import { ThemeProvider, useTheme, ThemeModeToggle } from '@aevatar/kit-react';
 * 
 * // 1. 包装应用
 * <ThemeProvider defaultPreset="ocean" defaultMode="system">
 *   <App />
 * </ThemeProvider>
 * 
 * // 2. 使用主题 Hook
 * function Settings() {
 *   const { mode, preset, setMode, setPreset, setColors } = useTheme();
 *   
 *   return (
 *     <div>
 *       <ThemeModeToggle />
 *       <ThemePresetSelector />
 *     </div>
 *   );
 * }
 * 
 * // 3. 自定义颜色
 * setColors({ primary: '201 96% 32%' }, 'both');
 * ```
 * 
 * ============================================================================
 */

// Types
export type {
  HSLValue,
  ThemeColors,
  ThemeConfig,
  ThemeMode,
  ThemePreset,
  ThemeContextValue,
  ThemeProviderProps,
} from './types';

// Provider & Hook
export { ThemeProvider, useTheme, useThemeSafe } from './ThemeProvider';

// Presets
export { themePresets, getPreset, getPresetNames } from './presets';

// Components
export {
  ThemeModeToggle,
  ThemeModeSelector,
  ThemePresetSelector,
  ColorCustomizer,
  type ThemeModeToggleProps,
  type ThemeModeSelectorProps,
  type ThemePresetSelectorProps,
  type ColorCustomizerProps,
} from './ThemeToggle';

