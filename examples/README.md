# AevatarKit Examples

Demonstration applications for the AevatarKit SDK.

## Examples Overview

| Example | Description | Key Features |
|---------|-------------|--------------|
| **basic-demo** | High-level React components | `AevatarProvider`, `ChatPanel`, `TimelineView` |
| **axiom-demo** | Advanced protocol features | Type-safe events, DAG consensus, workflow parsing |
| **minimal-demo** | Pure TypeScript, no React | Core SDK usage, event handling |
| **a2ui-demo** | A2UI component rendering | Data-driven UI components |
| **molecule-demo** | 3D molecule visualization | Domain-specific components |

## Quick Start

```bash
# From project root
pnpm install
pnpm build

# Start mock server (for basic-demo and minimal-demo)
pnpm --filter mock-server start

# Run any example
pnpm dev --filter basic-demo
pnpm dev --filter axiom-demo
pnpm dev --filter minimal-demo
```

## SDK Event Types (Updated)

### Required Fields

```typescript
// RUN_STARTED - threadId now required
interface RunStartedEvent {
  type: 'RUN_STARTED';
  runId: string;
  threadId: string;  // required
}

// RUN_FINISHED - threadId now required
interface RunFinishedEvent {
  type: 'RUN_FINISHED';
  runId: string;
  threadId: string;  // required
  result?: unknown;
}

// STEP events - stepName now required
interface StepStartedEvent {
  type: 'STEP_STARTED';
  stepName: string;  // required
  stepId?: string;
  stepType?: string;
}

// TOOL_CALL events - messageId now required
interface ToolCallStartEvent {
  type: 'TOOL_CALL_START';
  messageId: string;  // required
  toolCallId: string;
  toolName: string;
}
```

### Workflow Events (NEW)

```typescript
import {
  parseDagConsensusNodeId,
  isConsensusReached,
  type WorkflowExecutionEventValue,
} from '@aevatar/kit-protocol';

// Handle workflow execution events
stream.onCustom('aevatar.workflow.execution_event', (e) => {
  const value = e.value as WorkflowExecutionEventValue;
  
  // Parse DAG consensus nodeId
  const parsed = parseDagConsensusNodeId(value.nodeId);
  console.log('Is DAG consensus:', parsed.isDagConsensus);
  console.log('Step ID:', parsed.stepId);
  console.log('Is proposal:', parsed.isProposal);
  
  // Check consensus status
  if (isConsensusReached(value)) {
    console.log('Consensus reached!');
    console.log('Winner:', value.fields.winner_proposal_id);
  }
  
  // Access all fields
  console.log('Status:', value.status);
  console.log('Progress:', value.fields.progress);
  console.log('Tokens used:', value.fields.tokens_used);
});
```

## Mock Server

The `mock-server` provides a simulated AG-UI backend for testing:

```bash
cd examples/mock-server
node server.js
```

Endpoints:
- `POST /api/sessions` - Create session
- `GET /api/sessions/:id/events` - SSE event stream
- `POST /api/sessions/:id/message` - Send message

The mock server now generates events matching the latest SDK types:
- `RUN_STARTED` with `threadId`
- `STEP_STARTED/FINISHED` with `stepName`
- `TOOL_CALL_*` with `messageId`
- `CUSTOM` workflow execution events

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend App                            │
├─────────────────────────────────────────────────────────────┤
│  basic-demo        │  axiom-demo       │  minimal-demo      │
│  (React + hooks)   │  (Protocol demo)  │  (Pure TS)         │
├─────────────────────────────────────────────────────────────┤
│                    @aevatar/kit-react                        │
├─────────────────────────────────────────────────────────────┤
│  @aevatar/kit-core    │    @aevatar/kit-protocol            │
├─────────────────────────────────────────────────────────────┤
│                    @aevatar/kit-types                        │
├─────────────────────────────────────────────────────────────┤
│                   AG-UI Protocol (SSE)                       │
├─────────────────────────────────────────────────────────────┤
│                 Backend / Mock Server                        │
└─────────────────────────────────────────────────────────────┘
```
