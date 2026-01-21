/**
 * ============================================================================
 * AevatarKit Mock Server
 * ============================================================================
 * Simulates AG-UI protocol for testing SDK components
 * ============================================================================
 */

const http = require('http');

const PORT = 4000;

// ─────────────────────────────────────────────────────────────────────────────
// In-memory store
// ─────────────────────────────────────────────────────────────────────────────

const sessions = new Map();
const runs = new Map();

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// AG-UI Event Generator
// ─────────────────────────────────────────────────────────────────────────────

async function* generateAgUiEvents(runId, userMessage, sessionId = 'session-default') {
  const timestamp = () => Date.now();
  const threadId = sessionId;

  // 1. RUN_STARTED (threadId required)
  yield {
    type: 'RUN_STARTED',
    runId,
    threadId,
    timestamp: timestamp(),
  };

  await sleep(100);

  // 2. TEXT_MESSAGE_START (role required)
  const msgId = `msg:${threadId}:assistant:${runId}`;
  yield {
    type: 'TEXT_MESSAGE_START',
    messageId: msgId,
    role: 'assistant',
    timestamp: timestamp(),
  };

  await sleep(50);

  // 3. Simulate streaming text
  const response = `I received your message: "${userMessage}". Let me help you with that.\n\nThis is a simulated response from the AevatarKit Mock Server.`;
  
  for (const char of response) {
    yield {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: msgId,
      delta: char,
      timestamp: timestamp(),
    };
    await sleep(20);
  }

  await sleep(100);

  // 4. TEXT_MESSAGE_END
  yield {
    type: 'TEXT_MESSAGE_END',
    messageId: msgId,
    timestamp: timestamp(),
  };

  await sleep(50);

  // 5. STEP events (stepName required)
  const steps = ['vibe.analyzing', 'vibe.processing', 'vibe.generating'];
  for (let i = 0; i < steps.length; i++) {
    yield {
      type: 'STEP_STARTED',
      stepName: steps[i],
      stepId: `step-${i}`,
      stepType: 'llm_call',
      timestamp: timestamp(),
    };

    await sleep(300);

    yield {
      type: 'STEP_FINISHED',
      stepName: steps[i],
      stepId: `step-${i}`,
      result: { success: true },
      timestamp: timestamp(),
    };
  }

  // 6. TOOL_CALL events (messageId required)
  const toolMsgId = `msg:${threadId}:tool:${runId}`;
  yield {
    type: 'TOOL_CALL_START',
    messageId: toolMsgId,
    toolCallId: `tc-${generateId()}`,
    toolName: 'search',
    timestamp: timestamp(),
  };

  await sleep(200);

  yield {
    type: 'TOOL_CALL_RESULT',
    messageId: toolMsgId,
    toolCallId: `tc-${generateId()}`,
    result: JSON.stringify({ found: true, results: ['item1', 'item2'] }),
    timestamp: timestamp(),
  };

  yield {
    type: 'TOOL_CALL_END',
    messageId: toolMsgId,
    toolCallId: `tc-${generateId()}`,
    timestamp: timestamp(),
  };

  // 7. CUSTOM workflow event
  yield {
    type: 'CUSTOM',
    name: 'aevatar.workflow.execution_event',
    value: {
      phase: 'reasoning',
      nodeId: 'dag_consensus:decompose',
      message: 'Processing reasoning step',
      status: 'completed',
      timestamp: timestamp(),
      fields: {
        status: 'completed',
        progress: 1.0,
        execution_id: runId,
        workflow_name: 'demo',
        step_type: 'llm_call',
        tokens_used: 150,
        llm_calls: 1,
      },
    },
    timestamp: timestamp(),
  };

  // 8. RUN_FINISHED (threadId required)
  yield {
    type: 'RUN_FINISHED',
    runId,
    threadId,
    result: { success: true },
    timestamp: timestamp(),
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Server
// ─────────────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  console.log(`[${new Date().toISOString()}] ${req.method} ${path}`);

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // Health check
    // ─────────────────────────────────────────────────────────────────────────
    if (path === '/health' || path === '/api/health') {
      json(res, { status: 'ok' });
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/sessions - Create session
    // ─────────────────────────────────────────────────────────────────────────
    if (path === '/api/sessions' && req.method === 'POST') {
      const body = await readBody(req);
      const id = `session-${generateId()}`;
      const session = {
        id,
        createdAt: new Date().toISOString(),
        state: {},
        ...body,
      };
      sessions.set(id, session);
      console.log(`  → Created session: ${id}`);
      json(res, session);
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/sessions/:id/runs - Start run (triggers SSE events)
    // ─────────────────────────────────────────────────────────────────────────
    const runMatch = path.match(/^\/api\/sessions\/([^/]+)\/runs$/);
    if (runMatch && req.method === 'POST') {
      const sessionId = runMatch[1];
      const body = await readBody(req);
      const runId = `run-${generateId()}`;
      const content = body.message || body.content || 'Hello';
      
      const run = {
        id: runId,
        sessionId,
        status: 'running',
        input: body,
        createdAt: new Date().toISOString(),
      };
      runs.set(runId, run);
      console.log(`  → Created run: ${runId} for session ${sessionId}`);
      console.log(`  → Message: "${content.substring(0, 50)}..."`);

      // Get SSE stream and send events
      const streamInfo = sessions.get(`${sessionId}:stream`);
      if (streamInfo) {
        (async () => {
          for await (const event of generateAgUiEvents(runId, content, sessionId)) {
            if (streamInfo.res.writableEnded) break;
            streamInfo.res.write(`data: ${JSON.stringify(event)}\n\n`);
          }
        })();
      }

      json(res, run);
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/sessions/:id/events - SSE event stream
    // ─────────────────────────────────────────────────────────────────────────
    const eventsMatch = path.match(/^\/api\/sessions\/([^/]+)\/events$/);
    if (eventsMatch && req.method === 'GET') {
      const sessionId = eventsMatch[1];
      console.log(`  → SSE stream started for session ${sessionId}`);

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      // Send initial connected event
      const connEvent = {
        type: 'CONNECTED',
        sessionId,
        timestamp: new Date().toISOString(),
      };
      res.write(`data: ${JSON.stringify(connEvent)}\n\n`);

      // Keep connection alive
      const keepAlive = setInterval(() => {
        res.write(': keepalive\n\n');
      }, 15000);

      // Store stream for later use
      sessions.set(`${sessionId}:stream`, { res, keepAlive });

      req.on('close', () => {
        clearInterval(keepAlive);
        sessions.delete(`${sessionId}:stream`);
        console.log(`  → SSE stream closed for session ${sessionId}`);
      });

      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/sessions/:id/message - Send message (triggers run)
    // ─────────────────────────────────────────────────────────────────────────
    const msgMatch = path.match(/^\/api\/sessions\/([^/]+)\/message$/);
    if (msgMatch && req.method === 'POST') {
      const sessionId = msgMatch[1];
      const body = await readBody(req);
      const content = body.content || body.message || 'Hello';
      const runId = `run-${generateId()}`;

      console.log(`  → Message received: "${content.substring(0, 50)}..."`);

      // Get SSE stream
      const streamInfo = sessions.get(`${sessionId}:stream`);
      if (streamInfo) {
        // Send events through SSE
        (async () => {
          for await (const event of generateAgUiEvents(runId, content, sessionId)) {
            if (streamInfo.res.writableEnded) break;
            streamInfo.res.write(`data: ${JSON.stringify(event)}\n\n`);
          }
        })();
      }

      json(res, { success: true, runId });
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 404 Not Found
    // ─────────────────────────────────────────────────────────────────────────
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path }));
  } catch (err) {
    console.error('Error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function json(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║             AevatarKit Mock Server                       ║
║                                                          ║
║  API:     http://localhost:${PORT}/api                      ║
║  Health:  http://localhost:${PORT}/health                   ║
║                                                          ║
║  Endpoints:                                              ║
║    POST /api/sessions          - Create session          ║
║    GET  /api/sessions/:id/events - SSE stream            ║
║    POST /api/sessions/:id/message - Send message         ║
╚══════════════════════════════════════════════════════════╝
`);
});

