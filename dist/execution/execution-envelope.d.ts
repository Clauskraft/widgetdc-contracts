import { Static } from '@sinclair/typebox';
export declare const EXECUTION_ENVELOPE_SCHEMA_ID: "https://contracts.widgetdc.dev/execution/execution-envelope.schema.json";
export declare const HonestOutcome: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"completed_noop">, import("@sinclair/typebox").TLiteral<"completed_unverified">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"expected_stop">, import("@sinclair/typebox").TLiteral<"failed">]>;
export type HonestOutcome = Static<typeof HonestOutcome>;
export declare const EvidenceLevel: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"L0">, import("@sinclair/typebox").TLiteral<"L1">, import("@sinclair/typebox").TLiteral<"L2">, import("@sinclair/typebox").TLiteral<"L3">, import("@sinclair/typebox").TLiteral<"L4">, import("@sinclair/typebox").TLiteral<"L5">]>;
export type EvidenceLevel = Static<typeof EvidenceLevel>;
export declare const AdapterRole: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"candidate_writer">, import("@sinclair/typebox").TLiteral<"specialist">, import("@sinclair/typebox").TLiteral<"verifier">]>;
export type AdapterRole = Static<typeof AdapterRole>;
export declare const RequiredArtifact: import("@sinclair/typebox").TObject<{
    artifact_type: import("@sinclair/typebox").TString;
    schema_id: import("@sinclair/typebox").TString;
    minimum_count: import("@sinclair/typebox").TInteger;
    required_for_completion: import("@sinclair/typebox").TBoolean;
}>;
export type RequiredArtifact = Static<typeof RequiredArtifact>;
export declare const AdapterSelection: import("@sinclair/typebox").TObject<{
    adapter_id: import("@sinclair/typebox").TString;
    adapter_version: import("@sinclair/typebox").TString;
    role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"candidate_writer">, import("@sinclair/typebox").TLiteral<"specialist">, import("@sinclair/typebox").TLiteral<"verifier">]>;
    required: import("@sinclair/typebox").TBoolean;
    certification_ref: import("@sinclair/typebox").TString;
}>;
export type AdapterSelection = Static<typeof AdapterSelection>;
export declare const ExecutionEnvelope: import("@sinclair/typebox").TObject<{
    $id: import("@sinclair/typebox").TLiteral<"https://contracts.widgetdc.dev/execution/execution-envelope.schema.json">;
    envelope_id: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    task_bom_id: import("@sinclair/typebox").TString;
    route_envelope_ref: import("@sinclair/typebox").TString;
    actor_id: import("@sinclair/typebox").TString;
    target_repo: import("@sinclair/typebox").TString;
    target_head: import("@sinclair/typebox").TString;
    controller: import("@sinclair/typebox").TLiteral<"wdc_native">;
    workflow: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"discover">, import("@sinclair/typebox").TLiteral<"define">, import("@sinclair/typebox").TLiteral<"develop">, import("@sinclair/typebox").TLiteral<"deliver">]>;
    risk_class: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"source_mutation">, import("@sinclair/typebox").TLiteral<"governed_mutation">]>;
    selected_pattern_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    adapters: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        adapter_id: import("@sinclair/typebox").TString;
        adapter_version: import("@sinclair/typebox").TString;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"candidate_writer">, import("@sinclair/typebox").TLiteral<"specialist">, import("@sinclair/typebox").TLiteral<"verifier">]>;
        required: import("@sinclair/typebox").TBoolean;
        certification_ref: import("@sinclair/typebox").TString;
    }>>;
    required_artifacts: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        artifact_type: import("@sinclair/typebox").TString;
        schema_id: import("@sinclair/typebox").TString;
        minimum_count: import("@sinclair/typebox").TInteger;
        required_for_completion: import("@sinclair/typebox").TBoolean;
    }>>;
    degradation_policy_id: import("@sinclair/typebox").TString;
    stop_condition_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    claim_ceiling: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"L0">, import("@sinclair/typebox").TLiteral<"L1">, import("@sinclair/typebox").TLiteral<"L2">, import("@sinclair/typebox").TLiteral<"L3">, import("@sinclair/typebox").TLiteral<"L4">, import("@sinclair/typebox").TLiteral<"L5">]>;
    idempotency_key: import("@sinclair/typebox").TString;
    created_at: import("@sinclair/typebox").TString;
}>;
export type ExecutionEnvelope = Static<typeof ExecutionEnvelope>;
//# sourceMappingURL=execution-envelope.d.ts.map