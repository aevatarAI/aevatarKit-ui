/**
 * ============================================================================
 * Axiom Reasoning Adapter
 * ============================================================================
 * Backend adapter for Aevatar Axiom Reasoning Service
 * 
 * API Differences from Default:
 * - POST /api/sessions requires { axioms, goal, workflow? } in body
 * - POST /api/sessions/:id/run (singular, not /runs)
 * - GET /api/sessions/:id/agui/events (not /events)
 * ============================================================================
 */

import type {
  Session,
  SessionSummary,
  CreateSessionOptions,
  Run,
  RunSummary,
  RunInput,
} from '@aevatar/kit-types';
import {
  type BackendAdapter,
  type AdapterOptions,
  createFetchHelper,
} from '../adapter';

// ─────────────────────────────────────────────────────────────────────────────
// Axiom-Specific Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AxiomSessionOptions extends CreateSessionOptions {
  /** Axiom definitions */
  axioms: AxiomDefinition[];

  /** Goal statement */
  goal: string;

  /** Workflow type */
  workflow?: 'sequential' | 'parallel' | 'adaptive';

  /** Max reasoning depth */
  maxDepth?: number;

  /** Timeout in seconds */
  timeout?: number;
}

export interface AxiomDefinition {
  /** Axiom ID */
  id: string;

  /** Axiom content */
  content: string;

  /** Axiom type */
  type?: 'fact' | 'rule' | 'constraint';

  /** Confidence score */
  confidence?: number;
}

export interface AxiomAdapterOptions extends AdapterOptions {
  /** Default axioms to include in all sessions */
  defaultAxioms?: AxiomDefinition[];

  /** Default workflow */
  defaultWorkflow?: 'sequential' | 'parallel' | 'adaptive';
}

// ─────────────────────────────────────────────────────────────────────────────
// Axiom Reasoning Adapter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create Axiom Reasoning backend adapter
 * 
 * @example
 * ```ts
 * const adapter = createAxiomAdapter({
 *   baseUrl: 'http://localhost:5001',
 *   defaultWorkflow: 'adaptive',
 * });
 * 
 * const client = createAevatarClient({
 *   baseUrl: 'http://localhost:5001',
 *   adapter,
 * });
 * 
 * // Create session with axioms
 * const session = await client.createSession({
 *   axioms: [
 *     { id: 'a1', content: 'All humans are mortal', type: 'fact' },
 *     { id: 'a2', content: 'Socrates is human', type: 'fact' },
 *   ],
 *   goal: 'Determine if Socrates is mortal',
 * });
 * ```
 */
export function createAxiomAdapter(options: AxiomAdapterOptions): BackendAdapter {
  const { baseUrl, defaultAxioms = [], defaultWorkflow = 'adaptive' } = options;
  const fetchApi = createFetchHelper(options);

  return {
    name: 'axiom-reasoning',

    // ─────────────────────────────────────────────────────────────────────────
    // Health Check
    // ─────────────────────────────────────────────────────────────────────────

    async healthCheck(): Promise<void> {
      await fetchApi('/api/health');
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Sessions - Axiom-specific implementation
    // ─────────────────────────────────────────────────────────────────────────

    async createSession(opts?: CreateSessionOptions): Promise<Session> {
      const axiomOpts = opts as AxiomSessionOptions | undefined;

      // Validate required fields for Axiom backend
      if (!axiomOpts?.axioms || axiomOpts.axioms.length === 0) {
        if (defaultAxioms.length === 0) {
          throw new Error(
            '[AxiomAdapter] createSession requires "axioms" array. ' +
            'Either provide axioms in options or set defaultAxioms in adapter config.'
          );
        }
      }

      if (!axiomOpts?.goal) {
        throw new Error(
          '[AxiomAdapter] createSession requires "goal" string.'
        );
      }

      // Extract known fields, spread rest
      const { axioms, goal, workflow, maxDepth, timeout, ...rest } = axiomOpts;
      
      const body = {
        ...rest,
        axioms: axioms ?? defaultAxioms,
        goal,
        workflow: workflow ?? defaultWorkflow,
        maxDepth,
        timeout,
      };

      return fetchApi<Session>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    async getSession(sessionId: string): Promise<Session | null> {
      return fetchApi<Session>(`/api/sessions/${sessionId}`).catch(() => null);
    },

    async listSessions(): Promise<SessionSummary[]> {
      return fetchApi<SessionSummary[]>('/api/sessions');
    },

    async deleteSession(sessionId: string): Promise<void> {
      await fetchApi(`/api/sessions/${sessionId}`, { method: 'DELETE' });
    },

    // Axiom uses /agui/events path
    getEventStreamUrl(sessionId: string): string {
      return `${baseUrl}/api/sessions/${sessionId}/agui/events`;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Runs - Axiom uses /run (singular)
    // ─────────────────────────────────────────────────────────────────────────

    async startRun(sessionId: string, input?: RunInput): Promise<Run> {
      // Axiom uses /run (singular), not /runs (plural)
      return fetchApi<Run>(`/api/sessions/${sessionId}/run`, {
        method: 'POST',
        body: JSON.stringify(input ?? {}),
      });
    },

    async getRun(runId: string): Promise<Run | null> {
      return fetchApi<Run>(`/api/runs/${runId}`).catch(() => null);
    },

    async listRuns(sessionId: string): Promise<RunSummary[]> {
      return fetchApi<RunSummary[]>(`/api/sessions/${sessionId}/runs`);
    },

    async stopRun(runId: string): Promise<void> {
      await fetchApi(`/api/runs/${runId}/stop`, { method: 'POST' });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Axiom doesn't support these - return empty
    // ─────────────────────────────────────────────────────────────────────────
  };
}


