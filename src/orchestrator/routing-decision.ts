import { Type, Static } from '@sinclair/typebox'
import { AgentId } from './agent-message.js'
import { RoutingCapability, RoutingIntent } from './routing-intent.js'

export const RoutingDecision = Type.Object({
  decision_id: Type.String({
    description: 'Stable routing decision identifier for runtime lineage and read-back.',
  }),
  intent: RoutingIntent,
  selected_agent_id: Type.Union([AgentId, Type.String()], {
    description: 'Selected agent or runtime agent ID chosen by the orchestrator.',
  }),
  selected_capability: RoutingCapability,
  trust_score: Type.Number({
    minimum: 0,
    maximum: 1,
    description: 'Trust score that justified the selected route.',
  }),
  reason_code: Type.Union([
    Type.Literal('TRUST_WIN'),
    Type.Literal('COST_TIER_MATCH'),
    Type.Literal('FLOW_SPECIALIZATION'),
    Type.Literal('FALLBACK_ROUTE'),
    Type.Literal('WAIVER_ROUTE'),
    Type.Literal('FABRIC_WIN'),
  ], {
    description: 'Why this route was selected.',
  }),
  fabric_route_id: Type.Optional(Type.String({
    description: 'Virtual fabric identifier for low-latency agent-to-agent communication (Adoption: NVIDIA NVLink 6).',
  })),
  latency_deterministic: Type.Optional(Type.Boolean({
    description: 'Whether the route guarantees deterministic response time for MoE (Mixture-of-Experts) swarms.',
    default: false,
  })),
  vampire_drain_rate: Type.Optional(Type.Number({
    minimum: 0,
    maximum: 1,
    description: 'Rate of intellectual or economic value extraction from the target competitor (Adoption: Strategic Strategy Vampire).',
  })),
  target_shadow_id: Type.Optional(Type.String({
    description: 'Reference to the CompetitorShadow node being drained or intercepted.',
  })),
  evidence_refs: Type.Array(Type.String(), {
    minItems: 1,
    description: 'References to trust, scorecard, or runtime evidence used during routing.',
  }),
  waiver_reason: Type.Optional(Type.String({
    description: 'Required when fallback or waiver routing is used instead of the ideal route.',
  })),
  decided_at: Type.String({
    format: 'date-time',
    description: 'Timestamp when the routing decision was made.',
  }),
}, {
  $id: 'RoutingDecision',
  description:
    'Minimal routing decision envelope. Supports orchestrator routing transparency without introducing a second governance truth.',
})

export type RoutingDecision = Static<typeof RoutingDecision>
