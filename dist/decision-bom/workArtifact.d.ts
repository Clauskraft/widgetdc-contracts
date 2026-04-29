/**
 * WorkArtifact — signed externally-shippable output of a PhantomBOMRun.
 *
 * Phase Ε E1 contract per Deep Research Report 1 invariant I4
 * (every WorkArtifact must be verifiable via canonical payload + signature
 * + public key, RFC 8032 Ed25519).
 *
 * Graph topology:
 *   (:PhantomBOMRun)-[:PRODUCES]->(:WorkArtifact)
 *   (:BOMItem)-[:PRODUCED]->(:WorkArtifact)
 *   (:ConfigurationSnapshot)-[:CONTAINS]->(:WorkArtifact)
 *   (:WorkArtifact)-[:SIGNED_WITH]->(:SigningKey)
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const WorkArtifactType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"document">, import("@sinclair/typebox").TLiteral<"decision">, import("@sinclair/typebox").TLiteral<"deliverable">, import("@sinclair/typebox").TLiteral<"config_bundle">, import("@sinclair/typebox").TLiteral<"code_patch">, import("@sinclair/typebox").TLiteral<"report">, import("@sinclair/typebox").TLiteral<"graph_snapshot">, import("@sinclair/typebox").TLiteral<"compliance_evidence">, import("@sinclair/typebox").TLiteral<"audit_log">]>;
export type WorkArtifactType = Static<typeof WorkArtifactType>;
export declare const WorkArtifactVerificationStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"failed">, import("@sinclair/typebox").TLiteral<"expired">, import("@sinclair/typebox").TLiteral<"revoked">]>;
export type WorkArtifactVerificationStatus = Static<typeof WorkArtifactVerificationStatus>;
export declare const WorkArtifact: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    artifact_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"document">, import("@sinclair/typebox").TLiteral<"decision">, import("@sinclair/typebox").TLiteral<"deliverable">, import("@sinclair/typebox").TLiteral<"config_bundle">, import("@sinclair/typebox").TLiteral<"code_patch">, import("@sinclair/typebox").TLiteral<"report">, import("@sinclair/typebox").TLiteral<"graph_snapshot">, import("@sinclair/typebox").TLiteral<"compliance_evidence">, import("@sinclair/typebox").TLiteral<"audit_log">]>;
    bom_run_id: import("@sinclair/typebox").TString;
    produced_by_bom_item_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    uri: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    mime_type: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    size_bytes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    data_class: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pii">, import("@sinclair/typebox").TLiteral<"confidential">, import("@sinclair/typebox").TLiteral<"public">, import("@sinclair/typebox").TLiteral<"legal">]>>;
    policy_profile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    evidence_hash: import("@sinclair/typebox").TString;
    canonicalization_version: import("@sinclair/typebox").TString;
    signature: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    signing_pubkey_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    signature_domain: import("@sinclair/typebox").TString;
    verification_status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"failed">, import("@sinclair/typebox").TLiteral<"expired">, import("@sinclair/typebox").TLiteral<"revoked">]>>;
    last_verified_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    verifier_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    expires_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    supersedes_artifact_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    lineage_chain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    workflow_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    plan_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    actor_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    created_at: import("@sinclair/typebox").TString;
    signed_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type WorkArtifact = Static<typeof WorkArtifact>;
//# sourceMappingURL=workArtifact.d.ts.map