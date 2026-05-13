# Agent Instructions

This repository inherits the cross-repo baseline defined in `GLOBAL_AGENT_GOVERNANCE.md`.

Repo-specific instructions may extend this file, but they must not weaken global rules for operational truth, runtime enforcement, verification, or completion.

## Runtime Proof Evidence Boundary [adopted 2026-05-13]

- Local shell commands, local scripts, notebooks, `npm`/`pytest` runs, and local wrappers that call production endpoints are diagnostic evidence only. They can reproduce, debug, or prepare a PR, but they cannot be cited as runtime proof or claim proof.
- Claim-grade runtime proof must come from a deployed service or governed runtime tool executing on the deployed SHA. Minimum evidence: deployed SHA read-back, structured result, `correlation_id`, and EventSpine replay count >= 1 when the evidence affects governance, claims, canaries, or production-surface status.
- If a check is run locally, label it `diagnostic_only` in reports and PRs. If no deployed runner exists, status is `YELLOW` or `BLOCKED_RUNTIME`, never GREEN.
- Do not use local bearer fallback, local env, local Neo4j, mocks, or CI-only output as production proof.
- Preferred pattern: local wrapper -> deployed verification tool -> EventSpine event/replay -> report cites deployed SHA and `correlation_id`.
