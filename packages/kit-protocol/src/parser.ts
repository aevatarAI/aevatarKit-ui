/**
 * ============================================================================
 * AG-UI Event Parser
 * ============================================================================
 * Lightweight JSON parser for AG-UI events (~60 lines core logic)
 * ============================================================================
 */

import type { AgUiEvent, CustomEvent } from '@aevatar/kit-types';
import type { AevatarCustomEvent, AevatarCustomEventName } from './extensions';

// ─────────────────────────────────────────────────────────────────────────────
// Parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse SSE data string into AG-UI event
 * 
 * @param data - Raw SSE data string (JSON)
 * @returns Parsed AG-UI event or null if invalid
 */
export function parseAgUiEvent(data: string): AgUiEvent | null {
  try {
    const parsed = JSON.parse(data);
    
    // Validate required 'type' field
    if (!parsed || typeof parsed.type !== 'string') {
      return null;
    }

    // Add timestamp if missing
    if (parsed.timestamp === undefined) {
      parsed.timestamp = Date.now();
    }

    return parsed as AgUiEvent;
  } catch {
    // Invalid JSON
    return null;
  }
}

/**
 * Parse CUSTOM event into typed Aevatar event
 * 
 * @param event - CUSTOM event
 * @returns Typed Aevatar custom event or original value
 */
export function parseCustomEvent<T extends AevatarCustomEventName>(
  event: CustomEvent
): AevatarCustomEvent<T> | unknown {
  if (event.type !== 'CUSTOM') {
    return event.value;
  }

  const { name, value } = event;

  // Return typed value for known Aevatar events
  if (isAevatarEventName(name)) {
    return value as AevatarCustomEvent<T>;
  }

  // Return raw value for unknown events
  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────────────────────────────────────

const AEVATAR_EVENT_NAMES = [
  'aevatar.progress',
  'aevatar.graph',
  'aevatar.voting',
  'aevatar.task_decomposed',
  'aevatar.worker_started',
  'aevatar.worker_completed',
  'aevatar.consensus',
] as const;

function isAevatarEventName(name: string): name is AevatarCustomEventName {
  return AEVATAR_EVENT_NAMES.includes(name as AevatarCustomEventName);
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch Parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse multiple SSE data strings
 * Useful for processing buffered events
 */
export function parseAgUiEvents(dataList: string[]): AgUiEvent[] {
  return dataList
    .map(parseAgUiEvent)
    .filter((event): event is AgUiEvent => event !== null);
}

