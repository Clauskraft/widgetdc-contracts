/**
 * ProductionOrder — planned-vs-actual lineage record for a /produce run.
 *
 * Mirrors the `:ProductionOrder` node persisted in Neo4j by
 * `GenerationOrchestrator.produce()` (backend/services/generation).
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const ProductionOrderStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"open">, import("@sinclair/typebox").TLiteral<"running">, import("@sinclair/typebox").TLiteral<"closed">, import("@sinclair/typebox").TLiteral<"failed">]>;
export type ProductionOrderStatus = Static<typeof ProductionOrderStatus>;
export declare const ProductionOrderVariance: import("@sinclair/typebox").TObject<{
    sourced_components: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    planned_sections: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    actual_sections: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    planned_cost_usd: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    actual_cost_usd: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    planned_latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    actual_latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    quality_score: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export type ProductionOrderVariance = Static<typeof ProductionOrderVariance>;
export declare const ProductionOrder: import("@sinclair/typebox").TObject<{
    order_id: import("@sinclair/typebox").TString;
    product_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"architecture">, import("@sinclair/typebox").TLiteral<"document">, import("@sinclair/typebox").TLiteral<"presentation">, import("@sinclair/typebox").TLiteral<"diagram">, import("@sinclair/typebox").TLiteral<"pdf">, import("@sinclair/typebox").TLiteral<"code">]>;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"open">, import("@sinclair/typebox").TLiteral<"running">, import("@sinclair/typebox").TLiteral<"closed">, import("@sinclair/typebox").TLiteral<"failed">]>;
    planned_at: import("@sinclair/typebox").TString;
    started_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    completed_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    failed_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    failure_reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    variance: import("@sinclair/typebox").TObject<{
        sourced_components: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        planned_sections: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        actual_sections: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        planned_cost_usd: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        actual_cost_usd: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        planned_latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        actual_latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        quality_score: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>;
    bom_version: import("@sinclair/typebox").TString;
    compliance_tier: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    cluster: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    provider_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    trace_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    agent_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type ProductionOrder = Static<typeof ProductionOrder>;
//# sourceMappingURL=productionOrder.d.ts.map