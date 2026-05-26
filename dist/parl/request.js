/**
 * PARL — Parallel Agentic Reasoning Loop HTTP wire types.
 *
 * Mirrors Python Pydantic models in rlm-engine/src/models/parl_requests.py.
 * Endpoint: POST /parl/reason  (RLM Engine)
 *
 * Wire format: snake_case JSON.
 */
import { Type } from '@sinclair/typebox';
export const PARLMode = Type.Union([
    Type.Literal('quick'),
    Type.Literal('deep'),
    Type.Literal('strategic'),
], { $id: 'PARLMode' });
export const PARLReasonRequest = Type.Object({
    task: Type.String({ minLength: 1, maxLength: 10000, description: 'Reasoning task description.' }),
    context: Type.Optional(Type.String({ maxLength: 100000, description: 'Additional context injected into the reasoning loop.' })),
    mode: Type.Optional(PARLMode),
    pattern_limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 10, description: 'Max agentic patterns retrieved (default: 3).' })),
    feedback_enabled: Type.Optional(Type.Boolean({ description: 'Whether to record feedback for flywheel training (default: true).' })),
}, {
    $id: 'PARLReasonRequest',
    description: 'POST /parl/reason request payload.',
    additionalProperties: false,
});
export const PARLPatternUsed = Type.Record(Type.String(), Type.Unknown(), {
    $id: 'PARLPatternUsed',
    description: 'Agentic pattern node returned from retrieval.',
});
export const PARLReasonResponse = Type.Object({
    parl_run_id: Type.String({ description: 'Unique identifier for this PARL run (e.g. "parl-abc123-ts").' }),
    reasoning: Type.String({ description: 'Final synthesised reasoning output.' }),
    patterns_used: Type.Array(PARLPatternUsed, { description: 'Agentic patterns retrieved and applied.' }),
    compressed_tokens: Type.Integer({ minimum: 0, description: 'Token count after context compression.' }),
    feedback_status: Type.String({ description: '"recorded" | "skipped" | error message.' }),
    error: Type.Optional(Type.Union([Type.String(), Type.Null()], { description: 'Present when success=false.' })),
}, {
    $id: 'PARLReasonResponse',
    description: 'POST /parl/reason response (nested under success envelope).',
});
//# sourceMappingURL=request.js.map