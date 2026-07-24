"""
widgetdc_contracts.chat_contract_runtime — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/chat-contract-runtime/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, RootModel
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, RootModel, StrictInt
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, StrictInt
from pydantic import BaseModel, ConfigDict
from pydantic import BaseModel, ConfigDict, Field
from pydantic import BaseModel, ConfigDict, Field, RootModel
from pydantic import BaseModel, ConfigDict, Field, RootModel, StrictInt
from pydantic import BeforeValidator
from pydantic import Field, RootModel
from pydantic import RootModel
from typing import Annotated
from typing import Literal
import math

__all__ = ["ChatCitationIntegrity", "ChatClaimDraft", "ChatContractRuntimeBoundary", "ChatEvidenceItem", "ChatEvidencePack", "ChatEvidenceStatus", "ChatPolicyFlag", "ChatRenderHints", "ChatRouteMethod", "ChatRoutePlan", "ChatSourceSurface", "ChatToolRequest", "ChatVerificationReport", "WdcChatDraft", "WdcChatSession", "WdcChatSessionCreateRequest", "WdcChatSessionPage", "WdcChatSessionPatchRequest", "WdcChatSessionStatus", "WdcChatTurnRequest", "WdcChatTurnResult"]

def _normalize_json_integer(value: object) -> object:
    if isinstance(value, bool) or isinstance(value, str):
        raise ValueError('Input should be a JSON integer')
    if isinstance(value, float):
        if not math.isfinite(value) or not value.is_integer():
            raise ValueError('Input should be a finite JSON integer')
        return int(value)
    return value


JsonInteger = Annotated[StrictInt, BeforeValidator(_normalize_json_integer)]

class ChatCitationIntegrity(
    RootModel[Literal['verified', 'partial', 'missing', 'hallucinated']]
):
    root: Literal['verified', 'partial', 'missing', 'hallucinated']

class EvidenceId(RootModel[str]):
    root: str = Field(..., min_length=1)


class ChatClaimDraft(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    text: str = Field(..., min_length=1)
    evidence_ids: list[EvidenceId]
    support_status: Literal['supported', 'uncertain', 'unsupported']

class ChatContractRuntimeBoundary(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.chat_contract_runtime_boundary.v1']
    runtime_execution_allowed: Literal[False]
    graph_write_allowed: Literal[False]
    claim_promotion_allowed: Literal[False]
    eventspine_emit_mode: Literal['dry_run_only']

class ChatEvidenceItem(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    evidence_id: str = Field(..., min_length=1)
    source_ref: str = Field(
        ...,
        description='Opaque WDC-owned evidence reference; never a provider-supplied citation.',
        min_length=1,
    )
    citation_eligible: bool
    claim_support: Literal['direct', 'partial', 'contradicted', 'none']
    content_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')

class Item(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    evidence_id: str = Field(..., min_length=1)
    source_ref: str = Field(
        ...,
        description='Opaque WDC-owned evidence reference; never a provider-supplied citation.',
        min_length=1,
    )
    citation_eligible: bool
    claim_support: Literal['direct', 'partial', 'contradicted', 'none']
    content_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')


class ChatEvidencePack(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.chat_evidence_pack.v1']
    evidence_pack_id: str = Field(..., min_length=1)
    turn_id: str = Field(..., min_length=1)
    route_id: str = Field(..., min_length=1)
    evidence_status: Literal['available', 'partial', 'unavailable']
    items: list[Item]
    missing_evidence: list[str]
    contradiction_refs: list[str]
    created_at: AwareDatetime

class ChatEvidenceStatus(RootModel[Literal['available', 'partial', 'unavailable']]):
    root: Literal['available', 'partial', 'unavailable']

class ChatPolicyFlag(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    code: str = Field(..., min_length=1)
    severity: Literal['info', 'warning', 'blocking']

class ChatRenderHints(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    format: Literal['html', 'markdown', 'json', 'pptx', 'docx', 'text'] = Field(
        ..., description='Wire format of the produced content.'
    )
    response_length: Literal['short', 'standard', 'detailed'] | None = None
    locale: str | None = Field(None, min_length=1)

class ChatRouteMethod(
    RootModel[Literal['RAG', 'Folding', 'RLM', 'MCP', 'LLM', 'HumanReview']]
):
    root: Literal['RAG', 'Folding', 'RLM', 'MCP', 'LLM', 'HumanReview']

class BomItemId(RootModel[str]):
    root: str = Field(..., min_length=1)


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


class PolicyDecision(BaseModel):
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


class ChatRoutePlan(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.chat_route_plan.v1']
    route_id: str = Field(..., min_length=1)
    turn_id: str = Field(..., min_length=1)
    method_sequence: list[
        Literal['RAG', 'Folding', 'RLM', 'MCP', 'LLM', 'HumanReview']
    ] = Field(..., min_length=1)
    provider_task: str = Field(..., min_length=1)
    risk_level: Literal['read_only', 'staged_write', 'production_write']
    evidence_required: bool
    fold_required: bool
    bom_item_ids: list[BomItemId] | None = None
    governance_context: GovernanceContext = Field(
        ...,
        description='Server-trusted execution context. Carries actor identity, correlation, and source protocol so EventSpine and the gate can reason about who is calling and why. Client-supplied context.governance fields are rejected.',
    )
    policy_decision: PolicyDecision | None = Field(
        None,
        description='Decision returned by the gate. allowed=true means proceed; allowed=false with code+reason explains the rejection class. policy_bundle_digest + policy_version pin the decision to a specific signed policy bundle.',
    )
    route_status: Literal['candidate', 'accepted', 'rejected']
    created_at: AwareDatetime

class ChatSourceSurface(
    RootModel[Literal['chat_ui', 'wdc_cli', 'mcp_app', 'desktop_connector', 'api']]
):
    root: Literal['chat_ui', 'wdc_cli', 'mcp_app', 'desktop_connector', 'api']

class ChatToolRequest(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    tool: str = Field(..., min_length=1)
    payload_ref: str | None = Field(None, min_length=1)
    requested_risk_level: Literal['read_only', 'staged_write', 'production_write']

class UnsupportedClaimIndex(RootModel[int]):
    root: int = Field(..., ge=0)


class AllowedToolRequestIndex(RootModel[int]):
    root: int = Field(..., ge=0)


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


class PolicyDecision(BaseModel):
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


class ChatVerificationReport(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    report_id: str = Field(..., min_length=1)
    status: Literal['passed', 'repair_required', 'rejected']
    verifier_id: str = Field(..., min_length=1)
    evidence_status: Literal['available', 'partial', 'unavailable']
    citation_integrity: Literal['verified', 'partial', 'missing', 'hallucinated']
    unsupported_claim_indexes: list[UnsupportedClaimIndex]
    allowed_tool_request_indexes: list[AllowedToolRequestIndex]
    policy_decision: PolicyDecision | None = Field(
        None,
        description='Decision returned by the gate. allowed=true means proceed; allowed=false with code+reason explains the rejection class. policy_bundle_digest + policy_version pin the decision to a specific signed policy bundle.',
    )
    repair_attempts: int = Field(..., ge=0, le=1)
    created_at: AwareDatetime

class EvidenceId(RootModel[str]):
    root: str = Field(..., min_length=1)


class Claim(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    text: str = Field(..., min_length=1)
    evidence_ids: list[EvidenceId]
    support_status: Literal['supported', 'uncertain', 'unsupported']


class CitationId(RootModel[str]):
    root: str = Field(..., min_length=1)


class ToolRequest(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    tool: str = Field(..., min_length=1)
    payload_ref: str | None = Field(None, min_length=1)
    requested_risk_level: Literal['read_only', 'staged_write', 'production_write']


class PolicyFlag(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    code: str = Field(..., min_length=1)
    severity: Literal['info', 'warning', 'blocking']


class RenderHints(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    format: Literal['html', 'markdown', 'json', 'pptx', 'docx', 'text'] = Field(
        ..., description='Wire format of the produced content.'
    )
    response_length: Literal['short', 'standard', 'detailed'] | None = None
    locale: str | None = Field(None, min_length=1)


class WdcChatDraft(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.chat_draft.v1']
    draft_id: str = Field(..., min_length=1)
    turn_id: str = Field(..., min_length=1)
    route_id: str = Field(..., min_length=1)
    provider_id: str = Field(..., min_length=1)
    model_id: str | None = Field(None, min_length=1)
    answer: str
    claims: list[Claim]
    citation_ids: list[CitationId]
    citation_integrity: Literal['verified', 'partial', 'missing', 'hallucinated']
    uncertainty: Literal['none', 'low', 'medium', 'high']
    tool_requests: list[ToolRequest]
    policy_flags: list[PolicyFlag]
    render_hints: RenderHints
    created_at: AwareDatetime

class WdcChatSession(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.chat_session.v1']
    session_id: str = Field(
        ...,
        description='Opaque backend-assigned session identifier.',
        max_length=200,
        min_length=1,
    )
    title: str = Field(..., max_length=200, min_length=1)
    status: Literal['active', 'archived'] = Field(
        ..., description='Public lifecycle state for a backend-owned WDC Chat session.'
    )
    version: JsonInteger = Field(..., ge=1, le=9007199254740991)
    created_at: AwareDatetime
    updated_at: AwareDatetime

class WdcChatSessionCreateRequest(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.chat_session_create_request.v1']
    title: str = Field(..., max_length=200, min_length=1)

class NextCursor(RootModel[str]):
    root: str = Field(..., max_length=2048, min_length=1)


class WdcChatSessionPage(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.chat_session_page.v1']
    items: list[WdcChatSession] = Field(..., max_length=100)
    next_cursor: NextCursor | None

class WdcChatSessionPatchRequest1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.chat_session_patch_request.v1']
    expected_version: JsonInteger = Field(..., ge=1, le=9007199254740991)
    title: str = Field(..., max_length=200, min_length=1)


class WdcChatSessionPatchRequest2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.chat_session_patch_request.v1']
    expected_version: JsonInteger = Field(..., ge=1, le=9007199254740991)
    status: Literal['archived']


class WdcChatSessionPatchRequest3(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.chat_session_patch_request.v1']
    expected_version: JsonInteger = Field(..., ge=1, le=9007199254740991)
    title: str = Field(..., max_length=200, min_length=1)
    status: Literal['archived']


class WdcChatSessionPatchRequest(
    RootModel[
        WdcChatSessionPatchRequest1
        | WdcChatSessionPatchRequest2
        | WdcChatSessionPatchRequest3
    ]
):
    root: (
        WdcChatSessionPatchRequest1
        | WdcChatSessionPatchRequest2
        | WdcChatSessionPatchRequest3
    ) = Field(
        ...,
        description='Optimistic-concurrency patch for rename and/or one-way archival. At least one mutable field is required.',
    )

class WdcChatSessionStatus(RootModel[Literal['active', 'archived']]):
    root: Literal['active', 'archived'] = Field(
        ..., description='Public lifecycle state for a backend-owned WDC Chat session.'
    )

class AttachmentRef(RootModel[str]):
    root: str = Field(..., min_length=1)


class ContextRef(RootModel[str]):
    root: str = Field(..., min_length=1)


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


class WdcChatTurnRequest(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.chat_turn_request.v1']
    turn_id: str = Field(..., min_length=1)
    session_id: str = Field(..., min_length=1)
    source_surface: Literal['chat_ui', 'wdc_cli', 'mcp_app', 'desktop_connector', 'api']
    message: str = Field(..., min_length=1)
    locale: str | None = Field(None, min_length=1)
    attachment_refs: list[AttachmentRef] | None = None
    context_refs: list[ContextRef] | None = None
    request_features: RequestFeatures | None = Field(
        None,
        description='Normalised feature vector consumed by the 12-step intelligence interceptor.',
    )
    created_at: AwareDatetime

class UnsupportedClaimIndex(RootModel[int]):
    root: int = Field(..., ge=0)


class AllowedToolRequestIndex(RootModel[int]):
    root: int = Field(..., ge=0)


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


class PolicyDecision(BaseModel):
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


class Verification(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    report_id: str = Field(..., min_length=1)
    status: Literal['passed', 'repair_required', 'rejected']
    verifier_id: str = Field(..., min_length=1)
    evidence_status: Literal['available', 'partial', 'unavailable']
    citation_integrity: Literal['verified', 'partial', 'missing', 'hallucinated']
    unsupported_claim_indexes: list[UnsupportedClaimIndex]
    allowed_tool_request_indexes: list[AllowedToolRequestIndex]
    policy_decision: PolicyDecision | None = Field(
        None,
        description='Decision returned by the gate. allowed=true means proceed; allowed=false with code+reason explains the rejection class. policy_bundle_digest + policy_version pin the decision to a specific signed policy bundle.',
    )
    repair_attempts: int = Field(..., ge=0, le=1)
    created_at: AwareDatetime


class Citation(RootModel[str]):
    root: str = Field(..., min_length=1)


class WdcChatTurnResult(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.chat_turn_result.v1']
    turn_id: str = Field(..., min_length=1)
    route_id: str = Field(..., min_length=1)
    draft_id: str = Field(..., min_length=1)
    content: str
    format: Literal['html', 'markdown', 'json', 'pptx', 'docx', 'text'] = Field(
        ..., description='Wire format of the produced content.'
    )
    evidence_status: Literal['available', 'partial', 'unavailable']
    citation_integrity: Literal['verified', 'partial', 'missing', 'hallucinated']
    verification: Verification = Field(
        ...,
        description='WDC verifier outcome for a structured chat draft. A repair loop is bounded to one attempt; a rejected draft must degrade safely.',
    )
    citations: list[Citation]
    created_at: AwareDatetime
