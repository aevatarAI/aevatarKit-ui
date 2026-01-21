/**
 * ============================================================================
 * Pivot Extension Events
 * ============================================================================
 * Event names for research direction change (pivot) operations
 * These events track the lifecycle of pivot operations in Vibe Researching
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Pivot Event Value Types (for CUSTOM events)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Progress stages during pivot execution
 */
export type PivotStage =
  | 'CancellingPlans'
  | 'PreservingKnowledge'
  | 'NotifyingAgents'
  | 'UpdatingDag';

/**
 * Pivot detected event value (via CUSTOM)
 */
export interface AevatarPivotDetectedValue {
  sessionId: string;
  pivotId: string;
  detectedIntent: string;
  confidence: number;
  newTopic?: string;
  needsClarification: boolean;
  preserveAspects?: string[];
}

/**
 * Pivot started event value (via CUSTOM)
 */
export interface AevatarPivotStartedValue {
  sessionId: string;
  pivotId: string;
  oldDirection?: string;
  newDirection?: string;
}

/**
 * Pivot progress event value (via CUSTOM)
 */
export interface AevatarPivotProgressValue {
  sessionId: string;
  pivotId: string;
  stage: PivotStage;
  message: string;
  progress?: number;
}

/**
 * Pivot completed event value (via CUSTOM)
 */
export interface AevatarPivotCompletedValue {
  sessionId: string;
  pivotId: string;
  cancelledCount: number;
  preservedCount: number;
  newCount: number;
  durationMs?: number;
  summary?: string;
}

/**
 * Pivot error event value (via CUSTOM)
 */
export interface AevatarPivotErrorValue {
  sessionId: string;
  pivotId: string;
  errorMessage: string;
  errorCode?: string;
}

/**
 * Pivot clarification request event value (via CUSTOM)
 */
export interface AevatarPivotClarificationValue {
  sessionId: string;
  pivotId: string;
  question: string;
  suggestedTopic?: string;
  confidence: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pivot Custom Event Names (when sent via CUSTOM type)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Custom event names for pivot operations
 * Note: Backend may send these as typed events (PIVOT_*) or CUSTOM events
 */
export const PivotCustomEventNames = {
  DETECTED: 'aevatar.vibe.pivot_detected',
  STARTED: 'aevatar.vibe.pivot_initiated',
  PROGRESS: 'aevatar.vibe.pivot_progress',
  COMPLETED: 'aevatar.vibe.pivot_completed',
  ERROR: 'aevatar.vibe.pivot_error',
  CLARIFICATION: 'aevatar.vibe.pivot_clarification',
} as const;

export type PivotCustomEventName = typeof PivotCustomEventNames[keyof typeof PivotCustomEventNames];

