/**
 * ============================================================================
 * ToolCallBadge Component (Tailwind CSS)
 * ============================================================================
 * Compact badge showing tool call status (for embedding in messages)
 * ============================================================================
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../a2ui/lib/utils';
import type { ToolCallStatus } from '../../hooks/useToolCalls';

// ─────────────────────────────────────────────────────────────────────────────
// Badge Variants
// ─────────────────────────────────────────────────────────────────────────────

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-mono text-xs font-medium transition-colors',
  {
    variants: {
      status: {
        pending: 'bg-muted text-muted-foreground',
        streaming: 'bg-primary/10 text-primary',
        executing: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
        error: 'bg-destructive/10 text-destructive',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'md',
    },
  }
);

const STATUS_ICONS: Record<ToolCallStatus, string> = {
  pending: '○',
  streaming: '◐',
  executing: '◉',
  completed: '✓',
  error: '✕',
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolCallBadgeProps extends VariantProps<typeof badgeVariants> {
  name: string;
  status: ToolCallStatus;
  onClick?: () => void;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ToolCallBadge({
  name,
  status,
  onClick,
  className,
  size,
  showIcon = true,
  compact = false,
}: ToolCallBadgeProps) {
  const isAnimating = status === 'streaming' || status === 'executing';

  const badge = (
    <span
      className={cn(
        badgeVariants({ status, size }),
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      title={`${name}: ${status}`}
    >
      {showIcon && (
        <span className={cn('text-[0.8em]', isAnimating && 'animate-spin')}>
          {STATUS_ICONS[status]}
        </span>
      )}
      {!compact && <span>{name}</span>}
    </span>
  );

  return badge;
}

