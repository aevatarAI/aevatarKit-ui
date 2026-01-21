/**
 * ============================================================================
 * AxiomReasoning × @aevatar/kit-protocol Demo
 * ============================================================================
 * Demonstrates NEW SDK features:
 * - Type-safe custom events via CustomEventMap<T>
 * - Batch event registration via router options
 * - bindMessageAggregation for TEXT_MESSAGE_* handling
 * - Rich connection callbacks (onReconnecting, onReconnectFailed)
 * - Connection metrics
 * ============================================================================
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createEventStream,
  createEventRouter,
  bindMessageAggregation,
  // NEW: Workflow event types
  parseDagConsensusNodeId,
  isConsensusReached,
  type EventStream,
  type StreamStatus,
  type CustomEventMap,
  type ErrorContext,
  type ConnectionMetrics,
  type WorkflowExecutionEventValue,
} from '@aevatar/kit-protocol';
import type { AgUiEvent, AgUiMessage } from '@aevatar/kit-types';
import { isMessagesSnapshotEvent } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types (Application-specific)
// ─────────────────────────────────────────────────────────────────────────────

interface AxiomConfig {
  axioms: string;
  goal: string;
  workflow: string;
  language: string;
  k: number;
  maxRounds: number;
  maxDepth: number;
}

interface ProgressInfo {
  phase?: string;
  progressPercent?: number;
  llmCalls?: number;
  totalTokens?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Type-safe Custom Events (NEW SDK FEATURE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Define custom event types for type safety
 * SDK now supports CustomEventMap<T> generics!
 */
interface AxiomCustomEvents extends CustomEventMap {
  'aevatar.axiom.progress': {
    phase: string;
    progressPercent: number;
    totalLlmCalls?: number;
    totalTokens?: number;
  };
  'aevatar.axiom.status_snapshot': {
    phase: string;
    progressPercent: number;
    totalLlmCalls?: number;
    totalTokens?: number;
  };
  'aevatar.axiom.theorem_found': {
    theorem: string;
    proof: string;
  };
  // NEW: Workflow execution events
  'aevatar.workflow.execution_event': WorkflowExecutionEventValue;
  'aevatar.llm.trace': WorkflowExecutionEventValue;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Config
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: AxiomConfig = {
  axioms: `A1: All humans are mortal
A2: Socrates is a human`,
  goal: 'Prove that Socrates is mortal using logical deduction.',
  workflow: 'direct',
  language: 'English',
  k: 3,
  maxRounds: 5,
  maxDepth: 50,
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hook (Using NEW SDK Features)
// ─────────────────────────────────────────────────────────────────────────────

interface DagConsensusInfo {
  stepId: string;
  isProposal: boolean;
  proposalIndex: number | null;
  consensusReached: boolean;
  voteRound?: number;
  voteK?: number;
  currentVotes?: number;
}

interface StreamState {
  events: AgUiEvent[];
  messages: AgUiMessage[];
  streamingText: string;
  isStreaming: boolean;
  runStatus: 'idle' | 'running' | 'completed' | 'error';
  progress: ProgressInfo;
  status: StreamStatus;
  metrics: ConnectionMetrics | null;
  reconnectInfo: { attempt: number; max: number; delay: number } | null;
  // NEW: DAG consensus tracking
  dagConsensus: DagConsensusInfo | null;
}

function useAgUiStream(url: string | null) {
  const [state, setState] = useState<StreamState>({
    events: [],
    messages: [],
    streamingText: '',
    isStreaming: false,
    runStatus: 'idle',
    progress: {},
    status: 'disconnected',
    metrics: null,
    reconnectInfo: null,
    dagConsensus: null,
  });

  const streamRef = useRef<EventStream<AxiomCustomEvents> | null>(null);

  useEffect(() => {
    if (!url) {
      setState((s) => ({ ...s, status: 'disconnected' }));
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Create router with batch registration (NEW SDK FEATURE)
    // ─────────────────────────────────────────────────────────────────────────
    const router = createEventRouter<AxiomCustomEvents>();

    // Bind message aggregation (NEW SDK FEATURE)
    const { unsubscribe: unbindMessages } = bindMessageAggregation(router, {
      onMessageStart: (messageId) => {
        console.log('[Message] Started:', messageId);
        setState((s) => ({ ...s, isStreaming: true, streamingText: '' }));
      },
      onMessageChunk: (_messageId, accumulated) => {
        setState((s) => ({ ...s, streamingText: accumulated }));
      },
      onMessageComplete: (messageId, fullContent) => {
        console.log('[Message] Complete:', messageId);
        setState((s) => ({
          ...s,
          isStreaming: false,
          streamingText: '',
          messages: [
            ...s.messages,
            { id: messageId, role: 'assistant', content: fullContent },
          ],
        }));
      },
    });

    // Batch register standard events (NEW SDK FEATURE)
    const unsubStandard = router.registerStandard({
      RUN_STARTED: () => {
        setState((s) => ({ ...s, runStatus: 'running' }));
      },
      RUN_FINISHED: () => {
        setState((s) => ({ ...s, runStatus: 'completed' }));
      },
      RUN_ERROR: () => {
        setState((s) => ({ ...s, runStatus: 'error' }));
      },
      MESSAGES_SNAPSHOT: (event) => {
        if (isMessagesSnapshotEvent(event)) {
          setState((s) => ({ ...s, messages: [...event.messages] }));
        }
      },
    });

    // Type-safe custom event handlers (NEW SDK FEATURE)
    // event.value is now typed as { phase: string; progressPercent: number; ... }
    const unsubProgress = router.onCustom('aevatar.axiom.progress', (event) => {
      setState((s) => ({
        ...s,
        progress: {
          phase: event.value.phase,
          progressPercent: event.value.progressPercent,
          llmCalls: event.value.totalLlmCalls,
          totalTokens: event.value.totalTokens,
        },
      }));
    });

    const unsubSnapshot = router.onCustom('aevatar.axiom.status_snapshot', (event) => {
      setState((s) => ({
        ...s,
        progress: {
          ...s.progress,
          phase: event.value.phase,
          progressPercent: event.value.progressPercent,
        },
      }));
    });

    // NEW: Handle workflow execution events with DAG consensus parsing
    const unsubWorkflow = router.onCustom('aevatar.workflow.execution_event', (event) => {
      const value = event.value;
      const parsed = parseDagConsensusNodeId(value.nodeId);
      
      if (parsed.isDagConsensus) {
        const consensusReached = isConsensusReached(value);
        setState((s) => ({
          ...s,
          dagConsensus: {
            stepId: parsed.stepId || value.nodeId,
            isProposal: parsed.isProposal,
            proposalIndex: parsed.proposalIndex,
            consensusReached,
            voteRound: value.fields.vote_round,
            voteK: value.fields.vote_k,
            currentVotes: value.fields.vote_current_votes,
          },
          progress: {
            ...s.progress,
            phase: value.phase,
            progressPercent: (value.fields.progress ?? 0) * 100,
            llmCalls: value.fields.llm_calls,
            totalTokens: value.fields.tokens_used,
          },
        }));
      }
    });

    // Collect all events for display
    router.onAny((event) => {
      setState((s) => ({ ...s, events: [...s.events, event] }));
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Create stream with rich callbacks (NEW SDK FEATURE)
    // ─────────────────────────────────────────────────────────────────────────
    const stream = createEventStream<AxiomCustomEvents>({
      url,
      autoReconnect: true,
      onStatusChange: (status) => {
        setState((s) => ({ ...s, status }));
      },
      // Rich error callback with context (NEW)
      onError: (error, context: ErrorContext) => {
        console.error('[Stream Error]', error.message);
        console.log('  Connection duration:', context.connectionDuration, 'ms');
        console.log('  Reconnect attempt:', context.reconnectAttempt);
      },
      // Reconnection callbacks (NEW)
      onReconnecting: (attempt, max, delay) => {
        console.log(`[Reconnecting] ${attempt}/${max} in ${delay}ms`);
        setState((s) => ({ ...s, reconnectInfo: { attempt, max, delay } }));
      },
      onReconnectFailed: (context) => {
        console.error('[Connection Lost] All reconnect attempts failed');
        console.log('  Last event ID:', context.lastEventId);
        setState((s) => ({ ...s, reconnectInfo: null }));
      },
      onReconnected: () => {
        console.log('[Reconnected] Successfully reconnected');
        setState((s) => ({ ...s, reconnectInfo: null }));
      },
    });

    streamRef.current = stream;

    // Route events through our router
    stream.onAny((event) => {
      router.route(event);
    });

    stream.connect();

    // Update metrics periodically
    const metricsInterval = setInterval(() => {
      setState((s) => ({ ...s, metrics: stream.getMetrics() }));
    }, 1000);

    return () => {
      clearInterval(metricsInterval);
      unbindMessages();
      unsubStandard();
      unsubProgress();
      unsubSnapshot();
      unsubWorkflow();
      stream.disconnect();
      streamRef.current = null;
    };
  }, [url]);

  return state;
}

// ─────────────────────────────────────────────────────────────────────────────
// App Component
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [config, setConfig] = useState<AxiomConfig>(DEFAULT_CONFIG);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<string[]>(['direct']);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'events' | 'metrics'>('messages');

  // SSE URL
  const sseUrl = sessionId ? `/api/sessions/${sessionId}/agui/events` : null;

  // Use enhanced stream hook
  const {
    events,
    messages,
    streamingText,
    isStreaming,
    runStatus,
    progress,
    status,
    metrics,
    reconnectInfo,
    dagConsensus,
  } = useAgUiStream(sseUrl);

  const isRunning = runStatus === 'running';

  // Load workflows
  useEffect(() => {
    fetch('/api/workflows')
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setWorkflows(data))
      .catch(() => {});
  }, []);

  const createAndRun = useCallback(async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          axioms: config.axioms,
          goal: config.goal,
          workflow: config.workflow,
          language: config.language,
          k: config.k,
          max_rounds: config.maxRounds,
          max_depth: config.maxDepth,
        }),
      });
      const data = await response.json();

      if (data.sessionId) {
        setSessionId(data.sessionId);
        await fetch(`/api/sessions/${data.sessionId}/run`, { method: 'POST' });
      }
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setIsCreating(false);
    }
  }, [config]);

  const isConnected = status === 'connected';

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <span className="icon">⚛️</span>
          <h1>AxiomReasoning × @aevatar/kit-protocol</h1>
          <span className="sdk-badge">SDK v1.2.0 Features</span>
        </div>
        <div className={`connection-badge ${isConnected ? '' : status === 'connecting' ? 'connecting' : 'error'}`}>
          <span className="dot" />
          {reconnectInfo
            ? `Reconnecting (${reconnectInfo.attempt}/${reconnectInfo.max})...`
            : status === 'connected'
              ? 'Connected'
              : status === 'connecting'
                ? 'Connecting...'
                : 'Disconnected'}
        </div>
      </header>

      <div className="main-content">
        <aside className="config-panel">
          <div className="config-section">
            <h3>Session Config</h3>
            <div className="form-group">
              <label>Axioms (one per line)</label>
              <textarea
                value={config.axioms}
                onChange={(e) => setConfig((c) => ({ ...c, axioms: e.target.value }))}
                placeholder="A1: First axiom&#10;A2: Second axiom"
                disabled={isRunning}
              />
            </div>
            <div className="form-group">
              <label>Goal</label>
              <textarea
                value={config.goal}
                onChange={(e) => setConfig((c) => ({ ...c, goal: e.target.value }))}
                placeholder="What to prove or derive"
                style={{ minHeight: '60px' }}
                disabled={isRunning}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Workflow</label>
                <select
                  value={config.workflow}
                  onChange={(e) => setConfig((c) => ({ ...c, workflow: e.target.value }))}
                  disabled={isRunning}
                >
                  {workflows.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Language</label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig((c) => ({ ...c, language: e.target.value }))}
                  disabled={isRunning}
                >
                  <option value="English">English</option>
                  <option value="中文">中文</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>K (voters)</label>
                <input
                  type="number"
                  value={config.k}
                  onChange={(e) => setConfig((c) => ({ ...c, k: parseInt(e.target.value) || 3 }))}
                  min={1}
                  max={10}
                  disabled={isRunning}
                />
              </div>
              <div className="form-group">
                <label>Max Rounds</label>
                <input
                  type="number"
                  value={config.maxRounds}
                  onChange={(e) => setConfig((c) => ({ ...c, maxRounds: parseInt(e.target.value) || 5 }))}
                  min={1}
                  max={100}
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>

          <div className="config-section">
            <h3>Actions</h3>
            <div className="button-row">
              <button
                className="btn btn-primary"
                onClick={createAndRun}
                disabled={isRunning || isCreating}
              >
                {isCreating ? 'Creating...' : isRunning ? 'Running...' : '▶ Create & Run'}
              </button>
            </div>
          </div>

          {sessionId && (
            <div className="config-section">
              <h3>Status</h3>
              <div className="status-bar">
                <div className="status-item">
                  <span className="label">Session:</span>
                  <span className="value">{sessionId.slice(0, 8)}...</span>
                </div>
                <div className="status-item">
                  <span className="label">Run:</span>
                  <span className="value">{runStatus}</span>
                </div>
              </div>
              {progress.progressPercent !== undefined && (
                <div className="status-bar">
                  <div className="status-item">
                    <span className="label">Progress:</span>
                    <span className="value">{progress.progressPercent}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress.progressPercent}%` }} />
                  </div>
                </div>
              )}
              {progress.phase && (
                <div className="status-bar">
                  <div className="status-item">
                    <span className="label">Phase:</span>
                    <span className="value">{progress.phase}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DAG Consensus Section (NEW) */}
          {dagConsensus && (
            <div className="config-section">
              <h3>🔄 DAG Consensus</h3>
              <div className="status-bar">
                <div className="status-item">
                  <span className="label">Step:</span>
                  <span className="value">{dagConsensus.stepId}</span>
                </div>
                {dagConsensus.voteRound !== undefined && (
                  <div className="status-item">
                    <span className="label">Vote:</span>
                    <span className="value">
                      {dagConsensus.currentVotes}/{dagConsensus.voteK} (round {dagConsensus.voteRound})
                    </span>
                  </div>
                )}
                <div className="status-item">
                  <span className="label">Consensus:</span>
                  <span className={`value ${dagConsensus.consensusReached ? 'success' : ''}`}>
                    {dagConsensus.consensusReached ? '✓ Reached' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SDK Features Section (NEW) */}
          <div className="config-section sdk-features">
            <h3>🆕 SDK Features Used</h3>
            <ul className="feature-list">
              <li>✅ Type-safe CustomEventMap&lt;T&gt;</li>
              <li>✅ bindMessageAggregation</li>
              <li>✅ registerStandard (batch)</li>
              <li>✅ onReconnecting / onReconnected</li>
              <li>✅ ErrorContext with metrics</li>
              <li>✅ getMetrics() for monitoring</li>
              <li>✅ WorkflowExecutionEventValue</li>
              <li>✅ parseDagConsensusNodeId</li>
              <li>✅ isConsensusReached</li>
            </ul>
          </div>
        </aside>

        <main className="event-panel">
          <div className="event-header">
            <h2>AG-UI Protocol Stream</h2>
            <div className="event-tabs">
              <button
                className={`event-tab ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                Messages
              </button>
              <button
                className={`event-tab ${activeTab === 'events' ? 'active' : ''}`}
                onClick={() => setActiveTab('events')}
              >
                Events ({events.length})
              </button>
              <button
                className={`event-tab ${activeTab === 'metrics' ? 'active' : ''}`}
                onClick={() => setActiveTab('metrics')}
              >
                Metrics
              </button>
            </div>
          </div>

          <div className="event-content">
            {activeTab === 'messages' ? (
              <div className="message-list">
                {messages.length === 0 && !isStreaming ? (
                  <div className="empty-state">
                    <span className="icon">💬</span>
                    <p>Click "Create & Run" to see streaming messages.</p>
                    <p className="hint">
                      Now using <code>bindMessageAggregation</code> for<br/>
                      automatic TEXT_MESSAGE_* handling!
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div key={msg.id} className={`message-item ${msg.role}`}>
                        <span className="role">{msg.role}</span>
                        <div className="content">{msg.content}</div>
                      </div>
                    ))}
                    {isStreaming && (
                      <div className="message-item assistant">
                        <span className="role">Streaming...</span>
                        <div className="content streaming">{streamingText}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : activeTab === 'events' ? (
              <div className="event-list">
                {events.length === 0 ? (
                  <div className="empty-state">
                    <span className="icon">📡</span>
                    <p>AG-UI events will appear here.</p>
                  </div>
                ) : (
                  events.slice(-50).map((event, i) => (
                    <div key={i} className="event-item">
                      <span className="type">{event.type}</span>
                      <pre className="data">
                        {JSON.stringify(event, null, 2).slice(0, 300)}
                        {JSON.stringify(event).length > 300 ? '...' : ''}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="metrics-panel">
                {metrics ? (
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-label">Status</div>
                      <div className={`metric-value status-${metrics.status}`}>
                        {metrics.status}
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Connect Attempts</div>
                      <div className="metric-value">{metrics.totalConnectAttempts}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Successful Connections</div>
                      <div className="metric-value">{metrics.successfulConnections}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Messages Received</div>
                      <div className="metric-value">{metrics.messagesReceived}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Last Connected</div>
                      <div className="metric-value">
                        {metrics.lastConnectedAt
                          ? new Date(metrics.lastConnectedAt).toLocaleTimeString()
                          : 'Never'}
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Last Error</div>
                      <div className="metric-value">
                        {metrics.lastErrorAt
                          ? new Date(metrics.lastErrorAt).toLocaleTimeString()
                          : 'None'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="icon">📊</span>
                    <p>Connection metrics will appear here.</p>
                    <p className="hint">
                      Using <code>stream.getMetrics()</code> (NEW)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
