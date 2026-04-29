/**
 * ConfigurationSnapshot — immutable, hash-anchored, signed compile-time
 * snapshot per Deep Research Report 2 (6-layer software product configurator,
 * Layer 3 Compile).
 *
 * Result of compileConfigurationSnapshot() collapsing a tenant
 * ConfigurationProfile + active FeatureModel + RouteTemplate + the set of
 * BOMItems that produced it. The authoritative artifact a customer or
 * auditor receives.
 *
 * Graph topology:
 *   (:PhantomBOMRun)-[:PRODUCES]->(:WorkArtifact)<-[:CONTAINS]-(:ConfigurationSnapshot)
 *   (:ConfigurationSnapshot)-[:DERIVED_FROM]->(:BOMItem)
 *   (:ConfigurationSnapshot)-[:USES_FEATURE_MODEL]->(:FeatureModel)
 *   (:ConfigurationSnapshot)-[:USES_PROFILE]->(:ConfigurationProfile)
 *   (:ConfigurationSnapshot)-[:USES_ROUTE_TEMPLATE]->(:RouteTemplate)
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const ConfigurationSnapshotType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"session">, import("@sinclair/typebox").TLiteral<"release">, import("@sinclair/typebox").TLiteral<"tenant">, import("@sinclair/typebox").TLiteral<"demo">]>;
export type ConfigurationSnapshotType = Static<typeof ConfigurationSnapshotType>;
export declare const ConfigurationSnapshotItem: import("@sinclair/typebox").TObject<{
    bom_item_id: import("@sinclair/typebox").TString;
    method_selected: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"RAG">, import("@sinclair/typebox").TLiteral<"Folding">, import("@sinclair/typebox").TLiteral<"LLM">, import("@sinclair/typebox").TLiteral<"MCP">]>;
    evidence_hash: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    validation_status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"passed">, import("@sinclair/typebox").TLiteral<"failed">, import("@sinclair/typebox").TLiteral<"skipped">]>>;
}>;
export type ConfigurationSnapshotItem = Static<typeof ConfigurationSnapshotItem>;
export declare const ConfigurationSnapshotApproval: import("@sinclair/typebox").TObject<{
    approver_id: import("@sinclair/typebox").TString;
    approval_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"operator">, import("@sinclair/typebox").TLiteral<"hyperagent">, import("@sinclair/typebox").TLiteral<"policy_engine">, import("@sinclair/typebox").TLiteral<"compliance_officer">, import("@sinclair/typebox").TLiteral<"claim_promotion">]>;
    approval_token: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    approved_at: import("@sinclair/typebox").TString;
}>;
export type ConfigurationSnapshotApproval = Static<typeof ConfigurationSnapshotApproval>;
export declare const ConfigurationSnapshotDerivedArtifact: import("@sinclair/typebox").TObject<{
    artifact_id: import("@sinclair/typebox").TString;
    artifact_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"document">, import("@sinclair/typebox").TLiteral<"decision">, import("@sinclair/typebox").TLiteral<"deliverable">, import("@sinclair/typebox").TLiteral<"config_bundle">, import("@sinclair/typebox").TLiteral<"code_patch">, import("@sinclair/typebox").TLiteral<"report">]>;
    uri: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    evidence_hash: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type ConfigurationSnapshotDerivedArtifact = Static<typeof ConfigurationSnapshotDerivedArtifact>;
export declare const ConfigurationSnapshot: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    snapshot_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"session">, import("@sinclair/typebox").TLiteral<"release">, import("@sinclair/typebox").TLiteral<"tenant">, import("@sinclair/typebox").TLiteral<"demo">]>;
    tenant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    feature_model_version: import("@sinclair/typebox").TString;
    rule_set_version: import("@sinclair/typebox").TString;
    route_template_version: import("@sinclair/typebox").TString;
    bom_run_id: import("@sinclair/typebox").TString;
    items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        bom_item_id: import("@sinclair/typebox").TString;
        method_selected: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"RAG">, import("@sinclair/typebox").TLiteral<"Folding">, import("@sinclair/typebox").TLiteral<"LLM">, import("@sinclair/typebox").TLiteral<"MCP">]>;
        evidence_hash: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        validation_status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"passed">, import("@sinclair/typebox").TLiteral<"failed">, import("@sinclair/typebox").TLiteral<"skipped">]>>;
    }>>;
    derived_artifacts: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        artifact_id: import("@sinclair/typebox").TString;
        artifact_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"document">, import("@sinclair/typebox").TLiteral<"decision">, import("@sinclair/typebox").TLiteral<"deliverable">, import("@sinclair/typebox").TLiteral<"config_bundle">, import("@sinclair/typebox").TLiteral<"code_patch">, import("@sinclair/typebox").TLiteral<"report">]>;
        uri: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        evidence_hash: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>>;
    approvals: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        approver_id: import("@sinclair/typebox").TString;
        approval_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"operator">, import("@sinclair/typebox").TLiteral<"hyperagent">, import("@sinclair/typebox").TLiteral<"policy_engine">, import("@sinclair/typebox").TLiteral<"compliance_officer">, import("@sinclair/typebox").TLiteral<"claim_promotion">]>;
        approval_token: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        approved_at: import("@sinclair/typebox").TString;
    }>>>;
    policy_profile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    jurisdiction_policy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"EU_ONLY">, import("@sinclair/typebox").TLiteral<"DK_ONLY">, import("@sinclair/typebox").TLiteral<"NO_CN">, import("@sinclair/typebox").TLiteral<"NO_US">, import("@sinclair/typebox").TLiteral<"LOCAL_ONLY">, import("@sinclair/typebox").TLiteral<"NONE">]>>;
    data_class: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pii">, import("@sinclair/typebox").TLiteral<"confidential">, import("@sinclair/typebox").TLiteral<"public">, import("@sinclair/typebox").TLiteral<"legal">]>>;
    snapshot_hash: import("@sinclair/typebox").TString;
    canonicalization_version: import("@sinclair/typebox").TString;
    signature: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    signing_pubkey_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    signature_domain: import("@sinclair/typebox").TString;
    previous_snapshot_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    supersedes_reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    verify_endpoint: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    workflow_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    plan_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    actor_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    created_at: import("@sinclair/typebox").TString;
    compile_started_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    last_verified_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type ConfigurationSnapshot = Static<typeof ConfigurationSnapshot>;
//# sourceMappingURL=configurationSnapshot.d.ts.map