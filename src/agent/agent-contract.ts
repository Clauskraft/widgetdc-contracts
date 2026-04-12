/**
 * agent-contract.ts — Canonical Agent Request/Response Contract (Phantom Week 2, P0).
 *
 * Single source of truth for agent↔agent wire format across backend, orchestrator,
 * and rlm-engine. Per ADR-004 (Phantom Source-of-Truth Locking): this contract is
 * canonical — AgentMemory is cache, graph is materialized state.
 *
 * Wire format: snake_case JSON with $id (WidgeTDC convention).
 *
 * References:
 *   - docs/FINAL_PLAN_v3.0.md §3.3 Canonical Contract for Model Normalization
 *   - ADR-004 Phantom Source-of-Truth Locking
 */
import { Type, type Static } from '@sinclair/typebox'

// ─── Priority & Status Enums ────────────────────────────────────────────────

export const AgentPriority = Type.Union([
  Type.Literal('low'),
  Type.Literal('normal'),
  Type.Literal('high'),
  Type.Literal('critical'),
], { $id: 'AgentPriority', description: 'Agent request priority level' })

export type AgentPriority = Static<typeof AgentPriority>

export const AgentResponseStatus = Type.Union([
  Type.Literal('success'),
  Type.Literal('partial'),
  Type.Literal('failed'),
  Type.Literal('conflict'),
], { $id: 'AgentResponseStatus', description: 'Agent response outcome status' })

export type AgentResponseStatus = Static<typeof AgentResponseStatus>

// ─── Conflict (for status=conflict responses) ───────────────────────────────

export const AgentConflict = Type.Object({
  other_agent_id: Type.String({ description: 'Agent whose WIP conflicts with this request' }),
  other_task: Type.String({ description: 'Conflicting task description' }),
  similarity: Type.Number({ minimum: 0, maximum: 1, description: 'Jaccard or semantic similarity score' }),
  mode: Type.Union([Type.Literal('advisory'), Type.Literal('blocking')], {
    description: 'Per Gate 4: default is advisory; blocking requires explicit opt-in',
  }),
  suggestion: Type.Optional(Type.String()),
}, {
  $id: 'AgentConflict',
  description: 'Conflict detected with another agent\'s active WIP',
  additionalProperties: false,
})

export type AgentConflict = Static<typeof AgentConflict>

// ─── Token Usage ────────────────────────────────────────────────────────────

export const TokenUsage = Type.Object({
  input: Type.Integer({ minimum: 0 }),
  output: Type.Integer({ minimum: 0 }),
}, { $id: 'TokenUsage', description: 'Token accounting for cost attribution', additionalProperties: false })

export type TokenUsage = Static<typeof TokenUsage>

// ─── AgentRequest ───────────────────────────────────────────────────────────

export const AgentRequest = Type.Object({
  request_id: Type.String({ format: 'uuid', description: 'Correlation ID — echoed in response' }),
  agent_id: Type.String({ minLength: 1, description: 'Logical agent identifier (e.g. "omega-sentinel")' }),
  task: Type.String({ minLength: 1, description: 'Natural-language task description' }),
  capabilities: Type.Array(Type.String(), {
    description: 'Required capabilities — e.g. ["reasoning","code","multilingual"]',
  }),
  context: Type.Record(Type.String(), Type.Unknown(), {
    description: 'Opaque key/value context passed to the handler',
  }),
  priority: AgentPriority,
}, {
  $id: 'AgentRequest',
  description: 'Canonical agent request envelope — wire format for orchestrator dispatch',
  additionalProperties: false,
})

export type AgentRequest = Static<typeof AgentRequest>

// ─── AgentResponse ──────────────────────────────────────────────────────────

export const AgentResponse = Type.Object({
  request_id: Type.String({ format: 'uuid', description: 'Echo of AgentRequest.request_id' }),
  agent_id: Type.String({ minLength: 1 }),
  status: AgentResponseStatus,
  output: Type.String({ description: 'Task output payload (may be empty on failure)' }),
  tokens_used: TokenUsage,
  cost_dkk: Type.Number({ minimum: 0, description: 'Cost in DKK (Danish kroner), see LLM matrix' }),
  conflicts: Type.Array(AgentConflict, {
    description: 'Populated when status=conflict; empty otherwise (Gate 4: advisory by default)',
  }),
}, {
  $id: 'AgentResponse',
  description: 'Canonical agent response envelope — all handlers must emit this shape',
  additionalProperties: false,
})

export type AgentResponse = Static<typeof AgentResponse>

// ─── CapabilityEntry (Capability Matrix) ────────────────────────────────────

export const CapabilityEntry = Type.Object({
  provider: Type.String({ description: 'e.g. "deepseek" | "claude" | "openai" | "gemini"' }),
  model: Type.String({ description: 'Provider-specific model id' }),
  capabilities: Type.Array(Type.String(), {
    description: 'Capabilities this model satisfies',
  }),
  max_tokens: Type.Integer({ minimum: 1 }),
  cost_per_1k: Type.Object({
    input: Type.Number({ minimum: 0 }),
    output: Type.Number({ minimum: 0 }),
  }, { additionalProperties: false }),
  latency_p50_ms: Type.Number({ minimum: 0 }),
  fallback_to: Type.Optional(Type.String({
    description: 'Next model id to try if this one fails (empty = terminal)',
  })),
}, {
  $id: 'CapabilityEntry',
  description: 'Single row in the capability matrix — maps model to capabilities + cost + fallback',
  additionalProperties: false,
})

export type CapabilityEntry = Static<typeof CapabilityEntry>

// ─── CapabilityMatrix (collection) ──────────────────────────────────────────

export const CapabilityMatrix = Type.Object({
  version: Type.String({ description: 'Semver, e.g. "1.0.0"' }),
  entries: Type.Array(CapabilityEntry),
}, {
  $id: 'CapabilityMatrix',
  description: 'Full capability matrix — versioned for drift detection',
  additionalProperties: false,
})

export type CapabilityMatrix = Static<typeof CapabilityMatrix>
