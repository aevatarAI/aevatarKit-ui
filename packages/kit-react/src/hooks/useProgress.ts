/**
 * ============================================================================
 * useProgress Hook
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import type { CustomEvent } from '@aevatar/kit-types';
import type { AevatarProgressEvent } from '@aevatar/kit-protocol';
import { useAevatar } from './useAevatar';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UseProgressResult {
  /** Current progress event */
  progress: AevatarProgressEvent | null;
  
  /** Progress percentage (0-100) */
  percent: number;
  
  /** Current phase */
  phase: string | null;
  
  /** Current step */
  stepId: string | null;
  
  /** Message */
  message: string | null;
  
  /** Whether there's active progress */
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useProgress(): UseProgressResult {
  const { activeSession } = useAevatar();
  
  const [progress, setProgress] = useState<AevatarProgressEvent | null>(null);

  // Subscribe to progress events
  useEffect(() => {
    if (!activeSession) {
      setProgress(null);
      return;
    }

    const unsubscribe = activeSession.onEvent((event) => {
      if (event.type === 'CUSTOM') {
        const customEvent = event as CustomEvent;
        if (customEvent.name === 'aevatar.progress') {
          setProgress(customEvent.value as AevatarProgressEvent);
        }
      }
      
      // Clear progress on run finish
      if (event.type === 'RUN_FINISHED' || event.type === 'RUN_ERROR') {
        setProgress(null);
      }
    });

    return unsubscribe;
  }, [activeSession]);

  return {
    progress,
    percent: progress?.progressPercent ?? 0,
    phase: progress?.phase ?? null,
    stepId: progress?.stepId ?? null,
    message: progress?.message ?? null,
    isActive: progress !== null,
  };
}

