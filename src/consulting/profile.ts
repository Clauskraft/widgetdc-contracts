import { Type, Static } from '@sinclair/typebox'
import { DomainId } from './enums.js'
import { HealthMetrics } from '../health/metrics.js'

/** Combined domain identity and its intelligence status */
export const DomainHealthProfile = Type.Object({
  domain_id: DomainId,
  health: HealthMetrics,
  intelligence_assets_count: Type.Integer({ description: 'Number of linked intelligence assets' }),
  risk_rules_triggered: Type.Integer({ description: 'Count of active risk rules' }),
  updated_at: Type.String({ format: 'date-time' }),
}, { $id: 'DomainHealthProfile', description: 'Combined domain identity and its intelligence status' })

export type DomainHealthProfile = Static<typeof DomainHealthProfile>

export const LogicReconstructionPacket = Type.Object({
  source_language: Type.String({
    description: 'Detected or supplied source language identifier.',
  }),
  reconstruction_method: Type.String({
    description: 'Backend used to derive the reconstruction packet.',
  }),
  contextual_summary: Type.String({
    description: 'Compact contextual summary preserving likely business intent.',
  }),
  intent_graph: Type.Object({
    nodes: Type.Array(Type.Object({
      id: Type.String(),
      kind: Type.String(),
      label: Type.String(),
      metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    })),
    edges: Type.Array(Type.Object({
      source: Type.String(),
      target: Type.String(),
      relation: Type.String(),
    })),
  }),
  invariant_list: Type.Array(Type.String(), {
    description: 'Declarative rules, conditions, or invariants inferred from the source.',
  }),
}, {
  $id: 'LogicReconstructionPacket',
  description: 'Language-agnostic logic reconstruction output derived from source code or execution-oriented artifacts.',
})

export type LogicReconstructionPacket = Static<typeof LogicReconstructionPacket>
