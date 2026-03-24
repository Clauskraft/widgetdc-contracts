import { Type, Static } from '@sinclair/typebox'
import { SourceFamily } from './source_family.js'

/** A candidate normalized from any source family into a common schema */
export const NormalizedCandidate = Type.Object({
  candidate_id: Type.String({ format: 'uuid', description: 'Unique identifier for this normalized candidate' }),
  source_family: SourceFamily,
  source_id: Type.String({ description: 'Original identifier in the source system' }),
  title: Type.String({ minLength: 1, maxLength: 512, description: 'Candidate title or headline' }),
  content: Type.String({ description: 'Normalized content body' }),
  confidence: Type.Number({ minimum: 0, maximum: 1, description: 'Normalization confidence score (0-1)' }),
  metadata: Type.Record(Type.String(), Type.Unknown(), { description: 'Source-specific metadata preserved through normalization' }),
  normalized_at: Type.String({ format: 'date-time', description: 'ISO-8601 timestamp of normalization' }),
  normalization_version: Type.String({ description: 'Version of the normalization pipeline that produced this candidate' }),
}, { $id: 'NormalizedCandidate', description: 'Universal normalized candidate for cross-source arbitration' })

export type NormalizedCandidate = Static<typeof NormalizedCandidate>
