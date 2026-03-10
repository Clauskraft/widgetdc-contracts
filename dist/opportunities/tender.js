import { Type } from '@sinclair/typebox';
/** Generic Salience Vector for scoring any type of opportunity */
export const SalienceVector = Type.Object({
    dimension: Type.String({ description: 'e.g., DomainMatch, ResourceAvailability' }),
    raw_value: Type.Number({ minimum: 0, maximum: 1, description: 'Raw calculated value' }),
    weight: Type.Number({ minimum: 0, description: 'Importance multiplier for this use-case' }),
    score: Type.Number({ description: 'raw_value * weight' }),
}, { $id: 'SalienceVector', description: 'Generic weighted score component based on CIA methodology' });
/** The aggregate intelligence score for an opportunity */
export const WinProbabilityScore = Type.Object({
    overall_score: Type.Number({ minimum: 0, maximum: 100, description: 'Final aggregated 0-100 win probability' }),
    confidence: Type.Number({ minimum: 0, maximum: 1, description: 'Statistical confidence in the prediction' }),
    vectors: Type.Array(SalienceVector, { description: 'The individual factors making up the score' }),
    is_go: Type.Boolean({ description: 'True if overall_score > threshold' }),
    assessed_at: Type.String({ format: 'date-time' })
}, { $id: 'WinProbabilityScore', description: 'Aggregated intelligence assessment' });
/** Generic Intelligence Observation for any monitored domain */
export const IntelligenceObservation = Type.Object({
    observation_id: Type.String({ description: 'Unique identifier (hash or source ID)' }),
    source_type: Type.Union([
        Type.Literal('MEDIA'),
        Type.Literal('CODE_REPO'),
        Type.Literal('FINANCIAL'),
        Type.Literal('GOVERNMENT_DATA'),
        Type.Literal('LEGAL_TENDER'),
        Type.Literal('CYBER_SIGNAL')
    ]),
    title: Type.String(),
    content_summary: Type.String(),
    actor_name: Type.String({ description: 'e.g. Agency name or Vendor name' }),
    metadata: Type.Record(Type.String(), Type.Any(), { description: 'Dynamic fields like budget, github_stars, or CVE_id' }),
    timestamp: Type.String({ format: 'date-time' }),
    source_url: Type.Optional(Type.String()),
    intelligence_score: Type.Optional(WinProbabilityScore)
}, { $id: 'IntelligenceObservation', description: 'A generic unit of intelligence extracted from any source' });
//# sourceMappingURL=tender.js.map