# Axiom Demo

Demonstrates advanced SDK features for AG-UI protocol integration.

## Features Showcased

### Type-Safe Custom Events

```typescript
interface AxiomCustomEvents extends CustomEventMap {
  'aevatar.axiom.progress': { phase: string; progressPercent: number };
  'aevatar.workflow.execution_event': WorkflowExecutionEventValue;
}

const stream = createEventStream<AxiomCustomEvents>({ url });
stream.onCustom('aevatar.axiom.progress', (e) => {
  // e.value is typed!
  console.log(e.value.phase, e.value.progressPercent);
});
```

### Message Aggregation

```typescript
bindMessageAggregation(router, {
  onMessageStart: (id) => console.log('Started:', id),
  onMessageChunk: (id, accumulated) => updateUI(accumulated),
  onMessageComplete: (id, content) => saveMessage(content),
});
```

### Workflow Event Parsing (NEW)

```typescript
import {
  parseDagConsensusNodeId,
  isConsensusReached,
  type WorkflowExecutionEventValue,
} from '@aevatar/kit-protocol';

router.onCustom('aevatar.workflow.execution_event', (e) => {
  const value = e.value as WorkflowExecutionEventValue;
  const parsed = parseDagConsensusNodeId(value.nodeId);
  
  if (parsed.isDagConsensus) {
    console.log('Step:', parsed.stepId);
    console.log('Is proposal:', parsed.isProposal);
    console.log('Consensus reached:', isConsensusReached(value));
  }
});
```

### Rich Connection Callbacks

```typescript
createEventStream({
  url,
  onReconnecting: (attempt, max, delay) => {
    console.log(`Reconnecting ${attempt}/${max} in ${delay}ms`);
  },
  onReconnected: () => console.log('Reconnected!'),
  onReconnectFailed: (ctx) => showError('Connection lost'),
});
```

## Running

```bash
# From project root
pnpm dev --filter axiom-demo
```

## SDK Features Used

- `createEventStream<T>` - Type-safe event stream
- `createEventRouter<T>` - Event routing with generics
- `bindMessageAggregation` - TEXT_MESSAGE_* handling
- `WorkflowExecutionEventValue` - Workflow event types
- `parseDagConsensusNodeId` - DAG consensus parsing
- `isConsensusReached` - Consensus detection
- `ConnectionMetrics` - Connection monitoring
