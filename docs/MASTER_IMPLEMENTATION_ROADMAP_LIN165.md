# WIDGETDC MASTER IMPLEMENTATION ROADMAP (LIN-165)

**Date:** 2026-03-19
**Status:** Canonical Implementation Plan
**Author:** Gemini (Master Architect)

## Executive Summary
This roadmap codifies the implementation of the "Supremacy Architecture" designed over the last 24 hours. Crucially, the designs (01-08) are **locked**. We are no longer designing new features to fix these problems. Our focus is purely on **Implementation & Verification (Test-Driven Development)** of the mitigations currently in-flight.

If a gap is identified that was addressed in the past 24 hours, **do not design a new solution**. Instead, write a failing test case that the incoming implementation will satisfy.

---

## 1. The Output Forge (Multi-Modal Generation)
*Mitigates: Fragmented Node.js docgen (tdcHandlers.ts, docgen.excel.create).*

**Current Status:** Integration Manifest (08_THE_OUTPUT_FORGE.md) generated and prompt delivered to implementation agent.

**Verification (TDD Goal):**
Instead of touching `mcp.ts` again, the implementation agent must write integration tests proving the legacy routes are dead and the new forge works.

*   **Test Case 1:** `tests/integration/mcp_legacy_purge.test.ts`
    *   *Assertion:* Sending a payload to `docgen.powerpoint.create` or `tdc.generate_presentation` MUST return a `404/Tool Not Found` error.
*   **Test Case 2:** `tests/integration/forge_sandbox.test.ts`
    *   *Assertion:* Calling `forge.artifact.generate` with `target_format='xlsx'` MUST return a file blob whose mimetype is `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
    *   *Assertion:* Calling `forge.artifact.generate` with `target_format='pptx'` MUST return a file blob whose mimetype is `application/vnd.openxmlformats-officedocument.presentationml.presentation`.

---

## 2. Omni-Canvas (CRDT & Headless Intelligence)
*Mitigates: 97KB JSON state monolith, race conditions, and lack of backend intelligence in canvas.*

**Current Status:** Integration Directive (07_OMNI_CANVAS_DIRECTIVE.md) delivered to the canvas agent.

**Verification (TDD Goal):**
*   **Test Case 1:** `src/store/crdt_sync.test.ts` (in `widgetdc-canvas-main-merge`)
    *   *Setup:* Initialize two disconnected Yjs clients with the same initial graph.
    *   *Action:* Client A deletes node 'X'. Client B modifies node 'X'.
    *   *Assertion:* Upon sync, the graph MUST resolve the conflict deterministically (e.g., node is deleted, modification is discarded) without throwing an error or corrupting the `nodes` array.
*   **Test Case 2:** `src/lib/snout_observer.test.ts`
    *   *Assertion:* Modifying a node's metadata via Yjs MUST trigger a WebSocket message to the mock RLM engine within 50ms.

---

## 3. Continuous Verification & Runtime Truth
*Mitigates: Configuration drift between Contracts and Railway production.*

**Current Status:** `scripts/railway-readback.ts` implemented and successfully verifying live Railway environments.

**Verification (TDD Goal):**
The readback script is already our test. The goal here is strict enforcement.
*   **Test Case 1:** CI/CD Pipeline Configuration (`.github/workflows/deploy.yml`)
    *   *Assertion:* The deployment workflow MUST fail and trigger a rollback if `npx tsx scripts/railway-readback.ts` exits with a non-zero status code after deployment.

---

## 4. Hardcore Algorithmic Multipliers (The Deterministic Core)
*Mitigates: Probabilistic LLM guessing, slow BFT consensus, token-limit bottlenecks during AST parsing.*

**Current Status:** TDD 05 revised. Adjudication confirmed a narrow spike for Multiplier 4 (Eigenvector/Louvain) first.

**Verification (TDD Goal):**
*   **Test Case 1:** `tests/supremacy/test_centrality_math.py` (in `widgetdc-rlm-engine`)
    *   *Setup:* Create an adjacency matrix representing a star topology (1 central node, 10 leaf nodes).
    *   *Action:* Call `calculate_centrality_metrics()`.
    *   *Assertion:* The central node MUST receive the highest Eigenvector centrality score (closest to 1.0).

---

## 5. The Guardian Runtime & Process Reconstruction
*Mitigates: Manual L2 consulting, reliance on "vibecoding" by Netcompany/others.*

**Current Status:** Contracts (`GuardianProcessMapping.json`, `RemediationStrategy.json`) generated and committed.

**Verification (TDD Goal):**
*   **Test Case 1:** `tests/integration/remediation_engine.test.ts`
    *   *Setup:* Ingest a mock legacy codebase exhibiting an "architectural_lockin" pattern.
    *   *Action:* Trigger `LogicRemediator.generatePaths()`.
    *   *Assertion:* The output MUST strictly validate against `RemediationStrategy.json` and MUST include a path tagged "SOVEREIGN".

---

## The Rule of Engagement

For any developer or agent touching WidgeTDC code today:
**DO NOT INVENT NEW ARCHITECTURE FOR THESE PROBLEMS.**
The architecture is decided. The contracts are written. Your only job is to write the failing test, write the code to pass it, and merge it.

*End of Roadmap.*
