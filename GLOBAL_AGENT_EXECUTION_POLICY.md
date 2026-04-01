# Global Agent Execution Policy

Status: Cross-repo execution policy baseline for all WidgeTDC agents

## Purpose

Define the canonical execution patterns that agents must use for common task types, so skills and workflows are not treated as optional advice.

## Relationship to Governance

This file operationalizes `GLOBAL_AGENT_GOVERNANCE.md`.
Governance defines the rules. Execution policy defines the canonical workflow selection, routing, and verification expectations.

## Core Rule

If a task type has a canonical execution path, agents must use it or emit a traceable exception.

## Canonical Task Routing

- Research, discovery, landscape scan, deep investigation -> `flow-discover`
- Requirements, scoping, technical specification, PRD -> `flow-define` or `skill-prd`
- Implementation, feature build, process design -> `flow-develop`
- Review, validation, delivery readiness -> `flow-deliver` or `skill-code-review`
- Architecture and topology decisions -> `octopus-architecture`
- Debugging and fault isolation -> `skill-debug`
- Security review, audit, threat framing -> `skill-audit` or `skill-security-framing`
- Test-first implementation and verification-led coding -> `skill-tdd`
- Knowledge synthesis, report writing, research packaging -> `skill-knowledge-work`
- Multi-model disagreement or major tradeoff resolution -> `skill-debate` or `octo.debate`

## Memory Protocol for Strategic Batches

Strategic batches (multi-step chains, scheduled loops, governance/compliance/architecture scope) must follow the memory hydration and write-back protocol defined in `GLOBAL_AGENT_GOVERNANCE.md`:

1. **Pre-batch**: Hydrate from canonical state (lessons, AgentMemory, governance directives).
2. **Execute**: Run with hydrated context. Flag `memory_degraded: true` if hydration failed.
3. **Post-batch**: Checkpoint results to canonical state (AgentMemory, Lesson nodes, audit trail).
4. **Exception**: Log all memory failures with source, error, fallback action, and degradation flag. Do not make irreversible governance decisions under degraded memory.

Batch execution that skips memory hydration or write-back without a traceable exception is a compliance gap.

## Enforcement Expectations

- Intent detection should map task types to canonical skills.
- Autonomous and scheduled execution paths should call the same canonical routes as interactive flows.
- Agent instructions must say when canonical routing is mandatory, not merely available.
- Fallback paths must be explicit, logged, and justified.

## Verification Requirements

- Record the selected skill, route, or workflow in runtime artifacts, logs, or graph nodes.
- Make it possible to distinguish canonical execution from direct freeform execution.
- Treat missing execution traces for mandatory paths as a compliance gap.

## Exception Handling

- Allowed only when the canonical path is unavailable, unsafe, or disproportional to task size.
- Exceptions must state why canonical execution was skipped.
- Exceptions must still meet verification requirements.

## Final Rule

If canonical execution is required but neither enforced nor traceable, adoption is not real.
