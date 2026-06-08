import { Static } from '@sinclair/typebox';
/**
 * AgentAdoptionContract v1 — canonical adoption contract for the 7-repo platform.
 *
 * Foundation for B12-B20 of the WidgeTDC adoption ladder:
 *   B11 (this file)  — Canonical schema (machine-readable contract)
 *   B12              — Repo MERGE nodes (Neo4j AdoptionRepo + AdoptionAgent + ADOPTS edge)
 *   B13              — CI parity gate (CI rejects PRs whose manifest hash does not validate)
 *   B14              — Operator dashboard hook
 *   B15              — Conformance probe (runtime_probe_fn executed against each bridge)
 *   B16              — Manifest hash registry (Neo4j)
 *   B17              — Bridge contract registry
 *   B18              — Telemetry (EventSpine emits telemetry_key on every adoption tick)
 *   B19              — Adoption dashboard (consumes B18 telemetry)
 *   B20              — Promotion rule (L1 -> L2 -> L3 based on conformance probe + telemetry)
 *
 * This schema is GENERIC — agent-specific manifest INSTANCES (e.g. .adoption-manifest.yaml)
 * live in their own repos and validate against this contract.
 *
 * Wire format: snake_case JSON.
 *
 * Motivation: per operator-aligned strategic review, "100% adoption" cannot mean
 * "documentation" — it must mean a machine-readable contract + CI gate + runtime probe.
 *
 * Source: Adoption Blueprint B11 (operator input pt #1)
 */
/**
 * StartupChain — the ordered boot-time chain every conformant agent must execute
 * before its first non-read action (HyperAgent Startup Mandate, CLAUDE.md §1.1).
 *
 * The chain is intent_detect -> rag_query -> reason_deeply. Each step may be
 * required:false to allow lighter bridges (e.g. read-only chat surfaces), but a
 * step marked required:true MUST be present in the agent's runtime probe trace.
 */
export declare const AgentAdoptionStartupChain: import("@sinclair/typebox").TObject<{
    intent_detect: import("@sinclair/typebox").TObject<{
        required: import("@sinclair/typebox").TBoolean;
        min_confidence: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>;
    rag_query: import("@sinclair/typebox").TObject<{
        tool: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"srag.query">, import("@sinclair/typebox").TLiteral<"kg_rag.query">]>;
        required: import("@sinclair/typebox").TBoolean;
    }>;
    reason: import("@sinclair/typebox").TObject<{
        tool: import("@sinclair/typebox").TLiteral<"reason_deeply">;
        required: import("@sinclair/typebox").TBoolean;
    }>;
}>;
export type AgentAdoptionStartupChain = Static<typeof AgentAdoptionStartupChain>;
/**
 * Default-risk classification for the agent's writes. Maps to the governance
 * write-gate (R13 / GOV-7 / LIN-1911 keystone).
 */
export declare const AgentAdoptionRiskTier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"staged_write">, import("@sinclair/typebox").TLiteral<"production_write">]>;
export type AgentAdoptionRiskTier = Static<typeof AgentAdoptionRiskTier>;
/**
 * Read-only / write policy — what governance gates must be satisfied before a
 * mutation routes through this bridge. plan + approval + signature mirror the
 * cross-registry plan recognition shipped in LIN-1911.
 */
export declare const AgentAdoptionWritePolicy: import("@sinclair/typebox").TObject<{
    default_risk: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"staged_write">, import("@sinclair/typebox").TLiteral<"production_write">]>;
    write_requires: import("@sinclair/typebox").TObject<{
        plan: import("@sinclair/typebox").TBoolean;
        approval: import("@sinclair/typebox").TBoolean;
        signature: import("@sinclair/typebox").TBoolean;
    }>;
}>;
export type AgentAdoptionWritePolicy = Static<typeof AgentAdoptionWritePolicy>;
/**
 * AgentAdoptionContract — canonical machine-readable adoption contract.
 *
 * A conformant manifest instance MUST:
 *   1. Validate against this TypeBox schema (B13 CI gate).
 *   2. Resolve `required_tools` against the bridge's actual tool inventory (B15 conformance probe).
 *   3. Execute `startup_chain` in order at boot (B15 conformance probe).
 *   4. Emit `telemetry_key` events through EventSpine (B18).
 *   5. Carry a sha256 `hash` field computed over the manifest with the hash field set to "".
 *
 * The `hash` field is excluded from its own input (see {@link computeContractHash}).
 */
export declare const AgentAdoptionContract: import("@sinclair/typebox").TObject<{
    contract_version: import("@sinclair/typebox").TLiteral<"v1">;
    repo: import("@sinclair/typebox").TString;
    agent: import("@sinclair/typebox").TString;
    bridge: import("@sinclair/typebox").TString;
    required_tools: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    startup_chain: import("@sinclair/typebox").TObject<{
        intent_detect: import("@sinclair/typebox").TObject<{
            required: import("@sinclair/typebox").TBoolean;
            min_confidence: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        }>;
        rag_query: import("@sinclair/typebox").TObject<{
            tool: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"srag.query">, import("@sinclair/typebox").TLiteral<"kg_rag.query">]>;
            required: import("@sinclair/typebox").TBoolean;
        }>;
        reason: import("@sinclair/typebox").TObject<{
            tool: import("@sinclair/typebox").TLiteral<"reason_deeply">;
            required: import("@sinclair/typebox").TBoolean;
        }>;
    }>;
    read_only_write_policy: import("@sinclair/typebox").TObject<{
        default_risk: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"staged_write">, import("@sinclair/typebox").TLiteral<"production_write">]>;
        write_requires: import("@sinclair/typebox").TObject<{
            plan: import("@sinclair/typebox").TBoolean;
            approval: import("@sinclair/typebox").TBoolean;
            signature: import("@sinclair/typebox").TBoolean;
        }>;
    }>;
    telemetry_key: import("@sinclair/typebox").TString;
    runtime_probe_fn: import("@sinclair/typebox").TString;
    created_at: import("@sinclair/typebox").TString;
    hash: import("@sinclair/typebox").TString;
}>;
export type AgentAdoptionContract = Static<typeof AgentAdoptionContract>;
/**
 * Compute the canonical sha256 hash of an AgentAdoptionContract.
 *
 * The hash is computed over a copy of the manifest with `hash` forced to the
 * empty string. This avoids self-reference: the hash field is excluded from
 * its own input.
 *
 * Use this for both:
 *  - Producing the value to put in the `hash` field of a manifest.
 *  - Verifying a manifest: recompute, compare to manifest.hash.
 */
export declare function computeContractHash(contract: Omit<AgentAdoptionContract, 'hash'> & {
    hash?: string;
}): string;
/**
 * Verify that a contract's `hash` field matches its recomputed canonical hash.
 *
 * Returns `true` iff the manifest is internally consistent. Schema validation
 * (Value.Check(AgentAdoptionContract, ...)) is orthogonal and must be run
 * separately.
 */
export declare function verifyContractHash(contract: AgentAdoptionContract): boolean;
//# sourceMappingURL=agent-adoption-contract.d.ts.map