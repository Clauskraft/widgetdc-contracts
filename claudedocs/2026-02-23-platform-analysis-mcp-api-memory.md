# WidgeTDC Platform Analysis: MCP, API & Memory Architecture

**Date**: 2026-02-23 | **Post**: DI Layer Violations PR (10/10 eliminated)
**Scope**: 335+ MCP tools, 138 route files, 25+ cognitive/memory modules, 4 external services

---

## Overall Health Scores

| Subsystem | Score | Trend | Key Risk |
|-----------|-------|-------|----------|
| **MCP Tool System** | 75/100 | Improving | mcpRegistry god module (31 fan-in) |
| **API Routes Layer** | 55/100 | Stagnant | 138 routes, 0% error schema consistency |
| **Memory/Cognitive** | 80/100 | Stable | Circular dep managed but brittle |
| **Cross-Service** | 70/100 | Improving | DI pattern adopted, 6 route→mcp violations remain |

---

## Critical Findings (Severity Ranked)

### 1. mcpRegistry God Module — Fan-In 31

The **single biggest stability risk**. 31 modules depend on `mcpRegistry` directly. If it fails at init, the entire MCP subsystem is down. Today it handles registration, lookup, dispatch, and LLM access.

**Impact**: Any change to mcpRegistry's interface cascades to 31 files.

### 2. API Error Handling — Zero Consistency

138 route files use at least 4 different error response shapes. MCP routes use Zod validation (13% coverage), the rest use ad-hoc manual checks. All non-MCP errors return HTTP 500 regardless of cause (validation, auth, timeout, service down).

**Impact**: Clients cannot reliably parse errors or implement retry logic.

### 3. Dual Route Registrations — 3 Conflicts

`/api/memory` mounted twice (legacy CMA + Unified v2), `/api/email` mounted twice, `/api/intelligence` mounted twice. Undefined behavior when both handlers match.

**Impact**: Shadow routes silently swallow or duplicate requests.

### 4. In-Memory Rate Limiting — Won't Scale

MCP rate limiter stores counters in process memory. Lost on restart, won't work across multiple Railway instances if horizontally scaled.

**Impact**: DDoS protection ineffective at scale.

### 5. HybridSearchEngine ↔ UnifiedMemorySystem Circular Dep

Managed via lazy `await import()` at line 149 — functional but not type-safe, not refactoring-friendly, not caught at compile time.

**Impact**: Low immediate risk but high maintenance debt.

### 6. Route→MCP Direct Imports — 13 Files

13 route files import `mcpRegistry` directly, bypassing the service layer. 6 of these are tight coupling violations (cognitive, contracts, evidence, email, openai-compat, sharepoint).

**Impact**: Refactoring mcpRegistry affects routes unexpectedly.

---

## Positive Findings

- **Zero circular dependencies** in MCP layer (verified by depcruise)
- **Zero services→mcp violations** after DI PR (verified — all 10 eliminated)
- **Excellent graceful degradation** in memory subsystem (Redis, Neo4j, pgvector all fail safely)
- **Dual persistence** (PostgreSQL source-of-truth + Redis cache) with outbox pattern
- **Deterministic bootstrap** — `bootstrap/mcp.ts` has 53 one-way deps, no cycles
- **Contracts package** (`@widgetdc/contracts`) enforced as single source of truth for cross-service types

---

## Subsystem Details

### MCP Tool System (75/100)

**Architecture**: 123 modules, 26 dedicated tool handlers, 8 domain-specific handlers

| Component | Fan-In | Fan-Out | Risk |
|-----------|--------|---------|------|
| mcpRegistry | 31 | 10 | GOD MODULE |
| NeuralBridgeServer | 2 | 29 | Hub module |
| bootstrap.mcp | 1 | 53 | Initialization hub |
| CognitiveMemory | 15 | 5 | Core dependency |

**Strengths**:
- Zero circular dependencies in MCP layer
- Zero services→mcp violations (post-DI PR)
- Clean bootstrap sequence (53 controlled one-way deps)
- Good tool organization (26 focused modules)

**Weaknesses**:
- mcpRegistry god module (31 dependents)
- NeuralBridgeServer hub (29 outgoing deps)
- No plugin architecture for tool registration

### API Routes Layer (55/100)

**Architecture**: 138 route files (14 core + 124 optional), 4 middleware layers

| Metric | Value | Status |
|--------|-------|--------|
| Total routes | 138 | Well-organized |
| Zod validation coverage | 13% (MCP only) | Non-standard |
| Error format consistency | 0% | Non-standard |
| Dual registrations | 3 | Conflict risk |
| Direct route→MCP imports | 13 | Tight coupling |
| Distributed rate limiting | No | Won't scale |

**Error Response Formats in Use**:
- `{ success: false, error: "...", details: [...] }` (MCP)
- `{ error: "Missing required fields: ..." }` (auth/acquisition)
- `{ error: "Unauthorized", message: "..." }` (security middleware)
- `{ error: "...", detail: "...", path: "...", trace_id: "..." }` (compute proxy)

**Cross-Service Communication**:
- RLM Engine: HTTP proxy via `/api/synergy` (returns 502 on unavailability)
- Compute Sandbox: Proxied via `/api/compute` (private Railway network)
- Neo4j: Direct driver connection (in-process)
- Notion: `@notionhq/client` library

### Memory/Cognitive Subsystem (80/100)

**Architecture**: 25 cognitive files, 6 memory files, 13 prometheus files

**Core Components**:
- `UnifiedMemorySystem.ts` (30.5 KB) — Working/semantic/episodic/procedural coordination
- `UnifiedGraphRAG.ts` (25.6 KB) — Multi-hop reasoning, LLM synthesis
- `HybridSearchEngine.ts` (6.1 KB) — RRF fusion of keyword/semantic/graph search
- `CognitiveMemory.ts` (21.8 KB) — Singleton facade for pattern/failure/health

**Persistence Stack**:
- PostgreSQL: Source of truth (working_memory_snapshots, mcp_source_health, mcp_query_patterns, mcp_failure_memory)
- Redis: Cache layer (wm:{orgId}:{userId}, TTL 3600s)
- SQL.js: In-memory fallback when PG unavailable
- Outbox pattern: Eventual consistency between PG and Redis

**Vector Search Pipeline**:
- Embedding providers: HuggingFace → Gemini → Local GPU (graceful fallback chain)
- Vector stores: pgvector → Neo4j → Chroma → In-Memory
- Search fusion: RRF (Reciprocal Rank Fusion) across keyword + semantic + graph

**Graceful Degradation**:
- Redis down: Falls through to PostgreSQL (tested, working)
- PostgreSQL down: In-memory Map + SQL.js fallback (data loss on restart)
- Neo4j down: Returns empty results, falls back to keyword search
- Embedding service down: Jaccard + phrase match similarity
- HybridSearch partial failure: RRF continues with available results

**Circular Dependencies**:
- `HybridSearchEngine ↔ UnifiedMemorySystem`: Managed via lazy `await import()` at line 149
- Safe at runtime but not type-safe at compile time

---

## Interoperability Matrix

| From \ To | Backend | RLM Engine | Frontend | Contracts | Arch MCP |
|-----------|---------|------------|----------|-----------|----------|
| **Backend** | — | HTTP proxy | Serves API | `@widgetdc/contracts` v0.2.0 | `@widget-tdc/mcp-types` |
| **RLM Engine** | HTTP callback | — | N/A | `@widgetdc/contracts` v0.2.0 | N/A |
| **Frontend** | HTTP client | N/A | — | `@widgetdc/contracts` v0.2.0 | N/A |
| **Contracts** | Types only | Types only | Types only | — | Source JSON |
| **Arch MCP** | Reads graph | N/A | N/A | `platform-graph.json` | — |

---

## Recommended PR Sequence

| PR | What | Effort | Impact | Risk |
|----|------|--------|--------|------|
| **PR5** | Unified error contract in `@widgetdc/contracts` | 1 sprint | High | Low |
| **PR6** | Remove 3 duplicate route registrations | 1 day | Medium | Low |
| **PR7** | Redis-backed rate limiter | 2 days | High | Low |
| **PR8** | 6 remaining route→mcp DI migrations | 1 sprint | Medium | Medium |
| **PR9** | mcpRegistry decomposition (31→~10 fan-in) | 2-3 sprints | High | Medium-High |
| **PR10** | Memory circular dep → DI accessor | 1 sprint | Medium | Medium |

### Stability Targets

| Principle | Current | Target |
|-----------|---------|--------|
| Single source of truth for types | `@widgetdc/contracts` v0.2.0 | Extend to error contracts (PR5) |
| Dependency inversion | services→mcp: 0 violations | routes→mcp: 6 remaining (PR8) |
| Error contract | 4+ formats | 1 unified format (PR5) |
| Rate limiting | In-memory | Redis-backed (PR7) |
| God modules | mcpRegistry fan-in=31 | Split to ~10 (PR9) |
| Circular deps | 1 managed (lazy import) | 0 via DI (PR10) |
| Duplicate routes | 3 conflicts | 0 (PR6) |
