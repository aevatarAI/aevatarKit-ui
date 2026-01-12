/**
 * ============================================================================
 * Event Router
 * ============================================================================
 * Routes AG-UI events to registered handlers
 * Supports batch registration and type-safe custom events
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

/**
 * Map of custom event names to their value types
 * Extend this interface for type-safe custom events
 *
 * @example
 * interface MyCustomEvents {
 *   'app.user.login': { userId: string; timestamp: number }
 *   'app.data.updated': { collection: string; count: number }
 * }
 * const router = createEventRouter<MyCustomEvents>()
 * router.onCustom('app.user.login', (event) => {
 *   // event.value is typed as { userId: string; timestamp: number }
 * })
 */
export type CustomEventMap = Record<string, unknown>;

/**
 * Type-safe custom event with value type
 */
export interface TypedCustomEvent<T> extends Omit<CustomEvent, 'value'> {
  value: T;
}

/**
 * Handler map for standard AG-UI events
 */
export type StandardEventHandlers = {
  [K in AgUiEventType]?: EventHandler<Extract<AgUiEvent, { type: K }>>;
};

/**
 * Handler map for custom events (generic)
 */
export type CustomEventHandlers<T extends CustomEventMap = CustomEventMap> = {
  [K in keyof T]?: EventHandler<TypedCustomEvent<T[K]>>;
};

/**
 * Options for creating an EventRouter with batch registration
 */
export interface EventRouterOptions<T extends CustomEventMap = CustomEventMap> {
  /** Standard AG-UI event handlers */
  standard?: StandardEventHandlers;
  /** Custom event handlers (type-safe if generic provided) */
  custom?: CustomEventHandlers<T>;
  /** Handler for all events */
  onAny?: EventHandler<AgUiEvent>;
}

/**
 * Event Router interface
 */
export interface EventRouter<T extends CustomEventMap = CustomEventMap> {
  /** Route event to registered handlers */
  route(event: AgUiEvent): void;
  
  /** Register handler for specific AG-UI event type */
  on<K extends AgUiEventType>(
    type: K,
    handler: EventHandler<Extract<AgUiEvent, { type: K }>>
  ): Unsubscribe;
  
  /**
   * Register handler for CUSTOM events by name
   * If generic T is provided, event.value will be typed
   */
  onCustom<K extends keyof T & string>(
    name: K,
    handler: EventHandler<TypedCustomEvent<T[K]>>
  ): Unsubscribe;

  /**
   * Register handler for CUSTOM events (untyped)
   * Use when event name is not in the type map
   */
  onCustom(name: string, handler: EventHandler<CustomEvent>): Unsubscribe;
  
  /** Register handler for Aevatar extension events */
  onAevatar<K extends AevatarCustomEventName>(
    name: K,
    handler: EventHandler<CustomEvent>
  ): Unsubscribe;
  
  /** Register handler for all events */
  onAny(handler: EventHandler<AgUiEvent>): Unsubscribe;

  /** Batch register standard event handlers */
  registerStandard(handlers: StandardEventHandlers): Unsubscribe;

  /** Batch register custom event handlers */
  registerCustom(handlers: CustomEventHandlers<T>): Unsubscribe;
  
  /** Clear all handlers */
  clear(): void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create an EventRouter with optional batch registration
 *
 * @example Basic usage
 * const router = createEventRouter()
 * router.on('RUN_STARTED', (event) => console.log('Run started'))
 *
 * @example Batch registration
 * const router = createEventRouter({
 *   standard: {
 *     RUN_STARTED: (e) => console.log('Started'),
 *     RUN_FINISHED: (e) => console.log('Finished'),
 *   },
 *   custom: {
 *     'app.event': (e) => console.log('Custom:', e.value),
 *   }
 * })
 *
 * @example Type-safe custom events
 * interface MyEvents {
 *   'worker.update': { id: string; status: string }
 *   'task.complete': { taskId: string; result: unknown }
 * }
 * const router = createEventRouter<MyEvents>()
 * router.onCustom('worker.update', (event) => {
 *   // event.value.id and event.value.status are typed
 * })
 */
export function createEventRouter<T extends CustomEventMap = CustomEventMap>(
  options?: EventRouterOptions<T>
): EventRouter<T> {
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
            console.error(
              `[EventRouter] Custom handler error for ${customEvent.name}:`,
              error
            );
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

  function on<K extends AgUiEventType>(
    type: K,
    handler: EventHandler<Extract<AgUiEvent, { type: K }>>
  ): Unsubscribe {
    const set = getOrCreateSet(typeHandlers, type);
    set.add(handler as EventHandler<AgUiEvent>);
    return () => set.delete(handler as EventHandler<AgUiEvent>);
  }

  function onCustom(
    name: string,
    handler: EventHandler<CustomEvent>
  ): Unsubscribe {
    const set = getOrCreateSet(customHandlers, name);
    set.add(handler);
    return () => set.delete(handler);
  }

  function onAevatar<K extends AevatarCustomEventName>(
    name: K,
    handler: EventHandler<CustomEvent>
  ): Unsubscribe {
    return onCustom(name, handler);
  }

  function onAny(handler: EventHandler<AgUiEvent>): Unsubscribe {
    anyHandlers.add(handler);
    return () => anyHandlers.delete(handler);
  }

  function registerStandard(handlers: StandardEventHandlers): Unsubscribe {
    const unsubscribes: Unsubscribe[] = [];

    for (const [type, handler] of Object.entries(handlers)) {
      if (handler) {
        // Type assertion needed due to Object.entries losing type info
        unsubscribes.push(
          on(type as AgUiEventType, handler as EventHandler<AgUiEvent>)
        );
      }
    }

    return () => unsubscribes.forEach((unsub) => unsub());
  }

  function registerCustom(handlers: CustomEventHandlers<T>): Unsubscribe {
    const unsubscribes: Unsubscribe[] = [];

    for (const [name, handler] of Object.entries(handlers)) {
      if (handler) {
        unsubscribes.push(onCustom(name, handler as EventHandler<CustomEvent>));
      }
    }

    return () => unsubscribes.forEach((unsub) => unsub());
  }

  function clear(): void {
    typeHandlers.clear();
    customHandlers.clear();
    anyHandlers.clear();
  }

  // Apply initial options if provided
  if (options) {
    if (options.standard) {
      registerStandard(options.standard);
    }
    if (options.custom) {
      registerCustom(options.custom);
    }
    if (options.onAny) {
      onAny(options.onAny);
    }
  }

  return {
    route,
    on,
    onCustom: onCustom as EventRouter<T>['onCustom'],
    onAevatar,
    onAny,
    registerStandard,
    registerCustom,
    clear,
  };
}
