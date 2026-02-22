import { Type } from '@sinclair/typebox';
export const TraceInfo = Type.Object({
    trace_id: Type.String(),
    total_spans: Type.Optional(Type.Integer()),
    total_duration_ms: Type.Optional(Type.Number()),
});
export const QualityScore = Type.Object({
    overall_score: Type.Number({ minimum: 0, maximum: 1 }),
    parsability: Type.Optional(Type.Number()),
    relevance: Type.Optional(Type.Number()),
    completeness: Type.Optional(Type.Number()),
});
export const RoutingInfo = Type.Object({
    provider: Type.String(),
    model: Type.String(),
    domain: Type.Optional(Type.String()),
    latency_ms: Type.Optional(Type.Number()),
    cost: Type.Optional(Type.Number()),
});
export const CognitiveResponse = Type.Object({
    recommendation: Type.Union([Type.String(), Type.Null()], {
        description: 'Primary recommendation or answer',
    }),
    reasoning: Type.String({ description: 'Detailed reasoning behind the recommendation' }),
    confidence: Type.Number({
        minimum: 0, maximum: 1,
        description: 'Model confidence score',
    }),
    reasoning_chain: Type.Optional(Type.Union([
        Type.Array(Type.String()),
        Type.Null(),
    ], { description: 'Step-by-step reasoning chain (for deep mode)' })),
    trace: Type.Optional(TraceInfo),
    quality: Type.Optional(QualityScore),
    routing: Type.Optional(RoutingInfo),
}, { $id: 'CognitiveResponse', description: 'Unified response schema for /cognitive/* endpoints. RLM Engine → Backend.' });
//# sourceMappingURL=response.js.map