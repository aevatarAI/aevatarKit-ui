/**
 * ============================================================================
 * Progress Extension Event
 * ============================================================================
 * Event name: aevatar.progress
 * ============================================================================
 */

import type { StepStatus } from '@aevatar/kit-types';

export interface AevatarProgressEvent {
  /** Current phase name */
  phase: string;
  
  /** Step ID */
  stepId: string;
  
  /** Step type (e.g., 'llm_call', 'tool_call', 'vote') */
  stepType: string;
  
  /** Step status */
  stepStatus: StepStatus;
  
  /** Progress percentage (0-100) */
  progressPercent: number;
  
  /** Worker ID if applicable */
  workerId?: string;
  
  /** Human-readable message */
  message?: string;
  
  /** Current iteration number */
  iteration?: number;
  
  /** Total iterations expected */
  totalIterations?: number;
}

