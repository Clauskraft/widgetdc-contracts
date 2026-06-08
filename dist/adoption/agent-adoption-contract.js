import { Type } from '@sinclair/typebox';
import { createHash } from 'node:crypto';
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
// ── Sub-schemas ──────────────────────────────────────────────
/**
 * StartupChain — the ordered boot-time chain every conformant agent must execute
 * before its first non-read action (HyperAgent Startup Mandate, CLAUDE.md §1.1).
 *
 * The chain is intent_detect -> rag_query -> reason_deeply. Each step may be
 * required:false to allow lighter bridges (e.g. read-only chat surfaces), but a
 * step marked required:true MUST be present in the agent's runtime probe trace.
 */
export const AgentAdoptionStartupChain = Type.Object({
    intent_detect: Type.Object({
        required: Type.Boolean({ description: 'Whether intent_detect must run at boot' }),
        min_confidence: Type.Optional(Type.Number({
            minimum: 0,
            maximum: 1,
            description: 'Minimum confidence threshold for the intent classification',
        })),
    }, { description: 'Boot-time intent classification step' }),
    rag_query: Type.Object({
        tool: Type.Union([
            Type.Literal('srag.query'),
            Type.Literal('kg_rag.query'),
        ], { description: 'Which RAG tool the agent uses for boot-time retrieval' }),
        required: Type.Boolean({ description: 'Whether rag_query must run at boot' }),
    }, { description: 'Boot-time retrieval step' }),
    reason: Type.Object({
        tool: Type.Literal('reason_deeply', { description: 'Always reason_deeply for the canonical chain' }),
        required: Type.Boolean({ description: 'Whether reason_deeply must run at boot' }),
    }, { description: 'Boot-time deep-reasoning step' }),
}, {
    $id: 'AgentAdoptionStartupChain',
    description: 'Ordered probes the agent must execute at boot (intent_detect -> rag_query -> reason)',
});
/**
 * Default-risk classification for the agent's writes. Maps to the governance
 * write-gate (R13 / GOV-7 / LIN-1911 keystone).
 */
export const AgentAdoptionRiskTier = Type.Union([
    Type.Literal('read_only'),
    Type.Literal('staged_write'),
    Type.Literal('production_write'),
], {
    $id: 'AgentAdoptionRiskTier',
    description: 'Default risk classification for the agent on this bridge',
});
/**
 * Read-only / write policy — what governance gates must be satisfied before a
 * mutation routes through this bridge. plan + approval + signature mirror the
 * cross-registry plan recognition shipped in LIN-1911.
 */
export const AgentAdoptionWritePolicy = Type.Object({
    default_risk: AgentAdoptionRiskTier,
    write_requires: Type.Object({
        plan: Type.Boolean({ description: 'A HyperAgent / orchestrator plan must exist and be retrievable' }),
        approval: Type.Boolean({ description: 'A store-backed approval token must be present (GOV-7)' }),
        signature: Type.Boolean({ description: 'The approval must carry a verifiable signature (LIN-1911)' }),
    }, { description: 'Gates that must be satisfied before any write executes' }),
}, {
    $id: 'AgentAdoptionWritePolicy',
    description: 'Governance write-policy for the agent on this bridge',
});
// ── Top-level contract ───────────────────────────────────────
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
export const AgentAdoptionContract = Type.Object({
    contract_version: Type.Literal('v1', { description: 'Contract schema version. Bump on breaking change.' }),
    repo: Type.String({
        minLength: 1,
        description: 'Canonical repo name, e.g. "WidgeTDC", "widgetdc-orchestrator", "widgetdc-rlm-engine"',
    }),
    agent: Type.String({
        minLength: 1,
        description: 'Canonical agent name, e.g. "claude-code", "codex", "gemini", "deepseek"',
    }),
    bridge: Type.String({
        minLength: 1,
        description: 'Bridge name, e.g. "native-mcp", "http-mcp-route", "claude-in-chrome", "librechat-mcp"',
    }),
    required_tools: Type.Array(Type.String({ minLength: 1 }), {
        description: 'Tools every conformant agent on this bridge MUST be able to call',
    }),
    startup_chain: AgentAdoptionStartupChain,
    read_only_write_policy: AgentAdoptionWritePolicy,
    telemetry_key: Type.String({
        minLength: 1,
        description: 'EventSpine event-key the agent emits, e.g. "adoption.event.v1"',
    }),
    runtime_probe_fn: Type.String({
        minLength: 1,
        description: 'Canonical probe identifier executed by B15 conformance gate, e.g. "adoption.conformance.v1"',
    }),
    created_at: Type.String({
        format: 'date-time',
        description: 'ISO 8601 timestamp of when this manifest instance was minted',
    }),
    hash: Type.String({
        pattern: '^[0-9a-f]{64}$',
        description: 'sha256 of the manifest with hash="" — computed by computeContractHash()',
    }),
}, {
    $id: 'AgentAdoptionContract',
    description: 'Canonical adoption contract (B11) — single machine-readable artefact every agent on every bridge must satisfy. ' +
        'Foundation for B12 (repo MERGE nodes), B13 (CI parity gate), B15 (conformance probe), ' +
        'B18 (telemetry), B19 (dashboard), B20 (promotion rule).',
});
// ── Hash helpers ─────────────────────────────────────────────
/**
 * Stable JSON stringify — keys in lexicographic order, no whitespace.
 * Required so the same logical contract always hashes to the same digest,
 * regardless of how the JSON was authored.
 */
function stableStringify(value) {
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return '[' + value.map(stableStringify).join(',') + ']';
    }
    const keys = Object.keys(value).sort();
    return '{' + keys
        .map((k) => JSON.stringify(k) + ':' + stableStringify(value[k]))
        .join(',') + '}';
}
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
export function computeContractHash(contract) {
    const normalized = { ...contract, hash: '' };
    return createHash('sha256').update(stableStringify(normalized)).digest('hex');
}
/**
 * Verify that a contract's `hash` field matches its recomputed canonical hash.
 *
 * Returns `true` iff the manifest is internally consistent. Schema validation
 * (Value.Check(AgentAdoptionContract, ...)) is orthogonal and must be run
 * separately.
 */
export function verifyContractHash(contract) {
    return computeContractHash(contract) === contract.hash;
}
//# sourceMappingURL=agent-adoption-contract.js.map