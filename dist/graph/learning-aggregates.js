/**
 * @widgetdc/contracts/graph/learning-aggregates — permanent learning aggregates
 * that survive the ephemeral-trace retention purge.
 *
 * Background: the WidgeTDC backend purges ephemeral reasoning-trace nodes
 * (RLMDecision, LLMDecision, ReasonStep, DecisionCandidate) after a retention
 * window (default 30 days). For learning to outlive the raw traces, each
 * trace type writes a synchronous aggregate at MERGE time — the RLMTool
 * pattern. This file is the canonical shape of those aggregates so that:
 *
 *   - writers (rlm-engine) and readers (DynamicLLMSelector, ModelRouter,
 *     LLMAnomalyWatcher, Obsidian dashboards) agree on the property names,
 *     types, and units;
 *   - the WidgeTDC TRACE_LEARNING_CAPTURE gate has a typed contract to
 *     point at instead of free-text rationale;
 *   - any future consumer can validate graph rows against the schema.
 *
 * The aggregates ARE permanent (not in EPHEMERAL_TRACE_LABELS). They are
 * keyed by (model+domain) for LLMModelStats, (strategy+complexity) for
 * StrategyStats, and (strategy) for CandidateScoreStats.
 *
 * @see WidgeTDC apps/backend/src/services/graph/GraphOverflowManager.ts
 *        (TRACE_LEARNING_CAPTURE registry + purge predicate)
 * @see widgetdc-rlm-engine src/intelligence/infra/ensemble_logger.py
 *        (LLMModelStats writer)
 * @see widgetdc-rlm-engine src/intelligence/reasoning/thinking_tools.py
 *        (StrategyStats + CandidateScoreStats writers)
 */
import { Type } from '@sinclair/typebox';
/**
 * LLMModelStats — running cost/quality/latency aggregate per (model, domain).
 *
 * Source: rlm-engine `ensemble_logger.py` `_try_flush` — synchronous MERGE at
 * the same Neo4j write that creates the LLMDecision. Survives the purge.
 * Consumed by `DynamicLLMSelector._seed_from_llm_model_stats` (rlm-engine) for
 * cross-process routing memory; by `LLMAnomalyWatcher` for tripwires.
 */
export const LLMModelStats = Type.Object({
    // Composite key
    model: Type.String({ description: 'Model identifier (e.g. "gemini-2.0-flash")' }),
    domain: Type.String({ description: 'Routing domain (e.g. "Learning", "Strategy")' }),
    provider: Type.Optional(Type.String({ description: 'Provider id (set ON CREATE)' })),
    // Running totals (incremented per call)
    total_calls: Type.Integer({ minimum: 0, description: 'Number of recorded calls' }),
    success_count: Type.Integer({ minimum: 0, description: 'Calls with success=true' }),
    total_cost: Type.Number({ description: 'Sum of cost (USD)' }),
    total_tokens: Type.Integer({ minimum: 0, description: 'Sum of tokens_used' }),
    total_latency_ms: Type.Number({ description: 'Sum of latency_ms' }),
    total_quality: Type.Number({ description: 'Sum of quality_score' }),
    // Derived averages (recomputed in a SEPARATE SET clause, guarded against div-by-zero)
    success_rate: Type.Number({ minimum: 0, maximum: 1, description: 'success_count / total_calls' }),
    avg_cost: Type.Number({ description: 'total_cost / total_calls (USD/call)' }),
    avg_tokens: Type.Number({ description: 'total_tokens / total_calls' }),
    avg_latency_ms: Type.Number({ description: 'total_latency_ms / total_calls' }),
    avg_quality: Type.Number({ description: 'total_quality / total_calls' }),
    // Lifecycle
    created_at: Type.String({ format: 'date-time', description: 'ISO datetime; ON CREATE' }),
    updated_at: Type.String({ format: 'date-time', description: 'ISO datetime; on every flush' }),
}, {
    $id: 'LLMModelStats',
    description: 'Permanent cost/quality/latency aggregate per (model, domain). Survives the EPHEMERAL_TRACE_LABELS purge of raw LLMDecision rows.',
});
/**
 * StrategyStats — running strategy-selection aggregate per (strategy, complexity).
 *
 * Source: rlm-engine `thinking_tools.py` `steps_query` — synchronous MERGE at
 * the same write that creates the ReasonStep. Survives the purge. Reads (when
 * wired): future Greb-4 reasoning-strategy selector.
 */
export const StrategyStats = Type.Object({
    // Composite key
    strategy: Type.String({ description: 'Selected reasoning strategy (e.g. "evidence_bounded_reasoning")' }),
    complexity: Type.String({ description: 'Complexity bucket the step ran at (e.g. "medium")' }),
    // Counts
    total_steps: Type.Integer({ minimum: 0, description: 'Number of steps observed at this (strategy, complexity)' }),
    retrieval_count: Type.Integer({ minimum: 0 }),
    folding_count: Type.Integer({ minimum: 0 }),
    swarm_count: Type.Integer({ minimum: 0 }),
    // Derived rates (guarded against div-by-zero)
    retrieval_rate: Type.Number({ minimum: 0, maximum: 1, description: 'retrieval_count / total_steps' }),
    folding_rate: Type.Number({ minimum: 0, maximum: 1 }),
    swarm_rate: Type.Number({ minimum: 0, maximum: 1 }),
    // Lifecycle
    created_at: Type.String({ format: 'date-time' }),
    updated_at: Type.String({ format: 'date-time' }),
}, {
    $id: 'StrategyStats',
    description: 'Permanent strategy-selection aggregate per (strategy, complexity). Survives the EPHEMERAL_TRACE_LABELS purge of raw ReasonStep rows.',
});
/**
 * CandidateScoreStats — running scoring-component aggregate per strategy.
 *
 * Source: rlm-engine `thinking_tools.py` `candidates_query` — synchronous MERGE
 * at the same write that creates the DecisionCandidate. Survives the purge.
 * Reads (when wired): future Greb-4 scoring-weight tuner.
 */
export const CandidateScoreStats = Type.Object({
    // Key
    strategy: Type.String({ description: 'Strategy the candidate was scored against' }),
    // Counts and component sums
    total_candidates: Type.Integer({ minimum: 0 }),
    sum_score: Type.Number(),
    sum_evidence_strength: Type.Number(),
    sum_service_fit: Type.Number(),
    sum_policy_fit: Type.Number(),
    sum_prior_success: Type.Number(),
    sum_novelty_bonus: Type.Number(),
    sum_cost_penalty: Type.Number(),
    sum_latency_penalty: Type.Number(),
    sum_contradiction_penalty: Type.Number(),
    // Derived averages (guarded against div-by-zero)
    avg_score: Type.Number(),
    avg_evidence_strength: Type.Number(),
    avg_service_fit: Type.Number(),
    avg_policy_fit: Type.Number(),
    avg_prior_success: Type.Number(),
    avg_novelty_bonus: Type.Number(),
    avg_cost_penalty: Type.Number(),
    avg_latency_penalty: Type.Number(),
    avg_contradiction_penalty: Type.Number(),
    // Lifecycle
    created_at: Type.String({ format: 'date-time' }),
    updated_at: Type.String({ format: 'date-time' }),
}, {
    $id: 'CandidateScoreStats',
    description: 'Permanent scoring-component aggregate per strategy. Survives the EPHEMERAL_TRACE_LABELS purge of raw DecisionCandidate rows.',
});
/**
 * The canonical relationship type connecting each aggregate to its source
 * domain / strategy when modelled as edges (e.g.
 * `(:LLMModelStats)-[:STATS_FOR_DOMAIN]->(:Domain)`). Co-located here so
 * writers and readers share the exact name.
 */
export const LearningAggregateRelations = {
    STATS_FOR_DOMAIN: 'STATS_FOR_DOMAIN',
    STATS_FOR_PROVIDER: 'STATS_FOR_PROVIDER',
};
//# sourceMappingURL=learning-aggregates.js.map