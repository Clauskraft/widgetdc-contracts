import { Type, type Static } from '@sinclair/typebox'

export const OperatorPheromoneSignalType = Type.Union([
  Type.Literal('risk'),
  Type.Literal('novelty'),
  Type.Literal('question'),
  Type.Literal('claim'),
  Type.Literal('contradiction'),
  Type.Literal('breaking_change'),
  Type.Literal('opportunity'),
  Type.Literal('attention'),
], { $id: 'OperatorPheromoneSignalType', description: 'Canonical signal types for operator-anchored pheromones.' })

export type OperatorPheromoneSignalType = Static<typeof OperatorPheromoneSignalType>

export const PheromoneClientSurface = Type.Union([
  Type.Literal('canvas'),
  Type.Literal('word_addin'),
  Type.Literal('excel_addin'),
  Type.Literal('web_overlay'),
  Type.Literal('filesystem_shell'),
], { $id: 'PheromoneClientSurface', description: 'Client surfaces allowed to create operator-anchored pheromones.' })

export type PheromoneClientSurface = Static<typeof PheromoneClientSurface>

export const ResourceAnchorInput = Type.Object({
  anchor_kind: Type.Union([
    Type.Literal('docx-page'),
    Type.Literal('docx-paragraph'),
    Type.Literal('xlsx-cell'),
    Type.Literal('xlsx-range'),
    Type.Literal('file'),
    Type.Literal('folder'),
    Type.Literal('pdf-page'),
    Type.Literal('web-url'),
    Type.Literal('web-selection'),
    Type.Literal('code-span'),
  ]),
  resource_uri: Type.String({ minLength: 1, maxLength: 2048 }),
  resource_label: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  locator_json: Type.Record(Type.String(), Type.Unknown()),
  anchor_text: Type.Optional(Type.String({ maxLength: 4000 })),
  content_fingerprint: Type.Optional(Type.String({ maxLength: 255 })),
}, { $id: 'ResourceAnchorInput', description: 'Stable locator payload for operator-anchored pheromone placement.' })

export type ResourceAnchorInput = Static<typeof ResourceAnchorInput>

export const CreateOperatorAnchoredPheromoneRequest = Type.Object({
  anchor: ResourceAnchorInput,
  signal_type: OperatorPheromoneSignalType,
  rationale: Type.Optional(Type.String({ maxLength: 1000 })),
  strength: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
  created_by: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  client_surface: PheromoneClientSurface,
  client_session_id: Type.Optional(Type.String({ maxLength: 255 })),
  consent_grant_id: Type.Optional(Type.String({ maxLength: 255 })),
}, { $id: 'CreateOperatorAnchoredPheromoneRequest', description: 'Backend request payload for placing an operator-anchored pheromone.' })

export type CreateOperatorAnchoredPheromoneRequest = Static<typeof CreateOperatorAnchoredPheromoneRequest>

export const CreateOperatorAnchoredPheromoneResponse = Type.Object({
  status: Type.Literal('accepted'),
  pheromone_id: Type.String(),
  anchor_id: Type.String(),
  inspection_enqueued: Type.Boolean(),
  accepted_at: Type.String({ format: 'date-time' }),
  directive_run_id: Type.String(),
}, { $id: 'CreateOperatorAnchoredPheromoneResponse', description: 'Backend acceptance payload for operator-anchored pheromone placement.' })

export type CreateOperatorAnchoredPheromoneResponse = Static<typeof CreateOperatorAnchoredPheromoneResponse>

export const PheromoneInspectionVerdict = Type.Union([
  Type.Literal('informational'),
  Type.Literal('relevant'),
  Type.Literal('novel'),
  Type.Literal('contradictory'),
  Type.Literal('breaking'),
  Type.Literal('incorrect'),
  Type.Literal('needs_review'),
], { $id: 'PheromoneInspectionVerdict', description: 'Canonical inspection verdicts for operator-anchored pheromones.' })

export type PheromoneInspectionVerdict = Static<typeof PheromoneInspectionVerdict>

export const InspectOperatorAnchoredPheromoneResponse = Type.Object({
  status: Type.Literal('completed'),
  pheromone_id: Type.String(),
  inspection_id: Type.String(),
  verdict: PheromoneInspectionVerdict,
  candidate_actions: Type.Array(Type.String()),
}, { $id: 'InspectOperatorAnchoredPheromoneResponse', description: 'Inspection result payload for operator-anchored pheromone review.' })

export type InspectOperatorAnchoredPheromoneResponse = Static<typeof InspectOperatorAnchoredPheromoneResponse>

export const PromoteOperatorAnchoredPheromoneRequest = Type.Object({
  target_kind: Type.Union([
    Type.Literal('innovation_ticket'),
    Type.Literal('training_proposal'),
    Type.Literal('contradiction_review'),
  ]),
}, { $id: 'PromoteOperatorAnchoredPheromoneRequest', description: 'Promotion request for an inspected operator-anchored pheromone.' })

export type PromoteOperatorAnchoredPheromoneRequest = Static<typeof PromoteOperatorAnchoredPheromoneRequest>

export const PromoteOperatorAnchoredPheromoneResponse = Type.Object({
  status: Type.Union([Type.Literal('accepted'), Type.Literal('rejected')]),
  pheromone_id: Type.String(),
  target_kind: Type.String(),
  target_id: Type.Union([Type.String(), Type.Null()]),
  rejection_reason: Type.Optional(Type.String()),
}, { $id: 'PromoteOperatorAnchoredPheromoneResponse', description: 'Promotion outcome payload for operator-anchored pheromones.' })

export type PromoteOperatorAnchoredPheromoneResponse = Static<typeof PromoteOperatorAnchoredPheromoneResponse>

export const HumanSignaledPheromoneTriggerRequest = Type.Object({
  source: Type.String({ minLength: 1, maxLength: 128 }),
  domain: Type.String({ minLength: 1, maxLength: 128 }),
  label: Type.String({ minLength: 1, maxLength: 256 }),
  signal_type: OperatorPheromoneSignalType,
  client_surface: PheromoneClientSurface,
  strength: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
  rationale: Type.Optional(Type.String({ maxLength: 1000 })),
  metrics: Type.Optional(Type.Record(Type.String(), Type.Number())),
  anchor: Type.Optional(ResourceAnchorInput),
}, { $id: 'HumanSignaledPheromoneTriggerRequest', description: 'Orchestrator payload for propagating a human-signaled pheromone into swarm pheromone processing.' })

export type HumanSignaledPheromoneTriggerRequest = Static<typeof HumanSignaledPheromoneTriggerRequest>

export const HumanSignaledPheromoneTriggerResponse = Type.Object({
  status: Type.Union([Type.Literal('accepted'), Type.Literal('rejected')]),
  domain: Type.String(),
  signal_type: OperatorPheromoneSignalType,
  client_surface: PheromoneClientSurface,
  message: Type.String(),
  accepted_at: Type.Optional(Type.String({ format: 'date-time' })),
}, { $id: 'HumanSignaledPheromoneTriggerResponse', description: 'Orchestrator acknowledgement for a human-signaled pheromone trigger.' })

export type HumanSignaledPheromoneTriggerResponse = Static<typeof HumanSignaledPheromoneTriggerResponse>
