# @aevatar/kit-protocol Architecture

**Protocol-only layer for AG-UI event streaming**

## Directory Structure

```
kit-protocol/
├── src/
│   ├── index.ts           # Main exports
│   ├── connection.ts      # Low-level SSE connection
│   ├── stream.ts          # High-level EventStream
│   ├── router.ts          # Event routing with generics
│   ├── parser.ts          # AG-UI event parsing
│   ├── json-patch.ts      # RFC 6902 JSON Patch
│   ├── message-buffer.ts  # Message aggregation
│   └── extensions/        # Aevatar-specific events
│       ├── index.ts
│       ├── types.ts
│       ├── worker.ts
│       ├── progress.ts
│       ├── voting.ts
│       ├── graph.ts
│       └── a2ui.ts
└── docs/
    └── ARCHITECTURE.md
```

## Module Responsibilities

### `connection.ts`
**Purpose**: Raw SSE connection management

- Creates EventSource connection
- Handles auto-reconnect with exponential backoff
- Tracks connection metrics (attempts, messages, duration)
- Provides rich callbacks: `onError`, `onReconnecting`, `onReconnectFailed`, `onReconnected`

### `stream.ts`
**Purpose**: High-level AG-UI event stream

- Composes connection + parser + router
- Type-safe event subscriptions via generics
- Batch registration via `router` option
- Exposes metrics and underlying router

### `router.ts`
**Purpose**: Event dispatching with type safety

- Routes AG-UI events to registered handlers
- Supports typed custom events via `CustomEventMap` generic
- Batch registration: `registerStandard()`, `registerCustom()`
- Error isolation per handler

### `parser.ts`
**Purpose**: JSON parsing of SSE data

- Parses AG-UI event JSON
- Validates event structure
- Returns null for invalid events (lenient)

### `json-patch.ts`
**Purpose**: RFC 6902 JSON Patch implementation

- `applyJsonPatch()` - Immutable patch application
- `applyJsonPatchMutable()` - Mutable for performance
- Supports: add, remove, replace, move, copy, test

### `message-buffer.ts`
**Purpose**: TEXT_MESSAGE_* event aggregation

- `createMessageBuffer()` - Low-level buffer
- `bindMessageAggregation()` - Router integration
- `parseMessageId()` - Message ID parsing utility

### `extensions/`
**Purpose**: Aevatar-specific event types

- Worker events (started, completed)
- Progress events
- Voting/consensus events
- Graph structure events
- A2UI events

## Design Principles

### 1. Protocol Purity
No business logic. No HTTP clients. No session management.

### 2. Type Safety
Generics for custom events. Full TypeScript inference.

### 3. Composable
Each module works independently. Stream composes all.

### 4. Error Resilient
Handlers isolated. Invalid events ignored. Auto-reconnect.

## Data Flow

```
SSE Data → Parser → Router → Handler
                      ↓
              Message Buffer
                      ↓
              Callbacks (onMessageComplete, etc.)
```

## Extension Points

1. **Custom Events**: Define `CustomEventMap` for type-safe domain events
2. **Message Parsing**: Use `parseMessageId()` for structured IDs
3. **State Patches**: Use `applyJsonPatch()` for STATE_DELTA events
4. **Metrics**: Access via `stream.getMetrics()`

## Dependencies

- `@aevatar/kit-types`: AG-UI type definitions only

