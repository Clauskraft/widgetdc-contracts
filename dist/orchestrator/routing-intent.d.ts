import { Static } from '@sinclair/typebox';
export declare const RoutingCapability: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"engagement_intake">, import("@sinclair/typebox").TLiteral<"guided_decomposition">, import("@sinclair/typebox").TLiteral<"verified_recommendation">, import("@sinclair/typebox").TLiteral<"learning_feedback">, import("@sinclair/typebox").TLiteral<"workflow_audit">]>;
export type RoutingCapability = Static<typeof RoutingCapability>;
export declare const RoutingIntent: import("@sinclair/typebox").TObject<{
    intent_id: import("@sinclair/typebox").TString;
    capability: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"engagement_intake">, import("@sinclair/typebox").TLiteral<"guided_decomposition">, import("@sinclair/typebox").TLiteral<"verified_recommendation">, import("@sinclair/typebox").TLiteral<"learning_feedback">, import("@sinclair/typebox").TLiteral<"workflow_audit">]>;
    task_domain: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"intake">, import("@sinclair/typebox").TLiteral<"decomposition">, import("@sinclair/typebox").TLiteral<"recommendation">, import("@sinclair/typebox").TLiteral<"learning">, import("@sinclair/typebox").TLiteral<"audit">]>;
    flow_ref: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"core-flow-1">, import("@sinclair/typebox").TLiteral<"core-flow-2">, import("@sinclair/typebox").TLiteral<"core-flow-3">]>;
    route_scope: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"widgetdc-orchestrator">, import("@sinclair/typebox").TLiteral<"widgetdc-librechat">, import("@sinclair/typebox").TLiteral<"snout">]>>;
    operator_visible: import("@sinclair/typebox").TBoolean;
    scorecard_dimensions: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"prioritization_quality">, import("@sinclair/typebox").TLiteral<"decomposition_quality">, import("@sinclair/typebox").TLiteral<"promotion_precision">, import("@sinclair/typebox").TLiteral<"decision_stability">, import("@sinclair/typebox").TLiteral<"operator_acceptance">, import("@sinclair/typebox").TLiteral<"time_to_verified_decision">, import("@sinclair/typebox").TLiteral<"tri_source_arbitration_divergence">]>>;
}>;
export type RoutingIntent = Static<typeof RoutingIntent>;
//# sourceMappingURL=routing-intent.d.ts.map