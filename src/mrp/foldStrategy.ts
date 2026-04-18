/**
 * FoldStrategyChoice — decision output of FoldStrategySelector (P2.1).
 *
 * Exposed to orchestrator HyperAgent for evaluate_plan KPIs and logged in
 * `:FoldEpisode` for closed-loop reward tracking (P2.2).
 *
 * Wire format: snake_case JSON.
 */
import { Type, Static } from '@sinclair/typebox'

export const FoldTier = Type.Union([
  Type.Literal('T1'),
  Type.Literal('T2'),
  Type.Literal('T3'),
  Type.Literal('T4'),
  Type.Literal('T5'),
  Type.Literal('T6'),
  Type.Literal('T7'),
], { $id: 'FoldTier', description: 'T1 (no-op) through T7 (hierarchical-reason) compression strategies.' })

export type FoldTier = Static<typeof FoldTier>

export const FoldStrategyDefinition = Type.Object({
  tier: FoldTier,
  name: Type.String(),
  max_input_tokens: Type.Integer({ minimum: 0 }),
  target_compression_ratio: Type.Number({ minimum: 0, maximum: 1 }),
  expected_latency_ms: Type.Optional(Type.Integer()),
  preserves_detail: Type.Optional(Type.Boolean()),
}, { $id: 'FoldStrategyDefinition' })

export type FoldStrategyDefinition = Static<typeof FoldStrategyDefinition>

export const FoldStrategyChoice = Type.Object({
  strategy: FoldTier,
  rationale: Type.Array(Type.String(), { description: 'Ordered list of reasons the selector picked this tier.' }),
  definition: FoldStrategyDefinition,
  input_tokens: Type.Optional(Type.Integer()),
  selected_at: Type.Optional(Type.String({ format: 'date-time' })),
}, {
  $id: 'FoldStrategyChoice',
  description: 'Output of FoldStrategySelector; consumed by context_folding.fold and logged to :FoldEpisode.',
})

export type FoldStrategyChoice = Static<typeof FoldStrategyChoice>
