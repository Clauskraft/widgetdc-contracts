import { Static } from '@sinclair/typebox';
export declare const TelemetryPhase: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"discover">, import("@sinclair/typebox").TLiteral<"define">, import("@sinclair/typebox").TLiteral<"develop">, import("@sinclair/typebox").TLiteral<"deliver">, import("@sinclair/typebox").TLiteral<"observe">, import("@sinclair/typebox").TLiteral<"orient">, import("@sinclair/typebox").TLiteral<"decide">, import("@sinclair/typebox").TLiteral<"act">]>;
export type TelemetryPhase = Static<typeof TelemetryPhase>;
export declare const TelemetryOutcome: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"success">, import("@sinclair/typebox").TLiteral<"warning">, import("@sinclair/typebox").TLiteral<"timeout">, import("@sinclair/typebox").TLiteral<"fail">, import("@sinclair/typebox").TLiteral<"blocked">]>;
export type TelemetryOutcome = Static<typeof TelemetryOutcome>;
export declare const TelemetryEntry: import("@sinclair/typebox").TObject<{
    telemetry_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timestamp: import("@sinclair/typebox").TString;
    scope_owner: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"widgetdc-orchestrator">, import("@sinclair/typebox").TLiteral<"widgetdc-librechat">, import("@sinclair/typebox").TLiteral<"snout">]>;
    agent_persona: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"RESEARCHER">, import("@sinclair/typebox").TLiteral<"ENGINEER">, import("@sinclair/typebox").TLiteral<"CUSTODIAN">, import("@sinclair/typebox").TLiteral<"ARCHITECT">, import("@sinclair/typebox").TLiteral<"SENTINEL">, import("@sinclair/typebox").TLiteral<"ARCHIVIST">, import("@sinclair/typebox").TLiteral<"HARVESTER">, import("@sinclair/typebox").TLiteral<"ANALYST">, import("@sinclair/typebox").TLiteral<"INTEGRATOR">, import("@sinclair/typebox").TLiteral<"TESTER">]>;
    runtime_identity: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    provider_source: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    task_domain: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"intake">, import("@sinclair/typebox").TLiteral<"decomposition">, import("@sinclair/typebox").TLiteral<"recommendation">, import("@sinclair/typebox").TLiteral<"learning">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"audit">]>;
    capability: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    phase: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"discover">, import("@sinclair/typebox").TLiteral<"define">, import("@sinclair/typebox").TLiteral<"develop">, import("@sinclair/typebox").TLiteral<"deliver">, import("@sinclair/typebox").TLiteral<"observe">, import("@sinclair/typebox").TLiteral<"orient">, import("@sinclair/typebox").TLiteral<"decide">, import("@sinclair/typebox").TLiteral<"act">]>;
    outcome: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"success">, import("@sinclair/typebox").TLiteral<"warning">, import("@sinclair/typebox").TLiteral<"timeout">, import("@sinclair/typebox").TLiteral<"fail">, import("@sinclair/typebox").TLiteral<"blocked">]>;
    duration_ms: import("@sinclair/typebox").TInteger;
    evidence_source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"decision_quality_scorecard">, import("@sinclair/typebox").TLiteral<"monitoring_audit_log">, import("@sinclair/typebox").TLiteral<"operator_feedback">, import("@sinclair/typebox").TLiteral<"runtime_readback">]>;
    trace_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    metadata: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TBoolean, import("@sinclair/typebox").TNull]>>>;
}>;
export type TelemetryEntry = Static<typeof TelemetryEntry>;
//# sourceMappingURL=telemetry-entry.d.ts.map