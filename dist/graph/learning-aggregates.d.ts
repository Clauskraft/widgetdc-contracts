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
import { Static } from '@sinclair/typebox';
/**
 * LLMModelStats — running cost/quality/latency aggregate per (model, domain).
 *
 * Source: rlm-engine `ensemble_logger.py` `_try_flush` — synchronous MERGE at
 * the same Neo4j write that creates the LLMDecision. Survives the purge.
 * Consumed by `DynamicLLMSelector._seed_from_llm_model_stats` (rlm-engine) for
 * cross-process routing memory; by `LLMAnomalyWatcher` for tripwires.
 */
export declare const LLMModelStats: import("@sinclair/typebox").TObject<{
    model: import("@sinclair/typebox").TString;
    domain: import("@sinclair/typebox").TString;
    provider: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    total_calls: import("@sinclair/typebox").TInteger;
    success_count: import("@sinclair/typebox").TInteger;
    total_cost: import("@sinclair/typebox").TNumber;
    total_tokens: import("@sinclair/typebox").TInteger;
    total_latency_ms: import("@sinclair/typebox").TNumber;
    total_quality: import("@sinclair/typebox").TNumber;
    success_rate: import("@sinclair/typebox").TNumber;
    avg_cost: import("@sinclair/typebox").TNumber;
    avg_tokens: import("@sinclair/typebox").TNumber;
    avg_latency_ms: import("@sinclair/typebox").TNumber;
    avg_quality: import("@sinclair/typebox").TNumber;
    created_at: import("@sinclair/typebox").TString;
    updated_at: import("@sinclair/typebox").TString;
}>;
export type LLMModelStats = Static<typeof LLMModelStats>;
/**
 * StrategyStats — running strategy-selection aggregate per (strategy, complexity).
 *
 * Source: rlm-engine `thinking_tools.py` `steps_query` — synchronous MERGE at
 * the same write that creates the ReasonStep. Survives the purge. Reads (when
 * wired): future Greb-4 reasoning-strategy selector.
 */
export declare const StrategyStats: import("@sinclair/typebox").TObject<{
    strategy: import("@sinclair/typebox").TString;
    complexity: import("@sinclair/typebox").TString;
    total_steps: import("@sinclair/typebox").TInteger;
    retrieval_count: import("@sinclair/typebox").TInteger;
    folding_count: import("@sinclair/typebox").TInteger;
    swarm_count: import("@sinclair/typebox").TInteger;
    retrieval_rate: import("@sinclair/typebox").TNumber;
    folding_rate: import("@sinclair/typebox").TNumber;
    swarm_rate: import("@sinclair/typebox").TNumber;
    created_at: import("@sinclair/typebox").TString;
    updated_at: import("@sinclair/typebox").TString;
}>;
export type StrategyStats = Static<typeof StrategyStats>;
/**
 * CandidateScoreStats — running scoring-component aggregate per strategy.
 *
 * Source: rlm-engine `thinking_tools.py` `candidates_query` — synchronous MERGE
 * at the same write that creates the DecisionCandidate. Survives the purge.
 * Reads (when wired): future Greb-4 scoring-weight tuner.
 */
export declare const CandidateScoreStats: import("@sinclair/typebox").TObject<{
    strategy: import("@sinclair/typebox").TString;
    total_candidates: import("@sinclair/typebox").TInteger;
    sum_score: import("@sinclair/typebox").TNumber;
    sum_evidence_strength: import("@sinclair/typebox").TNumber;
    sum_service_fit: import("@sinclair/typebox").TNumber;
    sum_policy_fit: import("@sinclair/typebox").TNumber;
    sum_prior_success: import("@sinclair/typebox").TNumber;
    sum_novelty_bonus: import("@sinclair/typebox").TNumber;
    sum_cost_penalty: import("@sinclair/typebox").TNumber;
    sum_latency_penalty: import("@sinclair/typebox").TNumber;
    sum_contradiction_penalty: import("@sinclair/typebox").TNumber;
    avg_score: import("@sinclair/typebox").TNumber;
    avg_evidence_strength: import("@sinclair/typebox").TNumber;
    avg_service_fit: import("@sinclair/typebox").TNumber;
    avg_policy_fit: import("@sinclair/typebox").TNumber;
    avg_prior_success: import("@sinclair/typebox").TNumber;
    avg_novelty_bonus: import("@sinclair/typebox").TNumber;
    avg_cost_penalty: import("@sinclair/typebox").TNumber;
    avg_latency_penalty: import("@sinclair/typebox").TNumber;
    avg_contradiction_penalty: import("@sinclair/typebox").TNumber;
    created_at: import("@sinclair/typebox").TString;
    updated_at: import("@sinclair/typebox").TString;
}>;
export type CandidateScoreStats = Static<typeof CandidateScoreStats>;
/**
 * The canonical relationship type connecting each aggregate to its source
 * domain / strategy when modelled as edges (e.g.
 * `(:LLMModelStats)-[:STATS_FOR_DOMAIN]->(:Domain)`). Co-located here so
 * writers and readers share the exact name.
 */
export declare const LearningAggregateRelations: {
    readonly STATS_FOR_DOMAIN: "STATS_FOR_DOMAIN";
    readonly STATS_FOR_PROVIDER: "STATS_FOR_PROVIDER";
};
export type LearningAggregateRelation = (typeof LearningAggregateRelations)[keyof typeof LearningAggregateRelations];
//# sourceMappingURL=learning-aggregates.d.ts.map