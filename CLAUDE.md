# CLAUDE.md — WidgeTDC Contracts

## Shared Skills (centralt vedligeholdt i WidgeTDC)

Skills vedligeholdes centralt i WidgeTDC repo og deles via filsystem:
- Fuld kapabilitetsliste: `Read C:\Users\claus\Projetcs\WidgeTDC\.claude\skills\shared-capabilities.md`
- Alle skills: `Read C:\Users\claus\Projetcs\WidgeTDC\.claude\skills\<skill-name>.md`

Platform: v2.4.0 — 448 MCP tools, 16 lib modules, 10 A2A skills, 6 crons.

## Global Governance

This file inherits the cross-repo baseline defined in `GLOBAL_AGENT_GOVERNANCE.md`.
Repo-specific agent instructions may extend this file, but they must not weaken global rules for operational truth, runtime enforcement, verification, or completion.

<!-- BEGIN SHARED RULES -->
## Autonomi

Når brugeren skriver "100% autonomt" kører agenten **fuldstændigt autonomt** indtil opgaven er udført. Ingen bekræftelser, ingen spørgsmål, ingen pauser. Agenten planlægger, implementerer, tester og verificerer selv. Eneste undtagelse: destruktive git-operationer (force push, reset --hard).

## Shared Rules (synced from WidgeTDC)

8. **MCP route format** — `{"tool":"name","payload":{...}}` — ALDRIG `args`, altid `payload`
9. **Read before write** — ALDRIG opret nye filer under `services/`, `routes/`, `middleware/`, `src/` uden først at læse mindst 2 eksisterende filer i samme mappe
10. **Plan before multi-file changes** — Brug Plan mode før tasks der berører >3 filer
11. **Lesson check at boot** — Kald `audit.lessons` med agentId ved session start.
12. **Contracts** — Cross-service types importeres fra `@widgetdc/contracts`. Wire format: snake_case JSON med `$id`.
<!-- END SHARED RULES -->

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
| `orchestrator/` | AgentHandshake, AgentMessage, ToolCall/Result — multi-agent orchestration |
| `opportunities/` | SalienceVector, WinProbabilityScore, IntelligenceObservation — tender intelligence |

## Conventions
- **Wire format**: snake_case JSON (matches RLM production API)
- **TypeBox pattern**: `const X = Type.Object({...})` + `type X = Static<typeof X>`
- **All schemas must have $id**: Required for JSON Schema export
- **Schemas committed to git**: Enables consumption without Node.js build

## Rules (Ufravigelige — synced from WidgeTDC/CLAUDE.md)

8. **MCP route format** — `{"tool":"name","payload":{...}}` — ALDRIG `args`, altid `payload`
9. **Read before write** — ALDRIG opret nye filer under `src/` uden først at læse mindst 2 eksisterende filer i samme mappe
10. **Plan before multi-file changes** — Brug Plan mode før tasks der berører >3 filer

## Do NOT
- Never change wire format from snake_case without coordinating all 3 repos
- Never edit schemas/ or python/ manually — regenerate from source
- Never add repo-internal types here — only cross-service contracts
- Never end a session with unresolved failures or red tests (zero-tolerance)
- Never end a session with uncommitted changes, untracked files, stashes, or orphan branches (clean git state)

## Session Discipline
- **Verify every action**: run `npm run validate` after schema changes
- **Fix all failures before concluding**: flaky tests are bugs — stabilize them
- **Clean git state at session end**: `git status` shows clean, no stashes, no orphan branches

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

## Agent Compliance Rules (ALL agents MUST follow)

> **Master data**: Neo4j AuraDB + arch-mcp-server. These local rules are synced FROM graph truth.
> Canonical file source: `WidgeTDC/CLAUDE.md` — update there first, then propagate.

These rules apply to **every** `.claude/commands/` agent, persona, and future agent in the entire WidgeTDC ecosystem. Identical rules apply regardless of which repo the agent is invoked from.

### Lesson Check (MANDATORY at boot)
Before starting any mission, run `audit.lessons` with your agentId. Integrate all pending lessons. Acknowledge with `audit.acknowledge`. Lessons contain corrections from other agents' failures — immediate wisdom.

### Integrity Audit
All agent output is audited by `InsightIntegrityGuard`. Ensure:
- **Citations**: Use `[Source: CODE-ID]` for StrategicInsight references
- **Contract Law**: JSON payloads must include `$id` and use `snake_case` keys (widgetdc-contracts)
- **Graph Consistency**: No contradictions with FailureMemory nodes in Neo4j

### Audit MCP Tools (audit.* namespace)
| Tool | Purpose |
|------|---------|
| `audit.lessons` | Get pending lessons for agent (Lesson Check) |
| `audit.acknowledge` | Mark lessons as read |
| `audit.status` | Get latest integrity score for agent |
| `audit.run` | Manually audit output text |
| `audit.dashboard` | Full integrity matrix across all agents |

### Cross-Agent Learning (Teacher/Student)
- Failures → `AgentLearningLoop` creates `Lesson` nodes in Neo4j
- Lessons propagated to all agents via `SHOULD_AWARE_OF` relationships
- Agents fetch via `audit.lessons`, acknowledge via `audit.acknowledge`

### External Discovery (S1-4 Research-First Mandate)
When Neo4j has no match: **S1** Extract (max 50 lines) → **S2** Map to widgetdc-contracts → **S3** Inject as `:ExternalKnowledge` node → **S4** Verify with `audit.run`.

### DO's (ALWAYS)
- Include `Authorization: Bearer ${API_KEY}` on all backend calls
- Use params in Cypher (never string interpolation)
- Use production URLs (backend-production-d3da, rlm-engine-production, AuraDB)
- Cite sources with `[Source: CODE-ID]` format
- Run `audit.lessons` before starting a mission
- Run `audit.run` after major code generation
- Search externally (GitHub, NPM, HuggingFace) when Neo4j has no match
- Store learnings as `AgentMemory` nodes

### DON'Ts (NEVER)
- Call backend without auth header
- Use `require()` — only ESM imports
- Write to local Neo4j — only AuraDB
- Ignore lessons from `audit.lessons`
- Assume errors are isolated — search for `SYNAPTIC_LINK` between errors and FailureMemory first
- Write >50 lines custom logic when an NPM module solves it
- Architect in isolation — consult external sources (S1-4 flow)
- Change architecture without SwarmControl consensus

## Cross-Repo Sync Protocol

This repo is part of the **WidgeTDC 6-repo ecosystem**. The **graph** (Neo4j + arch-mcp-server) owns the master data:

| Layer | Owner | What it governs |
|-------|-------|-----------------|
| **Neo4j AuraDB** | Master data | Agent nodes, Lesson nodes, FailureMemory, StrategicInsight, compliance state |
| **arch-mcp-server** | Dashboards + API | `/integrity`, `/strategic-audit`, `/api/compliance-matrix` — live views into graph |
| **widgetdc-contracts** | Type contracts | JSON schemas, wire format, `$id` + `snake_case` rules |
| **CLAUDE.md (each repo)** | Local agent rules | Boot-time rules that agents read; synced FROM graph truth |

**Master data flow**: Graph (Neo4j) → arch-mcp-server dashboards → CLAUDE.md files (local copies).
**Update flow**: Change rules in graph (via `graph.write_cypher` / Lesson nodes) → update `WidgeTDC/CLAUDE.md` → propagate to satellite repos.
**Verification**: `arch-mcp-server-production.up.railway.app/integrity` + `/strategic-audit`

Agents in ANY repo query the graph directly for the latest rules:
```
POST https://backend-production-d3da.up.railway.app/api/mcp/route
{"tool":"audit.lessons","payload":{"agentId":"YOUR_AGENT_ID"}}
```
