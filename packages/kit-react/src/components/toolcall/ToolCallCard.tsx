/**
 * ============================================================================
 * ToolCallCard Component (Tailwind CSS)
 * ============================================================================
 * Displays a single tool call with streaming args and result
 * ============================================================================
 */

import * as React from 'react';
import { useState, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../a2ui/lib/utils';
import type { ToolCallState, ToolCallStatus } from '../../hooks/useToolCalls';

// ─────────────────────────────────────────────────────────────────────────────
// Status Variants
// ─────────────────────────────────────────────────────────────────────────────

const statusVariants = cva('flex items-center gap-1.5 text-xs font-medium', {
  variants: {
    status: {
      pending: 'text-muted-foreground',
      streaming: 'text-primary',
      executing: 'text-amber-600 dark:text-amber-400',
      completed: 'text-green-600 dark:text-green-400',
      error: 'text-destructive',
    },
  },
  defaultVariants: {
    status: 'pending',
  },
});

const STATUS_ICONS: Record<ToolCallStatus, string> = {
  pending: '○',
  streaming: '◐',
  executing: '◉',
  completed: '✓',
  error: '✕',
};

const STATUS_LABELS: Record<ToolCallStatus, string> = {
  pending: 'Pending',
  streaming: 'Receiving',
  executing: 'Executing',
  completed: 'Completed',
  error: 'Error',
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolCallCardProps extends VariantProps<typeof statusVariants> {
  toolCall: ToolCallState;
  defaultExpanded?: boolean;
  className?: string;
  renderIcon?: (toolName: string) => React.ReactNode;
  renderResult?: (result: unknown) => React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ToolCallCard({
  toolCall,
  defaultExpanded = false,
  className,
  renderIcon,
  renderResult,
}: ToolCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isAnimating = toolCall.status === 'streaming' || toolCall.status === 'executing';

  // Format duration
  const formattedDuration = useMemo(() => {
    if (!toolCall.duration) return null;
    if (toolCall.duration < 1000) return `${toolCall.duration}ms`;
    return `${(toolCall.duration / 1000).toFixed(2)}s`;
  }, [toolCall.duration]);

  // Format args for display
  const formattedArgs = useMemo(() => {
    if (toolCall.parsedArgs) {
      return JSON.stringify(toolCall.parsedArgs, null, 2);
    }
    return toolCall.args || '{}';
  }, [toolCall.parsedArgs, toolCall.args]);

  // Format result for display
  const formattedResult = useMemo(() => {
    if (renderResult && toolCall.parsedResult !== null) {
      return renderResult(toolCall.parsedResult);
    }
    if (toolCall.parsedResult !== null) {
      if (typeof toolCall.parsedResult === 'object') {
        return JSON.stringify(toolCall.parsedResult, null, 2);
      }
      return String(toolCall.parsedResult);
    }
    return toolCall.result;
  }, [toolCall.parsedResult, toolCall.result, renderResult]);

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex w-full items-center gap-3 px-4 py-3',
          'hover:bg-muted/50 transition-colors',
          isExpanded && 'border-b border-border'
        )}
      >
        {/* Tool Icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-base">
          {renderIcon ? renderIcon(toolCall.name) : '🔧'}
        </div>

        {/* Tool Name */}
        <span className="flex-1 text-left font-semibold font-mono text-sm">
          {toolCall.name}
        </span>

        {/* Duration */}
        {formattedDuration && (
          <span className="text-xs text-muted-foreground">
            {formattedDuration}
          </span>
        )}

        {/* Status */}
        <div className={statusVariants({ status: toolCall.status })}>
          <span className={cn(isAnimating && 'animate-pulse')}>
            {STATUS_ICONS[toolCall.status]}
          </span>
          <span>{STATUS_LABELS[toolCall.status]}</span>
        </div>

        {/* Expand Icon */}
        <span
          className={cn(
            'text-xs text-muted-foreground transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        >
          ▼
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Arguments Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Arguments
              </span>
              {toolCall.status === 'streaming' && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  streaming...
                </span>
              )}
            </div>
            <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-auto max-h-48 whitespace-pre-wrap break-words">
              {formattedArgs}
            </pre>
          </div>

          {/* Result Section */}
          {toolCall.result !== null && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Result
              </div>
              {typeof formattedResult === 'string' ? (
                <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-auto max-h-48 whitespace-pre-wrap break-words">
                  {formattedResult}
                </pre>
              ) : (
                <div className="rounded-md bg-muted p-3 text-sm">
                  {formattedResult}
                </div>
              )}
            </div>
          )}

          {/* Error Section */}
          {toolCall.error && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-destructive mb-2">
                Error
              </div>
              <pre className="rounded-md bg-destructive/10 p-3 text-xs font-mono text-destructive overflow-auto max-h-48">
                {toolCall.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

