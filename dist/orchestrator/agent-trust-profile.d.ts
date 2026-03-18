import { Static } from '@sinclair/typebox';
export declare const OrchestratorTaskDomain: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"intake">, import("@sinclair/typebox").TLiteral<"decomposition">, import("@sinclair/typebox").TLiteral<"recommendation">, import("@sinclair/typebox").TLiteral<"learning">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"audit">]>;
export type OrchestratorTaskDomain = Static<typeof OrchestratorTaskDomain>;
export declare const TrustEvidenceSource: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"decision_quality_scorecard">, import("@sinclair/typebox").TLiteral<"monitoring_audit_log">, import("@sinclair/typebox").TLiteral<"operator_feedback">, import("@sinclair/typebox").TLiteral<"runtime_readback">]>;
export type TrustEvidenceSource = Static<typeof TrustEvidenceSource>;
export declare const AgentTrustProfile: import("@sinclair/typebox").TObject<{
    agent_id: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Claude">, import("@sinclair/typebox").TLiteral<"Gemini">, import("@sinclair/typebox").TLiteral<"DeepSeek">, import("@sinclair/typebox").TLiteral<"Grok">, import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"User">, import("@sinclair/typebox").TLiteral<"System">, import("@sinclair/typebox").TLiteral<"Orchestrator">]>, import("@sinclair/typebox").TString]>;
    task_domain: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"intake">, import("@sinclair/typebox").TLiteral<"decomposition">, import("@sinclair/typebox").TLiteral<"recommendation">, import("@sinclair/typebox").TLiteral<"learning">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"audit">]>;
    success_count: import("@sinclair/typebox").TInteger;
    fail_count: import("@sinclair/typebox").TInteger;
    bayesian_score: import("@sinclair/typebox").TNumber;
    prior_weight: import("@sinclair/typebox").TNumber;
    default_prior_score: import("@sinclair/typebox").TNumber;
    evidence_source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"decision_quality_scorecard">, import("@sinclair/typebox").TLiteral<"monitoring_audit_log">, import("@sinclair/typebox").TLiteral<"operator_feedback">, import("@sinclair/typebox").TLiteral<"runtime_readback">]>;
    scorecard_dimension: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"prioritization_quality">, import("@sinclair/typebox").TLiteral<"decomposition_quality">, import("@sinclair/typebox").TLiteral<"promotion_precision">, import("@sinclair/typebox").TLiteral<"decision_stability">, import("@sinclair/typebox").TLiteral<"operator_acceptance">]>;
    scope_owner: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"widgetdc-orchestrator">, import("@sinclair/typebox").TLiteral<"widgetdc-librechat">, import("@sinclair/typebox").TLiteral<"snout">]>;
    last_verified_at: import("@sinclair/typebox").TString;
}>;
export type AgentTrustProfile = Static<typeof AgentTrustProfile>;
//# sourceMappingURL=agent-trust-profile.d.ts.map