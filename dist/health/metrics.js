import { Type } from '@sinclair/typebox';
/** CIA 3-tier risk severity classification */
export const RiskSeverity = Type.Union([
    Type.Literal('CRITICAL'),
    Type.Literal('WARNING'),
    Type.Literal('INFO'),
    Type.Literal('OPTIMAL'),
], { $id: 'RiskSeverity', description: 'CIA 3-tier risk severity classification' });
/** CIA Health Metrics for consulting domains and intelligence assets */
export const HealthMetrics = Type.Object({
    score: Type.Number({ minimum: 0, maximum: 100, description: 'Aggregated health score (0-100)' }),
    trend: Type.Union([
        Type.Literal('up'),
        Type.Literal('down'),
        Type.Literal('stable'),
    ], { description: 'Directional health trend' }),
    momentum: Type.Number({ description: 'Rate of change per day' }),
    resilience: Type.Number({ description: 'Ability to recover from health dips' }),
    severity: RiskSeverity,
    last_assessment: Type.String({ format: 'date-time', description: 'ISO-8601 timestamp of last analysis' }),
}, { $id: 'HealthMetrics', description: 'CIA Health Metrics for consulting domains and intelligence assets' });
//# sourceMappingURL=metrics.js.map