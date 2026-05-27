import { Static, Type } from '@sinclair/typebox'

const GitCommitSha = Type.String({
  pattern: '^[a-f0-9]{40}$',
  description: 'Lowercase 40-character git commit SHA.',
})

export const PlatformCompletionWorkstream = Type.Union([
  Type.Literal('completion'),
  Type.Literal('consolidation'),
  Type.Literal('routing'),
  Type.Literal('adoption'),
], {
  $id: 'PlatformCompletionWorkstream',
  description: 'Platform completion plane tracked by the consolidation ledger.',
})

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
], {
  $id: 'PlatformCompletionLifecycleState',
  description: 'Observed lifecycle state for a platform completion workstream entry.',
})

export type PlatformCompletionLifecycleState = Static<typeof PlatformCompletionLifecycleState>

const PlatformCompletionEntryCommon = {
  repo: Type.String({
    description: 'Repository owning this ledger entry, for example Clauskraft/widgetdc-contracts.',
  }),
  workstream: PlatformCompletionWorkstream,
  issue_id: Type.Optional(Type.String({
    pattern: '^LIN-[0-9]+$',
    description: 'Linear issue anchor when this entry maps to a tracked slice.',
  })),
  pr_number: Type.Optional(Type.Integer({
    minimum: 1,
    description: 'GitHub pull request number when code evidence exists.',
  })),
  commit_sha: Type.Optional(GitCommitSha),
  deployed_sha: Type.Optional(GitCommitSha),
  evidence_refs: Type.Array(Type.String(), {
    minItems: 1,
    description: 'Observed evidence references for the state, such as PRs, checks, Linear issues, or artifact ids.',
  }),
  updated_at: Type.String({
    format: 'date-time',
    description: 'Timestamp when this ledger entry was last anchored.',
  }),
} as const

const PlatformCompletionNonProofEntry = Type.Object({
  ...PlatformCompletionEntryCommon,
  lifecycle_state: Type.Union([
    Type.Literal('planned'),
    Type.Literal('in_progress'),
    Type.Literal('merged'),
    Type.Literal('deployed'),
  ]),
  runtime_proof_claimed: Type.Literal(false),
  claim_promotion_eligible: Type.Literal(false),
}, {
  additionalProperties: false,
})

const PlatformCompletionBlockedOrUnverifiedEntry = Type.Object({
  ...PlatformCompletionEntryCommon,
  lifecycle_state: Type.Union([
    Type.Literal('blocked'),
    Type.Literal('unverified'),
  ]),
  blocker_code: Type.Optional(Type.String({
    minLength: 1,
    description: 'Stable blocker code when the entry cannot advance.',
  })),
  runtime_proof_claimed: Type.Literal(false),
  claim_promotion_eligible: Type.Literal(false),
}, {
  additionalProperties: false,
})

const PlatformCompletionVerifiedEntry = Type.Object({
  ...PlatformCompletionEntryCommon,
  lifecycle_state: Type.Union([
    Type.Literal('verified'),
    Type.Literal('adopted'),
  ]),
  runtime_proof_claimed: Type.Boolean({
    description: 'True only when runtime proof has been observed for this entry.',
  }),
  claim_promotion_eligible: Type.Boolean({
    description: 'True only when the entry satisfies the claim-promotion gate.',
  }),
}, {
  additionalProperties: false,
})

export const PlatformCompletionLedgerEntry = Type.Union([
  PlatformCompletionNonProofEntry,
  PlatformCompletionBlockedOrUnverifiedEntry,
  PlatformCompletionVerifiedEntry,
], {
  $id: 'PlatformCompletionLedgerEntry',
  description:
    'One anchored platform completion ledger entry. Merged/deployed/blocked/unverified states cannot claim runtime proof or promotion eligibility.',
})

export type PlatformCompletionLedgerEntry = Static<typeof PlatformCompletionLedgerEntry>

export const PlatformCompletionLedger = Type.Object({
  schema_version: Type.Literal('platform_completion_ledger.v1'),
  generated_at: Type.String({
    format: 'date-time',
    description: 'Timestamp when the ledger snapshot was generated.',
  }),
  entries: Type.Array(PlatformCompletionLedgerEntry, {
    minItems: 1,
    description: 'Platform completion entries grouped across completion, consolidation, routing, and adoption.',
  }),
}, {
  $id: 'PlatformCompletionLedger',
  additionalProperties: false,
  description: 'Governed ledger snapshot for tracking platform completion without overstating runtime proof.',
})

export type PlatformCompletionLedger = Static<typeof PlatformCompletionLedger>
