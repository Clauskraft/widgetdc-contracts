import { Static, Type } from '@sinclair/typebox'

export const LauncherIntent = Type.Union([
  Type.Literal('info'),
  Type.Literal('analyze'),
  Type.Literal('report'),
  Type.Literal('research'),
  Type.Literal('orchestrate'),
], {
  $id: 'LauncherIntent',
  description: 'Intent values supported by the WidgeTDC launcher surface.',
})

export type LauncherIntent = Static<typeof LauncherIntent>

export const LauncherMode = Type.Union([
  Type.Literal('tool_only'),
  Type.Literal('single'),
  Type.Literal('swarm'),
], {
  $id: 'LauncherMode',
  description: 'Execution modes exposed by launcher planning.',
})

export type LauncherMode = Static<typeof LauncherMode>

export const LauncherRequest = Type.Object({
  input: Type.String({
    minLength: 1,
    description: 'User-provided launcher task or question.',
  }),
  intent: LauncherIntent,
  instruction: Type.Optional(Type.String({
    minLength: 1,
    description: 'Canonical single instruction override field for orchestrated requests.',
  })),
  instructions: Type.Optional(Type.String({
    minLength: 1,
    description: 'Compatibility alias for instruction. Retained until all consumers converge.',
  })),
}, {
  $id: 'LauncherRequest',
  description: 'Shared request contract for launcher surfaces. Surface-local UX payload fields belong outside this schema.',
})

export type LauncherRequest = Static<typeof LauncherRequest>

export const LauncherRequestEcho = Type.Object({
  input: Type.String({
    minLength: 1,
    description: 'Echo of normalized launcher input.',
  }),
  intent: LauncherIntent,
}, {
  $id: 'LauncherRequestEcho',
  description: 'Normalized launcher request echo returned by orchestrated launcher flows.',
})

export type LauncherRequestEcho = Static<typeof LauncherRequestEcho>

export const LauncherHandoffPayload = Type.Object({
  intent: LauncherIntent,
  prompt: Type.String({
    minLength: 1,
    description: 'Prompt payload handed to the deeper workspace surface.',
  }),
  executionPath: Type.String({
    minLength: 1,
    description: 'Canonical runtime path selected for the task.',
  }),
}, {
  $id: 'LauncherHandoffPayload',
  description: 'Shared handoff payload from launcher to downstream workspace/runtime surfaces.',
})

export type LauncherHandoffPayload = Static<typeof LauncherHandoffPayload>

export const LauncherPlanCore = Type.Object({
  intent: LauncherIntent,
  mode: LauncherMode,
  lineageId: Type.String({
    minLength: 1,
    description: 'Stable lineage id for launcher planning and runtime traceability.',
  }),
  status: Type.Union([
    Type.Literal('planned'),
    Type.Literal('in_progress'),
    Type.Literal('completed'),
    Type.Literal('failed'),
  ], {
    description: 'Plan state visible to downstream systems.',
  }),
  source: Type.Literal('widgetdc-launcher-prototype', {
    description: 'Current launcher source surface.',
  }),
  executionPath: Type.String({
    minLength: 1,
    description: 'Runtime path selected for the launcher task.',
  }),
  handoffPayload: LauncherHandoffPayload,
}, {
  $id: 'LauncherPlanCore',
  description: 'Shared launcher plan fields. Surface-local UX fields such as title, nextStep, openedSurface, and launchTarget stay outside this schema.',
})

export type LauncherPlanCore = Static<typeof LauncherPlanCore>

export const LauncherGovernanceRoutePolicy = Type.Object({
  foldingRequired: Type.Boolean(),
  retrievalRequired: Type.Boolean(),
  governanceRequired: Type.Boolean(),
  graphVerificationRequired: Type.Boolean(),
  renderValidationRequired: Type.Boolean(),
}, {
  $id: 'LauncherGovernanceRoutePolicy',
  description: 'Launcher-local route policy summary for operator visibility.',
})

export type LauncherGovernanceRoutePolicy = Static<typeof LauncherGovernanceRoutePolicy>

export const LauncherGovernancePromotionPolicy = Type.Object({
  qualityGate: Type.Boolean(),
  policyAlignment: Type.Boolean(),
  graphWriteVerification: Type.Boolean(),
  readBackVerification: Type.Boolean(),
  looseEndGenerationOnFailureOrBlock: Type.Boolean(),
}, {
  $id: 'LauncherGovernancePromotionPolicy',
  description: 'Launcher-local promotion policy summary. Read-only and non-canonical.',
})

export type LauncherGovernancePromotionPolicy = Static<typeof LauncherGovernancePromotionPolicy>

export const LauncherGovernanceGate = Type.Object({
  gate: Type.String({
    minLength: 1,
    description: 'Stable gate identifier.',
  }),
  status: Type.Union([
    Type.Literal('pass'),
    Type.Literal('fail'),
    Type.Literal('skip'),
    Type.Literal('coverage_gap'),
  ]),
  reasonCode: Type.String({
    minLength: 1,
    description: 'Machine-readable reason code for the gate outcome.',
  }),
}, {
  $id: 'LauncherGovernanceGate',
  description: 'One launcher-local governance gate result.',
})

export type LauncherGovernanceGate = Static<typeof LauncherGovernanceGate>

export const LauncherGovernanceSummary = Type.Object({
  promotionStatus: Type.Union([
    Type.Literal('not_promoted'),
    Type.Literal('blocked'),
  ]),
  looseEnd: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  gates: Type.Array(LauncherGovernanceGate, {
    minItems: 1,
  }),
  targetKind: Type.String({
    minLength: 1,
  }),
  boundaryOwner: Type.String({
    minLength: 1,
  }),
  routePolicy: LauncherGovernanceRoutePolicy,
  promotionPolicy: LauncherGovernancePromotionPolicy,
  disclaimer: Type.String({
    minLength: 1,
    description: 'Must state that launcher governance checks are local and not canonical promotion authority.',
  }),
}, {
  $id: 'LauncherGovernanceSummary',
  description: 'Read-only launcher governance rendering contract. Local-only governance context; not platform truth.',
})

export type LauncherGovernanceSummary = Static<typeof LauncherGovernanceSummary>

export const LauncherExecutionMetadata = Type.Object({
  evidenceDomain: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  reasonDomain: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  canonicalGovernance: Type.Optional(Type.Unknown({
    description: 'Canonical backend governance snapshot. Exact shape should converge in dedicated backend schemas.',
  })),
  retrievalSummary: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  degradedReasoning: Type.Optional(Type.Boolean()),
  fallbackToReason: Type.Optional(Type.Boolean()),
  fallbackFrom: Type.Optional(Type.String()),
  fallbackError: Type.Optional(Type.String()),
}, {
  $id: 'LauncherExecutionMetadata',
  description: 'Shared launcher execution metadata used for runtime transparency. Surface-only wording fields belong elsewhere.',
  additionalProperties: true,
})

export type LauncherExecutionMetadata = Static<typeof LauncherExecutionMetadata>

export const LauncherExecution = Type.Object({
  source: Type.String({
    minLength: 1,
    description: 'Execution source path, for example /reason or /api/rlm/ooda/run.',
  }),
  summary: Type.String({
    minLength: 1,
    description: 'Execution summary text returned by the current runtime path.',
  }),
  trace: Type.Array(Type.String(), {
    description: 'Runtime trace snippets suitable for cross-service debugging.',
  }),
  metadata: LauncherExecutionMetadata,
  governance: LauncherGovernanceSummary,
}, {
  $id: 'LauncherExecution',
  description: 'Shared launcher execution contract.',
})

export type LauncherExecution = Static<typeof LauncherExecution>

export const LauncherResponse = Type.Object({
  request: LauncherRequestEcho,
  plan: LauncherPlanCore,
  execution: LauncherExecution,
}, {
  $id: 'LauncherResponse',
  description: 'Shared launcher response contract. Surface-local fields such as greeting and launcher-specific UX labels are intentionally excluded.',
})

export type LauncherResponse = Static<typeof LauncherResponse>

export const OodaRuntimeContext = Type.Object({
  graph_summary: Type.String({
    minLength: 1,
    description: 'Folded or direct graph summary supplied to the OODA runtime.',
  }),
  source_surface: Type.String({
    minLength: 1,
    description: 'Surface invoking the OODA runtime.',
  }),
  grounding_directive: Type.String({
    minLength: 1,
    description: 'Grounding constraints applied to the runtime call.',
  }),
  evidence_domain: Type.String({
    minLength: 1,
  }),
  reason_domain: Type.String({
    minLength: 1,
  }),
  report_layout_contract: Type.Optional(Type.String()),
  evidence_context: Type.Optional(Type.String()),
}, {
  $id: 'OodaRuntimeContext',
  description: 'Context object supplied to the OODA runtime from launcher-like surfaces.',
})

export type OodaRuntimeContext = Static<typeof OodaRuntimeContext>

export const OodaRuntimeRequest = Type.Object({
  task: Type.String({
    minLength: 1,
    description: 'Task passed to the OODA runtime.',
  }),
  task_id: Type.String({
    minLength: 1,
    description: 'Stable task id for runtime tracking.',
  }),
  instruction: Type.String({
    minLength: 1,
    description: 'Canonical instruction field for OODA runtime requests.',
  }),
  instructions: Type.String({
    minLength: 1,
    description: 'Compatibility alias retained until all consumers converge on instruction.',
  }),
  context: OodaRuntimeContext,
}, {
  $id: 'OodaRuntimeRequest',
  description: 'Shared OODA runtime request contract used by launcher-style orchestration surfaces.',
})

export type OodaRuntimeRequest = Static<typeof OodaRuntimeRequest>

export const ReasonRuntimeResponseContract = Type.Object({
  jobStatement: Type.String(),
  successShape: Type.String(),
  requiredSections: Type.Array(Type.String()),
  boundaryRules: Type.Array(Type.String()),
  fallbackPolicy: Type.String(),
}, {
  $id: 'ReasonRuntimeResponseContract',
  description: 'Structured response contract guidance passed into the runtime request context.',
})

export type ReasonRuntimeResponseContract = Static<typeof ReasonRuntimeResponseContract>

export const ReasonRuntimeContext = Type.Object({
  response_contract: ReasonRuntimeResponseContract,
  evidence_domain: Type.Optional(Type.String()),
  reason_domain: Type.Optional(Type.String()),
  enriched_prompt: Type.Optional(Type.String()),
  _quality_task: Type.Optional(Type.String({
    description: 'Compatibility field retained during migration from local launcher runtime behavior.',
  })),
  _skip_knowledge_enrichment: Type.Optional(Type.Boolean({
    description: 'Compatibility field retained during migration from local launcher runtime behavior.',
  })),
  _output_mode: Type.Optional(Type.String({
    description: 'Compatibility field retained during migration from local launcher runtime behavior.',
  })),
  _expected_format: Type.Optional(Type.String({
    description: 'Compatibility field retained during migration from local launcher runtime behavior.',
  })),
  require_swarm: Type.Optional(Type.Boolean()),
}, {
  $id: 'ReasonRuntimeContext',
  description: 'Context passed to the /reason runtime. Compatibility fields are temporary until callers converge on typed fields.',
  additionalProperties: true,
})

export type ReasonRuntimeContext = Static<typeof ReasonRuntimeContext>

export const ReasonRuntimeRequest = Type.Object({
  task: Type.String({
    minLength: 1,
    description: 'Task passed to the /reason runtime.',
  }),
  domain: Type.String({
    minLength: 1,
    description: 'Resolved domain passed to the /reason runtime.',
  }),
  context: ReasonRuntimeContext,
}, {
  $id: 'ReasonRuntimeRequest',
  description: 'Shared /reason runtime request contract used by launcher-like surfaces.',
})

export type ReasonRuntimeRequest = Static<typeof ReasonRuntimeRequest>

export const ReasonRuntimeRouting = Type.Object({
  provider: Type.String({
    minLength: 1,
  }),
  model: Type.String({
    minLength: 1,
  }),
  latency_ms: Type.Optional(Type.Number({
    minimum: 0,
  })),
}, {
  $id: 'ReasonRuntimeRouting',
  description: 'Routing metadata returned by the /reason runtime.',
})

export type ReasonRuntimeRouting = Static<typeof ReasonRuntimeRouting>

export const ReasonRuntimeTelemetry = Type.Object({
  used_swarm: Type.Boolean(),
  used_rag: Type.Boolean(),
}, {
  $id: 'ReasonRuntimeTelemetry',
  description: 'Minimal runtime telemetry returned by the /reason runtime.',
})

export type ReasonRuntimeTelemetry = Static<typeof ReasonRuntimeTelemetry>

export const ReasonRuntimeResponse = Type.Object({
  recommendation: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  reasoning: Type.Optional(Type.String()),
  confidence: Type.Optional(Type.Number({
    minimum: 0,
    maximum: 1,
  })),
  routing: Type.Optional(ReasonRuntimeRouting),
  telemetry: Type.Optional(ReasonRuntimeTelemetry),
  reasoning_chain: Type.Optional(Type.Array(Type.String())),
}, {
  $id: 'ReasonRuntimeResponse',
  description: 'Shared /reason runtime response contract used by launcher-like surfaces.',
})

export type ReasonRuntimeResponse = Static<typeof ReasonRuntimeResponse>
