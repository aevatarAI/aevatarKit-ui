/**
 * ============================================================================
 * TimelineView Component
 * ============================================================================
 */

import React from 'react';
import type { StepInfo } from '@aevatar/kit-types';
import { useRun } from '../../hooks/useRun';
import { StepCard } from './StepCard';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineViewProps {
  /** Steps to display (overrides hook data) */
  steps?: StepInfo[];
  
  /** Custom class name */
  className?: string;
  
  /** Show step details */
  showDetails?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function TimelineView({
  steps: propSteps,
  className = '',
  showDetails = true,
}: TimelineViewProps) {
  const { steps: hookSteps, isRunning } = useRun();
  const steps = propSteps ?? hookSteps;

  if (steps.length === 0) {
    return (
      <div className={`aevatar-timeline ${className}`} style={styles.empty}>
        {isRunning ? 'Starting...' : 'No steps yet'}
      </div>
    );
  }

  return (
    <div className={`aevatar-timeline ${className}`} style={styles.container}>
      {steps.map((step, index) => (
        <div key={step.id} style={styles.stepWrapper}>
          {/* Connector line */}
          {index > 0 && <div style={styles.connector} />}
          
          <StepCard step={step} showDetails={showDetails} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  stepWrapper: {
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    top: '-12px',
    left: '20px',
    width: '2px',
    height: '12px',
    backgroundColor: 'var(--aevatar-border, #e2e8f0)',
  },
  empty: {
    padding: '24px',
    textAlign: 'center',
    color: 'var(--aevatar-text-muted, #64748b)',
    fontSize: '14px',
  },
};

