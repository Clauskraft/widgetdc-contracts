import { Type } from '@sinclair/typebox';
import { AgentPersona } from '../agent/enums.js';
import { OrchestratorTaskDomain, ScopeOwner, TrustEvidenceSource, } from './agent-trust-profile.js';
export const TelemetryPhase = Type.Union([
    Type.Literal('discover'),
    Type.Literal('define'),
    Type.Literal('develop'),
    Type.Literal('deliver'),
    Type.Literal('observe'),
    Type.Literal('orient'),
    Type.Literal('decide'),
    Type.Literal('act'),
], {
    $id: 'TelemetryPhase',
    description: 'Canonical workflow or OODA phase associated with a telemetry sample.',
});
export const TelemetryOutcome = Type.Union([
    Type.Literal('success'),
    Type.Literal('warning'),
    Type.Literal('timeout'),
    Type.Literal('fail'),
    Type.Literal('blocked'),
], {
    $id: 'TelemetryOutcome',
    description: 'Normalized runtime outcome for telemetry ingestion.',
});
export const TelemetryEntry = Type.Object({
    telemetry_id: Type.Optional(Type.String({
        minLength: 1,
        description: 'Stable telemetry identifier when available.',
    })),
    timestamp: Type.String({
        format: 'date-time',
        description: 'Runtime timestamp for the event.',
    }),
    scope_owner: ScopeOwner,
    agent_persona: AgentPersona,
    runtime_identity: Type.Optional(Type.String({
        minLength: 1,
        description: 'Concrete runtime worker/session identity.',
    })),
    provider_source: Type.Optional(Type.String({
        minLength: 1,
        description: 'Observed provider for correlation only.',
    })),
    task_domain: OrchestratorTaskDomain,
    capability: Type.Optional(Type.String({
        minLength: 1,
        description: 'Capability or workflow label associated with the event.',
    })),
    phase: TelemetryPhase,
    outcome: TelemetryOutcome,
    duration_ms: Type.Integer({
        minimum: 0,
        description: 'Observed duration in milliseconds.',
    }),
    evidence_source: TrustEvidenceSource,
    trace_id: Type.Optional(Type.String({
        minLength: 1,
        description: 'Trace or checkpoint identifier for read-back correlation.',
    })),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Union([Type.String(), Type.Number(), Type.Boolean(), Type.Null()]), {
        description: 'Small scalar metadata only. Raw payloads and provider transcripts are out of scope.',
    })),
}, {
    $id: 'TelemetryEntry',
    description: 'Normalized telemetry sample for orchestrator trust and scorecard ingestion. It aligns telemetry with persona-based trust instead of provider identity.',
});
//# sourceMappingURL=telemetry-entry.js.map