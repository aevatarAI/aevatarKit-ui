/**
 * ============================================================================
 * Event Router
 * ============================================================================
 * Routes AG-UI events to registered handlers
 * ============================================================================
 */

import type {
  AgUiEvent,
  AgUiEventType,
  CustomEvent,
  Unsubscribe,
  EventHandler,
} from '@aevatar/kit-types';
import type { AevatarCustomEventName } from './extensions';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EventRouter {
  /** Route event to registered handlers */
  route(event: AgUiEvent): void;
  
  /** Register handler for specific AG-UI event type */
  on<T extends AgUiEventType>(type: T, handler: EventHandler<Extract<AgUiEvent, { type: T }>>): Unsubscribe;
  
  /** Register handler for CUSTOM events by name */
  onCustom(name: string, handler: EventHandler<CustomEvent>): Unsubscribe;
  
  /** Register handler for Aevatar extension events */
  onAevatar<T extends AevatarCustomEventName>(name: T, handler: EventHandler<CustomEvent>): Unsubscribe;
  
  /** Register handler for all events */
  onAny(handler: EventHandler<AgUiEvent>): Unsubscribe;
  
  /** Clear all handlers */
  clear(): void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export function createEventRouter(): EventRouter {
  // Handler maps
  const typeHandlers = new Map<AgUiEventType, Set<EventHandler<AgUiEvent>>>();
  const customHandlers = new Map<string, Set<EventHandler<CustomEvent>>>();
  const anyHandlers = new Set<EventHandler<AgUiEvent>>();

  // ───────────────────────────────────────────────────────────────────────────
  // Internal helpers
  // ───────────────────────────────────────────────────────────────────────────

  function getOrCreateSet<K, V>(map: Map<K, Set<V>>, key: K): Set<V> {
    let set = map.get(key);
    if (!set) {
      set = new Set();
      map.set(key, set);
    }
    return set;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Public API
  // ───────────────────────────────────────────────────────────────────────────

  function route(event: AgUiEvent): void {
    // Route to type-specific handlers
    const handlers = typeHandlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[EventRouter] Handler error for ${event.type}:`, error);
        }
      });
    }

    // Route CUSTOM events to name-specific handlers
    if (event.type === 'CUSTOM') {
      const customEvent = event as CustomEvent;
      const customSet = customHandlers.get(customEvent.name);
      if (customSet) {
        customSet.forEach((handler) => {
          try {
            handler(customEvent);
          } catch (error) {
            console.error(`[EventRouter] Custom handler error for ${customEvent.name}:`, error);
          }
        });
      }
    }

    // Route to any handlers
    anyHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('[EventRouter] Any handler error:', error);
      }
    });
  }

  function on<T extends AgUiEventType>(
    type: T,
    handler: EventHandler<Extract<AgUiEvent, { type: T }>>
  ): Unsubscribe {
    const set = getOrCreateSet(typeHandlers, type);
    set.add(handler as EventHandler<AgUiEvent>);
    return () => set.delete(handler as EventHandler<AgUiEvent>);
  }

  function onCustom(name: string, handler: EventHandler<CustomEvent>): Unsubscribe {
    const set = getOrCreateSet(customHandlers, name);
    set.add(handler);
    return () => set.delete(handler);
  }

  function onAevatar<T extends AevatarCustomEventName>(
    name: T,
    handler: EventHandler<CustomEvent>
  ): Unsubscribe {
    return onCustom(name, handler);
  }

  function onAny(handler: EventHandler<AgUiEvent>): Unsubscribe {
    anyHandlers.add(handler);
    return () => anyHandlers.delete(handler);
  }

  function clear(): void {
    typeHandlers.clear();
    customHandlers.clear();
    anyHandlers.clear();
  }

  return {
    route,
    on,
    onCustom,
    onAevatar,
    onAny,
    clear,
  };
}

