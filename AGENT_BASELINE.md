# AGENT BASELINE

> **canonical_revision:** `2026-06-01` · **inherits:** [`GLOBAL_AGENT_GOVERNANCE.md`](GLOBAL_AGENT_GOVERNANCE.md) (cross-repo baseline)

Canonical inheritance file for all WidgeTDC subagents in `.claude/agents/`.
Every agent file at the top declares `> **INHERITS: [AGENT_BASELINE.md](AGENT_BASELINE.md)**` and follows the contract below.

**Scope split:** this file covers the **subagent-runtime contract** (boot, memory, lesson-check, typed-write tools, self-check on `task_complete`). Cross-repo policy that applies to every agent in every repo lives in `GLOBAL_AGENT_GOVERNANCE.md` — referenced from §6, §7, §8, §9 below instead of duplicated here.

Restored 2026-05-06 as Phase B of the master-prompt rollout. Consolidated 2026-06-01 to thin-pointer sections that duplicated GLOBAL_AGENT_GOVERNANCE.md / PATTERN_LIBRARY.md (eliminating drift; see `:DegradationEvent` notes in PR body).

---

## 1. Boot contract

| Field | Value |
|------|-------|
| `startup-mode` | `hyperagent` |
| `startup-priority` | `rag-first-rlm-second` |

**Canonical spec:** [`docs/directives/UNIFIED_ADOPTION_PROTOCOL_v1.md`](docs/directives/UNIFIED_ADOPTION_PROTOCOL_v1.md) §1.1 defines the 4-step order before any non-read action:

1. `intent_detect` — scope + ownership lock
2. RAG retrieval — `srag.query` + `kg_rag.query` (or approved fallback per `package-manifest.json::intelligence_policy.rag.approved_sources`)
3. `reason_deeply(mode='plan')` — constrained by RAG evidence
4. only then — implementation, grep, file edits, graph writes

Skip = off-spine. Output from off-spine runs must be flagged `unverified` and re-run before being acted on.

---

## 2. Intelligence Stack mandate (R11 · HARD GATE)

Agents MUST call at least one intelligence-stack tool before any research `grep`, `cat`, or `Read`. Violation → `EXIT 2 BLOCK` from `intelligence-stack-gate.sh`.

| Tool | Score | Purpose |
|------|-------|---------|
| `srag.query` | +5 | Semantic search over platform knowledge |
| `kg_rag.query` | +5 | Structured graph-backed retrieval |
| `rlm_reason` | +5 | RLM single-shot reasoning |
| `rlm.start_mission` | +7 | Autonomous multi-step reasoning |
| `context_folding.fold` | +5 | Compressed multi-doc context |
| `autonomous.graphrag` | +8 | Graph-augmented deep retrieval |

**Machine-policy truth:** `config/agent_autoflow_policy.json::intelligence_stack_enforcement`. **Target:** `targets.average_complexity ≥ 3.0`.

**Enforcement chain:**
- `enforcement_jobs: ["intelligence-stack-gate"]` in `config/directives/package-manifest.json`
- `.claude/hooks/intelligence-stack-gate.sh` (PreToolUse Bash)
- `.claude/hooks/complexity-tracker.sh` (PostToolUse, session score)
- `scripts/validate-directive-intelligence-evidence.mjs` (CI hard gate)

**Graph-first existence rule (HARD — see §11 + [`docs/governance/GRAPH_SELF_AWARENESS.md`](docs/governance/GRAPH_SELF_AWARENESS.md)):**
Before asserting that ANY component/tool/capability/canary/claim/service/process "does not exist" or "is not built", an agent MUST (1) count the graph label(s), (2) grep the code + cron routes, (3) check `:*Event`/EventSpine for proof-of-run. Docs/RAG show intent; the **graph + deployed code are runtime truth**. An "unbuilt" claim from doc/RAG alone is unverified and must be flagged as such. If any check finds something, the correct claim is "built but <specific gap>", never "not built".

---

## 3. Memory protocol (AgentMemory-First)

Cross-agent learning hierarchy per [`docs/governance/AGENTMEMORY_FIRST_HIERARCHY.md`](docs/governance/AGENTMEMORY_FIRST_HIERARCHY.md):

1. **`:AgentMemory`** — first-tier (cheap, current, cross-agent). Query before any document or vector lookup.
2. **`kg_rag.query`** — second-tier (graph-backed, traversed evidence).
3. **`:KnowledgeDocument`** + **`:VectorDocument`** — third-tier (corpus retrieval, slowest).

Write-back path: every meaningful insight or correction lands as a new `:AgentMemory` node with `agentId`, `key`, `value`, `type`, `updatedAt`. Teaching events (cross-agent corrections) write `:AgentMemory{type:'teaching'}` plus an EventSpine `governance.lesson_taught` entry.

---

## 4. RAG-first reasoning

`srag.query` and `kg_rag.query` (or approved fallback) **always before** `grep`/`cat`/`Read` for research-style tasks. Implementation tasks (writing code, editing files) may skip RAG only after the boot-time RAG step (§1) has already run for the parent task.

Sentinel: if response time on `srag.query` exceeds 5 s, fall back to `kg_rag.query`. If both fail, log a `:DegradationEvent` and proceed with `repo-truth` (grep+cat).

---

## 5. Lesson-check (boot-time)

Before first non-read action, every agent runs:

```cypher
MATCH (m:AgentMemory)
WHERE m.type = 'teaching'
  AND coalesce(m.acknowledged, false) = false
  AND ($agent_id IN coalesce(m.audience, ['*']) OR coalesce(m.audience, ['*']) = ['*'])
RETURN m.key AS key, m.value AS lesson, m.updatedAt AS taught_at
ORDER BY m.updatedAt DESC LIMIT 10
```

Acknowledge each via `audit.acknowledge` MCP before proceeding. Skipping the lesson-check is treated equivalently to skipping the startup mandate.

---

## 5.5 Boot preflight (ADR-011 Track 3 — fail early)

Before the first material action, run the shared preflight so identity + auth + lessons are confirmed up-front — instead of hitting a 401 wall ten steps into a task (the friction that drove agents to hardcode keys or fabricate evidence):

```bash
node scripts/agent-boot-preflight.mjs --agent-id "$AGENT_ID"
```

It resolves the bearer from env (never hardcoded), calls `GET /api/whoami` (ADR-011 Track 1 — tells you your client, scopes, `allowed_tools`, and which env var supplied the key), then fetches `audit.lessons`. Exit codes:
- **0 OK** — proceed.
- **1 YELLOW** — degraded (lessons/whoami unreachable) — proceed read-only / advisory, label output `diagnostic_only`.

It also reports a **SHARED IDENTITY** warning when the bearer is accepted but does not resolve to one of the seven per-agent writer identities (`claude-desktop`, `claude-code-cli`, `codex-desktop`, `cursor-cli`, `gemini-cli-hub`, `qwen-desktop`, `deepseek-desktop`). `key_class: dedicated` alone is not enough: service, CI and operator bearers are dedicated too, and `owui-operator` is mapped by two separate envs so OpenClaw and the Orchestrator share it. In all those cases the backend cannot tell your session apart from every other holder of that key, so your review verdicts, signoffs and A2A attribution are **not attributable** and must be labelled as such. This warning does **not** restrict access and does not change the exit code: the per-agent keys are not yet minted, so gating on it would block every agent on a precondition none can satisfy. Fix it by provisioning this agent's own key (see `DEDICATED_MCP_KEY_ENVS` and the matching `agent:*:mcp_key` vault seed) — never by rotating credentials. Once the keys exist, set `PREFLIGHT_REQUIRE_DEDICATED_IDENTITY=true` to make it blocking.
- **2 BLOCKED** — no bearer or whoami 401 — DO NOT proceed with material actions; never hardcode a key to work around it. Ask the gateway (`GET /api/whoami`) which key class is expected.

This replaces key-guessing: if you are unsure which bearer fits an endpoint, the preflight (and `whoami`) tell you — do not guess among the platform-bearer aliases.

---

## 6. Governance gates inherited

Each agent inherits the following hard gates from [`GLOBAL_AGENT_GOVERNANCE.md`](GLOBAL_AGENT_GOVERNANCE.md):

| Rule | Phase | Topic |
|------|-------|-------|
| **R15** | θ-Phase | Goldmine Pattern Enforcement (CoT block, mode contracts) |
| **R16** | Manus | Event-driven autonomy (event-streaming bounds) |
| **R17** | PSR-Foundation | PSR / Meta-Skill / Pattern Library |
| **R19** | Sovereign | Sovereign memory hydration before graph mutations (`sovereign.open_session(agent_id, section_key)`) |
| **R20** | Triad | Adoption / Consolidation / Runtime-Evidence (see §8 below) |

Violation of any HARD GATE = task halt + corrective lesson written to `:AgentMemory{type:'teaching'}`.

---

## 7. The 13 Patterns (R17 — Pattern Library)

> **Source of truth:** [`docs/governance/PATTERN_LIBRARY.md`](docs/governance/PATTERN_LIBRARY.md) (13 canonical patterns, ordinal-stable).
> **Cross-repo binding:** [`GLOBAL_AGENT_GOVERNANCE.md`](GLOBAL_AGENT_GOVERNANCE.md) §R17.2.
> **Selection mandate:** before any patch or architecture decision, cite at least one pattern by slug (e.g. `pattern:eventspine-before-success`) — R17 HARD GATE enforced by `pattern-citation-check`.
> **Graph mirror:** `:PatternLibraryEntry` nodes synced from the markdown by `scripts/pattern-library-sync.ts`. Adoption tracking on `:Adoption{agent_id, pattern_id}` per R20.1.

Anti-pattern: 3-attempt patch-loop without root-cause walk (pattern #2 violation).

The 13 patterns are not re-listed here to prevent drift — previous duplication (12 patterns in this file vs 13 in PATTERN_LIBRARY.md) is the exact problem this consolidation fixes.

---

## 8. The Triad — ADOPTION / CONSOLIDATION / RUNTIME-EVIDENCE (R20)

> **Source of truth:** [`GLOBAL_AGENT_GOVERNANCE.md`](GLOBAL_AGENT_GOVERNANCE.md) §R20.1 (Adoption), §R20.2 (Consolidation), §R20.3 (Runtime Evidence).
> **Pattern-Library binding:** R20.1 enforces `:Adoption` writes for every shipped pattern in `PATTERN_LIBRARY.md`; canonical-mirror sync via `scripts/pattern-library-sync.ts`.
> **Subagent-specific obligation:** every subagent MUST emit `:Adoption{agent_id: <self>, pattern_id: <cited>}` per pattern invocation. Missing adoption row blocks claim promotion above L2.

The three themes apply jointly to every claim above L1. The canonical definitions, machine-checkable contracts, and CI gates (`pattern-citation-check`, `episode-writeback-check`, `claim-evidence-tier-check`) live in GLOBAL_AGENT_GOVERNANCE.md to avoid the drift this consolidation eliminates.

---

## 8.4 Tier B v2 typed-write tools (preferred over raw `graph.write_cypher`)

When an agent needs to perform one of the operations below, **use the typed MCP tool** instead of `graph.write_cypher` with hand-rolled Cypher. Typed tools enforce Pattern #4 / #6 / #7 at the service layer, emit governance events automatically (Pattern #9), and bypass the Iron Dome write-gate's intent/evidence boilerplate.

| Operation | Typed tool | Replaces |
|-----------|------------|----------|
| Close an `:Episode` with evidence_ref | `episode.close` | raw `MERGE (e:Episode) SET e.closedAt …` |
| Create a HyperAgent plan (preview or apply) | `plan.create` (default dry-run; pass `apply:true` to persist) | direct call to orchestrator's `/api/hyperagent/create_plan` |
| Store a memory entity | `memory_store` (now type-whitelisted server-side) | raw `MERGE (m:Memory) …` |
| Record pattern adoption | `wdc adoption record pattern:X` | raw `MERGE (a:Adoption) …` |

**Server-side type whitelist for `memory_store`** (enforced 2026-05-06): `note`, `teaching`, `reflection`, `intelligence`, `observation`. Categories like `policy` and `directive` are **rejected** server-side — they are owned by the governance bundle, not user-side memory.

**Plan creation guardrails** — `plan.create` is dry-run by default. Apply mode requires explicit `apply:true` (or `dry_run:false`) and persists `:HyperAgentPlan` to the graph plus calls the orchestrator endpoint. **Plan APPROVAL and EXECUTION remain in the HyperAgent UI** — agents must not wrap those flows.

**Episode closure contract** — `episode.close` requires non-empty `evidence_ref` (Pattern #4 enforced at the service layer; rejects empty at three layers: argparse, cmd, service). The `evidence_ref` should be a PR URL, EventSpine `correlation_id`, or commit SHA.

**Cross-service auth (introduced 2026-05-07 via the unified service-bearer guard-rail)** — when calling internal services (orchestrator, RLM, LibreChat, Open WebUI, Steel, Arch MCP), use `getServiceCredentials(target)` from `apps/backend/src/utils/serviceBearer.ts` instead of reading `process.env.<TARGET>_API_KEY` directly. The helper falls back through legacy → unified → default bearer; one platform bearer authenticates to every internal target. `cross-service-auth-audit.mjs` (CI gate) blocks any new direct env reads.

**Two MCP surfaces — pick the right one (verified 2026-06-02; Lesson `8997d42d`)** — the platform has TWO MCP tool namespaces with DISJOINT toolsets. Calling a tool on the wrong surface returns `Tool Not Found` (404) and looks "broken" when it is not.
- **Backend** `https://backend-production-d3da.up.railway.app/api/mcp/route` — graph/audit/srag/claims/credential/governance.* tools, the universal governance gate, EventSpine. Does NOT host `inventor_run` or `governance_plan_create`.
- **Orchestrator MCP plugin** (`mcp__plugin_widgetdc-orchestrator_*`) — the Inventor + HyperAgent governance-plan chain lives here: `governance_plan_create` → `governance_plan_approve` → `inventor_run` (one store). `inventor_status` is read-only here.
- The dotted `inventor.run_approved` DOES exist on the backend and is correctly gated (`PLAN_REQUIRED`); its `next_step` points to the orchestrator plan endpoint — that is the gate naming the right store, NOT a store-split. To run a staged_write plan: create+approve it on the orchestrator surface (needs operator-tier auth + a real `bom_id`), then pass the `plan_id`.
- Do NOT call `inventor_run` on the backend route, and do NOT file an "orphaned gate / store-split" P0 from a wrong-surface 404 (that is a WRONG_EVENTSPINE_VERIFIER-class false finding).

---

## 9. Forbidden completion language

> **Source of truth:** [`GLOBAL_AGENT_GOVERNANCE.md`](GLOBAL_AGENT_GOVERNANCE.md) §R17.7.
> **Enforcement:** `:VerificationStrategy{slug:'claim_language_audit'}` rejects claims using forbidden phrasing and holds them at their current tier.

The cross-repo canonical forbidden/approved language list lives in GLOBAL §R17.7 to prevent drift. Subagents inherit it without restating.

---

## 10. Self-check (last reasoning step — HARD GATE on `task_complete`)

Before declaring any task complete, every agent runs this self-check. **A "no" on any line that is in scope for the task type halts completion.**

**Boot + reasoning discipline:**

- [ ] Boot contract honored — `intent_detect` → RAG → `reason_deeply(mode='plan')` ran before first edit
- [ ] Intelligence stack score for this session ≥ 3.0
- [ ] Lesson-check ran at boot; pending teachings acknowledged
- [ ] At least one Pattern Library pattern cited (R17)
- [ ] Any "X is not built / does not exist" claim was graph-verified (count + code + EventSpine), not asserted from docs/RAG (§2 graph-first rule, §11)

**Graph + evidence:**

- [ ] Iron Dome write-gate `intent` + `evidence` supplied for any graph mutation
- [ ] Sovereign memory hydration ran (R19) if any graph write occurred
- [ ] `:Adoption` write-back fired for each pattern invocation (R20.1)
- [ ] Runtime evidence present per the §8.3 definition (R20.3)

**Consolidation — closing the chain (R20.2 — HARD GATE):**

- [ ] Working tree clean — `git status --short` shows only ignored/`tmp/` paths
- [ ] All commits pushed — `git status` does NOT say "ahead of origin"
- [ ] Code changes opened as PR (or operator-blocked items surfaced as `JEG GODKENDER` block)
- [ ] PR auto-merge queued (or merged) — never leave a PR open + un-queued
- [ ] After merge: local main fast-forwarded to origin/main
- [ ] Deploy-sensitive PRs: Railway deploy picked up the new SHA (uptime reset confirms)
- [ ] Claim-touching PRs: `:Episode` write-back persisted inside 4h of deploy

**Output discipline:**

- [ ] No forbidden completion language used (§9)
- [ ] Operator-bound items end with copy-paste-ready `JEG GODKENDER:` block (per `feedback_provide_exact_unblock_sentence` memory rule)

A self-check that returns "no" on any in-scope line means the agent must EITHER correct the gap inline (preferred — captain-executes pattern) OR surface it as `BLOCKED — needs operator: <exact action>` with the specific gap named. **Silent task completion with a non-clean self-check is a HARD GATE violation** and writes a `:FailureMemory{type:'silent_completion'}` event for cross-agent learning.

---

## 11. Graph self-awareness (the platform's runtime self-model)

> **Canonical spec:** [`docs/governance/GRAPH_SELF_AWARENESS.md`](docs/governance/GRAPH_SELF_AWARENESS.md). Read it before making any existence/maturity claim about platform infrastructure.

**The Neo4j AuraDB graph is the platform's self-model.** The whole architecture — repos,
services, tools, capabilities, patterns, processes, agents, claims, runtime events — is
(partially) mirrored there, and that reflection is the source of runtime truth. Docs and
RAG describe *intent* and are routinely stale or self-contradictory (capability counts of
448/429/385/335/256+ all coexist in docs; the governed runtime number is ~219).

**Three obligations, all enforced:**

1. **Verify before "unbuilt".** Never assert non-existence from docs/RAG alone. Run the
   three-step protocol (count label → grep code+cron routes → check `:*Event` for
   proof-of-run). Cite the queries + counts. If anything is found, the claim is
   "built but <specific gap>", never "not built". (§2 graph-first rule; §10 self-check.)

2. **Hydrate self-awareness at boot.** `whoami` (identity/scope) → `sovereign.plan_position`
   (R19) → query the §2 apex labels for your task's subsystems (`kg_rag`/`srag` hybrid then
   `data_graph_read` for exact counts) → lessons. Skipping architecture hydration before an
   existence/maturity claim = off-spine; output flagged `unverified`.

3. **Keep the self-model current.** Any PR adding a service/tool/capability/canary/claim/
   process/migration MUST either include the graph-reflection write (typed `graph.promote_*`
   / governed MERGE + read-back) OR name the scheduled reflector that will do it
   (`graph.sync_tools` on deploy, `graph_hygiene_run`, the migration drift-detector, etc.)
   in the PR body. "Built in code but invisible in the graph" is an incomplete delivery.
   Self-model writes are confirmed by AuraDB read-back, not tool-success (R15.5b).

**Known self-model gaps (work items, not excuses):** `Migration` ledger = 1 vs 44+ on-disk
(drift); no explicit apex `:SelfModel`/`:ArchitectureComponent` spine tying repos→services→
tools→capabilities→processes into one traversable self-portrait. Closing these is the
continuous-update process in the canonical spec §5.
