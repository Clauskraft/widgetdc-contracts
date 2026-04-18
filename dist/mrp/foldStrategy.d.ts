/**
 * FoldStrategyChoice — decision output of FoldStrategySelector (P2.1).
 *
 * Exposed to orchestrator HyperAgent for evaluate_plan KPIs and logged in
 * `:FoldEpisode` for closed-loop reward tracking (P2.2).
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const FoldTier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"T1">, import("@sinclair/typebox").TLiteral<"T2">, import("@sinclair/typebox").TLiteral<"T3">, import("@sinclair/typebox").TLiteral<"T4">, import("@sinclair/typebox").TLiteral<"T5">, import("@sinclair/typebox").TLiteral<"T6">, import("@sinclair/typebox").TLiteral<"T7">]>;
export type FoldTier = Static<typeof FoldTier>;
export declare const FoldStrategyDefinition: import("@sinclair/typebox").TObject<{
    tier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"T1">, import("@sinclair/typebox").TLiteral<"T2">, import("@sinclair/typebox").TLiteral<"T3">, import("@sinclair/typebox").TLiteral<"T4">, import("@sinclair/typebox").TLiteral<"T5">, import("@sinclair/typebox").TLiteral<"T6">, import("@sinclair/typebox").TLiteral<"T7">]>;
    name: import("@sinclair/typebox").TString;
    max_input_tokens: import("@sinclair/typebox").TInteger;
    target_compression_ratio: import("@sinclair/typebox").TNumber;
    expected_latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    preserves_detail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export type FoldStrategyDefinition = Static<typeof FoldStrategyDefinition>;
export declare const FoldStrategyChoice: import("@sinclair/typebox").TObject<{
    strategy: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"T1">, import("@sinclair/typebox").TLiteral<"T2">, import("@sinclair/typebox").TLiteral<"T3">, import("@sinclair/typebox").TLiteral<"T4">, import("@sinclair/typebox").TLiteral<"T5">, import("@sinclair/typebox").TLiteral<"T6">, import("@sinclair/typebox").TLiteral<"T7">]>;
    rationale: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    definition: import("@sinclair/typebox").TObject<{
        tier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"T1">, import("@sinclair/typebox").TLiteral<"T2">, import("@sinclair/typebox").TLiteral<"T3">, import("@sinclair/typebox").TLiteral<"T4">, import("@sinclair/typebox").TLiteral<"T5">, import("@sinclair/typebox").TLiteral<"T6">, import("@sinclair/typebox").TLiteral<"T7">]>;
        name: import("@sinclair/typebox").TString;
        max_input_tokens: import("@sinclair/typebox").TInteger;
        target_compression_ratio: import("@sinclair/typebox").TNumber;
        expected_latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        preserves_detail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
    input_tokens: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    selected_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type FoldStrategyChoice = Static<typeof FoldStrategyChoice>;
//# sourceMappingURL=foldStrategy.d.ts.map