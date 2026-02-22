import { Static } from '@sinclair/typebox';
/** Consulting agent tiers — ascending autonomy level */
export declare const AgentTier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ANALYST">, import("@sinclair/typebox").TLiteral<"ASSOCIATE">, import("@sinclair/typebox").TLiteral<"MANAGER">, import("@sinclair/typebox").TLiteral<"PARTNER">, import("@sinclair/typebox").TLiteral<"ARCHITECT">]>;
export type AgentTier = Static<typeof AgentTier>;
/** RLM Engine agent personas — specialized cognitive roles */
export declare const AgentPersona: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"RESEARCHER">, import("@sinclair/typebox").TLiteral<"ENGINEER">, import("@sinclair/typebox").TLiteral<"CUSTODIAN">, import("@sinclair/typebox").TLiteral<"ARCHITECT">, import("@sinclair/typebox").TLiteral<"SENTINEL">, import("@sinclair/typebox").TLiteral<"ARCHIVIST">, import("@sinclair/typebox").TLiteral<"HARVESTER">, import("@sinclair/typebox").TLiteral<"ANALYST">, import("@sinclair/typebox").TLiteral<"INTEGRATOR">, import("@sinclair/typebox").TLiteral<"TESTER">]>;
export type AgentPersona = Static<typeof AgentPersona>;
/** Signal types emitted during engagement execution */
export declare const SignalType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"task_started">, import("@sinclair/typebox").TLiteral<"task_completed">, import("@sinclair/typebox").TLiteral<"task_failed">, import("@sinclair/typebox").TLiteral<"escalation">, import("@sinclair/typebox").TLiteral<"quality_gate">, import("@sinclair/typebox").TLiteral<"tool_executed">, import("@sinclair/typebox").TLiteral<"deliverable_generated">, import("@sinclair/typebox").TLiteral<"insight">, import("@sinclair/typebox").TLiteral<"warning">]>;
export type SignalType = Static<typeof SignalType>;
//# sourceMappingURL=enums.d.ts.map