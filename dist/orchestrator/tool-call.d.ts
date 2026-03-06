/**
 * OrchestratorToolCall — Agent → Orchestrator
 *
 * An AI agent (Claude, Gemini, DeepSeek, etc.) emits this when it needs
 * to invoke an MCP tool. The Orchestrator receives the call, injects the
 * Bearer token, calls the WidgeTDC backend, and returns an OrchestratorToolResult.
 *
 * Wire format: snake_case JSON
 */
import { Static } from '@sinclair/typebox';
export declare const OrchestratorToolCall: import("@sinclair/typebox").TObject<{
    /** Unique call ID — used to correlate with OrchestratorToolResult */
    call_id: import("@sinclair/typebox").TString;
    /** Agent identity — which agent is requesting the tool */
    agent_id: import("@sinclair/typebox").TString;
    /** MCP tool namespace + name (e.g. "graph.read_cypher", "audit.lessons") */
    tool_name: import("@sinclair/typebox").TString;
    /** Tool arguments — passed directly to the MCP tool as payload */
    arguments: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
    /** Optional: cross-service trace ID for end-to-end correlation */
    trace_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** Priority hint — higher priority calls are processed first */
    priority: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"normal">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"critical">]>>;
    /** Timeout the agent is willing to wait (ms) */
    timeout_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    /** ISO timestamp when the call was emitted */
    emitted_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type OrchestratorToolCall = Static<typeof OrchestratorToolCall>;
//# sourceMappingURL=tool-call.d.ts.map