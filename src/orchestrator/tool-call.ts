/**
 * OrchestratorToolCall — Agent → Orchestrator
 *
 * An AI agent (Claude, Gemini, DeepSeek, etc.) emits this when it needs
 * to invoke an MCP tool. The Orchestrator receives the call, injects the
 * Bearer token, calls the WidgeTDC backend, and returns an OrchestratorToolResult.
 *
 * Wire format: snake_case JSON
 */
import { Type, Static } from '@sinclair/typebox'

export const OrchestratorToolCall = Type.Object({
  /** Unique call ID — used to correlate with OrchestratorToolResult */
  call_id: Type.String({
    format: 'uuid',
    description: 'Unique ID for this tool call (agent-generated UUID)',
  }),

  /** Agent identity — which agent is requesting the tool */
  agent_id: Type.String({
    description: 'Canonical agent ID (e.g. CAPTAIN_CLAUDE, GEMINI_ARCHITECT, RLM_ENGINE)',
  }),

  /** MCP tool namespace + name (e.g. "graph.read_cypher", "audit.lessons") */
  tool_name: Type.String({
    pattern: '^[a-z_]+\\.[a-z_]+$',
    description: 'MCP tool name in namespace.method format',
  }),

  /** Tool arguments — passed directly to the MCP tool as payload */
  arguments: Type.Record(Type.String(), Type.Unknown(), {
    description: 'Tool-specific arguments (passed as payload to MCP route)',
  }),

  /** Optional: cross-service trace ID for end-to-end correlation */
  trace_id: Type.Optional(Type.String({ format: 'uuid' })),

  /** Priority hint — higher priority calls are processed first */
  priority: Type.Optional(Type.Union([
    Type.Literal('low'),
    Type.Literal('normal'),
    Type.Literal('high'),
    Type.Literal('critical'),
  ], { default: 'normal' })),

  /** Timeout the agent is willing to wait (ms) */
  timeout_ms: Type.Optional(Type.Integer({ minimum: 500, maximum: 120_000, default: 30_000 })),

  /** ISO timestamp when the call was emitted */
  emitted_at: Type.Optional(Type.String({ format: 'date-time' })),
}, {
  $id: 'OrchestratorToolCall',
  description: 'Agent → Orchestrator: request to invoke an MCP tool on the WidgeTDC backend. Orchestrator injects auth and handles SSE.',
})

export type OrchestratorToolCall = Static<typeof OrchestratorToolCall>
