/**
 * PARL — Parallel Agentic Reasoning Loop HTTP wire types.
 *
 * Mirrors Python Pydantic models in rlm-engine/src/models/parl_requests.py.
 * Endpoint: POST /parl/reason  (RLM Engine)
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const PARLMode: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"quick">, import("@sinclair/typebox").TLiteral<"deep">, import("@sinclair/typebox").TLiteral<"strategic">]>;
export type PARLMode = Static<typeof PARLMode>;
export declare const PARLReasonRequest: import("@sinclair/typebox").TObject<{
    task: import("@sinclair/typebox").TString;
    context: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    mode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"quick">, import("@sinclair/typebox").TLiteral<"deep">, import("@sinclair/typebox").TLiteral<"strategic">]>>;
    pattern_limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    feedback_enabled: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export type PARLReasonRequest = Static<typeof PARLReasonRequest>;
export declare const PARLPatternUsed: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
export type PARLPatternUsed = Static<typeof PARLPatternUsed>;
export declare const PARLReasonResponse: import("@sinclair/typebox").TObject<{
    parl_run_id: import("@sinclair/typebox").TString;
    reasoning: import("@sinclair/typebox").TString;
    patterns_used: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>>;
    compressed_tokens: import("@sinclair/typebox").TInteger;
    feedback_status: import("@sinclair/typebox").TString;
    error: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
}>;
export type PARLReasonResponse = Static<typeof PARLReasonResponse>;
//# sourceMappingURL=request.d.ts.map