/**
 * ============================================================================
 * AxiomReasoning × @aevatar/kit-protocol Demo
 * ============================================================================
 * Demonstrates using kit-protocol as pure protocol layer:
 * - kit-protocol handles AG-UI protocol (SSE parsing, event types)
 * - App handles business logic (Axioms, Goal, Session creation)
 * ============================================================================
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  createEventStream,
  type EventStream,
  type StreamStatus,
} from '@aevatar/kit-protocol';
import type {
  AgUiEvent,
  AgUiMessage,
} from '@aevatar/kit-types';
import {
  isTextMessageStartEvent,
  isTextMessageContentEvent,
  isTextMessageEndEvent,
  isMessagesSnapshotEvent,
  isCustomEvent,
} from '@aevatar/kit-types';

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
// Custom Hooks (Using kit-protocol)
// ─────────────────────────────────────────────────────────────────────────────

function useAgUiStream(url: string | null) {
  const [events, setEvents] = useState<AgUiEvent[]>([]);
  const [status, setStatus] = useState<StreamStatus>('disconnected');
  const streamRef = useRef<EventStream | null>(null);

  useEffect(() => {
    if (!url) {
      setStatus('disconnected');
      return;
    }

    const stream = createEventStream({
      url,
      autoReconnect: true,
      onStatusChange: setStatus,
    });

    streamRef.current = stream;

    // Collect all events
    stream.onAny((event) => {
      setEvents((prev) => [...prev, event]);
    });

    stream.connect();

    return () => {
      stream.disconnect();
      streamRef.current = null;
    };
  }, [url]);

  return { events, status, stream: streamRef.current };
}

function useAgUiMessages(events: AgUiEvent[]) {
  return useMemo(() => {
    let messages: AgUiMessage[] = [];
    let streamingText = '';
    let streamingMessageId: string | null = null;
    let currentRole: 'user' | 'assistant' | 'system' | 'tool' = 'assistant';

    for (const event of events) {
      if (isMessagesSnapshotEvent(event)) {
        messages = [...event.messages];
        continue;
      }

      if (isTextMessageStartEvent(event)) {
        streamingMessageId = event.messageId;
        streamingText = '';
        currentRole = event.role ?? 'assistant';
        continue;
      }

      if (isTextMessageContentEvent(event)) {
        if (event.messageId === streamingMessageId) {
          streamingText += event.delta;
        }
        continue;
      }

      if (isTextMessageEndEvent(event)) {
        if (event.messageId === streamingMessageId) {
          messages.push({
            id: streamingMessageId,
            role: currentRole,
            content: streamingText,
          });
          streamingMessageId = null;
          streamingText = '';
        }
        continue;
      }
    }

    return {
      messages,
      streamingText,
      isStreaming: streamingMessageId !== null,
    };
  }, [events]);
}

function useAgUiRun(events: AgUiEvent[]) {
  return useMemo(() => {
    let runStatus: 'idle' | 'running' | 'completed' | 'error' = 'idle';
    let runId: string | null = null;

    for (const event of events) {
      if (event.type === 'RUN_STARTED') {
        runStatus = 'running';
        runId = event.runId ?? null;
      }
      if (event.type === 'RUN_FINISHED') {
        runStatus = 'completed';
      }
      if (event.type === 'RUN_ERROR') {
        runStatus = 'error';
      }
    }

    return { runStatus, runId, isRunning: runStatus === 'running' };
  }, [events]);
}

function useAgUiProgress(events: AgUiEvent[]): ProgressInfo {
  return useMemo(() => {
    let progress: ProgressInfo = {};

    for (const event of events) {
      if (isCustomEvent(event)) {
        if (event.name === 'aevatar.axiom.progress' || event.name === 'aevatar.axiom.status_snapshot') {
          const value = event.value as Record<string, unknown>;
          progress = {
            phase: (value.phase as string) ?? progress.phase,
            progressPercent: (value.progressPercent as number) ?? progress.progressPercent,
            llmCalls: (value.totalLlmCalls as number) ?? progress.llmCalls,
            totalTokens: (value.totalTokens as number) ?? progress.totalTokens,
          };
        }
      }
    }

    return progress;
  }, [events]);
}

// ─────────────────────────────────────────────────────────────────────────────
// App Component
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [config, setConfig] = useState<AxiomConfig>(DEFAULT_CONFIG);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<string[]>(['direct']);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'events'>('messages');

  // SSE URL - WE decide the format, kit-protocol just connects
  const sseUrl = sessionId ? `/api/sessions/${sessionId}/agui/events` : null;

  // Use kit-protocol hooks
  const { events, status } = useAgUiStream(sseUrl);
  const { messages, streamingText, isStreaming } = useAgUiMessages(events);
  const { runStatus, isRunning } = useAgUiRun(events);
  const progress = useAgUiProgress(events);

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
        </div>
        <div className={`connection-badge ${isConnected ? '' : status === 'connecting' ? 'connecting' : 'error'}`}>
          <span className="dot" />
          {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}
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
        </aside>

        <main className="event-panel">
          <div className="event-header">
            <h2>AG-UI Protocol Stream (via kit-protocol)</h2>
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
                      Using <code>@aevatar/kit-protocol</code>:<br/>
                      <code>createEventStream</code>, <code>parseAgUiEvent</code>
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
            ) : (
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
