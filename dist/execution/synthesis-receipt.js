import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import '../formats.js';
import { EvidenceLevel, HonestOutcome } from './execution-envelope.js';
export const SYNTHESIS_RECEIPT_SCHEMA_ID = 'https://contracts.widgetdc.dev/execution/synthesis-receipt.schema.json';
export const ArtifactCheck = Type.Object({
    artifact_type: Type.String({ minLength: 1 }),
    required_count: Type.Integer({ minimum: 0 }),
    observed_count: Type.Integer({ minimum: 0 }),
    schema_valid: Type.Boolean(),
    content_readable: Type.Boolean(),
}, { $id: 'ArtifactCheck', additionalProperties: false });
export const SynthesisReceipt = Type.Object({
    $id: Type.Literal(SYNTHESIS_RECEIPT_SCHEMA_ID),
    receipt_id: Type.String({ minLength: 1 }),
    envelope_id: Type.String({ minLength: 1 }),
    correlation_id: Type.String({ minLength: 1 }),
    outcome: HonestOutcome,
    artifact_checks: Type.Array(ArtifactCheck),
    candidate_bundle_refs: Type.Array(Type.String({ minLength: 1 }), { uniqueItems: true }),
    independent_verifier_ref: Type.Optional(Type.String({ minLength: 1 })),
    missing_perspectives: Type.Array(Type.String({ minLength: 1 }), { uniqueItems: true }),
    next_step: Type.String({ minLength: 1 }),
    claim_level: EvidenceLevel,
    event_spine_ref: Type.Optional(Type.String({ minLength: 1 })),
    created_at: Type.String({ format: 'date-time' }),
}, {
    $id: SYNTHESIS_RECEIPT_SCHEMA_ID,
    title: 'WDC Synthesis Receipt',
    additionalProperties: false,
});
/**
 * Applies receipt semantics that JSON Schema cannot express, notably the
 * comparison between observed_count and required_count.
 */
export function validateSynthesisReceipt(value) {
    if (!Value.Check(SynthesisReceipt, value))
        return false;
    if (value.outcome !== 'completed')
        return true;
    if (value.artifact_checks.length === 0)
        return false;
    return value.artifact_checks.every((check) => check.observed_count >= check.required_count &&
        check.schema_valid &&
        check.content_readable);
}
//# sourceMappingURL=synthesis-receipt.js.map