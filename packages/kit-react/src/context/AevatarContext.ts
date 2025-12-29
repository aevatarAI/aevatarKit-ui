/**
 * ============================================================================
 * Aevatar Context
 * ============================================================================
 */

import { createContext } from 'react';
import type { AevatarClient, SessionInstance } from '@aevatar/kit-core';
import type { ConnectionStatus } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AevatarContextValue {
  /** The Aevatar client instance */
  client: AevatarClient | null;
  
  /** Current connection status */
  connectionStatus: ConnectionStatus;
  
  /** Currently active session */
  activeSession: SessionInstance | null;
  
  /** Set active session */
  setActiveSession: (session: SessionInstance | null) => void;
  
  /** Whether client is initialized and connected */
  isReady: boolean;
  
  /** Last error if any */
  error: Error | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

export const AevatarContext = createContext<AevatarContextValue | null>(null);

AevatarContext.displayName = 'AevatarContext';

