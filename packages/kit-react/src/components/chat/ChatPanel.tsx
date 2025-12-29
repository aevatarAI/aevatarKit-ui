/**
 * ============================================================================
 * ChatPanel Component
 * ============================================================================
 */

import React, { useState, useCallback } from 'react';
import { useSession } from '../../hooks/useSession';
import { useMessages } from '../../hooks/useMessages';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatPanelProps {
  /** Custom class name */
  className?: string;
  
  /** Placeholder text for input */
  placeholder?: string;
  
  /** Whether to show loading state */
  showLoading?: boolean;
  
  /** Custom render for messages */
  renderMessage?: (message: { id: string; role: string; content: string }) => React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ChatPanel({
  className = '',
  placeholder = 'Type a message...',
  showLoading = true,
  renderMessage,
}: ChatPanelProps) {
  const { sendMessage, isLoading } = useSession();
  const { messages, streamingMessage, isStreaming } = useMessages();
  const [error, setError] = useState<string | null>(null);

  const handleSend = useCallback(
    async (content: string) => {
      setError(null);
      try {
        await sendMessage(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
    },
    [sendMessage]
  );

  return (
    <div className={`aevatar-chat-panel ${className}`} style={styles.container}>
      <div style={styles.messageArea}>
        <MessageList
          messages={messages}
          streamingMessage={streamingMessage}
          renderMessage={renderMessage}
        />
        {showLoading && isLoading && !isStreaming && (
          <div style={styles.loading}>Thinking...</div>
        )}
      </div>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <InputArea
        placeholder={placeholder}
        disabled={isLoading}
        onSend={handleSend}
      />
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
    height: '100%',
    backgroundColor: 'var(--aevatar-background, #ffffff)',
    borderRadius: 'var(--aevatar-radius, 8px)',
    overflow: 'hidden',
  },
  messageArea: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
  },
  loading: {
    padding: '8px 16px',
    color: 'var(--aevatar-text-muted, #64748b)',
    fontSize: '14px',
  },
  error: {
    padding: '8px 16px',
    color: 'var(--aevatar-error, #ef4444)',
    fontSize: '14px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
};

