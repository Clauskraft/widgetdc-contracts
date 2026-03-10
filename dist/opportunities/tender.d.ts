import { Static } from '@sinclair/typebox';
/** Generic Salience Vector for scoring any type of opportunity */
export declare const SalienceVector: import("@sinclair/typebox").TObject<{
    dimension: import("@sinclair/typebox").TString;
    raw_value: import("@sinclair/typebox").TNumber;
    weight: import("@sinclair/typebox").TNumber;
    score: import("@sinclair/typebox").TNumber;
}>;
export type SalienceVector = Static<typeof SalienceVector>;
/** The aggregate intelligence score for an opportunity */
export declare const WinProbabilityScore: import("@sinclair/typebox").TObject<{
    overall_score: import("@sinclair/typebox").TNumber;
    confidence: import("@sinclair/typebox").TNumber;
    vectors: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        dimension: import("@sinclair/typebox").TString;
        raw_value: import("@sinclair/typebox").TNumber;
        weight: import("@sinclair/typebox").TNumber;
        score: import("@sinclair/typebox").TNumber;
    }>>;
    is_go: import("@sinclair/typebox").TBoolean;
    assessed_at: import("@sinclair/typebox").TString;
}>;
export type WinProbabilityScore = Static<typeof WinProbabilityScore>;
/** Generic Intelligence Observation for any monitored domain */
export declare const IntelligenceObservation: import("@sinclair/typebox").TObject<{
    observation_id: import("@sinclair/typebox").TString;
    source_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"MEDIA">, import("@sinclair/typebox").TLiteral<"CODE_REPO">, import("@sinclair/typebox").TLiteral<"FINANCIAL">, import("@sinclair/typebox").TLiteral<"GOVERNMENT_DATA">, import("@sinclair/typebox").TLiteral<"LEGAL_TENDER">, import("@sinclair/typebox").TLiteral<"CYBER_SIGNAL">]>;
    title: import("@sinclair/typebox").TString;
    content_summary: import("@sinclair/typebox").TString;
    actor_name: import("@sinclair/typebox").TString;
    metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    timestamp: import("@sinclair/typebox").TString;
    source_url: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    intelligence_score: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        overall_score: import("@sinclair/typebox").TNumber;
        confidence: import("@sinclair/typebox").TNumber;
        vectors: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            dimension: import("@sinclair/typebox").TString;
            raw_value: import("@sinclair/typebox").TNumber;
            weight: import("@sinclair/typebox").TNumber;
            score: import("@sinclair/typebox").TNumber;
        }>>;
        is_go: import("@sinclair/typebox").TBoolean;
        assessed_at: import("@sinclair/typebox").TString;
    }>>;
}>;
export type IntelligenceObservation = Static<typeof IntelligenceObservation>;
//# sourceMappingURL=tender.d.ts.map