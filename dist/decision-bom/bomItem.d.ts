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
import { Static } from '@sinclair/typebox';
export declare const BOMItemType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"provider_call">, import("@sinclair/typebox").TLiteral<"grounding">, import("@sinclair/typebox").TLiteral<"compression">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"tool_invocation">, import("@sinclair/typebox").TLiteral<"synthesis">, import("@sinclair/typebox").TLiteral<"verification">, import("@sinclair/typebox").TLiteral<"skill_selection">]>;
export type BOMItemType = Static<typeof BOMItemType>;
export declare const BOMDecisionType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"method_selection">, import("@sinclair/typebox").TLiteral<"provider_selection">, import("@sinclair/typebox").TLiteral<"knowledge_pack_selection">, import("@sinclair/typebox").TLiteral<"fold_strategy">, import("@sinclair/typebox").TLiteral<"tool_selection">, import("@sinclair/typebox").TLiteral<"verification_step">, import("@sinclair/typebox").TLiteral<"skill_route">]>;
export type BOMDecisionType = Static<typeof BOMDecisionType>;
export declare const BOMMethod: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"RAG">, import("@sinclair/typebox").TLiteral<"Folding">, import("@sinclair/typebox").TLiteral<"LLM">, import("@sinclair/typebox").TLiteral<"MCP">]>;
export type BOMMethod = Static<typeof BOMMethod>;
export declare const BOMDataClass: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pii">, import("@sinclair/typebox").TLiteral<"confidential">, import("@sinclair/typebox").TLiteral<"public">, import("@sinclair/typebox").TLiteral<"legal">]>;
export type BOMDataClass = Static<typeof BOMDataClass>;
export declare const BOMJurisdictionPolicy: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"EU_ONLY">, import("@sinclair/typebox").TLiteral<"DK_ONLY">, import("@sinclair/typebox").TLiteral<"NO_CN">, import("@sinclair/typebox").TLiteral<"NO_US">, import("@sinclair/typebox").TLiteral<"LOCAL_ONLY">, import("@sinclair/typebox").TLiteral<"NONE">]>;
export type BOMJurisdictionPolicy = Static<typeof BOMJurisdictionPolicy>;
export declare const BOMValidationStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"passed">, import("@sinclair/typebox").TLiteral<"failed">, import("@sinclair/typebox").TLiteral<"skipped">]>;
export type BOMValidationStatus = Static<typeof BOMValidationStatus>;
export declare const BOMItem: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    bom_run_id: import("@sinclair/typebox").TString;
    item_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"provider_call">, import("@sinclair/typebox").TLiteral<"grounding">, import("@sinclair/typebox").TLiteral<"compression">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"tool_invocation">, import("@sinclair/typebox").TLiteral<"synthesis">, import("@sinclair/typebox").TLiteral<"verification">, import("@sinclair/typebox").TLiteral<"skill_selection">]>;
    decision_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"method_selection">, import("@sinclair/typebox").TLiteral<"provider_selection">, import("@sinclair/typebox").TLiteral<"knowledge_pack_selection">, import("@sinclair/typebox").TLiteral<"fold_strategy">, import("@sinclair/typebox").TLiteral<"tool_selection">, import("@sinclair/typebox").TLiteral<"verification_step">, import("@sinclair/typebox").TLiteral<"skill_route">]>;
    data_class: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pii">, import("@sinclair/typebox").TLiteral<"confidential">, import("@sinclair/typebox").TLiteral<"public">, import("@sinclair/typebox").TLiteral<"legal">]>>;
    authority_requirement: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"regulator">, import("@sinclair/typebox").TLiteral<"internal">, import("@sinclair/typebox").TLiteral<"none">]>>;
    policy_requirement: import("@sinclair/typebox").TString;
    jurisdiction_policy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"EU_ONLY">, import("@sinclair/typebox").TLiteral<"DK_ONLY">, import("@sinclair/typebox").TLiteral<"NO_CN">, import("@sinclair/typebox").TLiteral<"NO_US">, import("@sinclair/typebox").TLiteral<"LOCAL_ONLY">, import("@sinclair/typebox").TLiteral<"NONE">]>>;
    method_selected: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"RAG">, import("@sinclair/typebox").TLiteral<"Folding">, import("@sinclair/typebox").TLiteral<"LLM">, import("@sinclair/typebox").TLiteral<"MCP">]>;
    method_reason: import("@sinclair/typebox").TString;
    applied_rules: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    sovereignty_enforced: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    allowed_methods: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"RAG">, import("@sinclair/typebox").TLiteral<"Folding">, import("@sinclair/typebox").TLiteral<"LLM">, import("@sinclair/typebox").TLiteral<"MCP">]>>>;
    allowed_providers: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    denied_providers: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    estimated_input_tokens: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    source_grounded_required: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    evidence_hash: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    signature: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    signing_pubkey_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    signature_domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    canonicalization_version: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    validation_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"passed">, import("@sinclair/typebox").TLiteral<"failed">, import("@sinclair/typebox").TLiteral<"skipped">]>;
    resolved: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    workflow_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    plan_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    actor_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    created_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    last_audited: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type BOMItem = Static<typeof BOMItem>;
//# sourceMappingURL=bomItem.d.ts.map