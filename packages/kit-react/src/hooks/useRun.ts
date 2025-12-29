/**
 * ============================================================================
 * useRun Hook
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import type { RunInstance } from '@aevatar/kit-core';
import type { RunStatus, StepInfo, RunMetrics } from '@aevatar/kit-types';
import { useAevatar } from './useAevatar';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UseRunResult {
  /** Current run */
  run: RunInstance | null;
  
  /** Run status */
  status: RunStatus | null;
  
  /** Steps */
  steps: StepInfo[];
  
  /** Metrics */
  metrics: RunMetrics | null;
  
  /** Result */
  result: unknown | null;
  
  /** Error */
  error: string | null;
  
  /** Whether run is in progress */
  isRunning: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useRun(): UseRunResult {
  const { activeSession } = useAevatar();
  const run = activeSession?.currentRun ?? null;

  const [status, setStatus] = useState<RunStatus | null>(run?.status ?? null);
  const [steps, setSteps] = useState<StepInfo[]>(run?.steps ?? []);
  const [metrics, setMetrics] = useState<RunMetrics | null>(run?.metrics ?? null);
  const [result, setResult] = useState<unknown | null>(run?.result ?? null);
  const [error, setError] = useState<string | null>(run?.error ?? null);

  // Subscribe to run updates
  useEffect(() => {
    if (!run) {
      setStatus(null);
      setSteps([]);
      setMetrics(null);
      setResult(null);
      setError(null);
      return;
    }

    setStatus(run.status);
    setSteps(run.steps ?? []);
    setMetrics(run.metrics);
    setResult(run.result);
    setError(run.error);

    const unsubStatus = run.onStatusChange(setStatus);
    const unsubStep = run.onStepChange((step) => {
      setSteps((prev) => {
        const index = prev.findIndex((s) => s.id === step.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = step;
          return next;
        }
        return [...prev, step];
      });
    });

    return () => {
      unsubStatus();
      unsubStep();
    };
  }, [run]);

  return {
    run,
    status,
    steps,
    metrics,
    result,
    error,
    isRunning: status === 'running',
  };
}

