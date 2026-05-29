"""
widgetdc_contracts.mcp — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/mcp/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, RootModel
from pydantic import AwareDatetime, BaseModel, Field
from pydantic import BaseModel
from pydantic import BaseModel, Field
from pydantic import BaseModel, Field, constr
from pydantic import Field, RootModel
from pydantic import RootModel
from typing import Any, Literal
from typing import Literal
from uuid import UUID

__all__ = ["CapabilityLifecycleState", "CapabilityTier", "ClaimPromotionEvidence", "ComplianceTier", "ContractsConsumerAdoptionReadback", "GovernanceActorType", "GovernanceAudience", "GovernanceAuditCategory", "GovernanceContext", "GovernanceCostTier", "GovernanceDecision", "GovernanceDecisionCode", "GovernanceRejectionEnvelope", "GovernanceRejectionNextStep", "GovernanceRiskLevel", "GovernanceSourceProtocol", "GovernanceStandingApproval", "GraphPromotionRequest", "GraphPromotionResult", "MCPToolGovernance", "McpClientDiscoveryPolicy", "McpClientLimits", "McpClientPoliciesDocument", "McpClientPolicy", "McpClientSelfResource", "McpPolicyRisk", "McpResourcePolicyMetadata", "McpToolPolicyMetadata", "McpTransport", "MrpRouteEnvelope", "RequestFeatures", "RequestTaskType", "SpineEventBase", "SpineEventType", "ToolInvocationEnvelope", "ToolResultEnvelope"]

class RecentCanaryHistoryItem(BaseModel):
    run_id: str
    status: Literal['green', 'red']
    checked_at: AwareDatetime
    evidence_ref: str | None = None


class CapabilityLifecycleState(BaseModel):
    capability_id: str
    current_tier: Literal['untrusted', 'observed', 'governed', 'canonical']
    promoted_at: AwareDatetime | None = None
    recent_canary_history: list[RecentCanaryHistoryItem]

class CapabilityTier(
    RootModel[Literal['untrusted', 'observed', 'governed', 'canonical']]
):
    root: Literal['untrusted', 'observed', 'governed', 'canonical']

class ClaimPromotionEvidence(BaseModel):
    claim_id: str
    current_level: Literal['L0', 'L1', 'L2', 'L3']
    proposed_level: Literal['L0', 'L1', 'L2', 'L3']
    evidence_refs: list[str]
    canary_run_ids: list[str]
    policy_bundle_digest: str
    promoted_at: AwareDatetime | None = None
    reason: str

class ComplianceTier(RootModel[Literal['public', 'internal', 'legal', 'health']]):
    root: Literal['public', 'internal', 'legal', 'health'] = Field(
        ...,
        description='Data-handling compliance tier — drives crypto-shred + PII routing.',
    )

class EvidenceRef(RootModel[str]):
    root: str = Field(..., min_length=1)


class ContractsConsumerAdoptionReadback(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['contracts.consumer_adoption_readback.v1']
    package_name: Literal['@widgetdc/contracts']
    package_version: str = Field(
        ...,
        description='Resolved @widgetdc/contracts package version used by the deployed consumer.',
        min_length=1,
    )
    contracts_commit_sha: str = Field(
        ...,
        description='Full lowercase git commit SHA.',
        max_length=40,
        min_length=40,
        pattern='^[0-9a-f]{40}$',
    )
    consumer_repo: str = Field(
        ...,
        description='Repository or governed runtime that emitted this adoption read-back.',
        min_length=1,
    )
    consumer_service: str = Field(
        ...,
        description='Deployed service, job, or runner inside the consumer boundary.',
        min_length=1,
    )
    consumer_deployed_sha: str = Field(
        ...,
        description='Full lowercase git commit SHA.',
        max_length=40,
        min_length=40,
        pattern='^[0-9a-f]{40}$',
    )
    source_protocol: Literal[
        'rest',
        'mcp',
        'streamable',
        'openai',
        'websocket',
        'agent_chain',
        'scheduled_job',
        'internal',
    ]
    generated_at: AwareDatetime
    runtime_correlation_id: str = Field(
        ...,
        description='Correlation id emitted by the deployed consumer runtime.',
        min_length=1,
    )
    eventspine_replay_count: int = Field(
        ...,
        description='EventSpine replay count observed by the deployed consumer runtime; must be >= 1.',
        ge=1,
    )
    evidence_refs: list[EvidenceRef] = Field(
        ...,
        description='Evidence URIs or artifact identifiers backing the read-back.',
        min_length=1,
    )
    spine_event_id: str | None = Field(
        None,
        description='Optional EventSpine event id for the adoption read-back.',
        min_length=1,
    )
    workflow_id: str | None = Field(
        None,
        description='Optional workflow id associated with the deployed consumer run.',
        min_length=1,
    )
    run_id: str | None = Field(
        None,
        description='Optional CI/runtime run id associated with the consumer read-back.',
        min_length=1,
    )
    runtime_proof_claimed: Literal[False]
    claim_promotion_eligible: Literal[False]

class GovernanceActorType(
    RootModel[Literal['agent', 'user', 'system', 'cron', 'operator']]
):
    root: Literal['agent', 'user', 'system', 'cron', 'operator']

class GovernanceAudience(
    RootModel[Literal['external_agent', 'internal_system', 'operator_only']]
):
    root: Literal['external_agent', 'internal_system', 'operator_only']

class GovernanceAuditCategory(
    RootModel[
        Literal[
            'graph_promotion',
            'memory_promotion',
            'data_read',
            'tool_invocation',
            'plan_lifecycle',
            'policy_decision',
            'external_call',
            'security_event',
        ]
    ]
):
    root: Literal[
        'graph_promotion',
        'memory_promotion',
        'data_read',
        'tool_invocation',
        'plan_lifecycle',
        'policy_decision',
        'external_call',
        'security_event',
    ]

class GovernanceContext(BaseModel):
    actor_id: str
    actor_type: Literal['agent', 'user', 'system', 'cron', 'operator']
    correlation_id: str = Field(
        ..., description='Cross-service correlation id; required for replay/audit'
    )
    parent_event_id: str | None = None
    workflow_id: str | None = None
    plan_id: str | None = None
    approval_id: str | None = None
    tenant_id: str | None = None
    source_protocol: Literal[
        'rest',
        'mcp',
        'streamable',
        'openai',
        'websocket',
        'agent_chain',
        'scheduled_job',
        'internal',
    ]
    server_trusted: Literal[True]

class GovernanceCostTier(
    RootModel[Literal['free', 'low', 'medium', 'high', 'premium']]
):
    root: Literal['free', 'low', 'medium', 'high', 'premium']

class StandingApproval(BaseModel):
    approval_token_digest: str = Field(
        ..., description='sha256 of the standing approval token (no plaintext)'
    )
    granted_by: str = Field(..., description='Operator identity (user id or role)')
    granted_at: AwareDatetime = Field(
        ..., description='ISO datetime when the approval was granted'
    )
    expires_at: AwareDatetime = Field(
        ...,
        description='ISO datetime — MUST be set; null forbidden for standing approvals',
    )
    review_after: AwareDatetime = Field(
        ..., description='ISO datetime — operator review cadence'
    )
    policy_bundle_digest: str = Field(
        ..., description='sha256 of the active policy bundle this approval is bound to'
    )


class Governance(BaseModel):
    risk_level: Literal['read_only', 'staged_write', 'production_write']
    requires_plan: bool = Field(
        ...,
        description='If true, the gate rejects direct execution and routes through HyperAgent (create_plan → approve_plan → execute_plan → evaluate_plan).',
    )
    requires_approval: bool = Field(
        ...,
        description='If true, plan creation alone is insufficient — operator OR policy-profile approval token required before execute_plan.',
    )
    cost_tier: Literal['free', 'low', 'medium', 'high', 'premium']
    audit_category: Literal[
        'graph_promotion',
        'memory_promotion',
        'data_read',
        'tool_invocation',
        'plan_lifecycle',
        'policy_decision',
        'external_call',
        'security_event',
    ]
    audience: Literal['external_agent', 'internal_system', 'operator_only'] | None = (
        None
    )
    source_protocol: (
        Literal[
            'rest',
            'mcp',
            'streamable',
            'openai',
            'websocket',
            'agent_chain',
            'scheduled_job',
            'internal',
        ]
        | None
    ) = None
    standing_approval: StandingApproval | None = Field(
        None,
        description='Standing approval block for scheduled internal governed mutation. Replaces the per-call HyperAgent plan+approval flow for cron-driven callers while preserving auditable lifecycle (granted/expires/review/policy).',
    )
    system_plan_id: str | None = Field(
        None, description='Pinned plan-id for scheduled internal callers (Option B)'
    )


class GovernanceDecision(BaseModel):
    allowed: bool
    code: Literal[
        'OK',
        'PLAN_REQUIRED',
        'APPROVAL_REQUIRED',
        'UNCLASSIFIED_DANGEROUS_CALLER',
        'BYPASS_EXPIRED',
        'BYPASS_TOOL_NOT_ALLOWED',
        'BYPASS_RISK_TOO_HIGH',
        'POLICY_VIOLATION',
        'COST_BUDGET_EXCEEDED',
        'INTERNAL_ERROR',
    ]
    reason: str
    governance: Governance = Field(
        ...,
        description='Governance metadata declared on every MCP tool definition. The gate consults `risk_level` + `requires_plan` + `requires_approval` to decide execution path. Audience / source_protocol / standing_approval express the Architect Option B scheduled-internal-mutation lifecycle.',
    )
    policy_bundle_digest: str | None = None
    policy_version: str | None = None
    correlation_id: str | None = None

class GovernanceDecisionCode(
    RootModel[
        Literal[
            'OK',
            'PLAN_REQUIRED',
            'APPROVAL_REQUIRED',
            'UNCLASSIFIED_DANGEROUS_CALLER',
            'BYPASS_EXPIRED',
            'BYPASS_TOOL_NOT_ALLOWED',
            'BYPASS_RISK_TOO_HIGH',
            'POLICY_VIOLATION',
            'COST_BUDGET_EXCEEDED',
            'INTERNAL_ERROR',
        ]
    ]
):
    root: Literal[
        'OK',
        'PLAN_REQUIRED',
        'APPROVAL_REQUIRED',
        'UNCLASSIFIED_DANGEROUS_CALLER',
        'BYPASS_EXPIRED',
        'BYPASS_TOOL_NOT_ALLOWED',
        'BYPASS_RISK_TOO_HIGH',
        'POLICY_VIOLATION',
        'COST_BUDGET_EXCEEDED',
        'INTERNAL_ERROR',
    ]

class NextStep(BaseModel):
    action: Literal[
        'create_plan',
        'request_approval',
        'classify_caller',
        'refresh_bypass',
        'contact_operator',
    ]
    endpoint: str | None = Field(
        None, description='Endpoint or tool name the caller should invoke next'
    )
    required_fields: list[str] | None = None
    hint: str | None = None


class GovernanceRejectionEnvelope(BaseModel):
    error_class: Literal['governance_rejection']
    tool: str
    risk_level: Literal['read_only', 'staged_write', 'production_write'] | None = None
    code: Literal[
        'OK',
        'PLAN_REQUIRED',
        'APPROVAL_REQUIRED',
        'UNCLASSIFIED_DANGEROUS_CALLER',
        'BYPASS_EXPIRED',
        'BYPASS_TOOL_NOT_ALLOWED',
        'BYPASS_RISK_TOO_HIGH',
        'POLICY_VIOLATION',
        'COST_BUDGET_EXCEEDED',
        'INTERNAL_ERROR',
    ]
    requirement: str
    reason: str
    next_step: NextStep = Field(
        ...,
        description='Action-oriented next-step instruction returned with every rejection so callers can self-recover (matches the Learning Interface Contract — GOV-2.1).',
    )
    correlation_id: str
    policy_bundle_digest: str | None = None

class GovernanceRejectionNextStep(BaseModel):
    action: Literal[
        'create_plan',
        'request_approval',
        'classify_caller',
        'refresh_bypass',
        'contact_operator',
    ]
    endpoint: str | None = Field(
        None, description='Endpoint or tool name the caller should invoke next'
    )
    required_fields: list[str] | None = None
    hint: str | None = None

class GovernanceRiskLevel(
    RootModel[Literal['read_only', 'staged_write', 'production_write']]
):
    root: Literal['read_only', 'staged_write', 'production_write']

class GovernanceSourceProtocol(
    RootModel[
        Literal[
            'rest',
            'mcp',
            'streamable',
            'openai',
            'websocket',
            'agent_chain',
            'scheduled_job',
            'internal',
        ]
    ]
):
    root: Literal[
        'rest',
        'mcp',
        'streamable',
        'openai',
        'websocket',
        'agent_chain',
        'scheduled_job',
        'internal',
    ]

class GovernanceStandingApproval(BaseModel):
    approval_token_digest: str = Field(
        ..., description='sha256 of the standing approval token (no plaintext)'
    )
    granted_by: str = Field(..., description='Operator identity (user id or role)')
    granted_at: AwareDatetime = Field(
        ..., description='ISO datetime when the approval was granted'
    )
    expires_at: AwareDatetime = Field(
        ...,
        description='ISO datetime — MUST be set; null forbidden for standing approvals',
    )
    review_after: AwareDatetime = Field(
        ..., description='ISO datetime — operator review cadence'
    )
    policy_bundle_digest: str = Field(
        ..., description='sha256 of the active policy bundle this approval is bound to'
    )

class GraphPromotionRequest(BaseModel):
    promotion_type: Literal[
        'metric', 'capability', 'observation', 'decision', 'pattern', 'lineage'
    ]
    evidence_ref: str = Field(
        ...,
        description='URL or identifier pointing to the evidence backing this promotion',
    )
    intent: str = Field(
        ..., description='One-line description of the business intent for audit replay'
    )
    payload: dict[str, Any]

class GraphPromotionResult(BaseModel):
    tool: str
    promotion_type: str
    promoted: bool
    node_id: str | None = None
    relationship_id: str | None = None
    correlation_id: str
    evidence_ref: str
    spine_event_id: str | None = None

class StandingApproval(BaseModel):
    approval_token_digest: str = Field(
        ..., description='sha256 of the standing approval token (no plaintext)'
    )
    granted_by: str = Field(..., description='Operator identity (user id or role)')
    granted_at: AwareDatetime = Field(
        ..., description='ISO datetime when the approval was granted'
    )
    expires_at: AwareDatetime = Field(
        ...,
        description='ISO datetime — MUST be set; null forbidden for standing approvals',
    )
    review_after: AwareDatetime = Field(
        ..., description='ISO datetime — operator review cadence'
    )
    policy_bundle_digest: str = Field(
        ..., description='sha256 of the active policy bundle this approval is bound to'
    )


class MCPToolGovernance(BaseModel):
    risk_level: Literal['read_only', 'staged_write', 'production_write']
    requires_plan: bool = Field(
        ...,
        description='If true, the gate rejects direct execution and routes through HyperAgent (create_plan → approve_plan → execute_plan → evaluate_plan).',
    )
    requires_approval: bool = Field(
        ...,
        description='If true, plan creation alone is insufficient — operator OR policy-profile approval token required before execute_plan.',
    )
    cost_tier: Literal['free', 'low', 'medium', 'high', 'premium']
    audit_category: Literal[
        'graph_promotion',
        'memory_promotion',
        'data_read',
        'tool_invocation',
        'plan_lifecycle',
        'policy_decision',
        'external_call',
        'security_event',
    ]
    audience: Literal['external_agent', 'internal_system', 'operator_only'] | None = (
        None
    )
    source_protocol: (
        Literal[
            'rest',
            'mcp',
            'streamable',
            'openai',
            'websocket',
            'agent_chain',
            'scheduled_job',
            'internal',
        ]
        | None
    ) = None
    standing_approval: StandingApproval | None = Field(
        None,
        description='Standing approval block for scheduled internal governed mutation. Replaces the per-call HyperAgent plan+approval flow for cron-driven callers while preserving auditable lifecycle (granted/expires/review/policy).',
    )
    system_plan_id: str | None = Field(
        None, description='Pinned plan-id for scheduled internal callers (Option B)'
    )

class McpClientDiscoveryPolicy(BaseModel):
    include_deprecated: bool | None = None

class McpClientLimits(BaseModel):
    rate_limit_per_minute: int | None = None

class Limits(BaseModel):
    rate_limit_per_minute: int | None = None


class Discovery(BaseModel):
    include_deprecated: bool | None = None


class Defaults(BaseModel):
    description: str | None = None
    scopes: list[str] | None = None
    allowed_tools: list[str] | None = None
    denied_tools: list[str] | None = None
    allowed_resources: list[str] | None = None
    denied_resources: list[str] | None = None
    allowed_transports: (
        list[Literal['streamable_http', 'rest', 'sse', 'stdio']] | None
    ) = None
    limits: Limits | None = Field(
        None, description='Runtime-enforced rate and payload limits for an MCP client.'
    )
    discovery: Discovery | None = Field(
        None, description='Discovery preferences applied after auth-based filtering.'
    )
    owner_contact: str | None = None


class Clients(BaseModel):
    description: str | None = None
    scopes: list[str] | None = None
    allowed_tools: list[str] | None = None
    denied_tools: list[str] | None = None
    allowed_resources: list[str] | None = None
    denied_resources: list[str] | None = None
    allowed_transports: (
        list[Literal['streamable_http', 'rest', 'sse', 'stdio']] | None
    ) = None
    limits: Limits | None = Field(
        None, description='Runtime-enforced rate and payload limits for an MCP client.'
    )
    discovery: Discovery | None = Field(
        None, description='Discovery preferences applied after auth-based filtering.'
    )
    owner_contact: str | None = None


class ToolMetadata(BaseModel):
    capability_id: str | None = None
    required_scopes: list[str] | None = None
    risk: Literal['low', 'moderate', 'high', 'critical'] | None = None
    audience: list[str] | None = None
    deprecated: bool | None = None


class ResourceMetadata(BaseModel):
    required_scopes: list[str] | None = None
    audience: list[str] | None = None
    description: str | None = None


class McpClientPoliciesDocument(BaseModel):
    version: str
    description: str | None = None
    defaults: Defaults | None = Field(
        None, description='Per-client MCP discovery and execution policy.'
    )
    clients: dict[constr(pattern=r'^(.*)$'), Clients] | None = None
    tool_metadata: dict[constr(pattern=r'^(.*)$'), ToolMetadata] | None = None
    resource_metadata: dict[constr(pattern=r'^(.*)$'), ResourceMetadata] | None = None

class Limits(BaseModel):
    rate_limit_per_minute: int | None = None


class Discovery(BaseModel):
    include_deprecated: bool | None = None


class McpClientPolicy(BaseModel):
    description: str | None = None
    scopes: list[str] | None = None
    allowed_tools: list[str] | None = None
    denied_tools: list[str] | None = None
    allowed_resources: list[str] | None = None
    denied_resources: list[str] | None = None
    allowed_transports: (
        list[Literal['streamable_http', 'rest', 'sse', 'stdio']] | None
    ) = None
    limits: Limits | None = Field(
        None, description='Runtime-enforced rate and payload limits for an MCP client.'
    )
    discovery: Discovery | None = Field(
        None, description='Discovery preferences applied after auth-based filtering.'
    )
    owner_contact: str | None = None

class Limits(BaseModel):
    rate_limit_per_minute: int | None = None


class McpClientSelfResource(BaseModel):
    generated_at: AwareDatetime
    client: str
    description: str | None = None
    policy_version: str
    policy_checksum: str
    scopes: list[str]
    allowed_transports: list[Literal['streamable_http', 'rest', 'sse', 'stdio']]
    limits: Limits = Field(
        ..., description='Runtime-enforced rate and payload limits for an MCP client.'
    )
    owner_contact: str | None = None
    allowed_tools: int
    allowed_resources: int

class McpPolicyRisk(RootModel[Literal['low', 'moderate', 'high', 'critical']]):
    root: Literal['low', 'moderate', 'high', 'critical']

class McpResourcePolicyMetadata(BaseModel):
    required_scopes: list[str] | None = None
    audience: list[str] | None = None
    description: str | None = None

class McpToolPolicyMetadata(BaseModel):
    capability_id: str | None = None
    required_scopes: list[str] | None = None
    risk: Literal['low', 'moderate', 'high', 'critical'] | None = None
    audience: list[str] | None = None
    deprecated: bool | None = None

class McpTransport(RootModel[Literal['streamable_http', 'rest', 'sse', 'stdio']]):
    root: Literal['streamable_http', 'rest', 'sse', 'stdio']

class FieldRequestFeatures(BaseModel):
    task_type: Literal[
        'summarize',
        'draft',
        'review',
        'classify',
        'translate',
        'code',
        'reason',
        'retrieve',
        'compose',
        'other',
    ] = Field(
        ...,
        description='Canonical request-level task-type dimension (distinct from llm.TaskType model-routing taxonomy).',
    )
    language: str | None = Field(
        None, description='BCP-47 code (e.g. "en", "da", "de"). Defaults to "en".'
    )
    pii_present: bool | None = Field(
        None, description='Caller-asserted; PIIClassifier overrides.'
    )
    max_latency_ms: int | None = Field(
        None,
        description='Soft SLA ceiling; used by ResourceMarketAuctioneer.',
        ge=100,
        le=120000,
    )
    max_cost_usd: float | None = Field(
        None, description='Soft budget ceiling per request in USD.', ge=0.0
    )
    compliance_tier: Literal['public', 'internal', 'legal', 'health'] | None = Field(
        None,
        description='Data-handling compliance tier — drives crypto-shred + PII routing.',
    )
    reasoning_depth: int | None = Field(
        3, description='1 (shallow) .. 5 (deep chain-of-thought).', ge=1, le=5
    )
    domain: str | None = Field(
        None, description='Consulting domain ID (see @widgetdc/contracts/consulting).'
    )


class MrpRouteEnvelope(BaseModel):
    tool: str = Field(
        ...,
        description='MRP tool name in namespace.method format (e.g. "mrp.produce", "gdpr.erase").',
        pattern='^[a-z_]+\\.[a-z_]+$',
    )
    payload: dict[constr(pattern=r'^(.*)$'), Any] = Field(
        ...,
        description='Tool-specific payload; shape governed by the individual MRP contracts.',
    )
    intent: str | None = Field(
        None, description='Governance intent (required for write tools).'
    )
    evidence: str | None = Field(
        None, description='Governance evidence (required for write tools).'
    )
    field_trace_id: UUID | None = Field(None, alias='_trace_id')
    field_request_features: FieldRequestFeatures | None = Field(
        None,
        alias='_request_features',
        description='Normalised feature vector consumed by the 12-step intelligence interceptor.',
    )

class RequestFeatures(BaseModel):
    task_type: Literal[
        'summarize',
        'draft',
        'review',
        'classify',
        'translate',
        'code',
        'reason',
        'retrieve',
        'compose',
        'other',
    ] = Field(
        ...,
        description='Canonical request-level task-type dimension (distinct from llm.TaskType model-routing taxonomy).',
    )
    language: str | None = Field(
        None, description='BCP-47 code (e.g. "en", "da", "de"). Defaults to "en".'
    )
    pii_present: bool | None = Field(
        None, description='Caller-asserted; PIIClassifier overrides.'
    )
    max_latency_ms: int | None = Field(
        None,
        description='Soft SLA ceiling; used by ResourceMarketAuctioneer.',
        ge=100,
        le=120000,
    )
    max_cost_usd: float | None = Field(
        None, description='Soft budget ceiling per request in USD.', ge=0.0
    )
    compliance_tier: Literal['public', 'internal', 'legal', 'health'] | None = Field(
        None,
        description='Data-handling compliance tier — drives crypto-shred + PII routing.',
    )
    reasoning_depth: int | None = Field(
        3, description='1 (shallow) .. 5 (deep chain-of-thought).', ge=1, le=5
    )
    domain: str | None = Field(
        None, description='Consulting domain ID (see @widgetdc/contracts/consulting).'
    )

class RequestTaskType(
    RootModel[
        Literal[
            'summarize',
            'draft',
            'review',
            'classify',
            'translate',
            'code',
            'reason',
            'retrieve',
            'compose',
            'other',
        ]
    ]
):
    root: Literal[
        'summarize',
        'draft',
        'review',
        'classify',
        'translate',
        'code',
        'reason',
        'retrieve',
        'compose',
        'other',
    ] = Field(
        ...,
        description='Canonical request-level task-type dimension (distinct from llm.TaskType model-routing taxonomy).',
    )

class SpineEventBase(BaseModel):
    id: str
    type: str
    timestamp: AwareDatetime
    actor_id: str
    actor_type: Literal['agent', 'user', 'system', 'cron', 'operator']
    correlation_id: str
    parent_event_id: str | None = None
    tool_name: str | None = None
    plan_id: str | None = None
    workflow_id: str | None = None
    tenant_id: str | None = None
    risk_level: Literal['read_only', 'staged_write', 'production_write'] | None = None
    audit_category: (
        Literal[
            'graph_promotion',
            'memory_promotion',
            'data_read',
            'tool_invocation',
            'plan_lifecycle',
            'policy_decision',
            'external_call',
            'security_event',
        ]
        | None
    ) = None
    cost_tier: Literal['free', 'low', 'medium', 'high', 'premium'] | None = None
    outcome: Literal['success', 'failure', 'rejected', 'pending']
    error_class: str | None = None
    error_message: str | None = None
    payload: Any

class SpineEventType(
    RootModel[
        Literal[
            'tool_called',
            'tool_succeeded',
            'tool_failed',
            'tool_rejected',
            'governance_rejection',
            'policy_decision_made',
            'plan_created',
            'plan_approved',
            'plan_executed',
            'plan_evaluated',
            'graph_promotion_completed',
            'lineage_linked',
            'memory_promoted',
            'premium_escalation_used',
            'cost_budget_exceeded',
            'capability_canary_run',
            'policy_violation_detected',
            'token_telemetry_recorded',
            'trust_score_evaluated',
            'economic_proof_evaluated',
            'capital_ledger_entry_recorded',
        ]
    ]
):
    root: Literal[
        'tool_called',
        'tool_succeeded',
        'tool_failed',
        'tool_rejected',
        'governance_rejection',
        'policy_decision_made',
        'plan_created',
        'plan_approved',
        'plan_executed',
        'plan_evaluated',
        'graph_promotion_completed',
        'lineage_linked',
        'memory_promoted',
        'premium_escalation_used',
        'cost_budget_exceeded',
        'capability_canary_run',
        'policy_violation_detected',
        'token_telemetry_recorded',
        'trust_score_evaluated',
        'economic_proof_evaluated',
        'capital_ledger_entry_recorded',
    ]

class Context(BaseModel):
    actor_id: str
    actor_type: Literal['agent', 'user', 'system', 'cron', 'operator']
    correlation_id: str = Field(
        ..., description='Cross-service correlation id; required for replay/audit'
    )
    parent_event_id: str | None = None
    workflow_id: str | None = None
    plan_id: str | None = None
    approval_id: str | None = None
    tenant_id: str | None = None
    source_protocol: Literal[
        'rest',
        'mcp',
        'streamable',
        'openai',
        'websocket',
        'agent_chain',
        'scheduled_job',
        'internal',
    ]
    server_trusted: Literal[True]


class ToolInvocationEnvelope(BaseModel):
    tool: str
    payload: Any = Field(
        ..., description='Tool-specific business payload (typed at the tool level)'
    )
    context: Context = Field(
        ...,
        description='Server-trusted execution context. Carries actor identity, correlation, and source protocol so EventSpine and the gate can reason about who is calling and why. Client-supplied context.governance fields are rejected.',
    )

class Cost(BaseModel):
    cost_tier: Literal['free', 'low', 'medium', 'high', 'premium']
    units: float | None = None


class ToolResultEnvelope(BaseModel):
    tool: str
    result: Any
    correlation_id: str
    duration_ms: float | None = None
    cost: Cost | None = None
