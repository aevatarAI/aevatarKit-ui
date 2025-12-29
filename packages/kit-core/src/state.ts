/**
 * ============================================================================
 * State Store
 * ============================================================================
 * Manages session state with snapshot/delta support
 * ============================================================================
 */

import type { SessionState, JsonPatchOperation, Unsubscribe } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StateStore {
  /** Get current state */
  getState(): SessionState;
  
  /** Set full state snapshot */
  setSnapshot(snapshot: Record<string, unknown>): void;
  
  /** Apply JSON Patch delta */
  applyDelta(delta: JsonPatchOperation[]): void;
  
  /** Subscribe to state changes */
  subscribe(callback: (state: SessionState) => void): Unsubscribe;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export function createStateStore(initialState?: SessionState): StateStore {
  let state: SessionState = initialState ?? {
    status: 'idle',
    customState: {},
  };
  
  const listeners = new Set<(state: SessionState) => void>();

  function notify(): void {
    listeners.forEach((cb) => cb(state));
  }

  function getState(): SessionState {
    return state;
  }

  function setSnapshot(snapshot: Record<string, unknown>): void {
    state = {
      ...state,
      customState: snapshot,
    };
    notify();
  }

  function applyDelta(delta: JsonPatchOperation[]): void {
    const newCustomState = { ...state.customState };
    
    for (const op of delta) {
      applyOperation(newCustomState, op);
    }
    
    state = {
      ...state,
      customState: newCustomState,
    };
    notify();
  }

  function subscribe(callback: (state: SessionState) => void): Unsubscribe {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  return {
    getState,
    setSnapshot,
    applyDelta,
    subscribe,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON Patch Operations (RFC 6902)
// ─────────────────────────────────────────────────────────────────────────────

function applyOperation(obj: Record<string, unknown>, op: JsonPatchOperation): void {
  const pathParts = op.path.split('/').filter(Boolean);
  
  if (pathParts.length === 0) {
    // Root operation
    if (op.op === 'replace' && typeof op.value === 'object') {
      Object.assign(obj, op.value);
    }
    return;
  }

  const key = pathParts[pathParts.length - 1];
  const parent = getParent(obj, pathParts.slice(0, -1));
  
  if (!parent || typeof parent !== 'object') return;

  switch (op.op) {
    case 'add':
    case 'replace':
      (parent as Record<string, unknown>)[key] = op.value;
      break;
    case 'remove':
      delete (parent as Record<string, unknown>)[key];
      break;
    case 'move':
      if (op.from) {
        const fromParts = op.from.split('/').filter(Boolean);
        const fromKey = fromParts[fromParts.length - 1];
        const fromParent = getParent(obj, fromParts.slice(0, -1));
        if (fromParent && typeof fromParent === 'object') {
          (parent as Record<string, unknown>)[key] = (fromParent as Record<string, unknown>)[fromKey];
          delete (fromParent as Record<string, unknown>)[fromKey];
        }
      }
      break;
    case 'copy':
      if (op.from) {
        const fromParts = op.from.split('/').filter(Boolean);
        const fromKey = fromParts[fromParts.length - 1];
        const fromParent = getParent(obj, fromParts.slice(0, -1));
        if (fromParent && typeof fromParent === 'object') {
          (parent as Record<string, unknown>)[key] = structuredClone(
            (fromParent as Record<string, unknown>)[fromKey]
          );
        }
      }
      break;
    case 'test':
      // Test operation - just verify (no mutation)
      break;
  }
}

function getParent(obj: Record<string, unknown>, pathParts: string[]): unknown {
  let current: unknown = obj;
  
  for (const part of pathParts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  
  return current;
}

