"""
widgetdc_contracts.orchestrator — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/orchestrator/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AnyUrl, BaseModel, Field
from pydantic import AwareDatetime, BaseModel, Field
from pydantic import AwareDatetime, BaseModel, Field, constr
from pydantic import BaseModel
from pydantic import BaseModel, ConfigDict, Field
from pydantic import BaseModel, Field
from pydantic import Field, RootModel
from typing import Any
from typing import Any, Literal
from typing import Literal
from uuid import UUID

__all__ = ["AgentCapability", "AgentHandshake", "AgentHandshakeStatus", "AgentId", "AgentMessage", "AgentMessageSource", "AgentMessageType", "AgentTrustProfile", "AgentWorkflowEnvelope", "ArtifactChallengeGraphWriteV1", "ArtifactChallengeOutcomeV1", "ArtifactRequestReviewGraphWriteV1", "BackendGovernanceEvidenceFamilyResponseV1", "BackendGovernanceEvidenceItemResponseV1", "BackendGovernanceEvidencePacketGovernanceV1", "FabricProof", "LauncherEvidenceFamily", "LauncherEvidenceFamilyPacket", "LauncherEvidenceItem", "LauncherEvidencePacket", "LauncherEvidenceStatus", "LauncherExecution", "LauncherExecutionMetadata", "LauncherGovernanceGate", "LauncherGovernancePromotionPolicy", "LauncherGovernanceRoutePolicy", "LauncherGovernanceSummary", "LauncherHandoffPayload", "LauncherIntent", "LauncherMode", "LauncherPlanCore", "LauncherRequest", "LauncherRequestEcho", "LauncherResponse", "OodaRuntimeContext", "OodaRuntimeRequest", "OrchestratorTaskDomain", "OrchestratorToolCall", "OrchestratorToolResult", "OrchestratorToolStatus", "ReasonRuntimeContext", "ReasonRuntimeRequest", "ReasonRuntimeResponse", "ReasonRuntimeResponseContract", "ReasonRuntimeRouting", "ReasonRuntimeTelemetry", "RoutingCapability", "RoutingDecision", "RoutingIntent", "ScopeOwner", "ScorecardDimension", "ScorecardEntry", "ScorecardMetricStatus", "StoredMessage", "TelemetryEntry", "TelemetryOutcome", "TelemetryPhase", "TrustEvidenceSource", "WorkflowPhase", "WorkflowType", "ArtifactChallengeEnvelopeV1", "ArtifactRequestReviewEnvelopeV1", "BackendGovernanceEvidencePacketResponseV1"]

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

class FabricProof(BaseModel):
    proof_id: UUID = Field(
        ..., description='Unique identifier for the issued fabric proof'
    )
    proof_type: Literal['sgt'] | str = Field(
        ..., description='Fabric proof mechanism identifier'
    )
    verification_status: Literal['verified', 'unverified', 'expired', 'revoked'] = (
        Field(
            ...,
            description='Verification result for the proof at issuance or last refresh',
        )
    )
    authorized_tool_namespaces: list[str] = Field(
        ...,
        description='Tool namespaces this proof authorizes. ["*"] grants all namespaces.',
    )
    issued_at: AwareDatetime
    expires_at: AwareDatetime | None = None
    issuer: str | None = Field(None, description='Canonical issuer of the proof')
    handshake_id: str | None = Field(
        None, description='Associated handshake identifier or fingerprint'
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
    fabric_proof: FabricProof | None = Field(
        None,
        description='Verified immutable fabric proof issued during agent handshake. Used to authorize high-risk delegation and tool execution.',
    )
    capability_index: str | None = Field(
        None,
        description='Optimized search index fingerprint for lazy-loading tools (Adoption: Anthropic Tool Search Index). Reduces handshake token bloat by 85%.',
    )
    memory_tiers: list[Literal['working', 'episodic', 'semantic']] | None = Field(
        None,
        description='Supported memory layers for this agent (Adoption: OpenClaw Memory Tiering).',
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
    type: Literal[
        'Message',
        'Command',
        'Answer',
        'Handover',
        'Alert',
        'ToolResult',
        'Arbitration',
        'Divergence',
    ] = Field(..., description='Classification of the message purpose')
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
        Literal[
            'Message',
            'Command',
            'Answer',
            'Handover',
            'Alert',
            'ToolResult',
            'Arbitration',
            'Divergence',
        ]
    ]
):
    root: Literal[
        'Message',
        'Command',
        'Answer',
        'Handover',
        'Alert',
        'ToolResult',
        'Arbitration',
        'Divergence',
    ] = Field(..., description='Classification of the message purpose')

class AgentTrustProfile(BaseModel):
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
    compute_mode: Literal['standard', 'extreme'] | None = Field(
        'standard',
        description='Allocated compute intensity for the current workflow phase.',
    )
    phase_parameters: dict[constr(pattern=r'^(.*)$'), Any] | None = Field(
        None,
        description='Optimized parameters for multi-step agentic execution (Adoption: OpenAI Phase Pattern). Reduces token usage via targeted tool discovery.',
    )
    started_at: AwareDatetime = Field(..., description='Workflow start timestamp.')
    updated_at: AwareDatetime = Field(
        ..., description='Last workflow state update timestamp.'
    )

class ArtifactChallengeGraphWriteV1(BaseModel):
    outcome_label: Literal['Outcome']
    relation_type: Literal['CHALLENGES']
    target_identity: str = Field(
        ...,
        description='Target artifact identity for the challenge relation.',
        min_length=1,
    )

class ArtifactChallengeOutcomeV1(BaseModel):
    trace_id: str = Field(
        ...,
        description='Trace id or outcome id emitted for the challenge action.',
        min_length=1,
    )
    status: Literal['CHALLENGED']
    reason: str = Field(
        ...,
        description='Challenge reason supplied by the surface or operator.',
        min_length=1,
    )
    evidence_uri: AnyUrl | None = None

class ArtifactRequestReviewGraphWriteV1(BaseModel):
    type: Literal['ConstructionRequest']
    request_kind: Literal['REVIEW']
    requested_by: str = Field(..., description='Actor requesting review.', min_length=1)
    artifact_id: str = Field(..., min_length=1)

class EvidenceItem(BaseModel):
    id: str = Field(..., description='Stable evidence item id.', min_length=1)
    summary: str = Field(
        ...,
        description='Short evidence summary consumed by launcher-like surfaces.',
        min_length=1,
    )
    score: float | None = Field(
        None, description='Relative evidence relevance score when available.', ge=0.0
    )
    title: str | None = None
    source_type: str | None = None


class BackendGovernanceEvidenceFamilyResponseV1(BaseModel):
    family: Literal['research', 'regulatory', 'enterprise'] = Field(
        ...,
        description='Canonical evidence families used by the launcher routing surface.',
    )
    status: Literal['grounded', 'coverage_gap', 'unavailable'] | None = Field(
        None,
        description='Availability state for one evidence family inside the launcher packet.',
    )
    summary: str = Field(
        ...,
        description='Family summary consumed by launcher-like surfaces.',
        min_length=1,
    )
    evidence_items: list[EvidenceItem]

class BackendGovernanceEvidenceItemResponseV1(BaseModel):
    id: str = Field(..., description='Stable evidence item id.', min_length=1)
    summary: str = Field(
        ...,
        description='Short evidence summary consumed by launcher-like surfaces.',
        min_length=1,
    )
    score: float | None = Field(
        None, description='Relative evidence relevance score when available.', ge=0.0
    )
    title: str | None = None
    source_type: str | None = None

class BackendGovernanceEvidencePacketGovernanceV1(BaseModel):
    blocking_reasons: list[str] = Field(
        ...,
        description='Coverage or governance blockers detected while composing the packet.',
    )
    promotion_status: Literal['not_promoted', 'blocked'] | None = None
    can_promote: bool | None = None

class FabricProof(BaseModel):
    proof_id: UUID = Field(
        ..., description='Unique identifier for the issued fabric proof'
    )
    proof_type: Literal['sgt'] | str = Field(
        ..., description='Fabric proof mechanism identifier'
    )
    verification_status: Literal['verified', 'unverified', 'expired', 'revoked'] = (
        Field(
            ...,
            description='Verification result for the proof at issuance or last refresh',
        )
    )
    authorized_tool_namespaces: list[str] = Field(
        ...,
        description='Tool namespaces this proof authorizes. ["*"] grants all namespaces.',
    )
    issued_at: AwareDatetime
    expires_at: AwareDatetime | None = None
    issuer: str | None = Field(None, description='Canonical issuer of the proof')
    handshake_id: str | None = Field(
        None, description='Associated handshake identifier or fingerprint'
    )

class LauncherEvidenceFamily(
    RootModel[Literal['research', 'regulatory', 'enterprise']]
):
    root: Literal['research', 'regulatory', 'enterprise'] = Field(
        ...,
        description='Canonical evidence families used by the launcher routing surface.',
    )

class EvidenceItem(BaseModel):
    id: str = Field(
        ..., description='Stable evidence identifier or runtime-derived synthetic key.'
    )
    family: Literal['research', 'regulatory', 'enterprise'] = Field(
        ...,
        description='Canonical evidence families used by the launcher routing surface.',
    )
    title: str = Field(
        ...,
        description='Human-readable evidence title suitable for launcher surfacing.',
    )
    summary: str = Field(
        ..., description='Short evidence summary for routing and operator review.'
    )
    source_type: str = Field(
        ...,
        description='Origin type such as graphrag, regulation, governance_read_model, or runtime_readback.',
    )
    score: float | None = Field(
        None, description='Relative relevance score when available.'
    )
    evidence_ref: str | None = Field(
        None,
        description='Reference path, query id, or runtime correlation id for read-back.',
    )


class LauncherEvidenceFamilyPacket(BaseModel):
    family: Literal['research', 'regulatory', 'enterprise'] = Field(
        ...,
        description='Canonical evidence families used by the launcher routing surface.',
    )
    status: Literal['grounded', 'coverage_gap', 'unavailable'] = Field(
        ...,
        description='Availability state for one evidence family inside the launcher packet.',
    )
    summary: str = Field(
        ...,
        description='Family-level summary used for launcher reasoning and UI surfacing.',
    )
    evidence_items: list[EvidenceItem] = Field(
        ..., description='Top evidence items selected for this family.'
    )

class LauncherEvidenceItem(BaseModel):
    id: str = Field(
        ..., description='Stable evidence identifier or runtime-derived synthetic key.'
    )
    family: Literal['research', 'regulatory', 'enterprise'] = Field(
        ...,
        description='Canonical evidence families used by the launcher routing surface.',
    )
    title: str = Field(
        ...,
        description='Human-readable evidence title suitable for launcher surfacing.',
    )
    summary: str = Field(
        ..., description='Short evidence summary for routing and operator review.'
    )
    source_type: str = Field(
        ...,
        description='Origin type such as graphrag, regulation, governance_read_model, or runtime_readback.',
    )
    score: float | None = Field(
        None, description='Relative relevance score when available.'
    )
    evidence_ref: str | None = Field(
        None,
        description='Reference path, query id, or runtime correlation id for read-back.',
    )

class EvidenceItem(BaseModel):
    id: str = Field(
        ..., description='Stable evidence identifier or runtime-derived synthetic key.'
    )
    family: Literal['research', 'regulatory', 'enterprise'] = Field(
        ...,
        description='Canonical evidence families used by the launcher routing surface.',
    )
    title: str = Field(
        ...,
        description='Human-readable evidence title suitable for launcher surfacing.',
    )
    summary: str = Field(
        ..., description='Short evidence summary for routing and operator review.'
    )
    source_type: str = Field(
        ...,
        description='Origin type such as graphrag, regulation, governance_read_model, or runtime_readback.',
    )
    score: float | None = Field(
        None, description='Relative relevance score when available.'
    )
    evidence_ref: str | None = Field(
        None,
        description='Reference path, query id, or runtime correlation id for read-back.',
    )


class Family(BaseModel):
    family: Literal['research', 'regulatory', 'enterprise'] = Field(
        ...,
        description='Canonical evidence families used by the launcher routing surface.',
    )
    status: Literal['grounded', 'coverage_gap', 'unavailable'] = Field(
        ...,
        description='Availability state for one evidence family inside the launcher packet.',
    )
    summary: str = Field(
        ...,
        description='Family-level summary used for launcher reasoning and UI surfacing.',
    )
    evidence_items: list[EvidenceItem] = Field(
        ..., description='Top evidence items selected for this family.'
    )


class Governance(BaseModel):
    promotion_status: Literal['not_promoted', 'blocked']
    can_promote: bool = Field(
        ...,
        description='Launcher evidence packets are read-only and cannot promote by themselves.',
    )
    blocking_reasons: list[str] = Field(
        ...,
        description='Coverage gaps or governance blockers detected while building the packet.',
    )


class LauncherEvidencePacket(BaseModel):
    field_id: Literal['orchestrator/launcher-evidence-packet'] = Field(..., alias='$id')
    packet_id: str = Field(
        ..., description='Stable packet identifier for routing lineage and read-back.'
    )
    question: str = Field(
        ..., description='Original launcher question used to build the packet.'
    )
    domain: str = Field(..., description='Domain or org scope used during retrieval.')
    created_at: AwareDatetime = Field(
        ..., description='Timestamp when the packet was created.'
    )
    tri_source_ready: bool = Field(
        ...,
        description='True when research, regulatory, and enterprise families all have usable evidence.',
    )
    families: list[Family] = Field(
        ...,
        description='Canonical tri-source evidence families for the launcher surface.',
        max_length=3,
        min_length=3,
    )
    evidence_refs: list[str] = Field(
        ...,
        description='References used for routing transparency and later read-back.',
        min_length=1,
    )
    governance: Governance

class LauncherEvidenceStatus(
    RootModel[Literal['grounded', 'coverage_gap', 'unavailable']]
):
    root: Literal['grounded', 'coverage_gap', 'unavailable'] = Field(
        ...,
        description='Availability state for one evidence family inside the launcher packet.',
    )

class Metadata(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    evidenceDomain: str | None = None
    reasonDomain: str | None = None
    canonicalGovernance: Any | None = Field(
        None,
        description='Canonical backend governance snapshot. Exact shape should converge in dedicated backend schemas.',
    )
    retrievalSummary: str | None = None
    degradedReasoning: bool | None = None
    fallbackToReason: bool | None = None
    fallbackFrom: str | None = None
    fallbackError: str | None = None


class Gate(BaseModel):
    gate: str = Field(..., description='Stable gate identifier.', min_length=1)
    status: Literal['pass', 'fail', 'skip', 'coverage_gap']
    reasonCode: str = Field(
        ...,
        description='Machine-readable reason code for the gate outcome.',
        min_length=1,
    )


class RoutePolicy(BaseModel):
    foldingRequired: bool
    retrievalRequired: bool
    governanceRequired: bool
    graphVerificationRequired: bool
    renderValidationRequired: bool


class PromotionPolicy(BaseModel):
    qualityGate: bool
    policyAlignment: bool
    graphWriteVerification: bool
    readBackVerification: bool
    looseEndGenerationOnFailureOrBlock: bool


class Governance(BaseModel):
    promotionStatus: Literal['not_promoted', 'blocked']
    looseEnd: str | None = None
    gates: list[Gate] = Field(..., min_length=1)
    targetKind: str = Field(..., min_length=1)
    boundaryOwner: str = Field(..., min_length=1)
    routePolicy: RoutePolicy = Field(
        ..., description='Launcher-local route policy summary for operator visibility.'
    )
    promotionPolicy: PromotionPolicy = Field(
        ...,
        description='Launcher-local promotion policy summary. Read-only and non-canonical.',
    )
    disclaimer: str = Field(
        ...,
        description='Must state that launcher governance checks are local and not canonical promotion authority.',
        min_length=1,
    )


class LauncherExecution(BaseModel):
    source: str = Field(
        ...,
        description='Execution source path, for example /reason or /api/rlm/ooda/run.',
        min_length=1,
    )
    summary: str = Field(
        ...,
        description='Execution summary text returned by the current runtime path.',
        min_length=1,
    )
    trace: list[str] = Field(
        ..., description='Runtime trace snippets suitable for cross-service debugging.'
    )
    metadata: Metadata = Field(
        ...,
        description='Shared launcher execution metadata used for runtime transparency. Surface-only wording fields belong elsewhere.',
    )
    governance: Governance = Field(
        ...,
        description='Read-only launcher governance rendering contract. Local-only governance context; not platform truth.',
    )

class LauncherExecutionMetadata(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    evidenceDomain: str | None = None
    reasonDomain: str | None = None
    canonicalGovernance: Any | None = Field(
        None,
        description='Canonical backend governance snapshot. Exact shape should converge in dedicated backend schemas.',
    )
    retrievalSummary: str | None = None
    degradedReasoning: bool | None = None
    fallbackToReason: bool | None = None
    fallbackFrom: str | None = None
    fallbackError: str | None = None

class LauncherGovernanceGate(BaseModel):
    gate: str = Field(..., description='Stable gate identifier.', min_length=1)
    status: Literal['pass', 'fail', 'skip', 'coverage_gap']
    reasonCode: str = Field(
        ...,
        description='Machine-readable reason code for the gate outcome.',
        min_length=1,
    )

class LauncherGovernancePromotionPolicy(BaseModel):
    qualityGate: bool
    policyAlignment: bool
    graphWriteVerification: bool
    readBackVerification: bool
    looseEndGenerationOnFailureOrBlock: bool

class LauncherGovernanceRoutePolicy(BaseModel):
    foldingRequired: bool
    retrievalRequired: bool
    governanceRequired: bool
    graphVerificationRequired: bool
    renderValidationRequired: bool

class Gate(BaseModel):
    gate: str = Field(..., description='Stable gate identifier.', min_length=1)
    status: Literal['pass', 'fail', 'skip', 'coverage_gap']
    reasonCode: str = Field(
        ...,
        description='Machine-readable reason code for the gate outcome.',
        min_length=1,
    )


class RoutePolicy(BaseModel):
    foldingRequired: bool
    retrievalRequired: bool
    governanceRequired: bool
    graphVerificationRequired: bool
    renderValidationRequired: bool


class PromotionPolicy(BaseModel):
    qualityGate: bool
    policyAlignment: bool
    graphWriteVerification: bool
    readBackVerification: bool
    looseEndGenerationOnFailureOrBlock: bool


class LauncherGovernanceSummary(BaseModel):
    promotionStatus: Literal['not_promoted', 'blocked']
    looseEnd: str | None = None
    gates: list[Gate] = Field(..., min_length=1)
    targetKind: str = Field(..., min_length=1)
    boundaryOwner: str = Field(..., min_length=1)
    routePolicy: RoutePolicy = Field(
        ..., description='Launcher-local route policy summary for operator visibility.'
    )
    promotionPolicy: PromotionPolicy = Field(
        ...,
        description='Launcher-local promotion policy summary. Read-only and non-canonical.',
    )
    disclaimer: str = Field(
        ...,
        description='Must state that launcher governance checks are local and not canonical promotion authority.',
        min_length=1,
    )

class LauncherHandoffPayload(BaseModel):
    intent: Literal['info', 'analyze', 'report', 'research', 'orchestrate'] = Field(
        ..., description='Intent values supported by the WidgeTDC launcher surface.'
    )
    prompt: str = Field(
        ...,
        description='Prompt payload handed to the deeper workspace surface.',
        min_length=1,
    )
    executionPath: str = Field(
        ..., description='Canonical runtime path selected for the task.', min_length=1
    )

class LauncherIntent(
    RootModel[Literal['info', 'analyze', 'report', 'research', 'orchestrate']]
):
    root: Literal['info', 'analyze', 'report', 'research', 'orchestrate'] = Field(
        ..., description='Intent values supported by the WidgeTDC launcher surface.'
    )

class LauncherMode(RootModel[Literal['tool_only', 'single', 'swarm']]):
    root: Literal['tool_only', 'single', 'swarm'] = Field(
        ..., description='Execution modes exposed by launcher planning.'
    )

HandoffPayload = LauncherPlanCore

class LauncherPlanCore(BaseModel):
    intent: Literal['info', 'analyze', 'report', 'research', 'orchestrate'] = Field(
        ..., description='Intent values supported by the WidgeTDC launcher surface.'
    )
    mode: Literal['tool_only', 'single', 'swarm'] = Field(
        ..., description='Execution modes exposed by launcher planning.'
    )
    lineageId: str = Field(
        ...,
        description='Stable lineage id for launcher planning and runtime traceability.',
        min_length=1,
    )
    status: Literal['planned', 'in_progress', 'completed', 'failed'] = Field(
        ..., description='Plan state visible to downstream systems.'
    )
    source: Literal['widgetdc-launcher-prototype'] = Field(
        ..., description='Current launcher source surface.'
    )
    executionPath: str = Field(
        ..., description='Runtime path selected for the launcher task.', min_length=1
    )
    handoffPayload: HandoffPayload = Field(
        ...,
        description='Shared handoff payload from launcher to downstream workspace/runtime surfaces.',
    )

class LauncherRequest(BaseModel):
    input: str = Field(
        ..., description='User-provided launcher task or question.', min_length=1
    )
    intent: Literal['info', 'analyze', 'report', 'research', 'orchestrate'] = Field(
        ..., description='Intent values supported by the WidgeTDC launcher surface.'
    )
    instruction: str | None = Field(
        None,
        description='Canonical single instruction override field for orchestrated requests.',
        min_length=1,
    )
    instructions: str | None = Field(
        None,
        description='Compatibility alias for instruction. Retained until all consumers converge.',
        min_length=1,
    )

class LauncherRequestEcho(BaseModel):
    input: str = Field(
        ..., description='Echo of normalized launcher input.', min_length=1
    )
    intent: Literal['info', 'analyze', 'report', 'research', 'orchestrate'] = Field(
        ..., description='Intent values supported by the WidgeTDC launcher surface.'
    )

class Request(BaseModel):
    input: str = Field(
        ..., description='Echo of normalized launcher input.', min_length=1
    )
    intent: Literal['info', 'analyze', 'report', 'research', 'orchestrate'] = Field(
        ..., description='Intent values supported by the WidgeTDC launcher surface.'
    )


HandoffPayload = LauncherPlanCore

class Plan(BaseModel):
    intent: Literal['info', 'analyze', 'report', 'research', 'orchestrate'] = Field(
        ..., description='Intent values supported by the WidgeTDC launcher surface.'
    )
    mode: Literal['tool_only', 'single', 'swarm'] = Field(
        ..., description='Execution modes exposed by launcher planning.'
    )
    lineageId: str = Field(
        ...,
        description='Stable lineage id for launcher planning and runtime traceability.',
        min_length=1,
    )
    status: Literal['planned', 'in_progress', 'completed', 'failed'] = Field(
        ..., description='Plan state visible to downstream systems.'
    )
    source: Literal['widgetdc-launcher-prototype'] = Field(
        ..., description='Current launcher source surface.'
    )
    executionPath: str = Field(
        ..., description='Runtime path selected for the launcher task.', min_length=1
    )
    handoffPayload: HandoffPayload = Field(
        ...,
        description='Shared handoff payload from launcher to downstream workspace/runtime surfaces.',
    )


class Metadata(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    evidenceDomain: str | None = None
    reasonDomain: str | None = None
    canonicalGovernance: Any | None = Field(
        None,
        description='Canonical backend governance snapshot. Exact shape should converge in dedicated backend schemas.',
    )
    retrievalSummary: str | None = None
    degradedReasoning: bool | None = None
    fallbackToReason: bool | None = None
    fallbackFrom: str | None = None
    fallbackError: str | None = None


class Gate(BaseModel):
    gate: str = Field(..., description='Stable gate identifier.', min_length=1)
    status: Literal['pass', 'fail', 'skip', 'coverage_gap']
    reasonCode: str = Field(
        ...,
        description='Machine-readable reason code for the gate outcome.',
        min_length=1,
    )


class RoutePolicy(BaseModel):
    foldingRequired: bool
    retrievalRequired: bool
    governanceRequired: bool
    graphVerificationRequired: bool
    renderValidationRequired: bool


class PromotionPolicy(BaseModel):
    qualityGate: bool
    policyAlignment: bool
    graphWriteVerification: bool
    readBackVerification: bool
    looseEndGenerationOnFailureOrBlock: bool


class Governance(BaseModel):
    promotionStatus: Literal['not_promoted', 'blocked']
    looseEnd: str | None = None
    gates: list[Gate] = Field(..., min_length=1)
    targetKind: str = Field(..., min_length=1)
    boundaryOwner: str = Field(..., min_length=1)
    routePolicy: RoutePolicy = Field(
        ..., description='Launcher-local route policy summary for operator visibility.'
    )
    promotionPolicy: PromotionPolicy = Field(
        ...,
        description='Launcher-local promotion policy summary. Read-only and non-canonical.',
    )
    disclaimer: str = Field(
        ...,
        description='Must state that launcher governance checks are local and not canonical promotion authority.',
        min_length=1,
    )


class Execution(BaseModel):
    source: str = Field(
        ...,
        description='Execution source path, for example /reason or /api/rlm/ooda/run.',
        min_length=1,
    )
    summary: str = Field(
        ...,
        description='Execution summary text returned by the current runtime path.',
        min_length=1,
    )
    trace: list[str] = Field(
        ..., description='Runtime trace snippets suitable for cross-service debugging.'
    )
    metadata: Metadata = Field(
        ...,
        description='Shared launcher execution metadata used for runtime transparency. Surface-only wording fields belong elsewhere.',
    )
    governance: Governance = Field(
        ...,
        description='Read-only launcher governance rendering contract. Local-only governance context; not platform truth.',
    )


class LauncherResponse(BaseModel):
    request: Request = Field(
        ...,
        description='Normalized launcher request echo returned by orchestrated launcher flows.',
    )
    plan: Plan = Field(
        ...,
        description='Shared launcher plan fields. Surface-local UX fields such as title, nextStep, openedSurface, and launchTarget stay outside this schema.',
    )
    execution: Execution = Field(..., description='Shared launcher execution contract.')

class OodaRuntimeContext(BaseModel):
    graph_summary: str = Field(
        ...,
        description='Folded or direct graph summary supplied to the OODA runtime.',
        min_length=1,
    )
    source_surface: str = Field(
        ..., description='Surface invoking the OODA runtime.', min_length=1
    )
    grounding_directive: str = Field(
        ...,
        description='Grounding constraints applied to the runtime call.',
        min_length=1,
    )
    evidence_domain: str = Field(..., min_length=1)
    reason_domain: str = Field(..., min_length=1)
    report_layout_contract: str | None = None
    evidence_context: str | None = None

class Context(BaseModel):
    graph_summary: str = Field(
        ...,
        description='Folded or direct graph summary supplied to the OODA runtime.',
        min_length=1,
    )
    source_surface: str = Field(
        ..., description='Surface invoking the OODA runtime.', min_length=1
    )
    grounding_directive: str = Field(
        ...,
        description='Grounding constraints applied to the runtime call.',
        min_length=1,
    )
    evidence_domain: str = Field(..., min_length=1)
    reason_domain: str = Field(..., min_length=1)
    report_layout_contract: str | None = None
    evidence_context: str | None = None


class OodaRuntimeRequest(BaseModel):
    task: str = Field(..., description='Task passed to the OODA runtime.', min_length=1)
    task_id: str = Field(
        ..., description='Stable task id for runtime tracking.', min_length=1
    )
    instruction: str = Field(
        ...,
        description='Canonical instruction field for OODA runtime requests.',
        min_length=1,
    )
    instructions: str = Field(
        ...,
        description='Compatibility alias retained until all consumers converge on instruction.',
        min_length=1,
    )
    context: Context = Field(
        ...,
        description='Context object supplied to the OODA runtime from launcher-like surfaces.',
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

class FabricProof(BaseModel):
    proof_id: UUID = Field(
        ..., description='Unique identifier for the issued fabric proof'
    )
    proof_type: Literal['sgt'] | str = Field(
        ..., description='Fabric proof mechanism identifier'
    )
    verification_status: Literal['verified', 'unverified', 'expired', 'revoked'] = (
        Field(
            ...,
            description='Verification result for the proof at issuance or last refresh',
        )
    )
    authorized_tool_namespaces: list[str] = Field(
        ...,
        description='Tool namespaces this proof authorizes. ["*"] grants all namespaces.',
    )
    issued_at: AwareDatetime
    expires_at: AwareDatetime | None = None
    issuer: str | None = Field(None, description='Canonical issuer of the proof')
    handshake_id: str | None = Field(
        None, description='Associated handshake identifier or fingerprint'
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
    fabric_proof: FabricProof | None = Field(
        None,
        description='Verified immutable fabric proof issued during agent handshake. Used to authorize high-risk delegation and tool execution.',
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

class ResponseContract(BaseModel):
    jobStatement: str
    successShape: str
    requiredSections: list[str]
    boundaryRules: list[str]
    fallbackPolicy: str


class ReasonRuntimeContext(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    response_contract: ResponseContract = Field(
        ...,
        description='Structured response contract guidance passed into the runtime request context.',
    )
    evidence_domain: str | None = None
    reason_domain: str | None = None
    enriched_prompt: str | None = None
    field_quality_task: str | None = Field(
        None,
        alias='_quality_task',
        description='Compatibility field retained during migration from local launcher runtime behavior.',
    )
    field_skip_knowledge_enrichment: bool | None = Field(
        None,
        alias='_skip_knowledge_enrichment',
        description='Compatibility field retained during migration from local launcher runtime behavior.',
    )
    field_output_mode: str | None = Field(
        None,
        alias='_output_mode',
        description='Compatibility field retained during migration from local launcher runtime behavior.',
    )
    field_expected_format: str | None = Field(
        None,
        alias='_expected_format',
        description='Compatibility field retained during migration from local launcher runtime behavior.',
    )
    require_swarm: bool | None = None

class ResponseContract(BaseModel):
    jobStatement: str
    successShape: str
    requiredSections: list[str]
    boundaryRules: list[str]
    fallbackPolicy: str


class Context(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    response_contract: ResponseContract = Field(
        ...,
        description='Structured response contract guidance passed into the runtime request context.',
    )
    evidence_domain: str | None = None
    reason_domain: str | None = None
    enriched_prompt: str | None = None
    field_quality_task: str | None = Field(
        None,
        alias='_quality_task',
        description='Compatibility field retained during migration from local launcher runtime behavior.',
    )
    field_skip_knowledge_enrichment: bool | None = Field(
        None,
        alias='_skip_knowledge_enrichment',
        description='Compatibility field retained during migration from local launcher runtime behavior.',
    )
    field_output_mode: str | None = Field(
        None,
        alias='_output_mode',
        description='Compatibility field retained during migration from local launcher runtime behavior.',
    )
    field_expected_format: str | None = Field(
        None,
        alias='_expected_format',
        description='Compatibility field retained during migration from local launcher runtime behavior.',
    )
    require_swarm: bool | None = None


class ReasonRuntimeRequest(BaseModel):
    task: str = Field(
        ..., description='Task passed to the /reason runtime.', min_length=1
    )
    domain: str = Field(
        ..., description='Resolved domain passed to the /reason runtime.', min_length=1
    )
    context: Context = Field(
        ...,
        description='Context passed to the /reason runtime. Compatibility fields are temporary until callers converge on typed fields.',
    )

class Routing(BaseModel):
    provider: str = Field(..., min_length=1)
    model: str = Field(..., min_length=1)
    latency_ms: float | None = Field(None, ge=0.0)


class Telemetry(BaseModel):
    used_swarm: bool
    used_rag: bool


class ReasonRuntimeResponse(BaseModel):
    recommendation: str | None = None
    reasoning: str | None = None
    confidence: float | None = Field(None, ge=0.0, le=1.0)
    routing: Routing | None = Field(
        None, description='Routing metadata returned by the /reason runtime.'
    )
    telemetry: Telemetry | None = Field(
        None, description='Minimal runtime telemetry returned by the /reason runtime.'
    )
    reasoning_chain: list[str] | None = None

class ReasonRuntimeResponseContract(BaseModel):
    jobStatement: str
    successShape: str
    requiredSections: list[str]
    boundaryRules: list[str]
    fallbackPolicy: str

class ReasonRuntimeRouting(BaseModel):
    provider: str = Field(..., min_length=1)
    model: str = Field(..., min_length=1)
    latency_ms: float | None = Field(None, ge=0.0)

class ReasonRuntimeTelemetry(BaseModel):
    used_swarm: bool
    used_rag: bool

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
        'FABRIC_WIN',
    ] = Field(..., description='Why this route was selected.')
    fabric_route_id: str | None = Field(
        None,
        description='Virtual fabric identifier for low-latency agent-to-agent communication (Adoption: NVIDIA NVLink 6).',
    )
    latency_deterministic: bool | None = Field(
        False,
        description='Whether the route guarantees deterministic response time for MoE (Mixture-of-Experts) swarms.',
    )
    vampire_drain_rate: float | None = Field(
        None,
        description='Rate of intellectual or economic value extraction from the target competitor (Adoption: Strategic Strategy Vampire).',
        ge=0.0,
        le=1.0,
    )
    target_shadow_id: str | None = Field(
        None,
        description='Reference to the CompetitorShadow node being drained or intercepted.',
    )
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
    type: Literal[
        'Message',
        'Command',
        'Answer',
        'Handover',
        'Alert',
        'ToolResult',
        'Arbitration',
        'Divergence',
    ] = Field(..., description='Classification of the message purpose')
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

class Outcome(BaseModel):
    trace_id: str = Field(
        ...,
        description='Trace id or outcome id emitted for the challenge action.',
        min_length=1,
    )
    status: Literal['CHALLENGED']
    reason: str = Field(
        ...,
        description='Challenge reason supplied by the surface or operator.',
        min_length=1,
    )
    evidence_uri: AnyUrl | None = None


class GraphWrite(BaseModel):
    outcome_label: Literal['Outcome']
    relation_type: Literal['CHALLENGES']
    target_identity: str = Field(
        ...,
        description='Target artifact identity for the challenge relation.',
        min_length=1,
    )


class ArtifactChallengeEnvelopeV1(BaseModel):
    tool: Literal['artifacts.challenge']
    artifact_id: str = Field(..., min_length=1)
    artifact_slug: str | None = Field(
        None,
        description='Compatibility metadata field retained during migration.',
        min_length=1,
    )
    outcome: Outcome = Field(
        ..., description='Outcome payload generated by artifact challenge requests.'
    )
    graph_write: GraphWrite = Field(
        ..., description='Graph write instruction for artifact challenge envelopes.'
    )

class GraphWrite(BaseModel):
    type: Literal['ConstructionRequest']
    request_kind: Literal['REVIEW']
    requested_by: str = Field(..., description='Actor requesting review.', min_length=1)
    artifact_id: str = Field(..., min_length=1)


class ArtifactRequestReviewEnvelopeV1(BaseModel):
    tool: Literal['artifacts.action']
    action: Literal['request-review']
    artifact_id: str = Field(..., min_length=1)
    graph_write: GraphWrite = Field(
        ...,
        description='Graph write instruction for artifact request-review envelopes.',
    )

class Governance(BaseModel):
    blocking_reasons: list[str] = Field(
        ...,
        description='Coverage or governance blockers detected while composing the packet.',
    )
    promotion_status: Literal['not_promoted', 'blocked'] | None = None
    can_promote: bool | None = None


class EvidenceItem(BaseModel):
    id: str = Field(..., description='Stable evidence item id.', min_length=1)
    summary: str = Field(
        ...,
        description='Short evidence summary consumed by launcher-like surfaces.',
        min_length=1,
    )
    score: float | None = Field(
        None, description='Relative evidence relevance score when available.', ge=0.0
    )
    title: str | None = None
    source_type: str | None = None


class Family(BaseModel):
    family: Literal['research', 'regulatory', 'enterprise'] = Field(
        ...,
        description='Canonical evidence families used by the launcher routing surface.',
    )
    status: Literal['grounded', 'coverage_gap', 'unavailable'] | None = Field(
        None,
        description='Availability state for one evidence family inside the launcher packet.',
    )
    summary: str = Field(
        ...,
        description='Family summary consumed by launcher-like surfaces.',
        min_length=1,
    )
    evidence_items: list[EvidenceItem]


class BackendGovernanceEvidencePacketResponseV1(BaseModel):
    packet_id: str = Field(
        ..., description='Stable packet id for routing and read-back.', min_length=1
    )
    tri_source_ready: bool = Field(
        ...,
        description='True when enough evidence exists for multi-signal launcher use.',
    )
    governance: Governance = Field(
        ..., description='Governance subsection of backend evidence packet responses.'
    )
    families: list[Family] = Field(
        ...,
        description='Family evidence summaries returned by backend governance surfaces.',
        min_length=1,
    )
    question: str | None = None
    domain: str | None = None
    created_at: AwareDatetime | None = None
    evidence_refs: list[str] | None = None
