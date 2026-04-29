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
import { Type } from '@sinclair/typebox';
export const WorkArtifactType = Type.Union([
    Type.Literal('document'),
    Type.Literal('decision'),
    Type.Literal('deliverable'),
    Type.Literal('config_bundle'),
    Type.Literal('code_patch'),
    Type.Literal('report'),
    Type.Literal('graph_snapshot'),
    Type.Literal('compliance_evidence'),
    Type.Literal('audit_log'),
], { $id: 'WorkArtifactType' });
export const WorkArtifactVerificationStatus = Type.Union([
    Type.Literal('pending'),
    Type.Literal('verified'),
    Type.Literal('failed'),
    Type.Literal('expired'),
    Type.Literal('revoked'),
], { $id: 'WorkArtifactVerificationStatus' });
export const WorkArtifact = Type.Object({
    id: Type.String({ pattern: '^artifact-[a-zA-Z0-9-]{8,}$' }),
    artifact_type: WorkArtifactType,
    bom_run_id: Type.String({ pattern: '^bomrun-[a-zA-Z0-9-]{8,}$' }),
    produced_by_bom_item_id: Type.Optional(Type.String({ pattern: '^bomitem-[a-zA-Z0-9-]{8,}$' })),
    name: Type.Optional(Type.String()),
    uri: Type.Optional(Type.String({ description: 'Body location (s3://, github://, graph://). Never inline body.' })),
    mime_type: Type.Optional(Type.String()),
    size_bytes: Type.Optional(Type.Integer({ minimum: 0 })),
    // Sovereignty
    data_class: Type.Optional(Type.Union([
        Type.Literal('pii'),
        Type.Literal('confidential'),
        Type.Literal('public'),
        Type.Literal('legal'),
    ])),
    policy_profile: Type.Optional(Type.String()),
    // Crypto (full 64-char hash because externally verifiable)
    evidence_hash: Type.String({ pattern: '^sha256:[a-f0-9]{64}$', description: 'Full sha256 of canonical payload (RFC 8785 JCS).' }),
    canonicalization_version: Type.String({ description: 'Default: "jcs-rfc8785-v1".' }),
    signature: Type.Optional(Type.String({ description: 'Ed25519 signature (RFC 8032).' })),
    signing_pubkey_id: Type.Optional(Type.String()),
    signature_domain: Type.String({ description: 'Default: "widgetdc.work-artifact.v1".' }),
    // Verification state
    verification_status: Type.Optional(WorkArtifactVerificationStatus),
    last_verified_at: Type.Optional(Type.String({ format: 'date-time' })),
    verifier_id: Type.Optional(Type.String()),
    expires_at: Type.Optional(Type.String({ format: 'date-time' })),
    // Lineage
    supersedes_artifact_id: Type.Optional(Type.String({ pattern: '^artifact-[a-zA-Z0-9-]{8,}$' })),
    lineage_chain: Type.Optional(Type.Array(Type.String({ pattern: '^bomitem-[a-zA-Z0-9-]{8,}$' }))),
    // Event spine
    workflow_id: Type.Optional(Type.String()),
    plan_id: Type.Optional(Type.String()),
    correlation_id: Type.Optional(Type.String()),
    actor_id: Type.Optional(Type.String()),
    created_at: Type.String({ format: 'date-time' }),
    signed_at: Type.Optional(Type.String({ format: 'date-time' })),
}, {
    $id: 'WorkArtifact',
    description: 'Signed output artifact per Deep Research Report 1 invariant I4. Verifiable end-to-end via verifyArtifact() endpoint.',
    additionalProperties: true,
});
//# sourceMappingURL=workArtifact.js.map