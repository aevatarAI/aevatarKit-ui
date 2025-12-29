/**
 * ============================================================================
 * useEventStream Hook
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import type { AgUiEvent, Unsubscribe } from '@aevatar/kit-types';
import { useAevatar } from './useAevatar';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UseEventStreamResult {
  /** Latest event */
  latestEvent: AgUiEvent | null;
  
  /** All events received */
  events: AgUiEvent[];
  
  /** Subscribe to specific event type */
  subscribe: (callback: (event: AgUiEvent) => void) => Unsubscribe;
  
  /** Clear events */
  clearEvents: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useEventStream(maxEvents = 100): UseEventStreamResult {
  const { activeSession } = useAevatar();
  
  const [latestEvent, setLatestEvent] = useState<AgUiEvent | null>(null);
  const [events, setEvents] = useState<AgUiEvent[]>([]);

  // Subscribe to session events
  useEffect(() => {
    if (!activeSession) {
      setLatestEvent(null);
      setEvents([]);
      return;
    }

    const unsubscribe = activeSession.onEvent((event) => {
      setLatestEvent(event);
      setEvents((prev) => {
        const next = [...prev, event];
        if (next.length > maxEvents) {
          return next.slice(-maxEvents);
        }
        return next;
      });
    });

    return unsubscribe;
  }, [activeSession, maxEvents]);

  // Manual subscription
  const subscribe = useCallback(
    (callback: (event: AgUiEvent) => void): Unsubscribe => {
      if (!activeSession) {
        return () => {};
      }
      return activeSession.onEvent(callback);
    },
    [activeSession]
  );

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
    setLatestEvent(null);
  }, []);

  return {
    latestEvent,
    events,
    subscribe,
    clearEvents,
  };
}

