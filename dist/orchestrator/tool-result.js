/**
 * OrchestratorToolResult — Orchestrator → Agent
 *
 * After the Orchestrator calls the WidgeTDC backend MCP tool and
 * collects the SSE stream into a final result, it returns this shape
 * back to the requesting agent.
 *
 * Wire format: snake_case JSON
 */
import { Type } from '@sinclair/typebox';
export const OrchestratorToolStatus = Type.Union([
    Type.Literal('success'),
    Type.Literal('error'),
    Type.Literal('timeout'),
    Type.Literal('rate_limited'),
    Type.Literal('unauthorized'),
], {
    $id: 'OrchestratorToolStatus',
    description: 'Outcome status of an Orchestrator tool call',
});
export const OrchestratorToolResult = Type.Object({
    /** Correlates back to OrchestratorToolCall.call_id */
    call_id: Type.String({
        format: 'uuid',
        description: 'Mirrors the call_id from the originating OrchestratorToolCall',
    }),
    /** Outcome */
    status: OrchestratorToolStatus,
    /** Raw result from the MCP tool (null on error) */
    result: Type.Union([Type.Unknown(), Type.Null()], {
        description: 'Parsed tool output — whatever the MCP tool returned',
    }),
    /** Human-readable error message (only set when status != success) */
    error_message: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    /** Error code for programmatic handling */
    error_code: Type.Optional(Type.Union([
        Type.Literal('TOOL_NOT_FOUND'),
        Type.Literal('VALIDATION_ERROR'),
        Type.Literal('BACKEND_ERROR'),
        Type.Literal('TIMEOUT'),
        Type.Literal('RATE_LIMITED'),
        Type.Literal('UNAUTHORIZED'),
        Type.Literal('SSE_PARSE_ERROR'),
        Type.Null(),
    ])),
    /** How long the backend call took (ms) */
    duration_ms: Type.Optional(Type.Number({ minimum: 0 })),
    /** Correlation trace ID (mirrors the call's trace_id if provided) */
    trace_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    /** ISO timestamp when result was produced */
    completed_at: Type.Optional(Type.String({ format: 'date-time' })),
}, {
    $id: 'OrchestratorToolResult',
    description: 'Orchestrator → Agent: result of an MCP tool invocation. Includes raw output or structured error.',
});
//# sourceMappingURL=tool-result.js.map