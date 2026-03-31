import { Type, Static } from '@sinclair/typebox'

/**
 * RewardVector — 5-dimension reward signal for Q-learning feedback.
 * Wire format: snake_case JSON.
 *
 * Source: WidgeTDC lib/rewardSignals.ts
 * Consumer: RLM Engine routes/rewards.py
 */

/** Reward dimension names */
export const RewardDimension = Type.Union([
  Type.Literal('quality'),
  Type.Literal('latency'),
  Type.Literal('cost'),
  Type.Literal('satisfaction'),
  Type.Literal('reliability'),
], { $id: 'RewardDimension', description: 'Reward signal dimension' })

export type RewardDimension = Static<typeof RewardDimension>

/** 5-dimension reward vector */
export const RewardVector = Type.Object({
  quality: Type.Number({ minimum: 0, maximum: 10, description: 'Output quality score' }),
  latency: Type.Number({ minimum: 0, maximum: 10, description: 'Speed score (10=fastest)' }),
  cost: Type.Number({ minimum: 0, maximum: 10, description: 'Cost efficiency (10=cheapest)' }),
  satisfaction: Type.Number({ minimum: 0, maximum: 10, description: 'User/agent satisfaction' }),
  reliability: Type.Number({ minimum: 0, maximum: 10, description: 'Completion without errors' }),
}, { $id: 'RewardVector', description: 'Multi-dimensional Q-learning reward signal' })

export type RewardVector = Static<typeof RewardVector>

/** Reward dimension weights (must sum to 1.0) */
export const RewardWeights = Type.Object({
  quality: Type.Number({ minimum: 0, maximum: 1 }),
  latency: Type.Number({ minimum: 0, maximum: 1 }),
  cost: Type.Number({ minimum: 0, maximum: 1 }),
  satisfaction: Type.Number({ minimum: 0, maximum: 1 }),
  reliability: Type.Number({ minimum: 0, maximum: 1 }),
}, { $id: 'RewardWeights', description: 'Reward dimension weights (should sum to 1.0)' })

export type RewardWeights = Static<typeof RewardWeights>

/** Recorded reward entry */
export const RewardEntry = Type.Object({
  task_id: Type.String({ description: 'Task/decision ID' }),
  agent_id: Type.String({ description: 'Agent persona that executed' }),
  action: Type.String({ description: 'Action taken (tool or persona)' }),
  vector: RewardVector,
  composite: Type.Number({ description: 'Weighted composite score 0-10' }),
  timestamp: Type.Number({ description: 'Unix timestamp ms' }),
}, { $id: 'RewardEntry', description: 'Recorded reward observation' })

export type RewardEntry = Static<typeof RewardEntry>
