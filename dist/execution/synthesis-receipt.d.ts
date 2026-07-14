import { Static } from '@sinclair/typebox';
import '../formats.js';
export declare const SYNTHESIS_RECEIPT_SCHEMA_ID: "https://contracts.widgetdc.dev/execution/synthesis-receipt.schema.json";
export declare const ArtifactCheck: import("@sinclair/typebox").TObject<{
    artifact_type: import("@sinclair/typebox").TString;
    required_count: import("@sinclair/typebox").TInteger;
    observed_count: import("@sinclair/typebox").TInteger;
    schema_valid: import("@sinclair/typebox").TBoolean;
    content_readable: import("@sinclair/typebox").TBoolean;
}>;
export type ArtifactCheck = Static<typeof ArtifactCheck>;
export declare const SynthesisReceipt: import("@sinclair/typebox").TObject<{
    $id: import("@sinclair/typebox").TLiteral<"https://contracts.widgetdc.dev/execution/synthesis-receipt.schema.json">;
    receipt_id: import("@sinclair/typebox").TString;
    envelope_id: import("@sinclair/typebox").TString;
    correlation_id: import("@sinclair/typebox").TString;
    outcome: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"completed_noop">, import("@sinclair/typebox").TLiteral<"completed_unverified">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"expected_stop">, import("@sinclair/typebox").TLiteral<"failed">]>;
    artifact_checks: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        artifact_type: import("@sinclair/typebox").TString;
        required_count: import("@sinclair/typebox").TInteger;
        observed_count: import("@sinclair/typebox").TInteger;
        schema_valid: import("@sinclair/typebox").TBoolean;
        content_readable: import("@sinclair/typebox").TBoolean;
    }>>;
    candidate_bundle_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    independent_verifier_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    missing_perspectives: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    next_step: import("@sinclair/typebox").TString;
    claim_level: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"L0">, import("@sinclair/typebox").TLiteral<"L1">, import("@sinclair/typebox").TLiteral<"L2">, import("@sinclair/typebox").TLiteral<"L3">, import("@sinclair/typebox").TLiteral<"L4">, import("@sinclair/typebox").TLiteral<"L5">]>;
    event_spine_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    created_at: import("@sinclair/typebox").TString;
}>;
export type SynthesisReceipt = Static<typeof SynthesisReceipt>;
/**
 * Applies receipt semantics that JSON Schema cannot express, notably the
 * comparison between observed_count and required_count.
 */
export declare function validateSynthesisReceipt(value: unknown): value is SynthesisReceipt;
//# sourceMappingURL=synthesis-receipt.d.ts.map