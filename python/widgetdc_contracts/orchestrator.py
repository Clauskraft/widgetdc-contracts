"""
widgetdc_contracts.orchestrator — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/orchestrator/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import AwareDatetime, BaseModel, Field, conint, confloat

__all__ = ["AgentWorkflowEnvelope", "AgentHandshake", "RoutingDecision", "Intent"]


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
    phase_parameters: dict[str, Any] | None = Field(
        None,
        description='Optimized parameters for multi-step agentic execution (Adoption: OpenAI Phase Pattern). Reduces token usage via targeted tool discovery.',
    )
    started_at: AwareDatetime = Field(..., description='Workflow start timestamp.')
    updated_at: AwareDatetime = Field(
        ..., description='Last workflow state update timestamp.'
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
    capability_index: str | None = Field(
        None,
        description='Optimized search index fingerprint for lazy-loading tools (Adoption: Anthropic Tool Search Index). Reduces handshake token bloat by 85%.',
    )
    memory_tiers: list[Literal['working', 'episodic', 'semantic']] | None = Field(
        None,
        description='Supported memory layers for this agent (Adoption: OpenClaw Memory Tiering).',
    )
    max_concurrent_calls: conint(ge=1, le=20) | None = 5
    default_thread: str | None = Field(
        None, description='Default Notion Global Chat thread for this agent'
    )
    registered_at: AwareDatetime | None = None
    last_seen_at: AwareDatetime | None = None


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
    trust_score: confloat(ge=0.0, le=1.0) = Field(
        ..., description='Trust score that justified the selected route.'
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
    vampire_drain_rate: confloat(ge=0.0, le=1.0) | None = Field(
        None,
        description='Rate of intellectual or economic value extraction from the target competitor (Adoption: Strategic Strategy Vampire).',
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
