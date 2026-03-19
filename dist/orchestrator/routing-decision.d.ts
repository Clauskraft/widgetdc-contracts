import { Static } from '@sinclair/typebox';
export declare const RoutingDecision: import("@sinclair/typebox").TObject<{
    decision_id: import("@sinclair/typebox").TString;
    intent: import("@sinclair/typebox").TObject<{
        intent_id: import("@sinclair/typebox").TString;
        capability: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"engagement_intake">, import("@sinclair/typebox").TLiteral<"guided_decomposition">, import("@sinclair/typebox").TLiteral<"verified_recommendation">, import("@sinclair/typebox").TLiteral<"learning_feedback">, import("@sinclair/typebox").TLiteral<"workflow_audit">]>;
        task_domain: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"intake">, import("@sinclair/typebox").TLiteral<"decomposition">, import("@sinclair/typebox").TLiteral<"recommendation">, import("@sinclair/typebox").TLiteral<"learning">, import("@sinclair/typebox").TLiteral<"audit">]>;
        flow_ref: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"core-flow-1">, import("@sinclair/typebox").TLiteral<"core-flow-2">, import("@sinclair/typebox").TLiteral<"core-flow-3">]>;
        route_scope: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"widgetdc-orchestrator">, import("@sinclair/typebox").TLiteral<"widgetdc-librechat">, import("@sinclair/typebox").TLiteral<"snout">]>>;
        operator_visible: import("@sinclair/typebox").TBoolean;
        scorecard_dimensions: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"prioritization_quality">, import("@sinclair/typebox").TLiteral<"decomposition_quality">, import("@sinclair/typebox").TLiteral<"promotion_precision">, import("@sinclair/typebox").TLiteral<"decision_stability">, import("@sinclair/typebox").TLiteral<"operator_acceptance">, import("@sinclair/typebox").TLiteral<"time_to_verified_decision">, import("@sinclair/typebox").TLiteral<"tri_source_arbitration_divergence">]>>;
    }>;
    selected_agent_id: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Claude">, import("@sinclair/typebox").TLiteral<"Gemini">, import("@sinclair/typebox").TLiteral<"DeepSeek">, import("@sinclair/typebox").TLiteral<"Grok">, import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"User">, import("@sinclair/typebox").TLiteral<"System">, import("@sinclair/typebox").TLiteral<"Orchestrator">]>, import("@sinclair/typebox").TString]>;
    selected_capability: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"engagement_intake">, import("@sinclair/typebox").TLiteral<"guided_decomposition">, import("@sinclair/typebox").TLiteral<"verified_recommendation">, import("@sinclair/typebox").TLiteral<"learning_feedback">, import("@sinclair/typebox").TLiteral<"workflow_audit">]>;
    trust_score: import("@sinclair/typebox").TNumber;
    reason_code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"TRUST_WIN">, import("@sinclair/typebox").TLiteral<"COST_TIER_MATCH">, import("@sinclair/typebox").TLiteral<"FLOW_SPECIALIZATION">, import("@sinclair/typebox").TLiteral<"FALLBACK_ROUTE">, import("@sinclair/typebox").TLiteral<"WAIVER_ROUTE">, import("@sinclair/typebox").TLiteral<"FABRIC_WIN">]>;
    fabric_route_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    latency_deterministic: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    vampire_drain_rate: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    target_shadow_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    evidence_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    waiver_reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    decided_at: import("@sinclair/typebox").TString;
}>;
export type RoutingDecision = Static<typeof RoutingDecision>;
//# sourceMappingURL=routing-decision.d.ts.map