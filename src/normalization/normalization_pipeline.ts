import { Type, Static } from '@sinclair/typebox'
import { SourceFamily } from './source_family.js'
import { NormalizedCandidate } from './normalized_candidate.js'

/** Input to the normalization pipeline */
export const NormalizationInput = Type.Object({
  source_family: SourceFamily,
  source_id: Type.String({ description: 'Identifier in the source system' }),
  raw_content: Type.String({ description: 'Raw content before normalization' }),
  raw_metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  pipeline_config: Type.Optional(Type.Object({
    strip_html: Type.Optional(Type.Boolean({ default: true })),
    max_content_length: Type.Optional(Type.Number({ default: 50000 })),
    extract_title: Type.Optional(Type.Boolean({ default: true })),
  })),
}, { $id: 'NormalizationInput', description: 'Input payload for the normalization pipeline' })

export type NormalizationInput = Static<typeof NormalizationInput>

/** Successful normalization output */
export const NormalizationOutput = Type.Object({
  candidate: NormalizedCandidate,
  pipeline_version: Type.String(),
  processing_time_ms: Type.Number({ description: 'Time taken to normalize in milliseconds' }),
}, { $id: 'NormalizationOutput', description: 'Successful normalization result' })

export type NormalizationOutput = Static<typeof NormalizationOutput>

/** Normalization error */
export const NormalizationError = Type.Object({
  source_id: Type.String(),
  source_family: SourceFamily,
  error_code: Type.Union([
    Type.Literal('INVALID_CONTENT'),
    Type.Literal('UNSUPPORTED_FORMAT'),
    Type.Literal('CONTENT_TOO_LARGE'),
    Type.Literal('MISSING_REQUIRED_FIELD'),
    Type.Literal('PIPELINE_ERROR'),
  ], { description: 'Machine-readable error code' }),
  message: Type.String({ description: 'Human-readable error description' }),
  occurred_at: Type.String({ format: 'date-time' }),
}, { $id: 'NormalizationError', description: 'Error from normalization pipeline' })

export type NormalizationError = Static<typeof NormalizationError>
