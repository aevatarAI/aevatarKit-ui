# @aevatar/kit-protocol

**AG-UI Protocol Implementation - Pure protocol layer, zero business assumptions**

## Philosophy

This package is **protocol-only**. It does not:

- ❌ Assume any REST API endpoint format
- ❌ Manage sessions or runs (that's your business logic)
- ❌ Provide UI components (that's your design)
- ❌ Make HTTP requests (you handle that)

It only:

- ✅ Implements AG-UI protocol (SSE parsing, event routing)
- ✅ Provides typed event stream
- ✅ Handles connection management
- ✅ Supports Aevatar extensions (optional)

## Installation

```bash
pnpm add @aevatar/kit-protocol @aevatar/kit-types
```

## Quick Start

### Vanilla TypeScript

```ts
import { createEventStream } from '@aevatar/kit-protocol';
import type { AgUiEvent } from '@aevatar/kit-types';

// YOU provide the URL - we make no assumptions
const stream = createEventStream({
  url: 'http://localhost:5000/api/sessions/abc/agui/events',
  autoReconnect: true,
});

stream.on('TEXT_MESSAGE_CONTENT', (e) => {
  console.log(e.delta); // Streaming text
});

stream.on('RUN_FINISHED', (e) => {
  console.log('Done:', e.result);
  stream.disconnect();
});

stream.onStatusChange((status) => {
  console.log('Status:', status);
});

stream.connect();
```

### React Hook Pattern

```tsx
import { useEffect, useState } from 'react';
import { createEventStream } from '@aevatar/kit-protocol';
import type { AgUiEvent } from '@aevatar/kit-types';

function useAgUiStream(url: string | null) {
  const [events, setEvents] = useState<AgUiEvent[]>([]);
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    if (!url) return;

    const stream = createEventStream({
      url,
      autoReconnect: true,
      onStatusChange: setStatus,
    });

    stream.onAny((event) => {
      setEvents((prev) => [...prev, event]);
    });

    stream.connect();

    return () => stream.disconnect();
  }, [url]);

  return { events, status };
}
```

## API

### `createEventStream(options)`

Create an AG-UI event stream from any SSE endpoint.

**Options:**
- `url: string` - SSE endpoint URL (you provide this)
- `autoReconnect?: boolean` - Auto reconnect on disconnect (default: `true`)
- `reconnectDelayMs?: number` - Reconnect delay (default: `1000`)
- `maxReconnectAttempts?: number` - Max reconnect attempts (default: `10`)
- `onStatusChange?: (status) => void` - Status change callback
- `onError?: (error) => void` - Error callback

**Returns:**
- `stream.connect()` - Connect to SSE endpoint
- `stream.disconnect()` - Disconnect
- `stream.reconnect()` - Force reconnect
- `stream.on(type, handler)` - Subscribe to specific event type
- `stream.onAny(handler)` - Subscribe to all events
- `stream.onCustom(name, handler)` - Subscribe to CUSTOM events by name
- `stream.onAevatar(name, handler)` - Subscribe to Aevatar extension events
- `stream.onStatusChange(handler)` - Subscribe to status changes
- `stream.onError(handler)` - Subscribe to errors
- `stream.status` - Current connection status

### `parseAgUiEvent(data)`

Parse a single SSE data string into an AG-UI event.

```ts
import { parseAgUiEvent } from '@aevatar/kit-protocol';

const event = parseAgUiEvent('{"type":"TEXT_MESSAGE_CONTENT","delta":"Hello"}');
if (event) {
  console.log(event.type); // "TEXT_MESSAGE_CONTENT"
}
```

### `createConnection(options)`

Low-level SSE connection (used by `createEventStream`).

## Design Decisions

### Why no session/run management?

Different backends have different:
- API endpoints (`/runs` vs `/run`)
- Request formats (`{ message }` vs `{ axioms, goal }`)
- Authentication mechanisms

The protocol layer shouldn't know about these.

### Why keep CUSTOM events generic?

CUSTOM events are for application-specific extensions. We parse them but don't interpret them (except Aevatar extensions).

```ts
stream.onCustom('my.app.progress', (e) => {
  // Your interpretation
  const progress = e.value as { percent: number };
});
```

### Why depend on `kit-types`?

`kit-types` contains AG-UI type definitions which are part of the protocol specification. Business types (Session, Run, Agent) are separate concerns.

## License

MIT
