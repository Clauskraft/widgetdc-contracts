"""
widgetdc_contracts.health — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/health/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel
from pydantic import AwareDatetime, BaseModel, constr
from pydantic import AwareDatetime, BaseModel, Field, constr
from pydantic import BaseModel
from pydantic import BaseModel, Field
from pydantic import RootModel
from typing import Literal

__all__ = ["ComponentHealth", "DomainProfile", "HealthPulse", "HealthStatus", "MetaLearningStats", "ModuleStatus", "ServiceResources", "ServiceStatus"]

class ComponentHealth(BaseModel):
    status: str
    latency_ms: float | None = None
    last_check: AwareDatetime | None = None

class DomainProfile(BaseModel):
    name: str = Field(..., description='Canonical domain name')
    competencies: list[str] = Field(
        ..., description='List of competencies within this domain'
    )
    frameworks: list[str] | None = Field(
        None, description='Consulting frameworks applicable'
    )
    kpis: list[str] | None = Field(
        None, description='Key Performance Indicators tracked'
    )
    agent_count: int | None = Field(
        None, description='Number of agents specialized in this domain'
    )
    strength: Literal['emerging', 'moderate', 'strong', 'expert'] | None = Field(
        None, description='Domain maturity level'
    )

class Resources(BaseModel):
    memory_mb: float | None = None
    cpu_percent: float | None = None
    neo4j_connected: bool | None = None
    redis_connected: bool | None = None
    postgres_connected: bool | None = None


class HealthPulse(BaseModel):
    service: Literal['frontend', 'backend', 'rlm-engine'] = Field(
        ..., description='Service identifier'
    )
    status: Literal['healthy', 'degraded', 'unhealthy', 'starting']
    uptime_seconds: float = Field(..., description='Seconds since service started')
    last_request_ms: float | None = Field(
        None, description='Latency of last processed request'
    )
    active_sessions: int | None = Field(
        None, description='Number of active sessions/connections'
    )
    modules: (
        dict[
            constr(pattern=r'^(.*)$'),
            Literal['active', 'degraded', 'inactive', 'error'],
        ]
        | None
    ) = Field(None, description='Status of each module/subsystem')
    resources: Resources | None = None
    last_error: str | None = Field(
        None, description='Last error message, null if no recent errors'
    )
    version: str | None = None
    timestamp: AwareDatetime

class Components(BaseModel):
    status: str
    latency_ms: float | None = None
    last_check: AwareDatetime | None = None


class MetaLearning(BaseModel):
    domains_tracked: int | None = None
    total_llm_calls: int | None = None
    avg_quality: float | None = None


class HealthStatus(BaseModel):
    service: str
    status: Literal['healthy', 'degraded', 'unhealthy', 'unknown']
    uptime_seconds: float | None = None
    version: str | None = None
    components: dict[constr(pattern=r'^(.*)$'), Components] | None = None
    meta_learning: MetaLearning | None = None

class MetaLearningStats(BaseModel):
    domains_tracked: int | None = None
    total_llm_calls: int | None = None
    avg_quality: float | None = None

class ModuleStatus(RootModel[Literal['active', 'degraded', 'inactive', 'error']]):
    root: Literal['active', 'degraded', 'inactive', 'error']

class ServiceResources(BaseModel):
    memory_mb: float | None = None
    cpu_percent: float | None = None
    neo4j_connected: bool | None = None
    redis_connected: bool | None = None
    postgres_connected: bool | None = None

class ServiceStatus(RootModel[Literal['healthy', 'degraded', 'unhealthy', 'starting']]):
    root: Literal['healthy', 'degraded', 'unhealthy', 'starting']

