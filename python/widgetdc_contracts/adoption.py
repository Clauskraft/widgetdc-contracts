"""
widgetdc_contracts.adoption — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/adoption/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, Field
from pydantic import BaseModel
from pydantic import BaseModel, Field
from pydantic import BaseModel, Field, RootModel
from pydantic import BaseModel, Field, constr
from pydantic import Field, RootModel
from typing import Any, Literal
from typing import Literal

__all__ = ["AnalysisArtifact", "AnalysisBlock", "ArtifactSource", "ArtifactStatus", "ChartBlock", "ComplexityTier", "ConsensusOutcome", "ConsensusProposal", "ConsensusResult", "ConsensusVote", "CypherBlock", "DeepLinkBlock", "DegradationTier", "GraphRefs", "HistogramStats", "KpiCardBlock", "LLMTier", "MermaidBlock", "MetricsSummary", "RewardDimension", "RewardEntry", "RewardVector", "RewardWeights", "RolloutEntry", "RolloutMetrics", "RolloutState", "RolloutSummary", "TableBlock", "TextBlock", "VoteDecision"]

class Blocks(BaseModel):
    type: Literal['text']
    id: str
    title: str | None = None
    content: str


class Blocks1(BaseModel):
    type: Literal['table']
    id: str
    title: str | None = None
    headers: list[str]
    rows: list[list[str]]


class Blocks2(BaseModel):
    type: Literal['chart']
    id: str
    title: str | None = None
    chart_type: Literal['bar', 'line', 'radar', 'sankey']
    data: dict[str, Any]
    config: dict[str, Any] | None = None


class Blocks3(BaseModel):
    type: Literal['cypher']
    id: str
    title: str | None = None
    query: str
    cached_result: dict[str, Any] | None = None


class Blocks4(BaseModel):
    type: Literal['mermaid']
    id: str
    title: str | None = None
    source: str


class Blocks5(BaseModel):
    type: Literal['kpi_card']
    id: str
    title: str | None = None
    label: str
    value: float | str
    unit: str | None = None
    trend: Literal['up', 'down', 'flat'] | None = None


class Blocks6(BaseModel):
    type: Literal['deep_link']
    id: str
    title: str | None = None
    target: Literal['obsidian', 'open-webui']
    uri: str
    label: str


class GraphRefs(BaseModel):
    node_ids: list[str]
    domains: list[str]


class AnalysisArtifact(BaseModel):
    field_id: str = Field(..., alias='$id', description='widgetdc:artifact:{uuid}')
    field_schema: Literal['widgetdc:analysis:v1'] = Field(..., alias='$schema')
    title: str
    source: Literal['open-webui', 'obsidian', 'orchestrator'] = Field(
        ..., description='System that created the artifact'
    )
    created_at: AwareDatetime = Field(..., description='ISO 8601 timestamp')
    updated_at: AwareDatetime = Field(..., description='ISO 8601 timestamp')
    created_by: str = Field(..., description='Agent or user ID')
    blocks: list[Blocks | Blocks1 | Blocks2 | Blocks3 | Blocks4 | Blocks5 | Blocks6]
    graph_refs: GraphRefs | None = Field(
        None, description='Neo4j graph node and domain references'
    )
    tags: list[str]
    status: Literal['draft', 'published', 'archived'] = Field(
        ..., description='Artifact lifecycle status'
    )

class AnalysisBlock1(BaseModel):
    type: Literal['text']
    id: str
    title: str | None = None
    content: str


class AnalysisBlock2(BaseModel):
    type: Literal['table']
    id: str
    title: str | None = None
    headers: list[str]
    rows: list[list[str]]


class AnalysisBlock3(BaseModel):
    type: Literal['chart']
    id: str
    title: str | None = None
    chart_type: Literal['bar', 'line', 'radar', 'sankey']
    data: dict[str, Any]
    config: dict[str, Any] | None = None


class AnalysisBlock4(BaseModel):
    type: Literal['cypher']
    id: str
    title: str | None = None
    query: str
    cached_result: dict[str, Any] | None = None


class AnalysisBlock5(BaseModel):
    type: Literal['mermaid']
    id: str
    title: str | None = None
    source: str


class AnalysisBlock6(BaseModel):
    type: Literal['kpi_card']
    id: str
    title: str | None = None
    label: str
    value: float | str
    unit: str | None = None
    trend: Literal['up', 'down', 'flat'] | None = None


class AnalysisBlock7(BaseModel):
    type: Literal['deep_link']
    id: str
    title: str | None = None
    target: Literal['obsidian', 'open-webui']
    uri: str
    label: str


class AnalysisBlock(
    RootModel[
        AnalysisBlock1
        | AnalysisBlock2
        | AnalysisBlock3
        | AnalysisBlock4
        | AnalysisBlock5
        | AnalysisBlock6
        | AnalysisBlock7
    ]
):
    root: (
        AnalysisBlock1
        | AnalysisBlock2
        | AnalysisBlock3
        | AnalysisBlock4
        | AnalysisBlock5
        | AnalysisBlock6
        | AnalysisBlock7
    ) = Field(..., description='Analysis content block (discriminated on type)')

class ArtifactSource(RootModel[Literal['open-webui', 'obsidian', 'orchestrator']]):
    root: Literal['open-webui', 'obsidian', 'orchestrator'] = Field(
        ..., description='System that created the artifact'
    )

class ArtifactStatus(RootModel[Literal['draft', 'published', 'archived']]):
    root: Literal['draft', 'published', 'archived'] = Field(
        ..., description='Artifact lifecycle status'
    )

class ChartBlock(BaseModel):
    type: Literal['chart']
    id: str
    title: str | None = None
    chart_type: Literal['bar', 'line', 'radar', 'sankey']
    data: dict[str, Any]
    config: dict[str, Any] | None = None

class ComplexityTier(RootModel[Literal['simple', 'moderate', 'advanced', 'complex']]):
    root: Literal['simple', 'moderate', 'advanced', 'complex'] = Field(
        ..., description='MCP tool complexity classification'
    )

class ConsensusOutcome(
    RootModel[Literal['committed', 'aborted', 'pending', 'expired']]
):
    root: Literal['committed', 'aborted', 'pending', 'expired'] = Field(
        ..., description='Consensus proposal outcome'
    )

class Vote(BaseModel):
    voter: str = Field(..., description='Voter agent ID')
    decision: Literal['approve', 'reject', 'abstain'] = Field(
        ..., description='Consensus vote decision'
    )
    confidence: float = Field(..., description='Confidence 0.0-1.0', ge=0.0, le=1.0)
    rationale: str = Field(..., description='Reason for decision')
    timestamp: float = Field(..., description='Unix timestamp ms')


class ConsensusProposal(BaseModel):
    id: str = Field(..., description='Proposal ID')
    title: str = Field(..., description='Proposal title')
    description: str = Field(..., description='Detailed description')
    proposed_by: str = Field(..., description='Proposer agent ID')
    quorum: int = Field(..., description='Required voters for quorum', ge=1)
    confidence_threshold: float = Field(
        ..., description='Min weighted confidence for approval', ge=0.0, le=1.0
    )
    expiry_ms: int = Field(..., description='Expiry duration in ms')
    created_at: float = Field(..., description='Unix timestamp ms')
    outcome: Literal['committed', 'aborted', 'pending', 'expired'] = Field(
        ..., description='Consensus proposal outcome'
    )
    votes: list[Vote]

class ConsensusResult(BaseModel):
    proposal_id: str
    outcome: Literal['committed', 'aborted', 'pending', 'expired'] = Field(
        ..., description='Consensus proposal outcome'
    )
    total_votes: int
    approvals: int
    rejections: int
    abstentions: int
    weighted_confidence: float = Field(..., ge=0.0, le=1.0)
    quorum_met: bool
    threshold_met: bool

class ConsensusVote(BaseModel):
    voter: str = Field(..., description='Voter agent ID')
    decision: Literal['approve', 'reject', 'abstain'] = Field(
        ..., description='Consensus vote decision'
    )
    confidence: float = Field(..., description='Confidence 0.0-1.0', ge=0.0, le=1.0)
    rationale: str = Field(..., description='Reason for decision')
    timestamp: float = Field(..., description='Unix timestamp ms')

class CypherBlock(BaseModel):
    type: Literal['cypher']
    id: str
    title: str | None = None
    query: str
    cached_result: dict[str, Any] | None = None

class DeepLinkBlock(BaseModel):
    type: Literal['deep_link']
    id: str
    title: str | None = None
    target: Literal['obsidian', 'open-webui']
    uri: str
    label: str

class DegradationTier(
    RootModel[Literal['full', 'cached', 'fallback', 'static', 'unavailable']]
):
    root: Literal['full', 'cached', 'fallback', 'static', 'unavailable'] = Field(
        ..., description='Service degradation tier'
    )

class GraphRefs(BaseModel):
    node_ids: list[str]
    domains: list[str]

class HistogramStats(BaseModel):
    count: int = Field(..., ge=0)
    sum: float
    avg: float
    p50: float
    p95: float
    p99: float

class KpiCardBlock(BaseModel):
    type: Literal['kpi_card']
    id: str
    title: str | None = None
    label: str
    value: float | str
    unit: str | None = None
    trend: Literal['up', 'down', 'flat'] | None = None

class LLMTier(RootModel[Literal[1, 2, 3]]):
    root: Literal[1, 2, 3] = Field(
        ..., description='LLM routing tier (1=Flash, 2=Standard, 3=Premium)'
    )

class MermaidBlock(BaseModel):
    type: Literal['mermaid']
    id: str
    title: str | None = None
    source: str

class Histograms(BaseModel):
    count: int = Field(..., ge=0)
    sum: float
    avg: float
    p50: float
    p95: float
    p99: float


class MetricsSummary(BaseModel):
    counters: dict[constr(pattern=r'^(.*)$'), float] = Field(
        ..., description='Counter metrics'
    )
    gauges: dict[constr(pattern=r'^(.*)$'), float] = Field(
        ..., description='Gauge metrics'
    )
    histograms: dict[constr(pattern=r'^(.*)$'), Histograms] = Field(
        ..., description='Histogram metrics with percentiles'
    )
    collected_at: float = Field(..., description='Unix timestamp ms')

class RewardDimension(
    RootModel[Literal['quality', 'latency', 'cost', 'satisfaction', 'reliability']]
):
    root: Literal['quality', 'latency', 'cost', 'satisfaction', 'reliability'] = Field(
        ..., description='Reward signal dimension'
    )

class Vector(BaseModel):
    quality: float = Field(..., description='Output quality score', ge=0.0, le=10.0)
    latency: float = Field(..., description='Speed score (10=fastest)', ge=0.0, le=10.0)
    cost: float = Field(
        ..., description='Cost efficiency (10=cheapest)', ge=0.0, le=10.0
    )
    satisfaction: float = Field(
        ..., description='User/agent satisfaction', ge=0.0, le=10.0
    )
    reliability: float = Field(
        ..., description='Completion without errors', ge=0.0, le=10.0
    )


class RewardEntry(BaseModel):
    task_id: str = Field(..., description='Task/decision ID')
    agent_id: str = Field(..., description='Agent persona that executed')
    action: str = Field(..., description='Action taken (tool or persona)')
    vector: Vector = Field(
        ..., description='Multi-dimensional Q-learning reward signal'
    )
    composite: float = Field(..., description='Weighted composite score 0-10')
    timestamp: float = Field(..., description='Unix timestamp ms')

class RewardVector(BaseModel):
    quality: float = Field(..., description='Output quality score', ge=0.0, le=10.0)
    latency: float = Field(..., description='Speed score (10=fastest)', ge=0.0, le=10.0)
    cost: float = Field(
        ..., description='Cost efficiency (10=cheapest)', ge=0.0, le=10.0
    )
    satisfaction: float = Field(
        ..., description='User/agent satisfaction', ge=0.0, le=10.0
    )
    reliability: float = Field(
        ..., description='Completion without errors', ge=0.0, le=10.0
    )

class RewardWeights(BaseModel):
    quality: float = Field(..., ge=0.0, le=1.0)
    latency: float = Field(..., ge=0.0, le=1.0)
    cost: float = Field(..., ge=0.0, le=1.0)
    satisfaction: float = Field(..., ge=0.0, le=1.0)
    reliability: float = Field(..., ge=0.0, le=1.0)

class Metrics(BaseModel):
    invocations: int = Field(..., ge=0)
    failures: int = Field(..., ge=0)
    avg_latency_ms: float = Field(..., ge=0.0)


class RolloutEntry(BaseModel):
    feature_id: str = Field(..., description='Feature/tool identifier')
    state: Literal['active', 'degraded', 'disabled', 'canary'] = Field(
        ..., description='Feature rollout state'
    )
    rollout_pct: float = Field(..., description='Traffic percentage', ge=0.0, le=100.0)
    updated_at: float = Field(..., description='Unix timestamp ms of last state change')
    changed_by: str = Field(..., description='Who/what changed state')
    reason: str = Field(..., description='Reason for current state')
    expires_at: float | None = Field(None, description='Auto-disable timestamp')
    metrics: Metrics = Field(..., description='Rollout invocation metrics')

class RolloutMetrics(BaseModel):
    invocations: int = Field(..., ge=0)
    failures: int = Field(..., ge=0)
    avg_latency_ms: float = Field(..., ge=0.0)

class RolloutState(RootModel[Literal['active', 'degraded', 'disabled', 'canary']]):
    root: Literal['active', 'degraded', 'disabled', 'canary'] = Field(
        ..., description='Feature rollout state'
    )

class Metrics(BaseModel):
    invocations: int = Field(..., ge=0)
    failures: int = Field(..., ge=0)
    avg_latency_ms: float = Field(..., ge=0.0)


class Feature(BaseModel):
    feature_id: str = Field(..., description='Feature/tool identifier')
    state: Literal['active', 'degraded', 'disabled', 'canary'] = Field(
        ..., description='Feature rollout state'
    )
    rollout_pct: float = Field(..., description='Traffic percentage', ge=0.0, le=100.0)
    updated_at: float = Field(..., description='Unix timestamp ms of last state change')
    changed_by: str = Field(..., description='Who/what changed state')
    reason: str = Field(..., description='Reason for current state')
    expires_at: float | None = Field(None, description='Auto-disable timestamp')
    metrics: Metrics = Field(..., description='Rollout invocation metrics')


class RolloutSummary(BaseModel):
    total: int
    active: int
    degraded: int
    disabled: int
    canary: int
    features: list[Feature]

class TableBlock(BaseModel):
    type: Literal['table']
    id: str
    title: str | None = None
    headers: list[str]
    rows: list[list[str]]

class TextBlock(BaseModel):
    type: Literal['text']
    id: str
    title: str | None = None
    content: str

class VoteDecision(RootModel[Literal['approve', 'reject', 'abstain']]):
    root: Literal['approve', 'reject', 'abstain'] = Field(
        ..., description='Consensus vote decision'
    )
