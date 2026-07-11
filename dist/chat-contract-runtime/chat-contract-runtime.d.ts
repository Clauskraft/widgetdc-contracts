/**
 * WDC Chat Contract Runtime — CCR-1 candidate contract surface.
 *
 * These schemas normalize a chat turn before and after a provider draft. They
 * do not invoke providers, emit EventSpine events, execute tools, or promote
 * graph/claim truth. Runtime enforcement remains owned by WidgeTDC.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const ChatSourceSurface: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"chat_ui">, import("@sinclair/typebox").TLiteral<"wdc_cli">, import("@sinclair/typebox").TLiteral<"mcp_app">, import("@sinclair/typebox").TLiteral<"desktop_connector">, import("@sinclair/typebox").TLiteral<"api">]>;
export type ChatSourceSurface = Static<typeof ChatSourceSurface>;
export declare const ChatRouteMethod: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"RAG">, import("@sinclair/typebox").TLiteral<"Folding">, import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"MCP">, import("@sinclair/typebox").TLiteral<"LLM">, import("@sinclair/typebox").TLiteral<"HumanReview">]>;
export type ChatRouteMethod = Static<typeof ChatRouteMethod>;
export declare const ChatEvidenceStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"available">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"unavailable">]>;
export type ChatEvidenceStatus = Static<typeof ChatEvidenceStatus>;
export declare const ChatCitationIntegrity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"missing">, import("@sinclair/typebox").TLiteral<"hallucinated">]>;
export type ChatCitationIntegrity = Static<typeof ChatCitationIntegrity>;
/**
 * Explicit CCR-1 boundary. A runtime consumer must not infer execution rights
 * from contract availability alone.
 */
export declare const ChatContractRuntimeBoundary: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.chat_contract_runtime_boundary.v1">;
    runtime_execution_allowed: import("@sinclair/typebox").TLiteral<false>;
    graph_write_allowed: import("@sinclair/typebox").TLiteral<false>;
    claim_promotion_allowed: import("@sinclair/typebox").TLiteral<false>;
    eventspine_emit_mode: import("@sinclair/typebox").TLiteral<"dry_run_only">;
}>;
export type ChatContractRuntimeBoundary = Static<typeof ChatContractRuntimeBoundary>;
/**
 * Client ingress. Deliberately excludes GovernanceContext: the runtime gate
 * constructs server-trusted governance after authentication.
 */
export declare const WdcChatTurnRequest: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.chat_turn_request.v1">;
    turn_id: import("@sinclair/typebox").TString;
    session_id: import("@sinclair/typebox").TString;
    source_surface: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"chat_ui">, import("@sinclair/typebox").TLiteral<"wdc_cli">, import("@sinclair/typebox").TLiteral<"mcp_app">, import("@sinclair/typebox").TLiteral<"desktop_connector">, import("@sinclair/typebox").TLiteral<"api">]>;
    message: import("@sinclair/typebox").TString;
    locale: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    attachment_refs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    context_refs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    request_features: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        task_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"summarize">, import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"review">, import("@sinclair/typebox").TLiteral<"classify">, import("@sinclair/typebox").TLiteral<"translate">, import("@sinclair/typebox").TLiteral<"code">, import("@sinclair/typebox").TLiteral<"reason">, import("@sinclair/typebox").TLiteral<"retrieve">, import("@sinclair/typebox").TLiteral<"compose">, import("@sinclair/typebox").TLiteral<"other">]>;
        language: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        pii_present: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        max_latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        max_cost_usd: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        compliance_tier: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"public">, import("@sinclair/typebox").TLiteral<"internal">, import("@sinclair/typebox").TLiteral<"legal">, import("@sinclair/typebox").TLiteral<"health">]>>;
        reasoning_depth: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    created_at: import("@sinclair/typebox").TString;
}>;
export type WdcChatTurnRequest = Static<typeof WdcChatTurnRequest>;
export declare const ChatRoutePlan: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.chat_route_plan.v1">;
    route_id: import("@sinclair/typebox").TString;
    turn_id: import("@sinclair/typebox").TString;
    method_sequence: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"RAG">, import("@sinclair/typebox").TLiteral<"Folding">, import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"MCP">, import("@sinclair/typebox").TLiteral<"LLM">, import("@sinclair/typebox").TLiteral<"HumanReview">]>>;
    provider_task: import("@sinclair/typebox").TString;
    risk_level: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"staged_write">, import("@sinclair/typebox").TLiteral<"production_write">]>;
    evidence_required: import("@sinclair/typebox").TBoolean;
    fold_required: import("@sinclair/typebox").TBoolean;
    bom_item_ids: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    governance_context: import("@sinclair/typebox").TObject<{
        actor_id: import("@sinclair/typebox").TString;
        actor_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"agent">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"system">, import("@sinclair/typebox").TLiteral<"cron">, import("@sinclair/typebox").TLiteral<"operator">]>;
        correlation_id: import("@sinclair/typebox").TString;
        parent_event_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        workflow_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        plan_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        approval_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        tenant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        source_protocol: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rest">, import("@sinclair/typebox").TLiteral<"mcp">, import("@sinclair/typebox").TLiteral<"streamable">, import("@sinclair/typebox").TLiteral<"openai">, import("@sinclair/typebox").TLiteral<"websocket">, import("@sinclair/typebox").TLiteral<"agent_chain">, import("@sinclair/typebox").TLiteral<"scheduled_job">, import("@sinclair/typebox").TLiteral<"internal">]>;
        server_trusted: import("@sinclair/typebox").TLiteral<true>;
    }>;
    policy_decision: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        allowed: import("@sinclair/typebox").TBoolean;
        code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OK">, import("@sinclair/typebox").TLiteral<"PLAN_REQUIRED">, import("@sinclair/typebox").TLiteral<"APPROVAL_REQUIRED">, import("@sinclair/typebox").TLiteral<"UNCLASSIFIED_DANGEROUS_CALLER">, import("@sinclair/typebox").TLiteral<"BYPASS_EXPIRED">, import("@sinclair/typebox").TLiteral<"BYPASS_TOOL_NOT_ALLOWED">, import("@sinclair/typebox").TLiteral<"BYPASS_RISK_TOO_HIGH">, import("@sinclair/typebox").TLiteral<"POLICY_VIOLATION">, import("@sinclair/typebox").TLiteral<"COST_BUDGET_EXCEEDED">, import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">]>;
        reason: import("@sinclair/typebox").TString;
        governance: import("@sinclair/typebox").TObject<{
            risk_level: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"staged_write">, import("@sinclair/typebox").TLiteral<"production_write">]>;
            requires_plan: import("@sinclair/typebox").TBoolean;
            requires_approval: import("@sinclair/typebox").TBoolean;
            cost_tier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"free">, import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"medium">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"premium">]>;
            audit_category: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"graph_promotion">, import("@sinclair/typebox").TLiteral<"memory_promotion">, import("@sinclair/typebox").TLiteral<"data_read">, import("@sinclair/typebox").TLiteral<"tool_invocation">, import("@sinclair/typebox").TLiteral<"plan_lifecycle">, import("@sinclair/typebox").TLiteral<"policy_decision">, import("@sinclair/typebox").TLiteral<"external_call">, import("@sinclair/typebox").TLiteral<"security_event">]>;
            audience: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"external_agent">, import("@sinclair/typebox").TLiteral<"internal_system">, import("@sinclair/typebox").TLiteral<"operator_only">]>>;
            source_protocol: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rest">, import("@sinclair/typebox").TLiteral<"mcp">, import("@sinclair/typebox").TLiteral<"streamable">, import("@sinclair/typebox").TLiteral<"openai">, import("@sinclair/typebox").TLiteral<"websocket">, import("@sinclair/typebox").TLiteral<"agent_chain">, import("@sinclair/typebox").TLiteral<"scheduled_job">, import("@sinclair/typebox").TLiteral<"internal">]>>;
            standing_approval: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
                approval_token_digest: import("@sinclair/typebox").TString;
                granted_by: import("@sinclair/typebox").TString;
                granted_at: import("@sinclair/typebox").TString;
                expires_at: import("@sinclair/typebox").TString;
                review_after: import("@sinclair/typebox").TString;
                policy_bundle_digest: import("@sinclair/typebox").TString;
            }>>;
            system_plan_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>;
        policy_bundle_digest: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        policy_version: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    route_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"candidate">, import("@sinclair/typebox").TLiteral<"accepted">, import("@sinclair/typebox").TLiteral<"rejected">]>;
    created_at: import("@sinclair/typebox").TString;
}>;
export type ChatRoutePlan = Static<typeof ChatRoutePlan>;
export declare const ChatEvidenceItem: import("@sinclair/typebox").TObject<{
    evidence_id: import("@sinclair/typebox").TString;
    source_ref: import("@sinclair/typebox").TString;
    citation_eligible: import("@sinclair/typebox").TBoolean;
    claim_support: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"direct">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"contradicted">, import("@sinclair/typebox").TLiteral<"none">]>;
    content_hash: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type ChatEvidenceItem = Static<typeof ChatEvidenceItem>;
export declare const ChatEvidencePack: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.chat_evidence_pack.v1">;
    evidence_pack_id: import("@sinclair/typebox").TString;
    turn_id: import("@sinclair/typebox").TString;
    route_id: import("@sinclair/typebox").TString;
    evidence_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"available">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"unavailable">]>;
    items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        evidence_id: import("@sinclair/typebox").TString;
        source_ref: import("@sinclair/typebox").TString;
        citation_eligible: import("@sinclair/typebox").TBoolean;
        claim_support: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"direct">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"contradicted">, import("@sinclair/typebox").TLiteral<"none">]>;
        content_hash: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    missing_evidence: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    contradiction_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    created_at: import("@sinclair/typebox").TString;
}>;
export type ChatEvidencePack = Static<typeof ChatEvidencePack>;
export declare const ChatClaimDraft: import("@sinclair/typebox").TObject<{
    text: import("@sinclair/typebox").TString;
    evidence_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    support_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"supported">, import("@sinclair/typebox").TLiteral<"uncertain">, import("@sinclair/typebox").TLiteral<"unsupported">]>;
}>;
export type ChatClaimDraft = Static<typeof ChatClaimDraft>;
export declare const ChatToolRequest: import("@sinclair/typebox").TObject<{
    tool: import("@sinclair/typebox").TString;
    payload_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    requested_risk_level: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"staged_write">, import("@sinclair/typebox").TLiteral<"production_write">]>;
}>;
export type ChatToolRequest = Static<typeof ChatToolRequest>;
export declare const ChatPolicyFlag: import("@sinclair/typebox").TObject<{
    code: import("@sinclair/typebox").TString;
    severity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"info">, import("@sinclair/typebox").TLiteral<"warning">, import("@sinclair/typebox").TLiteral<"blocking">]>;
}>;
export type ChatPolicyFlag = Static<typeof ChatPolicyFlag>;
export declare const ChatRenderHints: import("@sinclair/typebox").TObject<{
    format: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"html">, import("@sinclair/typebox").TLiteral<"markdown">, import("@sinclair/typebox").TLiteral<"json">, import("@sinclair/typebox").TLiteral<"pptx">, import("@sinclair/typebox").TLiteral<"docx">, import("@sinclair/typebox").TLiteral<"text">]>;
    response_length: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"short">, import("@sinclair/typebox").TLiteral<"standard">, import("@sinclair/typebox").TLiteral<"detailed">]>>;
    locale: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type ChatRenderHints = Static<typeof ChatRenderHints>;
/**
 * Provider output constrained to WDC-owned fields. This is a draft only and
 * must pass ChatVerificationReport before it becomes a turn result.
 */
export declare const WdcChatDraft: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.chat_draft.v1">;
    draft_id: import("@sinclair/typebox").TString;
    turn_id: import("@sinclair/typebox").TString;
    route_id: import("@sinclair/typebox").TString;
    provider_id: import("@sinclair/typebox").TString;
    model_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    answer: import("@sinclair/typebox").TString;
    claims: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        text: import("@sinclair/typebox").TString;
        evidence_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        support_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"supported">, import("@sinclair/typebox").TLiteral<"uncertain">, import("@sinclair/typebox").TLiteral<"unsupported">]>;
    }>>;
    citation_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    citation_integrity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"missing">, import("@sinclair/typebox").TLiteral<"hallucinated">]>;
    uncertainty: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"none">, import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"medium">, import("@sinclair/typebox").TLiteral<"high">]>;
    tool_requests: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        tool: import("@sinclair/typebox").TString;
        payload_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        requested_risk_level: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"staged_write">, import("@sinclair/typebox").TLiteral<"production_write">]>;
    }>>;
    policy_flags: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        code: import("@sinclair/typebox").TString;
        severity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"info">, import("@sinclair/typebox").TLiteral<"warning">, import("@sinclair/typebox").TLiteral<"blocking">]>;
    }>>;
    render_hints: import("@sinclair/typebox").TObject<{
        format: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"html">, import("@sinclair/typebox").TLiteral<"markdown">, import("@sinclair/typebox").TLiteral<"json">, import("@sinclair/typebox").TLiteral<"pptx">, import("@sinclair/typebox").TLiteral<"docx">, import("@sinclair/typebox").TLiteral<"text">]>;
        response_length: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"short">, import("@sinclair/typebox").TLiteral<"standard">, import("@sinclair/typebox").TLiteral<"detailed">]>>;
        locale: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    created_at: import("@sinclair/typebox").TString;
}>;
export type WdcChatDraft = Static<typeof WdcChatDraft>;
export declare const ChatVerificationReport: import("@sinclair/typebox").TObject<{
    report_id: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"passed">, import("@sinclair/typebox").TLiteral<"repair_required">, import("@sinclair/typebox").TLiteral<"rejected">]>;
    verifier_id: import("@sinclair/typebox").TString;
    evidence_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"available">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"unavailable">]>;
    citation_integrity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"missing">, import("@sinclair/typebox").TLiteral<"hallucinated">]>;
    unsupported_claim_indexes: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TInteger>;
    allowed_tool_request_indexes: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TInteger>;
    policy_decision: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        allowed: import("@sinclair/typebox").TBoolean;
        code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OK">, import("@sinclair/typebox").TLiteral<"PLAN_REQUIRED">, import("@sinclair/typebox").TLiteral<"APPROVAL_REQUIRED">, import("@sinclair/typebox").TLiteral<"UNCLASSIFIED_DANGEROUS_CALLER">, import("@sinclair/typebox").TLiteral<"BYPASS_EXPIRED">, import("@sinclair/typebox").TLiteral<"BYPASS_TOOL_NOT_ALLOWED">, import("@sinclair/typebox").TLiteral<"BYPASS_RISK_TOO_HIGH">, import("@sinclair/typebox").TLiteral<"POLICY_VIOLATION">, import("@sinclair/typebox").TLiteral<"COST_BUDGET_EXCEEDED">, import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">]>;
        reason: import("@sinclair/typebox").TString;
        governance: import("@sinclair/typebox").TObject<{
            risk_level: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"staged_write">, import("@sinclair/typebox").TLiteral<"production_write">]>;
            requires_plan: import("@sinclair/typebox").TBoolean;
            requires_approval: import("@sinclair/typebox").TBoolean;
            cost_tier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"free">, import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"medium">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"premium">]>;
            audit_category: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"graph_promotion">, import("@sinclair/typebox").TLiteral<"memory_promotion">, import("@sinclair/typebox").TLiteral<"data_read">, import("@sinclair/typebox").TLiteral<"tool_invocation">, import("@sinclair/typebox").TLiteral<"plan_lifecycle">, import("@sinclair/typebox").TLiteral<"policy_decision">, import("@sinclair/typebox").TLiteral<"external_call">, import("@sinclair/typebox").TLiteral<"security_event">]>;
            audience: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"external_agent">, import("@sinclair/typebox").TLiteral<"internal_system">, import("@sinclair/typebox").TLiteral<"operator_only">]>>;
            source_protocol: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rest">, import("@sinclair/typebox").TLiteral<"mcp">, import("@sinclair/typebox").TLiteral<"streamable">, import("@sinclair/typebox").TLiteral<"openai">, import("@sinclair/typebox").TLiteral<"websocket">, import("@sinclair/typebox").TLiteral<"agent_chain">, import("@sinclair/typebox").TLiteral<"scheduled_job">, import("@sinclair/typebox").TLiteral<"internal">]>>;
            standing_approval: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
                approval_token_digest: import("@sinclair/typebox").TString;
                granted_by: import("@sinclair/typebox").TString;
                granted_at: import("@sinclair/typebox").TString;
                expires_at: import("@sinclair/typebox").TString;
                review_after: import("@sinclair/typebox").TString;
                policy_bundle_digest: import("@sinclair/typebox").TString;
            }>>;
            system_plan_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>;
        policy_bundle_digest: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        policy_version: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    repair_attempts: import("@sinclair/typebox").TInteger;
    created_at: import("@sinclair/typebox").TString;
}>;
export type ChatVerificationReport = Static<typeof ChatVerificationReport>;
export declare const WdcChatTurnResult: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.chat_turn_result.v1">;
    turn_id: import("@sinclair/typebox").TString;
    route_id: import("@sinclair/typebox").TString;
    draft_id: import("@sinclair/typebox").TString;
    content: import("@sinclair/typebox").TString;
    format: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"html">, import("@sinclair/typebox").TLiteral<"markdown">, import("@sinclair/typebox").TLiteral<"json">, import("@sinclair/typebox").TLiteral<"pptx">, import("@sinclair/typebox").TLiteral<"docx">, import("@sinclair/typebox").TLiteral<"text">]>;
    evidence_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"available">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"unavailable">]>;
    citation_integrity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"missing">, import("@sinclair/typebox").TLiteral<"hallucinated">]>;
    verification: import("@sinclair/typebox").TObject<{
        report_id: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"passed">, import("@sinclair/typebox").TLiteral<"repair_required">, import("@sinclair/typebox").TLiteral<"rejected">]>;
        verifier_id: import("@sinclair/typebox").TString;
        evidence_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"available">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"unavailable">]>;
        citation_integrity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"missing">, import("@sinclair/typebox").TLiteral<"hallucinated">]>;
        unsupported_claim_indexes: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TInteger>;
        allowed_tool_request_indexes: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TInteger>;
        policy_decision: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            allowed: import("@sinclair/typebox").TBoolean;
            code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OK">, import("@sinclair/typebox").TLiteral<"PLAN_REQUIRED">, import("@sinclair/typebox").TLiteral<"APPROVAL_REQUIRED">, import("@sinclair/typebox").TLiteral<"UNCLASSIFIED_DANGEROUS_CALLER">, import("@sinclair/typebox").TLiteral<"BYPASS_EXPIRED">, import("@sinclair/typebox").TLiteral<"BYPASS_TOOL_NOT_ALLOWED">, import("@sinclair/typebox").TLiteral<"BYPASS_RISK_TOO_HIGH">, import("@sinclair/typebox").TLiteral<"POLICY_VIOLATION">, import("@sinclair/typebox").TLiteral<"COST_BUDGET_EXCEEDED">, import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">]>;
            reason: import("@sinclair/typebox").TString;
            governance: import("@sinclair/typebox").TObject<{
                risk_level: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"staged_write">, import("@sinclair/typebox").TLiteral<"production_write">]>;
                requires_plan: import("@sinclair/typebox").TBoolean;
                requires_approval: import("@sinclair/typebox").TBoolean;
                cost_tier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"free">, import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"medium">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"premium">]>;
                audit_category: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"graph_promotion">, import("@sinclair/typebox").TLiteral<"memory_promotion">, import("@sinclair/typebox").TLiteral<"data_read">, import("@sinclair/typebox").TLiteral<"tool_invocation">, import("@sinclair/typebox").TLiteral<"plan_lifecycle">, import("@sinclair/typebox").TLiteral<"policy_decision">, import("@sinclair/typebox").TLiteral<"external_call">, import("@sinclair/typebox").TLiteral<"security_event">]>;
                audience: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"external_agent">, import("@sinclair/typebox").TLiteral<"internal_system">, import("@sinclair/typebox").TLiteral<"operator_only">]>>;
                source_protocol: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rest">, import("@sinclair/typebox").TLiteral<"mcp">, import("@sinclair/typebox").TLiteral<"streamable">, import("@sinclair/typebox").TLiteral<"openai">, import("@sinclair/typebox").TLiteral<"websocket">, import("@sinclair/typebox").TLiteral<"agent_chain">, import("@sinclair/typebox").TLiteral<"scheduled_job">, import("@sinclair/typebox").TLiteral<"internal">]>>;
                standing_approval: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
                    approval_token_digest: import("@sinclair/typebox").TString;
                    granted_by: import("@sinclair/typebox").TString;
                    granted_at: import("@sinclair/typebox").TString;
                    expires_at: import("@sinclair/typebox").TString;
                    review_after: import("@sinclair/typebox").TString;
                    policy_bundle_digest: import("@sinclair/typebox").TString;
                }>>;
                system_plan_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            }>;
            policy_bundle_digest: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            policy_version: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>>;
        repair_attempts: import("@sinclair/typebox").TInteger;
        created_at: import("@sinclair/typebox").TString;
    }>;
    citations: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    created_at: import("@sinclair/typebox").TString;
}>;
export type WdcChatTurnResult = Static<typeof WdcChatTurnResult>;
//# sourceMappingURL=chat-contract-runtime.d.ts.map