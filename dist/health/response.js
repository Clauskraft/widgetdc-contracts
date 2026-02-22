import { Type } from '@sinclair/typebox';
export const ComponentHealth = Type.Object({
    status: Type.String(),
    latency_ms: Type.Optional(Type.Number()),
    last_check: Type.Optional(Type.String({ format: 'date-time' })),
});
export const MetaLearningStats = Type.Object({
    domains_tracked: Type.Optional(Type.Integer()),
    total_llm_calls: Type.Optional(Type.Integer()),
    avg_quality: Type.Optional(Type.Number()),
});
export const HealthStatus = Type.Object({
    service: Type.String(),
    status: Type.Union([
        Type.Literal('healthy'),
        Type.Literal('degraded'),
        Type.Literal('unhealthy'),
        Type.Literal('unknown'),
    ]),
    uptime_seconds: Type.Optional(Type.Number()),
    version: Type.Optional(Type.String()),
    components: Type.Optional(Type.Record(Type.String(), ComponentHealth)),
    meta_learning: Type.Optional(MetaLearningStats),
}, { $id: 'HealthStatus', description: 'Unified health status schema for all services.' });
export const DomainProfile = Type.Object({
    name: Type.String({ description: 'Canonical domain name' }),
    competencies: Type.Array(Type.String(), { description: 'List of competencies within this domain' }),
    frameworks: Type.Optional(Type.Array(Type.String(), { description: 'Consulting frameworks applicable' })),
    kpis: Type.Optional(Type.Array(Type.String(), { description: 'Key Performance Indicators tracked' })),
    agent_count: Type.Optional(Type.Integer({ description: 'Number of agents specialized in this domain' })),
    strength: Type.Optional(Type.Union([
        Type.Literal('emerging'),
        Type.Literal('moderate'),
        Type.Literal('strong'),
        Type.Literal('expert'),
    ], { description: 'Domain maturity level' })),
}, { $id: 'DomainProfile', description: 'Domain profile for domain explorer.' });
//# sourceMappingURL=response.js.map