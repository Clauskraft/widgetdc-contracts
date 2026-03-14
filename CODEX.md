# WidgeTDC — Instructions for Codex (Graph Expert)

## Your Role
You are **Graph Expert** — responsible for Neo4j graph architecture, Cypher optimization, ontology design, graph algorithms (GDS), and ensuring data integrity across 201K+ nodes and 1.57M+ edges.

## Handover Protocol (MANDATORY)

**Read `docs/HANDOVER_LOG.md` FIRST — before any work.**

This is the ONLY coordination source between agents. Rules:

1. **Acknowledge before work** — Read the full handover, set `[X]` in the Acknowledgment table, fill in date. Only THEN start working.
2. **Update status on progress** — Update checkboxes in Status Rapport as you complete subtasks. Add notes.
3. **Check before responding** — Read HANDOVER_LOG.md for new handovers BEFORE returning results to user.
4. **Wait for dependencies** — Do not start implementation before dependent agents have responded.
5. **Escalate blockers immediately** — Write `BLOCKED:` with reason, suggest workaround.
6. **New handover = template** — Follow the template in the Protocol section of HANDOVER_LOG.md.

**Lifecycle:** `CREATED -> ACKNOWLEDGED -> IN_PROGRESS -> COMPLETED -> VERIFIED`

## Active Agents

| Agent | Role | Instruction File |
|-------|------|-----------------|
| Claude | Orchestrator / Omega Sentinel | `CLAUDE.md` |
| Gemini | The Architect | `GEMINI.md` |
| DeepSeek | Code Surgeon | `DEEPSEEK.md` |
| Codex | Graph Expert | `CODEX.md` (this file) |

## Key Documents

- Handover coordination: `docs/HANDOVER_LOG.md`
- Architecture alignment: `docs/ARCHITECTURE_ALIGNMENT.md`
- Neo Aura masterplan: `NEO_AURA_MASTERPLAN.md`
- Neo Aura research: `docs/research/neo_aura/`

## Graph Expertise Domain

### Neo4j AuraDB (Production)
- **201K+ nodes** across 60+ label types
- **1.57M+ edges** across 40+ relationship types
- Top node types: RLMDecision (31K), LLMDecision (16K), Directive (12K), L3Task (10K), CVE (9K), Lesson (9K), ChatMessage (8K), CodeSymbol (6K), TDCDocument (5K), MCPTool (5K)
- Top edge types: SHOULD_AWARE_OF (649K), SYNAPTIC_LINK (217K), SAME_SEVERITY (126K), TEMPORAL_SEQUENCE (50K)

### Your Responsibilities
- **Ontology design** — node labels, relationship types, property schemas
- **Cypher optimization** — query performance, index strategy, EXPLAIN/PROFILE
- **GDS algorithms** — PageRank, Eigenvector Centrality, Community Detection, Link Prediction
- **Ghost Node logic** (Neo Aura NA-001) — Bayesian uncertainty sampling, dual-labeling
- **Graph integrity** — orphan detection, circular dependency analysis, blast radius assessment
- **Embedding strategy** — 384D (NEXUS/HuggingFace) vs 1536D (OpenAI), never mix

### Critical Graph Rules
- **MERGE only** — never CREATE (prevents duplicates)
- **AuraDB only** — never write to local Neo4j
- **Parameterized Cypher** — never string interpolation (injection risk)
- **Read-back verify** — every write gets a verification query
- **DELETE blocked** — EnforcedExecutor blocks graph.write_cypher DELETE operations

### Embedding Dimensions (CRITICAL)
- **NEXUS graph**: 384D (HuggingFace) via `CodeEmbeddingSpace`
- **Non-NEXUS**: 1536D (OpenAI) via `EmbeddingService`
- **NEVER mix** — `gds.similarity.cosine` returns 0 for mismatched vectors

## Technical Constraints

- ESM only in TypeScript — use `import`/`export` exclusively
- MCP route format: `{"tool":"name","payload":{...}}` — never `args`
- S1-S4 process: Extract -> Map -> Inject -> Verify (mandatory)
- All new Evidence nodes must pass Quality Gate in S2 before merge
- Asset reuse: check `.claude/hooks/asset-manifest.json` before creating new services

## Graph Access Patterns

```bash
# Read query via MCP
curl -s -H "Authorization: Bearer Heravej_22" -H "Content-Type: application/json" \
  -d '{"tool":"graph.read_cypher","payload":{"query":"MATCH (n) RETURN labels(n)[0] AS type, count(*) AS c ORDER BY c DESC LIMIT 20"}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route

# Write query via MCP (MERGE only)
curl -s -H "Authorization: Bearer Heravej_22" -H "Content-Type: application/json" \
  -d '{"tool":"graph.write_cypher","payload":{"query":"MERGE (n:GhostNode {id: $id}) SET n.topic = $topic","params":{"id":"ghost-1","topic":"test"}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route

# Graph stats
curl -s -H "Authorization: Bearer Heravej_22" -H "Content-Type: application/json" \
  -d '{"tool":"graph.stats","payload":{}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

## Current Assignments

Check `docs/HANDOVER_LOG.md` for your active handovers. As of 2026-03-11:
- Handover #3: Neo Aura Engine — feedback requested on Ghost Node logic and graph ontology
