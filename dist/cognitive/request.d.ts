import { Static } from '@sinclair/typebox';
export declare const ReasoningMode: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"quick">, import("@sinclair/typebox").TLiteral<"deep">, import("@sinclair/typebox").TLiteral<"strategic">]>;
export type ReasoningMode = Static<typeof ReasoningMode>;
export declare const SourceService: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"frontend">, import("@sinclair/typebox").TLiteral<"backend">, import("@sinclair/typebox").TLiteral<"rlm-engine">]>;
export type SourceService = Static<typeof SourceService>;
export declare const CognitiveConstraints: import("@sinclair/typebox").TObject<{
    max_tokens: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    timeout_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    fold_context: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    preferred_provider: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type CognitiveConstraints = Static<typeof CognitiveConstraints>;
export declare const CognitiveRequest: import("@sinclair/typebox").TObject<{
    task: import("@sinclair/typebox").TString;
    context: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>>;
    reasoning_mode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"quick">, import("@sinclair/typebox").TLiteral<"deep">, import("@sinclair/typebox").TLiteral<"strategic">]>>;
    trace_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    source_service: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"frontend">, import("@sinclair/typebox").TLiteral<"backend">, import("@sinclair/typebox").TLiteral<"rlm-engine">]>>;
    domain_hint: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    constraints: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        max_tokens: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        timeout_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        fold_context: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        preferred_provider: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    recursion_depth: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
}>;
export type CognitiveRequest = Static<typeof CognitiveRequest>;
//# sourceMappingURL=request.d.ts.map