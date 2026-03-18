# Adv Graph Integration Guardrails

## Status
`Adv Graph` is accepted only as an internal analysis surface in `widgetdc-contracts`.

It is not yet a promotable public contracts surface.

## Current Findings
- `scripts/arch-ast-bridge.py` referenced a vendored `ast_graph` engine that is incomplete in the current working tree.
- `python/widgetdc_contracts/snout_engine/` still imports foreign application paths such as `app.models`, `app.utils`, and `app.services`.
- The added Python dependencies are analysis-heavy and do not belong in the default install path for shared contracts consumers.
- `python/widgetdc_contracts/graph.py` has local generated drift, but those label additions are not yet backed by the canonical schema/export flow.

## Canonical Boundary
- `widgetdc-contracts` remains the canonical shared contracts library.
- `Adv Graph` may live here only as an internal optional analysis subsystem.
- `arch/ast-graph.json` is an analysis artifact, not source-of-truth memory.
- Governance, ownership, and promotion truth remain in `WidgeTDC`.

## Hard Rules
- No promotion of `Adv Graph` to `main` as a public package surface until the vendored AST engine is complete and import-clean.
- No default Python dependency inflation for consumers that only need shared contracts.
- No new graph labels or relationships are canonical until they are generated from the schema pipeline.
- No `snout_engine` runtime adoption until foreign imports are replaced with internal package boundaries or adapters.

## Required Before Promotion
1. Complete the vendored `ast_graph` engine so the bridge can execute without missing modules.
2. Replace foreign imports inside `snout_engine` with internal package modules or explicit adapters.
3. Keep heavy Python analysis dependencies behind optional extras.
4. Add a deterministic verification path:
   - `python scripts/arch-ast-bridge.py`
   - verify `arch/ast-graph.json` generation
   - verify the TypeScript analysis layer can ingest the emitted JSON
5. Regenerate Python contracts from schemas before any graph ontology changes are promoted.

## Current Verification
- The bridge now fails closed with an explicit error when `ast_graph` is incomplete.
- Python cache artifacts are ignored.
- Analysis database output is ignored.
