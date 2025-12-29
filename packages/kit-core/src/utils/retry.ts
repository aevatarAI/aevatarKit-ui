/**
 * ============================================================================
 * Retry Manager
 * ============================================================================
 */

import type { RetryOptions } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RetryManager {
  /** Execute with retry */
  execute<T>(fn: () => Promise<T>): Promise<T>;
  
  /** Reset retry count */
  reset(): void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export function createRetryManager(options?: RetryOptions): RetryManager {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    retryOnStatus = [408, 429, 500, 502, 503, 504],
  } = options ?? {};

  let attempts = 0;

  async function execute<T>(fn: () => Promise<T>): Promise<T> {
    while (true) {
      try {
        const result = await fn();
        attempts = 0; // Reset on success
        return result;
      } catch (error) {
        attempts++;
        
        if (attempts >= maxRetries) {
          attempts = 0;
          throw error;
        }

        // Check if error is retryable
        if (error instanceof Error && 'status' in error) {
          const status = (error as Error & { status: number }).status;
          if (!retryOnStatus.includes(status)) {
            throw error;
          }
        }

        // Calculate delay with exponential backoff + jitter
        const delay = Math.min(
          initialDelayMs * Math.pow(backoffMultiplier, attempts - 1) + Math.random() * 1000,
          maxDelayMs
        );

        await sleep(delay);
      }
    }
  }

  function reset(): void {
    attempts = 0;
  }

  return { execute, reset };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

