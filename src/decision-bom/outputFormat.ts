/**
 * OutputFormat + LlmAgnosticResponse — LLM-provider-agnostic output contracts.
 *
 * Any service that calls an LLM and returns structured output MUST wrap the
 * response in LlmAgnosticResponse. This allows the frontend to render correctly
 * regardless of which provider produced the content.
 *
 * Wire format: snake_case JSON.
 */
import { Type, Static } from '@sinclair/typebox'
import type { TaskType, ProviderId } from '../llm/types.js'

/** Canonical output format literals for LLM-produced content. */
export const OutputFormat = Type.Union([
  Type.Literal('html'),
  Type.Literal('markdown'),
  Type.Literal('json'),
  Type.Literal('pptx'),
  Type.Literal('docx'),
  Type.Literal('text'),
], { $id: 'OutputFormat', description: 'Wire format of the produced content.' })

export type OutputFormat = Static<typeof OutputFormat>

/**
 * LlmAgnosticResponse — wrapper for any LLM-produced output.
 *
 * Every API route that calls an LLM MUST return this wrapper so consumers
 * (frontend, downstream services) are decoupled from provider identity.
 *
 * Example (snake_case wire):
 *   {
 *     "content": "<html>...</html>",
 *     "format": "html",
 *     "provider_used": "gemini",
 *     "task_type": "consulting_assessment",
 *     "model_used": "gemini-2.0-flash",
 *     "latency_ms": 1240
 *   }
 */
export const LlmAgnosticResponse = Type.Object({
  content: Type.String({ description: 'Produced content. Format is declared in `format`.' }),
  format: OutputFormat,
  provider_used: Type.String({ description: 'ProviderId of the provider that succeeded.' }),
  task_type: Type.String({ description: 'TaskType used for LlmMatrix routing.' }),
  model_used: Type.Optional(Type.String({ description: 'Specific model name that succeeded.' })),
  latency_ms: Type.Optional(Type.Integer({ minimum: 0 })),
  bom_item_id: Type.Optional(Type.String({ description: 'BOMItem ID if this response was persisted to the graph.' })),
  correlation_id: Type.Optional(Type.String()),
}, {
  $id: 'LlmAgnosticResponse',
  description: 'Provider-agnostic wrapper for all LLM-produced content. Enables hot-swapping of providers without frontend changes.',
  additionalProperties: true,
})

export type LlmAgnosticResponse = Static<typeof LlmAgnosticResponse>
