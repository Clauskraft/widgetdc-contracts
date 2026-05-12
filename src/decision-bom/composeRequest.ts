/**
 * PhantomBOM HTTP wire types — compose + route request/response envelopes.
 *
 * Mirrors Python Pydantic models in rlm-engine/src/models/phantom_bom_requests.py.
 * Endpoints: POST /phantom-bom/compose, POST /phantom-bom/{run_id}/route
 *
 * Wire format: snake_case JSON.
 */
import { Type, Static } from '@sinclair/typebox'

export const PhantomBOMFramework = Type.Union([
  Type.Literal('MECE'),
  Type.Literal('HDR'),
  Type.Literal('Pyramid'),
  Type.Literal('STRIDE'),
], { $id: 'PhantomBOMFramework', description: 'Decomposition framework used by the BOM compiler.' })

export type PhantomBOMFramework = Static<typeof PhantomBOMFramework>

export const PhantomBOMComposeRequest = Type.Object({
  framework: PhantomBOMFramework,
  brief: Type.String({ minLength: 1, maxLength: 2000, description: 'Decision brief to decompose.' }),
  correlation_id: Type.Optional(Type.String({ maxLength: 120, description: 'Passed through to event spine.' })),
  max_items: Type.Optional(Type.Integer({ minimum: 1, maximum: 20, description: 'Max BOM items to emit (default: 12).' })),
}, {
  $id: 'PhantomBOMComposeRequest',
  description: 'POST /phantom-bom/compose payload.',
  additionalProperties: false,
})

export type PhantomBOMComposeRequest = Static<typeof PhantomBOMComposeRequest>

export const PhantomBOMRouteRequest = Type.Object({}, {
  $id: 'PhantomBOMRouteRequest',
  description: 'POST /phantom-bom/{run_id}/route payload (reserved for future routing hints).',
})

export type PhantomBOMRouteRequest = Static<typeof PhantomBOMRouteRequest>

export const PhantomBOMResponse = Type.Object({
  success: Type.Boolean(),
  data: Type.Record(Type.String(), Type.Unknown()),
  metadata: Type.Record(Type.String(), Type.Unknown()),
}, {
  $id: 'PhantomBOMResponse',
  description: 'Standard success envelope for all Phantom BOM endpoints.',
})

export type PhantomBOMResponse = Static<typeof PhantomBOMResponse>
