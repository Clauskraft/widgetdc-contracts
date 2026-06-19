/**
 * OutputFormat + LlmAgnosticResponse — LLM-provider-agnostic output contracts.
 *
 * Any service that calls an LLM and returns structured output MUST wrap the
 * response in LlmAgnosticResponse. This allows the frontend to render correctly
 * regardless of which provider produced the content.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
/** Canonical output format literals for LLM-produced content. */
export declare const OutputFormat: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"html">, import("@sinclair/typebox").TLiteral<"markdown">, import("@sinclair/typebox").TLiteral<"json">, import("@sinclair/typebox").TLiteral<"pptx">, import("@sinclair/typebox").TLiteral<"docx">, import("@sinclair/typebox").TLiteral<"text">]>;
export type OutputFormat = Static<typeof OutputFormat>;
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
export declare const LlmAgnosticResponse: import("@sinclair/typebox").TObject<{
    content: import("@sinclair/typebox").TString;
    format: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"html">, import("@sinclair/typebox").TLiteral<"markdown">, import("@sinclair/typebox").TLiteral<"json">, import("@sinclair/typebox").TLiteral<"pptx">, import("@sinclair/typebox").TLiteral<"docx">, import("@sinclair/typebox").TLiteral<"text">]>;
    provider_used: import("@sinclair/typebox").TString;
    task_type: import("@sinclair/typebox").TString;
    model_used: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    bom_item_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type LlmAgnosticResponse = Static<typeof LlmAgnosticResponse>;
//# sourceMappingURL=outputFormat.d.ts.map