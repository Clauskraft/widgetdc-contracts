"""
widgetdc_contracts.orchestrator — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/orchestrator/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, Field
from pydantic import AwareDatetime, BaseModel, Field, constr
from pydantic import BaseModel, Field
from pydantic import Field, RootModel
from typing import Any, Literal
from typing import Literal
from uuid import UUID

__all__ = ["AgentCapability", "AgentHandshake", "AgentHandshakeStatus", "AgentId", "AgentMessage", "AgentMessageSource", "AgentMessageType", "AgentTrustProfile", "AgentWorkflowEnvelope", "OrchestratorTaskDomain", "OrchestratorToolCall", "OrchestratorToolResult", "OrchestratorToolStatus", "RoutingCapability", "RoutingDecision", "RoutingIntent", "ScopeOwner", "ScorecardDimension", "ScorecardEntry", "ScorecardMetricStatus", "StoredMessage", "TelemetryEntry", "TelemetryOutcome", "TelemetryPhase", "TrustEvidenceSource", "WorkflowPhase", "WorkflowType"]

class AgentCapability(
    RootModel[
        Literal[
            'graph_read',
            'graph_write',
            'mcp_tools',
            'cognitive_reasoning',
            'document_generation',
            'osint',
            'code_execution',
            'ingestion',
            'git_operations',
            'audit',
        ]
    ]
):
    root: Literal[
        'graph_read',
        'graph_write',
        'mcp_tools',
        'cognitive_reasoning',
        'document_generation',
        'osint',
        'code_execution',
        'ingestion',
        'git_operations',
        'audit',
    ] = Field(
        ..., description='Capability flags declaring what an agent is authorized to do'
    )

class AgentHandshake(BaseModel):
    agent_id: str = Field(
        ...,
        description='Canonical agent identifier (e.g. CAPTAIN_CLAUDE, GEMINI_ARCHITECT)',
    )
    display_name: str = Field(
        ...,
        description='Human-readable display name (e.g. "Consulting Frontend", "Captain Claude")',
    )
    source: (
        Literal[
            'claude',
            'gemini',
            'deepseek',
            'grok',
            'rlm',
            'user',
            'system',
            'orchestrator',
        ]
        | str
    ) = Field(
        ...,
        description='Technical source identifier (e.g. "claude", "browser", "custom-agent")',
    )
    version: str | None = Field(
        None,
        description='Agent version string (e.g. "claude-sonnet-4-5", "gemini-2.0-flash")',
    )
    status: Literal['online', 'standby', 'offline', 'degraded'] = Field(
        ..., description='Agent availability status'
    )
    capabilities: list[
        Literal[
            'graph_read',
            'graph_write',
            'mcp_tools',
            'cognitive_reasoning',
            'document_generation',
            'osint',
            'code_execution',
            'ingestion',
            'git_operations',
            'audit',
        ]
        | str
    ] = Field(
        ...,
        description='List of capabilities this agent is authorized to use (known + domain-specific)',
        min_length=0,
    )
    allowed_tool_namespaces: list[str] = Field(
        ...,
        description='MCP tool namespaces this agent may invoke (e.g. ["graph", "audit"])',
    )
    max_concurrent_calls: int | None = Field(5, ge=1, le=20)
    default_thread: str | None = Field(
        None, description='Default Notion Global Chat thread for this agent'
    )
    registered_at: AwareDatetime | None = None
    last_seen_at: AwareDatetime | None = None

class AgentHandshakeStatus(
    RootModel[Literal['online', 'standby', 'offline', 'degraded']]
):
    root: Literal['online', 'standby', 'offline', 'degraded'] = Field(
        ..., description='Agent availability status'
    )

class AgentId(
    RootModel[
        Literal[
            'Claude',
            'Gemini',
            'DeepSeek',
            'Grok',
            'RLM',
            'User',
            'System',
            'Orchestrator',
        ]
    ]
):
    root: Literal[
        'Claude', 'Gemini', 'DeepSeek', 'Grok', 'RLM', 'User', 'System', 'Orchestrator'
    ] = Field(
        ...,
        description='Canonical agent identifiers matching Notion Global Chat From/To schema',
    )

class File(BaseModel):
    name: str
    size: float
    type: str


class AgentMessage(BaseModel):
    message_id: str | None = Field(
        None, description='Unique message identifier (assigned by storage layer)'
    )
    from_: (
        Literal[
            'Claude',
            'Gemini',
            'DeepSeek',
            'Grok',
            'RLM',
            'User',
            'System',
            'Orchestrator',
        ]
        | str
    ) = Field(..., alias='from', description='Sender agent ID')
    to: (
        Literal[
            'Claude',
            'Gemini',
            'DeepSeek',
            'Grok',
            'RLM',
            'User',
            'System',
            'Orchestrator',
        ]
        | Literal['All']
        | str
    ) = Field(..., description='Target recipient or All for broadcast')
    source: (
        Literal[
            'claude',
            'gemini',
            'deepseek',
            'grok',
            'rlm',
            'user',
            'system',
            'orchestrator',
        ]
        | str
    ) = Field(..., description='Technical source identifier (e.g. "claude", "browser")')
    thread: str | None = Field(
        None,
        description='Thread ID for grouping related messages (e.g. "widgetdc-sprint-march26")',
    )
    type: Literal['Message', 'Command', 'Answer', 'Handover', 'Alert', 'ToolResult'] = (
        Field(..., description='Classification of the message purpose')
    )
    message: str = Field(
        ..., description='Message text content (markdown supported)', min_length=1
    )
    call_id: str | None = Field(
        None,
        description='Links this message to a specific tool call (for ToolResult messages)',
    )
    id: str | None = Field(
        None,
        description='Storage-layer assigned message ID (e.g. UUID or Redis-generated)',
    )
    thread_id: str | None = Field(
        None, description='Thread ID for grouping related messages'
    )
    parent_id: str | None = Field(
        None, description='ID of the message this is a direct reply to'
    )
    files: list[File] | None = Field(
        None, description='File attachments on this message'
    )
    metadata: dict[constr(pattern=r'^(.*)$'), Any] | None = Field(
        None,
        description='Extensible metadata (e.g. provider, model, duration_ms, conversation_id)',
    )
    timestamp: AwareDatetime | None = Field(
        None, description='When this message was created'
    )

class AgentMessageSource(
    RootModel[
        Literal[
            'claude',
            'gemini',
            'deepseek',
            'grok',
            'rlm',
            'user',
            'system',
            'orchestrator',
        ]
    ]
):
    root: Literal[
        'claude', 'gemini', 'deepseek', 'grok', 'rlm', 'user', 'system', 'orchestrator'
    ] = Field(..., description='Lowercase source identifier for technical routing')

class AgentMessageType(
    RootModel[
        Literal['Message', 'Command', 'Answer', 'Handover', 'Alert', 'ToolResult']
    ]
):
    root: Literal['Message', 'Command', 'Answer', 'Handover', 'Alert', 'ToolResult'] = (
        Field(..., description='Classification of the message purpose')
    )

class AgentTrustProfile(BaseModel):
    agent_id: (
        Literal[
            'Claude',
            'Gemini',
            'DeepSeek',
            'Grok',
            'RLM',
            'User',
            'System',
            'Orchestrator',
        ]
        | str
    ) = Field(..., description='Canonical agent identifier or scoped runtime agent ID.')
    task_domain: Literal[
        'intake', 'decomposition', 'recommendation', 'learning', 'routing', 'audit'
    ] = Field(
        ...,
        description='Narrow task domains used by the orchestrator trust model and scorecard mapping.',
    )
    success_count: int = Field(
        ..., description='Verified successful outcomes in this domain.', ge=0
    )
    fail_count: int = Field(
        ..., description='Verified failed outcomes in this domain.', ge=0
    )
    bayesian_score: float = Field(
        ...,
        description='Bayesian trust score derived from verified runtime evidence.',
        ge=0.0,
        le=1.0,
    )
    prior_weight: float = Field(
        ..., description='Weight of the prior used for Bayesian smoothing.', ge=0.0
    )
    default_prior_score: float = Field(
        ...,
        description='Configured prior score before domain-specific evidence accumulates.',
        ge=0.0,
        le=1.0,
    )
    evidence_source: Literal[
        'decision_quality_scorecard',
        'monitoring_audit_log',
        'operator_feedback',
        'runtime_readback',
    ] = Field(
        ...,
        description='Canonical evidence sources allowed to influence routing trust.',
    )
    scorecard_dimension: Literal[
        'prioritization_quality',
        'decomposition_quality',
        'promotion_precision',
        'decision_stability',
        'operator_acceptance',
    ] = Field(
        ...,
        description='Primary scorecard dimension this trust profile is intended to improve.',
    )
    scope_owner: Literal['widgetdc-orchestrator', 'widgetdc-librechat', 'snout'] = (
        Field(
            ...,
            description='Approved runtime owner/consumer scope for this trust profile.',
        )
    )
    last_verified_at: AwareDatetime = Field(
        ..., description='Latest runtime verification timestamp for this trust profile.'
    )

class AgentWorkflowEnvelope(BaseModel):
    workflow_id: str = Field(
        ..., description='Stable workflow identifier for orchestration lineage.'
    )
    workflow_type: Literal['research', 'delivery', 'audit', 'debate'] = Field(
        ..., description='Workflow families allowed for the scoped orchestration layer.'
    )
    current_phase: Literal['discover', 'define', 'develop', 'deliver'] = Field(
        ...,
        description='Canonical orchestration phases, narrowed for orchestrator/librechat/snout usage only.',
    )
    participants: list[
        Literal[
            'Claude',
            'Gemini',
            'DeepSeek',
            'Grok',
            'RLM',
            'User',
            'System',
            'Orchestrator',
        ]
        | str
    ] = Field(
        ...,
        description='Participants involved in the current workflow envelope.',
        min_length=1,
    )
    primary_surface: Literal['widgetdc-orchestrator', 'widgetdc-librechat', 'snout'] = (
        Field(
            ...,
            description='Primary consumer/runtime that owns this workflow envelope.',
        )
    )
    flow_ref: Literal['core-flow-1', 'core-flow-2', 'core-flow-3'] = Field(
        ..., description='Canonical LIN-165 flow strengthened by this workflow.'
    )
    scorecard_ref: str = Field(
        ...,
        description='Reference to the decision-quality scorecard batch or evidence packet.',
    )
    reasoning_lineage_visible: bool = Field(
        ...,
        description='Whether the workflow lineage may be surfaced in LibreChat or other approved consumers.',
    )
    quorum_consensus: bool | None = Field(
        None,
        description='Set when a workflow requires explicit agreement before progressing.',
    )
    started_at: AwareDatetime = Field(..., description='Workflow start timestamp.')
    updated_at: AwareDatetime = Field(
        ..., description='Last workflow state update timestamp.'
    )

class OrchestratorTaskDomain(
    RootModel[
        Literal[
            'intake', 'decomposition', 'recommendation', 'learning', 'routing', 'audit'
        ]
    ]
):
    root: Literal[
        'intake', 'decomposition', 'recommendation', 'learning', 'routing', 'audit'
    ] = Field(
        ...,
        description='Narrow task domains used by the orchestrator trust model and scorecard mapping.',
    )

class OrchestratorToolCall(BaseModel):
    call_id: UUID = Field(
        ..., description='Unique ID for this tool call (agent-generated UUID)'
    )
    agent_id: str = Field(
        ...,
        description='Canonical agent ID (e.g. CAPTAIN_CLAUDE, GEMINI_ARCHITECT, RLM_ENGINE)',
    )
    tool_name: str = Field(
        ...,
        description='MCP tool name in namespace.method format',
        pattern='^[a-z_]+\\.[a-z_]+$',
    )
    arguments: dict[constr(pattern=r'^(.*)$'), Any] = Field(
        ..., description='Tool-specific arguments (passed as payload to MCP route)'
    )
    trace_id: UUID | None = None
    priority: Literal['low', 'normal', 'high', 'critical'] | None = 'normal'
    timeout_ms: int | None = Field(30000, ge=500, le=120000)
    emitted_at: AwareDatetime | None = None

class OrchestratorToolResult(BaseModel):
    call_id: UUID = Field(
        ..., description='Mirrors the call_id from the originating OrchestratorToolCall'
    )
    status: Literal['success', 'error', 'timeout', 'rate_limited', 'unauthorized'] = (
        Field(..., description='Outcome status of an Orchestrator tool call')
    )
    result: Any = Field(
        ..., description='Parsed tool output — whatever the MCP tool returned'
    )
    error_message: str | None = None
    error_code: (
        Literal[
            'TOOL_NOT_FOUND',
            'VALIDATION_ERROR',
            'BACKEND_ERROR',
            'TIMEOUT',
            'RATE_LIMITED',
            'UNAUTHORIZED',
            'SSE_PARSE_ERROR',
        ]
        | None
    ) = None
    duration_ms: float | None = Field(None, ge=0.0)
    trace_id: str | None = None
    completed_at: AwareDatetime | None = None

class OrchestratorToolStatus(
    RootModel[Literal['success', 'error', 'timeout', 'rate_limited', 'unauthorized']]
):
    root: Literal['success', 'error', 'timeout', 'rate_limited', 'unauthorized'] = (
        Field(..., description='Outcome status of an Orchestrator tool call')
    )

class RoutingCapability(
    RootModel[
        Literal[
            'engagement_intake',
            'guided_decomposition',
            'verified_recommendation',
            'learning_feedback',
            'workflow_audit',
        ]
    ]
):
    root: Literal[
        'engagement_intake',
        'guided_decomposition',
        'verified_recommendation',
        'learning_feedback',
        'workflow_audit',
    ] = Field(
        ...,
        description='Capabilities the orchestrator may route within the active LIN-165 wedge.',
    )

class Intent(BaseModel):
    intent_id: str = Field(
        ..., description='Stable intent identifier for routing and lineage.'
    )
    capability: Literal[
        'engagement_intake',
        'guided_decomposition',
        'verified_recommendation',
        'learning_feedback',
        'workflow_audit',
    ] = Field(
        ...,
        description='Capabilities the orchestrator may route within the active LIN-165 wedge.',
    )
    task_domain: Literal[
        'intake', 'decomposition', 'recommendation', 'learning', 'audit'
    ] = Field(
        ..., description='Execution domain for scorecard and trust-model mapping.'
    )
    flow_ref: Literal['core-flow-1', 'core-flow-2', 'core-flow-3'] = Field(
        ..., description='Canonical LIN-165 flow this intent strengthens.'
    )
    route_scope: list[
        Literal['widgetdc-orchestrator', 'widgetdc-librechat', 'snout']
    ] = Field(
        ...,
        description='Only approved consumers for this routing intent.',
        min_length=1,
    )
    operator_visible: bool = Field(
        ..., description='Whether this intent may be surfaced in LibreChat lineage UI.'
    )
    scorecard_dimensions: list[
        Literal[
            'prioritization_quality',
            'decomposition_quality',
            'promotion_precision',
            'decision_stability',
            'operator_acceptance',
            'time_to_verified_decision',
            'tri_source_arbitration_divergence',
        ]
    ] = Field(
        ...,
        description='Decision-quality dimensions this routing intent is expected to affect.',
        min_length=1,
    )


class RoutingDecision(BaseModel):
    decision_id: str = Field(
        ...,
        description='Stable routing decision identifier for runtime lineage and read-back.',
    )
    intent: Intent = Field(
        ...,
        description='Canonical routing intent used by the orchestrator to classify and constrain work within the active WidgeTDC wedge.',
    )
    selected_agent_id: (
        Literal[
            'Claude',
            'Gemini',
            'DeepSeek',
            'Grok',
            'RLM',
            'User',
            'System',
            'Orchestrator',
        ]
        | str
    ) = Field(
        ...,
        description='Selected agent or runtime agent ID chosen by the orchestrator.',
    )
    selected_capability: Literal[
        'engagement_intake',
        'guided_decomposition',
        'verified_recommendation',
        'learning_feedback',
        'workflow_audit',
    ] = Field(
        ...,
        description='Capabilities the orchestrator may route within the active LIN-165 wedge.',
    )
    trust_score: float = Field(
        ...,
        description='Trust score that justified the selected route.',
        ge=0.0,
        le=1.0,
    )
    reason_code: Literal[
        'TRUST_WIN',
        'COST_TIER_MATCH',
        'FLOW_SPECIALIZATION',
        'FALLBACK_ROUTE',
        'WAIVER_ROUTE',
    ] = Field(..., description='Why this route was selected.')
    evidence_refs: list[str] = Field(
        ...,
        description='References to trust, scorecard, or runtime evidence used during routing.',
        min_length=1,
    )
    waiver_reason: str | None = Field(
        None,
        description='Required when fallback or waiver routing is used instead of the ideal route.',
    )
    decided_at: AwareDatetime = Field(
        ..., description='Timestamp when the routing decision was made.'
    )

class RoutingIntent(BaseModel):
    intent_id: str = Field(
        ..., description='Stable intent identifier for routing and lineage.'
    )
    capability: Literal[
        'engagement_intake',
        'guided_decomposition',
        'verified_recommendation',
        'learning_feedback',
        'workflow_audit',
    ] = Field(
        ...,
        description='Capabilities the orchestrator may route within the active LIN-165 wedge.',
    )
    task_domain: Literal[
        'intake', 'decomposition', 'recommendation', 'learning', 'audit'
    ] = Field(
        ..., description='Execution domain for scorecard and trust-model mapping.'
    )
    flow_ref: Literal['core-flow-1', 'core-flow-2', 'core-flow-3'] = Field(
        ..., description='Canonical LIN-165 flow this intent strengthens.'
    )
    route_scope: list[
        Literal['widgetdc-orchestrator', 'widgetdc-librechat', 'snout']
    ] = Field(
        ...,
        description='Only approved consumers for this routing intent.',
        min_length=1,
    )
    operator_visible: bool = Field(
        ..., description='Whether this intent may be surfaced in LibreChat lineage UI.'
    )
    scorecard_dimensions: list[
        Literal[
            'prioritization_quality',
            'decomposition_quality',
            'promotion_precision',
            'decision_stability',
            'operator_acceptance',
            'time_to_verified_decision',
            'tri_source_arbitration_divergence',
        ]
    ] = Field(
        ...,
        description='Decision-quality dimensions this routing intent is expected to affect.',
        min_length=1,
    )

class ScopeOwner(
    RootModel[Literal['widgetdc-orchestrator', 'widgetdc-librechat', 'snout']]
):
    root: Literal['widgetdc-orchestrator', 'widgetdc-librechat', 'snout'] = Field(
        ...,
        description='Approved runtime owner or consumer scope for routing and trust contracts.',
    )

class ScorecardDimension(
    RootModel[
        Literal[
            'prioritization_quality',
            'decomposition_quality',
            'promotion_precision',
            'decision_stability',
            'operator_acceptance',
            'normalization_quality',
            'arbitration_confidence',
            'time_to_verified_decision',
            'tri_source_arbitration_divergence',
        ]
    ]
):
    root: Literal[
        'prioritization_quality',
        'decomposition_quality',
        'promotion_precision',
        'decision_stability',
        'operator_acceptance',
        'normalization_quality',
        'arbitration_confidence',
        'time_to_verified_decision',
        'tri_source_arbitration_divergence',
    ] = Field(
        ...,
        description='Canonical decision-quality dimensions approved for trust mapping and scorecard entries.',
    )

class TrustProfile(BaseModel):
    agent_persona: Literal[
        'RESEARCHER',
        'ENGINEER',
        'CUSTODIAN',
        'ARCHITECT',
        'SENTINEL',
        'ARCHIVIST',
        'HARVESTER',
        'ANALYST',
        'INTEGRATOR',
        'TESTER',
    ] = Field(..., description='RLM Engine agent persona')
    agent_id: (
        Literal[
            'Claude',
            'Gemini',
            'DeepSeek',
            'Grok',
            'RLM',
            'User',
            'System',
            'Orchestrator',
        ]
        | str
        | None
    ) = Field(
        None,
        description='Legacy chat/runtime agent identifier. Optional because trust is anchored on persona, not provider.',
    )
    runtime_identity: str | None = Field(
        None,
        description='Scoped runtime identity for a concrete worker, session, or delegated specialist.',
        min_length=1,
    )
    provider_source: str | None = Field(
        None,
        description='Observed provider source for telemetry correlation only. Must not be used as the trust identity.',
        min_length=1,
    )
    task_domain: Literal[
        'intake', 'decomposition', 'recommendation', 'learning', 'routing', 'audit'
    ] = Field(
        ...,
        description='Narrow task domains used by the orchestrator trust model and scorecard mapping.',
    )
    success_count: int = Field(
        ..., description='Verified successful outcomes in this domain.', ge=0
    )
    fail_count: int = Field(
        ..., description='Verified failed outcomes in this domain.', ge=0
    )
    bayesian_score: float = Field(
        ...,
        description='Bayesian trust score derived from verified runtime evidence.',
        ge=0.0,
        le=1.0,
    )
    prior_weight: float = Field(
        ..., description='Weight of the prior used for Bayesian smoothing.', ge=0.0
    )
    default_prior_score: float = Field(
        ...,
        description='Configured prior score before domain-specific evidence accumulates.',
        ge=0.0,
        le=1.0,
    )
    evidence_source: Literal[
        'decision_quality_scorecard',
        'monitoring_audit_log',
        'operator_feedback',
        'runtime_readback',
    ] = Field(
        ...,
        description='Canonical evidence sources allowed to influence routing trust.',
    )
    scorecard_dimension: Literal[
        'prioritization_quality',
        'decomposition_quality',
        'promotion_precision',
        'decision_stability',
        'operator_acceptance',
        'normalization_quality',
        'arbitration_confidence',
        'time_to_verified_decision',
        'tri_source_arbitration_divergence',
    ] = Field(
        ...,
        description='Canonical decision-quality dimensions approved for trust mapping and scorecard entries.',
    )
    scope_owner: Literal['widgetdc-orchestrator', 'widgetdc-librechat', 'snout'] = (
        Field(
            ...,
            description='Approved runtime owner or consumer scope for routing and trust contracts.',
        )
    )
    last_verified_at: AwareDatetime = Field(
        ..., description='Latest runtime verification timestamp for this trust profile.'
    )


class ScorecardEntry(BaseModel):
    entry_id: str = Field(
        ...,
        description='Stable scorecard entry identifier for a batch, case, or evaluation window.',
        min_length=1,
    )
    recorded_at: AwareDatetime = Field(
        ..., description='Timestamp when the scorecard entry was recorded.'
    )
    task_domain: Literal[
        'intake', 'decomposition', 'recommendation', 'learning', 'routing', 'audit'
    ] = Field(
        ...,
        description='Narrow task domains used by the orchestrator trust model and scorecard mapping.',
    )
    scope_owner: Literal['widgetdc-orchestrator', 'widgetdc-librechat', 'snout'] = (
        Field(
            ...,
            description='Approved runtime owner or consumer scope for routing and trust contracts.',
        )
    )
    dimension: Literal[
        'prioritization_quality',
        'decomposition_quality',
        'promotion_precision',
        'decision_stability',
        'operator_acceptance',
        'normalization_quality',
        'arbitration_confidence',
        'time_to_verified_decision',
        'tri_source_arbitration_divergence',
    ] = Field(
        ...,
        description='Canonical decision-quality dimensions approved for trust mapping and scorecard entries.',
    )
    metric_name: str = Field(
        ...,
        description='Human-readable metric label, e.g. Normalization Quality.',
        min_length=1,
    )
    metric_value: float = Field(..., description='Observed metric value.')
    target_value: float | None = Field(
        None, description='Target metric value for comparison.'
    )
    status: Literal['pass', 'warn', 'fail', 'pending'] = Field(
        ..., description='Evaluation status for a scorecard metric.'
    )
    confidence: float = Field(
        ..., description='Confidence in the metric evaluation.', ge=0.0, le=1.0
    )
    sample_size: int = Field(
        ..., description='Number of observations underlying the metric.', ge=0
    )
    evidence_refs: list[str] = Field(
        ...,
        description='References to runtime, Linear, docs, or graph evidence.',
        min_length=1,
    )
    trust_profile: TrustProfile | None = Field(
        None,
        description='Minimal orchestrator trust profile. Persona is the primary identity; provider identifiers are telemetry-only correlation metadata.',
    )
    notes: str | None = Field(
        None, description='Short explanatory note for operators or audits.'
    )

class ScorecardMetricStatus(RootModel[Literal['pass', 'warn', 'fail', 'pending']]):
    root: Literal['pass', 'warn', 'fail', 'pending'] = Field(
        ..., description='Evaluation status for a scorecard metric.'
    )

class File(BaseModel):
    name: str
    size: float
    type: str


class StoredMessage(BaseModel):
    message_id: str | None = Field(
        None, description='Unique message identifier (assigned by storage layer)'
    )
    from_: (
        Literal[
            'Claude',
            'Gemini',
            'DeepSeek',
            'Grok',
            'RLM',
            'User',
            'System',
            'Orchestrator',
        ]
        | str
    ) = Field(..., alias='from', description='Sender agent ID')
    to: (
        Literal[
            'Claude',
            'Gemini',
            'DeepSeek',
            'Grok',
            'RLM',
            'User',
            'System',
            'Orchestrator',
        ]
        | Literal['All']
        | str
    ) = Field(..., description='Target recipient or All for broadcast')
    source: (
        Literal[
            'claude',
            'gemini',
            'deepseek',
            'grok',
            'rlm',
            'user',
            'system',
            'orchestrator',
        ]
        | str
    ) = Field(..., description='Technical source identifier (e.g. "claude", "browser")')
    thread: str | None = Field(
        None,
        description='Thread ID for grouping related messages (e.g. "widgetdc-sprint-march26")',
    )
    type: Literal['Message', 'Command', 'Answer', 'Handover', 'Alert', 'ToolResult'] = (
        Field(..., description='Classification of the message purpose')
    )
    message: str = Field(
        ..., description='Message text content (markdown supported)', min_length=1
    )
    call_id: str | None = Field(
        None,
        description='Links this message to a specific tool call (for ToolResult messages)',
    )
    id: str = Field(..., description='Storage-assigned message ID')
    thread_id: str | None = Field(
        None, description='Thread ID for grouping related messages'
    )
    parent_id: str | None = Field(
        None, description='ID of the message this is a direct reply to'
    )
    files: list[File] | None = Field(
        None, description='File attachments on this message'
    )
    metadata: dict[constr(pattern=r'^(.*)$'), Any] | None = Field(
        None,
        description='Extensible metadata (e.g. provider, model, duration_ms, conversation_id)',
    )
    timestamp: AwareDatetime | None = Field(
        None, description='When this message was created'
    )
    reactions: dict[constr(pattern=r'^(.*)$'), list[str]] | None = Field(
        None, description='Emoji reactions: emoji key → agent IDs who reacted'
    )
    pinned: bool | None = Field(
        None, description='Whether this message is pinned in the chat'
    )

class TelemetryEntry(BaseModel):
    telemetry_id: str | None = Field(
        None, description='Stable telemetry identifier when available.', min_length=1
    )
    timestamp: AwareDatetime = Field(
        ..., description='Runtime timestamp for the event.'
    )
    scope_owner: Literal['widgetdc-orchestrator', 'widgetdc-librechat', 'snout'] = (
        Field(
            ...,
            description='Approved runtime owner or consumer scope for routing and trust contracts.',
        )
    )
    agent_persona: Literal[
        'RESEARCHER',
        'ENGINEER',
        'CUSTODIAN',
        'ARCHITECT',
        'SENTINEL',
        'ARCHIVIST',
        'HARVESTER',
        'ANALYST',
        'INTEGRATOR',
        'TESTER',
    ] = Field(..., description='RLM Engine agent persona')
    runtime_identity: str | None = Field(
        None, description='Concrete runtime worker/session identity.', min_length=1
    )
    provider_source: str | None = Field(
        None, description='Observed provider for correlation only.', min_length=1
    )
    task_domain: Literal[
        'intake', 'decomposition', 'recommendation', 'learning', 'routing', 'audit'
    ] = Field(
        ...,
        description='Narrow task domains used by the orchestrator trust model and scorecard mapping.',
    )
    capability: str | None = Field(
        None,
        description='Capability or workflow label associated with the event.',
        min_length=1,
    )
    phase: Literal[
        'discover', 'define', 'develop', 'deliver', 'observe', 'orient', 'decide', 'act'
    ] = Field(
        ...,
        description='Canonical workflow or OODA phase associated with a telemetry sample.',
    )
    outcome: Literal['success', 'warning', 'timeout', 'fail', 'blocked'] = Field(
        ..., description='Normalized runtime outcome for telemetry ingestion.'
    )
    duration_ms: int = Field(
        ..., description='Observed duration in milliseconds.', ge=0
    )
    evidence_source: Literal[
        'decision_quality_scorecard',
        'monitoring_audit_log',
        'operator_feedback',
        'runtime_readback',
    ] = Field(
        ...,
        description='Canonical evidence sources allowed to influence routing trust.',
    )
    trace_id: str | None = Field(
        None,
        description='Trace or checkpoint identifier for read-back correlation.',
        min_length=1,
    )
    metadata: dict[constr(pattern=r'^(.*)$'), str | float | bool | None] | None = Field(
        None,
        description='Small scalar metadata only. Raw payloads and provider transcripts are out of scope.',
    )

class TelemetryOutcome(
    RootModel[Literal['success', 'warning', 'timeout', 'fail', 'blocked']]
):
    root: Literal['success', 'warning', 'timeout', 'fail', 'blocked'] = Field(
        ..., description='Normalized runtime outcome for telemetry ingestion.'
    )

class TelemetryPhase(
    RootModel[
        Literal[
            'discover',
            'define',
            'develop',
            'deliver',
            'observe',
            'orient',
            'decide',
            'act',
        ]
    ]
):
    root: Literal[
        'discover', 'define', 'develop', 'deliver', 'observe', 'orient', 'decide', 'act'
    ] = Field(
        ...,
        description='Canonical workflow or OODA phase associated with a telemetry sample.',
    )

class TrustEvidenceSource(
    RootModel[
        Literal[
            'decision_quality_scorecard',
            'monitoring_audit_log',
            'operator_feedback',
            'runtime_readback',
        ]
    ]
):
    root: Literal[
        'decision_quality_scorecard',
        'monitoring_audit_log',
        'operator_feedback',
        'runtime_readback',
    ] = Field(
        ...,
        description='Canonical evidence sources allowed to influence routing trust.',
    )

class WorkflowPhase(RootModel[Literal['discover', 'define', 'develop', 'deliver']]):
    root: Literal['discover', 'define', 'develop', 'deliver'] = Field(
        ...,
        description='Canonical orchestration phases, narrowed for orchestrator/librechat/snout usage only.',
    )

class WorkflowType(RootModel[Literal['research', 'delivery', 'audit', 'debate']]):
    root: Literal['research', 'delivery', 'audit', 'debate'] = Field(
        ..., description='Workflow families allowed for the scoped orchestration layer.'
    )

