/**
 * DecisionRecord — Bitemporal decision persistence contract.
 *
 * Implements WDC 19 Decision Memory with historical immutability,
 * explicit assumption tracking, and cryptographic definition hash-locking.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const DecisionRole: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Gemini">, import("@sinclair/typebox").TLiteral<"Claude">, import("@sinclair/typebox").TLiteral<"Codex">, import("@sinclair/typebox").TLiteral<"Qwen">, import("@sinclair/typebox").TLiteral<"Operator">]>;
export type DecisionRole = Static<typeof DecisionRole>;
export declare const DecisionState: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"reviewed">, import("@sinclair/typebox").TLiteral<"decided">, import("@sinclair/typebox").TLiteral<"reopened">, import("@sinclair/typebox").TLiteral<"superseded">]>;
export type DecisionState = Static<typeof DecisionState>;
export declare const DecisionRecord: import("@sinclair/typebox").TObject<{
    decision_id: import("@sinclair/typebox").TString;
    version: import("@sinclair/typebox").TInteger;
    owner_role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Gemini">, import("@sinclair/typebox").TLiteral<"Claude">, import("@sinclair/typebox").TLiteral<"Codex">, import("@sinclair/typebox").TLiteral<"Qwen">, import("@sinclair/typebox").TLiteral<"Operator">]>;
    state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"reviewed">, import("@sinclair/typebox").TLiteral<"decided">, import("@sinclair/typebox").TLiteral<"reopened">, import("@sinclair/typebox").TLiteral<"superseded">]>;
    question: import("@sinclair/typebox").TString;
    alternatives_evaluated: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    chosen_option: import("@sinclair/typebox").TString;
    rationale: import("@sinclair/typebox").TString;
    assumptions: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    evidence_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    valid_from: import("@sinclair/typebox").TString;
    observed_at: import("@sinclair/typebox").TString;
    contract_hash: import("@sinclair/typebox").TString;
    supersedes_id: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
}>;
export type DecisionRecord = Static<typeof DecisionRecord>;
//# sourceMappingURL=decisionRecord.d.ts.map