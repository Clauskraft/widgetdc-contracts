import { Value } from '@sinclair/typebox/value'
import { describe, expect, it } from 'vitest'
import '../src/formats.js'

import {
  BlockerClassification,
  ContinuationReceipt,
  ContinuationRequest,
  HumanOnlyGate,
  NextSafeAction,
  isLegalContinuationTransition,
  validateContinuationReceipt,
} from '../src/continuation/index.js'

const pendingAction = {
  action_id: 'action:rehydrate-main',
  description: 'Rehydrate main after authority changed.',
  action_type: 'rehydrate',
  status: 'pending',
  executable: true,
  authority_ref: 'git:main@abc123',
}

const baseReceipt = {
  schema_version: 'wdc.continuation_receipt.v1',
  receipt_id: 'continuation-receipt:test',
  continuation_id: 'continuation:test',
  current_authority_ref: 'git:main@abc123',
  continuation_status: 'continued',
  safe_actions_discovered: [pendingAction],
  safe_actions_executed: [{
    ...pendingAction,
    status: 'executed',
    executable: false,
    executed_at: '2026-07-13T16:00:00Z',
  }],
  unexecuted_safe_actions: [],
  human_only_gates: [],
  blockers: [],
  created_at: '2026-07-13T16:00:01Z',
}

describe('WDC continuation contracts', () => {
  it('makes a pending safe action executable', () => {
    expect(Value.Check(NextSafeAction, pendingAction)).toBe(true)
  })

  it('uses the governed blocker classification taxonomy exactly', () => {
    const classifications = [
      'AUTO_RESOLVABLE',
      'SAFE_CONTINUE',
      'HUMAN_IDENTITY_REQUIRED',
      'EXACT_APPROVAL_REQUIRED',
      'OWNER_SECRET_ACTION',
      'DESTRUCTIVE_ACTION_APPROVAL',
      'UNRESOLVABLE_CONFLICT',
    ]

    expect(classifications.every((value) => Value.Check(BlockerClassification, value))).toBe(true)
    expect(Value.Check(BlockerClassification, 'transient_dependency')).toBe(false)
  })

  it('treats an authority change as nonterminal rehydration work', () => {
    expect(isLegalContinuationTransition('authority_changed', 'rehydration_required')).toBe(true)
    expect(isLegalContinuationTransition('authority_changed', 'complete')).toBe(false)
  })

  it('types a human-only gate exactly', () => {
    const gate = {
      gate_id: 'gate:oauth-consent',
      gate_type: 'oauth_consent',
      status: 'waiting',
      required_actor: 'operator:claus',
      prompt: 'Complete OAuth consent in the opened browser window.',
      resume_action_id: 'action:oauth-callback-readback',
      created_at: '2026-07-13T16:00:00Z',
    }

    expect(Value.Check(HumanOnlyGate, gate)).toBe(true)
    expect(Value.Check(HumanOnlyGate, { ...gate, gate_type: 'run-tests' })).toBe(false)
    expect(Value.Check(HumanOnlyGate, { ...gate, arbitrary_approval: true })).toBe(false)
  })

  it('does not allow a stale action to execute', () => {
    expect(Value.Check(NextSafeAction, {
      ...pendingAction,
      status: 'stale',
      executable: true,
      stale_reason: 'Authority changed.',
    })).toBe(false)
  })

  it('rejects client-supplied governance context', () => {
    const request = {
      schema_version: 'wdc.continuation_request.v1',
      continuation_id: 'continuation:test',
      authority_ref: 'git:main@abc123',
      requested_at: '2026-07-13T16:00:00Z',
    }

    expect(Value.Check(ContinuationRequest, request)).toBe(true)
    expect(Value.Check(ContinuationRequest, {
      ...request,
      governance_context: { server_trusted: true },
    })).toBe(false)
  })

  it('rejects an unexecuted safe action without a valid gate or blocker', () => {
    const receipt = {
      ...baseReceipt,
      safe_actions_executed: [],
      unexecuted_safe_actions: [pendingAction],
    }

    expect(Value.Check(ContinuationReceipt, receipt)).toBe(true)
    expect(validateContinuationReceipt(receipt)).toEqual({
      valid: false,
      errors: ['safe_action_execution_obligation_unmet:action:rehydrate-main'],
    })
  })

  it('does not treat an automatically resolvable blocker as an excuse to stop', () => {
    const receipt = {
      ...baseReceipt,
      continuation_status: 'blocked',
      safe_actions_executed: [],
      unexecuted_safe_actions: [pendingAction],
      blockers: [{
        blocker_id: 'blocker:transient',
        classification: 'AUTO_RESOLVABLE',
        description: 'Retry is available.',
        blocks_action_ids: [pendingAction.action_id],
        evidence_ref: 'evidence:transient',
      }],
    }

    expect(Value.Check(ContinuationReceipt, receipt)).toBe(true)
    expect(validateContinuationReceipt(receipt)).toEqual({
      valid: false,
      errors: ['safe_action_execution_obligation_unmet:action:rehydrate-main'],
    })
  })

  it('accepts a receipt after every discovered safe action executes', () => {
    expect(Value.Check(ContinuationReceipt, baseReceipt)).toBe(true)
    expect(validateContinuationReceipt(baseReceipt)).toEqual({ valid: true, errors: [] })
  })
})
