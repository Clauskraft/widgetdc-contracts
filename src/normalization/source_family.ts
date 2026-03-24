import { Type, Static } from '@sinclair/typebox'

/** Canonical source families for tri-source arbitration */
export const SourceFamily = Type.Union([
  Type.Literal('research'),
  Type.Literal('regulatory'),
  Type.Literal('enterprise'),
], { $id: 'SourceFamily', description: 'Canonical source family for tri-source arbitration' })

export type SourceFamily = Static<typeof SourceFamily>
