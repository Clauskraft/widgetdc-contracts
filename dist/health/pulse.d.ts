import { Static } from '@sinclair/typebox';
export declare const ServiceStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"healthy">, import("@sinclair/typebox").TLiteral<"degraded">, import("@sinclair/typebox").TLiteral<"unhealthy">, import("@sinclair/typebox").TLiteral<"starting">]>;
export type ServiceStatus = Static<typeof ServiceStatus>;
export declare const ModuleStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"degraded">, import("@sinclair/typebox").TLiteral<"inactive">, import("@sinclair/typebox").TLiteral<"error">]>;
export type ModuleStatus = Static<typeof ModuleStatus>;
export declare const ServiceResources: import("@sinclair/typebox").TObject<{
    memory_mb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    cpu_percent: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    neo4j_connected: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    redis_connected: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    postgres_connected: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export type ServiceResources = Static<typeof ServiceResources>;
export declare const HealthPulse: import("@sinclair/typebox").TObject<{
    service: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"frontend">, import("@sinclair/typebox").TLiteral<"backend">, import("@sinclair/typebox").TLiteral<"rlm-engine">, import("@sinclair/typebox").TLiteral<"librechat">, import("@sinclair/typebox").TLiteral<"rag-api">]>;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"healthy">, import("@sinclair/typebox").TLiteral<"degraded">, import("@sinclair/typebox").TLiteral<"unhealthy">, import("@sinclair/typebox").TLiteral<"starting">]>;
    uptime_seconds: import("@sinclair/typebox").TNumber;
    last_request_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    active_sessions: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    modules: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"degraded">, import("@sinclair/typebox").TLiteral<"inactive">, import("@sinclair/typebox").TLiteral<"error">]>>>;
    resources: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        memory_mb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        cpu_percent: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        neo4j_connected: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        redis_connected: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        postgres_connected: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>>;
    last_error: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    version: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timestamp: import("@sinclair/typebox").TString;
}>;
export type HealthPulse = Static<typeof HealthPulse>;
//# sourceMappingURL=pulse.d.ts.map