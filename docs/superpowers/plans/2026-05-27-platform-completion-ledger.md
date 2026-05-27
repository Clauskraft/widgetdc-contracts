# Platform Completion Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a contract-level completion ledger and routing evidence readback so WidgeTDC can distinguish merged, deployed, verified, adopted, blocked, and unverified states without overstating runtime proof.

**Architecture:** Add two small TypeBox contract modules under `src/orchestrator`: one for platform completion ledger entries, and one for Octopus/routing evidence readback. Export them from the orchestrator package and cover them with focused Vitest schema tests. This first slice is contract-only and does not claim deployment, runtime proof, adoption proof, or claim promotion.

**Tech Stack:** TypeScript, TypeBox, Vitest, existing `@widgetdc/contracts` build/generate scripts.

---

## Anchored Constraints

- Work from a clean worktree based on latest `origin/main`, not from the dirty local `widgetdc-contracts` main checkout.
- Current anchored backend health: `status=healthy`, commit `53ea5aabd75b`; do not claim this plan deploys to that SHA.
- Current anchored PR state: `widgetdc-contracts` open PR list is empty; PR `#39` is merged with CI success on `926850e9f552d06b667532872801e2c5dae40b85`; LIN-1317 is Done.
- Current anchored RLM state: PRs `#258`, `#259`, `#261`, `#262`, and `#271` are merged with green checks; related issues are Done.
- Current anchored blocker: LIN-1338 remains In Progress until provider-key rotation evidence is observed. This plan must not close or bypass LIN-1338.
- Current anchored Octopus routing state: `octopus-architecture` maps to runtime-valid `codex`; empty async spawn artifacts are non-proof unless a later poll returns a non-empty artifact with status.

## File Structure

- Create `src/orchestrator/completion-ledger.ts`: TypeBox schemas for lifecycle states, completion gates, and per-repo/platform ledger entries.
- Create `src/orchestrator/routing-evidence.ts`: TypeBox schemas for Octopus provider mapping and asynchronous routing evidence readback.
- Modify `src/orchestrator/index.ts`: export the two new contract modules.
- Create `tests/platform_completion_ledger.test.ts`: regression tests for valid and invalid ledger/evidence envelopes.

## Task 1: Add RED Tests for Completion Ledger and Routing Evidence

**Files:**
- Create: `tests/platform_completion_ledger.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/platform_completion_ledger.test.ts` with this exact content:

```ts
import { describe, expect, it } from 'vitest'
import '../src/formats.js'
import { Value } from '@sinclair/typebox/value'
import {
  PlatformCompletionLedger,
  PlatformCompletionLedgerEntry,
  RoutingEvidenceReadback,
} from '../src/orchestrator/index.js'

const mergedEntry = {
  repo: 'Clauskraft/widgetdc-contracts',
  workstream: 'completion',
  lifecycle_state: 'merged',
  issue_id: 'LIN-1317',
  pr_number: 39,
  commit_sha: '926850e9f552d06b667532872801e2c5dae40b85',
  evidence_refs: [
    'https://github.com/Clauskraft/widgetdc-contracts/pull/39',
    'https://github.com/Clauskraft/widgetdc-contracts/actions/runs/26448181769',
  ],
  runtime_proof_claimed: false,
  claim_promotion_eligible: false,
  updated_at: '2026-05-27T06:00:00Z',
}

describe('PlatformCompletionLedgerEntry', () => {
  it('accepts a merged code-proven entry without runtime proof', () => {
    expect(Value.Check(PlatformCompletionLedgerEntry, mergedEntry)).toBe(true)
  })

  it('rejects runtime proof claims without verified/adopted lifecycle state', () => {
    const overstated = {
      ...mergedEntry,
      runtime_proof_claimed: true,
    }

    expect(Value.Check(PlatformCompletionLedgerEntry, overstated)).toBe(false)
  })

  it('requires provider rotation blockers to stay blocked or unverified', () => {
    const blocked = {
      repo: 'Clauskraft/widgetdc-openwebui',
      workstream: 'adoption',
      lifecycle_state: 'blocked',
      issue_id: 'LIN-1338',
      blocker_code: 'PROVIDER_ROTATION_UNANCHORED',
      evidence_refs: ['https://linear.app/linear-clauskraft/issue/LIN-1338'],
      runtime_proof_claimed: false,
      claim_promotion_eligible: false,
      updated_at: '2026-05-27T06:00:00Z',
    }

    expect(Value.Check(PlatformCompletionLedgerEntry, blocked)).toBe(true)
  })
})

describe('PlatformCompletionLedger', () => {
  it('accepts a ledger with separated merged, blocked, and unverified states', () => {
    const ledger = {
      schema_version: 'platform_completion_ledger.v1',
      generated_at: '2026-05-27T06:00:00Z',
      entries: [
        mergedEntry,
        {
          repo: 'Clauskraft/widgetdc-openwebui',
          workstream: 'adoption',
          lifecycle_state: 'blocked',
          issue_id: 'LIN-1338',
          blocker_code: 'PROVIDER_ROTATION_UNANCHORED',
          evidence_refs: ['https://linear.app/linear-clauskraft/issue/LIN-1338'],
          runtime_proof_claimed: false,
          claim_promotion_eligible: false,
          updated_at: '2026-05-27T06:00:00Z',
        },
        {
          repo: 'Clauskraft/widgetdc-contracts',
          workstream: 'routing',
          lifecycle_state: 'unverified',
          evidence_refs: ['octopus-result:codex-1779862688.md'],
          runtime_proof_claimed: false,
          claim_promotion_eligible: false,
          updated_at: '2026-05-27T06:00:00Z',
        },
      ],
    }

    expect(Value.Check(PlatformCompletionLedger, ledger)).toBe(true)
  })
})

describe('RoutingEvidenceReadback', () => {
  it('accepts a non-empty artifact-ready Octopus readback', () => {
    const readback = {
      schema_version: 'routing_evidence_readback.v1',
      route_id: 'octopus-architecture-writing-plans-flow-deliver',
      provider_mapping: {
        requested_persona: 'backend-architect',
        spawn_agent: 'codex',
        mapping_status: 'runtime_valid',
      },
      evidence_status: 'artifact_ready',
      artifact_ref: 'C:/Users/claus/.claude-octopus/results/codex-1779862688.md',
      artifact_bytes: 1200,
      polled: true,
      runtime_proof_claimed: false,
      claim_promotion_eligible: false,
      checked_at: '2026-05-27T06:00:00Z',
    }

    expect(Value.Check(RoutingEvidenceReadback, readback)).toBe(true)
  })

  it('rejects empty artifacts marked artifact_ready', () => {
    const readback = {
      schema_version: 'routing_evidence_readback.v1',
      route_id: 'octopus-architecture-writing-plans-flow-deliver',
      provider_mapping: {
        requested_persona: 'backend-architect',
        spawn_agent: 'codex',
        mapping_status: 'runtime_valid',
      },
      evidence_status: 'artifact_ready',
      artifact_ref: 'C:/Users/claus/.claude-octopus/results/codex-empty.md',
      artifact_bytes: 0,
      polled: true,
      runtime_proof_claimed: false,
      claim_promotion_eligible: false,
      checked_at: '2026-05-27T06:00:00Z',
    }

    expect(Value.Check(RoutingEvidenceReadback, readback)).toBe(false)
  })
})
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
npm test -- tests/platform_completion_ledger.test.ts
```

Expected: FAIL because `PlatformCompletionLedger`, `PlatformCompletionLedgerEntry`, and `RoutingEvidenceReadback` are not exported from `src/orchestrator/index.ts`.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/platform_completion_ledger.test.ts
git commit -m "test: add platform completion ledger contract coverage"
```

## Task 2: Implement Completion Ledger Contracts

**Files:**
- Create: `src/orchestrator/completion-ledger.ts`
- Modify: `src/orchestrator/index.ts`
- Test: `tests/platform_completion_ledger.test.ts`

- [ ] **Step 1: Add the completion ledger schema**

Create `src/orchestrator/completion-ledger.ts` with this exact content:

```ts
import { Type, Static } from '@sinclair/typebox'

const GitCommitSha = Type.String({
  minLength: 40,
  maxLength: 40,
  pattern: '^[0-9a-f]{40}$',
  description: 'Full lowercase git commit SHA.',
})

export const PlatformCompletionWorkstream = Type.Union([
  Type.Literal('completion'),
  Type.Literal('consolidation'),
  Type.Literal('routing'),
  Type.Literal('adoption'),
], { $id: 'PlatformCompletionWorkstream' })

export type PlatformCompletionWorkstream = Static<typeof PlatformCompletionWorkstream>

export const PlatformCompletionLifecycleState = Type.Union([
  Type.Literal('unverified'),
  Type.Literal('planned'),
  Type.Literal('in_progress'),
  Type.Literal('merged'),
  Type.Literal('deployed'),
  Type.Literal('verified'),
  Type.Literal('adopted'),
  Type.Literal('blocked'),
], { $id: 'PlatformCompletionLifecycleState' })

export type PlatformCompletionLifecycleState = Static<typeof PlatformCompletionLifecycleState>

export const PlatformCompletionLedgerEntry = Type.Intersect([
  Type.Object({
    repo: Type.String({
      minLength: 1,
      description: 'Repository or runtime boundary this entry describes.',
    }),
    workstream: PlatformCompletionWorkstream,
    lifecycle_state: PlatformCompletionLifecycleState,
    issue_id: Type.Optional(Type.String({
      pattern: '^LIN-[0-9]+$',
      description: 'Linear issue identifier when this entry maps to a governed slice.',
    })),
    pr_number: Type.Optional(Type.Integer({
      minimum: 1,
      description: 'GitHub PR number when a PR is the code-proven anchor.',
    })),
    commit_sha: Type.Optional(GitCommitSha),
    deployed_sha: Type.Optional(GitCommitSha),
    blocker_code: Type.Optional(Type.String({
      minLength: 1,
      description: 'Stable blocker code when lifecycle_state is blocked.',
    })),
    evidence_refs: Type.Array(Type.String({ minLength: 1 }), {
      minItems: 1,
      description: 'Observed URLs, run ids, artifact ids, or issue refs backing this entry.',
    }),
    runtime_proof_claimed: Type.Boolean(),
    claim_promotion_eligible: Type.Boolean(),
    updated_at: Type.String({ format: 'date-time' }),
  }, { additionalProperties: false }),
  Type.Union([
    Type.Object({
      lifecycle_state: Type.Union([
        Type.Literal('unverified'),
        Type.Literal('planned'),
        Type.Literal('in_progress'),
        Type.Literal('merged'),
        Type.Literal('deployed'),
        Type.Literal('blocked'),
      ]),
      runtime_proof_claimed: Type.Literal(false),
      claim_promotion_eligible: Type.Literal(false),
    }),
    Type.Object({
      lifecycle_state: Type.Union([
        Type.Literal('verified'),
        Type.Literal('adopted'),
      ]),
      runtime_proof_claimed: Type.Boolean(),
      claim_promotion_eligible: Type.Boolean(),
    }),
  ]),
], {
  $id: 'PlatformCompletionLedgerEntry',
  description:
    'One governed platform completion/adoption status row. Separates merged, deployed, verified, adopted, blocked, and unverified states so PR-stage work cannot be mistaken for runtime proof.',
})

export type PlatformCompletionLedgerEntry = Static<typeof PlatformCompletionLedgerEntry>

export const PlatformCompletionLedger = Type.Object({
  schema_version: Type.Literal('platform_completion_ledger.v1'),
  generated_at: Type.String({ format: 'date-time' }),
  entries: Type.Array(PlatformCompletionLedgerEntry, {
    minItems: 1,
    description: 'Completion rows across contracts, backend, RLM, OpenWebUI, and related runtime consumers.',
  }),
}, {
  $id: 'PlatformCompletionLedger',
  additionalProperties: false,
  description:
    'Cross-boundary completion ledger for platform consolidation, routing, and adoption tracking. This is status evidence only; it does not promote claims by itself.',
})

export type PlatformCompletionLedger = Static<typeof PlatformCompletionLedger>
```

- [ ] **Step 2: Export the completion ledger module**

Append this line to `src/orchestrator/index.ts`:

```ts
export * from './completion-ledger.js'
```

- [ ] **Step 3: Run the focused test**

Run:

```bash
npm test -- tests/platform_completion_ledger.test.ts
```

Expected: FAIL only on missing `RoutingEvidenceReadback` exports. The completion ledger tests should pass.

- [ ] **Step 4: Commit the completion ledger contract**

```bash
git add src/orchestrator/completion-ledger.ts src/orchestrator/index.ts
git commit -m "feat: add platform completion ledger contract"
```

## Task 3: Implement Routing Evidence Readback Contracts

**Files:**
- Create: `src/orchestrator/routing-evidence.ts`
- Modify: `src/orchestrator/index.ts`
- Test: `tests/platform_completion_ledger.test.ts`

- [ ] **Step 1: Add routing evidence schema**

Create `src/orchestrator/routing-evidence.ts` with this exact content:

```ts
import { Type, Static } from '@sinclair/typebox'

export const OctopusProviderMappingStatus = Type.Union([
  Type.Literal('runtime_valid'),
  Type.Literal('runtime_invalid'),
  Type.Literal('unverified'),
], { $id: 'OctopusProviderMappingStatus' })

export type OctopusProviderMappingStatus = Static<typeof OctopusProviderMappingStatus>

export const OctopusProviderMapping = Type.Object({
  requested_persona: Type.String({
    minLength: 1,
    description: 'Persona requested by the skill or chain, for example backend-architect.',
  }),
  spawn_agent: Type.String({
    minLength: 1,
    description: 'Actual Octopus runtime agent name used for dispatch, for example codex.',
  }),
  mapping_status: OctopusProviderMappingStatus,
}, {
  $id: 'OctopusProviderMapping',
  additionalProperties: false,
  description:
    'Read-back for persona-to-runtime-agent mapping. A valid mapping is not proof that the agent produced usable evidence.',
})

export type OctopusProviderMapping = Static<typeof OctopusProviderMapping>

export const RoutingEvidenceStatus = Type.Union([
  Type.Literal('pending'),
  Type.Literal('artifact_ready'),
  Type.Literal('empty_artifact'),
  Type.Literal('timeout'),
  Type.Literal('failed'),
], { $id: 'RoutingEvidenceStatus' })

export type RoutingEvidenceStatus = Static<typeof RoutingEvidenceStatus>

export const RoutingEvidenceReadback = Type.Intersect([
  Type.Object({
    schema_version: Type.Literal('routing_evidence_readback.v1'),
    route_id: Type.String({
      minLength: 1,
      description: 'Stable chain or route identifier, for example octopus-architecture-writing-plans-flow-deliver.',
    }),
    provider_mapping: OctopusProviderMapping,
    evidence_status: RoutingEvidenceStatus,
    artifact_ref: Type.Optional(Type.String({
      minLength: 1,
      description: 'Local result path, CI artifact URL, or governed evidence id.',
    })),
    artifact_bytes: Type.Optional(Type.Integer({
      minimum: 0,
      description: 'Observed artifact byte size at polling time.',
    })),
    polled: Type.Boolean({
      description: 'True only when async spawn output was polled after dispatch.',
    }),
    runtime_proof_claimed: Type.Literal(false),
    claim_promotion_eligible: Type.Literal(false),
    checked_at: Type.String({ format: 'date-time' }),
  }, { additionalProperties: false }),
  Type.Union([
    Type.Object({
      evidence_status: Type.Literal('artifact_ready'),
      polled: Type.Literal(true),
      artifact_ref: Type.String({ minLength: 1 }),
      artifact_bytes: Type.Integer({ minimum: 1 }),
    }),
    Type.Object({
      evidence_status: Type.Union([
        Type.Literal('pending'),
        Type.Literal('empty_artifact'),
        Type.Literal('timeout'),
        Type.Literal('failed'),
      ]),
    }),
  ]),
], {
  $id: 'RoutingEvidenceReadback',
  description:
    'Governance-safe readback for async routing/spawn evidence. Empty artifacts are explicitly non-proof and cannot be represented as artifact_ready.',
})

export type RoutingEvidenceReadback = Static<typeof RoutingEvidenceReadback>
```

- [ ] **Step 2: Export the routing evidence module**

Append this line to `src/orchestrator/index.ts`:

```ts
export * from './routing-evidence.js'
```

- [ ] **Step 3: Run the focused test**

Run:

```bash
npm test -- tests/platform_completion_ledger.test.ts
```

Expected: PASS for all tests in `tests/platform_completion_ledger.test.ts`.

- [ ] **Step 4: Commit the routing evidence contract**

```bash
git add src/orchestrator/routing-evidence.ts src/orchestrator/index.ts tests/platform_completion_ledger.test.ts
git commit -m "feat: add routing evidence readback contract"
```

## Task 4: Generate Artifacts and Run Contract Gates

**Files:**
- Generated: `dist/orchestrator/completion-ledger.*`
- Generated: `dist/orchestrator/routing-evidence.*`
- Generated: `dist/orchestrator/index.*`
- Generated: `python/widgetdc_contracts/orchestrator.py`

- [ ] **Step 1: Build generated TypeScript artifacts**

Run:

```bash
npm run build
```

Expected: PASS. The `dist/orchestrator` output includes generated `.js` and `.d.ts` files for `completion-ledger` and `routing-evidence`.

- [ ] **Step 2: Generate schemas and Python bindings**

Run:

```bash
npm run generate
```

Expected: PASS. Generated schema and Python outputs remain deterministic.

- [ ] **Step 3: Run validation and tests**

Run:

```bash
npm run validate
npm test
```

Expected: PASS. If unrelated tests fail, stop and report the exact failing test and error without claiming completion.

- [ ] **Step 4: Inspect generated diff**

Run:

```bash
git status -sb
git diff --stat
git diff --check
```

Expected: only the new contract, export, test, generated dist, generated schema/python outputs, and this plan file are changed; `git diff --check` has no whitespace errors.

- [ ] **Step 5: Commit generated artifacts**

```bash
git add dist schemas python src tests docs/superpowers/plans/2026-05-27-platform-completion-ledger.md
git commit -m "chore: generate platform completion ledger artifacts"
```

## Task 5: Open PR and Keep Claim Level Honest

**Files:**
- No additional file changes.

- [ ] **Step 1: Push the branch**

```bash
git push -u origin codex/lin-953-platform-completion-plan
```

Expected: branch is pushed to `Clauskraft/widgetdc-contracts`.

- [ ] **Step 2: Open the PR**

Use this PR body:

```markdown
## What

Adds contract-level platform completion and routing evidence readback schemas so merged, deployed, verified, adopted, blocked, and unverified states are represented separately.

This is a contract slice only. It does not claim deploy, runtime proof, claim promotion, provider-key rotation, or adoption completion.

## Verification

- `npm run build`
- `npm run generate`
- `npm run validate`
- `npm test`
- `git diff --check`

## Linked

- Parent: LIN-953
- Blocks/related: LIN-1338 remains In Progress until provider-key rotation evidence is anchored.
```

- [ ] **Step 3: Watch CI**

Run:

```bash
gh pr checks --repo Clauskraft/widgetdc-contracts --watch
```

Expected: all required checks pass before merge.

- [ ] **Step 4: Stop before runtime claims**

Do not claim deployed, runtime-proven, adopted, or claim-promotion eligible after PR merge. Runtime proof requires deployed SHA readback plus governed verification passes outside this contract slice.

## Self-Review

- Spec coverage: covers the Octopus architecture foundation by creating the first isolated, contract-only slice for completion, consolidation, routing, and adoption status separation. LIN-1338 closure is intentionally not implemented because provider-dashboard rotation evidence is unanchored.
- Placeholder scan: this plan avoids placeholder steps and includes exact file paths, exact test code, exact implementation code, and exact commands.
- Type consistency: `PlatformCompletionLedger`, `PlatformCompletionLedgerEntry`, `RoutingEvidenceReadback`, `OctopusProviderMapping`, and related unions are defined before export and test use.
