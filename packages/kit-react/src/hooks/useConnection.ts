/**
 * ============================================================================
 * useConnection Hook
 * ============================================================================
 */

import { useCallback } from 'react';
import type { ConnectionStatus } from '@aevatar/kit-types';
import { useAevatar } from './useAevatar';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UseConnectionResult {
  /** Current connection status */
  status: ConnectionStatus;
  
  /** Whether connected */
  isConnected: boolean;
  
  /** Whether connecting */
  isConnecting: boolean;
  
  /** Whether disconnected */
  isDisconnected: boolean;
  
  /** Whether reconnecting */
  isReconnecting: boolean;
  
  /** Whether in error state */
  isError: boolean;
  
  /** Connect to backend */
  connect: () => Promise<void>;
  
  /** Disconnect from backend */
  disconnect: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useConnection(): UseConnectionResult {
  const { client, connectionStatus } = useAevatar();

  const connect = useCallback(async () => {
    if (!client) {
      throw new Error('Client not initialized');
    }
    await client.connect();
  }, [client]);

  const disconnect = useCallback(() => {
    client?.disconnect();
  }, [client]);

  return {
    status: connectionStatus,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    isDisconnected: connectionStatus === 'disconnected',
    isReconnecting: connectionStatus === 'reconnecting',
    isError: connectionStatus === 'error',
    connect,
    disconnect,
  };
}

