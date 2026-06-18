# B22 — Abandoned-work harvest to Phantom BOM

> **Status:** Draft for LIN-1915 epic. Design captured during discovery session
> 2026-06-08 after `inspect-orphan-branches.ps1` revealed **95 abandoned
> codex branches on WidgeTDC alone**, 8 of which contain demonstrably real
> work that never reached main.
>
> Implementation deferred until B18.1/B18.2/B12/B21 land. This document is
> the design anchor so the idea is not lost.

---

## Evidence language discipline

This document uses three explicit evidence levels:

| Label | Meaning |
|---|---|
| **Observed** | Directly observed in the cited scan, graph readback, PR, commit, or runtime output. |
| **Hypothesis** | Plausible interpretation or forecast that has not yet been validated by B22 runtime adoption. |
| **Verified** | Reproduced through a tool, CI check, runtime endpoint, graph readback, or repeated probe. |

Do not upgrade a B22 hypothesis into a platform claim without runtime evidence.
For compression/folding explanations, describe ratio-1 cases as **high
information-density / identifier-heavy input** only when the identifier profile
has been inspected. Avoid vague phrases such as "already compact structured"
unless a separate structure metric is actually measured.

## What problem this solves

Background agents (codex, qwen-fallback experiments, etc.) routinely produce
work that:

1. Reaches a local branch
2. Passes basic feasibility (the code/diff exists)
3. Never gets pushed, OR gets pushed but no PR opened, OR PR closed without merge
4. Sits in a worktree for weeks-months
5. Eventually gets deleted as "cleanup" with no inspection of value

**Numbers observed (2026-06-08, single discovery scan):**

| Repo | Stale codex branches |
|---|---|
| WidgeTDC | 95+ |
| widgetdc-canvas | 8 |
| WidgeTDC-Platform-Modules | 14 |
| widgetdc-openwebui | 13 |
| Others combined | ~7 |
| **Total platform-wide** | **~137** |

If we estimate 10% contain reusable insight (line-of-code patterns, error
recovery strategies, framework integration solutions, novel test cases),
that is **~14 candidate skill-fragments**. This is a sizing hypothesis, not a
verified reuse count, until the first B22 harvest round produces reviewed
`:BOMItem` records and downstream materialization/adoption telemetry.

---

## Why "harvest to BOM" is the right primitive

The platform already has the four runtime-verified pipeline stages this
design needs:

1. **`evidence_stream`** — accepts arbitrary evidence envelopes with
   chunks, validates schema, stages for folding.
2. **`evidence_fold`** with `folding_method: semantic_cluster` — clusters
   related text into coherent groups.
3. **`decision_bom_generate`** with `framework: mece-v1` — turns folded
   clusters into typed `:BOMItem` nodes with explicit method_selected,
   data_class, validation_status.
4. **`graph_promote_phantom_bom_run`** — runtime-verified end-to-end
   2026-06-08 via `bomrun-lin1911-a1c-20260608`.

No new tools required. Only one new `source_type` value:
`"codex_branch_harvest"`.

Observed substrate: the `:PhantomBOMRun` path already carries lineage. Hypothesis:
the PSR (Phantom Skill Registry) materialization layer
(`claim:phantom-skill-registry`, currently L0) can lift reviewed harvest output
into agent-consumable skills. The current evidence boundary is test data (10
`:SkillMaterialization` records, all source `psr-chain-run-test`); B22 harvest
would provide real candidate inputs, but adoption remains unverified until B18
telemetry records materialization in live agent traffic.

---

## Pipeline design

```
[Stale codex branch found by inspect-orphan-branches.ps1]
                      ↓
[Operator marks branch "worth harvesting" — explicit, not bulk]
                      ↓
[scripts/harvest-abandoned-branch.mjs <repo> <branch-ref>]
   ├─ git log --format=%B main..<branch>           → commit messages
   ├─ git diff --stat main..<branch>               → file scope
   ├─ git diff main..<branch>                      → full diff (cap 50KB)
   ├─ gh pr view <pr> --json title,body,comments   → PR context if exists
   └─ gh issue view <linear-ref>                    → linked Linear context
                      ↓
[Build EvidenceEnvelope:
   source_type: "codex_branch_harvest"
   evidence_ref: "evidence:codex-harvest-<repo>-<branch>-<sha>"
   metadata: {
     repo, branch, base_sha, head_sha, age_days,
     pr_number, pr_state, linked_linear_refs,
     line_count, file_count
   }
   chunks: [
     {content_type: "commit_log", text: ...},
     {content_type: "file_diff", text: <per-file diff>, ...},
     {content_type: "pr_context", text: <pr title + body + key comments>}
   ]
]
                      ↓
[evidence_stream → staged_evidence]
                      ↓
[decision_bom_pipeline:
   folding_method: "semantic_cluster"
   framework_id: "framework:mece-v1"
   intent: "harvest_abandoned_codex_branch"
]
                      ↓
[:PhantomBOMRun (status=review_required, graph_promoted=false)
 + N x :BOMItem (one per coherent change cluster)
 + 1 x :WorkArtifact (the harvest report)]
                      ↓
[Operator reviews staged BOM — accept / reject / partial]
                      ↓
[For accepted: full LIN-1911 protocol (plan + approval + graph_promote)]
                      ↓
[:PhantomBOMRun{
   graph_promoted: true,
   status: completed,
   intent_label: "abandoned_work_harvest",
   source_type: "codex_branch_harvest",
   harvest_metadata: {original_repo, original_branch, ...}
 }]
                      ↓
[PSR pheromone-deposit on related :Pattern, :Capability, :MCPTool nodes
 with signal: positive_discovery]
                      ↓
[Future agent task hits problem space that overlaps BOMItem's domain]
                      ↓
[PSR materializer surfaces harvested skill as :SkillMaterialization
 → injected into agent context at task start]
                      ↓
[B18 emit `:Adoption` MERGE — observable runtime adoption of harvested skill]
                      ↓
[B19 dashboard shows: "Harvested skills materialized today: N"]
```

---

## Why each step is necessary (no shortcuts)

| Step | Why we can't skip |
|---|---|
| Operator-marked, not bulk | First N rounds teach us heuristics. Bulk-harvest reinjects failure-patterns. |
| EvidenceEnvelope w/ structured chunks | Random git diff is not a knowledge graph artifact. Chunks let folder cluster intent-by-intent. |
| semantic_cluster folding | Patches usually represent multiple intentions. Folding separates them. |
| MECE BOMItem materialization | Without typed BOMItems, harvest data is not queryable for materialization. |
| Operator-review gate | The asymmetry: harvest-error costs time, slet-error costs work. Review-on-promote is the cheap insurance. |
| Full LIN-1911 protocol on promote | Same gate as any production_write — keeps audit chain unbroken. |
| Pheromone deposit | Hypothesis: materializer ranking uses pheromone pressure to surface candidates. Without deposit, harvested fragments are expected to remain invisible to that path. |
| `:Adoption` MERGE on materialization | Without B18 emit, materialization is unobservable. B22 needs B18 to be measurable. |

---

## Anti-patterns (forbidden)

1. **Bulk harvest** — never harvest >10 branches in one round. The operator-review
   gate must remain bottlenecked enough to detect anti-patterns before they spread.
2. **Auto-promote without review** — every harvested PhantomBOMRun must
   pass through operator review. Codex branches were abandoned for reasons;
   harvest must distinguish "lost in flow" from "rejected on merit".
3. **Skip `source_type: codex_branch_harvest`** — without this tag, harvest
   BOMs become indistinguishable from real-flow BOMs. The runtime evidence
   trail must always be reconstructable.
4. **Harvest worktrees we cannot trace to a source** — if the branch has no
   linked PR, no linked Linear issue, AND no clear commit message,
   skip-and-document. Untraceable provenance is poison.
5. **Cite harvested-fragment success as platform L3 evidence** — until N
   materializations have shown measurable downstream impact (claim
   promotion, error reduction, time-to-task-complete improvement), the
   harvest claim stays at L1/HOLD.

---

## Measurable success criteria

The point of B22 is observable runtime impact, not "we did the harvest".

| Window | Metric | Target |
|---|---|---|
| 1 session | Branches inspected | 10-30 |
| 1 session | Branches marked worth harvesting | 3-10 |
| 1 session | `:PhantomBOMRun{source_type:codex_branch_harvest}` | 3-10 |
| 1 week | `:BOMItem` from harvest | 15-50 |
| 1 week | `:SkillMaterialization` count rise (currently 10) | ≥30 |
| 1 month | `:Adoption` records linked to harvested patterns | ≥20 |
| 1 month | Claim `claim:phantom-skill-registry` (currently L0) | L0 → L1 registered |
| 3 months | Materialization-50 predicate satisfied via harvest | Yes/No |

If after 1 month the `:Adoption` count linked to harvest is 0, **the
materialization-loop is not connected to agent context**. That is a structural
finding — surface it, do not double down on more harvest.

---

## Dependencies

| Depends on | Status | Notes |
|---|---|---|
| B11 contract schema | ✅ merged | Required for `:AdoptionRepo` link from harvest BOM |
| B18 telemetry | ✅ merged | Required for materialization observability |
| B18.1 streamable emit fix | 🔄 in flight | Without this, materialization on streamable path is invisible |
| B15 conformance probe | ✅ merged | Confirms agent-bridge can call required tools |
| B17 intent calibration | ✅ merged | Routes harvested skills to agent tasks |
| B12 :AdoptionRepo MERGE | 🔄 in flight | Repo provenance for harvested fragments |
| B20 promotion rule | 🚧 draft | Defines when harvested claims may promote |
| B21 fold-at-source contract | 🔄 in flight | Future harvests may use fold to compress evidence chunks |

---

## Operator runbook (when implementation lands)

### Phase 1 — Identify candidates

```bash
.\scripts\inspect-orphan-branches.ps1 -Json > orphan-scan.json
# Filter to T2_REVIEW + T3_INSPECT
# For each, check: does commit message describe value? Does PR comment thread show approach?
```

### Phase 2 — Mark worth harvesting

```bash
# Create a tagged list — operator-curated
echo "WidgeTDC|codex/lin-1228-openmythos-monotonic|preserve-test-cases" >> harvest-queue.txt
echo "WidgeTDC|codex/wonder-runtimeproof-84c4343a|preserve-runtime-evidence-pattern" >> harvest-queue.txt
# Max 10 per round — discipline matters here
```

### Phase 3 — Execute harvest pipeline (script)

```bash
# For each entry in harvest-queue.txt:
node scripts/harvest-abandoned-branch.mjs WidgeTDC codex/lin-1228-openmythos-monotonic
# Emits: evidence:codex-harvest-WidgeTDC-codex-lin-1228-openmythos-monotonic-<sha>
# Stages PhantomBOMRun (graph_promoted=false, status=review_required)
```

### Phase 4 — Review staged BOMs

```cypher
MATCH (b:PhantomBOMRun {source_type: "codex_branch_harvest"})
WHERE coalesce(b.graph_promoted, false) = false
OPTIONAL MATCH (b)-[:HAS_ITEM]->(i:BOMItem)
RETURN b.id, b.intent_label, count(i) AS item_count,
       b.metadata.repo AS repo, b.metadata.branch AS branch
ORDER BY b.created_at DESC
```

Manually inspect each. For each one:

### Phase 5 — Promote via LIN-1911 protocol

For each accepted PhantomBOMRun, follow the canonical 6-step runbook in
`docs/governance/LIN-1911-PROMOTION-PROTOCOL.md`. Use:
- `intent_label: "abandoned_work_harvest"`
- `source_type: "codex_branch_harvest"`

### Phase 6 — Deposit pheromone signal

For each promoted BOMItem, identify the related canonical pattern (most
will map to existing `:Pattern` or `:Capability` nodes). Deposit
`positive_discovery` pheromone signal so the materializer can rank.

### Phase 7 — Monitor materialization

Wait for natural agent traffic. Hypothesis: the PSR materializer should surface
harvested skills when relevant problem-space overlaps. Track via:
- `audit.adoption_metrics` topTools (look for `pattern:codex-harvest-*`)
- `:SkillMaterialization` count rise
- Dashboard panel (B19): "Harvested skills materialized this week"

If 0 after 4 weeks: the loop is broken. Investigate before continuing
harvest rounds.

---

## Cross-references

- LIN-1915 epic (parent)
- LIN-1911 promotion protocol (`docs/governance/LIN-1911-PROMOTION-PROTOCOL.md`)
- B11 contract schema (widgetdc-contracts#76 4bb5880)
- B15 conformance runner (`scripts/run-adoption-conformance.mjs:294`)
- B17 intent calibration (`scripts/run-intent-calibration.mjs`)
- B18 telemetry wire-up (PR #6137 245e9c4)
- B18.1/B18.2 streamable fix (in flight)
- B19 dashboard (Gemini-App PR #13 5b30dbf)
- B20 promotion rule draft (`docs/governance/B20-ADOPTION-PROMOTION-RULE.md`)
- B21 fold-at-source contract (in flight)
- `inspect-orphan-branches.ps1` (this session, finds the candidates)
- `loose-ends-scan.ps1` (this session, complementary disk/repo scan)
- Existing PSR claim: `claim:phantom-skill-registry` (currently L0)
- Existing PSR claim: `claim:phantom-bom-materialization-50` (currently L0,
  predicate already satisfied with 547 chains but no observable adoption)
- Existing claim: `claim:phantom-bom-composition` (L3 runtime_verified —
  harvest extends this evidence base)

---

## Honest framing

This is a **design**, not a deliverable. Implementation requires:

1. New script `scripts/harvest-abandoned-branch.mjs` (~300 lines, similar
   pattern to existing harvest tools)
2. Operator runbook walkthrough with at least 3 manual harvest rounds
   before any automation
3. Wait-time for natural agent traffic to reveal materialization
4. Patience — 1 month minimum before first measurable signal

Effort estimate: **M-L** for first round, **M** for subsequent rounds.

Risk: low (read-only on source branches, governance-gated on promote,
operator-reviewed end-to-end). The cheap insurance pays for itself the
first time a harvested skill prevents an agent from re-discovering a
known solution.

The structural value beyond this platform: **every multi-agent system
that lets background agents work freely will eventually have abandoned
work to harvest.** B22 is the reusable design pattern for that case, not
a one-off cleanup.
