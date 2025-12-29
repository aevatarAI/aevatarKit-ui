/**
 * ============================================================================
 * useAevatar Hook
 * ============================================================================
 */

import { useContext } from 'react';
import { AevatarContext, type AevatarContextValue } from '../context/AevatarContext';

/**
 * Access the Aevatar context
 * 
 * @throws Error if used outside AevatarProvider
 */
export function useAevatar(): AevatarContextValue {
  const context = useContext(AevatarContext);
  
  if (!context) {
    throw new Error('useAevatar must be used within an AevatarProvider');
  }
  
  return context;
}

