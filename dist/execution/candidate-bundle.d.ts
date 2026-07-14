import { Static } from '@sinclair/typebox';
export declare const CANDIDATE_BUNDLE_SCHEMA_ID: "https://contracts.widgetdc.dev/execution/candidate-bundle.schema.json";
export declare const CandidateArtifact: import("@sinclair/typebox").TObject<{
    artifact_id: import("@sinclair/typebox").TString;
    artifact_type: import("@sinclair/typebox").TString;
    schema_id: import("@sinclair/typebox").TString;
    content_ref: import("@sinclair/typebox").TString;
    content_hash: import("@sinclair/typebox").TString;
}>;
export type CandidateArtifact = Static<typeof CandidateArtifact>;
export declare const CandidateBundle: import("@sinclair/typebox").TObject<{
    $id: import("@sinclair/typebox").TLiteral<"https://contracts.widgetdc.dev/execution/candidate-bundle.schema.json">;
    bundle_id: import("@sinclair/typebox").TString;
    envelope_id: import("@sinclair/typebox").TString;
    adapter_id: import("@sinclair/typebox").TString;
    adapter_version: import("@sinclair/typebox").TString;
    role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"candidate_writer">, import("@sinclair/typebox").TLiteral<"specialist">, import("@sinclair/typebox").TLiteral<"verifier">]>;
    outcome: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"completed_noop">, import("@sinclair/typebox").TLiteral<"completed_unverified">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"expected_stop">, import("@sinclair/typebox").TLiteral<"failed">]>;
    artifacts: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        artifact_id: import("@sinclair/typebox").TString;
        artifact_type: import("@sinclair/typebox").TString;
        schema_id: import("@sinclair/typebox").TString;
        content_ref: import("@sinclair/typebox").TString;
        content_hash: import("@sinclair/typebox").TString;
    }>>;
    warnings: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    evidence_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    started_at: import("@sinclair/typebox").TString;
    completed_at: import("@sinclair/typebox").TString;
}>;
export type CandidateBundle = Static<typeof CandidateBundle>;
//# sourceMappingURL=candidate-bundle.d.ts.map