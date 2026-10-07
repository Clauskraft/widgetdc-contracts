/**
 * DecisionRecord — Bitemporal decision persistence contract.
 *
 * Implements WDC 19 Decision Memory with historical immutability,
 * explicit assumption tracking, and cryptographic definition hash-locking.
 *
 * Wire format: snake_case JSON.
 */
import { Type, Static } from '@sinclair/typebox'

export const DecisionRole = Type.Union([
  Type.Literal('Gemini'),
  Type.Literal('Claude'),
  Type.Literal('Codex'),
  Type.Literal('Qwen'),
  Type.Literal('Operator'),
], { $id: 'DecisionRole' })

export type DecisionRole = Static<typeof DecisionRole>

export const DecisionState = Type.Union([
  Type.Literal('draft'),
  Type.Literal('reviewed'),
  Type.Literal('decided'),
  Type.Literal('reopened'),
  Type.Literal('superseded'),
], { $id: 'DecisionState' })

export type DecisionState = Static<typeof DecisionState>

export const DecisionRecord = Type.Object({
  decision_id: Type.String({ pattern: '^dec-[a-zA-Z0-9-]{6,}$', description: 'Unique decision identifier.' }),
  version: Type.Integer({ minimum: 1, description: 'Version number of this decision.' }),
  owner_role: DecisionRole,
  state: DecisionState,
  question: Type.String({ minLength: 1, description: 'Core problem or architectural question decided upon.' }),
  alternatives_evaluated: Type.Array(Type.String(), { minItems: 2, description: 'At least two viable alternatives considered.' }),
  chosen_option: Type.String({ minLength: 1, description: 'The selected architectural or execution option.' }),
  rationale: Type.String({ minLength: 1, description: 'Evidence-based justification for the selection.' }),
  assumptions: Type.Array(Type.String(), { description: 'Underlying assumptions required for this decision to hold.' }),
  evidence_refs: Type.Array(Type.String(), { description: 'Citations, commit SHAs, or EventSpine IDs supporting this choice.' }),
  valid_from: Type.String({ format: 'date-time', description: 'Timestamp when this decision legally took effect.' }),
  observed_at: Type.String({ format: 'date-time', description: 'Timestamp when this decision was recorded in the ledger.' }),
  contract_hash: Type.String({ pattern: '^[0-9a-f]{64}$', description: 'SHA-256 hash of the canonical definition bound.' }),
  supersedes_id: Type.Union([Type.String(), Type.Null()], { description: 'Prior decision ID superseded by this revision, if any.' }),
}, { $id: 'DecisionRecord' })

export type DecisionRecord = Static<typeof DecisionRecord>
