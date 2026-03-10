import { Static } from '@sinclair/typebox';
/** CIA 3-tier risk severity classification */
export declare const RiskSeverity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CRITICAL">, import("@sinclair/typebox").TLiteral<"WARNING">, import("@sinclair/typebox").TLiteral<"INFO">, import("@sinclair/typebox").TLiteral<"OPTIMAL">]>;
export type RiskSeverity = Static<typeof RiskSeverity>;
/** CIA Health Metrics for consulting domains and intelligence assets */
export declare const HealthMetrics: import("@sinclair/typebox").TObject<{
    score: import("@sinclair/typebox").TNumber;
    trend: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"stable">]>;
    momentum: import("@sinclair/typebox").TNumber;
    resilience: import("@sinclair/typebox").TNumber;
    severity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CRITICAL">, import("@sinclair/typebox").TLiteral<"WARNING">, import("@sinclair/typebox").TLiteral<"INFO">, import("@sinclair/typebox").TLiteral<"OPTIMAL">]>;
    last_assessment: import("@sinclair/typebox").TString;
}>;
export type HealthMetrics = Static<typeof HealthMetrics>;
//# sourceMappingURL=metrics.d.ts.map