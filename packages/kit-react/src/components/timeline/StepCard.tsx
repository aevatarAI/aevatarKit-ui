/**
 * ============================================================================
 * StepCard Component
 * ============================================================================
 */

import React from 'react';
import type { StepInfo } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StepCardProps {
  /** Step info */
  step: StepInfo;
  
  /** Show step details */
  showDetails?: boolean;
  
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function StepCard({ step, showDetails = true, className = '' }: StepCardProps) {
  const statusColor = getStatusColor(step.status);
  const statusIcon = getStatusIcon(step.status);

  return (
    <div className={`aevatar-step-card ${className}`} style={styles.container}>
      {/* Status indicator */}
      <div style={{ ...styles.indicator, backgroundColor: statusColor }}>
        {statusIcon}
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.header}>
          <span style={styles.name}>{step.name || step.id}</span>
          <span style={{ ...styles.status, color: statusColor }}>{step.status}</span>
        </div>
        
        <div style={styles.type}>{step.type}</div>
        
        {showDetails && step.result !== undefined && (
          <div style={styles.result}>
            {typeof step.result === 'string'
              ? step.result
              : JSON.stringify(step.result, null, 2)}
          </div>
        )}
        
        {step.error && <div style={styles.error}>{step.error}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'var(--aevatar-success, #22c55e)';
    case 'running':
      return 'var(--aevatar-primary, #6366f1)';
    case 'failed':
      return 'var(--aevatar-error, #ef4444)';
    case 'skipped':
      return 'var(--aevatar-text-muted, #64748b)';
    default:
      return 'var(--aevatar-border, #e2e8f0)';
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'completed':
      return '✓';
    case 'running':
      return '⟳';
    case 'failed':
      return '✗';
    case 'skipped':
      return '−';
    default:
      return '○';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'var(--aevatar-surface, #f8fafc)',
    borderRadius: 'var(--aevatar-radius, 8px)',
    border: '1px solid var(--aevatar-border, #e2e8f0)',
  },
  indicator: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  name: {
    fontWeight: 500,
    color: 'var(--aevatar-text, #1e293b)',
    fontSize: '14px',
  },
  status: {
    fontSize: '12px',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  type: {
    fontSize: '12px',
    color: 'var(--aevatar-text-muted, #64748b)',
    marginTop: '2px',
  },
  result: {
    marginTop: '8px',
    padding: '8px',
    fontSize: '12px',
    backgroundColor: 'var(--aevatar-background, #ffffff)',
    borderRadius: '4px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  error: {
    marginTop: '8px',
    padding: '8px',
    fontSize: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--aevatar-error, #ef4444)',
    borderRadius: '4px',
  },
};

