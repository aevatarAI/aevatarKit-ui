/**
 * ============================================================================
 * Theme Toggle Components
 * ============================================================================
 * 
 * 便捷的主题切换组件
 * 
 * ============================================================================
 */

import { useThemeSafe } from './ThemeProvider';
import type { ThemeMode, ThemePreset } from './types';
import { getPresetNames } from './presets';
import { cn } from '../a2ui/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Theme Mode Toggle
// ─────────────────────────────────────────────────────────────────────────────

export interface ThemeModeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 明暗模式切换按钮
 */
export function ThemeModeToggle({ 
  className,
  showLabel = false,
  size = 'md',
}: ThemeModeToggleProps) {
  const theme = useThemeSafe();
  
  if (!theme) return null;
  
  const { resolvedMode, toggleMode, mode, setMode } = theme;
  const isDark = resolvedMode === 'dark';
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };
  
  const handleClick = () => {
    if (mode === 'system') {
      // 如果当前是 system，切换到具体模式
      setMode(isDark ? 'light' : 'dark');
    } else {
      toggleMode();
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        'border border-input bg-background',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'transition-colors',
        sizeClasses[size],
        showLabel && 'w-auto px-3 gap-2',
        className
      )}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <SunIcon className="h-[1.2em] w-[1.2em]" />
      ) : (
        <MoonIcon className="h-[1.2em] w-[1.2em]" />
      )}
      {showLabel && (
        <span>{isDark ? 'Light' : 'Dark'}</span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Mode Selector (with System option)
// ─────────────────────────────────────────────────────────────────────────────

export interface ThemeModeSelectorProps {
  className?: string;
}

/**
 * 主题模式选择器 (Light/Dark/System)
 */
export function ThemeModeSelector({ className }: ThemeModeSelectorProps) {
  const theme = useThemeSafe();
  
  if (!theme) return null;
  
  const { mode, setMode } = theme;
  
  const modes: { value: ThemeMode; label: string; icon: typeof SunIcon }[] = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: ComputerIcon },
  ];
  
  return (
    <div className={cn('inline-flex rounded-lg border border-input p-1', className)}>
      {modes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setMode(value)}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium',
            'transition-colors',
            mode === value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Preset Selector
// ─────────────────────────────────────────────────────────────────────────────

export interface ThemePresetSelectorProps {
  className?: string;
  showColors?: boolean;
}

/**
 * 主题预设选择器
 */
export function ThemePresetSelector({ 
  className,
  showColors = true,
}: ThemePresetSelectorProps) {
  const theme = useThemeSafe();
  
  if (!theme) return null;
  
  const { preset, setPreset } = theme;
  const presets = getPresetNames();
  
  // 预设颜色展示
  const presetColors: Record<ThemePreset, string> = {
    default: '222.2 47.4% 11.2%',
    ocean: '201 96% 32%',
    forest: '142 70% 35%',
    sunset: '24 95% 53%',
    rose: '346 77% 50%',
    violet: '262 83% 58%',
    slate: '215 25% 27%',
    zinc: '240 6% 10%',
  };
  
  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      {presets.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setPreset(p)}
          className={cn(
            'flex flex-col items-center gap-1 rounded-lg border p-2',
            'transition-colors',
            preset === p
              ? 'border-primary bg-primary/10'
              : 'border-input hover:border-primary/50 hover:bg-accent'
          )}
          title={p}
        >
          {showColors && (
            <div
              className="h-6 w-6 rounded-full border border-border"
              style={{ backgroundColor: `hsl(${presetColors[p]})` }}
            />
          )}
          <span className="text-xs capitalize">{p}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Color Customizer
// ─────────────────────────────────────────────────────────────────────────────

export interface ColorCustomizerProps {
  className?: string;
  colors?: Array<'primary' | 'secondary' | 'accent' | 'destructive'>;
}

/**
 * 颜色自定义器
 */
export function ColorCustomizer({ 
  className,
  colors = ['primary', 'secondary', 'accent'],
}: ColorCustomizerProps) {
  const theme = useThemeSafe();
  
  if (!theme) return null;
  
  const { config, setColors, resolvedMode } = theme;
  const currentColors = resolvedMode === 'dark' ? config.dark : config.light;
  
  const handleColorChange = (key: keyof typeof currentColors, value: string) => {
    // 从 hex 转换为 HSL (简化版)
    const hsl = hexToHsl(value);
    setColors({ [key]: hsl }, resolvedMode);
  };
  
  const colorLabels: Record<string, string> = {
    primary: 'Primary',
    secondary: 'Secondary',
    accent: 'Accent',
    destructive: 'Destructive',
  };
  
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {colors.map((colorKey) => (
        <div key={colorKey} className="flex items-center gap-3">
          <label className="w-24 text-sm font-medium">
            {colorLabels[colorKey]}
          </label>
          <input
            type="color"
            value={hslToHex(currentColors[colorKey as keyof typeof currentColors] as string || '0 0% 50%')}
            onChange={(e) => handleColorChange(colorKey as keyof typeof currentColors, e.target.value)}
            className="h-8 w-12 cursor-pointer rounded border border-input"
          />
          <span className="text-xs text-muted-foreground">
            {currentColors[colorKey as keyof typeof currentColors]}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function ComputerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="8" x="5" y="2" rx="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" />
      <path d="M6 18h2" />
      <path d="M12 18h6" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Color Conversion Helpers
// ─────────────────────────────────────────────────────────────────────────────

function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hslToHex(hsl: string): string {
  const parts = hsl.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return '#888888';
  
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

