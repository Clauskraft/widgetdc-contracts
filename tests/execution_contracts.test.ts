import { describe, expect, it } from 'vitest'
import '../src/formats.js'
import { Value } from '@sinclair/typebox/value'
import {
  AdapterManifest,
  CandidateBundle,
  DegradationDecision,
  ExecutionEnvelope,
  SynthesisReceipt,
  validateSynthesisReceipt,
} from '../src/execution/index.js'

const EXECUTION_ENVELOPE_ID =
  'https://contracts.widgetdc.dev/execution/execution-envelope.schema.json'

function validEnvelope(): typeof ExecutionEnvelope.static {
  return {
    $id: EXECUTION_ENVELOPE_ID,
    envelope_id: 'envelope:lin-2171',
    schema_version: '1.0.0',
    task_bom_id: 'taskbom:adaptive:f3911b98869f',
    route_envelope_ref: 'route:sef-01-contract-foundation',
    actor_id: 'operator:claus',
    target_repo: 'Clauskraft/widgetdc-contracts',
    target_head: 'bea58db9cd330',
    controller: 'wdc_native',
    workflow: 'develop',
    risk_class: 'source_mutation',
    selected_pattern_ids: ['pattern:13', 'pattern:24'],
    adapters: [],
    required_artifacts: [
      {
        artifact_type: 'source_patch',
        schema_id: 'https://contracts.widgetdc.dev/artifacts/source-patch.schema.json',
        minimum_count: 1,
        required_for_completion: true,
      },
    ],
    degradation_policy_id: 'degradation-policy:source-mutation-v1',
    stop_condition_ids: ['stop:tests-green', 'stop:origin-main-readback'],
    claim_ceiling: 'L1',
    idempotency_key: 'lin-2171-sef-01-contracts',
    created_at: '2026-07-14T14:00:00Z',
  }
}

function validReceipt(): typeof SynthesisReceipt.static {
  return {
    $id: 'https://contracts.widgetdc.dev/execution/synthesis-receipt.schema.json',
    receipt_id: 'receipt:lin-2171',
    envelope_id: 'envelope:lin-2171',
    correlation_id: 'corr:lin-2171',
    outcome: 'completed',
    artifact_checks: [
      {
        artifact_type: 'source_patch',
        required_count: 1,
        observed_count: 1,
        schema_valid: true,
        content_readable: true,
      },
    ],
    candidate_bundle_refs: ['bundle:lin-2171'],
    independent_verifier_ref: 'a2a:verifier-signoff',
    missing_perspectives: [],
    next_step: 'Read back the merged contract from origin/main.',
    claim_level: 'L1',
    created_at: '2026-07-14T14:30:00Z',
  }
}

describe('SEF-01 execution contracts', () => {
  it('accepts only WDC native as the execution controller', () => {
    expect(Value.Check(ExecutionEnvelope, validEnvelope())).toBe(true)

    const delegatedController = {
      ...validEnvelope(),
      controller: 'octopus',
    }
    expect(Value.Check(ExecutionEnvelope, delegatedController)).toBe(false)
  })

  it('rejects malformed execution envelope invariants', () => {
    expect(
      Value.Check(ExecutionEnvelope, {
        ...validEnvelope(),
        target_head: 'short',
      }),
    ).toBe(false)
    expect(
      Value.Check(ExecutionEnvelope, {
        ...validEnvelope(),
        selected_pattern_ids: [],
      }),
    ).toBe(false)
    expect(
      Value.Check(ExecutionEnvelope, {
        ...validEnvelope(),
        idempotency_key: 'too-short',
      }),
    ).toBe(false)
  })

  it('rejects dishonest completed receipts', () => {
    expect(validateSynthesisReceipt(validReceipt())).toBe(true)

    for (const invalidCheck of [
      { required_count: 2, observed_count: 1, schema_valid: true, content_readable: true },
      { required_count: 1, observed_count: 1, schema_valid: false, content_readable: true },
      { required_count: 1, observed_count: 1, schema_valid: true, content_readable: false },
    ]) {
      const receipt = {
        ...validReceipt(),
        artifact_checks: [{ artifact_type: 'source_patch', ...invalidCheck }],
      }
      expect(Value.Check(SynthesisReceipt, receipt)).toBe(true)
      expect(validateSynthesisReceipt(receipt)).toBe(false)
    }
  })

  it('permits disclosed incompleteness without relabelling it completed', () => {
    const receipt = {
      ...validReceipt(),
      outcome: 'completed_unverified' as const,
      artifact_checks: [
        {
          artifact_type: 'source_patch',
          required_count: 1,
          observed_count: 0,
          schema_valid: false,
          content_readable: false,
        },
      ],
      missing_perspectives: ['independent_verifier'],
      next_step: 'Assign an independent verifier and rerun evidence judging.',
    }
    expect(validateSynthesisReceipt(receipt)).toBe(true)
  })

  it('exports candidate, adapter, and degradation schemas with canonical ids', () => {
    expect(CandidateBundle.$id).toBe(
      'https://contracts.widgetdc.dev/execution/candidate-bundle.schema.json',
    )
    expect(AdapterManifest.$id).toBe(
      'https://contracts.widgetdc.dev/execution/adapter-manifest.schema.json',
    )
    expect(DegradationDecision.$id).toBe(
      'https://contracts.widgetdc.dev/execution/degradation-decision.schema.json',
    )
  })
})
