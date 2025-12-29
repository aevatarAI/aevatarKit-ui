# @aevatar/kit-react

> React components and hooks for AevatarKit SDK

## Overview

This package provides React bindings for the AevatarKit SDK, including a context provider, hooks for state management, and pre-built UI components.

## Installation

```bash
pnpm add @aevatar/kit-react
```

## Features

- 🎣 **Hooks** - React hooks for all SDK functionality
- 🎨 **Components** - Pre-built Chat, Timeline, and common UI
- 🔄 **Context** - Global state management via React Context
- 💅 **Themeable** - CSS variables for customization

## Quick Start

```tsx
import {
  AevatarProvider,
  useSession,
  ChatPanel,
} from '@aevatar/kit-react';

function App() {
  return (
    <AevatarProvider client={{ baseUrl: 'http://localhost:5001' }}>
      <ChatView />
    </AevatarProvider>
  );
}

function ChatView() {
  const { session, createSession } = useSession();
  
  useEffect(() => {
    createSession();
  }, []);
  
  return <ChatPanel placeholder="Type a message..." />;
}
```

## Context

### AevatarProvider

Wraps your app and provides SDK context:

```tsx
import { AevatarProvider } from '@aevatar/kit-react';

function App() {
  return (
    <AevatarProvider
      client={{
        baseUrl: 'http://localhost:5001',
        apiKey: 'optional',
        timeout: 30000,
      }}
      autoConnect={true}
    >
      {children}
    </AevatarProvider>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `client` | `ClientOptions \| AevatarClient` | required | Client config or instance |
| `autoConnect` | `boolean` | `true` | Auto-connect on mount |
| `children` | `ReactNode` | required | Child components |

## Hooks

### useAevatar

Access the root context:

```tsx
const {
  client,
  connectionStatus,
  activeSession,
  setActiveSession,
  isReady,
  error,
} = useAevatar();
```

### useSession

Session management:

```tsx
const {
  session,           // SessionInstance | null
  state,             // SessionState | null
  messages,          // AgUiMessage[]
  isLoading,         // boolean
  createSession,     // (options?) => Promise<SessionInstance>
  sendMessage,       // (content: string) => Promise<void>
  closeSession,      // () => Promise<void>
} = useSession();

// Create session
await createSession({ config: { agentId: 'my-agent' } });

// Send message
await sendMessage('Hello!');
```

### useRun

Run execution:

```tsx
const {
  run,        // RunInstance | null
  status,     // RunStatus | null
  steps,      // StepInfo[]
  isRunning,  // boolean
  startRun,   // (input?) => Promise<RunInstance>
  stopRun,    // () => Promise<void>
} = useRun();
```

### useMessages

Message streaming:

```tsx
const {
  messages,           // AgUiMessage[]
  streamingMessage,   // { id: string, content: string } | null
  isStreaming,        // boolean
} = useMessages();

// Render messages
messages.map((msg) => (
  <div key={msg.id} className={msg.role}>
    {msg.content}
  </div>
));

// Show streaming indicator
{isStreaming && <span>Typing...</span>}
```

### useEventStream

Raw event access:

```tsx
const {
  latestEvent,  // AgUiEvent | null
  events,       // AgUiEvent[] (last 100)
  subscribe,    // (callback) => Unsubscribe
} = useEventStream();

// Subscribe to specific events
useEffect(() => {
  return subscribe((event) => {
    if (event.type === 'STEP_STARTED') {
      console.log('Step:', event.stepName);
    }
  });
}, [subscribe]);
```

### useProgress

Progress tracking (Aevatar extension):

```tsx
const {
  progress,  // AevatarProgressEvent | null
  percent,   // number (0-100)
  phase,     // string | null
  isActive,  // boolean
} = useProgress();

// Render progress
{isActive && (
  <div>
    <span>{phase}</span>
    <progress value={percent} max={100} />
  </div>
)}
```

### useConnection

Connection status:

```tsx
const {
  status,       // ConnectionStatus
  isConnected,  // boolean
  connect,      // () => Promise<void>
  disconnect,   // () => void
} = useConnection();
```

## Components

### Chat Components

**ChatPanel** - Complete chat UI:

```tsx
<ChatPanel
  className="my-chat"
  placeholder="Ask anything..."
  showLoading={true}
  onSend={(content) => console.log('Sent:', content)}
/>
```

**MessageList** - Message display:

```tsx
<MessageList messages={messages} />
```

**MessageBubble** - Single message:

```tsx
<MessageBubble
  role="assistant"
  content="Hello! How can I help?"
/>
```

**InputArea** - Message input:

```tsx
<InputArea
  placeholder="Type a message..."
  disabled={isRunning}
  onSend={(content) => sendMessage(content)}
/>
```

### Timeline Components

**TimelineView** - Execution timeline:

```tsx
<TimelineView
  steps={steps}
  showDetails={true}
/>
```

**StepCard** - Single step:

```tsx
<StepCard
  step={step}
  isActive={step.status === 'running'}
/>
```

**StreamingText** - Streaming text display:

```tsx
<StreamingText
  content={streamingMessage?.content ?? ''}
  isStreaming={isStreaming}
/>
```

### Common Components

**ConnectionStatus** - Connection indicator:

```tsx
<ConnectionStatus showLabel />
// Shows: 🟢 Connected | 🟡 Connecting | 🔴 Error
```

**ProgressBar** - Progress display:

```tsx
<ProgressBar value={50} showLabel />
```

**LoadingSpinner** - Loading indicator:

```tsx
<LoadingSpinner size={24} />
```

## File Structure

```
src/
├── index.ts              # Re-exports all
├── context/
│   ├── AevatarContext.ts # Context definition
│   └── AevatarProvider.tsx # Provider component
├── hooks/
│   ├── useAevatar.ts     # Root context hook
│   ├── useSession.ts     # Session management
│   ├── useRun.ts         # Run execution
│   ├── useMessages.ts    # Message streaming
│   ├── useEventStream.ts # Event access
│   ├── useProgress.ts    # Progress tracking
│   └── useConnection.ts  # Connection status
└── components/
    ├── chat/
    │   ├── ChatPanel.tsx
    │   ├── MessageList.tsx
    │   ├── MessageBubble.tsx
    │   └── InputArea.tsx
    ├── timeline/
    │   ├── TimelineView.tsx
    │   ├── StepCard.tsx
    │   └── StreamingText.tsx
    └── common/
        ├── ConnectionStatus.tsx
        ├── ProgressBar.tsx
        └── LoadingSpinner.tsx
```

## Theming

Customize with CSS variables:

```css
:root {
  --aevatar-primary: #6366f1;
  --aevatar-background: #ffffff;
  --aevatar-surface: #f8fafc;
  --aevatar-text: #1e293b;
  --aevatar-text-muted: #64748b;
  --aevatar-border: #e2e8f0;
  --aevatar-success: #22c55e;
  --aevatar-warning: #f59e0b;
  --aevatar-error: #ef4444;
  --aevatar-radius: 8px;
}

/* Dark mode */
[data-theme="dark"] {
  --aevatar-background: #0f172a;
  --aevatar-surface: #1e293b;
  --aevatar-text: #f8fafc;
  --aevatar-text-muted: #94a3b8;
  --aevatar-border: #334155;
}
```

## Dependencies

- `@aevatar/kit-types` - Type definitions
- `@aevatar/kit-protocol` - Protocol layer
- `@aevatar/kit-core` - Core logic
- `react` (peer) - React 18+
- `react-dom` (peer) - React DOM 18+

## Design Principles

1. **Hooks First** - All logic accessible via hooks
2. **Components Optional** - Use hooks with custom UI
3. **Themeable** - CSS variables for styling
4. **Accessible** - ARIA labels, keyboard navigation

## Related Packages

- [`@aevatar/kit-types`](../kit-types) - Type definitions
- [`@aevatar/kit-protocol`](../kit-protocol) - Protocol layer
- [`@aevatar/kit-core`](../kit-core) - Core logic
- [`@aevatar/kit`](../kit) - Main package

## License

MIT

