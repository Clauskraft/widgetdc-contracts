import { Type } from '@sinclair/typebox';
export const EXECUTION_ENVELOPE_SCHEMA_ID = 'https://contracts.widgetdc.dev/execution/execution-envelope.schema.json';
export const HonestOutcome = Type.Union([
    Type.Literal('completed_noop'),
    Type.Literal('completed_unverified'),
    Type.Literal('completed'),
    Type.Literal('expected_stop'),
    Type.Literal('failed'),
], { $id: 'HonestOutcome' });
export const EvidenceLevel = Type.Union([
    Type.Literal('L0'),
    Type.Literal('L1'),
    Type.Literal('L2'),
    Type.Literal('L3'),
    Type.Literal('L4'),
    Type.Literal('L5'),
], { $id: 'EvidenceLevel' });
export const AdapterRole = Type.Union([Type.Literal('candidate_writer'), Type.Literal('specialist'), Type.Literal('verifier')], { $id: 'AdapterRole' });
export const RequiredArtifact = Type.Object({
    artifact_type: Type.String({ minLength: 1 }),
    schema_id: Type.String({ format: 'uri' }),
    minimum_count: Type.Integer({ minimum: 0 }),
    required_for_completion: Type.Boolean(),
}, { $id: 'RequiredArtifact', additionalProperties: false });
export const AdapterSelection = Type.Object({
    adapter_id: Type.String({ minLength: 1 }),
    adapter_version: Type.String({ minLength: 1 }),
    role: AdapterRole,
    required: Type.Boolean(),
    certification_ref: Type.String({ minLength: 1 }),
}, { $id: 'AdapterSelection', additionalProperties: false });
export const ExecutionEnvelope = Type.Object({
    $id: Type.Literal(EXECUTION_ENVELOPE_SCHEMA_ID),
    envelope_id: Type.String({ minLength: 1 }),
    schema_version: Type.Literal('1.0.0'),
    task_bom_id: Type.String({ minLength: 1 }),
    route_envelope_ref: Type.String({ minLength: 1 }),
    actor_id: Type.String({ minLength: 1 }),
    target_repo: Type.String({ minLength: 1 }),
    target_head: Type.String({ minLength: 7 }),
    controller: Type.Literal('wdc_native'),
    workflow: Type.Union([
        Type.Literal('discover'),
        Type.Literal('define'),
        Type.Literal('develop'),
        Type.Literal('deliver'),
    ]),
    risk_class: Type.Union([
        Type.Literal('read_only'),
        Type.Literal('source_mutation'),
        Type.Literal('governed_mutation'),
    ]),
    selected_pattern_ids: Type.Array(Type.String({ minLength: 1 }), {
        minItems: 1,
        uniqueItems: true,
    }),
    adapters: Type.Array(AdapterSelection),
    required_artifacts: Type.Array(RequiredArtifact, { minItems: 1 }),
    degradation_policy_id: Type.String({ minLength: 1 }),
    stop_condition_ids: Type.Array(Type.String({ minLength: 1 }), {
        minItems: 1,
        uniqueItems: true,
    }),
    claim_ceiling: EvidenceLevel,
    idempotency_key: Type.String({ minLength: 16 }),
    created_at: Type.String({ format: 'date-time' }),
}, {
    $id: EXECUTION_ENVELOPE_SCHEMA_ID,
    title: 'WDC Execution Envelope',
    additionalProperties: false,
});
//# sourceMappingURL=execution-envelope.js.map