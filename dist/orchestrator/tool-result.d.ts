/**
 * OrchestratorToolResult — Orchestrator → Agent
 *
 * After the Orchestrator calls the WidgeTDC backend MCP tool and
 * collects the SSE stream into a final result, it returns this shape
 * back to the requesting agent.
 *
 * Wire format: snake_case JSON
 */
import { Static } from '@sinclair/typebox';
export declare const OrchestratorToolStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"success">, import("@sinclair/typebox").TLiteral<"error">, import("@sinclair/typebox").TLiteral<"timeout">, import("@sinclair/typebox").TLiteral<"rate_limited">, import("@sinclair/typebox").TLiteral<"unauthorized">]>;
export type OrchestratorToolStatus = Static<typeof OrchestratorToolStatus>;
export declare const OrchestratorToolResult: import("@sinclair/typebox").TObject<{
    /** Correlates back to OrchestratorToolCall.call_id */
    call_id: import("@sinclair/typebox").TString;
    /** Outcome */
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"success">, import("@sinclair/typebox").TLiteral<"error">, import("@sinclair/typebox").TLiteral<"timeout">, import("@sinclair/typebox").TLiteral<"rate_limited">, import("@sinclair/typebox").TLiteral<"unauthorized">]>;
    /** Raw result from the MCP tool (null on error) */
    result: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnknown, import("@sinclair/typebox").TNull]>;
    /** Human-readable error message (only set when status != success) */
    error_message: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    /** Error code for programmatic handling */
    error_code: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"TOOL_NOT_FOUND">, import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">, import("@sinclair/typebox").TLiteral<"BACKEND_ERROR">, import("@sinclair/typebox").TLiteral<"TIMEOUT">, import("@sinclair/typebox").TLiteral<"RATE_LIMITED">, import("@sinclair/typebox").TLiteral<"UNAUTHORIZED">, import("@sinclair/typebox").TLiteral<"SSE_PARSE_ERROR">, import("@sinclair/typebox").TNull]>>;
    /** How long the backend call took (ms) */
    duration_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    /** Correlation trace ID (mirrors the call's trace_id if provided) */
    trace_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    /** ISO timestamp when result was produced */
    completed_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type OrchestratorToolResult = Static<typeof OrchestratorToolResult>;
//# sourceMappingURL=tool-result.d.ts.map