import { Static } from '@sinclair/typebox';
export declare const TraceInfo: import("@sinclair/typebox").TObject<{
    trace_id: import("@sinclair/typebox").TString;
    total_spans: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    total_duration_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export type TraceInfo = Static<typeof TraceInfo>;
export declare const QualityScore: import("@sinclair/typebox").TObject<{
    overall_score: import("@sinclair/typebox").TNumber;
    parsability: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    relevance: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    completeness: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export type QualityScore = Static<typeof QualityScore>;
export declare const RoutingInfo: import("@sinclair/typebox").TObject<{
    provider: import("@sinclair/typebox").TString;
    model: import("@sinclair/typebox").TString;
    domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    cost: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export type RoutingInfo = Static<typeof RoutingInfo>;
export declare const CognitiveResponse: import("@sinclair/typebox").TObject<{
    recommendation: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    reasoning: import("@sinclair/typebox").TString;
    confidence: import("@sinclair/typebox").TNumber;
    reasoning_chain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>, import("@sinclair/typebox").TNull]>>;
    trace: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        trace_id: import("@sinclair/typebox").TString;
        total_spans: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        total_duration_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>>;
    quality: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        overall_score: import("@sinclair/typebox").TNumber;
        parsability: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        relevance: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        completeness: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>>;
    routing: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        provider: import("@sinclair/typebox").TString;
        model: import("@sinclair/typebox").TString;
        domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        cost: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>>;
}>;
export type CognitiveResponse = Static<typeof CognitiveResponse>;
//# sourceMappingURL=response.d.ts.map