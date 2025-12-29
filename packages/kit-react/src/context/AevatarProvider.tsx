/**
 * ============================================================================
 * Aevatar Provider
 * ============================================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { createAevatarClient, type AevatarClient, type SessionInstance } from '@aevatar/kit-core';
import type { ClientOptions, ConnectionStatus } from '@aevatar/kit-types';
import { AevatarContext, type AevatarContextValue } from './AevatarContext';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AevatarProviderProps {
  /** Client options or pre-created client */
  client: ClientOptions | AevatarClient;
  
  /** Auto-connect on mount */
  autoConnect?: boolean;
  
  /** Children */
  children: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AevatarProvider({
  client: clientOrOptions,
  autoConnect = true,
  children,
}: AevatarProviderProps) {
  // Create or use client
  const client = useMemo<AevatarClient>(() => {
    if ('connect' in clientOrOptions) {
      return clientOrOptions;
    }
    return createAevatarClient(clientOrOptions);
  }, [clientOrOptions]);

  // State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(client.status);
  const [activeSession, setActiveSession] = useState<SessionInstance | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Connection status listener
  useEffect(() => {
    const unsubscribe = client.onConnectionChange(setConnectionStatus);
    return unsubscribe;
  }, [client]);

  // Auto-connect
  useEffect(() => {
    if (autoConnect && connectionStatus === 'disconnected') {
      client.connect().catch(setError);
    }
  }, [client, autoConnect, connectionStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      client.disconnect();
    };
  }, [client]);

  // Set active session callback
  const handleSetActiveSession = useCallback((session: SessionInstance | null) => {
    setActiveSession(session);
  }, []);

  // Context value
  const value = useMemo<AevatarContextValue>(
    () => ({
      client,
      connectionStatus,
      activeSession,
      setActiveSession: handleSetActiveSession,
      isReady: connectionStatus === 'connected',
      error,
    }),
    [client, connectionStatus, activeSession, handleSetActiveSession, error]
  );

  return (
    <AevatarContext.Provider value={value}>
      {children}
    </AevatarContext.Provider>
  );
}

