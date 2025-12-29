/**
 * ============================================================================
 * Aevatar Extension Event Types
 * ============================================================================
 */

import type { AevatarProgressEvent } from './progress';
import type { AevatarGraphEvent } from './graph';
import type { AevatarVotingEvent, AevatarConsensusEvent } from './voting';
import type { AevatarWorkerStartedEvent, AevatarWorkerCompletedEvent, AevatarTaskDecomposedEvent } from './worker';

// ─────────────────────────────────────────────────────────────────────────────
// Event Name Union
// ─────────────────────────────────────────────────────────────────────────────

export type AevatarCustomEventName =
  | 'aevatar.progress'
  | 'aevatar.graph'
  | 'aevatar.voting'
  | 'aevatar.consensus'
  | 'aevatar.task_decomposed'
  | 'aevatar.worker_started'
  | 'aevatar.worker_completed';

// ─────────────────────────────────────────────────────────────────────────────
// Event Type Map
// ─────────────────────────────────────────────────────────────────────────────

export interface AevatarCustomEventMap {
  'aevatar.progress': AevatarProgressEvent;
  'aevatar.graph': AevatarGraphEvent;
  'aevatar.voting': AevatarVotingEvent;
  'aevatar.consensus': AevatarConsensusEvent;
  'aevatar.task_decomposed': AevatarTaskDecomposedEvent;
  'aevatar.worker_started': AevatarWorkerStartedEvent;
  'aevatar.worker_completed': AevatarWorkerCompletedEvent;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic Custom Event Type
// ─────────────────────────────────────────────────────────────────────────────

export type AevatarCustomEvent<T extends AevatarCustomEventName> = AevatarCustomEventMap[T];

