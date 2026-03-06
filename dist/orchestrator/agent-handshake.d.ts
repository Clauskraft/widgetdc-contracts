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
import { Static } from '@sinclair/typebox';
export declare const AgentCapability: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"graph_read">, import("@sinclair/typebox").TLiteral<"graph_write">, import("@sinclair/typebox").TLiteral<"mcp_tools">, import("@sinclair/typebox").TLiteral<"cognitive_reasoning">, import("@sinclair/typebox").TLiteral<"document_generation">, import("@sinclair/typebox").TLiteral<"osint">, import("@sinclair/typebox").TLiteral<"code_execution">, import("@sinclair/typebox").TLiteral<"ingestion">, import("@sinclair/typebox").TLiteral<"git_operations">, import("@sinclair/typebox").TLiteral<"audit">]>;
export type AgentCapability = Static<typeof AgentCapability>;
export declare const AgentHandshakeStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"online">, import("@sinclair/typebox").TLiteral<"standby">, import("@sinclair/typebox").TLiteral<"offline">, import("@sinclair/typebox").TLiteral<"degraded">]>;
export type AgentHandshakeStatus = Static<typeof AgentHandshakeStatus>;
export declare const AgentHandshake: import("@sinclair/typebox").TObject<{
    /** Canonical agent ID */
    agent_id: import("@sinclair/typebox").TString;
    /** Display name (human-readable) */
    display_name: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Claude">, import("@sinclair/typebox").TLiteral<"Gemini">, import("@sinclair/typebox").TLiteral<"DeepSeek">, import("@sinclair/typebox").TLiteral<"Grok">, import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"User">, import("@sinclair/typebox").TLiteral<"System">, import("@sinclair/typebox").TLiteral<"Orchestrator">]>;
    /** Technical source key */
    source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"claude">, import("@sinclair/typebox").TLiteral<"gemini">, import("@sinclair/typebox").TLiteral<"deepseek">, import("@sinclair/typebox").TLiteral<"grok">, import("@sinclair/typebox").TLiteral<"rlm">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"system">, import("@sinclair/typebox").TLiteral<"orchestrator">]>;
    /** Agent version or build identifier */
    version: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** Current availability status */
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"online">, import("@sinclair/typebox").TLiteral<"standby">, import("@sinclair/typebox").TLiteral<"offline">, import("@sinclair/typebox").TLiteral<"degraded">]>;
    /** Declared capabilities — Orchestrator enforces these as ACL */
    capabilities: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"graph_read">, import("@sinclair/typebox").TLiteral<"graph_write">, import("@sinclair/typebox").TLiteral<"mcp_tools">, import("@sinclair/typebox").TLiteral<"cognitive_reasoning">, import("@sinclair/typebox").TLiteral<"document_generation">, import("@sinclair/typebox").TLiteral<"osint">, import("@sinclair/typebox").TLiteral<"code_execution">, import("@sinclair/typebox").TLiteral<"ingestion">, import("@sinclair/typebox").TLiteral<"git_operations">, import("@sinclair/typebox").TLiteral<"audit">]>>;
    /**
     * Allowed MCP tool namespaces (e.g. ["graph", "audit", "consulting"])
     * Empty = no MCP tool access. ["*"] = all tools (superuser — use with caution).
     */
    allowed_tool_namespaces: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    /** Max concurrent tool calls this agent is allowed to make */
    max_concurrent_calls: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    /** Preferred thread ID for this agent's chat messages */
    default_thread: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** ISO timestamp of this handshake */
    registered_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** ISO timestamp of last heartbeat (Orchestrator updates this) */
    last_seen_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type AgentHandshake = Static<typeof AgentHandshake>;
//# sourceMappingURL=agent-handshake.d.ts.map