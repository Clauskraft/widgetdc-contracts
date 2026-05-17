# Agent Instructions

This repository inherits the cross-repo baseline defined in `GLOBAL_AGENT_GOVERNANCE.md`.

Repo-specific instructions may extend this file, but they must not weaken global rules for operational truth, runtime enforcement, verification, or completion.

## Runtime Proof Evidence Boundary [adopted 2026-05-13]

- Local shell commands, local scripts, notebooks, `npm`/`pytest` runs, and local wrappers that call production endpoints are diagnostic evidence only. They can reproduce, debug, or prepare a PR, but they cannot be cited as runtime proof or claim proof.
- Claim-grade runtime proof must come from a deployed service or governed runtime tool executing on the deployed SHA. Minimum evidence: deployed SHA read-back, structured result, `correlation_id`, and EventSpine replay count >= 1 when the evidence affects governance, claims, canaries, or production-surface status.
- If a check is run locally, label it `diagnostic_only` in reports and PRs. If no deployed runner exists, status is `YELLOW` or `BLOCKED_RUNTIME`, never GREEN.
- Do not use local bearer fallback, local env, local Neo4j, mocks, or CI-only output as production proof.
- Preferred pattern: local wrapper -> deployed verification tool -> EventSpine event/replay -> report cites deployed SHA and `correlation_id`.

## Wonder Gateway Activation Contract [adopted 2026-05-17]

This repo participates in the WidgeTDC Wonder Gateway multi-repo control plane.

Trigger phrases: `/wonder`, `@wonder`, `wonder agent`, `aktiver wonder agent`, `activate wonder agent`.

On any trigger, do not start with a broad repo search or generic status fallback. Enter Wonder Gateway mode:

1. Load `config/wonder_gateway.json` and this `AGENTS.md` section first.
2. Check auth by env-name only: `WIDGETDC_BEARER_TOKEN`, `BACKEND_API_KEY`, `BACKEND_URL`. Never print secret values.
3. Route read-only status and planning through the governed MCP/A2A surfaces declared in `config/wonder_gateway.json`.
4. Keep Wonder read-only/plan-only by default. Writes, deployments, graph mutation, worker dispatch, Linear mutation, and claim promotion require HyperAgent plan + approval + EventSpine evidence.
5. For Claude, Gemini, DeepSeek, and Qwen, use the provider only for the smallest missing evidence gap or specialist review. Fold provider input/output and label it evidence input until verified.
6. Diagram requests must return professional Mermaid or structured diagram specs, not repeated health summaries.
7. Long outputs must be foldable: emit an executive layer first, then expandable sections with evidence anchors and stop conditions.

Stop if native MCP/auth is missing and HTTP fallback is not explicitly approved for the current task. Report `BLOCKED_MCP_OR_AUTH`, not success.
