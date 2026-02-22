import { Type } from '@sinclair/typebox';
export const ServiceStatus = Type.Union([
    Type.Literal('healthy'),
    Type.Literal('degraded'),
    Type.Literal('unhealthy'),
    Type.Literal('starting'),
], { $id: 'ServiceStatus' });
export const ModuleStatus = Type.Union([
    Type.Literal('active'),
    Type.Literal('degraded'),
    Type.Literal('inactive'),
    Type.Literal('error'),
], { $id: 'ModuleStatus' });
export const ServiceResources = Type.Object({
    memory_mb: Type.Optional(Type.Number()),
    cpu_percent: Type.Optional(Type.Number()),
    neo4j_connected: Type.Optional(Type.Boolean()),
    redis_connected: Type.Optional(Type.Boolean()),
    postgres_connected: Type.Optional(Type.Boolean()),
});
export const HealthPulse = Type.Object({
    service: Type.Union([
        Type.Literal('frontend'),
        Type.Literal('backend'),
        Type.Literal('rlm-engine'),
    ], { description: 'Service identifier' }),
    status: Type.Union([
        Type.Literal('healthy'),
        Type.Literal('degraded'),
        Type.Literal('unhealthy'),
        Type.Literal('starting'),
    ]),
    uptime_seconds: Type.Number({ description: 'Seconds since service started' }),
    last_request_ms: Type.Optional(Type.Number({ description: 'Latency of last processed request' })),
    active_sessions: Type.Optional(Type.Integer({ description: 'Number of active sessions/connections' })),
    modules: Type.Optional(Type.Record(Type.String(), Type.Union([
        Type.Literal('active'),
        Type.Literal('degraded'),
        Type.Literal('inactive'),
        Type.Literal('error'),
    ]), { description: 'Status of each module/subsystem' })),
    resources: Type.Optional(ServiceResources),
    last_error: Type.Optional(Type.Union([Type.String(), Type.Null()], {
        description: 'Last error message, null if no recent errors',
    })),
    version: Type.Optional(Type.String()),
    timestamp: Type.String({ format: 'date-time' }),
}, { $id: 'HealthPulse', description: 'Unified health status published by all services to Redis every 10 seconds.' });
//# sourceMappingURL=pulse.js.map