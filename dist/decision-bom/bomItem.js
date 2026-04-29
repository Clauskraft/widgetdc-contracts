/**
 * BOMItem — first-class decision unit inside a Phantom BOM run.
 *
 * Phase Ε E1 contract per Deep Research Report 1 (Decision BOM standardization)
 * + master prompt §BOMITEM MODEL.
 *
 * Each load-bearing decision (provider call, knowledge-pack selection, method
 * routing, sovereignty enforcement, tool invocation) is materialised as a typed
 * BOMItem with method binding and signed evidence.
 *
 * Graph topology (typed promotion only — never raw write_cypher):
 *   (:PhantomBOMRun)-[:HAS_ITEM]->(:BOMItem)
 *   (:BOMItem)-[:RESOLVED_BY]->(:RLMDecision)
 *   (:BOMItem)-[:GROUNDED_BY]->(:KnowledgePack)
 *   (:BOMItem)-[:COMPRESSED_BY]->(:FoldEpisode)
 *   (:BOMItem)-[:ROUTED_BY]->(:RoutingDecision)
 *   (:BOMItem)-[:EXECUTED_WITH]->(:MCPTool)
 *   (:BOMItem)-[:PRODUCED]->(:WorkArtifact)
 *
 * Wire format: snake_case JSON.
 */
import { Type } from '@sinclair/typebox';
export const BOMItemType = Type.Union([
    Type.Literal('provider_call'),
    Type.Literal('grounding'),
    Type.Literal('compression'),
    Type.Literal('routing'),
    Type.Literal('tool_invocation'),
    Type.Literal('synthesis'),
    Type.Literal('verification'),
    Type.Literal('skill_selection'),
], { $id: 'BOMItemType' });
export const BOMDecisionType = Type.Union([
    Type.Literal('method_selection'),
    Type.Literal('provider_selection'),
    Type.Literal('knowledge_pack_selection'),
    Type.Literal('fold_strategy'),
    Type.Literal('tool_selection'),
    Type.Literal('verification_step'),
    Type.Literal('skill_route'),
], { $id: 'BOMDecisionType' });
export const BOMMethod = Type.Union([
    Type.Literal('RLM'),
    Type.Literal('RAG'),
    Type.Literal('Folding'),
    Type.Literal('LLM'),
    Type.Literal('MCP'),
], { $id: 'BOMMethod' });
export const BOMDataClass = Type.Union([
    Type.Literal('pii'),
    Type.Literal('confidential'),
    Type.Literal('public'),
    Type.Literal('legal'),
], { $id: 'BOMDataClass' });
export const BOMJurisdictionPolicy = Type.Union([
    Type.Literal('EU_ONLY'),
    Type.Literal('DK_ONLY'),
    Type.Literal('NO_CN'),
    Type.Literal('NO_US'),
    Type.Literal('LOCAL_ONLY'),
    Type.Literal('NONE'),
], { $id: 'BOMJurisdictionPolicy' });
export const BOMValidationStatus = Type.Union([
    Type.Literal('pending'),
    Type.Literal('passed'),
    Type.Literal('failed'),
    Type.Literal('skipped'),
], { $id: 'BOMValidationStatus' });
export const BOMItem = Type.Object({
    id: Type.String({ pattern: '^bomitem-[a-zA-Z0-9-]{8,}$', description: 'Globally unique BOMItem id.' }),
    bom_run_id: Type.String({ pattern: '^bomrun-[a-zA-Z0-9-]{8,}$', description: 'Parent PhantomBOMRun id (HAS_ITEM edge).' }),
    item_type: BOMItemType,
    decision_type: BOMDecisionType,
    // Sovereignty + policy
    data_class: Type.Optional(BOMDataClass),
    authority_requirement: Type.Optional(Type.Union([
        Type.Literal('regulator'),
        Type.Literal('internal'),
        Type.Literal('none'),
    ])),
    policy_requirement: Type.String({ description: 'Policy bundle id this item is bound to (empty only if data_class=public).' }),
    jurisdiction_policy: Type.Optional(BOMJurisdictionPolicy),
    // Method dispatch
    method_selected: BOMMethod,
    method_reason: Type.String({ minLength: 1, description: 'Rationale chain (e.g. "compliance_required → RLM").' }),
    applied_rules: Type.Optional(Type.Array(Type.String(), { description: 'Ordered MethodSelector rules that fired.' })),
    sovereignty_enforced: Type.Optional(Type.Boolean({ description: 'True if MethodSelector forced fallback due to data_class/jurisdiction.' })),
    allowed_methods: Type.Optional(Type.Array(BOMMethod)),
    allowed_providers: Type.Optional(Type.Array(Type.String())),
    denied_providers: Type.Optional(Type.Array(Type.String())),
    // Routing inputs
    estimated_input_tokens: Type.Optional(Type.Integer({ minimum: 0 })),
    source_grounded_required: Type.Optional(Type.Boolean()),
    // Crypto / lineage
    evidence_hash: Type.Optional(Type.String({ pattern: '^sha256:[a-f0-9]{16}$', description: '16-char sha256 prefix of canonical evidence (RFC 8785).' })),
    signature: Type.Optional(Type.String({ description: 'Ed25519 signature (RFC 8032). Empty until ToolContractSigner finalises.' })),
    signing_pubkey_id: Type.Optional(Type.String()),
    signature_domain: Type.Optional(Type.String({ description: 'Default: "widgetdc.bom-item.v1".' })),
    canonicalization_version: Type.Optional(Type.String({ description: 'Default: "jcs-rfc8785-v1".' })),
    // Status
    validation_status: BOMValidationStatus,
    resolved: Type.Optional(Type.Boolean({ description: 'True after a typed edge is wired (RESOLVED_BY/ROUTED_BY/etc.).' })),
    // Event spine
    workflow_id: Type.Optional(Type.String()),
    plan_id: Type.Optional(Type.String()),
    correlation_id: Type.Optional(Type.String({ description: 'ALWAYS required for event spine emission.' })),
    actor_id: Type.Optional(Type.String()),
    created_at: Type.Optional(Type.String({ format: 'date-time' })),
    last_audited: Type.Optional(Type.String({ format: 'date-time' })),
}, {
    $id: 'BOMItem',
    description: 'First-class decision unit per Deep Research Report 1. Five invariants enforced by canary: completed-run, BOMItem resolution, sovereign, crypto, claim.',
    additionalProperties: true,
});
//# sourceMappingURL=bomItem.js.map