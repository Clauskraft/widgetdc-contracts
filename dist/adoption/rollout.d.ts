import { Static } from '@sinclair/typebox';
/**
 * RolloutState — Feature rollout tracking.
 * Wire format: snake_case JSON.
 *
 * Source: WidgeTDC lib/rolloutTracker.ts
 */
/** Rollout state options */
export declare const RolloutState: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"degraded">, import("@sinclair/typebox").TLiteral<"disabled">, import("@sinclair/typebox").TLiteral<"canary">]>;
export type RolloutState = Static<typeof RolloutState>;
/** Rollout metrics per feature */
export declare const RolloutMetrics: import("@sinclair/typebox").TObject<{
    invocations: import("@sinclair/typebox").TInteger;
    failures: import("@sinclair/typebox").TInteger;
    avg_latency_ms: import("@sinclair/typebox").TNumber;
}>;
export type RolloutMetrics = Static<typeof RolloutMetrics>;
/** Feature rollout entry */
export declare const RolloutEntry: import("@sinclair/typebox").TObject<{
    feature_id: import("@sinclair/typebox").TString;
    state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"degraded">, import("@sinclair/typebox").TLiteral<"disabled">, import("@sinclair/typebox").TLiteral<"canary">]>;
    rollout_pct: import("@sinclair/typebox").TNumber;
    updated_at: import("@sinclair/typebox").TNumber;
    changed_by: import("@sinclair/typebox").TString;
    reason: import("@sinclair/typebox").TString;
    expires_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    metrics: import("@sinclair/typebox").TObject<{
        invocations: import("@sinclair/typebox").TInteger;
        failures: import("@sinclair/typebox").TInteger;
        avg_latency_ms: import("@sinclair/typebox").TNumber;
    }>;
}>;
export type RolloutEntry = Static<typeof RolloutEntry>;
/** Rollout summary across all features */
export declare const RolloutSummary: import("@sinclair/typebox").TObject<{
    total: import("@sinclair/typebox").TInteger;
    active: import("@sinclair/typebox").TInteger;
    degraded: import("@sinclair/typebox").TInteger;
    disabled: import("@sinclair/typebox").TInteger;
    canary: import("@sinclair/typebox").TInteger;
    features: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        feature_id: import("@sinclair/typebox").TString;
        state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"degraded">, import("@sinclair/typebox").TLiteral<"disabled">, import("@sinclair/typebox").TLiteral<"canary">]>;
        rollout_pct: import("@sinclair/typebox").TNumber;
        updated_at: import("@sinclair/typebox").TNumber;
        changed_by: import("@sinclair/typebox").TString;
        reason: import("@sinclair/typebox").TString;
        expires_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        metrics: import("@sinclair/typebox").TObject<{
            invocations: import("@sinclair/typebox").TInteger;
            failures: import("@sinclair/typebox").TInteger;
            avg_latency_ms: import("@sinclair/typebox").TNumber;
        }>;
    }>>;
}>;
export type RolloutSummary = Static<typeof RolloutSummary>;
//# sourceMappingURL=rollout.d.ts.map