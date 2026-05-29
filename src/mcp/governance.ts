/**
 * Governance contracts — LIN-997 / WidgeTDC LIN-987.2 follow-up.
 *
 * Mirrors the runtime governance shapes defined in the WidgeTDC
 * backend (`apps/backend/src/mcp/types/governance.ts`,
 * `apps/backend/src/services/eventSpine/types.ts`,
 * `apps/backend/src/mcp/gateway/governanceGateway.ts`) so that
 * cross-repo consumers (orchestrator, canvas-server, RLM, OpenClaw)
 * share the same envelope and decision shapes.
 *
 * Architect option B (LIN-997): the schema includes optional
 * `audience`, `source_protocol`, `standing_approval`, and
 * `policy_bundle_digest` fields to model scheduled-internal-governed
 * mutation without weakening the staged_write/production_write
 * plan+approval contract.
 *
 * Source-of-truth note: the WidgeTDC backend is the runtime gate.
 * These contracts are the wire shape for cross-repo consumers; the
 * gate's internal policy logic is the enforcement authority.
 */

import { Type, Static } from '@sinclair/typebox'

const GitCommitSha = Type.String({
  minLength: 40,
  maxLength: 40,
  pattern: '^[0-9a-f]{40}$',
  description: 'Full lowercase git commit SHA.',
})

// ─── Risk / cost / audit unions ─────────────────────────────────────

export const GovernanceRiskLevel = Type.Union([
  Type.Literal('read_only'),
  Type.Literal('staged_write'),
  Type.Literal('production_write'),
], { $id: 'GovernanceRiskLevel' })

export type GovernanceRiskLevel = Static<typeof GovernanceRiskLevel>

export const GovernanceCostTier = Type.Union([
  Type.Literal('free'),
  Type.Literal('low'),
  Type.Literal('medium'),
  Type.Literal('high'),
  Type.Literal('premium'),
], { $id: 'GovernanceCostTier' })

export type GovernanceCostTier = Static<typeof GovernanceCostTier>

export const GovernanceAuditCategory = Type.Union([
  Type.Literal('graph_promotion'),
  Type.Literal('memory_promotion'),
  Type.Literal('data_read'),
  Type.Literal('tool_invocation'),
  Type.Literal('plan_lifecycle'),
  Type.Literal('policy_decision'),
  Type.Literal('external_call'),
  Type.Literal('security_event'),
], { $id: 'GovernanceAuditCategory' })

export type GovernanceAuditCategory = Static<typeof GovernanceAuditCategory>

export const GovernanceAudience = Type.Union([
  Type.Literal('external_agent'),
  Type.Literal('internal_system'),
  Type.Literal('operator_only'),
], { $id: 'GovernanceAudience' })

export type GovernanceAudience = Static<typeof GovernanceAudience>

export const GovernanceSourceProtocol = Type.Union([
  Type.Literal('rest'),
  Type.Literal('mcp'),
  Type.Literal('streamable'),
  Type.Literal('openai'),
  Type.Literal('websocket'),
  Type.Literal('agent_chain'),
  Type.Literal('scheduled_job'),
  Type.Literal('internal'),
], { $id: 'GovernanceSourceProtocol' })

export type GovernanceSourceProtocol = Static<typeof GovernanceSourceProtocol>

// ─── Standing approval (Architect Option B) ─────────────────────────

export const GovernanceStandingApproval = Type.Object({
  approval_token_digest: Type.String({
    description: 'sha256 of the standing approval token (no plaintext)',
  }),
  granted_by: Type.String({
    description: 'Operator identity (user id or role)',
  }),
  granted_at: Type.String({
    format: 'date-time',
    description: 'ISO datetime when the approval was granted',
  }),
  expires_at: Type.String({
    format: 'date-time',
    description: 'ISO datetime — MUST be set; null forbidden for standing approvals',
  }),
  review_after: Type.String({
    format: 'date-time',
    description: 'ISO datetime — operator review cadence',
  }),
  policy_bundle_digest: Type.String({
    description: 'sha256 of the active policy bundle this approval is bound to',
  }),
}, {
  $id: 'GovernanceStandingApproval',
  description:
    'Standing approval block for scheduled internal governed mutation. ' +
    'Replaces the per-call HyperAgent plan+approval flow for cron-driven ' +
    'callers while preserving auditable lifecycle (granted/expires/review/policy).',
})

export type GovernanceStandingApproval = Static<typeof GovernanceStandingApproval>

// ─── MCP tool governance metadata ──────────────────────────────────

export const MCPToolGovernance = Type.Object({
  // Required core fields
  risk_level: GovernanceRiskLevel,
  requires_plan: Type.Boolean({
    description:
      'If true, the gate rejects direct execution and routes through HyperAgent ' +
      '(create_plan → approve_plan → execute_plan → evaluate_plan).',
  }),
  requires_approval: Type.Boolean({
    description:
      'If true, plan creation alone is insufficient — operator OR policy-profile ' +
      'approval token required before execute_plan.',
  }),
  cost_tier: GovernanceCostTier,
  audit_category: GovernanceAuditCategory,

  // Architect Option B optional fields
  audience: Type.Optional(GovernanceAudience),
  source_protocol: Type.Optional(GovernanceSourceProtocol),
  standing_approval: Type.Optional(GovernanceStandingApproval),
  system_plan_id: Type.Optional(Type.String({
    description: 'Pinned plan-id for scheduled internal callers (Option B)',
  })),
}, {
  $id: 'MCPToolGovernance',
  description:
    'Governance metadata declared on every MCP tool definition. The gate ' +
    'consults `risk_level` + `requires_plan` + `requires_approval` to decide ' +
    'execution path. Audience / source_protocol / standing_approval express ' +
    'the Architect Option B scheduled-internal-mutation lifecycle.',
})

export type MCPToolGovernance = Static<typeof MCPToolGovernance>

// ─── Governance context (server-trusted) ───────────────────────────

export const GovernanceActorType = Type.Union([
  Type.Literal('agent'),
  Type.Literal('user'),
  Type.Literal('system'),
  Type.Literal('cron'),
  Type.Literal('operator'),
], { $id: 'GovernanceActorType' })

export type GovernanceActorType = Static<typeof GovernanceActorType>

export const GovernanceContext = Type.Object({
  actor_id: Type.String(),
  actor_type: GovernanceActorType,
  correlation_id: Type.String({
    description: 'Cross-service correlation id; required for replay/audit',
  }),
  parent_event_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  workflow_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  plan_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  approval_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  tenant_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  source_protocol: GovernanceSourceProtocol,
  /**
   * Server-trust marker: `true` means this context was assembled
   * server-side by the gate from authenticated headers / signed tokens.
   * Client-supplied governance must NEVER be trusted; the gate strips
   * client governance fields and rebuilds the context with this flag.
   */
  server_trusted: Type.Literal(true),
}, {
  $id: 'GovernanceContext',
  description:
    'Server-trusted execution context. Carries actor identity, correlation, ' +
    'and source protocol so EventSpine and the gate can reason about who is ' +
    'calling and why. Client-supplied context.governance fields are rejected.',
})

export type GovernanceContext = Static<typeof GovernanceContext>

// ─── Governance decision ────────────────────────────────────────────

export const GovernanceDecisionCode = Type.Union([
  Type.Literal('OK'),
  Type.Literal('PLAN_REQUIRED'),
  Type.Literal('APPROVAL_REQUIRED'),
  Type.Literal('UNCLASSIFIED_DANGEROUS_CALLER'),
  Type.Literal('BYPASS_EXPIRED'),
  Type.Literal('BYPASS_TOOL_NOT_ALLOWED'),
  Type.Literal('BYPASS_RISK_TOO_HIGH'),
  Type.Literal('POLICY_VIOLATION'),
  Type.Literal('COST_BUDGET_EXCEEDED'),
  Type.Literal('INTERNAL_ERROR'),
], { $id: 'GovernanceDecisionCode' })

export type GovernanceDecisionCode = Static<typeof GovernanceDecisionCode>

export const GovernanceDecision = Type.Object({
  allowed: Type.Boolean(),
  code: GovernanceDecisionCode,
  reason: Type.String(),
  governance: MCPToolGovernance,
  policy_bundle_digest: Type.Optional(Type.String()),
  policy_version: Type.Optional(Type.String()),
  correlation_id: Type.Optional(Type.String()),
}, {
  $id: 'GovernanceDecision',
  description:
    'Decision returned by the gate. allowed=true means proceed; allowed=false ' +
    'with code+reason explains the rejection class. policy_bundle_digest + ' +
    'policy_version pin the decision to a specific signed policy bundle.',
})

export type GovernanceDecision = Static<typeof GovernanceDecision>

// ─── Structured rejection envelope (HTTP 403 body) ─────────────────

export const GovernanceRejectionNextStep = Type.Object({
  action: Type.Union([
    Type.Literal('create_plan'),
    Type.Literal('request_approval'),
    Type.Literal('classify_caller'),
    Type.Literal('refresh_bypass'),
    Type.Literal('contact_operator'),
  ]),
  endpoint: Type.Optional(Type.String({
    description: 'Endpoint or tool name the caller should invoke next',
  })),
  required_fields: Type.Optional(Type.Array(Type.String())),
  hint: Type.Optional(Type.String()),
}, {
  $id: 'GovernanceRejectionNextStep',
  description:
    'Action-oriented next-step instruction returned with every rejection so ' +
    'callers can self-recover (matches the Learning Interface Contract — GOV-2.1).',
})

export type GovernanceRejectionNextStep = Static<typeof GovernanceRejectionNextStep>

export const GovernanceRejectionEnvelope = Type.Object({
  error_class: Type.Literal('governance_rejection'),
  tool: Type.String(),
  risk_level: Type.Optional(GovernanceRiskLevel),
  code: GovernanceDecisionCode,
  requirement: Type.String(),
  reason: Type.String(),
  next_step: GovernanceRejectionNextStep,
  correlation_id: Type.String(),
  policy_bundle_digest: Type.Optional(Type.String()),
}, {
  $id: 'GovernanceRejectionEnvelope',
  description:
    'HTTP 403 body returned by the universal gate when a call is rejected. ' +
    'Carries enough information for the caller to either self-recover ' +
    '(via next_step) or surface the rejection to a human.',
})

export type GovernanceRejectionEnvelope = Static<typeof GovernanceRejectionEnvelope>

// ─── Tool invocation / result envelopes ────────────────────────────

export const ToolInvocationEnvelope = Type.Object({
  tool: Type.String(),
  payload: Type.Unknown({ description: 'Tool-specific business payload (typed at the tool level)' }),
  context: GovernanceContext,
}, {
  $id: 'ToolInvocationEnvelope',
  description: 'Canonical envelope a protocol surface hands to the gate.',
})

export type ToolInvocationEnvelope = Static<typeof ToolInvocationEnvelope>

export const ToolResultEnvelope = Type.Object({
  tool: Type.String(),
  result: Type.Unknown(),
  correlation_id: Type.String(),
  duration_ms: Type.Optional(Type.Number()),
  cost: Type.Optional(Type.Object({
    cost_tier: GovernanceCostTier,
    units: Type.Optional(Type.Number()),
  })),
}, {
  $id: 'ToolResultEnvelope',
  description: 'Canonical result envelope returned to the caller after a successful invocation.',
})

export type ToolResultEnvelope = Static<typeof ToolResultEnvelope>

// ─── Spine event base + key event types ────────────────────────────

export const SpineEventBase = Type.Object({
  id: Type.String(),
  type: Type.String(),
  timestamp: Type.String({ format: 'date-time' }),
  actor_id: Type.String(),
  actor_type: GovernanceActorType,
  correlation_id: Type.String(),
  parent_event_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  tool_name: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  plan_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  workflow_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  tenant_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  risk_level: Type.Optional(Type.Union([GovernanceRiskLevel, Type.Null()])),
  audit_category: Type.Optional(Type.Union([GovernanceAuditCategory, Type.Null()])),
  cost_tier: Type.Optional(Type.Union([GovernanceCostTier, Type.Null()])),
  outcome: Type.Union([
    Type.Literal('success'),
    Type.Literal('failure'),
    Type.Literal('rejected'),
    Type.Literal('pending'),
  ]),
  error_class: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  error_message: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  payload: Type.Unknown(),
}, {
  $id: 'SpineEventBase',
  description: 'Base shape for every typed event in the EventSpine.',
})

export type SpineEventBase = Static<typeof SpineEventBase>

export const SpineEventType = Type.Union([
  Type.Literal('tool_called'),
  Type.Literal('tool_succeeded'),
  Type.Literal('tool_failed'),
  Type.Literal('tool_rejected'),
  Type.Literal('governance_rejection'),
  Type.Literal('policy_decision_made'),
  Type.Literal('plan_created'),
  Type.Literal('plan_approved'),
  Type.Literal('plan_executed'),
  Type.Literal('plan_evaluated'),
  Type.Literal('graph_promotion_completed'),
  Type.Literal('lineage_linked'),
  Type.Literal('memory_promoted'),
  Type.Literal('premium_escalation_used'),
  Type.Literal('cost_budget_exceeded'),
  Type.Literal('capability_canary_run'),
  Type.Literal('policy_violation_detected'),
  Type.Literal('token_telemetry_recorded'),
  Type.Literal('trust_score_evaluated'),
  Type.Literal('economic_proof_evaluated'),
  Type.Literal('capital_ledger_entry_recorded'),
], { $id: 'SpineEventType' })

export type SpineEventType = Static<typeof SpineEventType>

// ─── Graph promotion request / result ──────────────────────────────

export const GraphPromotionRequest = Type.Object({
  promotion_type: Type.Union([
    Type.Literal('metric'),
    Type.Literal('capability'),
    Type.Literal('observation'),
    Type.Literal('decision'),
    Type.Literal('pattern'),
    Type.Literal('lineage'),
  ]),
  evidence_ref: Type.String({
    description: 'URL or identifier pointing to the evidence backing this promotion',
  }),
  intent: Type.String({
    description: 'One-line description of the business intent for audit replay',
  }),
  payload: Type.Object({}, { additionalProperties: true }),
}, {
  $id: 'GraphPromotionRequest',
  description:
    'Typed request a HyperAgent plan submits to a governed promotion tool. ' +
    'Replaces raw graph.write_cypher for broad-agent use. Evidence_ref + intent ' +
    'are required so spine_events become a readable business log.',
})

export type GraphPromotionRequest = Static<typeof GraphPromotionRequest>

export const GraphPromotionResult = Type.Object({
  tool: Type.String(),
  promotion_type: Type.String(),
  promoted: Type.Boolean(),
  node_id: Type.Optional(Type.String()),
  relationship_id: Type.Optional(Type.String()),
  correlation_id: Type.String(),
  evidence_ref: Type.String(),
  spine_event_id: Type.Optional(Type.String()),
}, {
  $id: 'GraphPromotionResult',
  description: 'Result of a typed graph promotion. Includes the spine_event_id for replay.',
})

export type GraphPromotionResult = Static<typeof GraphPromotionResult>

// ─── Capability lifecycle / claim evidence ─────────────────────────

export const CapabilityTier = Type.Union([
  Type.Literal('untrusted'),
  Type.Literal('observed'),
  Type.Literal('governed'),
  Type.Literal('canonical'),
], { $id: 'CapabilityTier' })

export type CapabilityTier = Static<typeof CapabilityTier>

export const CapabilityLifecycleState = Type.Object({
  capability_id: Type.String(),
  current_tier: CapabilityTier,
  promoted_at: Type.Optional(Type.String({ format: 'date-time' })),
  recent_canary_history: Type.Array(Type.Object({
    run_id: Type.String(),
    status: Type.Union([Type.Literal('green'), Type.Literal('red')]),
    checked_at: Type.String({ format: 'date-time' }),
    evidence_ref: Type.Optional(Type.String()),
  })),
}, {
  $id: 'CapabilityLifecycleState',
  description: 'Capability tier + recent canary history (GOV-8 promotion engine).',
})

export type CapabilityLifecycleState = Static<typeof CapabilityLifecycleState>

export const ClaimPromotionEvidence = Type.Object({
  claim_id: Type.String(),
  current_level: Type.Union([
    Type.Literal('L0'),
    Type.Literal('L1'),
    Type.Literal('L2'),
    Type.Literal('L3'),
  ]),
  proposed_level: Type.Union([
    Type.Literal('L0'),
    Type.Literal('L1'),
    Type.Literal('L2'),
    Type.Literal('L3'),
  ]),
  evidence_refs: Type.Array(Type.String()),
  canary_run_ids: Type.Array(Type.String()),
  policy_bundle_digest: Type.String(),
  promoted_at: Type.Optional(Type.String({ format: 'date-time' })),
  reason: Type.String(),
}, {
  $id: 'ClaimPromotionEvidence',
  description:
    'Evidence bundle pinned to a claim promotion. Promotion is gated by ' +
    'canary_run_ids + evidence_refs + policy_bundle_digest — no PR-merge-only ' +
    'promotion is permitted.',
})

export type ClaimPromotionEvidence = Static<typeof ClaimPromotionEvidence>

export const ContractsConsumerAdoptionReadback = Type.Object({
  schema_version: Type.Literal('contracts.consumer_adoption_readback.v1'),
  package_name: Type.Literal('@widgetdc/contracts'),
  package_version: Type.String({
    minLength: 1,
    description: 'Resolved @widgetdc/contracts package version used by the deployed consumer.',
  }),
  contracts_commit_sha: GitCommitSha,
  consumer_repo: Type.String({
    minLength: 1,
    description: 'Repository or governed runtime that emitted this adoption read-back.',
  }),
  consumer_service: Type.String({
    minLength: 1,
    description: 'Deployed service, job, or runner inside the consumer boundary.',
  }),
  consumer_deployed_sha: GitCommitSha,
  source_protocol: GovernanceSourceProtocol,
  generated_at: Type.String({ format: 'date-time' }),
  runtime_correlation_id: Type.String({
    minLength: 1,
    description: 'Correlation id emitted by the deployed consumer runtime.',
  }),
  eventspine_replay_count: Type.Integer({
    minimum: 1,
    description: 'EventSpine replay count observed by the deployed consumer runtime; must be >= 1.',
  }),
  evidence_refs: Type.Array(Type.String({ minLength: 1 }), {
    minItems: 1,
    description: 'Evidence URIs or artifact identifiers backing the read-back.',
  }),
  spine_event_id: Type.Optional(Type.String({
    minLength: 1,
    description: 'Optional EventSpine event id for the adoption read-back.',
  })),
  workflow_id: Type.Optional(Type.String({
    minLength: 1,
    description: 'Optional workflow id associated with the deployed consumer run.',
  })),
  run_id: Type.Optional(Type.String({
    minLength: 1,
    description: 'Optional CI/runtime run id associated with the consumer read-back.',
  })),
  runtime_proof_claimed: Type.Literal(false),
  claim_promotion_eligible: Type.Literal(false),
}, {
  $id: 'ContractsConsumerAdoptionReadback',
  additionalProperties: false,
  description:
    'Read-back envelope emitted by a deployed consumer or governed runner to prove ' +
    '@widgetdc/contracts adoption metadata. This is not claim-promotion evidence ' +
    'and must not be treated as runtime-proof claim promotion by itself.',
})

export type ContractsConsumerAdoptionReadback = Static<typeof ContractsConsumerAdoptionReadback>
