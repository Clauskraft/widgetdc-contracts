---
name: AGENT_BASELINE
description: MANDATORY baseline for ALL WidgeTDC agents — intelligence stack usage, memory protocol, RAG-first reasoning. Every agent command MUST inherit this.
---

# AGENT BASELINE — MANDATORY FOR ALL WIDGETDC AGENTS

**This file is the canonical intelligence protocol. Every agent in `~/.claude/commands/` inherits these rules. No exceptions.**

## BEARER PROTOCOL (READ FIRST — bearer values rotate; never hardcode)

Backend `/api/mcp/route` uses `MCP_API_KEYS` allowlist (per-client scoped bearers). Agents authenticate as the **AGENT client**, with bearer stored in env var `MCP_AGENT_API_KEY`. Hardcoding a literal bearer value in any agent doc is a governance violation that creates 401-spam.

**Canonical env var for agent boot:** `${MCP_AGENT_API_KEY}` — set in Railway backend service env, fetchable locally via:

```bash
# Resolve current agent bearer dynamically (safe to call at agent boot)
if [ -z "$MCP_AGENT_API_KEY" ]; then
  export MCP_AGENT_API_KEY=$(railway variables --service backend --kv 2>/dev/null | grep '^MCP_AGENT_API_KEY=' | cut -d= -f2-)
fi
[ -z "$MCP_AGENT_API_KEY" ] && echo "ERROR: MCP_AGENT_API_KEY missing — abort all backend MCP calls" && exit 2
```

**`${LINEAR_API_KEY}`** — same fetch pattern via `railway variables --service backend --kv | grep '^LINEAR_API_KEY='`.

**Auth-architecture context** (added 2026-05-08):
- Backend MCP route validates bearer against `MCP_API_KEYS` allowlist (`apps/backend/src/middleware/mcpSecurityMiddleware.ts`).
- The allowlist contains per-client entries: `LIBRECHAT:<key>,CANVAS:<key>,OWUI:<key>,AGENT:<key>`.
- `${MCP_AGENT_API_KEY}` is the AGENT client's specific bearer — works for all `/api/mcp/route` calls.
- Other env vars (`WIDGETDC_API_KEY`, `BACKEND_API_KEY`, `RLM_ADMIN_KEY`, `MCP_API_KEY` singular) are OUTBOUND bearers used by backend to call peer services — NOT valid for inbound auth.

**Rules:**
- ALL curl examples below use `${MCP_AGENT_API_KEY}` (literal env var reference, not a value).
- Never paste the actual bearer in conversations, PRs, Linear comments, commit messages, or any doc.
- If a doc shows a bearer literal, treat it as STALE and update via the protocol above.
- CI gate `Block known bearer literals` (`.github/workflows/credential-guard.yml`) enforces this on every push.

## BOOT SEQUENCE (MANDATORY — execute BEFORE any work)

Every agent invocation MUST start with this hydration sequence. No shortcuts. No skipping.

### Step 0: Identify Self
```
AGENT_ID = <your command name, e.g. "qa-guardian", "omega-sentinel">
```

### Step 1: Cortex Recall (what happened last session for THIS agent?)
```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"agent_id":"AGENT_ID","action":"recall","max_tokens":800}' \
  https://rlm-engine-production.up.railway.app/memory/cortex
```
Parse: last known state, blockers, active work, residuals.

### Step 2: Runtime Health (are services UP?)
```bash
# Backend
curl -sf https://backend-production-d3da.up.railway.app/health | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const h=JSON.parse(d);console.log('Backend:',h.status,'v'+h.version,'uptime='+h.uptime_seconds+'s','complexity='+h.complexity?.avg)}catch{console.log('DOWN')}})"

# RLM Engine
curl -sf https://rlm-engine-production.up.railway.app/health | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const h=JSON.parse(d);console.log('RLM:',h.data?.status,'v'+h.data?.version,'tools='+h.data?.boot_manifest?.tools_count)}catch{console.log('DOWN')}})"
```
If either DOWN → flag as P0 blocker before proceeding.

### Step 3: Graph Memory (learnings + coordination broadcasts from ALL agents)
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.read_cypher","payload":{"query":"MATCH (m:AgentMemory) WHERE (m.agentId = $id OR m.type IN [\"teaching\",\"intelligence\",\"coordination\",\"claim\",\"closure\",\"broadcast\",\"ack\",\"objection\"] OR m.key STARTS WITH \"claim-\" OR m.key STARTS WITH \"closure-\" OR m.key STARTS WITH \"coord-\") AND m.updatedAt > datetime() - duration({hours: 6}) RETURN m.agentId, m.key, m.value, m.type, m.updatedAt ORDER BY m.updatedAt DESC LIMIT 30","params":{"id":"AGENT_ID"}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```
Integrate all teachings AND coordination broadcasts before acting. If a `claim-*` broadcast from another session overlaps your planned scope, go to STEP 6 lesson `7070df93` (multi-agent coordination protocol) for handling rules. **Never silently proceed over an active parallel claim.**

### Step 4: Linear Inbox Triage (unread notifications)
```bash
curl -s -X POST -H "Content-Type: application/json" -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"{ notifications(first: 15) { nodes { id type createdAt readAt externalUserActor { name } ... on IssueNotification { issue { identifier title state { name } } } } } }"}' \
  https://api.linear.app/graphql
```
Flag: Copilot/Cursor findings → immediate fix. Issue state changes → update plan.

### Step 5: GitHub PR Review Comments (automated reviewer findings)
```bash
gh pr list --state merged --limit 3 --json number --jq '.[].number' | while read pr; do
  comments=$(gh api repos/Clauskraft/WidgeTDC/pulls/$pr/comments --jq 'length' 2>/dev/null)
  [ "$comments" -gt 0 ] && echo "PR #$pr: $comments review comments" && \
    gh api repos/Clauskraft/WidgeTDC/pulls/$pr/comments --jq '.[].body[:80]' 2>/dev/null | head -3
done
```
HIGH severity findings from Copilot/Cursor must be fixed before new work.

### Step 6: Audit Lessons (pending corrections from other agents) — **HIGHEST PRIORITY**
Pending lessons contain corrections from other agents' failures. **Skipping = repeating their mistakes.** This step is not optional, not deferrable, and not summarizable — every lesson must be read in full and its correction integrated into session strategy BEFORE any work begins.

**6a. Read pending lessons** (substitute your own agent id):
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"audit.lessons","payload":{"agentId":"AGENT_ID"}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

For each lesson returned:
- Read `violation` field fully (describes the failure mode to avoid)
- Read `correction` field fully (describes the required behavior)
- Note `lessonId` for step 6b

**6b. Acknowledge integration** (prevents re-surfacing next boot):
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"audit.acknowledge","payload":{"agentId":"AGENT_ID","lessonIds":["<id1>","<id2>"]}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```
Only acknowledge lessons you have genuinely integrated. Ack-without-read is a governance violation.

**6c. MANDATORY user-visible response** (so the operator can verify compliance):

After completing 6a+6b, your first message to the user MUST include this line before any other content:

> `Lesson-check: N lessons read + integrated + acked. Key takeaways: <1-3 bullets>. Klar.`

This is not a suggestion. Without this line, the operator has no evidence that boot hydration happened. Sessions that skip this line will be challenged, and the operator may force a restart.

**Current high-priority lesson (as of 2026-04-06)**: `7070df93-8f9c-4f56-a7d9-6395335891b8` — MULTI_AGENT_COORDINATION_PROTOCOL. Defines claim-before-work broadcast pattern via Neo4j AgentMemory, overlap handling, and response windows. If your session will touch multi-file scope or cross-repo work, this lesson is load-bearing — integrate it before planning anything.

### Step 7: CLAUDE.md + Memory Check
- Read MEMORY.md for relevant context
- Check feedback memories for behavioral corrections
- Note current date and active wave/sprint

**ONLY after Steps 1-7 are complete may the agent begin its actual work.**

---

## SHUTDOWN SEQUENCE (MANDATORY — execute BEFORE ending)

### Step S1: Store Session Findings
```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"agent_id":"AGENT_ID","action":"store","memories":[{"key":"session_summary","value":"WHAT_WAS_DONE","importance":0.8}]}' \
  https://rlm-engine-production.up.railway.app/memory/cortex
```

### Step S2: Teach Other Agents (if new insights found)
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.write_cypher","payload":{"query":"MERGE (m:AgentMemory {agentId: $agentId, key: $key}) SET m.value = $value, m.type = \"teaching\", m.updatedAt = datetime()","params":{"agentId":"AGENT_ID","key":"KEY","value":"INSIGHT"}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### Step S3: Clean Git State
No uncommitted changes, no untracked files, no stale branches.
Local main MUST equal origin/main (0 commits ahead).

### Git Workflow (MANDATORY — prevents merge commit pollution)
```
NEVER commit directly to main. Always:
1. git checkout -b feat/description    ← branch FIRST
2. git add + git commit                ← commit on branch
3. git push -u origin feat/description ← push branch
4. gh pr create + gh pr merge --squash ← PR + squash merge
5. git checkout main                   ← back to main
6. git pull --ff-only origin main      ← fast-forward only (no merge commits)
7. git branch -D feat/description      ← delete local branch

If git pull --ff-only fails → local main diverged → fix with:
  git reset --hard origin/main

NEVER: git pull (without --ff-only) on main — creates merge commits
NEVER: commit to main then branch from it — causes divergence
```

---

## PRIOR WORK CONTEXT (know what happened BEFORE you)

An agent is never the first to touch a task. Other agents or the user have already done work. You MUST hydrate this context.

### From Agent Chain (if invoked via /agent-chain)
The invoking chain passes context. Read it. If you're agent #4 in a 7-agent chain, agents #1-3 have already produced findings — use them, don't repeat their work.

### From Cortex (always available)
Step 1 of boot gives you the last session's state. But also query OTHER agents' cortex:
```bash
# What did the last agent do?
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"agent_id":"omega-sentinel","action":"recall","max_tokens":400}' \
  https://rlm-engine-production.up.railway.app/memory/cortex

# What did the project manager decide?
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"agent_id":"project-manager-90day","action":"recall","max_tokens":400}' \
  https://rlm-engine-production.up.railway.app/memory/cortex

# List all agents with stored memories
curl -s https://rlm-engine-production.up.railway.app/memory/cortex/agents
```

### From Linear (current sprint/wave state)
```bash
# Active issues assigned to agents
curl -s -X POST -H "Content-Type: application/json" -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"{ issues(filter: { state: { name: { in: [\"In Progress\", \"In Review\"] } }, team: { id: { eq: \"e7e882f6-d598-4dc4-8766-eaa76dcf140f\" } } }, first: 20) { nodes { identifier title state { name } assignee { name } priority updatedAt } } }"}' \
  https://api.linear.app/graphql
```

### From Git (what changed recently)
```bash
git log --oneline -10 origin/main
git diff --stat origin/main
```

---

## PLATFORM ARCHITECTURE (know where everything is)

### Repo Ownership Map (8 active repos — NEVER code in the wrong one)

| Repo | Tech | Owner | What goes HERE | What NEVER goes here |
|------|------|-------|----------------|---------------------|
| **WidgeTDC** | Node.js + Express + Prisma | Backend team | API routes, MCP tools, cron jobs, services, Neo4j queries, packages | Frontend components, Python code, Docker-only services |
| **widgetdc-rlm-engine** | Python + FastAPI | RLM team | Reasoning engine, A2A skills, context folding, Q-learning, research pipeline | Node.js code, frontend, Prisma |
| **widgetdc-contracts** | TypeBox + JSON Schema | Architect | Type definitions, wire format schemas, Pydantic models | Business logic, services, routes |
| **widgetdc-canvas** | React + Vite + Railway | Frontend team | Canvas UI, visual workflows, knowledge surface, sidebar widgets | Backend routes, MCP tools, cron jobs |
| **widgetdc-openclaw** | Node.js + Docker | Ops team | AI coding agent gateway, cron validators, Slack hooks | Business logic, new services |
| **widgetdc-librechat** | Docker + LibreChat | Ops team | LibreChat config, plugins, custom launcher | Backend code, MCP tools |
| **Obsidian-Vault** | Obsidian + 35 plugins | Knowledge team | Vault notes, agent profiles (@agents/), intelligence (@intel/), daily journals, templates, CORTEX projections | Backend code, services, API routes |
| **widgetdc-orchestrator** | Node.js | Deprecated | Agent registry, audit tools (being consolidated into WidgeTDC) | New features — use WidgeTDC instead |

### Repo Paths (local disk)
```
C:\Users\claus\Projetcs\WidgeTDC\                    ← MAIN MONOREPO
C:\Users\claus\Projetcs\widgetdc-rlm-engine\         ← Python reasoning
C:\Users\claus\Projetcs\widgetdc-contracts\           ← Type contracts
C:\Users\claus\Projetcs\widgetdc-canvas\              ← Canvas frontend
C:\Users\claus\Projetcs\widgetdc-openclaw\            ← AI agent gateway
C:\Users\claus\Projetcs\widgetdc-librechat\           ← LibreChat
C:\Users\claus\Projetcs\Obsidian\                     ← Obsidian Vault (knowledge, agents, intel)
C:\Users\claus\Projetcs\widgetdc-orchestrator\        ← DEPRECATED (consolidating)
```

### ARCHIVED/DELETED repos (DO NOT USE)
- `widgetdc-consulting-frontend` — **ARCHIVED**. Not on disk. Railway service should be stopped.
- `apps/matrix-frontend-v2` — **DELETED** from monorepo (2026-03-21)
- `apps/matrix-frontend` (v1) — **DELETED** from monorepo (2026-03-21)

### WidgeTDC Monorepo Internal Structure
```
apps/backend/              ← Express API + MCP server (port 3001, esbuild)
  src/bootstrap/           ← MCP tool registration, route mounting, DB init
  src/routes/              ← 121 REST routes
  src/services/            ← 85 services
  src/mcp/                 ← MCP router, tool handlers, memory layers
  src/cron/                ← 10 cron jobs
apps/canvas/               ← MIRROR ONLY — canonical source is widgetdc-canvas repo
packages/                  ← Build order: domain-types → mcp-types → agency-sdk → mcp-backend-core → db-prisma
services/                  ← Legacy service dirs (graph-memory, harvester, rlm-engine stub)
docs/                      ← 40+ architecture/governance docs
config/                    ← Machine policy (agent_autoflow_policy.json, runtime_compliance_policy.json)
```

### Routing Rules (MANDATORY)
1. **Backend code** (routes, services, MCP tools, cron) → `WidgeTDC/apps/backend/`
2. **Python reasoning** (A2A skills, RLM, folding) → `widgetdc-rlm-engine/`
3. **Type contracts** (JSON schemas, TypeBox) → `widgetdc-contracts/`
4. **Canvas UI** (React components, visual workflows) → `widgetdc-canvas/` (NOT WidgeTDC/apps/canvas/)
5. **LibreChat plugins** → `widgetdc-librechat/`
6. **OpenClaw config** → `widgetdc-openclaw/`
7. **Knowledge notes, agent profiles, vault projections** → `Obsidian-Vault/` (synced via CORTEX)
8. **New features** → NEVER in widgetdc-orchestrator (deprecated)

### Obsidian Vault Structure (knowledge layer)
```
Obsidian-Vault/
  @agents/               ← 130+ agent profiles (Neo4j mirrors these as :Agent nodes)
  @intel/                ← Intelligence: CVEs, decisions, failures, lessons
  @discover/             ← Research discoveries
  @ops/                  ← Operational playbooks
  @workspace/            ← Active work context
  00-05 - Sections/      ← Numbered knowledge sections (Overblik, Arbejde, Platform, Drift, Viden, System)
  journal/               ← Daily journals
  _templates/            ← Note templates
  _scripts/              ← cortex-sync.mjs (vault ↔ backend sync)
  .obsidian/plugins/     ← 35 plugins incl. obsidian-widgetdc-connector
```
**Key plugin:** `obsidian-widgetdc-connector` — bridges Obsidian ↔ WidgeTDC backend
**CORTEX sync:** `POST /api/vault/sync` pushes backend projections → Obsidian vault

### Canvas Boundary Rule (from CLAUDE.md rule #12)
`widgetdc-canvas` is canonical owner. `WidgeTDC/apps/canvas` is a MIRROR.
**Always code canvas changes in `widgetdc-canvas` repo.** Never in the monorepo mirror.

### Cross-Repo Boundary Enforcement (CRITICAL — prevents wrong-repo coding)

**Every Claude session operates in ONE repo. It OWNS that repo. It READS but NEVER WRITES to other repos.**

| Session working dir | OWNS (can write) | READS ONLY (never write) | Communication |
|---------------------|-------------------|--------------------------|---------------|
| `WidgeTDC/` | Backend code, MCP tools, services, crons | Obsidian vault, canvas, rlm-engine | API endpoints (`/api/vault/*`) |
| `Obsidian/` | Vault files, CSS, sync config, @agents/ | WidgeTDC backend, canvas | Task files in `@ops/` → backend picks up |
| `widgetdc-canvas/` | React components, UI | WidgeTDC backend | API calls only |
| `widgetdc-rlm-engine/` | Python A2A skills, reasoning | WidgeTDC backend | A2A protocol + `/api/mcp/route` |

**NEVER:**
- Write files to a repo you don't own
- Commit to a repo outside your working directory
- "Fix" another repo's code directly — create a task instead
- Assume you know what another session changed — check git log

**Communication between repos is via API, not filesystem:**
```
Obsidian needs backend fix → writes @ops/TASKS.md → backend session picks up
Backend needs vault update → calls POST /api/vault/sync → vault syncs automatically
Canvas needs new endpoint → creates Linear issue → backend session implements
```

**Detection: If you find yourself editing files in `C:\Users\claus\Projetcs\<OTHER_REPO>\` — STOP. You are violating repo boundaries.**

### Production Services
| Service | URL | Health |
|---------|-----|--------|
| Backend | `backend-production-d3da.up.railway.app` | `/health` |
| RLM Engine | `rlm-engine-production.up.railway.app` | `/health` |
| Canvas | `canwas-frontend-production.up.railway.app` | `/?view=knowledge` |
| LibreChat | `librechat-production-f40b.up.railway.app` | Separate Railway project |

### Data Layer
| Store | Tech | Access | Content |
|-------|------|--------|---------|
| Neo4j AuraDB | Graph DB + Vector | `neo4jService` / MCP `graph.*` tools | 166K+ nodes, embeddings, knowledge graph |
| PostgreSQL | Relational | Prisma ORM (`packages/db-prisma`) | Sessions, auth, structured data |
| Redis | KV Cache | `RedisService.getInstance()` | Working memory, rate limits, TTL cache |

### Key Docs (READ these for architecture context)
| Doc | Location | Content |
|-----|----------|---------|
| Architecture | `docs/ARCHITECTURE.md` | Full system architecture, MCP endpoints, 14 sections |
| Environment | `docs/ENVIRONMENT.md` | All env vars and their purpose |
| PRISM | `docs/PRISM.md` | Evaluation model for platform quality |
| Agent Compliance | `docs/AGENT_COMPLIANCE.md` | Rules for agent behavior |
| Handover Log | `docs/HANDOVER_LOG.md` | Historical archive (not live truth — use Linear for live) |
| Master Policy | `MASTER_POLICY.md` | Canonical governance bundle |
| Implementation Plan | `WidgeTDC_Implementeringsplan_FINAL_CORRECTED.md` | Phase 0-6 plan |

### Knowledge in Neo4j Graph (query BEFORE assuming)

```bash
# What node types exist and how many?
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.stats","payload":{}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route

# Search for specific knowledge
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"srag.query","payload":{"query":"YOUR TOPIC HERE"}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route

# Find KnowledgePacks (bundled research)
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.read_cypher","payload":{"query":"MATCH (kp:KnowledgePack) RETURN kp.name, kp.summary, kp.createdAt ORDER BY kp.createdAt DESC LIMIT 10","params":{}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route

# Find existing research on a topic
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.read_cypher","payload":{"query":"MATCH (n) WHERE any(l IN labels(n) WHERE l IN [\"ResearchProject\",\"ExternalKnowledge\",\"AcademicSource\",\"KnowledgePattern\"]) AND (toLower(n.name) CONTAINS toLower($topic) OR toLower(coalesce(n.summary,\"\")) CONTAINS toLower($topic)) RETURN labels(n), n.name, n.summary LIMIT 15","params":{"topic":"YOUR TOPIC"}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route

# Consulting domain knowledge
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.read_cypher","payload":{"query":"MATCH (d:ConsultingDomain) RETURN d.name, d.description ORDER BY d.name","params":{}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### MCP Tool Namespaces (434+ tools available)
| Namespace | Purpose | Key Tools |
|-----------|---------|-----------|
| `graph.*` | Neo4j read/write | `graph.read_cypher`, `graph.write_cypher`, `graph.stats`, `graph.health` |
| `srag.*` | Semantic RAG | `srag.query` (embedding-based search) |
| `kg_rag.*` | Knowledge Graph RAG | `kg_rag.query` (multi-hop reasoning) |
| `autonomous.*` | Deep AI | `autonomous.graphrag`, `autonomous.agentteam.coordinate` |
| `rlm.*` | RLM Engine | `rlm_reason`, `rlm.start_mission`, `rlm.execute_step` |
| `context_folding.*` | Compression | `context_folding.fold` |
| `template.*` | Business templates | `template.list`, `template.execute` |
| `roma.*` | Self-healing | `roma.heal`, `roma.status`, `roma.observer.kpis` |
| `ask.*` | Intelligence query | `ask.query` |
| `audit.*` | Integrity | `audit.lessons`, `audit.acknowledge`, `audit.dashboard` |
| `linear.*` | Issue tracking | Linear API via `$LINEAR_API_KEY` + GraphQL |
| `slack.*` | Notifications | `slack.channel.post` |
| `memory_operation` | Episodic memory | `RECORD_EPISODE`, `SEARCH_EPISODES`, `LEARN_FACT` |

### Embedding Architecture
- **Primary**: 1024D DashScope via `vector_index` COSINE on Neo4j (28,715 VectorDocuments)
- **NEXUS patterns**: 384D HuggingFace via `CodeEmbeddingSpace` (36 nodes)
- **NEVER mix dimensions** — cosine returns 0 for mismatched vectors

### 90-Day Transformation Context (current sprint)
- **Epic**: LIN-394
- **Day**: 2/90 (started 2026-03-28)
- **Waves**: G5.1 DONE, G5.2 DONE, G5.3 DONE, G5.4 DONE
- **KPI baseline**: advancedPct=2.85%, avgComplexity=1.24 (target: 20%, 3.0)
- **Next**: GATE-FINAL at day 90, LIN-426/427 frontend integrations

---

## INTELLIGENCE STACK (MUST USE — not optional)

Every agent MUST use the intelligence stack for decisions, analysis, and knowledge retrieval. Simple file reads and grep are NOT sufficient when the platform has 166K+ graph nodes, 8 memory layers, and an RLM reasoning engine.

### Priority 1: RLM Engine (Deep Reasoning)

Use for ANY decision that requires multi-step analysis, trade-off evaluation, or architecture reasoning.

```bash
# Single question reasoning
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"rlm_reason","payload":{"instruction":"QUESTION","context":{"scope":"SCOPE"}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route

# Multi-step mission (complex tasks)
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"rlm.start_mission","payload":{"name":"MISSION","objective":"OBJECTIVE","maxSteps":5}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

**When:** Architecture decisions, root cause analysis, security evaluation, strategy formulation, any task where "it depends" is the naive answer.

### Priority 2: RAG (Knowledge Retrieval)

ALWAYS query the graph BEFORE making claims about the system. The graph knows more than your training data.

```bash
# Semantic search (embedding-based)
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"srag.query","payload":{"query":"QUERY"}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route

# Multi-hop graph reasoning (structure-based)
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"kg_rag.query","payload":{"question":"QUESTION","max_evidence":20}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route

# Deep autonomous GraphRAG (vector + structure)
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"autonomous.graphrag","payload":{"query":"QUERY","maxHops":3}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

**When:** ANY question about the platform, its data, its patterns, its compliance state, its history.

### Priority 3: Context Folding (Large Context Compression)

Use when processing >50K tokens of context, multi-source synthesis, or cross-phase data transfer.

```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"context_folding.fold","payload":{"task":"TASK","context":{"data":"LARGE_CONTEXT"},"max_tokens":4000}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### Priority 4: Swarm Consensus (Multi-Agent Decisions)

Use for ANY decision affecting >1 agent, >3 modules, or architecture changes.

```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"autonomous.agentteam.coordinate","payload":{"task":"DESCRIPTION","context":{"severity":"P1"}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

## MEMORY PROTOCOL (MUST USE — not optional)

### Before ANY Action: Read Memory

```bash
# 1. Cortex recall (what happened last session?)
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"agent_id":"AGENT_ID","action":"recall","max_tokens":800}' \
  https://rlm-engine-production.up.railway.app/memory/cortex

# 2. Graph memory (learnings from all agents)
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.read_cypher","payload":{"query":"MATCH (m:AgentMemory) WHERE m.agentId = $id OR m.type IN [\"teaching\",\"intelligence\"] RETURN m.key, m.value, m.type ORDER BY m.updatedAt DESC LIMIT 20","params":{"id":"AGENT_ID"}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route

# 3. Associative memory (holographic recall)
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"activate_associative_memory","payload":{"concept":"RELEVANT_CONCEPT","depth":3}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### After ANY Significant Action: Write Memory

```bash
# Store findings to cortex
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"agent_id":"AGENT_ID","action":"store","memories":[{"key":"KEY","value":"FINDING","importance":0.8}]}' \
  https://rlm-engine-production.up.railway.app/memory/cortex

# Teach other agents
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.write_cypher","payload":{"query":"MERGE (m:AgentMemory {agentId: $agentId, key: $key}) SET m.value = $value, m.type = \"teaching\", m.updatedAt = datetime()","params":{"agentId":"AGENT_ID","key":"KEY","value":"VALUE"}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

## EXTERNAL FEEDBACK TRIAGE (MANDATORY AT BOOT)

```bash
# Linear inbox — unread notifications
curl -s -X POST -H "Content-Type: application/json" -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"{ notifications(first: 20) { nodes { id type createdAt readAt externalUserActor { name } ... on IssueNotification { issue { identifier title } } } } }"}' \
  https://api.linear.app/graphql

# GitHub PR review comments (Copilot + Cursor findings)
gh pr list --state merged --limit 5 --json number --jq '.[].number' | while read pr; do
  gh api repos/Clauskraft/WidgeTDC/pulls/$pr/comments --jq '.[].body[:100]' 2>/dev/null | head -3
done
```

## INFRASTRUCTURE AWARENESS (NEVER ASSUME MISSING)

The platform HAS these services — ALWAYS use them:

| Service | Access | Use For |
|---------|--------|---------|
| Redis | `RedisService.getInstance()` | Rate limiting, caching, working memory |
| PostgreSQL | Prisma ORM (`packages/db-prisma`) | Structured data, sessions, auth |
| Neo4j AuraDB | `neo4jService` / MCP tools | Graph data, vectors, embeddings |
| RLM Engine | `rlm-engine-production.up.railway.app` | Deep reasoning, A2A tasks, context folding |
| Slack | `SlackBotService` / MCP tools | Notifications, reports |
| Linear | `LINEAR_API_KEY` / GraphQL API | Issue tracking, backlog |

**RULE:** Before saying "this requires X integration" — grep for X in the codebase. It's probably already there.

## COMPLEXITY SCORING

Every task should aim for complexity >3. The platform tracks this via ROMA Observer.

| Stack Usage | Score |
|-------------|-------|
| graph.read_cypher only | +1 |
| srag.query | +3 |
| kg_rag.query | +4 |
| context_folding.fold | +5 |
| rlm_reason | +5 |
| rlm.start_mission | +7 |
| autonomous.graphrag | +8 |
| autonomous.agentteam | +10 |

**Target:** Average task complexity >5 across the platform.

## LINEAR TASK MANAGEMENT (how agents track their work)

Agents MUST update Linear programmatically — not just in conversation text.

### Creating Issues
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"linear.issue_create","payload":{"title":"TITLE","description":"DESC","teamId":"e7e882f6-d598-4dc4-8766-eaa76dcf140f","priority":2}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### Updating Status
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"linear.issue_update","payload":{"identifier":"LIN-XXX","state":"In Progress"}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### Posting Progress Comments
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"linear.comment_create","payload":{"issueId":"LIN-XXX","body":"STATUS UPDATE: what was done, what remains"}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### Reading Current State
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"linear.issue_get","payload":{"identifier":"LIN-XXX"}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

**Team ID:** `e7e882f6-d598-4dc4-8766-eaa76dcf140f`
**9 Linear MCP tools available:** dashboard, issues, issue_get, issue_create, issue_update, projects, sync, comments, comment_create

---

## ERROR INVESTIGATION (where to look when something breaks)

### Step 1: Check FailureMemory (what failed before?)
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.read_cypher","payload":{"query":"MATCH (f:FailureMemory) WHERE f.errorType CONTAINS $keyword OR f.errorMessage CONTAINS $keyword RETURN f.sourceName, f.errorType, f.errorMessage, f.recoveryAction, f.recoverySuccess ORDER BY f.createdAt DESC LIMIT 10","params":{"keyword":"YOUR_ERROR_KEYWORD"}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### Step 2: Check ErrorPatterns (known recurring issues?)
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.read_cypher","payload":{"query":"MATCH (e:ErrorPattern) RETURN e.name, e.pattern, e.frequency, e.lastSeen ORDER BY e.lastSeen DESC LIMIT 10","params":{}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### Step 3: Check MCPIncidentTracker (active incidents?)
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"incident.active","payload":{}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### Step 4: Check Sentinel Status (system-wide health?)
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"get_sentinel_status","payload":{}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### Step 5: Check Audit Lessons (have others hit this?)
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"audit.lessons","payload":{"agentId":"AGENT_ID"}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### After Fixing: Record the Fix
```bash
# Write to FailureMemory so others don't repeat it
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.write_cypher","payload":{"query":"MERGE (f:FailureMemory {errorType: $errorType, sourceName: $source}) SET f.recoveryAction = $fix, f.recoverySuccess = true, f.resolvedAt = datetime()","params":{"errorType":"ERROR_TYPE","source":"SOURCE","fix":"WHAT_FIXED_IT"}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

---

## KNOWLEDGE REUSE (search BEFORE you code)

### Search Order (MANDATORY — follow this sequence)
1. **Graph first** — query Neo4j for existing knowledge, patterns, solutions
2. **Asset manifest** — check `.claude/hooks/asset-manifest.json` for existing services
3. **Template registry** — `template.list` for reusable workflows
4. **Codebase search** — grep/glob for similar implementations
5. **NPM packages** — check if a package already solves it
6. **External research** — only AFTER internal sources are exhausted

### Query Graph for Existing Solutions
```bash
# Search for knowledge on a topic
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"srag.query","payload":{"query":"HOW_TO_DO_X"}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route

# Find similar implementations
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.read_cypher","payload":{"query":"MATCH (n:CodeImplementation) WHERE toLower(n.name) CONTAINS toLower($keyword) RETURN n.name, n.path, n.description LIMIT 10","params":{"keyword":"FEATURE_NAME"}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route

# Check KnowledgePacks
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"graph.read_cypher","payload":{"query":"MATCH (kp:KnowledgePack)-[:CONTAINS]->(n) WHERE toLower(kp.name) CONTAINS toLower($topic) RETURN kp.name, kp.summary, collect(labels(n)[0]) AS contentTypes, count(n) AS nodeCount LIMIT 5","params":{"topic":"TOPIC"}}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### Check Asset Manifest (BEFORE creating any new service)
```bash
cat .claude/hooks/asset-manifest.json | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const m=JSON.parse(d);console.log('BLOCKED PATTERNS:');m.blocked_patterns.forEach(p=>console.log('  -',p))})"
```

### Check Templates (BEFORE building a workflow)
```bash
curl -s -H "Authorization: Bearer ${MCP_AGENT_API_KEY}" -H "Content-Type: application/json" \
  -d '{"tool":"template.list","payload":{}}' \
  https://backend-production-d3da.up.railway.app/api/mcp/route
```

### Check Existing Patterns in Codebase
Before creating a new route, cron, MCP tool, or service — read 2+ existing files in the same directory to learn the pattern. This is CLAUDE.md rule #10.

---

## CODE PATTERNS (follow these exactly)

### Route Pattern
```typescript
import express, { Request, Response } from 'express';
const router = express.Router();
router.post('/endpoint', async (req: Request, res: Response): Promise<void> => {
  // validate input, process, respond
});
export default router;
```

### MCP Tool Pattern
```typescript
export async function myToolHandler(payload: unknown, _ctx: unknown): Promise<unknown> {
  const { param } = (payload as { param: string }) ?? {};
  if (!param) return { success: false, error: 'param required' };
  // implementation
  return { success: true, result: data };
}
```

### Cron Pattern
```typescript
import * as nodeCron from 'node-cron';
const cron = (nodeCron as any).default || nodeCron;
export function startMyCron(): void {
  cron.schedule('0 */4 * * *', async () => { /* work */ });
}
```

### Neo4j Write Pattern (ALWAYS MERGE, ALWAYS parameterized)
```cypher
MERGE (n:Label {id: $id})
ON CREATE SET n.createdAt = datetime(), n.prop = $value
ON MATCH SET n.updatedAt = datetime(), n.prop = $value
```

### Response Format
```typescript
{ success: true, result: data }       // success
{ success: false, error: "message" }   // error
```

---

## ESCALATION PROTOCOL

| Tier | Condition | Action | SLA |
|------|-----------|--------|-----|
| 1 | Task fails once | Retry with different approach | 30 seconds |
| 2 | Task fails 3x | Escalate to alternate agent | 2 minutes |
| 3 | Alternate fails | Escalate to omega-sentinel | 5 minutes |
| 4 | Omega can't resolve | Escalate to human (Claus) | Immediate |

### How to Escalate
1. Log failure to FailureMemory
2. Post Linear comment explaining what was tried
3. If Tier 4: post to Slack `#openclaw_chron_status` with `P0:` prefix

---

## HANDOFF PROTOCOL (when passing work to another agent)

When your work is done and another agent continues:

1. **Store state to cortex** with your findings + remaining work
2. **Update Linear issue** with current status + what the next agent needs
3. **Write AgentMemory** teaching node if you learned something useful
4. **List explicitly**: what's done, what's remaining, what blockers exist

The receiving agent will read your cortex state in their Step 1 (boot).

---

## ANTI-PATTERNS (FORBIDDEN)

- Making decisions without consulting RAG first
- Deferring work with "requires integration" without checking if it exists
- Using only file reads when graph has the answer
- Skipping memory read at boot
- Skipping memory write at session end
- Producing output without source attribution
- Treating the intelligence stack as optional/nice-to-have
- Creating new services without checking asset manifest
- Coding before searching graph + templates + codebase for existing solutions
- Updating task status only in conversation — must update Linear programmatically
- Failing silently — every failure must be recorded in FailureMemory
- Working without a Linear issue — every task needs a backlog item
- Ignoring Copilot/Cursor review findings — they are HIGH priority
- Assuming infrastructure is missing without grepping the codebase
