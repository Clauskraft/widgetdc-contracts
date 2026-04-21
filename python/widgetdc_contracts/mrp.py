"""
widgetdc_contracts.mrp — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/mrp/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AnyUrl, AwareDatetime, BaseModel, ConfigDict, Field
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field
from pydantic import AwareDatetime, BaseModel, Field
from pydantic import BaseModel
from pydantic import BaseModel, ConfigDict, Field
from pydantic import BaseModel, Field
from pydantic import Field, RootModel
from pydantic import RootModel
from typing import Any, Literal
from typing import Literal
from uuid import UUID

__all__ = ["ArchitectureBom", "BomComponent", "BomComponentKind", "BridgeMessage", "BridgeMessageType", "BuilderTrack", "CanvasIntent", "CanvasNodeSeed", "CanvasResolution", "CanvasTrackOutcome", "ConfiguratorRule", "ConfiguratorRuleMatchKind", "ConfiguratorRuleStatus", "DocumentBom", "DocumentFormat", "DocumentSection", "FitnessVector", "FoldStrategyChoice", "FoldStrategyDefinition", "FoldTier", "GenericBom", "PaneId", "ProduceRequest", "ProductType", "ProductionOrder", "ProductionOrderStatus", "ProductionOrderVariance", "RuleMutationProposal", "RulePrior"]

class ArchitectureBom(BaseModel):
    product_type: Literal['architecture']
    bom_version: Literal['2.0']
    blueprint_id: str | None = None
    title: str
    requirements: list[str]
    constraints: list[str] | None = None

class BomComponent(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    component_id: str
    kind: Literal[
        'phantom_component', 'llm_provider', 'pattern', 'bid', 'slot', 'other'
    ]
    name: str | None = None
    bom_version: Literal['2.0'] = Field(
        ..., description='Normalisation-invariant: all BOM-touched nodes carry this.'
    )
    normalization_complete: bool = Field(
        ...,
        description='True when every required field is filled by the ingest pipeline.',
    )
    last_audited: AwareDatetime | None = None
    provenance: str | None = Field(
        None, description='Source tool / service that produced this component.'
    )
    tier: int | None = Field(
        None,
        description='Sourcing tier (1=internal, 2=external, 3=pattern-built).',
        ge=1,
        le=3,
    )
    capability: str | None = None
    trust_score: float | None = Field(None, ge=0.0, le=1.0)

class BomComponentKind(
    RootModel[
        Literal['phantom_component', 'llm_provider', 'pattern', 'bid', 'slot', 'other']
    ]
):
    root: Literal[
        'phantom_component', 'llm_provider', 'pattern', 'bid', 'slot', 'other'
    ]

class BridgeMessage(BaseModel):
    type: Literal[
        'canvas.ready',
        'canvas.node.create',
        'canvas.node.update',
        'canvas.node.delete',
        'chat.update',
        'chat.message',
        'canvas.export',
        'canvas.error',
    ]
    session_id: UUID
    payload: Any
    ts: AwareDatetime
    origin: str | None = Field(
        None,
        description='Sender window.location.origin; receiver must validate against allowlist.',
    )

class BridgeMessageType(
    RootModel[
        Literal[
            'canvas.ready',
            'canvas.node.create',
            'canvas.node.update',
            'canvas.node.delete',
            'chat.update',
            'chat.message',
            'canvas.export',
            'canvas.error',
        ]
    ]
):
    root: Literal[
        'canvas.ready',
        'canvas.node.create',
        'canvas.node.update',
        'canvas.node.delete',
        'chat.update',
        'chat.message',
        'canvas.export',
        'canvas.error',
    ]

class BuilderTrack(
    RootModel[
        Literal[
            'textual',
            'slide_flow',
            'diagram',
            'architecture',
            'graphical',
            'code',
            'experiment',
        ]
    ]
):
    root: Literal[
        'textual',
        'slide_flow',
        'diagram',
        'architecture',
        'graphical',
        'code',
        'experiment',
    ] = Field(
        ...,
        description='7 canonical builder tracks; canvas routes to the right one via configurator rules.',
    )

class CanvasIntent(BaseModel):
    user_text: str = Field(
        ..., description='Free-form chat brief from the user.', min_length=1
    )
    surface_hint: Literal['pane', 'full', 'overlay'] | None = None
    sequence_step: int | None = Field(
        None, description='Multi-turn counter; >0 enables sticky-track rule.', ge=0
    )
    prior_track: (
        Literal[
            'textual',
            'slide_flow',
            'diagram',
            'architecture',
            'graphical',
            'code',
            'experiment',
        ]
        | None
    ) = Field(
        None,
        description='7 canonical builder tracks; canvas routes to the right one via configurator rules.',
    )
    compliance_tier: Literal['public', 'internal', 'legal', 'health'] | None = None
    host_origin: str | None = Field(
        None, description='Embedding host URL (e.g. open-webui, librechat, office).'
    )
    agent_id: str | None = None

class CanvasNodeSeed(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    label: str
    type: str = Field(
        ...,
        description='CanvasNodeType from widgetdc-canvas (e.g. Artifact, Pattern, Agent).',
    )
    payload: Any = Field(
        ..., description='Free-form node payload; shape depends on type.'
    )
    pane: Literal['canvas', 'markdown', 'slides', 'drawio', 'split'] | None = None

PreSeededNode = CanvasNodeSeed

class CanvasResolution(BaseModel):
    track: Literal[
        'textual',
        'slide_flow',
        'diagram',
        'architecture',
        'graphical',
        'code',
        'experiment',
    ] = Field(
        ...,
        description='7 canonical builder tracks; canvas routes to the right one via configurator rules.',
    )
    initial_pane: Literal['canvas', 'markdown', 'slides', 'drawio', 'split']
    canvas_session_id: UUID
    embed_url: AnyUrl = Field(
        ..., description='widgetdc-canvas URL with ?session=<id> — host iframes this.'
    )
    pre_seeded_nodes: list[PreSeededNode] | None = None
    rationale: list[str] = Field(
        ...,
        description='Ordered list of configurator-rule IDs that matched, most-recent last.',
    )
    fold_strategy: str | None = Field(
        None, description='FoldTier (T1..T7) when input > 5k tokens.'
    )
    bom_version: Literal['2.0']
    resolved_at: AwareDatetime

class CanvasTrackOutcome(BaseModel):
    outcome_id: UUID
    session_id: UUID = Field(..., description='FK to :CanvasSession')
    matched_rule_ids: list[str] = Field(
        ..., description='Ordered list of rules that fired for this resolution.'
    )
    winning_rule_id: str = Field(
        ..., description='The rule that actually determined the track (first match).'
    )
    resolved_track: Literal[
        'textual',
        'slide_flow',
        'diagram',
        'architecture',
        'graphical',
        'code',
        'experiment',
    ] = Field(
        ...,
        description='7 canonical builder tracks; canvas routes to the right one via configurator rules.',
    )
    user_satisfaction: float | None = Field(
        None,
        description='+1 user kept/exported, 0 neutral/unknown, -1 user abandoned or picked different track.',
        ge=-1.0,
        le=1.0,
    )
    artifact_quality_score: float | None = Field(
        None,
        description='Auto-computed from :ProductionOrder.variance.quality_score when session closes.',
        ge=0.0,
        le=1.0,
    )
    duration_ms: int | None = Field(None, ge=0)
    host_origin: str | None = None
    created_at: AwareDatetime
    bom_version: Literal['2.0']

class ConfiguratorRule(BaseModel):
    rule_id: str = Field(
        ..., description='Stable identifier, e.g. "diag-intent" or "fallback".'
    )
    track: Literal[
        'textual',
        'slide_flow',
        'diagram',
        'architecture',
        'graphical',
        'code',
        'experiment',
    ] = Field(
        ...,
        description='7 canonical builder tracks; canvas routes to the right one via configurator rules.',
    )
    match_kind: Literal['regex', 'length', 'feature', 'composite', 'fallback']
    priority: int = Field(
        ..., description='Top-down evaluation order; lower = checked first.'
    )
    weight: float = Field(
        ...,
        description='Reward-driven weight; top-performers float up in priority.',
        ge=0.0,
        le=10.0,
    )
    status: Literal['active', 'shadow', 'disabled', 'proposed']
    pattern: str | None = Field(
        None, description='Regex pattern string for match_kind=regex.'
    )
    feature_expr: str | None = Field(
        None,
        description='Predicate expression for match_kind=feature, e.g. "sequence_step>0 && prior_track!=null".',
    )
    description: str | None = None
    created_at: AwareDatetime
    updated_at: AwareDatetime
    last_applied_at: AwareDatetime | None = None
    authored_by: str | None = None
    bom_version: Literal['2.0']

class ConfiguratorRuleMatchKind(
    RootModel[Literal['regex', 'length', 'feature', 'composite', 'fallback']]
):
    root: Literal['regex', 'length', 'feature', 'composite', 'fallback']

class ConfiguratorRuleStatus(
    RootModel[Literal['active', 'shadow', 'disabled', 'proposed']]
):
    root: Literal['active', 'shadow', 'disabled', 'proposed']

class Section(BaseModel):
    heading: str
    content: str
    level: int | None = Field(2, ge=1, le=6)
    citations: list[str] | None = None


class DocumentBom(BaseModel):
    product_type: Literal['document']
    bom_version: Literal['2.0']
    title: str
    sections: list[Section]
    format: Literal['docx', 'pdf', 'html', 'md'] | None = None
    citations: list[str] | None = None
    language: str | None = None

class DocumentFormat(RootModel[Literal['docx', 'pdf', 'html', 'md']]):
    root: Literal['docx', 'pdf', 'html', 'md']

class DocumentSection(BaseModel):
    heading: str
    content: str
    level: int | None = Field(2, ge=1, le=6)
    citations: list[str] | None = None

class FitnessVector(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    correctness: float = Field(
        ..., description='Normalized score in [0,1]', ge=0.0, le=1.0
    )
    performance: float = Field(
        ..., description='Normalized score in [0,1]', ge=0.0, le=1.0
    )
    cost: float = Field(..., description='Normalized score in [0,1]', ge=0.0, le=1.0)
    compliance: float = Field(
        ..., description='Normalized score in [0,1]', ge=0.0, le=1.0
    )
    novelty: float = Field(..., description='Normalized score in [0,1]', ge=0.0, le=1.0)
    provenance: float = Field(
        ..., description='Normalized score in [0,1]', ge=0.0, le=1.0
    )

class Definition(BaseModel):
    tier: Literal['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] = Field(
        ...,
        description='T1 (no-op) through T7 (hierarchical-reason) compression strategies.',
    )
    name: str
    max_input_tokens: int = Field(..., ge=0)
    target_compression_ratio: float = Field(..., ge=0.0, le=1.0)
    expected_latency_ms: int | None = None
    preserves_detail: bool | None = None


class FoldStrategyChoice(BaseModel):
    strategy: Literal['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] = Field(
        ...,
        description='T1 (no-op) through T7 (hierarchical-reason) compression strategies.',
    )
    rationale: list[str] = Field(
        ..., description='Ordered list of reasons the selector picked this tier.'
    )
    definition: Definition
    input_tokens: int | None = None
    selected_at: AwareDatetime | None = None

class FoldStrategyDefinition(BaseModel):
    tier: Literal['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] = Field(
        ...,
        description='T1 (no-op) through T7 (hierarchical-reason) compression strategies.',
    )
    name: str
    max_input_tokens: int = Field(..., ge=0)
    target_compression_ratio: float = Field(..., ge=0.0, le=1.0)
    expected_latency_ms: int | None = None
    preserves_detail: bool | None = None

class FoldTier(RootModel[Literal['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']]):
    root: Literal['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] = Field(
        ...,
        description='T1 (no-op) through T7 (hierarchical-reason) compression strategies.',
    )

class GenericBom(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    product_type: Literal[
        'architecture', 'document', 'presentation', 'diagram', 'pdf', 'code'
    ] = Field(..., description='Kind of artifact the MRP pipeline should produce.')
    bom_version: Literal['2.0']

class PaneId(RootModel[Literal['canvas', 'markdown', 'slides', 'drawio', 'split']]):
    root: Literal['canvas', 'markdown', 'slides', 'drawio', 'split']

class Section(BaseModel):
    heading: str
    content: str
    level: int | None = Field(2, ge=1, le=6)
    citations: list[str] | None = None


class Bom(BaseModel):
    product_type: Literal['document']
    bom_version: Literal['2.0']
    title: str
    sections: list[Section]
    format: Literal['docx', 'pdf', 'html', 'md'] | None = None
    citations: list[str] | None = None
    language: str | None = None


class Bom1(BaseModel):
    product_type: Literal['architecture']
    bom_version: Literal['2.0']
    blueprint_id: str | None = None
    title: str
    requirements: list[str]
    constraints: list[str] | None = None


class Bom2(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    product_type: Literal[
        'architecture', 'document', 'presentation', 'diagram', 'pdf', 'code'
    ] = Field(..., description='Kind of artifact the MRP pipeline should produce.')
    bom_version: Literal['2.0']


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


class ProduceRequest(BaseModel):
    product_type: Literal[
        'architecture', 'document', 'presentation', 'diagram', 'pdf', 'code'
    ] = Field(..., description='Kind of artifact the MRP pipeline should produce.')
    brief: str | None = Field(
        None,
        description='Free-form user intent; resolved to a BOM by briefToSections/RLM fold.',
    )
    bom: Bom | Bom1 | Bom2 | None = None
    field_request_features: FieldRequestFeatures | None = Field(
        None,
        alias='_request_features',
        description='Normalised feature vector consumed by the 12-step intelligence interceptor.',
    )
    agent_id: str | None = Field(
        None, description='Optional WebSocket correlation id for streaming progress.'
    )

class ProductType(
    RootModel[
        Literal['architecture', 'document', 'presentation', 'diagram', 'pdf', 'code']
    ]
):
    root: Literal[
        'architecture', 'document', 'presentation', 'diagram', 'pdf', 'code'
    ] = Field(..., description='Kind of artifact the MRP pipeline should produce.')

class Variance(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    sourced_components: int | None = Field(None, ge=0)
    planned_sections: int | None = Field(None, ge=0)
    actual_sections: int | None = Field(None, ge=0)
    planned_cost_usd: float | None = None
    actual_cost_usd: float | None = None
    planned_latency_ms: int | None = None
    actual_latency_ms: int | None = None
    quality_score: float | None = Field(None, ge=0.0, le=1.0)


class ProductionOrder(BaseModel):
    order_id: UUID
    product_type: Literal[
        'architecture', 'document', 'presentation', 'diagram', 'pdf', 'code'
    ] = Field(..., description='Kind of artifact the MRP pipeline should produce.')
    status: Literal['open', 'running', 'closed', 'failed']
    planned_at: AwareDatetime
    started_at: AwareDatetime | None = None
    completed_at: AwareDatetime | None = None
    failed_at: AwareDatetime | None = None
    failure_reason: str | None = None
    variance: Variance
    bom_version: Literal['2.0']
    compliance_tier: str | None = None
    cluster: str | None = None
    provider_id: str | None = None
    trace_id: UUID | None = None
    agent_id: str | None = None

class ProductionOrderStatus(RootModel[Literal['open', 'running', 'closed', 'failed']]):
    root: Literal['open', 'running', 'closed', 'failed']

class ProductionOrderVariance(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    sourced_components: int | None = Field(None, ge=0)
    planned_sections: int | None = Field(None, ge=0)
    actual_sections: int | None = Field(None, ge=0)
    planned_cost_usd: float | None = None
    actual_cost_usd: float | None = None
    planned_latency_ms: int | None = None
    actual_latency_ms: int | None = None
    quality_score: float | None = Field(None, ge=0.0, le=1.0)

ProposedRule = ConfiguratorRule

class RuleMutationProposal(BaseModel):
    proposal_id: UUID
    proposed_rule: ProposedRule = Field(
        ...,
        description='Graph-persisted :ConfiguratorRule node; read by CanvasIntentConfigurator.resolve(), mutated by CanvasRuleEvolver.',
    )
    rationale: str = Field(
        ..., description='Why InventorProxy thinks this rule improves coverage.'
    )
    shadow_test_episode_count: int = Field(..., ge=0)
    shadow_test_reward_avg: float = Field(..., ge=-1.0, le=1.0)
    baseline_reward_avg: float = Field(
        ...,
        description='Reward average of the rule this would replace/augment.',
        ge=-1.0,
        le=1.0,
    )
    graduation_status: Literal['pending', 'graduated', 'rejected']
    graduation_threshold: float = Field(
        ..., description='Minimum reward_avg uplift required to graduate.'
    )
    proposed_at: AwareDatetime
    graduated_at: AwareDatetime | None = None
    bom_version: Literal['2.0']

class RulePrior(BaseModel):
    rule_id: str
    window_days: int = Field(..., ge=1)
    episode_count: int = Field(..., ge=0)
    reward_avg: float = Field(..., ge=-1.0, le=1.0)
    quality_avg: float = Field(..., ge=0.0, le=1.0)
    weight_delta: float = Field(
        ..., description='Proposed weight adjustment (applied after shadow-test).'
    )
    computed_at: AwareDatetime
    bom_version: Literal['2.0']
