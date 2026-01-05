/**
 * ============================================================================
 * ToolCallList Component (Tailwind CSS)
 * ============================================================================
 * Displays a list of tool calls with filtering options
 * ============================================================================
 */

import { useMemo } from 'react';
import { cn } from '../../a2ui/lib/utils';
import type { ToolCallState, ToolCallStatus } from '../../hooks/useToolCalls';
import { ToolCallCard, type ToolCallCardProps } from './ToolCallCard';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolCallListProps {
  toolCalls: ToolCallState[];
  statusFilter?: ToolCallStatus | 'all' | 'active';
  maxItems?: number;
  emptyMessage?: string;
  showEmpty?: boolean;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
  cardProps?: Partial<Omit<ToolCallCardProps, 'toolCall'>>;
}

const GAP_CLASSES = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ToolCallList({
  toolCalls,
  statusFilter = 'all',
  maxItems = 0,
  emptyMessage = 'No tool calls yet',
  showEmpty = true,
  className,
  gap = 'md',
  cardProps = {},
}: ToolCallListProps) {
  // Filter tool calls
  const filteredToolCalls = useMemo(() => {
    let result = toolCalls;

    if (statusFilter === 'active') {
      result = toolCalls.filter(
        (tc) => tc.status === 'pending' || tc.status === 'streaming' || tc.status === 'executing'
      );
    } else if (statusFilter !== 'all') {
      result = toolCalls.filter((tc) => tc.status === statusFilter);
    }

    if (maxItems > 0) {
      result = result.slice(0, maxItems);
    }

    return result;
  }, [toolCalls, statusFilter, maxItems]);

  // Empty state
  if (filteredToolCalls.length === 0) {
    if (!showEmpty) return null;
    return (
      <div className={cn('text-center py-6 text-sm text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', GAP_CLASSES[gap], className)}>
      {filteredToolCalls.map((toolCall) => (
        <ToolCallCard
          key={toolCall.id}
          toolCall={toolCall}
          {...cardProps}
        />
      ))}
    </div>
  );
}

