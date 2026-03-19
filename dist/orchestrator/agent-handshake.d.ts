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
    /** Display name (human-readable, free-form) */
    display_name: import("@sinclair/typebox").TString;
    /** Technical source key (known agents or custom) */
    source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"claude">, import("@sinclair/typebox").TLiteral<"gemini">, import("@sinclair/typebox").TLiteral<"deepseek">, import("@sinclair/typebox").TLiteral<"grok">, import("@sinclair/typebox").TLiteral<"rlm">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"system">, import("@sinclair/typebox").TLiteral<"orchestrator">]>, import("@sinclair/typebox").TString]>;
    /** Agent version or build identifier */
    version: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** Current availability status */
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"online">, import("@sinclair/typebox").TLiteral<"standby">, import("@sinclair/typebox").TLiteral<"offline">, import("@sinclair/typebox").TLiteral<"degraded">]>;
    /** Declared capabilities — Orchestrator enforces these as ACL.
     *  Accepts both known AgentCapability literals and free-form strings
     *  for domain-specific capabilities (e.g. 'sitrep', 'threat_hunting'). */
    capabilities: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"graph_read">, import("@sinclair/typebox").TLiteral<"graph_write">, import("@sinclair/typebox").TLiteral<"mcp_tools">, import("@sinclair/typebox").TLiteral<"cognitive_reasoning">, import("@sinclair/typebox").TLiteral<"document_generation">, import("@sinclair/typebox").TLiteral<"osint">, import("@sinclair/typebox").TLiteral<"code_execution">, import("@sinclair/typebox").TLiteral<"ingestion">, import("@sinclair/typebox").TLiteral<"git_operations">, import("@sinclair/typebox").TLiteral<"audit">]>, import("@sinclair/typebox").TString]>>;
    /** Allowed MCP tool namespaces (e.g. ["graph", "audit", "consulting"])
     *  Empty = no MCP tool access. ["*"] = all tools (superuser — use with caution).
     */
    allowed_tool_namespaces: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    /** Verified immutable fabric proof for authorizing high-risk delegation/tool execution. */
    fabric_proof: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        proof_id: import("@sinclair/typebox").TString;
        proof_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"sgt">, import("@sinclair/typebox").TString]>;
        verification_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"unverified">, import("@sinclair/typebox").TLiteral<"expired">, import("@sinclair/typebox").TLiteral<"revoked">]>;
        authorized_tool_namespaces: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        issued_at: import("@sinclair/typebox").TString;
        expires_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        issuer: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        handshake_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    /** Optimized search index fingerprint for lazy-loading tools (Adoption: Anthropic Tool Search Index). Reduces handshake token bloat by 85%. */
    capability_index: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** Supported memory layers for this agent (Adoption: OpenClaw Memory Tiering). */
    memory_tiers: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"working">, import("@sinclair/typebox").TLiteral<"episodic">, import("@sinclair/typebox").TLiteral<"semantic">]>>>;
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