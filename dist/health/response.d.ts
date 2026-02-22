import { Static } from '@sinclair/typebox';
export declare const ComponentHealth: import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TString;
    latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    last_check: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type ComponentHealth = Static<typeof ComponentHealth>;
export declare const MetaLearningStats: import("@sinclair/typebox").TObject<{
    domains_tracked: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    total_llm_calls: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    avg_quality: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export type MetaLearningStats = Static<typeof MetaLearningStats>;
export declare const HealthStatus: import("@sinclair/typebox").TObject<{
    service: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"healthy">, import("@sinclair/typebox").TLiteral<"degraded">, import("@sinclair/typebox").TLiteral<"unhealthy">, import("@sinclair/typebox").TLiteral<"unknown">]>;
    uptime_seconds: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    version: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    components: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TObject<{
        status: import("@sinclair/typebox").TString;
        latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        last_check: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>>;
    meta_learning: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        domains_tracked: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        total_llm_calls: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        avg_quality: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>>;
}>;
export type HealthStatus = Static<typeof HealthStatus>;
export declare const DomainProfile: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TString;
    competencies: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    frameworks: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    kpis: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    agent_count: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    strength: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"emerging">, import("@sinclair/typebox").TLiteral<"moderate">, import("@sinclair/typebox").TLiteral<"strong">, import("@sinclair/typebox").TLiteral<"expert">]>>;
}>;
export type DomainProfile = Static<typeof DomainProfile>;
//# sourceMappingURL=response.d.ts.map