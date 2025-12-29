# AevatarKit Minimal Demo

A minimal demo showing core SDK usage without React.

## Features

- Pure TypeScript (no React)
- Demonstrates `@aevatar/kit-core` and `@aevatar/kit-protocol`
- Simple HTML/CSS UI
- Event stream visualization

## Quick Start

```bash
# From aevatar-ui root
pnpm install
pnpm build

# Run the demo
cd examples/minimal-demo
pnpm dev
```

The demo will be available at `http://localhost:3001`.

## Core Concepts Demonstrated

### 1. Client Creation

```typescript
import { createAevatarClient } from '@aevatar/kit-core';

const client = createAevatarClient({
  baseUrl: '/api',
  timeout: 30000,
  onConnectionChange: (status) => console.log('Status:', status),
});

await client.connect();
```

### 2. Session Management

```typescript
const session = await client.createSession();
console.log('Session ID:', session.id);
```

### 3. Event Subscription

```typescript
session.onEvent((event) => {
  switch (event.type) {
    case 'TEXT_MESSAGE_START':
      // Message started
      break;
    case 'TEXT_MESSAGE_CONTENT':
      // Streaming content: event.delta
      break;
    case 'TEXT_MESSAGE_END':
      // Message complete
      break;
    case 'RUN_FINISHED':
      // Run complete
      break;
    case 'RUN_ERROR':
      // Error: event.message
      break;
  }
});
```

### 4. Sending Messages

```typescript
await session.sendMessage('Hello, Aevatar!');
```

## File Structure

```
minimal-demo/
├── src/
│   └── main.ts         # Core SDK usage
├── index.html          # Simple UI
├── vite.config.ts      # Vite config
└── package.json        # Dependencies (no React!)
```

## License

MIT

