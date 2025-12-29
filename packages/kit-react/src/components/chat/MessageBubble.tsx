/**
 * ============================================================================
 * MessageBubble Component
 * ============================================================================
 */

import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MessageBubbleProps {
  /** Message role */
  role: 'user' | 'assistant' | 'system' | 'tool' | string;
  
  /** Message content */
  content: string;
  
  /** Whether message is being streamed */
  isStreaming?: boolean;
  
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MessageBubble({
  role,
  content,
  isStreaming = false,
  className = '',
}: MessageBubbleProps) {
  const isUser = role === 'user';
  
  return (
    <div
      className={`aevatar-message-bubble ${className}`}
      style={{
        ...styles.container,
        ...(isUser ? styles.userContainer : styles.assistantContainer),
      }}
    >
      <div
        style={{
          ...styles.bubble,
          ...(isUser ? styles.userBubble : styles.assistantBubble),
        }}
      >
        <div style={styles.content}>
          {content}
          {isStreaming && <span style={styles.cursor}>▊</span>}
        </div>
      </div>
      <div style={styles.role}>
        {role === 'assistant' ? 'Assistant' : role === 'user' ? 'You' : role}
      </div>
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
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    padding: '12px 16px',
    borderRadius: 'var(--aevatar-radius, 8px)',
    wordBreak: 'break-word',
  },
  userBubble: {
    backgroundColor: 'var(--aevatar-primary, #6366f1)',
    color: '#ffffff',
  },
  assistantBubble: {
    backgroundColor: 'var(--aevatar-surface, #f8fafc)',
    color: 'var(--aevatar-text, #1e293b)',
    border: '1px solid var(--aevatar-border, #e2e8f0)',
  },
  content: {
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  role: {
    fontSize: '11px',
    color: 'var(--aevatar-text-muted, #64748b)',
    marginTop: '4px',
    paddingInline: '4px',
  },
  cursor: {
    animation: 'blink 1s infinite',
    marginLeft: '2px',
  },
};

