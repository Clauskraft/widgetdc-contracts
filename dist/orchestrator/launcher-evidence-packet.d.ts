import { Static } from '@sinclair/typebox';
export declare const LauncherEvidenceFamily: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"regulatory">, import("@sinclair/typebox").TLiteral<"enterprise">]>;
export type LauncherEvidenceFamily = Static<typeof LauncherEvidenceFamily>;
export declare const LauncherEvidenceStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"grounded">, import("@sinclair/typebox").TLiteral<"coverage_gap">, import("@sinclair/typebox").TLiteral<"unavailable">]>;
export type LauncherEvidenceStatus = Static<typeof LauncherEvidenceStatus>;
export declare const LauncherEvidenceItem: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    family: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"regulatory">, import("@sinclair/typebox").TLiteral<"enterprise">]>;
    title: import("@sinclair/typebox").TString;
    summary: import("@sinclair/typebox").TString;
    source_type: import("@sinclair/typebox").TString;
    score: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    evidence_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type LauncherEvidenceItem = Static<typeof LauncherEvidenceItem>;
export declare const LauncherEvidenceFamilyPacket: import("@sinclair/typebox").TObject<{
    family: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"regulatory">, import("@sinclair/typebox").TLiteral<"enterprise">]>;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"grounded">, import("@sinclair/typebox").TLiteral<"coverage_gap">, import("@sinclair/typebox").TLiteral<"unavailable">]>;
    summary: import("@sinclair/typebox").TString;
    evidence_items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        family: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"regulatory">, import("@sinclair/typebox").TLiteral<"enterprise">]>;
        title: import("@sinclair/typebox").TString;
        summary: import("@sinclair/typebox").TString;
        source_type: import("@sinclair/typebox").TString;
        score: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        evidence_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export type LauncherEvidenceFamilyPacket = Static<typeof LauncherEvidenceFamilyPacket>;
export declare const LauncherEvidencePacket: import("@sinclair/typebox").TObject<{
    $id: import("@sinclair/typebox").TLiteral<"orchestrator/launcher-evidence-packet">;
    packet_id: import("@sinclair/typebox").TString;
    question: import("@sinclair/typebox").TString;
    domain: import("@sinclair/typebox").TString;
    created_at: import("@sinclair/typebox").TString;
    tri_source_ready: import("@sinclair/typebox").TBoolean;
    families: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        family: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"regulatory">, import("@sinclair/typebox").TLiteral<"enterprise">]>;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"grounded">, import("@sinclair/typebox").TLiteral<"coverage_gap">, import("@sinclair/typebox").TLiteral<"unavailable">]>;
        summary: import("@sinclair/typebox").TString;
        evidence_items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            family: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"regulatory">, import("@sinclair/typebox").TLiteral<"enterprise">]>;
            title: import("@sinclair/typebox").TString;
            summary: import("@sinclair/typebox").TString;
            source_type: import("@sinclair/typebox").TString;
            score: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            evidence_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>>;
    }>>;
    evidence_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    governance: import("@sinclair/typebox").TObject<{
        promotion_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"not_promoted">, import("@sinclair/typebox").TLiteral<"blocked">]>;
        can_promote: import("@sinclair/typebox").TBoolean;
        blocking_reasons: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    }>;
}>;
export type LauncherEvidencePacket = Static<typeof LauncherEvidencePacket>;
//# sourceMappingURL=launcher-evidence-packet.d.ts.map