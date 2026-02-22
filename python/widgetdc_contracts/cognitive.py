"""
widgetdc_contracts.cognitive — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/cognitive/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, Field, constr
from pydantic import BaseModel
from pydantic import BaseModel, Field
from pydantic import BaseModel, Field, constr
from pydantic import Field, RootModel
from pydantic import RootModel
from typing import Any, Literal
from typing import Literal
from uuid import UUID

__all__ = ["CognitiveConstraints", "CognitiveRequest", "CognitiveResponse", "IntelligenceEvent", "IntelligenceEventType", "QualityScore", "ReasoningMode", "RoutingInfo", "SourceService", "TraceInfo"]

class CognitiveConstraints(BaseModel):
    max_tokens: int | None = Field(None, ge=100, le=32000)
    timeout_ms: int | None = Field(None, ge=1000)
    fold_context: bool | None = True
    preferred_provider: str | None = None

class Constraints(BaseModel):
    max_tokens: int | None = Field(None, ge=100, le=32000)
    timeout_ms: int | None = Field(None, ge=1000)
    fold_context: bool | None = True
    preferred_provider: str | None = None


class CognitiveRequest(BaseModel):
    task: str = Field(..., description='The task or question to process', min_length=1)
    context: dict[constr(pattern=r'^(.*)$'), Any] | None = Field(
        None, description='Task context (domain data, history, constraints)'
    )
    reasoning_mode: Literal['quick', 'deep', 'strategic'] | None = 'quick'
    trace_id: UUID | None = Field(None, description='Cross-service trace ID')
    source_service: Literal['frontend', 'backend', 'rlm-engine'] | None = 'backend'
    domain_hint: str | None = Field(
        None, description='Optional domain hint to skip inference'
    )
    constraints: Constraints | None = None
    recursion_depth: int | None = Field(
        0,
        description='Current recursion depth for cost-aware model selection',
        ge=0,
        le=5,
    )

class Trace(BaseModel):
    trace_id: str
    total_spans: int | None = None
    total_duration_ms: float | None = None


class Quality(BaseModel):
    overall_score: float = Field(..., ge=0.0, le=1.0)
    parsability: float | None = None
    relevance: float | None = None
    completeness: float | None = None


class Routing(BaseModel):
    provider: str
    model: str
    domain: str | None = None
    latency_ms: float | None = None
    cost: float | None = None


class CognitiveResponse(BaseModel):
    recommendation: str | None = Field(
        ..., description='Primary recommendation or answer'
    )
    reasoning: str = Field(
        ..., description='Detailed reasoning behind the recommendation'
    )
    confidence: float = Field(..., description='Model confidence score', ge=0.0, le=1.0)
    reasoning_chain: list[str] | None = Field(
        None, description='Step-by-step reasoning chain (for deep mode)'
    )
    trace: Trace | None = None
    quality: Quality | None = None
    routing: Routing | None = None

class IntelligenceEvent(BaseModel):
    type: Literal[
        'context_folded',
        'routing_decision',
        'recommendation_ready',
        'learning_update',
        'health_change',
        'quality_scored',
        'q_learning_updated',
        'meta_learning_applied',
        'agent_memory_persisted',
        'attention_fold_complete',
        'circuit_breaker_triggered',
        'sse_bridge_connected',
        'error',
    ]
    payload: dict[constr(pattern=r'^(.*)$'), Any] = Field(
        ..., description='Event-type-specific data'
    )
    trace_id: str | None = None
    source: Literal['rlm-engine', 'backend', 'frontend'] | None = 'rlm-engine'
    timestamp: AwareDatetime

class IntelligenceEventType(
    RootModel[
        Literal[
            'context_folded',
            'routing_decision',
            'recommendation_ready',
            'learning_update',
            'health_change',
            'quality_scored',
            'q_learning_updated',
            'meta_learning_applied',
            'agent_memory_persisted',
            'attention_fold_complete',
            'circuit_breaker_triggered',
            'sse_bridge_connected',
            'error',
        ]
    ]
):
    root: Literal[
        'context_folded',
        'routing_decision',
        'recommendation_ready',
        'learning_update',
        'health_change',
        'quality_scored',
        'q_learning_updated',
        'meta_learning_applied',
        'agent_memory_persisted',
        'attention_fold_complete',
        'circuit_breaker_triggered',
        'sse_bridge_connected',
        'error',
    ]

class QualityScore(BaseModel):
    overall_score: float = Field(..., ge=0.0, le=1.0)
    parsability: float | None = None
    relevance: float | None = None
    completeness: float | None = None

class ReasoningMode(RootModel[Literal['quick', 'deep', 'strategic']]):
    root: Literal['quick', 'deep', 'strategic'] = Field(
        ..., description='Reasoning depth for cognitive operations'
    )

class RoutingInfo(BaseModel):
    provider: str
    model: str
    domain: str | None = None
    latency_ms: float | None = None
    cost: float | None = None

class SourceService(RootModel[Literal['frontend', 'backend', 'rlm-engine']]):
    root: Literal['frontend', 'backend', 'rlm-engine'] = Field(
        ..., description='Originating service identifier'
    )

class TraceInfo(BaseModel):
    trace_id: str
    total_spans: int | None = None
    total_duration_ms: float | None = None

