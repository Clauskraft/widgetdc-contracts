/**
 * CandidateContractEnvelope — Demand-to-Proof contract authority surface.
 *
 * Candidate-only wire contract used by WDC/DeskSmith contract inventory to
 * make demand, extraction, scoring, routing, mapping, review and dry-run graph
 * diff boundaries explicit before any graph write or claim promotion.
 *
 * Wire format: snake_case JSON.
 */
import { Type, Static } from '@sinclair/typebox'

export const CandidateContractEnvelope = Type.Object({
  id: Type.String({ minLength: 1, description: 'Stable CandidateContractEnvelope identifier.' }),
  schema_version: Type.String({ default: 'v1' }),
  demand_id: Type.Optional(Type.String({ minLength: 1 })),
  source_ref: Type.Optional(Type.String({ minLength: 1, description: 'Opaque source reference; never a raw local path.' })),
  source_fit_score: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
  extraction_contract_ref: Type.Optional(Type.String({ minLength: 1 })),
  required_competences: Type.Optional(Type.Array(Type.String())),
  provided_competences: Type.Optional(Type.Array(Type.String())),
  proof_boundary: Type.Optional(Type.Union([
    Type.Literal('candidate_only_not_runtime_proof'),
    Type.Literal('runtime_evidence_required'),
    Type.Literal('claim_promotion_forbidden'),
  ])),
  graph_write_allowed: Type.Optional(Type.Boolean({ default: false })),
  claim_promotion_allowed: Type.Optional(Type.Boolean({ default: false })),
  evidence_hash: Type.Optional(Type.String({ pattern: '^sha256:[a-f0-9]{16,64}$' })),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
}, {
  $id: 'CandidateContractEnvelope',
  description: 'CandidateContractEnvelope contract for governed Demand-to-Proof candidate processing.',
  additionalProperties: true,
})

export type CandidateContractEnvelope = Static<typeof CandidateContractEnvelope>
