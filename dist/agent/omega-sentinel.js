/**
 * omega-sentinel.ts — Canonical Omega Sentinel contracts (LIN-581 SNOUT-3).
 *
 * Single source of truth for Omega Sentinel types.
 * Imported by both backend (OmegaSentinelService) and orchestrator (agent-seeds, tools).
 *
 * Wire format: snake_case JSON with $id (WidgeTDC convention).
 */
import { Type } from '@sinclair/typebox';
// ─── Core Enums ─────────────────────────────────────────────────────────────
export const ThreatLevel = Type.Union([
    Type.Literal('P0'),
    Type.Literal('P1'),
    Type.Literal('P2'),
    Type.Literal('P3'),
    Type.Literal('GREEN'),
], { $id: 'ThreatLevel', description: 'Omega Sentinel threat severity level' });
export const SubAgentId = Type.Union([
    Type.Literal('CLAUSE'),
    Type.Literal('SIGNAL'),
    Type.Literal('ARGUS'),
    Type.Literal('NEXUS'),
    Type.Literal('FISCAL'),
    Type.Literal('PIPELINE'),
    Type.Literal('SYNAPSE'),
    Type.Literal('ENGRAM'),
    Type.Literal('AEGIS'),
    Type.Literal('CLAW'),
], { $id: 'SubAgentId', description: 'Omega Sentinel sub-agent identifier' });
export const CircuitState = Type.Union([
    Type.Literal('CLOSED'),
    Type.Literal('OPEN'),
    Type.Literal('HALF_OPEN'),
], { $id: 'CircuitState', description: 'Circuit breaker state' });
export const PheromoneType = Type.Union([
    Type.Literal('INTEL'),
    Type.Literal('ALERT'),
    Type.Literal('STATUS'),
    Type.Literal('REQUEST'),
], { $id: 'PheromoneType', description: 'Pheromone signal type for stigmergic communication' });
// ─── Pheromone Signal ───────────────────────────────────────────────────────
export const PheromoneSignal = Type.Object({
    id: Type.String(),
    agent_id: Type.Union([SubAgentId, Type.Literal('OMEGA')]),
    type: PheromoneType,
    domain: Type.String(),
    content: Type.String(),
    intensity: Type.Number({ minimum: 0, maximum: 1 }),
    ttl_hours: Type.Number(),
    deposited_at: Type.String({ format: 'date-time' }),
}, { $id: 'PheromoneSignal', description: 'Stigmergic signal on the Omega blackboard' });
// ─── Architecture Event ─────────────────────────────────────────────────────
export const ArchitectureEvent = Type.Object({
    id: Type.String(),
    type: Type.String(),
    severity: ThreatLevel,
    source: Type.Union([SubAgentId, Type.Literal('OMEGA')]),
    message: Type.String(),
    data: Type.Record(Type.String(), Type.Unknown()),
    timestamp: Type.String({ format: 'date-time' }),
}, { $id: 'ArchitectureEvent', description: 'Omega Sentinel architecture event' });
// ─── Compliance Result ──────────────────────────────────────────────────────
export const ComplianceViolation = Type.Object({
    rule: Type.String(),
    entity: Type.String(),
    message: Type.String(),
    severity: ThreatLevel,
    auto_fixable: Type.Boolean(),
});
export const ComplianceResult = Type.Object({
    compliant: Type.Boolean(),
    violations: Type.Array(ComplianceViolation),
    checked_at: Type.String({ format: 'date-time' }),
    rules_checked: Type.Number(),
}, { $id: 'ComplianceResult', description: 'Omega compliance check result' });
// ─── SITREP ─────────────────────────────────────────────────────────────────
export const SubAgentStatus = Type.Object({
    agent_id: SubAgentId,
    name: Type.String(),
    domain: Type.String(),
    circuit_state: CircuitState,
    last_success: Type.Optional(Type.String({ format: 'date-time' })),
    failure_count: Type.Number(),
});
export const OmegaSitrep = Type.Object({
    threat_level: ThreatLevel,
    sub_agents: Type.Array(SubAgentStatus),
    active_alarms: Type.Number(),
    pheromone_board: Type.Array(PheromoneSignal),
    compliance_status: Type.Optional(ComplianceResult),
    generated_at: Type.String({ format: 'date-time' }),
}, { $id: 'OmegaSitrep', description: 'Full Omega Sentinel situation report' });
// ─── Consensus Request ──────────────────────────────────────────────────────
export const OmegaConsensusVote = Type.Object({
    agent_id: SubAgentId,
    vote: Type.Union([Type.Literal('APPROVE'), Type.Literal('REJECT'), Type.Literal('ABSTAIN')]),
    reason: Type.String(),
});
export const OmegaConsensusRequest = Type.Object({
    proposal: Type.String(),
    required_agents: Type.Array(SubAgentId),
    threshold: Type.Number({ minimum: 0, maximum: 1, description: 'Required approval ratio' }),
    votes: Type.Array(OmegaConsensusVote),
    result: Type.Optional(Type.Union([Type.Literal('APPROVED'), Type.Literal('REJECTED'), Type.Literal('PENDING')])),
}, { $id: 'OmegaConsensusRequest', description: 'Omega swarm consensus request' });
//# sourceMappingURL=omega-sentinel.js.map