/**
 * ============================================================================
 * ProgressBar Component
 * ============================================================================
 */

import React from 'react';
import { useProgress } from '../../hooks/useProgress';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProgressBarProps {
  /** Progress value (0-100), overrides hook value */
  value?: number;
  
  /** Show label */
  showLabel?: boolean;
  
  /** Label text */
  label?: string;
  
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProgressBar({
  value: propValue,
  showLabel = true,
  label: propLabel,
  className = '',
}: ProgressBarProps) {
  const { percent, phase, message } = useProgress();
  
  const value = propValue ?? percent;
  const label = propLabel ?? message ?? phase ?? '';

  return (
    <div className={`aevatar-progress-bar ${className}`} style={styles.container}>
      {showLabel && label && <div style={styles.label}>{label}</div>}
      
      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width: `${Math.min(100, Math.max(0, value))}%`,
          }}
        />
      </div>
      
      <div style={styles.percentage}>{Math.round(value)}%</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  label: {
    fontSize: '12px',
    color: 'var(--aevatar-text-muted, #64748b)',
    minWidth: '80px',
  },
  track: {
    flex: 1,
    height: '8px',
    backgroundColor: 'var(--aevatar-border, #e2e8f0)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: 'var(--aevatar-primary, #6366f1)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  percentage: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--aevatar-text, #1e293b)',
    minWidth: '36px',
    textAlign: 'right',
  },
};

