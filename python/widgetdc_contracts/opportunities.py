"""
widgetdc_contracts.opportunities — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/opportunities/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, Field
from pydantic import AwareDatetime, BaseModel, Field, constr
from pydantic import BaseModel, Field
from typing import Any, Literal

__all__ = ["IntelligenceObservation", "SalienceVector", "TenderOpportunity", "WinProbabilityScore"]

class Vector(BaseModel):
    dimension: str = Field(..., description='e.g., DomainMatch, ResourceAvailability')
    raw_value: float = Field(..., description='Raw calculated value', ge=0.0, le=1.0)
    weight: float = Field(
        ..., description='Importance multiplier for this use-case', ge=0.0
    )
    score: float = Field(..., description='raw_value * weight')


class IntelligenceScore(BaseModel):
    overall_score: float = Field(
        ..., description='Final aggregated 0-100 win probability', ge=0.0, le=100.0
    )
    confidence: float = Field(
        ..., description='Statistical confidence in the prediction', ge=0.0, le=1.0
    )
    vectors: list[Vector] = Field(
        ..., description='The individual factors making up the score'
    )
    is_go: bool = Field(..., description='True if overall_score > threshold')
    assessed_at: AwareDatetime


class IntelligenceObservation(BaseModel):
    observation_id: str = Field(
        ..., description='Unique identifier (hash or source ID)'
    )
    source_type: Literal[
        'MEDIA',
        'CODE_REPO',
        'FINANCIAL',
        'GOVERNMENT_DATA',
        'LEGAL_TENDER',
        'CYBER_SIGNAL',
    ]
    title: str
    content_summary: str
    actor_name: str = Field(..., description='e.g. Agency name or Vendor name')
    metadata: dict[constr(pattern=r'^(.*)$'), Any] = Field(
        ..., description='Dynamic fields like budget, github_stars, or CVE_id'
    )
    timestamp: AwareDatetime
    source_url: str | None = None
    intelligence_score: IntelligenceScore | None = Field(
        None, description='Aggregated intelligence assessment'
    )

class SalienceVector(BaseModel):
    dimension: str = Field(..., description='e.g., DomainMatch, ResourceAvailability')
    raw_value: float = Field(..., description='Raw calculated value', ge=0.0, le=1.0)
    weight: float = Field(
        ..., description='Importance multiplier for this use-case', ge=0.0
    )
    score: float = Field(..., description='raw_value * weight')

class Vector(BaseModel):
    dimension: str = Field(..., description='e.g., DomainMatch, ResourceAvailability')
    raw_value: float = Field(..., description='Raw calculated value', ge=0.0, le=1.0)
    weight: float = Field(
        ..., description='Importance multiplier for this use-case', ge=0.0
    )
    score: float = Field(..., description='raw_value * weight')


class IntelligenceScore(BaseModel):
    overall_score: float = Field(
        ..., description='Final aggregated 0-100 win probability', ge=0.0, le=100.0
    )
    confidence: float = Field(
        ..., description='Statistical confidence in the prediction', ge=0.0, le=1.0
    )
    vectors: list[Vector] = Field(
        ..., description='The individual factors making up the score'
    )
    is_go: bool = Field(..., description='True if overall_score > threshold')
    assessed_at: AwareDatetime


class TenderOpportunity(BaseModel):
    opportunity_id: str = Field(
        ..., description='Unique identifier from source (e.g. TED/EU)'
    )
    title: str
    description: str
    buyer_name: str
    estimated_budget_eur: float | None = None
    deadline: AwareDatetime
    source_url: str | None = None
    compliance_tags: list[str] = Field(
        ..., description='Extracted regulatory keywords (e.g. NIS2, GDPR)'
    )
    intelligence_score: IntelligenceScore | None = Field(
        None, description='Aggregated intelligence assessment'
    )

class Vector(BaseModel):
    dimension: str = Field(..., description='e.g., DomainMatch, ResourceAvailability')
    raw_value: float = Field(..., description='Raw calculated value', ge=0.0, le=1.0)
    weight: float = Field(
        ..., description='Importance multiplier for this use-case', ge=0.0
    )
    score: float = Field(..., description='raw_value * weight')


class WinProbabilityScore(BaseModel):
    overall_score: float = Field(
        ..., description='Final aggregated 0-100 win probability', ge=0.0, le=100.0
    )
    confidence: float = Field(
        ..., description='Statistical confidence in the prediction', ge=0.0, le=1.0
    )
    vectors: list[Vector] = Field(
        ..., description='The individual factors making up the score'
    )
    is_go: bool = Field(..., description='True if overall_score > threshold')
    assessed_at: AwareDatetime
