# QWEN MULTI-REPO EXECUTION MODEL

Version: 2026-03-14
Status: Canonical execution model for parallel Qwen operation

## Purpose

Define how Qwen operates when development happens in multiple repositories at the same time.

## Canonical Rule

- `WidgeTDC` is the master governance and distribution repo.
- Qwen does not run in only one repo.
- Qwen runs as a federated execution model:
  - one canonical policy source
  - one synced instruction set
  - one active Qwen execution context per repo or worktree where active work exists

## Operating Model

- `WidgeTDC` owns:
  - `QWEN.md`
  - policy bundle
  - cross-repo sync rules
  - enforcement intent
- each satellite repo owns:
  - local Qwen execution against local code
  - local backlog item handling
  - local commit, push, and deploy follow-up for Qwen-owned batches

## Parallelism Rule

- Qwen must be able to work in multiple repos in parallel.
- Active work in `widgetdc-librechat`, `widgetdc-rlm-engine`, `widgetdc-contracts`, `widgetdc-canvas`, `widgetdc-openclaw`, `widgetdc-orchestrator`, and `widgetdc-consulting-frontend` must not be serialized through a single repo context.
- The correct execution context is the repo where the code and backlog item live.

## Coordination Rule

- Linear remains the global operational coordination truth.
- Each backlog item must identify the target repo.
- Qwen works directly inside the target repo while keeping state changes visible in Linear.
- Cross-repo findings must be written back to the affected repo and backlog item, not held only in a central chat thread.

## Identity Rule

- Qwen is one governance role.
- Qwen may have many concurrent repo-local execution contexts.
- Repo-local execution contexts must all use the same canonical `QWEN.md` and governance bundle.

## Practical Routing

- `WidgeTDC`: governance, sync, policy, cross-repo drift
- `widgetdc-librechat`: LibreChat runtime and sync behavior
- `widgetdc-rlm-engine`: Python and RLM runtime
- `widgetdc-contracts`: schemas and contract packages
- `widgetdc-canvas` and `widgetdc-consulting-frontend`: frontend surfaces
- `widgetdc-openclaw` and `widgetdc-orchestrator`: orchestration and runtime control planes

## Final Rule

Qwen must be centralized in policy, but distributed in execution.
