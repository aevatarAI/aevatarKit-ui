/**
 * ============================================================================
 * LoadingSpinner Component
 * ============================================================================
 */

import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LoadingSpinnerProps {
  /** Size in pixels */
  size?: number;
  
  /** Custom color */
  color?: string;
  
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function LoadingSpinner({
  size = 24,
  color = 'var(--aevatar-primary, #6366f1)',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`aevatar-loading-spinner ${className}`}
      style={{
        ...styles.spinner,
        width: size,
        height: size,
        borderColor: `${color}33`,
        borderTopColor: color,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  spinner: {
    borderWidth: '2px',
    borderStyle: 'solid',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

