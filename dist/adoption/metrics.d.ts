import { Static } from '@sinclair/typebox';
/**
 * MetricsSummary — Platform intelligence metrics.
 * Wire format: snake_case JSON.
 *
 * Source: WidgeTDC lib/metricsCollector.ts
 */
/** Histogram percentile stats */
export declare const HistogramStats: import("@sinclair/typebox").TObject<{
    count: import("@sinclair/typebox").TInteger;
    sum: import("@sinclair/typebox").TNumber;
    avg: import("@sinclair/typebox").TNumber;
    p50: import("@sinclair/typebox").TNumber;
    p95: import("@sinclair/typebox").TNumber;
    p99: import("@sinclair/typebox").TNumber;
}>;
export type HistogramStats = Static<typeof HistogramStats>;
/** Full metrics summary snapshot */
export declare const MetricsSummary: import("@sinclair/typebox").TObject<{
    counters: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TNumber>;
    gauges: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TNumber>;
    histograms: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TObject<{
        count: import("@sinclair/typebox").TInteger;
        sum: import("@sinclair/typebox").TNumber;
        avg: import("@sinclair/typebox").TNumber;
        p50: import("@sinclair/typebox").TNumber;
        p95: import("@sinclair/typebox").TNumber;
        p99: import("@sinclair/typebox").TNumber;
    }>>;
    collected_at: import("@sinclair/typebox").TNumber;
}>;
export type MetricsSummary = Static<typeof MetricsSummary>;
/** MCP tool complexity tier */
export declare const ComplexityTier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"simple">, import("@sinclair/typebox").TLiteral<"moderate">, import("@sinclair/typebox").TLiteral<"advanced">, import("@sinclair/typebox").TLiteral<"complex">]>;
export type ComplexityTier = Static<typeof ComplexityTier>;
/** LLM tier for routing */
export declare const LLMTier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<1>, import("@sinclair/typebox").TLiteral<2>, import("@sinclair/typebox").TLiteral<3>]>;
export type LLMTier = Static<typeof LLMTier>;
/** Degradation tier for service health */
export declare const DegradationTier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"full">, import("@sinclair/typebox").TLiteral<"cached">, import("@sinclair/typebox").TLiteral<"fallback">, import("@sinclair/typebox").TLiteral<"static">, import("@sinclair/typebox").TLiteral<"unavailable">]>;
export type DegradationTier = Static<typeof DegradationTier>;
//# sourceMappingURL=metrics.d.ts.map