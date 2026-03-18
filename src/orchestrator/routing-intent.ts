import { Type, Static } from '@sinclair/typebox'

export const RoutingCapability = Type.Union([
  Type.Literal('engagement_intake'),
  Type.Literal('guided_decomposition'),
  Type.Literal('verified_recommendation'),
  Type.Literal('learning_feedback'),
  Type.Literal('workflow_audit'),
], {
  $id: 'RoutingCapability',
  description: 'Capabilities the orchestrator may route within the active LIN-165 wedge.',
})

export type RoutingCapability = Static<typeof RoutingCapability>

export const RoutingIntent = Type.Object({
  intent_id: Type.String({
    description: 'Stable intent identifier for routing and lineage.',
  }),
  capability: RoutingCapability,
  task_domain: Type.Union([
    Type.Literal('intake'),
    Type.Literal('decomposition'),
    Type.Literal('recommendation'),
    Type.Literal('learning'),
    Type.Literal('audit'),
  ], {
    description: 'Execution domain for scorecard and trust-model mapping.',
  }),
  flow_ref: Type.Union([
    Type.Literal('core-flow-1'),
    Type.Literal('core-flow-2'),
    Type.Literal('core-flow-3'),
  ], {
    description: 'Canonical LIN-165 flow this intent strengthens.',
  }),
  route_scope: Type.Array(Type.Union([
    Type.Literal('widgetdc-orchestrator'),
    Type.Literal('widgetdc-librechat'),
    Type.Literal('snout'),
  ]), {
    minItems: 1,
    uniqueItems: true,
    description: 'Only approved consumers for this routing intent.',
  }),
  operator_visible: Type.Boolean({
    description: 'Whether this intent may be surfaced in LibreChat lineage UI.',
  }),
  scorecard_dimensions: Type.Array(Type.Union([
    Type.Literal('prioritization_quality'),
    Type.Literal('decomposition_quality'),
    Type.Literal('promotion_precision'),
    Type.Literal('decision_stability'),
    Type.Literal('operator_acceptance'),
    Type.Literal('time_to_verified_decision'),
    Type.Literal('tri_source_arbitration_divergence'),
  ]), {
    minItems: 1,
    uniqueItems: true,
    description: 'Decision-quality dimensions this routing intent is expected to affect.',
  }),
}, {
  $id: 'RoutingIntent',
  description:
    'Canonical routing intent used by the orchestrator to classify and constrain work within the active WidgeTDC wedge.',
})

export type RoutingIntent = Static<typeof RoutingIntent>
