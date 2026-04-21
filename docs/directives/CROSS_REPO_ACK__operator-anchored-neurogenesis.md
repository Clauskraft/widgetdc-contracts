# CROSS_REPO_ACK — Operator-Anchored Neurogenesis

- repo: `widgetdc-contracts`
- directive id/version: `2026-04-21-operator-anchored-neurogenesis` / `v1`
- impacted surfaces:
  - `@widgetdc/contracts/mrp/operatorAnchoredPheromone`
  - shared request/response contracts for operator-anchored pheromone APIs
  - shared request/response contracts for human-signaled orchestrator triggers
- disposition: `implemented`
- local gate state:
  - `build`: passed (`npm run build`)
  - `test`: passed (`npx vitest run tests/operatorAnchoredPheromone.test.ts`)
  - `typecheck`: passed (`npm run typecheck`)
- read-back evidence:
  - companion PR branch: `codex/unified-adoption-propagation`
  - consolidated production read-back will be recorded in WidgeTDC adoption closeout
