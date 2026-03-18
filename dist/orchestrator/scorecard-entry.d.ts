import { Static } from '@sinclair/typebox';
export declare const ScorecardMetricStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pass">, import("@sinclair/typebox").TLiteral<"warn">, import("@sinclair/typebox").TLiteral<"fail">, import("@sinclair/typebox").TLiteral<"pending">]>;
export type ScorecardMetricStatus = Static<typeof ScorecardMetricStatus>;
export declare const ScorecardEntry: import("@sinclair/typebox").TObject<{
    entry_id: import("@sinclair/typebox").TString;
    recorded_at: import("@sinclair/typebox").TString;
    task_domain: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"intake">, import("@sinclair/typebox").TLiteral<"decomposition">, import("@sinclair/typebox").TLiteral<"recommendation">, import("@sinclair/typebox").TLiteral<"learning">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"audit">]>;
    scope_owner: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"widgetdc-orchestrator">, import("@sinclair/typebox").TLiteral<"widgetdc-librechat">, import("@sinclair/typebox").TLiteral<"snout">]>;
    dimension: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"prioritization_quality">, import("@sinclair/typebox").TLiteral<"decomposition_quality">, import("@sinclair/typebox").TLiteral<"promotion_precision">, import("@sinclair/typebox").TLiteral<"decision_stability">, import("@sinclair/typebox").TLiteral<"operator_acceptance">, import("@sinclair/typebox").TLiteral<"normalization_quality">, import("@sinclair/typebox").TLiteral<"arbitration_confidence">, import("@sinclair/typebox").TLiteral<"time_to_verified_decision">, import("@sinclair/typebox").TLiteral<"tri_source_arbitration_divergence">]>;
    metric_name: import("@sinclair/typebox").TString;
    metric_value: import("@sinclair/typebox").TNumber;
    target_value: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pass">, import("@sinclair/typebox").TLiteral<"warn">, import("@sinclair/typebox").TLiteral<"fail">, import("@sinclair/typebox").TLiteral<"pending">]>;
    confidence: import("@sinclair/typebox").TNumber;
    sample_size: import("@sinclair/typebox").TInteger;
    evidence_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    trust_profile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        agent_persona: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"RESEARCHER">, import("@sinclair/typebox").TLiteral<"ENGINEER">, import("@sinclair/typebox").TLiteral<"CUSTODIAN">, import("@sinclair/typebox").TLiteral<"ARCHITECT">, import("@sinclair/typebox").TLiteral<"SENTINEL">, import("@sinclair/typebox").TLiteral<"ARCHIVIST">, import("@sinclair/typebox").TLiteral<"HARVESTER">, import("@sinclair/typebox").TLiteral<"ANALYST">, import("@sinclair/typebox").TLiteral<"INTEGRATOR">, import("@sinclair/typebox").TLiteral<"TESTER">]>;
        agent_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Claude">, import("@sinclair/typebox").TLiteral<"Gemini">, import("@sinclair/typebox").TLiteral<"DeepSeek">, import("@sinclair/typebox").TLiteral<"Grok">, import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"User">, import("@sinclair/typebox").TLiteral<"System">, import("@sinclair/typebox").TLiteral<"Orchestrator">]>, import("@sinclair/typebox").TString]>>;
        runtime_identity: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        provider_source: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        task_domain: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"intake">, import("@sinclair/typebox").TLiteral<"decomposition">, import("@sinclair/typebox").TLiteral<"recommendation">, import("@sinclair/typebox").TLiteral<"learning">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"audit">]>;
        success_count: import("@sinclair/typebox").TInteger;
        fail_count: import("@sinclair/typebox").TInteger;
        bayesian_score: import("@sinclair/typebox").TNumber;
        prior_weight: import("@sinclair/typebox").TNumber;
        default_prior_score: import("@sinclair/typebox").TNumber;
        evidence_source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"decision_quality_scorecard">, import("@sinclair/typebox").TLiteral<"monitoring_audit_log">, import("@sinclair/typebox").TLiteral<"operator_feedback">, import("@sinclair/typebox").TLiteral<"runtime_readback">]>;
        scorecard_dimension: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"prioritization_quality">, import("@sinclair/typebox").TLiteral<"decomposition_quality">, import("@sinclair/typebox").TLiteral<"promotion_precision">, import("@sinclair/typebox").TLiteral<"decision_stability">, import("@sinclair/typebox").TLiteral<"operator_acceptance">, import("@sinclair/typebox").TLiteral<"normalization_quality">, import("@sinclair/typebox").TLiteral<"arbitration_confidence">, import("@sinclair/typebox").TLiteral<"time_to_verified_decision">, import("@sinclair/typebox").TLiteral<"tri_source_arbitration_divergence">]>;
        scope_owner: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"widgetdc-orchestrator">, import("@sinclair/typebox").TLiteral<"widgetdc-librechat">, import("@sinclair/typebox").TLiteral<"snout">]>;
        last_verified_at: import("@sinclair/typebox").TString;
    }>>;
    notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type ScorecardEntry = Static<typeof ScorecardEntry>;
//# sourceMappingURL=scorecard-entry.d.ts.map