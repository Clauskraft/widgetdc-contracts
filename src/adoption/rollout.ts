import { Type, Static } from '@sinclair/typebox'

/**
 * RolloutState — Feature rollout tracking.
 * Wire format: snake_case JSON.
 *
 * Source: WidgeTDC lib/rolloutTracker.ts
 */

/** Rollout state options */
export const RolloutState = Type.Union([
  Type.Literal('active'),
  Type.Literal('degraded'),
  Type.Literal('disabled'),
  Type.Literal('canary'),
], { $id: 'RolloutState', description: 'Feature rollout state' })

export type RolloutState = Static<typeof RolloutState>

/** Rollout metrics per feature */
export const RolloutMetrics = Type.Object({
  invocations: Type.Integer({ minimum: 0 }),
  failures: Type.Integer({ minimum: 0 }),
  avg_latency_ms: Type.Number({ minimum: 0 }),
}, { $id: 'RolloutMetrics', description: 'Rollout invocation metrics' })

export type RolloutMetrics = Static<typeof RolloutMetrics>

/** Feature rollout entry */
export const RolloutEntry = Type.Object({
  feature_id: Type.String({ description: 'Feature/tool identifier' }),
  state: RolloutState,
  rollout_pct: Type.Number({ minimum: 0, maximum: 100, description: 'Traffic percentage' }),
  updated_at: Type.Number({ description: 'Unix timestamp ms of last state change' }),
  changed_by: Type.String({ description: 'Who/what changed state' }),
  reason: Type.String({ description: 'Reason for current state' }),
  expires_at: Type.Optional(Type.Number({ description: 'Auto-disable timestamp' })),
  metrics: RolloutMetrics,
}, { $id: 'RolloutEntry', description: 'Feature rollout state entry' })

export type RolloutEntry = Static<typeof RolloutEntry>

/** Rollout summary across all features */
export const RolloutSummary = Type.Object({
  total: Type.Integer(),
  active: Type.Integer(),
  degraded: Type.Integer(),
  disabled: Type.Integer(),
  canary: Type.Integer(),
  features: Type.Array(RolloutEntry),
}, { $id: 'RolloutSummary', description: 'Rollout summary across all features' })

export type RolloutSummary = Static<typeof RolloutSummary>
