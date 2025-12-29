/**
 * ============================================================================
 * ConnectionStatus Component
 * ============================================================================
 */

import React from 'react';
import { useConnection } from '../../hooks/useConnection';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ConnectionStatusProps {
  /** Show label */
  showLabel?: boolean;
  
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ConnectionStatus({
  showLabel = true,
  className = '',
}: ConnectionStatusProps) {
  const { isConnected, isConnecting, isReconnecting, isError } = useConnection();

  const color = isConnected
    ? 'var(--aevatar-success, #22c55e)'
    : isError
      ? 'var(--aevatar-error, #ef4444)'
      : 'var(--aevatar-warning, #f59e0b)';

  const label = isConnected
    ? 'Connected'
    : isConnecting
      ? 'Connecting...'
      : isReconnecting
        ? 'Reconnecting...'
        : isError
          ? 'Connection Error'
          : 'Disconnected';

  return (
    <div className={`aevatar-connection-status ${className}`} style={styles.container}>
      <div
        style={{
          ...styles.indicator,
          backgroundColor: color,
          ...(isConnecting || isReconnecting ? styles.pulse : {}),
        }}
      />
      {showLabel && <span style={styles.label}>{label}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  pulse: {
    animation: 'pulse 1.5s infinite',
  },
  label: {
    fontSize: '12px',
    color: 'var(--aevatar-text-muted, #64748b)',
  },
};

