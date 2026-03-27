import { Static } from '@sinclair/typebox';
export declare const BackendGovernanceEvidenceItemResponseV1: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    summary: import("@sinclair/typebox").TString;
    score: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    source_type: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type BackendGovernanceEvidenceItemResponseV1 = Static<typeof BackendGovernanceEvidenceItemResponseV1>;
export declare const BackendGovernanceEvidenceFamilyResponseV1: import("@sinclair/typebox").TObject<{
    family: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"regulatory">, import("@sinclair/typebox").TLiteral<"enterprise">]>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"grounded">, import("@sinclair/typebox").TLiteral<"coverage_gap">, import("@sinclair/typebox").TLiteral<"unavailable">]>>;
    summary: import("@sinclair/typebox").TString;
    evidence_items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        summary: import("@sinclair/typebox").TString;
        score: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        source_type: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export type BackendGovernanceEvidenceFamilyResponseV1 = Static<typeof BackendGovernanceEvidenceFamilyResponseV1>;
export declare const BackendGovernanceEvidencePacketGovernanceV1: import("@sinclair/typebox").TObject<{
    blocking_reasons: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    promotion_status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"not_promoted">, import("@sinclair/typebox").TLiteral<"blocked">]>>;
    can_promote: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export type BackendGovernanceEvidencePacketGovernanceV1 = Static<typeof BackendGovernanceEvidencePacketGovernanceV1>;
export declare const BackendGovernanceEvidencePacketResponseV1: import("@sinclair/typebox").TObject<{
    packet_id: import("@sinclair/typebox").TString;
    tri_source_ready: import("@sinclair/typebox").TBoolean;
    governance: import("@sinclair/typebox").TObject<{
        blocking_reasons: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        promotion_status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"not_promoted">, import("@sinclair/typebox").TLiteral<"blocked">]>>;
        can_promote: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
    families: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        family: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"regulatory">, import("@sinclair/typebox").TLiteral<"enterprise">]>;
        status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"grounded">, import("@sinclair/typebox").TLiteral<"coverage_gap">, import("@sinclair/typebox").TLiteral<"unavailable">]>>;
        summary: import("@sinclair/typebox").TString;
        evidence_items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            summary: import("@sinclair/typebox").TString;
            score: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            source_type: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>>;
    }>>;
    question: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    created_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    evidence_refs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
}>;
export type BackendGovernanceEvidencePacketResponseV1 = Static<typeof BackendGovernanceEvidencePacketResponseV1>;
export declare const ArtifactChallengeOutcomeV1: import("@sinclair/typebox").TObject<{
    trace_id: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TLiteral<"CHALLENGED">;
    reason: import("@sinclair/typebox").TString;
    evidence_uri: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
}>;
export type ArtifactChallengeOutcomeV1 = Static<typeof ArtifactChallengeOutcomeV1>;
export declare const ArtifactChallengeGraphWriteV1: import("@sinclair/typebox").TObject<{
    outcome_label: import("@sinclair/typebox").TLiteral<"Outcome">;
    relation_type: import("@sinclair/typebox").TLiteral<"CHALLENGES">;
    target_identity: import("@sinclair/typebox").TString;
}>;
export type ArtifactChallengeGraphWriteV1 = Static<typeof ArtifactChallengeGraphWriteV1>;
export declare const ArtifactChallengeEnvelopeV1: import("@sinclair/typebox").TObject<{
    tool: import("@sinclair/typebox").TLiteral<"artifacts.challenge">;
    artifact_id: import("@sinclair/typebox").TString;
    artifact_slug: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    outcome: import("@sinclair/typebox").TObject<{
        trace_id: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TLiteral<"CHALLENGED">;
        reason: import("@sinclair/typebox").TString;
        evidence_uri: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    }>;
    graph_write: import("@sinclair/typebox").TObject<{
        outcome_label: import("@sinclair/typebox").TLiteral<"Outcome">;
        relation_type: import("@sinclair/typebox").TLiteral<"CHALLENGES">;
        target_identity: import("@sinclair/typebox").TString;
    }>;
}>;
export type ArtifactChallengeEnvelopeV1 = Static<typeof ArtifactChallengeEnvelopeV1>;
export declare const ArtifactRequestReviewGraphWriteV1: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"ConstructionRequest">;
    request_kind: import("@sinclair/typebox").TLiteral<"REVIEW">;
    requested_by: import("@sinclair/typebox").TString;
    artifact_id: import("@sinclair/typebox").TString;
}>;
export type ArtifactRequestReviewGraphWriteV1 = Static<typeof ArtifactRequestReviewGraphWriteV1>;
export declare const ArtifactRequestReviewEnvelopeV1: import("@sinclair/typebox").TObject<{
    tool: import("@sinclair/typebox").TLiteral<"artifacts.action">;
    action: import("@sinclair/typebox").TLiteral<"request-review">;
    artifact_id: import("@sinclair/typebox").TString;
    graph_write: import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"ConstructionRequest">;
        request_kind: import("@sinclair/typebox").TLiteral<"REVIEW">;
        requested_by: import("@sinclair/typebox").TString;
        artifact_id: import("@sinclair/typebox").TString;
    }>;
}>;
export type ArtifactRequestReviewEnvelopeV1 = Static<typeof ArtifactRequestReviewEnvelopeV1>;
//# sourceMappingURL=artifact-contracts.d.ts.map