import { Value } from '@sinclair/typebox/value'
import { describe, expect, it } from 'vitest'
import '../src/formats.js' // register uuid/date-time FormatRegistry checkers
import {
  CodeMutationProjectionEvent,
  DynamicPlanEnvelope,
  PlanItemTransitionEvent,
  DecisionRecord,
} from '../src/decision-bom/index.js'

describe('Grounding, Delta-Engine and Decision Contracts (WDC-ARCH-2026-10-07)', () => {
  describe('CodeMutationProjectionEvent', () => {
    it('accepts a valid CodeMutationProjectionEvent', () => {
      const validEvent = {
        specversion: '1.0',
        id: 'evt-mutation-12345',
        source: 'wdc:git:WidgeTDC',
        type: 'wdc.code.mutation.committed',
        time: '2026-10-07T21:30:00Z',
        correlation_id: 'corr-deploy-98765',
        data: {
          repo: 'WidgeTDC',
          commit_sha: 'a07e1ff4e05ae6ffbebb452a3940bc7a1ac95506',
          branch: 'main',
          author: 'gemini',
          files_changed: ['apps/backend/src/services/mrp/SuperBOM.ts'],
          ast_diff_summary: {
            symbols_added: ['normalizeAxisValue'],
            symbols_modified: ['SuperBOM.resolve'],
            symbols_removed: [],
            impacted_bom_items: ['bomitem-superbom-001'],
            impacted_capabilities: ['cap-mrp-composition-v1'],
          },
          valid_from: '2026-10-07T21:28:00Z',
          observed_at: '2026-10-07T21:30:00Z',
        },
      }
      expect(Value.Check(CodeMutationProjectionEvent, validEvent)).toBe(true)
    })

    it('rejects event with non-40-character commit_sha (Gate Honesty - Fail Closed)', () => {
      const badShaEvent = {
        specversion: '1.0',
        id: 'evt-mutation-bad',
        source: 'wdc:git:WidgeTDC',
        type: 'wdc.code.mutation.committed',
        time: '2026-10-07T21:30:00Z',
        correlation_id: 'corr-deploy-98765',
        data: {
          repo: 'WidgeTDC',
          commit_sha: 'shortsha123', // not 40 chars
          branch: 'main',
          author: 'gemini',
          files_changed: ['test.ts'],
          ast_diff_summary: {
            symbols_added: [],
            symbols_modified: [],
            symbols_removed: [],
            impacted_bom_items: [],
            impacted_capabilities: [],
          },
          valid_from: '2026-10-07T21:28:00Z',
          observed_at: '2026-10-07T21:30:00Z',
        },
      }
      expect(Value.Check(CodeMutationProjectionEvent, badShaEvent)).toBe(false)
    })

    it('rejects event with invalid source pattern', () => {
      const badSourceEvent = {
        specversion: '1.0',
        id: 'evt-mutation-bad-source',
        source: 'external:github:repo', // does not match wdc:git:...
        type: 'wdc.code.mutation.committed',
        time: '2026-10-07T21:30:00Z',
        correlation_id: 'corr-123',
        data: {
          repo: 'WidgeTDC',
          commit_sha: 'a07e1ff4e05ae6ffbebb452a3940bc7a1ac95506',
          branch: 'main',
          author: 'gemini',
          files_changed: [],
          ast_diff_summary: {
            symbols_added: [],
            symbols_modified: [],
            symbols_removed: [],
            impacted_bom_items: [],
            impacted_capabilities: [],
          },
          valid_from: '2026-10-07T21:28:00Z',
          observed_at: '2026-10-07T21:30:00Z',
        },
      }
      expect(Value.Check(CodeMutationProjectionEvent, badSourceEvent)).toBe(false)
    })
  })

  describe('DynamicPlanReification', () => {
    it('accepts a valid PlanItemTransitionEvent when assumption is invalidated', () => {
      const transition = {
        specversion: '1.0',
        id: 'evt-transition-001',
        source: 'wdc:plan-governor',
        type: 'wdc.plan.slice.transitioned',
        time: '2026-10-07T21:31:00Z',
        correlation_id: 'corr-plan-888',
        data: {
          plan_id: 'plan-workbom-v2',
          slice_id: 'SLICE-002',
          from_state: 'IN_PROGRESS',
          to_state: 'INVALIDATED_BY_MUTATION',
          trigger_event_id: 'evt-mutation-12345',
          invalidated_assumptions: ['SuperBOM.resolve returns synchronous array without error'],
          next_best_action: 'Recalculate capacity plan with new SuperBOM axes',
          reification_timestamp: '2026-10-07T21:31:00Z',
        },
      }
      expect(Value.Check(PlanItemTransitionEvent, transition)).toBe(true)
    })

    it('accepts a valid DynamicPlanEnvelope with slices and verified invariants', () => {
      const plan = {
        plan_id: 'plan-workbom-v2',
        version: 1,
        active_head_commit: 'a07e1ff4e05ae6ffbebb452a3940bc7a1ac95506',
        slices: [
          {
            slice_id: 'SLICE-001',
            title: 'Verify Grounding Contracts',
            state: 'RATIFIED',
            required_bom_items: ['bomitem-contracts-001'],
            assumptions: ['Contracts compile under Node 26'],
            proof_receipt_ids: ['receipt-contracts-ok-001'],
          },
        ],
        invariants_verified: true,
        updated_at: '2026-10-07T21:32:00Z',
      }
      expect(Value.Check(DynamicPlanEnvelope, plan)).toBe(true)
    })
  })

  describe('DecisionRecord', () => {
    it('accepts a valid bitemporal DecisionRecord', () => {
      const record = {
        decision_id: 'dec-20261007-001',
        version: 1,
        owner_role: 'Gemini',
        state: 'decided',
        question: 'How should the near-realtime codebase reflection be structured?',
        alternatives_evaluated: [
          'Option A: Static periodic batch sync of Neo4j AuraDB',
          'Option B: EventSpine-driven projection via WDC 18 Delta Engine',
        ],
        chosen_option: 'Option B: EventSpine-driven projection via WDC 18 Delta Engine',
        rationale: 'Avoids stagnant database and ungrounded memory hallucinations as measured in WDC Observatory.',
        assumptions: [
          'EventSpine outbox provides durable sequential events',
          'Delta Engine computes deterministic AST diffs',
        ],
        evidence_refs: [
          'docs/architecture/WDC_REALTIME_CODEBASE_MIRROR_AND_GROUNDING_ARCHITECTURE_2026-10-07.md',
          'NLM:Observatory:e088b8e3',
        ],
        valid_from: '2026-10-07T21:00:00Z',
        observed_at: '2026-10-07T21:30:00Z',
        contract_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        supersedes_id: null,
      }
      expect(Value.Check(DecisionRecord, record)).toBe(true)
    })

    it('rejects DecisionRecord with fewer than two alternatives evaluated (Gate Honesty)', () => {
      const badRecord = {
        decision_id: 'dec-20261007-bad',
        version: 1,
        owner_role: 'Gemini',
        state: 'decided',
        question: 'Uncontested decision?',
        alternatives_evaluated: ['Only one alternative provided'], // violates minItems: 2
        chosen_option: 'Only one alternative provided',
        rationale: 'No rationale',
        assumptions: [],
        evidence_refs: [],
        valid_from: '2026-10-07T21:00:00Z',
        observed_at: '2026-10-07T21:30:00Z',
        contract_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        supersedes_id: null,
      }
      expect(Value.Check(DecisionRecord, badRecord)).toBe(false)
    })

    it('rejects DecisionRecord with malformed contract_hash', () => {
      const badHashRecord = {
        decision_id: 'dec-20261007-badhash',
        version: 1,
        owner_role: 'Gemini',
        state: 'decided',
        question: 'Question?',
        alternatives_evaluated: ['Option 1', 'Option 2'],
        chosen_option: 'Option 1',
        rationale: 'Rationale',
        assumptions: [],
        evidence_refs: [],
        valid_from: '2026-10-07T21:00:00Z',
        observed_at: '2026-10-07T21:30:00Z',
        contract_hash: 'not-a-64-char-hex-hash', // invalid pattern
        supersedes_id: null,
      }
      expect(Value.Check(DecisionRecord, badHashRecord)).toBe(false)
    })
  })
})
