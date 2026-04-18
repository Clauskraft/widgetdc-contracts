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
import { Type } from '@sinclair/typebox';
import { BuilderTrack } from './canvasIntent.js';
export const ConfiguratorRuleStatus = Type.Union([
    Type.Literal('active'),
    Type.Literal('shadow'), // running in parallel for evaluation; never wins
    Type.Literal('disabled'), // decayed out of service
    Type.Literal('proposed'), // InventorProxy proposal awaiting shadow-test graduation
], { $id: 'ConfiguratorRuleStatus' });
export const ConfiguratorRuleMatchKind = Type.Union([
    Type.Literal('regex'), // matches against user_text with a regex
    Type.Literal('length'), // matches on user_text.length thresholds
    Type.Literal('feature'), // matches on CanvasIntent flat features (compliance_tier, sequence_step, prior_track)
    Type.Literal('composite'), // AND of multiple above
    Type.Literal('fallback'), // always matches — last resort
], { $id: 'ConfiguratorRuleMatchKind' });
export const ConfiguratorRule = Type.Object({
    rule_id: Type.String({ description: 'Stable identifier, e.g. "diag-intent" or "fallback".' }),
    track: BuilderTrack,
    match_kind: ConfiguratorRuleMatchKind,
    priority: Type.Integer({ description: 'Top-down evaluation order; lower = checked first.' }),
    weight: Type.Number({ minimum: 0, maximum: 10, description: 'Reward-driven weight; top-performers float up in priority.' }),
    status: ConfiguratorRuleStatus,
    pattern: Type.Optional(Type.String({ description: 'Regex pattern string for match_kind=regex.' })),
    feature_expr: Type.Optional(Type.String({ description: 'Predicate expression for match_kind=feature, e.g. "sequence_step>0 && prior_track!=null".' })),
    description: Type.Optional(Type.String()),
    created_at: Type.String({ format: 'date-time' }),
    updated_at: Type.String({ format: 'date-time' }),
    last_applied_at: Type.Optional(Type.String({ format: 'date-time' })),
    // Provenance — who created this rule (seed / InventorProxy / manual)
    authored_by: Type.Optional(Type.String()),
    bom_version: Type.Literal('2.0'),
}, {
    $id: 'ConfiguratorRule',
    description: 'Graph-persisted :ConfiguratorRule node; read by CanvasIntentConfigurator.resolve(), mutated by CanvasRuleEvolver.',
});
export const CanvasTrackOutcome = Type.Object({
    outcome_id: Type.String({ format: 'uuid' }),
    session_id: Type.String({ format: 'uuid', description: 'FK to :CanvasSession' }),
    matched_rule_ids: Type.Array(Type.String(), { description: 'Ordered list of rules that fired for this resolution.' }),
    winning_rule_id: Type.String({ description: 'The rule that actually determined the track (first match).' }),
    resolved_track: BuilderTrack,
    user_satisfaction: Type.Optional(Type.Number({ minimum: -1, maximum: 1, description: '+1 user kept/exported, 0 neutral/unknown, -1 user abandoned or picked different track.' })),
    artifact_quality_score: Type.Optional(Type.Number({ minimum: 0, maximum: 1, description: 'Auto-computed from :ProductionOrder.variance.quality_score when session closes.' })),
    duration_ms: Type.Optional(Type.Integer({ minimum: 0 })),
    host_origin: Type.Optional(Type.String()),
    created_at: Type.String({ format: 'date-time' }),
    bom_version: Type.Literal('2.0'),
}, {
    $id: 'CanvasTrackOutcome',
    description: 'Per-resolution reward event; feeds ClosedLoopAggregator into :RulePrior.',
});
export const RulePrior = Type.Object({
    rule_id: Type.String(),
    window_days: Type.Integer({ minimum: 1 }),
    episode_count: Type.Integer({ minimum: 0 }),
    reward_avg: Type.Number({ minimum: -1, maximum: 1 }),
    quality_avg: Type.Number({ minimum: 0, maximum: 1 }),
    weight_delta: Type.Number({ description: 'Proposed weight adjustment (applied after shadow-test).' }),
    computed_at: Type.String({ format: 'date-time' }),
    bom_version: Type.Literal('2.0'),
}, {
    $id: 'RulePrior',
    description: 'Aggregated 7-day rule performance prior; written by weekly canvas-rule-priors cron (UC3).',
});
export const RuleMutationProposal = Type.Object({
    proposal_id: Type.String({ format: 'uuid' }),
    proposed_rule: ConfiguratorRule,
    rationale: Type.String({ description: 'Why InventorProxy thinks this rule improves coverage.' }),
    shadow_test_episode_count: Type.Integer({ minimum: 0 }),
    shadow_test_reward_avg: Type.Number({ minimum: -1, maximum: 1 }),
    baseline_reward_avg: Type.Number({ minimum: -1, maximum: 1, description: 'Reward average of the rule this would replace/augment.' }),
    graduation_status: Type.Union([
        Type.Literal('pending'),
        Type.Literal('graduated'), // merged into active rule table
        Type.Literal('rejected'), // failed shadow-test improvement gate
    ]),
    graduation_threshold: Type.Number({ default: 0.05, description: 'Minimum reward_avg uplift required to graduate.' }),
    proposed_at: Type.String({ format: 'date-time' }),
    graduated_at: Type.Optional(Type.String({ format: 'date-time' })),
    bom_version: Type.Literal('2.0'),
}, {
    $id: 'RuleMutationProposal',
    description: 'Candidate rule from CanvasRuleEvolver.runInventor(); graduates only if shadow-test beats baseline by graduation_threshold.',
});
//# sourceMappingURL=canvasRule.js.map