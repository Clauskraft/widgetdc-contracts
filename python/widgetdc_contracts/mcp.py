"""
widgetdc_contracts.mcp — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/mcp/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, Field
from pydantic import BaseModel
from pydantic import BaseModel, Field
from pydantic import BaseModel, Field, constr
from pydantic import Field, RootModel
from pydantic import RootModel
from typing import Any, Literal
from typing import Literal
from uuid import UUID

__all__ = ["ComplianceTier", "McpClientDiscoveryPolicy", "McpClientLimits", "McpClientPoliciesDocument", "McpClientPolicy", "McpClientSelfResource", "McpPolicyRisk", "McpResourcePolicyMetadata", "McpToolPolicyMetadata", "McpTransport", "MrpRouteEnvelope", "RequestFeatures", "RequestTaskType"]

class ComplianceTier(RootModel[Literal['public', 'internal', 'legal', 'health']]):
    root: Literal['public', 'internal', 'legal', 'health'] = Field(
        ...,
        description='Data-handling compliance tier — drives crypto-shred + PII routing.',
    )

class McpClientDiscoveryPolicy(BaseModel):
    include_deprecated: bool | None = None

class McpClientLimits(BaseModel):
    rate_limit_per_minute: int | None = None

class Limits(BaseModel):
    rate_limit_per_minute: int | None = None


class Discovery(BaseModel):
    include_deprecated: bool | None = None


class Defaults(BaseModel):
    description: str | None = None
    scopes: list[str] | None = None
    allowed_tools: list[str] | None = None
    denied_tools: list[str] | None = None
    allowed_resources: list[str] | None = None
    denied_resources: list[str] | None = None
    allowed_transports: (
        list[Literal['streamable_http', 'rest', 'sse', 'stdio']] | None
    ) = None
    limits: Limits | None = Field(
        None, description='Runtime-enforced rate and payload limits for an MCP client.'
    )
    discovery: Discovery | None = Field(
        None, description='Discovery preferences applied after auth-based filtering.'
    )
    owner_contact: str | None = None


class Clients(BaseModel):
    description: str | None = None
    scopes: list[str] | None = None
    allowed_tools: list[str] | None = None
    denied_tools: list[str] | None = None
    allowed_resources: list[str] | None = None
    denied_resources: list[str] | None = None
    allowed_transports: (
        list[Literal['streamable_http', 'rest', 'sse', 'stdio']] | None
    ) = None
    limits: Limits | None = Field(
        None, description='Runtime-enforced rate and payload limits for an MCP client.'
    )
    discovery: Discovery | None = Field(
        None, description='Discovery preferences applied after auth-based filtering.'
    )
    owner_contact: str | None = None


class ToolMetadata(BaseModel):
    capability_id: str | None = None
    required_scopes: list[str] | None = None
    risk: Literal['low', 'moderate', 'high', 'critical'] | None = None
    audience: list[str] | None = None
    deprecated: bool | None = None


class ResourceMetadata(BaseModel):
    required_scopes: list[str] | None = None
    audience: list[str] | None = None
    description: str | None = None


class McpClientPoliciesDocument(BaseModel):
    version: str
    description: str | None = None
    defaults: Defaults | None = Field(
        None, description='Per-client MCP discovery and execution policy.'
    )
    clients: dict[constr(pattern=r'^(.*)$'), Clients] | None = None
    tool_metadata: dict[constr(pattern=r'^(.*)$'), ToolMetadata] | None = None
    resource_metadata: dict[constr(pattern=r'^(.*)$'), ResourceMetadata] | None = None

class Limits(BaseModel):
    rate_limit_per_minute: int | None = None


class Discovery(BaseModel):
    include_deprecated: bool | None = None


class McpClientPolicy(BaseModel):
    description: str | None = None
    scopes: list[str] | None = None
    allowed_tools: list[str] | None = None
    denied_tools: list[str] | None = None
    allowed_resources: list[str] | None = None
    denied_resources: list[str] | None = None
    allowed_transports: (
        list[Literal['streamable_http', 'rest', 'sse', 'stdio']] | None
    ) = None
    limits: Limits | None = Field(
        None, description='Runtime-enforced rate and payload limits for an MCP client.'
    )
    discovery: Discovery | None = Field(
        None, description='Discovery preferences applied after auth-based filtering.'
    )
    owner_contact: str | None = None

class Limits(BaseModel):
    rate_limit_per_minute: int | None = None


class McpClientSelfResource(BaseModel):
    generated_at: AwareDatetime
    client: str
    description: str | None = None
    policy_version: str
    policy_checksum: str
    scopes: list[str]
    allowed_transports: list[Literal['streamable_http', 'rest', 'sse', 'stdio']]
    limits: Limits = Field(
        ..., description='Runtime-enforced rate and payload limits for an MCP client.'
    )
    owner_contact: str | None = None
    allowed_tools: int
    allowed_resources: int

class McpPolicyRisk(RootModel[Literal['low', 'moderate', 'high', 'critical']]):
    root: Literal['low', 'moderate', 'high', 'critical']

class McpResourcePolicyMetadata(BaseModel):
    required_scopes: list[str] | None = None
    audience: list[str] | None = None
    description: str | None = None

class McpToolPolicyMetadata(BaseModel):
    capability_id: str | None = None
    required_scopes: list[str] | None = None
    risk: Literal['low', 'moderate', 'high', 'critical'] | None = None
    audience: list[str] | None = None
    deprecated: bool | None = None

class McpTransport(RootModel[Literal['streamable_http', 'rest', 'sse', 'stdio']]):
    root: Literal['streamable_http', 'rest', 'sse', 'stdio']

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


class MrpRouteEnvelope(BaseModel):
    tool: str = Field(
        ...,
        description='MRP tool name in namespace.method format (e.g. "mrp.produce", "gdpr.erase").',
        pattern='^[a-z_]+\\.[a-z_]+$',
    )
    payload: dict[constr(pattern=r'^(.*)$'), Any] = Field(
        ...,
        description='Tool-specific payload; shape governed by the individual MRP contracts.',
    )
    intent: str | None = Field(
        None, description='Governance intent (required for write tools).'
    )
    evidence: str | None = Field(
        None, description='Governance evidence (required for write tools).'
    )
    field_trace_id: UUID | None = Field(None, alias='_trace_id')
    field_request_features: FieldRequestFeatures | None = Field(
        None,
        alias='_request_features',
        description='Normalised feature vector consumed by the 12-step intelligence interceptor.',
    )

class RequestFeatures(BaseModel):
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

class RequestTaskType(
    RootModel[
        Literal[
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
        ]
    ]
):
    root: Literal[
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
