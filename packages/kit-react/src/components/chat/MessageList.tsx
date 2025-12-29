/**
 * ============================================================================
 * MessageList Component
 * ============================================================================
 */

import React, { useRef, useEffect } from 'react';
import type { AgUiMessage } from '@aevatar/kit-types';
import type { StreamingMessage } from '../../hooks/useMessages';
import { MessageBubble } from './MessageBubble';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MessageListProps {
  /** Messages to display */
  messages: AgUiMessage[];
  
  /** Currently streaming message */
  streamingMessage?: StreamingMessage | null;
  
  /** Custom class name */
  className?: string;
  
  /** Auto scroll to bottom */
  autoScroll?: boolean;
  
  /** Custom render for messages */
  renderMessage?: (message: { id: string; role: string; content: string }) => React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MessageList({
  messages,
  streamingMessage,
  className = '',
  autoScroll = true,
  renderMessage,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage?.content, autoScroll]);

  return (
    <div className={`aevatar-message-list ${className}`} style={styles.container}>
      {messages.map((message) =>
        renderMessage ? (
          <React.Fragment key={message.id}>{renderMessage(message)}</React.Fragment>
        ) : (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
          />
        )
      )}
      
      {streamingMessage && (
        <MessageBubble
          key={streamingMessage.id}
          role="assistant"
          content={streamingMessage.content}
          isStreaming={!streamingMessage.isComplete}
        />
      )}
      
      <div ref={bottomRef} />
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
    gap: '12px',
  },
};

