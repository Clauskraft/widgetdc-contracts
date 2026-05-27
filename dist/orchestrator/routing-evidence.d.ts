import { Static } from '@sinclair/typebox';
export declare const OctopusProviderMappingStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"runtime_valid">, import("@sinclair/typebox").TLiteral<"runtime_invalid">, import("@sinclair/typebox").TLiteral<"unverified">]>;
export type OctopusProviderMappingStatus = Static<typeof OctopusProviderMappingStatus>;
export declare const OctopusProviderMapping: import("@sinclair/typebox").TObject<{
    requested_persona: import("@sinclair/typebox").TString;
    spawn_agent: import("@sinclair/typebox").TString;
    mapping_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"runtime_valid">, import("@sinclair/typebox").TLiteral<"runtime_invalid">, import("@sinclair/typebox").TLiteral<"unverified">]>;
}>;
export type OctopusProviderMapping = Static<typeof OctopusProviderMapping>;
export declare const RoutingEvidenceStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"artifact_ready">, import("@sinclair/typebox").TLiteral<"empty_artifact">, import("@sinclair/typebox").TLiteral<"timeout">, import("@sinclair/typebox").TLiteral<"failed">]>;
export type RoutingEvidenceStatus = Static<typeof RoutingEvidenceStatus>;
export declare const RoutingEvidenceReadback: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
    evidence_status: import("@sinclair/typebox").TLiteral<"artifact_ready">;
    artifact_ref: import("@sinclair/typebox").TString;
    artifact_bytes: import("@sinclair/typebox").TInteger;
    polled: import("@sinclair/typebox").TLiteral<true>;
    schema_version: import("@sinclair/typebox").TLiteral<"routing_evidence_readback.v1">;
    route_id: import("@sinclair/typebox").TString;
    provider_mapping: import("@sinclair/typebox").TObject<{
        requested_persona: import("@sinclair/typebox").TString;
        spawn_agent: import("@sinclair/typebox").TString;
        mapping_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"runtime_valid">, import("@sinclair/typebox").TLiteral<"runtime_invalid">, import("@sinclair/typebox").TLiteral<"unverified">]>;
    }>;
    runtime_proof_claimed: import("@sinclair/typebox").TLiteral<false>;
    claim_promotion_eligible: import("@sinclair/typebox").TLiteral<false>;
    checked_at: import("@sinclair/typebox").TString;
}>, import("@sinclair/typebox").TObject<{
    evidence_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"empty_artifact">, import("@sinclair/typebox").TLiteral<"timeout">, import("@sinclair/typebox").TLiteral<"failed">]>;
    artifact_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    artifact_bytes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    polled: import("@sinclair/typebox").TBoolean;
    schema_version: import("@sinclair/typebox").TLiteral<"routing_evidence_readback.v1">;
    route_id: import("@sinclair/typebox").TString;
    provider_mapping: import("@sinclair/typebox").TObject<{
        requested_persona: import("@sinclair/typebox").TString;
        spawn_agent: import("@sinclair/typebox").TString;
        mapping_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"runtime_valid">, import("@sinclair/typebox").TLiteral<"runtime_invalid">, import("@sinclair/typebox").TLiteral<"unverified">]>;
    }>;
    runtime_proof_claimed: import("@sinclair/typebox").TLiteral<false>;
    claim_promotion_eligible: import("@sinclair/typebox").TLiteral<false>;
    checked_at: import("@sinclair/typebox").TString;
}>]>;
export type RoutingEvidenceReadback = Static<typeof RoutingEvidenceReadback>;
//# sourceMappingURL=routing-evidence.d.ts.map