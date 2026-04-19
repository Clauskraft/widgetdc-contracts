/**
 * FitnessVector — canonical 6-dimension composition fitness signal.
 *
 * Each dimension is normalized to [0,1] where:
 * - correctness: factual and semantic alignment quality
 * - performance: runtime and execution characteristics
 * - cost: budget efficiency and resource usage
 * - compliance: safety/governance compliance fit
 * - novelty: innovation/uniqueness of approach
 * - provenance: source and evidence traceability quality
 */
import { Type } from '@sinclair/typebox';
const FitnessDimension = Type.Number({
    minimum: 0,
    maximum: 1,
    description: 'Normalized score in [0,1]',
});
export const FitnessVector = Type.Object({
    correctness: FitnessDimension,
    performance: FitnessDimension,
    cost: FitnessDimension,
    compliance: FitnessDimension,
    novelty: FitnessDimension,
    provenance: FitnessDimension,
}, {
    additionalProperties: false,
    $id: 'FitnessVector',
    description: 'Six-axis normalized fitness vector used by composition scoring.',
});
export function fitnessAverage(v, weights) {
    const keys = Object.keys(v);
    const w = keys.map((k) => weights?.[k] ?? 1);
    const sum = keys.reduce((acc, k, i) => acc + v[k] * w[i], 0);
    const norm = w.reduce((acc, x) => acc + x, 0);
    return norm === 0 ? 0 : sum / norm;
}
export function dominates(a, b) {
    const keys = Object.keys(a);
    const weaklyBetter = keys.every((k) => a[k] >= b[k]);
    const strictlyBetter = keys.some((k) => a[k] > b[k]);
    return weaklyBetter && strictlyBetter;
}
//# sourceMappingURL=fitnessVector.js.map