/**
 * Governance contracts — LIN-997 / WidgeTDC LIN-987.2 follow-up.
 *
 * Mirrors the runtime governance shapes defined in the WidgeTDC
 * backend (`apps/backend/src/mcp/types/governance.ts`,
 * `apps/backend/src/services/eventSpine/types.ts`,
 * `apps/backend/src/mcp/gateway/governanceGateway.ts`) so that
 * cross-repo consumers (orchestrator, canvas-server, RLM, OpenClaw)
 * share the same envelope and decision shapes.
 *
 * Architect option B (LIN-997): the schema includes optional
 * `audience`, `source_protocol`, `standing_approval`, and
 * `policy_bundle_digest` fields to model scheduled-internal-governed
 * mutation without weakening the staged_write/production_write
 * plan+approval contract.
 *
 * Source-of-truth note: the WidgeTDC backend is the runtime gate.
 * These contracts are the wire shape for cross-repo consumers; the
 * gate's internal policy logic is the enforcement authority.
 */
import { Static } from '@sinclair/typebox';
export declare const GovernanceRiskLevel: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"staged_write">, import("@sinclair/typebox").TLiteral<"production_write">]>;
export type GovernanceRiskLevel = Static<typeof GovernanceRiskLevel>;
export declare const GovernanceCostTier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"free">, import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"medium">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"premium">]>;
export type GovernanceCostTier = Static<typeof GovernanceCostTier>;
export declare const GovernanceAuditCategory: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"graph_promotion">, import("@sinclair/typebox").TLiteral<"memory_promotion">, import("@sinclair/typebox").TLiteral<"data_read">, import("@sinclair/typebox").TLiteral<"tool_invocation">, import("@sinclair/typebox").TLiteral<"plan_lifecycle">, import("@sinclair/typebox").TLiteral<"policy_decision">, import("@sinclair/typebox").TLiteral<"external_call">, import("@sinclair/typebox").TLiteral<"security_event">]>;
export type GovernanceAuditCategory = Static<typeof GovernanceAuditCategory>;
export declare const GovernanceAudience: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"external_agent">, import("@sinclair/typebox").TLiteral<"internal_system">, import("@sinclair/typebox").TLiteral<"operator_only">]>;
export type GovernanceAudience = Static<typeof GovernanceAudience>;
export declare const GovernanceSourceProtocol: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rest">, import("@sinclair/typebox").TLiteral<"mcp">, import("@sinclair/typebox").TLiteral<"streamable">, import("@sinclair/typebox").TLiteral<"openai">, import("@sinclair/typebox").TLiteral<"websocket">, import("@sinclair/typebox").TLiteral<"agent_chain">, import("@sinclair/typebox").TLiteral<"scheduled_job">, import("@sinclair/typebox").TLiteral<"internal">]>;
export type GovernanceSourceProtocol = Static<typeof GovernanceSourceProtocol>;
export declare const GovernanceStandingApproval: import("@sinclair/typebox").TObject<{
    approval_token_digest: import("@sinclair/typebox").TString;
    granted_by: import("@sinclair/typebox").TString;
    granted_at: import("@sinclair/typebox").TString;
    expires_at: import("@sinclair/typebox").TString;
    review_after: import("@sinclair/typebox").TString;
    policy_bundle_digest: import("@sinclair/typebox").TString;
}>;
export type GovernanceStandingApproval = Static<typeof GovernanceStandingApproval>;
export declare const MCPToolGovernance: import("@sinclair/typebox").TObject<{
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
export type MCPToolGovernance = Static<typeof MCPToolGovernance>;
export declare const GovernanceActorType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"agent">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"system">, import("@sinclair/typebox").TLiteral<"cron">, import("@sinclair/typebox").TLiteral<"operator">]>;
export type GovernanceActorType = Static<typeof GovernanceActorType>;
export declare const GovernanceContext: import("@sinclair/typebox").TObject<{
    actor_id: import("@sinclair/typebox").TString;
    actor_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"agent">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"system">, import("@sinclair/typebox").TLiteral<"cron">, import("@sinclair/typebox").TLiteral<"operator">]>;
    correlation_id: import("@sinclair/typebox").TString;
    parent_event_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    workflow_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    plan_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    approval_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    tenant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    source_protocol: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rest">, import("@sinclair/typebox").TLiteral<"mcp">, import("@sinclair/typebox").TLiteral<"streamable">, import("@sinclair/typebox").TLiteral<"openai">, import("@sinclair/typebox").TLiteral<"websocket">, import("@sinclair/typebox").TLiteral<"agent_chain">, import("@sinclair/typebox").TLiteral<"scheduled_job">, import("@sinclair/typebox").TLiteral<"internal">]>;
    /**
     * Server-trust marker: `true` means this context was assembled
     * server-side by the gate from authenticated headers / signed tokens.
     * Client-supplied governance must NEVER be trusted; the gate strips
     * client governance fields and rebuilds the context with this flag.
     */
    server_trusted: import("@sinclair/typebox").TLiteral<true>;
}>;
export type GovernanceContext = Static<typeof GovernanceContext>;
export declare const GovernanceDecisionCode: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OK">, import("@sinclair/typebox").TLiteral<"PLAN_REQUIRED">, import("@sinclair/typebox").TLiteral<"APPROVAL_REQUIRED">, import("@sinclair/typebox").TLiteral<"UNCLASSIFIED_DANGEROUS_CALLER">, import("@sinclair/typebox").TLiteral<"BYPASS_EXPIRED">, import("@sinclair/typebox").TLiteral<"BYPASS_TOOL_NOT_ALLOWED">, import("@sinclair/typebox").TLiteral<"BYPASS_RISK_TOO_HIGH">, import("@sinclair/typebox").TLiteral<"POLICY_VIOLATION">, import("@sinclair/typebox").TLiteral<"COST_BUDGET_EXCEEDED">, import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">]>;
export type GovernanceDecisionCode = Static<typeof GovernanceDecisionCode>;
export declare const GovernanceDecision: import("@sinclair/typebox").TObject<{
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
}>;
export type GovernanceDecision = Static<typeof GovernanceDecision>;
export declare const GovernanceRejectionNextStep: import("@sinclair/typebox").TObject<{
    action: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"create_plan">, import("@sinclair/typebox").TLiteral<"request_approval">, import("@sinclair/typebox").TLiteral<"classify_caller">, import("@sinclair/typebox").TLiteral<"refresh_bypass">, import("@sinclair/typebox").TLiteral<"contact_operator">]>;
    endpoint: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    required_fields: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    hint: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type GovernanceRejectionNextStep = Static<typeof GovernanceRejectionNextStep>;
export declare const GovernanceRejectionEnvelope: import("@sinclair/typebox").TObject<{
    error_class: import("@sinclair/typebox").TLiteral<"governance_rejection">;
    tool: import("@sinclair/typebox").TString;
    risk_level: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"staged_write">, import("@sinclair/typebox").TLiteral<"production_write">]>>;
    code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OK">, import("@sinclair/typebox").TLiteral<"PLAN_REQUIRED">, import("@sinclair/typebox").TLiteral<"APPROVAL_REQUIRED">, import("@sinclair/typebox").TLiteral<"UNCLASSIFIED_DANGEROUS_CALLER">, import("@sinclair/typebox").TLiteral<"BYPASS_EXPIRED">, import("@sinclair/typebox").TLiteral<"BYPASS_TOOL_NOT_ALLOWED">, import("@sinclair/typebox").TLiteral<"BYPASS_RISK_TOO_HIGH">, import("@sinclair/typebox").TLiteral<"POLICY_VIOLATION">, import("@sinclair/typebox").TLiteral<"COST_BUDGET_EXCEEDED">, import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">]>;
    requirement: import("@sinclair/typebox").TString;
    reason: import("@sinclair/typebox").TString;
    next_step: import("@sinclair/typebox").TObject<{
        action: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"create_plan">, import("@sinclair/typebox").TLiteral<"request_approval">, import("@sinclair/typebox").TLiteral<"classify_caller">, import("@sinclair/typebox").TLiteral<"refresh_bypass">, import("@sinclair/typebox").TLiteral<"contact_operator">]>;
        endpoint: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        required_fields: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        hint: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    correlation_id: import("@sinclair/typebox").TString;
    policy_bundle_digest: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type GovernanceRejectionEnvelope = Static<typeof GovernanceRejectionEnvelope>;
export declare const ToolInvocationEnvelope: import("@sinclair/typebox").TObject<{
    tool: import("@sinclair/typebox").TString;
    payload: import("@sinclair/typebox").TUnknown;
    context: import("@sinclair/typebox").TObject<{
        actor_id: import("@sinclair/typebox").TString;
        actor_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"agent">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"system">, import("@sinclair/typebox").TLiteral<"cron">, import("@sinclair/typebox").TLiteral<"operator">]>;
        correlation_id: import("@sinclair/typebox").TString;
        parent_event_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        workflow_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        plan_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        approval_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        tenant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        source_protocol: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rest">, import("@sinclair/typebox").TLiteral<"mcp">, import("@sinclair/typebox").TLiteral<"streamable">, import("@sinclair/typebox").TLiteral<"openai">, import("@sinclair/typebox").TLiteral<"websocket">, import("@sinclair/typebox").TLiteral<"agent_chain">, import("@sinclair/typebox").TLiteral<"scheduled_job">, import("@sinclair/typebox").TLiteral<"internal">]>;
        /**
         * Server-trust marker: `true` means this context was assembled
         * server-side by the gate from authenticated headers / signed tokens.
         * Client-supplied governance must NEVER be trusted; the gate strips
         * client governance fields and rebuilds the context with this flag.
         */
        server_trusted: import("@sinclair/typebox").TLiteral<true>;
    }>;
}>;
export type ToolInvocationEnvelope = Static<typeof ToolInvocationEnvelope>;
export declare const ToolResultEnvelope: import("@sinclair/typebox").TObject<{
    tool: import("@sinclair/typebox").TString;
    result: import("@sinclair/typebox").TUnknown;
    correlation_id: import("@sinclair/typebox").TString;
    duration_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    cost: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        cost_tier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"free">, import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"medium">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"premium">]>;
        units: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>>;
}>;
export type ToolResultEnvelope = Static<typeof ToolResultEnvelope>;
export declare const SpineEventBase: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    type: import("@sinclair/typebox").TString;
    timestamp: import("@sinclair/typebox").TString;
    actor_id: import("@sinclair/typebox").TString;
    actor_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"agent">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"system">, import("@sinclair/typebox").TLiteral<"cron">, import("@sinclair/typebox").TLiteral<"operator">]>;
    correlation_id: import("@sinclair/typebox").TString;
    parent_event_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    tool_name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    plan_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    workflow_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    tenant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    risk_level: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"staged_write">, import("@sinclair/typebox").TLiteral<"production_write">]>, import("@sinclair/typebox").TNull]>>;
    audit_category: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"graph_promotion">, import("@sinclair/typebox").TLiteral<"memory_promotion">, import("@sinclair/typebox").TLiteral<"data_read">, import("@sinclair/typebox").TLiteral<"tool_invocation">, import("@sinclair/typebox").TLiteral<"plan_lifecycle">, import("@sinclair/typebox").TLiteral<"policy_decision">, import("@sinclair/typebox").TLiteral<"external_call">, import("@sinclair/typebox").TLiteral<"security_event">]>, import("@sinclair/typebox").TNull]>>;
    cost_tier: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"free">, import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"medium">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"premium">]>, import("@sinclair/typebox").TNull]>>;
    outcome: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"success">, import("@sinclair/typebox").TLiteral<"failure">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"pending">]>;
    error_class: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    error_message: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    payload: import("@sinclair/typebox").TUnknown;
}>;
export type SpineEventBase = Static<typeof SpineEventBase>;
export declare const SpineEventType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"tool_called">, import("@sinclair/typebox").TLiteral<"tool_succeeded">, import("@sinclair/typebox").TLiteral<"tool_failed">, import("@sinclair/typebox").TLiteral<"tool_rejected">, import("@sinclair/typebox").TLiteral<"governance_rejection">, import("@sinclair/typebox").TLiteral<"policy_decision_made">, import("@sinclair/typebox").TLiteral<"plan_created">, import("@sinclair/typebox").TLiteral<"plan_approved">, import("@sinclair/typebox").TLiteral<"plan_executed">, import("@sinclair/typebox").TLiteral<"plan_evaluated">, import("@sinclair/typebox").TLiteral<"graph_promotion_completed">, import("@sinclair/typebox").TLiteral<"lineage_linked">, import("@sinclair/typebox").TLiteral<"memory_promoted">, import("@sinclair/typebox").TLiteral<"premium_escalation_used">, import("@sinclair/typebox").TLiteral<"cost_budget_exceeded">, import("@sinclair/typebox").TLiteral<"capability_canary_run">, import("@sinclair/typebox").TLiteral<"policy_violation_detected">]>;
export type SpineEventType = Static<typeof SpineEventType>;
export declare const GraphPromotionRequest: import("@sinclair/typebox").TObject<{
    promotion_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"metric">, import("@sinclair/typebox").TLiteral<"capability">, import("@sinclair/typebox").TLiteral<"observation">, import("@sinclair/typebox").TLiteral<"decision">, import("@sinclair/typebox").TLiteral<"pattern">, import("@sinclair/typebox").TLiteral<"lineage">]>;
    evidence_ref: import("@sinclair/typebox").TString;
    intent: import("@sinclair/typebox").TString;
    payload: import("@sinclair/typebox").TObject<{}>;
}>;
export type GraphPromotionRequest = Static<typeof GraphPromotionRequest>;
export declare const GraphPromotionResult: import("@sinclair/typebox").TObject<{
    tool: import("@sinclair/typebox").TString;
    promotion_type: import("@sinclair/typebox").TString;
    promoted: import("@sinclair/typebox").TBoolean;
    node_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    relationship_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    correlation_id: import("@sinclair/typebox").TString;
    evidence_ref: import("@sinclair/typebox").TString;
    spine_event_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type GraphPromotionResult = Static<typeof GraphPromotionResult>;
export declare const CapabilityTier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"untrusted">, import("@sinclair/typebox").TLiteral<"observed">, import("@sinclair/typebox").TLiteral<"governed">, import("@sinclair/typebox").TLiteral<"canonical">]>;
export type CapabilityTier = Static<typeof CapabilityTier>;
export declare const CapabilityLifecycleState: import("@sinclair/typebox").TObject<{
    capability_id: import("@sinclair/typebox").TString;
    current_tier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"untrusted">, import("@sinclair/typebox").TLiteral<"observed">, import("@sinclair/typebox").TLiteral<"governed">, import("@sinclair/typebox").TLiteral<"canonical">]>;
    promoted_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    recent_canary_history: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        run_id: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"green">, import("@sinclair/typebox").TLiteral<"red">]>;
        checked_at: import("@sinclair/typebox").TString;
        evidence_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export type CapabilityLifecycleState = Static<typeof CapabilityLifecycleState>;
export declare const ClaimPromotionEvidence: import("@sinclair/typebox").TObject<{
    claim_id: import("@sinclair/typebox").TString;
    current_level: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"L0">, import("@sinclair/typebox").TLiteral<"L1">, import("@sinclair/typebox").TLiteral<"L2">, import("@sinclair/typebox").TLiteral<"L3">]>;
    proposed_level: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"L0">, import("@sinclair/typebox").TLiteral<"L1">, import("@sinclair/typebox").TLiteral<"L2">, import("@sinclair/typebox").TLiteral<"L3">]>;
    evidence_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    canary_run_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    policy_bundle_digest: import("@sinclair/typebox").TString;
    promoted_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    reason: import("@sinclair/typebox").TString;
}>;
export type ClaimPromotionEvidence = Static<typeof ClaimPromotionEvidence>;
//# sourceMappingURL=governance.d.ts.map