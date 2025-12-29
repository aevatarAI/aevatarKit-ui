/**
 * ============================================================================
 * useMessages Hook
 * ============================================================================
 */

import { useState, useEffect, useRef } from 'react';
import type { AgUiMessage } from '@aevatar/kit-types';
import { useAevatar } from './useAevatar';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UseMessagesResult {
  /** All messages */
  messages: AgUiMessage[];
  
  /** Message currently being streamed */
  streamingMessage: StreamingMessage | null;
  
  /** Whether a message is being streamed */
  isStreaming: boolean;
}

export interface StreamingMessage {
  id: string;
  role: 'assistant';
  content: string;
  isComplete: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useMessages(): UseMessagesResult {
  const { activeSession } = useAevatar();
  
  const [messages, setMessages] = useState<AgUiMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
  const streamingContentRef = useRef<string>('');

  // Subscribe to session events for streaming
  useEffect(() => {
    if (!activeSession) {
      setMessages([]);
      setStreamingMessage(null);
      return;
    }

    setMessages(activeSession.messages);

    const unsubscribe = activeSession.onEvent((event) => {
      switch (event.type) {
        case 'TEXT_MESSAGE_START':
          streamingContentRef.current = '';
          setStreamingMessage({
            id: event.messageId,
            role: 'assistant',
            content: '',
            isComplete: false,
          });
          break;

        case 'TEXT_MESSAGE_CONTENT':
          streamingContentRef.current += event.delta;
          setStreamingMessage((prev) =>
            prev?.id === event.messageId
              ? { ...prev, content: streamingContentRef.current }
              : prev
          );
          break;

        case 'TEXT_MESSAGE_END':
          setStreamingMessage((prev) =>
            prev?.id === event.messageId ? { ...prev, isComplete: true } : prev
          );
          // Add completed message to list
          if (streamingContentRef.current) {
            setMessages((prev) => [
              ...prev,
              {
                id: event.messageId,
                role: 'assistant',
                content: streamingContentRef.current,
              },
            ]);
          }
          // Clear streaming state after a short delay
          setTimeout(() => {
            setStreamingMessage(null);
            streamingContentRef.current = '';
          }, 100);
          break;

        case 'MESSAGES_SNAPSHOT':
          setMessages(event.messages);
          break;
      }
    });

    return unsubscribe;
  }, [activeSession]);

  return {
    messages,
    streamingMessage,
    isStreaming: streamingMessage !== null && !streamingMessage.isComplete,
  };
}

