"""
widgetdc_contracts.orchestrator — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/orchestrator/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, Field
from pydantic import AwareDatetime, BaseModel, Field, constr
from pydantic import Field, RootModel
from typing import Any, Literal
from typing import Literal
from uuid import UUID

__all__ = ["AgentCapability", "AgentHandshake", "AgentHandshakeStatus", "AgentId", "AgentMessage", "AgentMessageSource", "AgentMessageType", "OrchestratorToolCall", "OrchestratorToolResult", "OrchestratorToolStatus", "StoredMessage"]

class AgentCapability(
    RootModel[
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
    ]
):
    root: Literal[
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
    ] = Field(
        ..., description='Capability flags declaring what an agent is authorized to do'
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
    max_concurrent_calls: int | None = Field(5, ge=1, le=20)
    default_thread: str | None = Field(
        None, description='Default Notion Global Chat thread for this agent'
    )
    registered_at: AwareDatetime | None = None
    last_seen_at: AwareDatetime | None = None

class AgentHandshakeStatus(
    RootModel[Literal['online', 'standby', 'offline', 'degraded']]
):
    root: Literal['online', 'standby', 'offline', 'degraded'] = Field(
        ..., description='Agent availability status'
    )

class AgentId(
    RootModel[
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
    ]
):
    root: Literal[
        'Claude', 'Gemini', 'DeepSeek', 'Grok', 'RLM', 'User', 'System', 'Orchestrator'
    ] = Field(
        ...,
        description='Canonical agent identifiers matching Notion Global Chat From/To schema',
    )

class File(BaseModel):
    name: str
    size: float
    type: str


class AgentMessage(BaseModel):
    message_id: str | None = Field(
        None, description='Unique message identifier (assigned by storage layer)'
    )
    from_: (
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
    ) = Field(..., alias='from', description='Sender agent ID')
    to: (
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
        | Literal['All']
        | str
    ) = Field(..., description='Target recipient or All for broadcast')
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
    ) = Field(..., description='Technical source identifier (e.g. "claude", "browser")')
    thread: str | None = Field(
        None,
        description='Thread ID for grouping related messages (e.g. "widgetdc-sprint-march26")',
    )
    type: Literal['Message', 'Command', 'Answer', 'Handover', 'Alert', 'ToolResult'] = (
        Field(..., description='Classification of the message purpose')
    )
    message: str = Field(
        ..., description='Message text content (markdown supported)', min_length=1
    )
    call_id: str | None = Field(
        None,
        description='Links this message to a specific tool call (for ToolResult messages)',
    )
    id: str | None = Field(
        None,
        description='Storage-layer assigned message ID (e.g. UUID or Redis-generated)',
    )
    thread_id: str | None = Field(
        None, description='Thread ID for grouping related messages'
    )
    parent_id: str | None = Field(
        None, description='ID of the message this is a direct reply to'
    )
    files: list[File] | None = Field(
        None, description='File attachments on this message'
    )
    metadata: dict[constr(pattern=r'^(.*)$'), Any] | None = Field(
        None,
        description='Extensible metadata (e.g. provider, model, duration_ms, conversation_id)',
    )
    timestamp: AwareDatetime | None = Field(
        None, description='When this message was created'
    )

class AgentMessageSource(
    RootModel[
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
    ]
):
    root: Literal[
        'claude', 'gemini', 'deepseek', 'grok', 'rlm', 'user', 'system', 'orchestrator'
    ] = Field(..., description='Lowercase source identifier for technical routing')

class AgentMessageType(
    RootModel[
        Literal['Message', 'Command', 'Answer', 'Handover', 'Alert', 'ToolResult']
    ]
):
    root: Literal['Message', 'Command', 'Answer', 'Handover', 'Alert', 'ToolResult'] = (
        Field(..., description='Classification of the message purpose')
    )

class OrchestratorToolCall(BaseModel):
    call_id: UUID = Field(
        ..., description='Unique ID for this tool call (agent-generated UUID)'
    )
    agent_id: str = Field(
        ...,
        description='Canonical agent ID (e.g. CAPTAIN_CLAUDE, GEMINI_ARCHITECT, RLM_ENGINE)',
    )
    tool_name: str = Field(
        ...,
        description='MCP tool name in namespace.method format',
        pattern='^[a-z_]+\\.[a-z_]+$',
    )
    arguments: dict[constr(pattern=r'^(.*)$'), Any] = Field(
        ..., description='Tool-specific arguments (passed as payload to MCP route)'
    )
    trace_id: UUID | None = None
    priority: Literal['low', 'normal', 'high', 'critical'] | None = 'normal'
    timeout_ms: int | None = Field(30000, ge=500, le=120000)
    emitted_at: AwareDatetime | None = None

class OrchestratorToolResult(BaseModel):
    call_id: UUID = Field(
        ..., description='Mirrors the call_id from the originating OrchestratorToolCall'
    )
    status: Literal['success', 'error', 'timeout', 'rate_limited', 'unauthorized'] = (
        Field(..., description='Outcome status of an Orchestrator tool call')
    )
    result: Any = Field(
        ..., description='Parsed tool output — whatever the MCP tool returned'
    )
    error_message: str | None = None
    error_code: (
        Literal[
            'TOOL_NOT_FOUND',
            'VALIDATION_ERROR',
            'BACKEND_ERROR',
            'TIMEOUT',
            'RATE_LIMITED',
            'UNAUTHORIZED',
            'SSE_PARSE_ERROR',
        ]
        | None
    ) = None
    duration_ms: float | None = Field(None, ge=0.0)
    trace_id: str | None = None
    completed_at: AwareDatetime | None = None

class OrchestratorToolStatus(
    RootModel[Literal['success', 'error', 'timeout', 'rate_limited', 'unauthorized']]
):
    root: Literal['success', 'error', 'timeout', 'rate_limited', 'unauthorized'] = (
        Field(..., description='Outcome status of an Orchestrator tool call')
    )

class File(BaseModel):
    name: str
    size: float
    type: str


class StoredMessage(BaseModel):
    message_id: str | None = Field(
        None, description='Unique message identifier (assigned by storage layer)'
    )
    from_: (
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
    ) = Field(..., alias='from', description='Sender agent ID')
    to: (
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
        | Literal['All']
        | str
    ) = Field(..., description='Target recipient or All for broadcast')
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
    ) = Field(..., description='Technical source identifier (e.g. "claude", "browser")')
    thread: str | None = Field(
        None,
        description='Thread ID for grouping related messages (e.g. "widgetdc-sprint-march26")',
    )
    type: Literal['Message', 'Command', 'Answer', 'Handover', 'Alert', 'ToolResult'] = (
        Field(..., description='Classification of the message purpose')
    )
    message: str = Field(
        ..., description='Message text content (markdown supported)', min_length=1
    )
    call_id: str | None = Field(
        None,
        description='Links this message to a specific tool call (for ToolResult messages)',
    )
    id: str = Field(..., description='Storage-assigned message ID')
    thread_id: str | None = Field(
        None, description='Thread ID for grouping related messages'
    )
    parent_id: str | None = Field(
        None, description='ID of the message this is a direct reply to'
    )
    files: list[File] | None = Field(
        None, description='File attachments on this message'
    )
    metadata: dict[constr(pattern=r'^(.*)$'), Any] | None = Field(
        None,
        description='Extensible metadata (e.g. provider, model, duration_ms, conversation_id)',
    )
    timestamp: AwareDatetime | None = Field(
        None, description='When this message was created'
    )
    reactions: dict[constr(pattern=r'^(.*)$'), list[str]] | None = Field(
        None, description='Emoji reactions: emoji key → agent IDs who reacted'
    )
    pinned: bool | None = Field(
        None, description='Whether this message is pinned in the chat'
    )

