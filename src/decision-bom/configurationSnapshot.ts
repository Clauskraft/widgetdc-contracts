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
import { Type, Static } from '@sinclair/typebox'

export const ConfigurationSnapshotType = Type.Union([
  Type.Literal('session'),
  Type.Literal('release'),
  Type.Literal('tenant'),
  Type.Literal('demo'),
], { $id: 'ConfigurationSnapshotType' })

export type ConfigurationSnapshotType = Static<typeof ConfigurationSnapshotType>

export const ConfigurationSnapshotItem = Type.Object({
  bom_item_id: Type.String({ pattern: '^bomitem-[a-zA-Z0-9-]{8,}$' }),
  method_selected: Type.Union([
    Type.Literal('RLM'),
    Type.Literal('RAG'),
    Type.Literal('Folding'),
    Type.Literal('LLM'),
    Type.Literal('MCP'),
  ]),
  evidence_hash: Type.Optional(Type.String({ pattern: '^sha256:[a-f0-9]{16}$' })),
  validation_status: Type.Optional(Type.Union([
    Type.Literal('pending'),
    Type.Literal('passed'),
    Type.Literal('failed'),
    Type.Literal('skipped'),
  ])),
}, {
  $id: 'ConfigurationSnapshotItem',
  description: 'Reference to a BOMItem contained in a snapshot.',
  additionalProperties: true,
})

export type ConfigurationSnapshotItem = Static<typeof ConfigurationSnapshotItem>

export const ConfigurationSnapshotApproval = Type.Object({
  approver_id: Type.String(),
  approval_type: Type.Union([
    Type.Literal('operator'),
    Type.Literal('hyperagent'),
    Type.Literal('policy_engine'),
    Type.Literal('compliance_officer'),
    Type.Literal('claim_promotion'),
  ]),
  approval_token: Type.Optional(Type.String({ description: 'Opaque token bound to snapshot id. Required for L3 promotions.' })),
  approved_at: Type.String({ format: 'date-time' }),
}, {
  $id: 'ConfigurationSnapshotApproval',
  description: 'Approval chain entry. Required for snapshot_type=release.',
  additionalProperties: true,
})

export type ConfigurationSnapshotApproval = Static<typeof ConfigurationSnapshotApproval>

export const ConfigurationSnapshotDerivedArtifact = Type.Object({
  artifact_id: Type.String(),
  artifact_type: Type.Union([
    Type.Literal('document'),
    Type.Literal('decision'),
    Type.Literal('deliverable'),
    Type.Literal('config_bundle'),
    Type.Literal('code_patch'),
    Type.Literal('report'),
  ]),
  uri: Type.Optional(Type.String()),
  evidence_hash: Type.Optional(Type.String({ pattern: '^sha256:[a-f0-9]{16}$' })),
}, {
  $id: 'ConfigurationSnapshotDerivedArtifact',
  description: 'WorkArtifact produced as part of a snapshot. Each must satisfy invariant I4.',
  additionalProperties: true,
})

export type ConfigurationSnapshotDerivedArtifact = Static<typeof ConfigurationSnapshotDerivedArtifact>

export const ConfigurationSnapshot = Type.Object({
  id: Type.String({ pattern: '^configsnap-[a-zA-Z0-9-]{8,}$' }),
  snapshot_type: ConfigurationSnapshotType,
  tenant_id: Type.Optional(Type.String()),

  feature_model_version: Type.String({ description: 'Pin of :FeatureModel{version} (FODA-style feature tree).' }),
  rule_set_version: Type.String({ description: 'Pin of MethodSelector ruleset.' }),
  route_template_version: Type.String({ description: 'Pin of :RouteTemplate{version}.' }),

  bom_run_id: Type.String({ pattern: '^bomrun-[a-zA-Z0-9-]{8,}$' }),
  items: Type.Array(ConfigurationSnapshotItem, { minItems: 1, description: 'Resolution invariant requires ≥1 BOMItem.' }),
  derived_artifacts: Type.Optional(Type.Array(ConfigurationSnapshotDerivedArtifact)),
  approvals: Type.Optional(Type.Array(ConfigurationSnapshotApproval)),

  policy_profile: Type.Optional(Type.String()),
  jurisdiction_policy: Type.Optional(Type.Union([
    Type.Literal('EU_ONLY'),
    Type.Literal('DK_ONLY'),
    Type.Literal('NO_CN'),
    Type.Literal('NO_US'),
    Type.Literal('LOCAL_ONLY'),
    Type.Literal('NONE'),
  ])),
  data_class: Type.Optional(Type.Union([
    Type.Literal('pii'),
    Type.Literal('confidential'),
    Type.Literal('public'),
    Type.Literal('legal'),
  ])),

  // Crypto (full 64-char hash — release-anchor)
  snapshot_hash: Type.String({ pattern: '^sha256:[a-f0-9]{64}$', description: 'Full sha256 of canonical payload (RFC 8785 JCS).' }),
  canonicalization_version: Type.String({ description: 'Default: "jcs-rfc8785-v1".' }),
  signature: Type.Optional(Type.String({ description: 'Ed25519 over snapshot_hash.' })),
  signing_pubkey_id: Type.Optional(Type.String()),
  signature_domain: Type.String({ description: 'Default: "widgetdc.config-snapshot.v1".' }),

  // Lineage
  previous_snapshot_id: Type.Optional(Type.String({ pattern: '^configsnap-[a-zA-Z0-9-]{8,}$' })),
  supersedes_reason: Type.Optional(Type.String()),
  verify_endpoint: Type.Optional(Type.String()),

  // Event spine
  workflow_id: Type.Optional(Type.String()),
  plan_id: Type.Optional(Type.String()),
  correlation_id: Type.Optional(Type.String()),
  actor_id: Type.Optional(Type.String()),
  created_at: Type.String({ format: 'date-time' }),
  compile_started_at: Type.Optional(Type.String({ format: 'date-time' })),
  last_verified_at: Type.Optional(Type.String({ format: 'date-time' })),
}, {
  $id: 'ConfigurationSnapshot',
  description: 'Immutable hash-anchored release-first object per Deep Research Report 2 Layer 3. Verifiable via verifyArtifact() endpoint.',
  additionalProperties: true,
})

export type ConfigurationSnapshot = Static<typeof ConfigurationSnapshot>
