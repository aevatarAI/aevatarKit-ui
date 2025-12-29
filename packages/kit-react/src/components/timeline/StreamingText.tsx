/**
 * ============================================================================
 * StreamingText Component
 * ============================================================================
 */

import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StreamingTextProps {
  /** Text content */
  content: string;
  
  /** Whether streaming is in progress */
  isStreaming?: boolean;
  
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function StreamingText({
  content,
  isStreaming = false,
  className = '',
}: StreamingTextProps) {
  return (
    <div className={`aevatar-streaming-text ${className}`} style={styles.container}>
      <span>{content}</span>
      {isStreaming && <span style={styles.cursor}>▊</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: '1.6',
  },
  cursor: {
    display: 'inline-block',
    marginLeft: '2px',
    animation: 'blink 1s infinite',
    color: 'var(--aevatar-primary, #6366f1)',
  },
};

