/**
 * ============================================================================
 * AxiomReasoning API Adapter
 * ============================================================================
 * Bridges AevatarKit SDK API format to AxiomReasoning backend
 * ============================================================================
 */

const http = require('http');

const PORT = 4000;
const AXIOM_URL = 'http://localhost:5000';

// Default axioms for demo
const DEFAULT_AXIOMS = `O1: |Ψ⟩ ∈ ℋ, ⟨Ψ|Ψ⟩=1
O2: dim(ℋ_region) ~ exp(A/(4 l_P^2))`;

const DEFAULT_GOAL = 'Explain the implications of these axioms.';

// ─────────────────────────────────────────────────────────────────────────────
// Proxy Helpers
// ─────────────────────────────────────────────────────────────────────────────

function proxyRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
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
      const result = await proxyRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/health',
        method: 'GET',
      });
      json(res, result.data);
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/sessions - Adapt to AxiomReasoning format
    // ─────────────────────────────────────────────────────────────────────────
    if (path === '/api/sessions' && req.method === 'POST') {
      const body = await readBody(req);
      
      // Create session with default axioms if not provided
      const axiomBody = JSON.stringify({
        axioms: body.axioms || DEFAULT_AXIOMS,
        goal: body.goal || body.message || DEFAULT_GOAL,
        k: body.k || 3,
        max_rounds: body.maxRounds || 5,
        max_depth: body.maxDepth || 50,
        workflow: body.workflow || 'uot-con',
        language: body.language || 'English',
      });

      const result = await proxyRequest(
        {
          hostname: 'localhost',
          port: 5000,
          path: '/api/sessions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(axiomBody),
          },
        },
        axiomBody
      );

      if (result.data.sessionId) {
        // Transform response to SDK format
        json(res, {
          id: result.data.sessionId,
          createdAt: new Date().toISOString(),
          state: {},
          ...result.data,
        });
      } else {
        json(res, result.data, result.status);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/sessions/:id/runs - Adapt to /run endpoint
    // ─────────────────────────────────────────────────────────────────────────
    const runMatch = path.match(/^\/api\/sessions\/([^/]+)\/runs$/);
    if (runMatch && req.method === 'POST') {
      const sessionId = runMatch[1];
      
      // AxiomReasoning uses /run not /runs
      const result = await proxyRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/sessions/${sessionId}/run`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (result.status === 200) {
        json(res, {
          id: `run-${sessionId}`,
          sessionId,
          status: 'running',
          createdAt: new Date().toISOString(),
          ...result.data,
        });
      } else {
        json(res, result.data, result.status);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/sessions/:id/events - Proxy AG-UI SSE stream
    // ─────────────────────────────────────────────────────────────────────────
    const eventsMatch = path.match(/^\/api\/sessions\/([^/]+)\/events$/);
    if (eventsMatch && req.method === 'GET') {
      const sessionId = eventsMatch[1];
      console.log(`  → Proxying SSE stream for session ${sessionId}`);

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      // Proxy to AxiomReasoning's AG-UI endpoint
      const proxyReq = http.request(
        {
          hostname: 'localhost',
          port: 5000,
          path: `/api/sessions/${sessionId}/agui/events`,
          method: 'GET',
        },
        (proxyRes) => {
          proxyRes.on('data', (chunk) => {
            res.write(chunk);
          });
          proxyRes.on('end', () => {
            res.end();
          });
        }
      );

      proxyReq.on('error', (err) => {
        console.error('Proxy error:', err.message);
        res.end();
      });

      req.on('close', () => {
        proxyReq.destroy();
      });

      proxyReq.end();
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Proxy other requests directly
    // ─────────────────────────────────────────────────────────────────────────
    const proxyOpts = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = await readBody(req);
      const bodyStr = JSON.stringify(body);
      proxyOpts.headers['Content-Length'] = Buffer.byteLength(bodyStr);
      const result = await proxyRequest(proxyOpts, bodyStr);
      json(res, result.data, result.status);
    } else {
      const result = await proxyRequest(proxyOpts);
      json(res, result.data, result.status);
    }
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

function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║         AxiomReasoning API Adapter                       ║
║                                                          ║
║  SDK API:    http://localhost:${PORT}/api                   ║
║  Backend:    ${AXIOM_URL}                       ║
║                                                          ║
║  Adapts SDK API format → AxiomReasoning API              ║
╚══════════════════════════════════════════════════════════╝
`);
});

