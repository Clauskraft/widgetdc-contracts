import { Type } from '@sinclair/typebox';
import { AdapterRole, HonestOutcome } from './execution-envelope.js';
export const CANDIDATE_BUNDLE_SCHEMA_ID = 'https://contracts.widgetdc.dev/execution/candidate-bundle.schema.json';
export const CandidateArtifact = Type.Object({
    artifact_id: Type.String({ minLength: 1 }),
    artifact_type: Type.String({ minLength: 1 }),
    schema_id: Type.String({ format: 'uri' }),
    content_ref: Type.String({ minLength: 1 }),
    content_hash: Type.String({ minLength: 1 }),
}, { $id: 'CandidateArtifact', additionalProperties: false });
export const CandidateBundle = Type.Object({
    $id: Type.Literal(CANDIDATE_BUNDLE_SCHEMA_ID),
    bundle_id: Type.String({ minLength: 1 }),
    envelope_id: Type.String({ minLength: 1 }),
    adapter_id: Type.String({ minLength: 1 }),
    adapter_version: Type.String({ minLength: 1 }),
    role: AdapterRole,
    outcome: HonestOutcome,
    artifacts: Type.Array(CandidateArtifact),
    warnings: Type.Array(Type.String({ minLength: 1 })),
    evidence_refs: Type.Array(Type.String({ minLength: 1 }), { uniqueItems: true }),
    started_at: Type.String({ format: 'date-time' }),
    completed_at: Type.String({ format: 'date-time' }),
}, {
    $id: CANDIDATE_BUNDLE_SCHEMA_ID,
    title: 'WDC Candidate Bundle',
    additionalProperties: false,
});
//# sourceMappingURL=candidate-bundle.js.map