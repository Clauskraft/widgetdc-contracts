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
