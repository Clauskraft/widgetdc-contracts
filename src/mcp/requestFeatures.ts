/**
 * RequestFeatures — Single source of truth for interceptor-chain inputs.
 *
 * Emitted by plugins / orchestrator, read by every step of the default-on
 * intelligence interceptor (see WidgeTDC/docs/wiring/SYSTEM_WIRING_PLAN.md § 3).
 *
 * Wire format: snake_case JSON.
 */
import { Type, Static } from '@sinclair/typebox'

export const RequestTaskType = Type.Union([
  Type.Literal('summarize'),
  Type.Literal('draft'),
  Type.Literal('review'),
  Type.Literal('classify'),
  Type.Literal('translate'),
  Type.Literal('code'),
  Type.Literal('reason'),
  Type.Literal('retrieve'),
  Type.Literal('compose'),
  Type.Literal('other'),
], { $id: 'RequestTaskType', description: 'Canonical request-level task-type dimension (distinct from llm.TaskType model-routing taxonomy).' })

export type RequestTaskType = Static<typeof RequestTaskType>

export const ComplianceTier = Type.Union([
  Type.Literal('public'),
  Type.Literal('internal'),
  Type.Literal('legal'),
  Type.Literal('health'),
], { $id: 'ComplianceTier', description: 'Data-handling compliance tier — drives crypto-shred + PII routing.' })

export type ComplianceTier = Static<typeof ComplianceTier>

export const RequestFeatures = Type.Object({
  task_type: RequestTaskType,
  language: Type.Optional(Type.String({ description: 'BCP-47 code (e.g. "en", "da", "de"). Defaults to "en".' })),
  pii_present: Type.Optional(Type.Boolean({ description: 'Caller-asserted; PIIClassifier overrides.' })),
  max_latency_ms: Type.Optional(Type.Integer({ minimum: 100, maximum: 120_000, description: 'Soft SLA ceiling; used by ResourceMarketAuctioneer.' })),
  max_cost_usd: Type.Optional(Type.Number({ minimum: 0, description: 'Soft budget ceiling per request in USD.' })),
  compliance_tier: Type.Optional(ComplianceTier),
  reasoning_depth: Type.Optional(Type.Integer({ minimum: 1, maximum: 5, default: 3, description: '1 (shallow) .. 5 (deep chain-of-thought).' })),
  domain: Type.Optional(Type.String({ description: 'Consulting domain ID (see @widgetdc/contracts/consulting).' })),
}, {
  $id: 'RequestFeatures',
  description: 'Normalised feature vector consumed by the 12-step intelligence interceptor.',
})

export type RequestFeatures = Static<typeof RequestFeatures>
