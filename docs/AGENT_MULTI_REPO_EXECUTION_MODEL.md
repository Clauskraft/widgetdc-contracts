# AGENT MULTI-REPO EXECUTION MODEL

Version: 2026-03-14
Status: Canonical execution model for parallel multi-repo agent work

## Purpose

Define how Claude, Codex, Gemini, Qwen, and Qwen Code Smith operate when development happens in multiple repositories at the same time.

## Canonical Rule

- `WidgeTDC` is the master governance and distribution repo.
- Agent policy is centralized.
- Agent execution is distributed.
- Each active repo or worktree may have its own live execution context for the same agent role.

## Federated Model

- `Claude`, `Codex`, `Gemini`, `Qwen`, and `Qwen Code Smith` are federated across repos.
- They are one governance identity each, but may operate through many concurrent repo-local execution contexts.
- Repo-local execution contexts must use the same synced instruction files and governance bundle.

## Repo-Local Execution Rule

- The correct execution context is the repo where the code and backlog item live.
- Active work across `WidgeTDC`, `widgetdc-librechat`, `widgetdc-rlm-engine`, `widgetdc-contracts`, `widgetdc-canvas`, `widgetdc-openclaw`, `widgetdc-orchestrator`, and `widgetdc-consulting-frontend` must be able to proceed in parallel.
- No single repo may become the forced execution bottleneck for the agent fleet.

## Role Mapping

- `Claude`
  - centralized in policy
  - repo-local as orchestrator, deploy/test gate, rollout owner
- `Codex`
  - centralized in policy
  - repo-local as implementation owner and runtime hardening agent
- `Gemini`
  - centralized in policy
  - repo-local as architecture reviewer and topology reviewer
- `Qwen`
  - centralized in policy
  - repo-local as QA reviewer and governance enforcer
- `Qwen Code Smith`
  - centralized in policy
  - repo-local as QA execution fallback when MCP, repo, or runtime facts are required

## Coordination Rule

- Linear is the global operational coordination truth.
- Each backlog item must identify the target repo.
- Repo-local execution must write material status and outcomes back to Linear.
- Cross-repo findings must be written back to the affected repo and backlog item, not kept only in central chat.

## Delivery Rule

- Delivery ownership stays repo-local.
- The agent that finishes a code batch in a repo owns commit, push to `main`, and deployment follow-up for that repo-local batch.

## Final Rule

Agents must be centralized in policy, but distributed in execution.
