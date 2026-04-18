/**
 * ProductionOrder — planned-vs-actual lineage record for a /produce run.
 *
 * Mirrors the `:ProductionOrder` node persisted in Neo4j by
 * `GenerationOrchestrator.produce()` (backend/services/generation).
 *
 * Wire format: snake_case JSON.
 */
import { Type } from '@sinclair/typebox';
import { ProductType } from './produceRequest.js';
export const ProductionOrderStatus = Type.Union([
    Type.Literal('open'),
    Type.Literal('running'),
    Type.Literal('closed'),
    Type.Literal('failed'),
], { $id: 'ProductionOrderStatus' });
export const ProductionOrderVariance = Type.Object({
    sourced_components: Type.Optional(Type.Integer({ minimum: 0 })),
    planned_sections: Type.Optional(Type.Integer({ minimum: 0 })),
    actual_sections: Type.Optional(Type.Integer({ minimum: 0 })),
    planned_cost_usd: Type.Optional(Type.Number()),
    actual_cost_usd: Type.Optional(Type.Number()),
    planned_latency_ms: Type.Optional(Type.Integer()),
    actual_latency_ms: Type.Optional(Type.Integer()),
    quality_score: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
}, { $id: 'ProductionOrderVariance', additionalProperties: true });
export const ProductionOrder = Type.Object({
    order_id: Type.String({ format: 'uuid' }),
    product_type: ProductType,
    status: ProductionOrderStatus,
    planned_at: Type.String({ format: 'date-time' }),
    started_at: Type.Optional(Type.String({ format: 'date-time' })),
    completed_at: Type.Optional(Type.String({ format: 'date-time' })),
    failed_at: Type.Optional(Type.String({ format: 'date-time' })),
    failure_reason: Type.Optional(Type.String()),
    variance: ProductionOrderVariance,
    bom_version: Type.Literal('2.0'),
    compliance_tier: Type.Optional(Type.String()),
    cluster: Type.Optional(Type.String()),
    provider_id: Type.Optional(Type.String()),
    trace_id: Type.Optional(Type.String({ format: 'uuid' })),
    agent_id: Type.Optional(Type.String()),
}, {
    $id: 'ProductionOrder',
    description: 'Neo4j `:ProductionOrder` schema mirror; written by GenerationOrchestrator, read by vision-board.',
});
//# sourceMappingURL=productionOrder.js.map