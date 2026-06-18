# B20 — Adoption Promotion Rule

> **Status:** Draft for LIN-1915 epic. Depends on B11/B15/B18 landed (✅).
> Will become formal once B18.1/B18.2 close streamable-emit gap.
>
> **Canonical reference for** when an adoption-related claim can move between L0/L1/L2/L3.

---

## Why this rule exists

Without a formal rule, "100% adopted" is a slogan. With this rule, it is a falsifiable runtime metric.

Pre-B20, claims like `claim:agent-adoption-contract-v1` could be promoted L0 → L3 by operator assertion + 3 historical evidence refs. That worked for one-shot governance achievements (LIN-1911 keystone). It does NOT work for adoption claims, where the relevant evidence is *ongoing runtime behavior* of N agents on M bridges across R repos.

This rule replaces "operator says it's adopted" with "the live graph says it's adopted, on these N agents, M bridges, R repos, for K consecutive days".

---

## The rule

### Maturity progression

| Level | Predicate | Evidence sources |
|---|---|---|
| **L0** | Concept exists in catalog | `:Claim` node registered |
| **L1** | Registered with HOLD reason + ≥3 evidence_refs | `claims_register` event |
| **L2** | **3 consecutive runtime passes per (agent, bridge, repo)** | `adoption.conformance_run` (B15) **AND** `:Adoption` records (B18) |
| **L3** | L2 sustained over **7 consecutive days** + explicit operator approval | All of L2 + `wonder.hyperagent.approval_request_create` with target_action: `claim_promote_l3` |

### Definitions

- **(agent, bridge, repo) tuple**: a unique combination of operating agent (claude/codex/gemini/qwen3_5/qwen_code_smith), MCP bridge (native-mcp / http-mcp-route / claude-in-chrome), and repo context (WidgeTDC / widgetdc-orchestrator / ... / canvas).
- **Pass**: a single `adoption.conformance_run` EventSpine event with `overall: "pass"` AND ≥1 corresponding `:Adoption` MERGE recorded within the same 5-minute window.
- **Consecutive**: 3 or more passes with no failures in between, all within a 24h window for L2 (or 7 daily windows for L3).
- **Sustained**: each of the 7 days has at least one (agent, bridge, repo) tuple meeting the L2 predicate. Drift of a single day to 0-pass demotes back to L1/HOLD.

### Verification cypher (must succeed before promotion)

Runtime schema check 2026-06-09 confirms `:Adoption` uses flat properties
(not `metadata.*` nested), and `transport_type` is NOT YET persisted on
the node. Cypher reflects current runtime; full tuple `(agent, bridge,
repo)` cannot be verified from the node alone until B18.3 (see below)
wires transport_type onto the :Adoption MERGE itself.

Observed schema (live AuraDB, 2026-06-09):
`agent_id`, `pattern_id`, `evidence_ref`, `last_use_at`, `first_use_at`,
`total_uses`, `tenantId`, `last_correlation_id`, `last_recorded_by`

```cypher
// L1 → L2 promotion eligibility for claim X, tuple (agent, bridge, repo).
// `bridge` (transport_type) is currently derived from SpineEvent payload
// only because :Adoption does not yet carry transport_type as a property.
// Once B18.3 wires transport_type onto the :Adoption MERGE, also add
// `AND a.transport_type = $bridge` to the adoption_count branch.
MATCH (a:Adoption)
WHERE a.pattern_id STARTS WITH 'pattern:tool:'
  AND a.last_use_at >= datetime() - duration({hours: 24})
  AND a.agent_id = $agent
WITH count(a) AS adoption_count
MATCH (e:SpineEvent)
WHERE e.event_type = 'adoption.conformance_run'
  AND e.payload.agent = $agent
  AND e.payload.bridge = $bridge
  AND e.payload.repo = $repo
  AND e.payload.overall = 'pass'
  AND e.created_at >= datetime() - duration({hours: 24})
WITH adoption_count, count(e) AS pass_count
RETURN adoption_count > 0 AND pass_count >= 3 AS eligible_L2,
       adoption_count AS observed_adoptions,
       pass_count AS observed_passes
```

L3 cypher is the same but with `duration({days: 7})` and grouping per day, requiring 7 distinct days each meeting the L2 predicate.

### Schema-drift findings (runtime audit 2026-06-09)

| Finding | Severity | Action |
|---|---|---|
| `:Adoption` uses flat `agent_id`, not `metadata.agent_id` | LOW (doc-fix) | This commit |
| `:Adoption` does NOT carry `transport_type` property | MEDIUM (acceptance criterion #9 unverifiable from node alone) | **B18.3** — wire transport_type onto :Adoption MERGE (deferred PR) |
| 76% of :Adoption records in last 4h have `agent_id: anonymous` | **HIGH** (auth-wiring leak; bearer client identity not propagating to adoption emit) | **B18.4** — investigate bearer→agent_id pipeline; root-cause why streamable/native calls fall back to `anonymous` instead of resolved client name (deferred PR) |

### Promotion path through the LIN-1911 protocol

Promotion uses the existing typed promotion path (no new MCP tools needed):

1. **L0 → L1**: `claims_register` (existing). Requires 3+ `evidence_refs`. No plan/approval — read-only-ish.
2. **L1 → L2**: NEW typed tool `claims.promote_l2_adoption` (out of scope for this draft — depends on B12-style typed surface). Until that tool exists, L1 → L2 is **operator-driven manual promotion** logged in this doc.
3. **L2 → L3**: `claims_promote_l3` (existing, hardcoded enum). Adoption claims must be added to the enum in a separate governance PR before any L3 promotion is possible.

### Anti-fabrication invariants

- No promotion may be granted on the basis of `dry-run` test data. The verification cypher must run against the live graph (`backend-production-d3da.up.railway.app` against AuraDB).
- The 3-pass streak must be derived from real `adoption.conformance_run` events with distinct `correlation_id` values. Replays of the same correlation_id count as ONE pass, not three.
- If `adoptions_24h = 0` on the deployed SHA, no adoption claim is L2-eligible regardless of CI-pass count. CI evidence is insufficient.
- All promotion paths must reference the deployed `commit_sha` at time of evidence collection. Pinning the SHA is mandatory.

---

## Current snapshot (will be refreshed on each promotion attempt)

As of 2026-06-09 post-merge runtime audit (backend `844d564194c4`):

| Tuple | L2 eligible? | Observed |
|---|---|---|
| (anonymous, *, *) | N/A | 26 records (76% of last 4h) — bearer→agent_id wiring leak; **B18.4 deferred** |
| (system, *, *) | N/A | 4 records — internal cron paths |
| (owui-operator, *, *) | NO | 4 records; needs 3+ adoption.conformance_run passes |
| (claude, http-mcp-route, WidgeTDC) | NO | 0 :Adoption with agent_id=claude observed |
| (codex, *, *) | NO | 0 :Adoption with agent_id=codex observed |
| (gemini, *, *) | NO | 0 :Adoption with agent_id=gemini observed |

**Therefore:** `claim:agent-adoption-contract-v1` stays at L1/HOLD. The
acceptance criterion #9 (3 consecutive runtime passes per tuple) is
currently **unverifiable from the :Adoption node alone** because
transport_type is not persisted there (B18.3 gap) AND most actor_ids
fall back to `anonymous` instead of resolved bearer client name (B18.4
gap). Honest framing: L2-promotion is blocked on instrumentation, not on
adoption volume — 33 records in 4h shows the funnel works, but the
attribution does not.

---

## What this rule enables (for future agents reading this doc)

If you are an agent or operator considering whether to promote an adoption-related claim:

1. Run the verification cypher with your candidate (agent, bridge, repo) and claim_id
2. If `eligible_L2 = false`, the answer is NO. Do not claim "ready for L2".
3. If `eligible_L2 = true`, you may file a promotion request. Use the LIN-1911 promotion protocol (plan_create → approval mint → operator approve → call the typed promotion tool).
4. Do not bypass this rule with an `evidence_ref` that points at this document. The doc is policy; the evidence is the graph.

---

## Cross-references

- LIN-1915 epic (parent)
- LIN-1911 promotion protocol (`docs/governance/LIN-1911-PROMOTION-PROTOCOL.md`)
- B11 contract schema (widgetdc-contracts#76)
- B15 conformance runner (`scripts/run-adoption-conformance.mjs`)
- B17 calibration runner (`scripts/run-intent-calibration.mjs`)
- B18 telemetry wire-up (PR #6137)
- B18.1/B18.2 streamable gap fix (PR pending)
- B19 dashboard (Gemini-App PR #13)
- R15.5b — tool-success ≠ persistence (`CLAUDE.md` Rules)
- Pattern #1 — Runtime Truth Verification (`docs/governance/PATTERN_LIBRARY.md`)

---

## Hash pin

Once this rule is finalized (post B18.1/B18.2 land), B13's parity gate will be extended to enforce hash-equality of this file across all 7 repos. Until then, this doc lives at `WidgeTDC/docs/governance/B20-ADOPTION-PROMOTION-RULE.md` only.
