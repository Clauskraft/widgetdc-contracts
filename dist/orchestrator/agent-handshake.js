/**
 * AgentHandshake — Agent registration + capability declaration
 *
 * When an agent connects to the Orchestrator (or boots up), it sends
 * this handshake to declare its identity, capabilities, and available
 * MCP tool permissions.
 *
 * The Orchestrator stores this in the Agent registry (Neo4j + in-memory)
 * and uses it to route tool calls to the correct backend.
 *
 * Wire format: snake_case JSON
 */
import { Type } from '@sinclair/typebox';
import { AgentMessageSource } from './agent-message.js';
export const AgentCapability = Type.Union([
    Type.Literal('graph_read'), // Can read Neo4j via graph.read_cypher
    Type.Literal('graph_write'), // Can write Neo4j via graph.write_cypher
    Type.Literal('mcp_tools'), // Can invoke MCP tools via Orchestrator
    Type.Literal('cognitive_reasoning'), // Can use /cognitive/* endpoints (RLM)
    Type.Literal('document_generation'), // Can use docgen.* tools
    Type.Literal('osint'), // Can use osint.* tools
    Type.Literal('code_execution'), // Can use compute.* tools
    Type.Literal('ingestion'), // Can trigger data ingestion
    Type.Literal('git_operations'), // Can use git.* tools
    Type.Literal('audit'), // Can use audit.* tools
], {
    $id: 'AgentCapability',
    description: 'Capability flags declaring what an agent is authorized to do',
});
export const AgentHandshakeStatus = Type.Union([
    Type.Literal('online'),
    Type.Literal('standby'),
    Type.Literal('offline'),
    Type.Literal('degraded'),
], {
    $id: 'AgentHandshakeStatus',
    description: 'Agent availability status',
});
export const AgentHandshake = Type.Object({
    /** Canonical agent ID */
    agent_id: Type.String({
        description: 'Canonical agent identifier (e.g. CAPTAIN_CLAUDE, GEMINI_ARCHITECT)',
    }),
    /** Display name (human-readable, free-form) */
    display_name: Type.String({
        description: 'Human-readable display name (e.g. "Consulting Frontend", "Captain Claude")',
    }),
    /** Technical source key (known agents or custom) */
    source: Type.Union([AgentMessageSource, Type.String()], {
        description: 'Technical source identifier (e.g. "claude", "browser", "custom-agent")',
    }),
    /** Agent version or build identifier */
    version: Type.Optional(Type.String({
        description: 'Agent version string (e.g. "claude-sonnet-4-5", "gemini-2.0-flash")',
    })),
    /** Current availability status */
    status: AgentHandshakeStatus,
    /** Declared capabilities — Orchestrator enforces these as ACL.
     *  Accepts both known AgentCapability literals and free-form strings
     *  for domain-specific capabilities (e.g. 'sitrep', 'threat_hunting'). */
    capabilities: Type.Array(Type.Union([AgentCapability, Type.String()]), {
        description: 'List of capabilities this agent is authorized to use (known + domain-specific)',
        minItems: 0,
    }),
    /**
     * Allowed MCP tool namespaces (e.g. ["graph", "audit", "consulting"])
     * Empty = no MCP tool access. ["*"] = all tools (superuser — use with caution).
     */
    allowed_tool_namespaces: Type.Array(Type.String(), {
        description: 'MCP tool namespaces this agent may invoke (e.g. ["graph", "audit"])',
    }),
    /** Max concurrent tool calls this agent is allowed to make */
    max_concurrent_calls: Type.Optional(Type.Integer({
        minimum: 1,
        maximum: 20,
        default: 5,
    })),
    /** Preferred thread ID for this agent's chat messages */
    default_thread: Type.Optional(Type.String({
        description: 'Default Notion Global Chat thread for this agent',
    })),
    /** ISO timestamp of this handshake */
    registered_at: Type.Optional(Type.String({ format: 'date-time' })),
    /** ISO timestamp of last heartbeat (Orchestrator updates this) */
    last_seen_at: Type.Optional(Type.String({ format: 'date-time' })),
}, {
    $id: 'AgentHandshake',
    description: 'Agent registration payload. Sent to Orchestrator on boot to declare identity, capabilities, and tool permissions.',
});
//# sourceMappingURL=agent-handshake.js.map