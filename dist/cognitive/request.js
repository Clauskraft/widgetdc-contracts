import { Type } from '@sinclair/typebox';
// --- Shared enums ---
export const ReasoningMode = Type.Union([
    Type.Literal('quick'),
    Type.Literal('deep'),
    Type.Literal('strategic'),
], { $id: 'ReasoningMode', description: 'Reasoning depth for cognitive operations' });
export const SourceService = Type.Union([
    Type.Literal('frontend'),
    Type.Literal('backend'),
    Type.Literal('rlm-engine'),
], { $id: 'SourceService', description: 'Originating service identifier' });
// --- Constraints ---
export const CognitiveConstraints = Type.Object({
    max_tokens: Type.Optional(Type.Integer({ minimum: 100, maximum: 32000 })),
    timeout_ms: Type.Optional(Type.Integer({ minimum: 1000 })),
    fold_context: Type.Optional(Type.Boolean({ default: true })),
    preferred_provider: Type.Optional(Type.String()),
});
// --- Request ---
export const CognitiveRequest = Type.Object({
    task: Type.String({ minLength: 1, description: 'The task or question to process' }),
    context: Type.Optional(Type.Record(Type.String(), Type.Unknown(), {
        description: 'Task context (domain data, history, constraints)',
    })),
    reasoning_mode: Type.Optional(Type.Union([
        Type.Literal('quick'),
        Type.Literal('deep'),
        Type.Literal('strategic'),
    ], { default: 'quick' })),
    trace_id: Type.Optional(Type.String({ format: 'uuid', description: 'Cross-service trace ID' })),
    source_service: Type.Optional(Type.Union([
        Type.Literal('frontend'),
        Type.Literal('backend'),
        Type.Literal('rlm-engine'),
    ], { default: 'backend' })),
    domain_hint: Type.Optional(Type.String({ description: 'Optional domain hint to skip inference' })),
    constraints: Type.Optional(CognitiveConstraints),
    recursion_depth: Type.Optional(Type.Integer({
        minimum: 0, maximum: 5, default: 0,
        description: 'Current recursion depth for cost-aware model selection',
    })),
}, { $id: 'CognitiveRequest', description: 'Unified request schema for all /cognitive/* endpoints. Backend → RLM Engine.' });
//# sourceMappingURL=request.js.map