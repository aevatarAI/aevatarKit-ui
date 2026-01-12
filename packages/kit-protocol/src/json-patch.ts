/**
 * ============================================================================
 * JSON Patch (RFC 6902)
 * ============================================================================
 * Standard JSON Patch implementation for STATE_DELTA event handling
 * @see https://datatracker.ietf.org/doc/html/rfc6902
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type JsonPatchOp = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';

export interface JsonPatchOperation {
  /** Operation type */
  op: JsonPatchOp;
  /** Target path (JSON Pointer, RFC 6901) */
  path: string;
  /** Value for add/replace/test operations */
  value?: unknown;
  /** Source path for move/copy operations */
  from?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Path Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse JSON Pointer path into segments
 * @example '/foo/bar/0' => ['foo', 'bar', '0']
 */
function parsePath(path: string): string[] {
  if (path === '' || path === '/') return [];
  if (!path.startsWith('/')) {
    throw new Error(`Invalid JSON Pointer: ${path}`);
  }
  return path
    .slice(1)
    .split('/')
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'));
}

/**
 * Get value at path in object
 */
function getValueAtPath(obj: unknown, segments: string[]): unknown {
  let current: unknown = obj;
  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (Array.isArray(current)) {
      const index = segment === '-' ? current.length : parseInt(segment, 10);
      current = current[index];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Set value at path in object (mutates)
 */
function setValueAtPath(obj: unknown, segments: string[], value: unknown): void {
  if (segments.length === 0) {
    throw new Error('Cannot set root value');
  }

  let current: unknown = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (Array.isArray(current)) {
      const index = parseInt(segment, 10);
      if (current[index] === undefined) {
        current[index] = {};
      }
      current = current[index];
    } else if (typeof current === 'object' && current !== null) {
      const record = current as Record<string, unknown>;
      if (record[segment] === undefined) {
        record[segment] = {};
      }
      current = record[segment];
    }
  }

  const lastSegment = segments[segments.length - 1];
  if (Array.isArray(current)) {
    const index = lastSegment === '-' ? current.length : parseInt(lastSegment, 10);
    current.splice(index, 0, value);
  } else if (typeof current === 'object' && current !== null) {
    (current as Record<string, unknown>)[lastSegment] = value;
  }
}

/**
 * Remove value at path in object (mutates)
 */
function removeValueAtPath(obj: unknown, segments: string[]): void {
  if (segments.length === 0) {
    throw new Error('Cannot remove root');
  }

  let current: unknown = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (Array.isArray(current)) {
      current = current[parseInt(segment, 10)];
    } else if (typeof current === 'object' && current !== null) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return;
    }
  }

  const lastSegment = segments[segments.length - 1];
  if (Array.isArray(current)) {
    const index = parseInt(lastSegment, 10);
    current.splice(index, 1);
  } else if (typeof current === 'object' && current !== null) {
    delete (current as Record<string, unknown>)[lastSegment];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Apply Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply a single JSON Patch operation (mutates target)
 */
function applyOperation(target: unknown, operation: JsonPatchOperation): void {
  const { op, path, value, from } = operation;
  const segments = parsePath(path);

  switch (op) {
    case 'add':
      setValueAtPath(target, segments, value);
      break;

    case 'remove':
      removeValueAtPath(target, segments);
      break;

    case 'replace':
      if (segments.length === 0) {
        throw new Error('Cannot replace root');
      }
      removeValueAtPath(target, segments);
      setValueAtPath(target, segments, value);
      break;

    case 'move': {
      if (!from) throw new Error('move operation requires "from"');
      const fromSegments = parsePath(from);
      const moveValue = getValueAtPath(target, fromSegments);
      removeValueAtPath(target, fromSegments);
      setValueAtPath(target, segments, moveValue);
      break;
    }

    case 'copy': {
      if (!from) throw new Error('copy operation requires "from"');
      const copyValue = getValueAtPath(target, parsePath(from));
      setValueAtPath(target, segments, structuredClone(copyValue));
      break;
    }

    case 'test': {
      const testValue = getValueAtPath(target, segments);
      if (JSON.stringify(testValue) !== JSON.stringify(value)) {
        throw new Error(`Test failed at path ${path}`);
      }
      break;
    }

    default:
      throw new Error(`Unknown operation: ${op}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply JSON Patch operations to an object
 * Returns a new object with the patch applied (immutable)
 *
 * @example
 * const state = { count: 0, items: [] }
 * const newState = applyJsonPatch(state, [
 *   { op: 'replace', path: '/count', value: 1 },
 *   { op: 'add', path: '/items/-', value: 'item1' }
 * ])
 * // newState = { count: 1, items: ['item1'] }
 */
export function applyJsonPatch<T>(
  target: T,
  operations: JsonPatchOperation[]
): T {
  // Deep clone to ensure immutability
  const result = structuredClone(target);

  for (const operation of operations) {
    try {
      applyOperation(result, operation);
    } catch (error) {
      console.error(`[JsonPatch] Operation failed:`, operation, error);
      // Continue with other operations (lenient mode)
    }
  }

  return result;
}

/**
 * Apply JSON Patch operations (mutates original object)
 * Use this only when performance is critical
 */
export function applyJsonPatchMutable<T>(
  target: T,
  operations: JsonPatchOperation[]
): T {
  for (const operation of operations) {
    try {
      applyOperation(target, operation);
    } catch (error) {
      console.error(`[JsonPatch] Operation failed:`, operation, error);
    }
  }
  return target;
}

/**
 * Validate JSON Patch operations
 * Returns true if all operations are valid format
 */
export function validateJsonPatch(operations: unknown[]): operations is JsonPatchOperation[] {
  if (!Array.isArray(operations)) return false;

  const validOps = ['add', 'remove', 'replace', 'move', 'copy', 'test'];

  return operations.every((op) => {
    if (typeof op !== 'object' || op === null) return false;
    const { op: opType, path } = op as { op?: string; path?: string };
    return (
      typeof opType === 'string' &&
      validOps.includes(opType) &&
      typeof path === 'string'
    );
  });
}

