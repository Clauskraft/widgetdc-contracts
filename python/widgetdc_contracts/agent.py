"""
widgetdc_contracts.agent — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/agent/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field
from pydantic import AwareDatetime, BaseModel, Field
from pydantic import AwareDatetime, BaseModel, Field, constr
from pydantic import BaseModel, ConfigDict, Field
from pydantic import BaseModel, ConfigDict, Field, constr
from pydantic import BaseModel, Field
from pydantic import Field, RootModel
from typing import Any, Literal
from typing import Literal
from uuid import UUID

__all__ = ["AgentConflict", "AgentPersona", "AgentPriority", "AgentRequest", "AgentResponse", "AgentResponseStatus", "AgentTier", "AgenticPattern", "ArchitectureEvent", "CapabilityEntry", "CapabilityMatrix", "CircuitState", "ComplianceResult", "ComplianceViolation", "OmegaConsensusRequest", "OmegaConsensusVote", "OmegaSitrep", "PheromoneSignal", "PheromoneType", "SignalType", "SubAgentId", "SubAgentStatus", "ThreatLevel", "TokenUsage", "TuningHypothesis"]

class AgentConflict(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    other_agent_id: str = Field(
        ..., description='Agent whose WIP conflicts with this request'
    )
    other_task: str = Field(..., description='Conflicting task description')
    similarity: float = Field(
        ..., description='Jaccard or semantic similarity score', ge=0.0, le=1.0
    )
    mode: Literal['advisory', 'blocking'] = Field(
        ...,
        description='Per Gate 4: default is advisory; blocking requires explicit opt-in',
    )
    suggestion: str | None = None

class AgentPersona(
    RootModel[
        Literal[
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
        ]
    ]
):
    root: Literal[
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

class AgentPriority(RootModel[Literal['low', 'normal', 'high', 'critical']]):
    root: Literal['low', 'normal', 'high', 'critical'] = Field(
        ..., description='Agent request priority level'
    )

class AgentRequest(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    request_id: UUID = Field(..., description='Correlation ID — echoed in response')
    agent_id: str = Field(
        ...,
        description='Logical agent identifier (e.g. "omega-sentinel")',
        min_length=1,
    )
    task: str = Field(
        ..., description='Natural-language task description', min_length=1
    )
    capabilities: list[str] = Field(
        ...,
        description='Required capabilities — e.g. ["reasoning","code","multilingual"]',
    )
    context: dict[constr(pattern=r'^(.*)$'), Any] = Field(
        ..., description='Opaque key/value context passed to the handler'
    )
    priority: Literal['low', 'normal', 'high', 'critical'] = Field(
        ..., description='Agent request priority level'
    )

class TokensUsed(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    input: int = Field(..., ge=0)
    output: int = Field(..., ge=0)


class Conflict(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    other_agent_id: str = Field(
        ..., description='Agent whose WIP conflicts with this request'
    )
    other_task: str = Field(..., description='Conflicting task description')
    similarity: float = Field(
        ..., description='Jaccard or semantic similarity score', ge=0.0, le=1.0
    )
    mode: Literal['advisory', 'blocking'] = Field(
        ...,
        description='Per Gate 4: default is advisory; blocking requires explicit opt-in',
    )
    suggestion: str | None = None


class AgentResponse(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    request_id: UUID = Field(..., description='Echo of AgentRequest.request_id')
    agent_id: str = Field(..., min_length=1)
    status: Literal['success', 'partial', 'failed', 'conflict'] = Field(
        ..., description='Agent response outcome status'
    )
    output: str = Field(
        ..., description='Task output payload (may be empty on failure)'
    )
    tokens_used: TokensUsed = Field(
        ..., description='Token accounting for cost attribution'
    )
    cost_dkk: float = Field(
        ..., description='Cost in DKK (Danish kroner), see LLM matrix', ge=0.0
    )
    conflicts: list[Conflict] = Field(
        ...,
        description='Populated when status=conflict; empty otherwise (Gate 4: advisory by default)',
    )

class AgentResponseStatus(
    RootModel[Literal['success', 'partial', 'failed', 'conflict']]
):
    root: Literal['success', 'partial', 'failed', 'conflict'] = Field(
        ..., description='Agent response outcome status'
    )

class AgentTier(
    RootModel[Literal['ANALYST', 'ASSOCIATE', 'MANAGER', 'PARTNER', 'ARCHITECT']]
):
    root: Literal['ANALYST', 'ASSOCIATE', 'MANAGER', 'PARTNER', 'ARCHITECT'] = Field(
        ..., description='Consulting agent tier (ascending autonomy)'
    )

class AgenticPattern(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: str = Field(
        ...,
        description="Stable pattern identifier with namespace prefix. Format: 'agentic-pattern:<slug>' or 'pattern:<slug>'. Used for cross-repo MATERIALIZED_IN edge keying per ADR-007.",
        pattern='^(agentic-pattern|pattern|metapattern):[a-z0-9-]+$',
    )
    name: str = Field(
        ...,
        description="Human-readable pattern name (e.g. 'Reflection', 'ReAct', 'Chain-of-Thought').",
        min_length=1,
    )
    description: str = Field(
        ...,
        description='1-3 sentence description of what the pattern does and when to apply it. Used by embedPatternsCron to vectorize at 384D for srag.query semantic discovery.',
        min_length=1,
    )
    summary: str | None = Field(
        None,
        description='Optional short-form summary (one-liner) for SITREP and RAG inline use.',
    )
    verdict: Literal['adopt', 'evaluate', 'reject', 'unverified'] | None = Field(
        None,
        description="Adoption verdict from Gulli enrichment audit: 'adopt' | 'evaluate' | 'reject' | 'unverified'.",
    )
    adoption_path: str | None = Field(
        None,
        description='Suggested adoption recipe — when and how this pattern integrates into agent runtime.',
    )
    score: float | None = Field(
        None,
        description='Aggregate quality score (0.0-1.0). Composite of credibility + production-readiness + integration ease.',
        ge=0.0,
        le=1.0,
    )
    canonical_owner_repo: (
        Literal['rlm-engine', 'orchestrator', 'contracts', 'WidgeTDC', 'shared'] | None
    ) = Field(
        None,
        description='Per ADR-007 ownership matrix — which repo canonically owns this pattern (rlm-engine | orchestrator | contracts | WidgeTDC).',
    )
    source: str | None = Field(
        None,
        description='Provenance of pattern — academic paper, GitHub repo URL, internal harvest run, etc.',
    )
    embedding_dim: Literal[384] | None = Field(
        None,
        description='Vector embedding dimension. Canonical: 384 (NEXUS, LIN-818). Other dimensions are orphan assets per Orphan Asset Lifecycle pattern.',
    )
    gulli_chapter: str | None = Field(
        None,
        description='Reference to Gulli reasoning-techniques chapter for cross-document anchoring (Phase Δ harvest).',
    )
    gulli_credibility: (
        Literal['very_low', 'low', 'medium', 'medium_high', 'high'] | None
    ) = Field(
        None,
        description='Gulli-enrichment credibility score (very_low | low | medium | medium_high | high).',
    )
    gulli_match_type: Literal['exact', 'semantic', 'derived', 'novel'] | None = Field(
        None,
        description="Type of match against Gulli corpus: 'exact' | 'semantic' | 'derived' | 'novel'.",
    )
    gulli_strengths: list[str] | None = Field(
        None,
        description='Strengths from Gulli enrichment audit — array of bullet points.',
    )
    gulli_weaknesses: list[str] | None = Field(
        None,
        description='Known weaknesses or failure modes from Gulli enrichment audit.',
    )
    gulli_verdict: str | None = Field(
        None, description='Free-text verdict paragraph from Gulli enrichment.'
    )
    gulli_endorsement: bool | None = Field(
        None,
        description='Whether the pattern is endorsed by the Gulli reasoning-techniques source.',
    )
    gulli_plan_id: str | None = Field(
        None,
        description='Reference to the Gulli enrichment plan_id that produced this pattern record.',
    )
    created_at: AwareDatetime | None = Field(
        None, description='ISO-8601 datetime when the pattern was first registered.'
    )
    last_updated: AwareDatetime | None = Field(
        None, description='ISO-8601 datetime of last content modification.'
    )

class ArchitectureEvent(BaseModel):
    id: str
    type: str
    severity: Literal['P0', 'P1', 'P2', 'P3', 'GREEN'] = Field(
        ..., description='Omega Sentinel threat severity level'
    )
    source: (
        Literal[
            'CLAUSE',
            'SIGNAL',
            'ARGUS',
            'NEXUS',
            'FISCAL',
            'PIPELINE',
            'SYNAPSE',
            'ENGRAM',
            'AEGIS',
            'CLAW',
        ]
        | Literal['OMEGA']
    )
    message: str
    data: dict[constr(pattern=r'^(.*)$'), Any]
    timestamp: AwareDatetime

class CostPer1k(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    input: float = Field(..., ge=0.0)
    output: float = Field(..., ge=0.0)


class CapabilityEntry(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    provider: str = Field(
        ..., description='e.g. "deepseek" | "claude" | "openai" | "gemini"'
    )
    model: str = Field(..., description='Provider-specific model id')
    capabilities: list[str] = Field(
        ..., description='Capabilities this model satisfies'
    )
    max_tokens: int = Field(..., ge=1)
    cost_per_1k: CostPer1k
    latency_p50_ms: float = Field(..., ge=0.0)
    fallback_to: str | None = Field(
        None, description='Next model id to try if this one fails (empty = terminal)'
    )

class CostPer1k(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    input: float = Field(..., ge=0.0)
    output: float = Field(..., ge=0.0)


class Entry(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    provider: str = Field(
        ..., description='e.g. "deepseek" | "claude" | "openai" | "gemini"'
    )
    model: str = Field(..., description='Provider-specific model id')
    capabilities: list[str] = Field(
        ..., description='Capabilities this model satisfies'
    )
    max_tokens: int = Field(..., ge=1)
    cost_per_1k: CostPer1k
    latency_p50_ms: float = Field(..., ge=0.0)
    fallback_to: str | None = Field(
        None, description='Next model id to try if this one fails (empty = terminal)'
    )


class CapabilityMatrix(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    version: str = Field(..., description='Semver, e.g. "1.0.0"')
    entries: list[Entry]

class CircuitState(RootModel[Literal['CLOSED', 'OPEN', 'HALF_OPEN']]):
    root: Literal['CLOSED', 'OPEN', 'HALF_OPEN'] = Field(
        ..., description='Circuit breaker state'
    )

class Violation(BaseModel):
    rule: str
    entity: str
    message: str
    severity: Literal['P0', 'P1', 'P2', 'P3', 'GREEN'] = Field(
        ..., description='Omega Sentinel threat severity level'
    )
    auto_fixable: bool


class ComplianceResult(BaseModel):
    compliant: bool
    violations: list[Violation]
    checked_at: AwareDatetime
    rules_checked: float

class ComplianceViolation(BaseModel):
    rule: str
    entity: str
    message: str
    severity: Literal['P0', 'P1', 'P2', 'P3', 'GREEN'] = Field(
        ..., description='Omega Sentinel threat severity level'
    )
    auto_fixable: bool

class Vote(BaseModel):
    agent_id: Literal[
        'CLAUSE',
        'SIGNAL',
        'ARGUS',
        'NEXUS',
        'FISCAL',
        'PIPELINE',
        'SYNAPSE',
        'ENGRAM',
        'AEGIS',
        'CLAW',
    ] = Field(..., description='Omega Sentinel sub-agent identifier')
    vote: Literal['APPROVE', 'REJECT', 'ABSTAIN']
    reason: str


class OmegaConsensusRequest(BaseModel):
    proposal: str
    required_agents: list[
        Literal[
            'CLAUSE',
            'SIGNAL',
            'ARGUS',
            'NEXUS',
            'FISCAL',
            'PIPELINE',
            'SYNAPSE',
            'ENGRAM',
            'AEGIS',
            'CLAW',
        ]
    ]
    threshold: float = Field(..., description='Required approval ratio', ge=0.0, le=1.0)
    votes: list[Vote]
    result: Literal['APPROVED', 'REJECTED', 'PENDING'] | None = None

class OmegaConsensusVote(BaseModel):
    agent_id: Literal[
        'CLAUSE',
        'SIGNAL',
        'ARGUS',
        'NEXUS',
        'FISCAL',
        'PIPELINE',
        'SYNAPSE',
        'ENGRAM',
        'AEGIS',
        'CLAW',
    ] = Field(..., description='Omega Sentinel sub-agent identifier')
    vote: Literal['APPROVE', 'REJECT', 'ABSTAIN']
    reason: str

class SubAgent(BaseModel):
    agent_id: Literal[
        'CLAUSE',
        'SIGNAL',
        'ARGUS',
        'NEXUS',
        'FISCAL',
        'PIPELINE',
        'SYNAPSE',
        'ENGRAM',
        'AEGIS',
        'CLAW',
    ] = Field(..., description='Omega Sentinel sub-agent identifier')
    name: str
    domain: str
    circuit_state: Literal['CLOSED', 'OPEN', 'HALF_OPEN'] = Field(
        ..., description='Circuit breaker state'
    )
    last_success: AwareDatetime | None = None
    failure_count: float


class PheromoneBoardItem(BaseModel):
    id: str
    agent_id: (
        Literal[
            'CLAUSE',
            'SIGNAL',
            'ARGUS',
            'NEXUS',
            'FISCAL',
            'PIPELINE',
            'SYNAPSE',
            'ENGRAM',
            'AEGIS',
            'CLAW',
        ]
        | Literal['OMEGA']
    )
    type: Literal['INTEL', 'ALERT', 'STATUS', 'REQUEST'] = Field(
        ..., description='Pheromone signal type for stigmergic communication'
    )
    domain: str
    content: str
    intensity: float = Field(..., ge=0.0, le=1.0)
    ttl_hours: float
    deposited_at: AwareDatetime


class Violation(BaseModel):
    rule: str
    entity: str
    message: str
    severity: Literal['P0', 'P1', 'P2', 'P3', 'GREEN'] = Field(
        ..., description='Omega Sentinel threat severity level'
    )
    auto_fixable: bool


class ComplianceStatus(BaseModel):
    compliant: bool
    violations: list[Violation]
    checked_at: AwareDatetime
    rules_checked: float


class OmegaSitrep(BaseModel):
    threat_level: Literal['P0', 'P1', 'P2', 'P3', 'GREEN'] = Field(
        ..., description='Omega Sentinel threat severity level'
    )
    sub_agents: list[SubAgent]
    active_alarms: float
    pheromone_board: list[PheromoneBoardItem]
    compliance_status: ComplianceStatus | None = Field(
        None, description='Omega compliance check result'
    )
    generated_at: AwareDatetime

class PheromoneSignal(BaseModel):
    id: str
    agent_id: (
        Literal[
            'CLAUSE',
            'SIGNAL',
            'ARGUS',
            'NEXUS',
            'FISCAL',
            'PIPELINE',
            'SYNAPSE',
            'ENGRAM',
            'AEGIS',
            'CLAW',
        ]
        | Literal['OMEGA']
    )
    type: Literal['INTEL', 'ALERT', 'STATUS', 'REQUEST'] = Field(
        ..., description='Pheromone signal type for stigmergic communication'
    )
    domain: str
    content: str
    intensity: float = Field(..., ge=0.0, le=1.0)
    ttl_hours: float
    deposited_at: AwareDatetime

class PheromoneType(RootModel[Literal['INTEL', 'ALERT', 'STATUS', 'REQUEST']]):
    root: Literal['INTEL', 'ALERT', 'STATUS', 'REQUEST'] = Field(
        ..., description='Pheromone signal type for stigmergic communication'
    )

class SignalType(
    RootModel[
        Literal[
            'task_started',
            'task_completed',
            'task_failed',
            'escalation',
            'quality_gate',
            'tool_executed',
            'deliverable_generated',
            'insight',
            'warning',
        ]
    ]
):
    root: Literal[
        'task_started',
        'task_completed',
        'task_failed',
        'escalation',
        'quality_gate',
        'tool_executed',
        'deliverable_generated',
        'insight',
        'warning',
    ] = Field(..., description='Agent signal event type')

class SubAgentId(
    RootModel[
        Literal[
            'CLAUSE',
            'SIGNAL',
            'ARGUS',
            'NEXUS',
            'FISCAL',
            'PIPELINE',
            'SYNAPSE',
            'ENGRAM',
            'AEGIS',
            'CLAW',
        ]
    ]
):
    root: Literal[
        'CLAUSE',
        'SIGNAL',
        'ARGUS',
        'NEXUS',
        'FISCAL',
        'PIPELINE',
        'SYNAPSE',
        'ENGRAM',
        'AEGIS',
        'CLAW',
    ] = Field(..., description='Omega Sentinel sub-agent identifier')

class SubAgentStatus(BaseModel):
    agent_id: Literal[
        'CLAUSE',
        'SIGNAL',
        'ARGUS',
        'NEXUS',
        'FISCAL',
        'PIPELINE',
        'SYNAPSE',
        'ENGRAM',
        'AEGIS',
        'CLAW',
    ] = Field(..., description='Omega Sentinel sub-agent identifier')
    name: str
    domain: str
    circuit_state: Literal['CLOSED', 'OPEN', 'HALF_OPEN'] = Field(
        ..., description='Circuit breaker state'
    )
    last_success: AwareDatetime | None = None
    failure_count: float

class ThreatLevel(RootModel[Literal['P0', 'P1', 'P2', 'P3', 'GREEN']]):
    root: Literal['P0', 'P1', 'P2', 'P3', 'GREEN'] = Field(
        ..., description='Omega Sentinel threat severity level'
    )

class TokenUsage(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    input: int = Field(..., ge=0)
    output: int = Field(..., ge=0)

class TuningHypothesis(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: str = Field(
        ...,
        description="Stable hypothesis identifier. Format: 'tuning-hypothesis:<uuid>'.",
        pattern='^tuning-hypothesis:[a-zA-Z0-9-]+$',
    )
    signal_id: str = Field(
        ...,
        description='Reference to the :TuningSignal node that triggered this hypothesis. Edge counterpart: (:TuningHypothesis)-[:GENERATED_FROM]->(:TuningSignal).',
    )
    pattern_id: str = Field(
        ...,
        description='Reference to the :AgenticPattern this hypothesis cites. Edge counterpart: (:TuningHypothesis)-[:CITES_PATTERN]->(:AgenticPattern).',
    )
    proposed_action: str = Field(
        ...,
        description="Human-readable proposed tuning action (e.g. 'reduce_temperature_for_reasoning_domain'). Free text but bounded; the LLM-judge generates this.",
        min_length=1,
    )
    confidence: float = Field(
        ...,
        description='LLM-judge confidence score 0.0-1.0. Used by promotion gate; below 0.7 typically requires re-evaluation.',
        ge=0.0,
        le=1.0,
    )
    status: Literal['proposed', 'approved', 'rejected', 'superseded'] = Field(
        ...,
        description='Hypothesis lifecycle. Valid transitions: proposed→approved, proposed→rejected, proposed→superseded, approved→superseded. rejected and superseded are terminal.',
    )
    proposed_at: AwareDatetime = Field(
        ...,
        description='ISO-8601 datetime when the hypothesis was first generated by the LLM-judge.',
    )
    evidence_window_hours: int | None = Field(
        336,
        description='Observation window in hours used to derive the underlying signal. Default 336 (14d baseline per LIN-1018).',
        ge=1,
    )
    approved_at: AwareDatetime | None = Field(
        None,
        description="ISO-8601 datetime of operator approval. Null until status='approved'.",
    )
    approved_by: Literal['operator', 'hyperagent'] | None = Field(
        None,
        description="Identifier of approver. 'operator' for human; 'hyperagent' for plan-gated approval; null otherwise.",
    )
    rejected_at: AwareDatetime | None = Field(
        None,
        description="ISO-8601 datetime of rejection. Null until status='rejected'.",
    )
    rejected_reason: str | None = Field(
        None,
        description="Human-readable rejection rationale. Required when status='rejected'.",
    )
    superseded_at: AwareDatetime | None = Field(
        None,
        description='ISO-8601 datetime when this hypothesis was replaced by a newer one.',
    )
    superseded_by_id: str | None = Field(
        None,
        description='Forward-reference to the replacing hypothesis id. Edge counterpart: (:TuningHypothesis)-[:REPLACED_BY]->(:TuningHypothesis).',
    )
    correlation_id: str | None = Field(
        None,
        description='Trace-id for observability. Connects this hypothesis to the spine_event chain that produced it.',
    )
    plan_id: str | None = Field(
        None,
        description='Reference to the HyperAgent plan that approved this hypothesis (if approved via plan rather than direct operator).',
    )
    provider: str | None = Field(
        None,
        description="LLM provider that generated the hypothesis (e.g. 'deepseek', 'openai', 'anthropic').",
    )
    model: str | None = Field(
        None, description='Provider-specific model id used by the judge.'
    )
    text_embedding: list[float] | None = Field(
        None,
        description='384D vector embedding of proposed_action for semantic discovery (NEXUS canonical, LIN-818). Stored on :TuningHypothesis.text_embedding via migration 0017 vector index.',
        max_length=384,
        min_length=384,
    )
