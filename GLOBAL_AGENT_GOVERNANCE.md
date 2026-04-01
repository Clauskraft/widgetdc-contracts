# Global Agent Governance

Status: Cross-repo operational governance baseline for all agents

## Purpose

Define the minimum governance contract that applies to all agents across all repositories, without confusing documentation, prompts, or UI hints for real enforcement.

## Core Truth Order

1. Linear is the operational truth for active work, status, and coordination.
2. `config/*.json` is machine-policy truth where applicable.
3. Repository code is implementation truth.
4. Runtime behavior is enforcement truth.
5. Documentation is descriptive unless backed by config, code, or runtime checks.

## Operating Principles

- Work autonomously within approved scope.
- Prefer the smallest change that restores correctness and enforcement.
- Read active backlog, governing policy, and affected code before changing implementation.
- Challenge drift between docs, config, contracts, and runtime behavior.
- Challenge UI-only or prompt-only governance claims.
- Treat prompts as execution inputs, not enforcement.

## Enforcement Rules

- Governance must be backed by config, contracts, code, or runtime checks.
- Tool scoping must be runtime-enforced.
- Security-sensitive or policy-sensitive flows must not rely on naming conventions or UI boundaries as protection.
- MCP calls use `payload`, never `args`.
- Parameterized queries are mandatory where inputs are involved.
- Read-back verification is required after material writes.
- Docs do not count as enforcement without implementation backing.

## Reasoning and Runtime Policy

- Reasoning flows must follow runtime policy, not prompt preference.
- Sequential runtime planning is required where the platform policy mandates it.
- Folding and equivalent context controls must be treated as enforceable runtime policy when required by compliance, retrieval sensitivity, or context growth.
- Reasoning decisions must emit traceable artifacts when the platform requires compliance visibility.

## Completion Rules

- A task is not done until targeted verification exists.
- A deploy-sensitive task is not done until runtime verification exists.
- A contract-sensitive or architecture-sensitive task is not done until relevant contracts, mappings, and runtime assumptions are checked.
- A governance claim is not done until it is both enforced and verified.

## Memory Hydration and Write-Back (Strategic Batches)

Strategic batches (multi-step agent chains, scheduled loops, and any batch execution touching governance, compliance, or architecture scope) must follow mandatory memory protocol:

### Pre-Batch Hydration
- Before execution begins, the agent must hydrate from canonical state: fetch pending lessons (`audit.lessons`), load relevant `AgentMemory` nodes, and read the latest governance directives from the graph.
- If canonical state is unavailable (Redis down, graph unreachable, or network timeout), the agent must log a traceable exception stating which memory sources were unavailable, proceed with stale-safe defaults, and flag the batch output as `memory_degraded: true`.
- Agents must not start strategic batches with empty or assumed state when canonical sources exist.

### Post-Batch Write-Back
- After batch completion, the agent must checkpoint results back to canonical state: persist material findings as `AgentMemory` nodes, update `Lesson` nodes for cross-agent learning, and record batch outcome in the audit trail.
- Write-back must include: batch identifier, agent identity, outcome status, and a summary of state mutations.
- If write-back fails, the agent must retry once, then log a traceable exception and emit a `memory_writeback_failed` event. The batch result remains valid but must be flagged as `writeback_pending: true`.

### Exception Handling
- Memory unavailability is not a silent failure. All memory exceptions must be logged with: source attempted, error type, fallback action taken, and degradation flag applied.
- Batches running under `memory_degraded` must not make irreversible governance decisions (e.g., compliance status changes, architecture approvals). They may proceed with read-only or advisory actions.

## Agent Coordination Rules

- Record material status, ACK/NACK, and implementation outcomes in the system of operational truth.
- Do not create competing local sources of truth in prompts, UI state, or ad hoc notes.
- Communicate directly between agents when it reduces delay or ambiguity.
- Avoid repeated approval loops once backlog scope is already approved, unless scope or risk materially changes.

## Execution Policy

Canonical workflow and skill selection is defined in `GLOBAL_AGENT_EXECUTION_POLICY.md`.
If a task type has a required execution path, agents must use it or emit a traceable exception.

## Final Rule

If it is not enforced and verified, it is not done.
