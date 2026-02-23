# CLAUDE.md — WidgeTDC Contracts

## What is this
Shared type contracts for the WidgeTDC platform. Single source of truth for cross-service types used by backend, RLM engine, and consulting frontend.

## Tech stack
- TypeScript 5.7+, @sinclair/typebox (runtime JSON Schema + compile-time TS types)
- JSON Schema (generated, committed to git)
- Python Pydantic v2 models (generated, committed to git)

## Commands
- `npm run build` — Compile TypeScript
- `npm run schemas` — Export JSON Schema files to schemas/
- `npm run python` — Generate Python models from JSON Schema
- `npm run generate` — Build + schemas (full pipeline)
- `npm run test` — Run validation tests
- `npm run validate` — Check schemas are in sync with source

## Key paths
- `src/` — TypeBox schema definitions (source of truth)
- `schemas/` — Generated JSON Schema files (committed)
- `python/widgetdc_contracts/` — Generated Pydantic v2 models (committed)
- `scripts/` — Build and validation scripts
- `tests/` — Schema roundtrip tests

## Modules
| Module | Purpose |
|--------|---------|
| `cognitive/` | CognitiveRequest, CognitiveResponse, IntelligenceEvent — RLM ↔ Backend |
| `health/` | HealthPulse, HealthStatus, DomainProfile — all services |
| `http/` | ApiResponse, ApiError, PaginatedResponse — all services |
| `consulting/` | DomainId (15 domains), ProcessStatus — taxonomy enums |
| `agent/` | AgentTier, AgentPersona, SignalType — agent hierarchy |
| `graph/` | NodeLabel, RelationshipType — Neo4j schema registry |

## Conventions
- **Wire format**: snake_case JSON (matches RLM production API)
- **TypeBox pattern**: `const X = Type.Object({...})` + `type X = Static<typeof X>`
- **All schemas must have $id**: Required for JSON Schema export
- **Schemas committed to git**: Enables consumption without Node.js build

## Do NOT
- Never change wire format from snake_case without coordinating all 3 repos
- Never edit schemas/ or python/ manually — regenerate from source
- Never add repo-internal types here — only cross-service contracts

## Related services
- **Backend**: Clauskraft/WidgeTDC (WidgeTDC_fresh)
- **RLM Engine**: Clauskraft/widgetdc-rlm-engine
- **Frontend**: Clauskraft/widgetdc-consulting-frontend

---

## WidgeTDC Platform — Agent Access Guide

### Base URL
```
https://backend-production-d3da.up.railway.app
```

### Authentication
Currently open access (`MCP_ALLOW_OPEN_ACCESS=true`). No API key required.
If API keys are enabled later, use: `Authorization: Bearer <your-key>`

---

### MCP Protocol Access (Recommended)

#### Streamable HTTP Transport (modern, preferred)
```
POST https://backend-production-d3da.up.railway.app/mcp
Content-Type: application/json
```

Standard MCP JSON-RPC 2.0 protocol. Initialize first, then call tools:

```json
// 1. Initialize
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"my-agent","version":"1.0"}}}

// 2. List tools
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}

// 3. Call a tool
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"graph.read_cypher","arguments":{"query":"MATCH (n) RETURN labels(n) AS label, count(*) AS cnt ORDER BY cnt DESC LIMIT 10"}}}
```

#### SSE Transport (legacy/fallback)
```
GET https://backend-production-d3da.up.railway.app/api/mcp/sse
```

---

### REST API Access

#### Tool Routing (simple HTTP)
```
POST https://backend-production-d3da.up.railway.app/api/mcp/route
Content-Type: application/json

{
  "tool": "graph.read_cypher",
  "payload": {
    "query": "MATCH (n) RETURN labels(n) AS label, count(*) AS cnt ORDER BY cnt DESC LIMIT 10"
  }
}
```

#### Neural Bridge (OpenAI-compatible + batch)
```
# Single tool call
POST https://backend-production-d3da.up.railway.app/api/bridge/call/{tool.name}
Content-Type: application/json
Body: { ...params }

# Batch (max 10)
POST https://backend-production-d3da.up.railway.app/api/bridge/batch
Content-Type: application/json
Body: { "calls": [{ "tool": "graph.stats", "params": {} }, ...] }

# OpenAI function call style
POST https://backend-production-d3da.up.railway.app/api/bridge/functions/call
Content-Type: application/json
Body: { "name": "graph_read_cypher", "arguments": { "query": "..." } }
```

---

### Discovery Endpoints
| Endpoint | Purpose |
|----------|---------|
| `GET /health` | System health + services status |
| `GET /api/mcp/tools` | List all 335 tools with schemas |
| `GET /api/mcp/spec` | MCP server specification |
| `GET /api/mcp/status` | MCP health check |
| `GET /api/mcp/resources` | Available resources |
| `GET /api/bridge/tools` | Tools grouped by namespace |
| `GET /api/bridge/tools?format=openai` | OpenAI function format |
| `GET /api/bridge/tools?format=anthropic` | Anthropic tool format |
| `GET /api/bridge/health` | Bridge health + circuit breaker |

### Realtime Events (SSE)
```
GET https://backend-production-d3da.up.railway.app/api/mcp/events?topics=*
```

---

### Tool Namespaces (335 tools)

| Namespace | Count | Examples |
|-----------|-------|---------|
| `core` | 35 | ping, agent_chat, community |
| `consulting` | 28 | pattern, decision, insight, commander |
| `prometheus` | 28 | lsp, governance, code_dreaming |
| `git` | 18 | status, log, diff, branch, commit |
| `agent` | 15 | task.fetch, task.claim, task.complete |
| `trident` | 14 | threat.level, harvest, engage |
| `ingestion` | 13 | start, crawl, harvest, classify |
| `knowledge` | 11 | search_claims, entities, provenance |
| `osint` | 10 | investigate, graph, scan |
| `docgen` | 9 | powerpoint, word, excel, diagram |
| `financial` | 8 | trinity, forecast, macro_data |
| `graph` | 4 | read_cypher, write_cypher, stats, health |
| `compute` | 6 | execute, sandbox.create/destroy |
| `llm` | 3 | generate, models, chat |
| `kg_rag` | 2 | query, explain |
| +30 more namespaces | ... | Full list at GET /api/mcp/tools |

### Rate Limits
- MCP routes: 100 req/min per client
- Neural Bridge: 120 req/min per agent
- Dangerous tools (deploy, write_cypher, git.push): require `X-Tool-Approval` header

### Error Response Format (contracts-compliant, PR5)
All errors from migrated routes follow the `ApiResponse` schema defined in `src/http/response.ts`:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | AUTH_ERROR | NOT_FOUND | RATE_LIMIT | INTERNAL_ERROR | TIMEOUT | SERVICE_UNAVAILABLE",
    "message": "Human-readable description",
    "status_code": 400,
    "details": {},
    "correlation_id": "uuid"
  },
  "metadata": {
    "correlation_id": "uuid",
    "timestamp": "2026-02-23T17:41:39.962Z",
    "duration_ms": 42
  }
}
```

### Neo4j Knowledge Graph (Direct Access via MCP)
Production graph: 137K+ nodes, 1.1M+ relationships (Neo4j 5.27 AuraDB Enterprise).

```json
// Read-only query
{"tool": "graph.read_cypher", "payload": {"query": "MATCH (n) RETURN labels(n) AS label, count(*) AS cnt ORDER BY cnt DESC LIMIT 15"}}

// Graph statistics
{"tool": "graph.stats", "payload": {}}

// Health check
{"tool": "graph.health", "payload": {}}

// Write (requires confirmation context)
{"tool": "graph.write_cypher", "payload": {"query": "MERGE (n:Test {id: 'demo'}) SET n.updated = datetime() RETURN n"}}
```

Top graph labels: `Insight` (54K), `Directive` (13K), `MCPTool` (10K), `StrategicInsight` (9K), `Tool` (8K), `TDCDocument` (6K), `SystemSnapshot` (5K), `LocalFile` (4K), `CVE` (4K), `Entity` (3K), `Evidence` (2K).

---

## Session Log

### 2026-02-23 — PR5: Standardize API Error Responses via @widgetdc/contracts
Deployed `2ca262c1` to production. Added `ApiHttpError` class + Express error middleware that serializes to contracts `ApiResponse` shape. Migrated 4 core routes (mcpRouter, mcpSecurityMiddleware, computeRoutes, neuralBridgeRoutes). Remaining 134 routes adopt incrementally.

**Production test results (2026-02-23T19:22 UTC):**

| Scenario | HTTP | Contracts format? | Verdict |
|----------|------|-------------------|---------|
| Neural Bridge — invalid batch body (ZodError) | 400 | `VALIDATION_ERROR` + correlation_id + metadata | PR5 working |
| Neural Bridge — invalid function call body | 400 | `VALIDATION_ERROR` + correlation_id + metadata | PR5 working |
| Neural Bridge — invalid MCP protocol method | 400 | `VALIDATION_ERROR` + correlation_id + metadata | PR5 working |
| MCP route — missing `tool` field (early return) | 400 | Legacy format (unmigrated early-return path) | Expected |
| MCP route — bad Cypher syntax | 200 | Tool handles own error internally | Expected |
| Compute proxy — sandbox reachable | 200 | No error path hit | Expected |

All migrated error paths return `{ success: false, error: { code, message, status_code, correlation_id }, metadata: { correlation_id, timestamp, duration_ms } }`. Unmigrated paths retain legacy format per incremental migration plan.

### 2026-02-23 — Agent access guide added to CLAUDE.md
Appended full MCP/REST/SSE access documentation (335 tools, 3 transports, discovery endpoints, rate limits, error format, Neo4j graph access).
