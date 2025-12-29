# AevatarKit Basic Demo

A simple demo application showcasing the `@aevatar/kit` SDK features.

## Features

- 🔌 Auto-connect to Aevatar backend
- 💬 Chat interface with streaming messages
- 📊 Real-time execution timeline
- 📡 Live event stream viewer
- 🎨 Dark theme with modern UI

## Quick Start

```bash
# From aevatar-ui root
pnpm install
pnpm build

# Run the demo
cd examples/basic-demo
pnpm dev
```

The demo will be available at `http://localhost:3000`.

## Backend Setup

Make sure you have the Aevatar backend running on `http://localhost:5001`. The demo uses Vite's proxy to forward API requests.

## Project Structure

```
basic-demo/
├── src/
│   ├── main.tsx          # Entry point
│   ├── App.tsx           # Main app component
│   └── styles.css        # Styles with CSS variables
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## SDK Usage Examples

### Provider Setup

```tsx
import { AevatarProvider } from '@aevatar/kit';

<AevatarProvider
  client={{
    baseUrl: '/api',
    timeout: 30000,
  }}
  autoConnect
>
  <App />
</AevatarProvider>
```

### Using Hooks

```tsx
import { useSession, useMessages, useRun } from '@aevatar/kit';

function Chat() {
  const { session, createSession, sendMessage } = useSession();
  const { messages, isStreaming } = useMessages();
  const { steps, isRunning } = useRun();
  
  // ...
}
```

### Using Components

```tsx
import { ChatPanel, TimelineView, ConnectionStatus } from '@aevatar/kit';

<ChatPanel placeholder="Ask anything..." />
<TimelineView showDetails />
<ConnectionStatus showLabel />
```

## Customizing Theme

Override CSS variables to customize the theme:

```css
:root {
  --aevatar-primary: #your-color;
  --aevatar-background: #your-bg;
  --aevatar-surface: #your-surface;
  /* ... */
}
```

## License

MIT

