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
import { Static } from '@sinclair/typebox';
export declare const FitnessVector: import("@sinclair/typebox").TObject<{
    correctness: import("@sinclair/typebox").TNumber;
    performance: import("@sinclair/typebox").TNumber;
    cost: import("@sinclair/typebox").TNumber;
    compliance: import("@sinclair/typebox").TNumber;
    novelty: import("@sinclair/typebox").TNumber;
    provenance: import("@sinclair/typebox").TNumber;
}>;
export type FitnessVector = Static<typeof FitnessVector>;
export declare function fitnessAverage(v: FitnessVector, weights?: Partial<Record<keyof FitnessVector, number>>): number;
export declare function dominates(a: FitnessVector, b: FitnessVector): boolean;
//# sourceMappingURL=fitnessVector.d.ts.map