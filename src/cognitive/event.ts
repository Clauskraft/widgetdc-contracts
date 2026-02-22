import { Type, Static } from '@sinclair/typebox'

export const IntelligenceEventType = Type.Union([
  Type.Literal('context_folded'),
  Type.Literal('routing_decision'),
  Type.Literal('recommendation_ready'),
  Type.Literal('learning_update'),
  Type.Literal('health_change'),
  Type.Literal('quality_scored'),
  Type.Literal('q_learning_updated'),
  Type.Literal('meta_learning_applied'),
  Type.Literal('agent_memory_persisted'),
  Type.Literal('attention_fold_complete'),
  Type.Literal('circuit_breaker_triggered'),
  Type.Literal('sse_bridge_connected'),
  Type.Literal('error'),
])

export type IntelligenceEventType = Static<typeof IntelligenceEventType>

export const IntelligenceEvent = Type.Object({
  type: IntelligenceEventType,
  payload: Type.Record(Type.String(), Type.Unknown(), {
    description: 'Event-type-specific data',
  }),
  trace_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  source: Type.Optional(Type.Union([
    Type.Literal('rlm-engine'),
    Type.Literal('backend'),
    Type.Literal('frontend'),
  ], { default: 'rlm-engine' })),
  timestamp: Type.String({ format: 'date-time' }),
}, { $id: 'IntelligenceEvent', description: 'Real-time intelligence events via Redis Pub/Sub or SSE.' })

export type IntelligenceEvent = Static<typeof IntelligenceEvent>
