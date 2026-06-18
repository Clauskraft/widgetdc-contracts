# Subagent Return Contract — Fold-at-source

> **Status:** Draft for LIN-1915 epic. Quick-fix template; formal contract lands as B21 in widgetdc-contracts.
>
> Applies to every `Agent`-tool launch from any agent on this platform.
> Forms the operational basis for B21's formal `subagent-completion-contract.v1`.

---

## Why this contract exists

Subagents historically returned 1500-3000 token natural-language reports. Parent agents accumulated those reports verbatim in their own context. By the time a parent had launched 5+ subagents, it was carrying 10K+ tokens of subagent-prose that could neither be re-referenced from future sessions nor compressed at receiver-side without semantic loss.

Solution: the subagent itself folds its completion report into a deterministic `fold_id` before returning. Parent receives only the fold_id + a 50-word operational summary + the 3-5 anchors needed to act immediately. The parent (or a future session) can expand the fold on demand.

---

## Hard return contract (mandatory)

Every subagent-prompt MUST end with this block, verbatim or semantically equivalent:

```
## Return contract (mandatory — do not skip)

Before returning, you MUST:

1. Load the canonical fold tool via:
   ToolSearch query: "select canonical MCP tool context.fold"

2. Call context.fold with:
   - task: "Subagent completion report for <descriptive-task-id>"
   - context:
     - domain: "subagent.completion"
     - text: your full natural-language report (everything you would have returned
       pre-contract — every detail, file:line, test count, decision rationale,
       concerns, follow-ups)
   - max_tokens: 2000

3. Capture the returned fold_id.

4. Return ONLY these three sections:

   ### fold_id
   <the fold_id string, e.g. fold:abc123def456>

   ### Summary (≤50 words)
   <operational TL;DR — what changed in graph/repo/CI state>

   ### Anchors
   - prs: [<PR URLs>]
   - shas: [<commit SHAs>]
   - files: [<file:line refs the parent needs immediately>]

DO NOT return the full natural-language report. The fold_id is the persistent
artifact; the summary is the operational TL;DR; the anchors are what the parent
needs to act on within the next 30 seconds.
```

---

## When to override the contract

The contract is **mandatory by default**. Subagents may deviate ONLY in these documented cases:

1. **Failure path requiring diagnosis** — if the subagent failed to complete its task and the parent needs raw error context to diagnose, return raw failure text PLUS still call context.fold with the failure context. The fold_id still exists; the raw text is for immediate action.

2. **Minimal output (<200 tokens)** — if the entire subagent report would fit in <200 tokens, the fold overhead exceeds the benefit. Return directly with a comment line: `# fold-skip: output <200 tokens`.

3. **Rate-limit pressure** — if context.fold returns rate_limit error (100 req/day per API key documented in tool description), return the full report inline with a comment: `# fold-skip: rate-limited at <timestamp>`.

In all three override cases, the subagent must explicitly state the override reason in its return — silent overrides are forbidden.

---

## Why parent agents must NOT pre-expand

When a parent agent receives a fold_id + summary + anchors, the temptation is to call `context.peek` immediately to "see the full report just to be sure". This defeats the entire purpose.

The discipline:
- Use anchors to act immediately. They are designed to be self-sufficient for the next operational step.
- Use summary to decide whether the work is on-track.
- Use fold_id only when the next operational step explicitly requires details not in the anchors (e.g., synthesizing a new PR description from multiple subagent rationales).

If you find yourself expanding folds frequently, the symptom is: anchors aren't capturing the right things. Fix the contract, not the expansion habit.

---

## Cross-references

- LIN-1915 epic (parent)
- B11 contract schema (widgetdc-contracts#76) — sibling contract pattern
- B13 parity CI gate — will be extended to validate `.claude/agents/*` prompt templates contain this contract
- B19 dashboard — will add "subagent fold rate" metric to surface compliance
- B20 promotion rule — uses fold_ids as durable evidence anchors for L1→L2 promotion

---

## Hash pin (after B21 formal land)

Once B21 ships the formal `subagent-completion-contract.v1`, this doc becomes the operator-facing runbook. The schema in widgetdc-contracts becomes the authority. Until then, this doc is canonical.
