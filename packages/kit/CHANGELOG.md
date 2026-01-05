# @aevatar/kit

## 0.2.0

### Minor Changes

- 🎉 Initial release of AevatarKit SDK

  ## Features

  ### @aevatar/kit-types
  - Complete AG-UI protocol type definitions (16 event types)
  - A2UI protocol v0.8 type definitions
  - Session, Run, Agent, Graph, Memory types

  ### @aevatar/kit-protocol
  - SSE connection with auto-reconnect (exponential backoff + jitter)
  - AG-UI event parser and router
  - A2UI message extension
  - Aevatar extensions (progress, graph, voting, worker)

  ### @aevatar/kit-core
  - AevatarClient with BackendAdapter pattern
  - SessionManager and RunManager
  - StateStore with JSON Patch support
  - Default adapter and Axiom adapter

  ### @aevatar/kit-a2ui
  - A2uiEngine for surface lifecycle management
  - DataModelStore with path-based subscriptions
  - BindingResolver for data binding
  - ComponentRegistry whitelist

  ### @aevatar/kit-react
  - 9 React hooks (useAevatar, useSession, useRun, useMessages, useToolCalls, etc.)
  - 43 A2UI standard components
  - Tool Call UI components (Card, List, Badge, Panel)
  - Theme system with 8 presets
  - Chat and Timeline components

  ### @aevatar/kit
  - Unified entry point bundling all packages

### Patch Changes

- Updated dependencies
  - @aevatar/kit-types@0.2.0
  - @aevatar/kit-protocol@0.2.0
  - @aevatar/kit-core@0.2.0
  - @aevatar/kit-a2ui@0.2.0
  - @aevatar/kit-react@0.2.0
