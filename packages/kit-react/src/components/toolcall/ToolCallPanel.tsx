/**
 * ============================================================================
 * ToolCallPanel Component (Tailwind CSS)
 * ============================================================================
 * Complete tool call panel with tabs for active/completed
 * ============================================================================
 */

import * as React from 'react';
import { useState } from 'react';
import { cn } from '../../a2ui/lib/utils';
import type { ToolCallState } from '../../hooks/useToolCalls';
import { ToolCallList } from './ToolCallList';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolCallPanelProps {
  toolCalls: ToolCallState[];
  title?: string;
  showTabs?: boolean;
  defaultTab?: 'all' | 'active' | 'completed';
  className?: string;
  maxHeight?: string;
}

type TabValue = 'all' | 'active' | 'completed';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ToolCallPanel({
  toolCalls,
  title = 'Tool Calls',
  showTabs = true,
  defaultTab = 'all',
  className,
  maxHeight = '400px',
}: ToolCallPanelProps) {
  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);

  // Count by status
  const activeCount = toolCalls.filter(
    (tc) => tc.status === 'pending' || tc.status === 'streaming' || tc.status === 'executing'
  ).length;
  const completedCount = toolCalls.filter(
    (tc) => tc.status === 'completed' || tc.status === 'error'
  ).length;

  return (
    <div className={cn('rounded-lg border border-border bg-background overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <span>🔧</span>
          <span>{title}</span>
          {toolCalls.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold">
              {toolCalls.length}
            </span>
          )}
        </div>

        {/* Tabs */}
        {showTabs && (
          <div className="flex gap-1">
            <TabButton
              active={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
            >
              All
            </TabButton>
            <TabButton
              active={activeTab === 'active'}
              onClick={() => setActiveTab('active')}
            >
              Active {activeCount > 0 && `(${activeCount})`}
            </TabButton>
            <TabButton
              active={activeTab === 'completed'}
              onClick={() => setActiveTab('completed')}
            >
              Done {completedCount > 0 && `(${completedCount})`}
            </TabButton>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="p-4 overflow-y-auto"
        style={{ maxHeight }}
      >
        <ToolCallList
          toolCalls={toolCalls}
          statusFilter={activeTab}
          emptyMessage={
            activeTab === 'active'
              ? 'No active tool calls'
              : activeTab === 'completed'
              ? 'No completed tool calls'
              : 'No tool calls yet'
          }
          cardProps={{
            defaultExpanded: activeTab === 'active',
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab Button Component
// ─────────────────────────────────────────────────────────────────────────────

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

