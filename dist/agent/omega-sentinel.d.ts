/**
 * omega-sentinel.ts — Canonical Omega Sentinel contracts (LIN-581 SNOUT-3).
 *
 * Single source of truth for Omega Sentinel types.
 * Imported by both backend (OmegaSentinelService) and orchestrator (agent-seeds, tools).
 *
 * Wire format: snake_case JSON with $id (WidgeTDC convention).
 */
import { type Static } from '@sinclair/typebox';
export declare const ThreatLevel: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"P0">, import("@sinclair/typebox").TLiteral<"P1">, import("@sinclair/typebox").TLiteral<"P2">, import("@sinclair/typebox").TLiteral<"P3">, import("@sinclair/typebox").TLiteral<"GREEN">]>;
export type ThreatLevel = Static<typeof ThreatLevel>;
export declare const SubAgentId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CLAUSE">, import("@sinclair/typebox").TLiteral<"SIGNAL">, import("@sinclair/typebox").TLiteral<"ARGUS">, import("@sinclair/typebox").TLiteral<"NEXUS">, import("@sinclair/typebox").TLiteral<"FISCAL">, import("@sinclair/typebox").TLiteral<"PIPELINE">, import("@sinclair/typebox").TLiteral<"SYNAPSE">, import("@sinclair/typebox").TLiteral<"ENGRAM">, import("@sinclair/typebox").TLiteral<"AEGIS">, import("@sinclair/typebox").TLiteral<"CLAW">]>;
export type SubAgentId = Static<typeof SubAgentId>;
export declare const CircuitState: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CLOSED">, import("@sinclair/typebox").TLiteral<"OPEN">, import("@sinclair/typebox").TLiteral<"HALF_OPEN">]>;
export type CircuitState = Static<typeof CircuitState>;
export declare const PheromoneType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"INTEL">, import("@sinclair/typebox").TLiteral<"ALERT">, import("@sinclair/typebox").TLiteral<"STATUS">, import("@sinclair/typebox").TLiteral<"REQUEST">]>;
export type PheromoneType = Static<typeof PheromoneType>;
export declare const PheromoneSignal: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    agent_id: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CLAUSE">, import("@sinclair/typebox").TLiteral<"SIGNAL">, import("@sinclair/typebox").TLiteral<"ARGUS">, import("@sinclair/typebox").TLiteral<"NEXUS">, import("@sinclair/typebox").TLiteral<"FISCAL">, import("@sinclair/typebox").TLiteral<"PIPELINE">, import("@sinclair/typebox").TLiteral<"SYNAPSE">, import("@sinclair/typebox").TLiteral<"ENGRAM">, import("@sinclair/typebox").TLiteral<"AEGIS">, import("@sinclair/typebox").TLiteral<"CLAW">]>, import("@sinclair/typebox").TLiteral<"OMEGA">]>;
    type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"INTEL">, import("@sinclair/typebox").TLiteral<"ALERT">, import("@sinclair/typebox").TLiteral<"STATUS">, import("@sinclair/typebox").TLiteral<"REQUEST">]>;
    domain: import("@sinclair/typebox").TString;
    content: import("@sinclair/typebox").TString;
    intensity: import("@sinclair/typebox").TNumber;
    ttl_hours: import("@sinclair/typebox").TNumber;
    deposited_at: import("@sinclair/typebox").TString;
}>;
export type PheromoneSignal = Static<typeof PheromoneSignal>;
export declare const ArchitectureEvent: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    type: import("@sinclair/typebox").TString;
    severity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"P0">, import("@sinclair/typebox").TLiteral<"P1">, import("@sinclair/typebox").TLiteral<"P2">, import("@sinclair/typebox").TLiteral<"P3">, import("@sinclair/typebox").TLiteral<"GREEN">]>;
    source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CLAUSE">, import("@sinclair/typebox").TLiteral<"SIGNAL">, import("@sinclair/typebox").TLiteral<"ARGUS">, import("@sinclair/typebox").TLiteral<"NEXUS">, import("@sinclair/typebox").TLiteral<"FISCAL">, import("@sinclair/typebox").TLiteral<"PIPELINE">, import("@sinclair/typebox").TLiteral<"SYNAPSE">, import("@sinclair/typebox").TLiteral<"ENGRAM">, import("@sinclair/typebox").TLiteral<"AEGIS">, import("@sinclair/typebox").TLiteral<"CLAW">]>, import("@sinclair/typebox").TLiteral<"OMEGA">]>;
    message: import("@sinclair/typebox").TString;
    data: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
    timestamp: import("@sinclair/typebox").TString;
}>;
export type ArchitectureEvent = Static<typeof ArchitectureEvent>;
export declare const ComplianceViolation: import("@sinclair/typebox").TObject<{
    rule: import("@sinclair/typebox").TString;
    entity: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    severity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"P0">, import("@sinclair/typebox").TLiteral<"P1">, import("@sinclair/typebox").TLiteral<"P2">, import("@sinclair/typebox").TLiteral<"P3">, import("@sinclair/typebox").TLiteral<"GREEN">]>;
    auto_fixable: import("@sinclair/typebox").TBoolean;
}>;
export declare const ComplianceResult: import("@sinclair/typebox").TObject<{
    compliant: import("@sinclair/typebox").TBoolean;
    violations: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        rule: import("@sinclair/typebox").TString;
        entity: import("@sinclair/typebox").TString;
        message: import("@sinclair/typebox").TString;
        severity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"P0">, import("@sinclair/typebox").TLiteral<"P1">, import("@sinclair/typebox").TLiteral<"P2">, import("@sinclair/typebox").TLiteral<"P3">, import("@sinclair/typebox").TLiteral<"GREEN">]>;
        auto_fixable: import("@sinclair/typebox").TBoolean;
    }>>;
    checked_at: import("@sinclair/typebox").TString;
    rules_checked: import("@sinclair/typebox").TNumber;
}>;
export type ComplianceResult = Static<typeof ComplianceResult>;
export declare const SubAgentStatus: import("@sinclair/typebox").TObject<{
    agent_id: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CLAUSE">, import("@sinclair/typebox").TLiteral<"SIGNAL">, import("@sinclair/typebox").TLiteral<"ARGUS">, import("@sinclair/typebox").TLiteral<"NEXUS">, import("@sinclair/typebox").TLiteral<"FISCAL">, import("@sinclair/typebox").TLiteral<"PIPELINE">, import("@sinclair/typebox").TLiteral<"SYNAPSE">, import("@sinclair/typebox").TLiteral<"ENGRAM">, import("@sinclair/typebox").TLiteral<"AEGIS">, import("@sinclair/typebox").TLiteral<"CLAW">]>;
    name: import("@sinclair/typebox").TString;
    domain: import("@sinclair/typebox").TString;
    circuit_state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CLOSED">, import("@sinclair/typebox").TLiteral<"OPEN">, import("@sinclair/typebox").TLiteral<"HALF_OPEN">]>;
    last_success: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    failure_count: import("@sinclair/typebox").TNumber;
}>;
export declare const OmegaSitrep: import("@sinclair/typebox").TObject<{
    threat_level: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"P0">, import("@sinclair/typebox").TLiteral<"P1">, import("@sinclair/typebox").TLiteral<"P2">, import("@sinclair/typebox").TLiteral<"P3">, import("@sinclair/typebox").TLiteral<"GREEN">]>;
    sub_agents: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        agent_id: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CLAUSE">, import("@sinclair/typebox").TLiteral<"SIGNAL">, import("@sinclair/typebox").TLiteral<"ARGUS">, import("@sinclair/typebox").TLiteral<"NEXUS">, import("@sinclair/typebox").TLiteral<"FISCAL">, import("@sinclair/typebox").TLiteral<"PIPELINE">, import("@sinclair/typebox").TLiteral<"SYNAPSE">, import("@sinclair/typebox").TLiteral<"ENGRAM">, import("@sinclair/typebox").TLiteral<"AEGIS">, import("@sinclair/typebox").TLiteral<"CLAW">]>;
        name: import("@sinclair/typebox").TString;
        domain: import("@sinclair/typebox").TString;
        circuit_state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CLOSED">, import("@sinclair/typebox").TLiteral<"OPEN">, import("@sinclair/typebox").TLiteral<"HALF_OPEN">]>;
        last_success: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        failure_count: import("@sinclair/typebox").TNumber;
    }>>;
    active_alarms: import("@sinclair/typebox").TNumber;
    pheromone_board: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        agent_id: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CLAUSE">, import("@sinclair/typebox").TLiteral<"SIGNAL">, import("@sinclair/typebox").TLiteral<"ARGUS">, import("@sinclair/typebox").TLiteral<"NEXUS">, import("@sinclair/typebox").TLiteral<"FISCAL">, import("@sinclair/typebox").TLiteral<"PIPELINE">, import("@sinclair/typebox").TLiteral<"SYNAPSE">, import("@sinclair/typebox").TLiteral<"ENGRAM">, import("@sinclair/typebox").TLiteral<"AEGIS">, import("@sinclair/typebox").TLiteral<"CLAW">]>, import("@sinclair/typebox").TLiteral<"OMEGA">]>;
        type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"INTEL">, import("@sinclair/typebox").TLiteral<"ALERT">, import("@sinclair/typebox").TLiteral<"STATUS">, import("@sinclair/typebox").TLiteral<"REQUEST">]>;
        domain: import("@sinclair/typebox").TString;
        content: import("@sinclair/typebox").TString;
        intensity: import("@sinclair/typebox").TNumber;
        ttl_hours: import("@sinclair/typebox").TNumber;
        deposited_at: import("@sinclair/typebox").TString;
    }>>;
    compliance_status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        compliant: import("@sinclair/typebox").TBoolean;
        violations: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            rule: import("@sinclair/typebox").TString;
            entity: import("@sinclair/typebox").TString;
            message: import("@sinclair/typebox").TString;
            severity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"P0">, import("@sinclair/typebox").TLiteral<"P1">, import("@sinclair/typebox").TLiteral<"P2">, import("@sinclair/typebox").TLiteral<"P3">, import("@sinclair/typebox").TLiteral<"GREEN">]>;
            auto_fixable: import("@sinclair/typebox").TBoolean;
        }>>;
        checked_at: import("@sinclair/typebox").TString;
        rules_checked: import("@sinclair/typebox").TNumber;
    }>>;
    generated_at: import("@sinclair/typebox").TString;
}>;
export type OmegaSitrep = Static<typeof OmegaSitrep>;
export declare const OmegaConsensusVote: import("@sinclair/typebox").TObject<{
    agent_id: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CLAUSE">, import("@sinclair/typebox").TLiteral<"SIGNAL">, import("@sinclair/typebox").TLiteral<"ARGUS">, import("@sinclair/typebox").TLiteral<"NEXUS">, import("@sinclair/typebox").TLiteral<"FISCAL">, import("@sinclair/typebox").TLiteral<"PIPELINE">, import("@sinclair/typebox").TLiteral<"SYNAPSE">, import("@sinclair/typebox").TLiteral<"ENGRAM">, import("@sinclair/typebox").TLiteral<"AEGIS">, import("@sinclair/typebox").TLiteral<"CLAW">]>;
    vote: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"APPROVE">, import("@sinclair/typebox").TLiteral<"REJECT">, import("@sinclair/typebox").TLiteral<"ABSTAIN">]>;
    reason: import("@sinclair/typebox").TString;
}>;
export declare const OmegaConsensusRequest: import("@sinclair/typebox").TObject<{
    proposal: import("@sinclair/typebox").TString;
    required_agents: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CLAUSE">, import("@sinclair/typebox").TLiteral<"SIGNAL">, import("@sinclair/typebox").TLiteral<"ARGUS">, import("@sinclair/typebox").TLiteral<"NEXUS">, import("@sinclair/typebox").TLiteral<"FISCAL">, import("@sinclair/typebox").TLiteral<"PIPELINE">, import("@sinclair/typebox").TLiteral<"SYNAPSE">, import("@sinclair/typebox").TLiteral<"ENGRAM">, import("@sinclair/typebox").TLiteral<"AEGIS">, import("@sinclair/typebox").TLiteral<"CLAW">]>>;
    threshold: import("@sinclair/typebox").TNumber;
    votes: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        agent_id: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CLAUSE">, import("@sinclair/typebox").TLiteral<"SIGNAL">, import("@sinclair/typebox").TLiteral<"ARGUS">, import("@sinclair/typebox").TLiteral<"NEXUS">, import("@sinclair/typebox").TLiteral<"FISCAL">, import("@sinclair/typebox").TLiteral<"PIPELINE">, import("@sinclair/typebox").TLiteral<"SYNAPSE">, import("@sinclair/typebox").TLiteral<"ENGRAM">, import("@sinclair/typebox").TLiteral<"AEGIS">, import("@sinclair/typebox").TLiteral<"CLAW">]>;
        vote: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"APPROVE">, import("@sinclair/typebox").TLiteral<"REJECT">, import("@sinclair/typebox").TLiteral<"ABSTAIN">]>;
        reason: import("@sinclair/typebox").TString;
    }>>;
    result: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"APPROVED">, import("@sinclair/typebox").TLiteral<"REJECTED">, import("@sinclair/typebox").TLiteral<"PENDING">]>>;
}>;
export type OmegaConsensusRequest = Static<typeof OmegaConsensusRequest>;
//# sourceMappingURL=omega-sentinel.d.ts.map