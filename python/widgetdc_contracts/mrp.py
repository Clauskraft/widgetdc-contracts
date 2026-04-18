"""
widgetdc_contracts.mrp — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/mrp/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field
from pydantic import AwareDatetime, BaseModel, Field
from pydantic import BaseModel
from pydantic import BaseModel, ConfigDict, Field
from pydantic import BaseModel, Field
from pydantic import Field, RootModel
from pydantic import RootModel
from typing import Literal
from uuid import UUID

__all__ = ["ArchitectureBom", "BomComponent", "BomComponentKind", "DocumentBom", "DocumentFormat", "DocumentSection", "FoldStrategyChoice", "FoldStrategyDefinition", "FoldTier", "GenericBom", "ProduceRequest", "ProductType", "ProductionOrder", "ProductionOrderStatus", "ProductionOrderVariance"]

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
