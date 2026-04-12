/**
 * agent-contract.ts — Canonical Agent Request/Response Contract (Phantom Week 2, P0).
 *
 * Single source of truth for agent↔agent wire format across backend, orchestrator,
 * and rlm-engine. Per ADR-004 (Phantom Source-of-Truth Locking): this contract is
 * canonical — AgentMemory is cache, graph is materialized state.
 *
 * Wire format: snake_case JSON with $id (WidgeTDC convention).
 *
 * References:
 *   - docs/FINAL_PLAN_v3.0.md §3.3 Canonical Contract for Model Normalization
 *   - ADR-004 Phantom Source-of-Truth Locking
 */
import { type Static } from '@sinclair/typebox';
export declare const AgentPriority: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"normal">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"critical">]>;
export type AgentPriority = Static<typeof AgentPriority>;
export declare const AgentResponseStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"success">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"failed">, import("@sinclair/typebox").TLiteral<"conflict">]>;
export type AgentResponseStatus = Static<typeof AgentResponseStatus>;
export declare const AgentConflict: import("@sinclair/typebox").TObject<{
    other_agent_id: import("@sinclair/typebox").TString;
    other_task: import("@sinclair/typebox").TString;
    similarity: import("@sinclair/typebox").TNumber;
    mode: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"advisory">, import("@sinclair/typebox").TLiteral<"blocking">]>;
    suggestion: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type AgentConflict = Static<typeof AgentConflict>;
export declare const TokenUsage: import("@sinclair/typebox").TObject<{
    input: import("@sinclair/typebox").TInteger;
    output: import("@sinclair/typebox").TInteger;
}>;
export type TokenUsage = Static<typeof TokenUsage>;
export declare const AgentRequest: import("@sinclair/typebox").TObject<{
    request_id: import("@sinclair/typebox").TString;
    agent_id: import("@sinclair/typebox").TString;
    task: import("@sinclair/typebox").TString;
    capabilities: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    context: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
    priority: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"normal">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"critical">]>;
}>;
export type AgentRequest = Static<typeof AgentRequest>;
export declare const AgentResponse: import("@sinclair/typebox").TObject<{
    request_id: import("@sinclair/typebox").TString;
    agent_id: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"success">, import("@sinclair/typebox").TLiteral<"partial">, import("@sinclair/typebox").TLiteral<"failed">, import("@sinclair/typebox").TLiteral<"conflict">]>;
    output: import("@sinclair/typebox").TString;
    tokens_used: import("@sinclair/typebox").TObject<{
        input: import("@sinclair/typebox").TInteger;
        output: import("@sinclair/typebox").TInteger;
    }>;
    cost_dkk: import("@sinclair/typebox").TNumber;
    conflicts: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        other_agent_id: import("@sinclair/typebox").TString;
        other_task: import("@sinclair/typebox").TString;
        similarity: import("@sinclair/typebox").TNumber;
        mode: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"advisory">, import("@sinclair/typebox").TLiteral<"blocking">]>;
        suggestion: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export type AgentResponse = Static<typeof AgentResponse>;
export declare const CapabilityEntry: import("@sinclair/typebox").TObject<{
    provider: import("@sinclair/typebox").TString;
    model: import("@sinclair/typebox").TString;
    capabilities: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    max_tokens: import("@sinclair/typebox").TInteger;
    cost_per_1k: import("@sinclair/typebox").TObject<{
        input: import("@sinclair/typebox").TNumber;
        output: import("@sinclair/typebox").TNumber;
    }>;
    latency_p50_ms: import("@sinclair/typebox").TNumber;
    fallback_to: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type CapabilityEntry = Static<typeof CapabilityEntry>;
export declare const CapabilityMatrix: import("@sinclair/typebox").TObject<{
    version: import("@sinclair/typebox").TString;
    entries: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        provider: import("@sinclair/typebox").TString;
        model: import("@sinclair/typebox").TString;
        capabilities: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        max_tokens: import("@sinclair/typebox").TInteger;
        cost_per_1k: import("@sinclair/typebox").TObject<{
            input: import("@sinclair/typebox").TNumber;
            output: import("@sinclair/typebox").TNumber;
        }>;
        latency_p50_ms: import("@sinclair/typebox").TNumber;
        fallback_to: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export type CapabilityMatrix = Static<typeof CapabilityMatrix>;
//# sourceMappingURL=agent-contract.d.ts.map