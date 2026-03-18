import { Type } from '@sinclair/typebox';
import { AgentPersona } from '../agent/enums.js';
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
export const ScorecardDimension = Type.Union([
    Type.Literal('prioritization_quality'),
    Type.Literal('decomposition_quality'),
    Type.Literal('promotion_precision'),
    Type.Literal('decision_stability'),
    Type.Literal('operator_acceptance'),
    Type.Literal('normalization_quality'),
    Type.Literal('arbitration_confidence'),
    Type.Literal('time_to_verified_decision'),
    Type.Literal('tri_source_arbitration_divergence'),
], {
    $id: 'ScorecardDimension',
    description: 'Canonical decision-quality dimensions approved for trust mapping and scorecard entries.',
});
export const ScopeOwner = Type.Union([
    Type.Literal('widgetdc-orchestrator'),
    Type.Literal('widgetdc-librechat'),
    Type.Literal('snout'),
], {
    $id: 'ScopeOwner',
    description: 'Approved runtime owner or consumer scope for routing and trust contracts.',
});
export const AgentTrustProfile = Type.Object({
    agent_persona: AgentPersona,
    agent_id: Type.Optional(Type.Union([AgentId, Type.String()], {
        description: 'Legacy chat/runtime agent identifier. Optional because trust is anchored on persona, not provider.',
    })),
    runtime_identity: Type.Optional(Type.String({
        minLength: 1,
        description: 'Scoped runtime identity for a concrete worker, session, or delegated specialist.',
    })),
    provider_source: Type.Optional(Type.String({
        minLength: 1,
        description: 'Observed provider source for telemetry correlation only. Must not be used as the trust identity.',
    })),
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
    scorecard_dimension: ScorecardDimension,
    scope_owner: ScopeOwner,
    last_verified_at: Type.String({
        format: 'date-time',
        description: 'Latest runtime verification timestamp for this trust profile.',
    }),
}, {
    $id: 'AgentTrustProfile',
    description: 'Minimal orchestrator trust profile. Persona is the primary identity; provider identifiers are telemetry-only correlation metadata.',
});
//# sourceMappingURL=agent-trust-profile.js.map