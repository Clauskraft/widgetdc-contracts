# VALHALLA TEMPLATE CATALOG

Date: 2026-03-19
Status: Canonical logical template catalog for Output Forge
Owner: `widgetdc-contracts`

## Purpose

This catalog is the shared contract truth for `forge.artifact.generate` template selection.
It defines the canonical template IDs that WidgeTDC and `widgetdc-rlm-engine` may exchange.

Current state:
- The catalog is logical and contract-first.
- Physical `.potx` / `.xltx` master assets are not yet committed in `widgetdc-contracts`.
- Until those masters are checked in, the canonical binding is:
  `template_id` -> Foundry deck family -> Foundry asset registry selection.

This avoids local parallel truth while preserving one stable template namespace.

## Canonical Template IDs

| Template ID | Artifact Type | Deck Family | Primary Foundry Assets | Intended Use |
| --- | --- | --- | --- | --- |
| `valhalla.executive_strategy.board_master` | `pptx` | `executive_strategy` | `pb-strategic-foundry-masterpiece-v1`, `fs-executive-architecture-pack-v1`, `vm-process-flow-exec-v1` | Board decks, executive storyline, strategy synthesis |
| `valhalla.public_sector_compliance.sovereign_master` | `pptx` | `public_sector_compliance` | `fs-sovereign-delivery-pack-v1`, `cg-sovereign-readiness-radar-v1`, `cg-risk-heatmap-exec-v1` | Sovereign readiness, compliance posture, control narratives |
| `valhalla.tender_response.traceability_master` | `pptx` | `tender_response` | `tg-tender-requirement-traceability-v1` | Tender response decks, bid traceability, requirement coverage |
| `valhalla.architecture_assessment.reference_master` | `pptx` | `architecture_assessment` | `fs-executive-architecture-pack-v1`, `vm-reference-architecture-families-v1` | Architecture review, target state, gap and replacement framing |
| `valhalla.replacement_case.vendor_exit_master` | `pptx` | `replacement_case` | `vm-replacement-engine-v1`, `cg-supplier-concentration-bar-v1` | Vendor replacement, migration story, concentration risk |
| `valhalla.delivery_operating_model.execution_master` | `pptx` | `delivery_operating_model` | `vm-pillar-operating-model-v1`, `cg-sovereign-readiness-radar-v1` | Delivery model, governance, operating cadence |
| `valhalla.commercial_business_case.financial_master` | `xlsx` | `commercial_business_case` | `cg-risk-heatmap-exec-v1`, `cg-supplier-concentration-bar-v1` | Editable financial models, scenarios, business case workbooks |

## Routing Rules

1. `forge.artifact.generate` must accept only catalog IDs from this file.
2. `widgetdc-rlm-engine` must resolve each `template_id` through the Foundry asset registry and deck family logic.
3. If a physical Office master is later added, the `template_id` remains stable and only the backing asset binding changes.
4. Until physical masters exist, generators must not invent repo-local template namespaces.

## Fallback Policy (Graceful Degradation)

Until `CoverageGap.VALHALLA_PHYSICAL_MASTERS_MISSING` is resolved, the following fallback chain applies:

1. **Primary Attempt:** Resolve `template_id` via the Foundry asset registry.
2. **Secondary Fallback:** If the asset registry is unreachable or empty, generate a **Universal WidgeTDC Layout** using standard `python-pptx` shapes (Title + Bullet points + Placeholder SVG).
3. **Tertiary Fallback:** If slide generation fails, return a **Semantic Markdown Report** containing all the extracted logic and data, clearly marked as `[RENDER_DEGRADED]`.

This ensures that the business logic is never lost due to visual asset gaps.

## Known Coverage Gap

The physical master files referenced by the Supremacy Batch 08 vision are not yet present in `widgetdc-contracts`.

Promotion rule:
- logical template IDs are allowed now
- physical-template enforcement is blocked until the Office master assets are committed and verified

Reason code:
- `CoverageGap.VALHALLA_PHYSICAL_MASTERS_MISSING`
