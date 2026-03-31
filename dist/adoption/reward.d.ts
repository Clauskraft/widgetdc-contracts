import { Static } from '@sinclair/typebox';
/**
 * RewardVector — 5-dimension reward signal for Q-learning feedback.
 * Wire format: snake_case JSON.
 *
 * Source: WidgeTDC lib/rewardSignals.ts
 * Consumer: RLM Engine routes/rewards.py
 */
/** Reward dimension names */
export declare const RewardDimension: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"quality">, import("@sinclair/typebox").TLiteral<"latency">, import("@sinclair/typebox").TLiteral<"cost">, import("@sinclair/typebox").TLiteral<"satisfaction">, import("@sinclair/typebox").TLiteral<"reliability">]>;
export type RewardDimension = Static<typeof RewardDimension>;
/** 5-dimension reward vector */
export declare const RewardVector: import("@sinclair/typebox").TObject<{
    quality: import("@sinclair/typebox").TNumber;
    latency: import("@sinclair/typebox").TNumber;
    cost: import("@sinclair/typebox").TNumber;
    satisfaction: import("@sinclair/typebox").TNumber;
    reliability: import("@sinclair/typebox").TNumber;
}>;
export type RewardVector = Static<typeof RewardVector>;
/** Reward dimension weights (must sum to 1.0) */
export declare const RewardWeights: import("@sinclair/typebox").TObject<{
    quality: import("@sinclair/typebox").TNumber;
    latency: import("@sinclair/typebox").TNumber;
    cost: import("@sinclair/typebox").TNumber;
    satisfaction: import("@sinclair/typebox").TNumber;
    reliability: import("@sinclair/typebox").TNumber;
}>;
export type RewardWeights = Static<typeof RewardWeights>;
/** Recorded reward entry */
export declare const RewardEntry: import("@sinclair/typebox").TObject<{
    task_id: import("@sinclair/typebox").TString;
    agent_id: import("@sinclair/typebox").TString;
    action: import("@sinclair/typebox").TString;
    vector: import("@sinclair/typebox").TObject<{
        quality: import("@sinclair/typebox").TNumber;
        latency: import("@sinclair/typebox").TNumber;
        cost: import("@sinclair/typebox").TNumber;
        satisfaction: import("@sinclair/typebox").TNumber;
        reliability: import("@sinclair/typebox").TNumber;
    }>;
    composite: import("@sinclair/typebox").TNumber;
    timestamp: import("@sinclair/typebox").TNumber;
}>;
export type RewardEntry = Static<typeof RewardEntry>;
//# sourceMappingURL=reward.d.ts.map