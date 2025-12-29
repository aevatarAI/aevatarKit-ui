/**
 * ============================================================================
 * Run Manager
 * ============================================================================
 * Manages run execution and lifecycle
 * ============================================================================
 */

import type {
  Run,
  RunStatus,
  RunInput,
  StepInfo,
  RunMetrics,
  AgUiEvent,
  Unsubscribe,
} from '@aevatar/kit-types';
import type { Logger } from './utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RunManagerOptions {
  baseUrl: string;
  apiKey?: string;
  sessionId: string;
  logger: Logger;
}

export interface RunManager {
  /** Start a new run */
  start(input?: RunInput): Promise<RunInstance>;
  
  /** Get run by ID */
  get(runId: string): Promise<Run | null>;
}

export interface RunInstance {
  /** Run ID */
  readonly id: string;
  
  /** Session ID */
  readonly sessionId: string;
  
  /** Current status */
  readonly status: RunStatus;
  
  /** Steps executed */
  readonly steps: StepInfo[];
  
  /** Run metrics */
  readonly metrics: RunMetrics;
  
  /** Final result */
  readonly result: unknown | null;
  
  /** Error if failed */
  readonly error: string | null;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Operations
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Stop the run */
  stop(): Promise<void>;
  
  /** Wait for completion */
  wait(): Promise<Run>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Subscriptions
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Subscribe to step updates */
  onStepChange(callback: (step: StepInfo) => void): Unsubscribe;
  
  /** Subscribe to status changes */
  onStatusChange(callback: (status: RunStatus) => void): Unsubscribe;
  
  /** Subscribe to all events */
  onEvent(callback: (event: AgUiEvent) => void): Unsubscribe;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export function createRunManager(options: RunManagerOptions): RunManager {
  const { baseUrl, apiKey, sessionId, logger } = options;

  async function start(input?: RunInput): Promise<RunInstance> {
    const response = await fetch(`${baseUrl}/api/sessions/${sessionId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(input ?? {}),
    });

    if (!response.ok) {
      throw new Error(`Failed to start run: ${response.statusText}`);
    }

    const runData = await response.json() as Run;
    logger.info('Run started', { runId: runData.id, sessionId });
    
    return createRunInstance(runData, { baseUrl, apiKey, logger });
  }

  async function get(runId: string): Promise<Run | null> {
    const response = await fetch(`${baseUrl}/api/runs/${runId}`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });

    if (!response.ok) return null;
    return response.json() as Promise<Run>;
  }

  return { start, get };
}

// ─────────────────────────────────────────────────────────────────────────────
// Run Instance Implementation
// ─────────────────────────────────────────────────────────────────────────────

interface RunInstanceOptions {
  baseUrl: string;
  apiKey?: string;
  logger: Logger;
}

function createRunInstance(data: Run, options: RunInstanceOptions): RunInstance {
  const { baseUrl, apiKey, logger } = options;
  
  const steps: StepInfo[] = [...(data.steps ?? [])];
  const stepListeners = new Set<(step: StepInfo) => void>();
  const statusListeners = new Set<(status: RunStatus) => void>();
  const eventListeners = new Set<(event: AgUiEvent) => void>();
  
  let status: RunStatus = data.status;
  let metrics: RunMetrics = data.metrics;
  let result: unknown | null = data.result ?? null;
  let error: string | null = data.error ?? null;

  // ───────────────────────────────────────────────────────────────────────────
  // Internal State Updates
  // ───────────────────────────────────────────────────────────────────────────

  function setStatus(newStatus: RunStatus): void {
    if (status !== newStatus) {
      status = newStatus;
      statusListeners.forEach((cb) => cb(status));
    }
  }

  // Internal: Update step info (called by event handlers)
  function _updateStep(stepInfo: StepInfo): void {
    const index = steps.findIndex((s) => s.id === stepInfo.id);
    if (index >= 0) {
      steps[index] = stepInfo;
    } else {
      steps.push(stepInfo);
    }
    stepListeners.forEach((cb) => cb(stepInfo));
  }

  // Expose for internal use
  void _updateStep;

  // ───────────────────────────────────────────────────────────────────────────
  // Public API
  // ───────────────────────────────────────────────────────────────────────────

  async function stop(): Promise<void> {
    await fetch(`${baseUrl}/api/runs/${data.id}/stop`, {
      method: 'POST',
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });
    setStatus('cancelled');
    logger.info('Run stopped', { runId: data.id });
  }

  async function wait(): Promise<Run> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(async () => {
        const response = await fetch(`${baseUrl}/api/runs/${data.id}`, {
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        });

        if (!response.ok) {
          clearInterval(checkInterval);
          reject(new Error('Failed to fetch run status'));
          return;
        }

        const runData = await response.json() as Run;
        
        if (runData.status === 'completed' || runData.status === 'failed' || runData.status === 'cancelled') {
          clearInterval(checkInterval);
          status = runData.status;
          result = runData.result ?? null;
          error = runData.error ?? null;
          metrics = runData.metrics;
          resolve(runData);
        }
      }, 1000);
    });
  }

  function onStepChange(callback: (step: StepInfo) => void): Unsubscribe {
    stepListeners.add(callback);
    return () => stepListeners.delete(callback);
  }

  function onStatusChange(callback: (status: RunStatus) => void): Unsubscribe {
    statusListeners.add(callback);
    return () => statusListeners.delete(callback);
  }

  function onEvent(callback: (event: AgUiEvent) => void): Unsubscribe {
    eventListeners.add(callback);
    return () => eventListeners.delete(callback);
  }

  return {
    get id() {
      return data.id;
    },
    get sessionId() {
      return data.sessionId;
    },
    get status() {
      return status;
    },
    get steps() {
      return [...steps];
    },
    get metrics() {
      return metrics;
    },
    get result() {
      return result;
    },
    get error() {
      return error;
    },
    stop,
    wait,
    onStepChange,
    onStatusChange,
    onEvent,
  };
}

