/**
 * ============================================================================
 * AevatarKit Basic Demo
 * ============================================================================
 * Demonstrates the core features of @aevatar/kit SDK
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import {
  AevatarProvider,
  useSession,
  useRun,
  useProgress,
  ChatPanel,
  TimelineView,
  ConnectionStatus,
  ProgressBar,
} from '@aevatar/kit';

// ─────────────────────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────────────────────

export function App() {
  return (
    <AevatarProvider
      client={{
        baseUrl: 'http://localhost:4000',
        timeout: 30000,
        logger: { level: 'debug' },
      }}
      autoConnect={true}
    >
      <div className="app">
        <Header />
        <main className="main">
          <ChatSection />
          <SidePanel />
        </main>
      </div>
    </AevatarProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="header">
      <div className="header-title">
        <span className="logo">⚡</span>
        <h1>AevatarKit Demo</h1>
      </div>
      <ConnectionStatus showLabel />
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat Section
// ─────────────────────────────────────────────────────────────────────────────

function ChatSection() {
  const { session, createSession } = useSession();

  // Auto-create session on mount
  useEffect(() => {
    if (!session) {
      createSession().catch(console.error);
    }
  }, [session, createSession]);

  if (!session) {
    return (
      <div className="chat-section">
        <div className="loading-container">
          <div className="spinner" />
          <p>Creating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-section">
      <div className="chat-header">
        <h2>Chat</h2>
        <span className="session-id">Session: {session.id.slice(0, 8)}...</span>
      </div>
      <ChatPanel
        className="chat-panel"
        placeholder="Ask anything..."
        showLoading={true}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Side Panel
// ─────────────────────────────────────────────────────────────────────────────

function SidePanel() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'events'>('timeline');
  
  return (
    <div className="side-panel">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'timeline' ? <TimelinePanel /> : <EventsPanel />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Timeline Panel
// ─────────────────────────────────────────────────────────────────────────────

function TimelinePanel() {
  const { steps, isRunning } = useRun();
  const { isActive } = useProgress();

  return (
    <div className="timeline-panel">
      {isActive && (
        <div className="progress-section">
          <ProgressBar showLabel />
        </div>
      )}
      
      {steps.length > 0 ? (
        <TimelineView showDetails />
      ) : (
        <div className="empty-state">
          {isRunning ? (
            <>
              <div className="spinner" />
              <p>Starting...</p>
            </>
          ) : (
            <p>Send a message to see the execution timeline</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Events Panel
// ─────────────────────────────────────────────────────────────────────────────

function EventsPanel() {
  const { session } = useSession();
  const [events, setEvents] = useState<Array<{ type: string; timestamp: number }>>([]);

  useEffect(() => {
    if (!session) return;

    const unsubscribe = session.onEvent((event) => {
      setEvents((prev) => [
        { type: event.type, timestamp: event.timestamp || Date.now() },
        ...prev.slice(0, 49), // Keep last 50 events
      ]);
    });

    return unsubscribe;
  }, [session]);

  return (
    <div className="events-panel">
      {events.length > 0 ? (
        <div className="events-list">
          {events.map((event, index) => (
            <div key={`${event.timestamp}-${index}`} className="event-item">
              <span className="event-type">{event.type}</span>
              <span className="event-time">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No events yet</p>
        </div>
      )}
    </div>
  );
}

