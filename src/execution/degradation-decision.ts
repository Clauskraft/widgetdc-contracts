import { Static, Type } from '@sinclair/typebox'
import { EvidenceLevel } from './execution-envelope.js'

export const DEGRADATION_DECISION_SCHEMA_ID =
  'https://contracts.widgetdc.dev/execution/degradation-decision.schema.json' as const

export const DegradationDecision = Type.Object(
  {
    $id: Type.Literal(DEGRADATION_DECISION_SCHEMA_ID),
    decision_id: Type.String({ minLength: 1 }),
    envelope_id: Type.String({ minLength: 1 }),
    risk_class: Type.Union([
      Type.Literal('read_only'),
      Type.Literal('source_mutation'),
      Type.Literal('governed_mutation'),
    ]),
    trigger: Type.Union([
      Type.Literal('missing_optional_specialist'),
      Type.Literal('missing_required_verifier'),
      Type.Literal('corrupt_adapter_state'),
    ]),
    decision: Type.Union([
      Type.Literal('continue_with_disclosed_coverage_loss'),
      Type.Literal('assign_human_verifier'),
      Type.Literal('isolate_adapter_and_use_native_state'),
      Type.Literal('expected_stop'),
    ]),
    coverage_loss_disclosed: Type.Boolean(),
    alternative_ref: Type.Optional(Type.String({ minLength: 1 })),
    next_step: Type.String({ minLength: 1 }),
    claim_ceiling: EvidenceLevel,
    created_at: Type.String({ format: 'date-time' }),
  },
  {
    $id: DEGRADATION_DECISION_SCHEMA_ID,
    title: 'WDC Degradation Decision',
    additionalProperties: false,
  },
)
export type DegradationDecision = Static<typeof DegradationDecision>
