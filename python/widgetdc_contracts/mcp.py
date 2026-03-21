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
from pydantic import RootModel
from typing import Literal

__all__ = ["McpClientDiscoveryPolicy", "McpClientLimits", "McpClientPoliciesDocument", "McpClientPolicy", "McpClientSelfResource", "McpPolicyRisk", "McpResourcePolicyMetadata", "McpToolPolicyMetadata", "McpTransport"]

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
