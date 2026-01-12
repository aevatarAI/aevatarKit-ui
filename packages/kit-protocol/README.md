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
- ✅ Provides typed event stream with rich callbacks
- ✅ Handles connection management with metrics
- ✅ JSON Patch (RFC 6902) for STATE_DELTA
- ✅ Message buffer for TEXT_MESSAGE_* aggregation
- ✅ Supports Aevatar extensions (optional)

## Installation

```bash
pnpm add @aevatar/kit-protocol @aevatar/kit-types
```

## Quick Start

### Vanilla TypeScript

```ts
import { createEventStream } from '@aevatar/kit-protocol';

const stream = createEventStream({
  url: 'http://localhost:5000/api/sessions/abc/events',
  autoReconnect: true,
  onReconnecting: (attempt, max, delay) => {
    console.log(`Reconnecting ${attempt}/${max} in ${delay}ms`);
  },
  onReconnectFailed: () => {
    console.error('Connection lost permanently');
  },
});

stream.on('TEXT_MESSAGE_CONTENT', (e) => console.log(e.delta));
stream.on('RUN_FINISHED', (e) => stream.disconnect());

stream.connect();
```

### Type-Safe Custom Events

```ts
import { createEventStream } from '@aevatar/kit-protocol';

// Define your custom event types
interface MyEvents {
  'worker.update': { id: string; status: string };
  'task.complete': { taskId: string; result: unknown };
}

// Create a type-safe stream
const stream = createEventStream<MyEvents>({
  url: '/api/events',
});

// event.value is typed as { id: string; status: string }
stream.onCustom('worker.update', (event) => {
  console.log(event.value.id, event.value.status);
});

stream.connect();
```

### Batch Event Registration

```ts
import { createEventStream } from '@aevatar/kit-protocol';

    const stream = createEventStream({
  url: '/api/events',
  router: {
    standard: {
      RUN_STARTED: () => console.log('Started'),
      RUN_FINISHED: () => console.log('Finished'),
      TEXT_MESSAGE_CONTENT: (e) => console.log(e.delta),
    },
    custom: {
      'app.progress': (e) => console.log('Progress:', e.value),
    },
  },
    });

    stream.connect();
```

### Message Aggregation

```ts
import { createEventRouter, bindMessageAggregation } from '@aevatar/kit-protocol';

const router = createEventRouter();

const { buffer, unsubscribe } = bindMessageAggregation(router, {
  onMessageStart: (id) => console.log('Started:', id),
  onMessageChunk: (id, content) => updateUI(content),
  onMessageComplete: (id, content) => saveMessage(content),
});

// Route events (from your SSE connection)
router.route(event);
```

### JSON Patch for State Updates

```ts
import { applyJsonPatch } from '@aevatar/kit-protocol';

const state = { count: 0, items: [] };

stream.on('STATE_DELTA', (event) => {
  const newState = applyJsonPatch(state, event.delta);
  console.log('New state:', newState);
});
```

## API Reference

### `createEventStream(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | - | SSE endpoint URL |
| `autoReconnect` | `boolean` | `true` | Auto reconnect on disconnect |
| `reconnectDelayMs` | `number` | `1000` | Initial reconnect delay |
| `maxReconnectAttempts` | `number` | `10` | Max reconnect attempts |
| `onStatusChange` | `(status) => void` | - | Status change callback |
| `onError` | `(error, context) => void` | - | Error with context |
| `onReconnecting` | `(attempt, max, delay) => void` | - | Reconnection attempt |
| `onReconnectFailed` | `(context) => void` | - | All attempts failed |
| `onReconnected` | `() => void` | - | Successfully reconnected |
| `router` | `EventRouterOptions` | - | Batch event registration |

**Methods:**

```ts
stream.connect()      // Connect to SSE
stream.disconnect()   // Disconnect
stream.reconnect()    // Force reconnect
stream.on(type, fn)   // Subscribe to event type
stream.onCustom(name, fn)   // Subscribe to CUSTOM by name
stream.onAevatar(name, fn)  // Subscribe to Aevatar events
stream.onAny(fn)      // Subscribe to all events
stream.getMetrics()   // Get connection metrics
stream.getRouter()    // Get underlying router
```

### `createEventRouter<T>(options?)`

Type-safe event router with batch registration.

```ts
const router = createEventRouter<MyCustomEvents>({
  standard: { RUN_STARTED: (e) => {} },
  custom: { 'my.event': (e) => {} },
});

// Later: batch register more
const unsub = router.registerStandard({
  RUN_FINISHED: (e) => {},
});
```

### `applyJsonPatch(target, operations)`

Apply RFC 6902 JSON Patch operations (immutable).

```ts
const result = applyJsonPatch(obj, [
  { op: 'replace', path: '/count', value: 1 },
  { op: 'add', path: '/items/-', value: 'new' },
]);
```

### `createMessageBuffer()`

Low-level message buffer for manual control.

```ts
const buffer = createMessageBuffer();
buffer.start('msg-1');
buffer.append('msg-1', 'chunk');
const final = buffer.end('msg-1');
```

### `bindMessageAggregation(router, callbacks)`

Auto-bind TEXT_MESSAGE_* events to callbacks.

```ts
const { buffer, unsubscribe } = bindMessageAggregation(router, {
  onMessageStart: (id) => {},
  onMessageChunk: (id, accumulated, delta) => {},
  onMessageComplete: (id, fullContent) => {},
});
```

## Design Philosophy

### Why no session/run management?

Different backends have different:
- API endpoints (`/runs` vs `/run`)
- Request formats (`{ message }` vs `{ axioms, goal }`)
- Authentication mechanisms

The protocol layer shouldn't know about these.

### Why type-safe custom events?

Business applications need to extend AG-UI with domain events. Type safety catches errors at compile time rather than runtime.

### Why separate JSON Patch utility?

STATE_DELTA events use RFC 6902. Providing a correct implementation avoids every consumer re-implementing it.

## License

MIT
