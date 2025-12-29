/**
 * ============================================================================
 * Worker Extension Events
 * ============================================================================
 * Event names: aevatar.worker_started, aevatar.worker_completed, aevatar.task_decomposed
 * ============================================================================
 */

export interface AevatarWorkerStartedEvent {
  /** Worker ID */
  workerId: string;
  
  /** Task ID assigned to worker */
  taskId: string;
  
  /** Task description */
  taskDescription?: string;
  
  /** Worker index in pool */
  workerIndex?: number;
  
  /** Total workers in pool */
  totalWorkers?: number;
}

export interface AevatarWorkerCompletedEvent {
  /** Worker ID */
  workerId: string;
  
  /** Task ID */
  taskId: string;
  
  /** Task result */
  result: unknown;
  
  /** Execution time in milliseconds */
  executionTimeMs?: number;
  
  /** Tokens used */
  tokensUsed?: number;
  
  /** Whether task succeeded */
  success: boolean;
  
  /** Error message if failed */
  error?: string;
}

export interface AevatarTaskDecomposedEvent {
  /** Parent task ID */
  parentTaskId: string;
  
  /** Decomposed sub-tasks */
  subTasks: SubTask[];
  
  /** Decomposition depth */
  depth: number;
  
  /** Decomposition strategy used */
  strategy?: string;
}

export interface SubTask {
  id: string;
  description: string;
  priority?: number;
  dependencies?: string[];
  estimatedComplexity?: number;
}

