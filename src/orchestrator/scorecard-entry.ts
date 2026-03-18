import { Type, Static } from '@sinclair/typebox'
import {
  AgentTrustProfile,
  OrchestratorTaskDomain,
  ScorecardDimension,
  ScopeOwner,
} from './agent-trust-profile.js'

export const ScorecardMetricStatus = Type.Union([
  Type.Literal('pass'),
  Type.Literal('warn'),
  Type.Literal('fail'),
  Type.Literal('pending'),
], {
  $id: 'ScorecardMetricStatus',
  description: 'Evaluation status for a scorecard metric.',
})

export type ScorecardMetricStatus = Static<typeof ScorecardMetricStatus>

export const ScorecardEntry = Type.Object({
  entry_id: Type.String({
    minLength: 1,
    description: 'Stable scorecard entry identifier for a batch, case, or evaluation window.',
  }),
  recorded_at: Type.String({
    format: 'date-time',
    description: 'Timestamp when the scorecard entry was recorded.',
  }),
  task_domain: OrchestratorTaskDomain,
  scope_owner: ScopeOwner,
  dimension: ScorecardDimension,
  metric_name: Type.String({
    minLength: 1,
    description: 'Human-readable metric label, e.g. Normalization Quality.',
  }),
  metric_value: Type.Number({
    description: 'Observed metric value.',
  }),
  target_value: Type.Optional(Type.Number({
    description: 'Target metric value for comparison.',
  })),
  status: ScorecardMetricStatus,
  confidence: Type.Number({
    minimum: 0,
    maximum: 1,
    description: 'Confidence in the metric evaluation.',
  }),
  sample_size: Type.Integer({
    minimum: 0,
    description: 'Number of observations underlying the metric.',
  }),
  evidence_refs: Type.Array(Type.String(), {
    minItems: 1,
    description: 'References to runtime, Linear, docs, or graph evidence.',
  }),
  trust_profile: Type.Optional(AgentTrustProfile),
  notes: Type.Optional(Type.String({
    description: 'Short explanatory note for operators or audits.',
  })),
}, {
  $id: 'ScorecardEntry',
  description:
    'Canonical decision-quality scorecard entry used for runtime enforcement, monitoring, and governed routing review.',
})

export type ScorecardEntry = Static<typeof ScorecardEntry>
