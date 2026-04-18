/**
 * Canvas configurator rules — graph-persisted, evolutionary.
 *
 * Unlike ConfiguratorEngine (which has hard-coded TS rules), the canvas
 * configurator loads rules from :ConfiguratorRule graph nodes ordered by
 * weight.  CanvasRuleEvolver (UC8) mutates the rule table monthly via
 * InventorProxy + ClosedLoopAggregator rewards.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const ConfiguratorRuleStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"shadow">, import("@sinclair/typebox").TLiteral<"disabled">, import("@sinclair/typebox").TLiteral<"proposed">]>;
export type ConfiguratorRuleStatus = Static<typeof ConfiguratorRuleStatus>;
export declare const ConfiguratorRuleMatchKind: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"regex">, import("@sinclair/typebox").TLiteral<"length">, import("@sinclair/typebox").TLiteral<"feature">, import("@sinclair/typebox").TLiteral<"composite">, import("@sinclair/typebox").TLiteral<"fallback">]>;
export type ConfiguratorRuleMatchKind = Static<typeof ConfiguratorRuleMatchKind>;
export declare const ConfiguratorRule: import("@sinclair/typebox").TObject<{
    rule_id: import("@sinclair/typebox").TString;
    track: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"textual">, import("@sinclair/typebox").TLiteral<"slide_flow">, import("@sinclair/typebox").TLiteral<"diagram">, import("@sinclair/typebox").TLiteral<"architecture">, import("@sinclair/typebox").TLiteral<"graphical">, import("@sinclair/typebox").TLiteral<"code">, import("@sinclair/typebox").TLiteral<"experiment">]>;
    match_kind: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"regex">, import("@sinclair/typebox").TLiteral<"length">, import("@sinclair/typebox").TLiteral<"feature">, import("@sinclair/typebox").TLiteral<"composite">, import("@sinclair/typebox").TLiteral<"fallback">]>;
    priority: import("@sinclair/typebox").TInteger;
    weight: import("@sinclair/typebox").TNumber;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"shadow">, import("@sinclair/typebox").TLiteral<"disabled">, import("@sinclair/typebox").TLiteral<"proposed">]>;
    pattern: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    feature_expr: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    created_at: import("@sinclair/typebox").TString;
    updated_at: import("@sinclair/typebox").TString;
    last_applied_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    authored_by: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
}>;
export type ConfiguratorRule = Static<typeof ConfiguratorRule>;
export declare const CanvasTrackOutcome: import("@sinclair/typebox").TObject<{
    outcome_id: import("@sinclair/typebox").TString;
    session_id: import("@sinclair/typebox").TString;
    matched_rule_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    winning_rule_id: import("@sinclair/typebox").TString;
    resolved_track: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"textual">, import("@sinclair/typebox").TLiteral<"slide_flow">, import("@sinclair/typebox").TLiteral<"diagram">, import("@sinclair/typebox").TLiteral<"architecture">, import("@sinclair/typebox").TLiteral<"graphical">, import("@sinclair/typebox").TLiteral<"code">, import("@sinclair/typebox").TLiteral<"experiment">]>;
    user_satisfaction: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    artifact_quality_score: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    duration_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    host_origin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    created_at: import("@sinclair/typebox").TString;
    bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
}>;
export type CanvasTrackOutcome = Static<typeof CanvasTrackOutcome>;
export declare const RulePrior: import("@sinclair/typebox").TObject<{
    rule_id: import("@sinclair/typebox").TString;
    window_days: import("@sinclair/typebox").TInteger;
    episode_count: import("@sinclair/typebox").TInteger;
    reward_avg: import("@sinclair/typebox").TNumber;
    quality_avg: import("@sinclair/typebox").TNumber;
    weight_delta: import("@sinclair/typebox").TNumber;
    computed_at: import("@sinclair/typebox").TString;
    bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
}>;
export type RulePrior = Static<typeof RulePrior>;
export declare const RuleMutationProposal: import("@sinclair/typebox").TObject<{
    proposal_id: import("@sinclair/typebox").TString;
    proposed_rule: import("@sinclair/typebox").TObject<{
        rule_id: import("@sinclair/typebox").TString;
        track: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"textual">, import("@sinclair/typebox").TLiteral<"slide_flow">, import("@sinclair/typebox").TLiteral<"diagram">, import("@sinclair/typebox").TLiteral<"architecture">, import("@sinclair/typebox").TLiteral<"graphical">, import("@sinclair/typebox").TLiteral<"code">, import("@sinclair/typebox").TLiteral<"experiment">]>;
        match_kind: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"regex">, import("@sinclair/typebox").TLiteral<"length">, import("@sinclair/typebox").TLiteral<"feature">, import("@sinclair/typebox").TLiteral<"composite">, import("@sinclair/typebox").TLiteral<"fallback">]>;
        priority: import("@sinclair/typebox").TInteger;
        weight: import("@sinclair/typebox").TNumber;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"shadow">, import("@sinclair/typebox").TLiteral<"disabled">, import("@sinclair/typebox").TLiteral<"proposed">]>;
        pattern: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        feature_expr: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        created_at: import("@sinclair/typebox").TString;
        updated_at: import("@sinclair/typebox").TString;
        last_applied_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        authored_by: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
    }>;
    rationale: import("@sinclair/typebox").TString;
    shadow_test_episode_count: import("@sinclair/typebox").TInteger;
    shadow_test_reward_avg: import("@sinclair/typebox").TNumber;
    baseline_reward_avg: import("@sinclair/typebox").TNumber;
    graduation_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"graduated">, import("@sinclair/typebox").TLiteral<"rejected">]>;
    graduation_threshold: import("@sinclair/typebox").TNumber;
    proposed_at: import("@sinclair/typebox").TString;
    graduated_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
}>;
export type RuleMutationProposal = Static<typeof RuleMutationProposal>;
//# sourceMappingURL=canvasRule.d.ts.map