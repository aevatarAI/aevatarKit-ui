/**
 * ============================================================================
 * useSession Hook
 * ============================================================================
 */

import { useState, useCallback, useEffect } from 'react';
import type { SessionInstance } from '@aevatar/kit-core';
import type { CreateSessionOptions, SessionState, AgUiMessage, RunInput } from '@aevatar/kit-types';
import { useAevatar } from './useAevatar';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UseSessionResult {
  /** Current session */
  session: SessionInstance | null;
  
  /** Session state */
  state: SessionState | null;
  
  /** Messages in session */
  messages: AgUiMessage[];
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: Error | null;
  
  /** Create new session */
  createSession: (options?: CreateSessionOptions) => Promise<SessionInstance>;
  
  /** Start a run */
  startRun: (input?: RunInput) => Promise<void>;
  
  /** Send message */
  sendMessage: (content: string) => Promise<void>;
  
  /** Close session */
  closeSession: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useSession(): UseSessionResult {
  const { client, activeSession, setActiveSession, isReady } = useAevatar();
  
  const [state, setState] = useState<SessionState | null>(activeSession?.state ?? null);
  const [messages, setMessages] = useState<AgUiMessage[]>(activeSession?.messages ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to session state changes
  useEffect(() => {
    if (!activeSession) {
      setState(null);
      setMessages([]);
      return;
    }

    setState(activeSession.state);
    setMessages(activeSession.messages);

    const unsubState = activeSession.onStateChange(setState);
    const unsubMsg = activeSession.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      unsubState();
      unsubMsg();
    };
  }, [activeSession]);

  // Create session
  const createSession = useCallback(
    async (options?: CreateSessionOptions): Promise<SessionInstance> => {
      if (!client || !isReady) {
        throw new Error('Client not ready');
      }

      setIsLoading(true);
      setError(null);

      try {
        const session = await client.createSession(options);
        setActiveSession(session);
        return session;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [client, isReady, setActiveSession]
  );

  // Start run
  const startRun = useCallback(
    async (input?: RunInput): Promise<void> => {
      if (!activeSession) {
        throw new Error('No active session');
      }

      setIsLoading(true);
      setError(null);

      try {
        await activeSession.startRun(input);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeSession]
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!activeSession) {
        throw new Error('No active session');
      }

      setIsLoading(true);
      setError(null);

      try {
        await activeSession.sendMessage(content);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeSession]
  );

  // Close session
  const closeSession = useCallback(async (): Promise<void> => {
    if (!activeSession) return;

    try {
      await activeSession.close();
      setActiveSession(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [activeSession, setActiveSession]);

  return {
    session: activeSession,
    state,
    messages,
    isLoading,
    error,
    createSession,
    startRun,
    sendMessage,
    closeSession,
  };
}

