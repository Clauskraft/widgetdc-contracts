import { Type, Static } from '@sinclair/typebox'

/** Consulting agent tiers — ascending autonomy level */
export const AgentTier = Type.Union([
  Type.Literal('ANALYST'),
  Type.Literal('ASSOCIATE'),
  Type.Literal('MANAGER'),
  Type.Literal('PARTNER'),
  Type.Literal('ARCHITECT'),
], { $id: 'AgentTier', description: 'Consulting agent tier (ascending autonomy)' })

export type AgentTier = Static<typeof AgentTier>

/** RLM Engine agent personas — specialized cognitive roles */
export const AgentPersona = Type.Union([
  Type.Literal('RESEARCHER'),
  Type.Literal('ENGINEER'),
  Type.Literal('CUSTODIAN'),
  Type.Literal('ARCHITECT'),
  Type.Literal('SENTINEL'),
  Type.Literal('ARCHIVIST'),
  Type.Literal('HARVESTER'),
  Type.Literal('ANALYST'),
  Type.Literal('INTEGRATOR'),
  Type.Literal('TESTER'),
], { $id: 'AgentPersona', description: 'RLM Engine agent persona' })

export type AgentPersona = Static<typeof AgentPersona>

/** Signal types emitted during engagement execution */
export const SignalType = Type.Union([
  Type.Literal('task_started'),
  Type.Literal('task_completed'),
  Type.Literal('task_failed'),
  Type.Literal('escalation'),
  Type.Literal('quality_gate'),
  Type.Literal('tool_executed'),
  Type.Literal('deliverable_generated'),
  Type.Literal('insight'),
  Type.Literal('warning'),
], { $id: 'SignalType', description: 'Agent signal event type' })

export type SignalType = Static<typeof SignalType>
