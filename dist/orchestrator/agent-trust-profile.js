import { Type } from '@sinclair/typebox';
import { AgentId } from './agent-message.js';
export const OrchestratorTaskDomain = Type.Union([
    Type.Literal('intake'),
    Type.Literal('decomposition'),
    Type.Literal('recommendation'),
    Type.Literal('learning'),
    Type.Literal('routing'),
    Type.Literal('audit'),
], {
    $id: 'OrchestratorTaskDomain',
    description: 'Narrow task domains used by the orchestrator trust model and scorecard mapping.',
});
export const TrustEvidenceSource = Type.Union([
    Type.Literal('decision_quality_scorecard'),
    Type.Literal('monitoring_audit_log'),
    Type.Literal('operator_feedback'),
    Type.Literal('runtime_readback'),
], {
    $id: 'TrustEvidenceSource',
    description: 'Canonical evidence sources allowed to influence routing trust.',
});
export const AgentTrustProfile = Type.Object({
    agent_id: Type.Union([AgentId, Type.String()], {
        description: 'Canonical agent identifier or scoped runtime agent ID.',
    }),
    task_domain: OrchestratorTaskDomain,
    success_count: Type.Integer({
        minimum: 0,
        description: 'Verified successful outcomes in this domain.',
    }),
    fail_count: Type.Integer({
        minimum: 0,
        description: 'Verified failed outcomes in this domain.',
    }),
    bayesian_score: Type.Number({
        minimum: 0,
        maximum: 1,
        description: 'Bayesian trust score derived from verified runtime evidence.',
    }),
    prior_weight: Type.Number({
        minimum: 0,
        description: 'Weight of the prior used for Bayesian smoothing.',
    }),
    default_prior_score: Type.Number({
        minimum: 0,
        maximum: 1,
        description: 'Configured prior score before domain-specific evidence accumulates.',
    }),
    evidence_source: TrustEvidenceSource,
    scorecard_dimension: Type.Union([
        Type.Literal('prioritization_quality'),
        Type.Literal('decomposition_quality'),
        Type.Literal('promotion_precision'),
        Type.Literal('decision_stability'),
        Type.Literal('operator_acceptance'),
    ], {
        description: 'Primary scorecard dimension this trust profile is intended to improve.',
    }),
    scope_owner: Type.Union([
        Type.Literal('widgetdc-orchestrator'),
        Type.Literal('widgetdc-librechat'),
        Type.Literal('snout'),
    ], {
        description: 'Approved runtime owner/consumer scope for this trust profile.',
    }),
    last_verified_at: Type.String({
        format: 'date-time',
        description: 'Latest runtime verification timestamp for this trust profile.',
    }),
}, {
    $id: 'AgentTrustProfile',
    description: 'Minimal orchestrator trust profile. Used only by widgetdc-orchestrator, widgetdc-librechat, and optional Snout routing support.',
});
//# sourceMappingURL=agent-trust-profile.js.map