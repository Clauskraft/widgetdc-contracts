# WIDGETDC INTEGRATION MANIFEST: SUPREMACY BATCH 08 (THE OUTPUT FORGE)

**Date:** 2026-03-19
**Source Branch:** `innovation/dominance-armory` (Repo: `widgetdc-contracts`)
**Target Repos:** `WidgeTDC` (Backend Control Plane) & `widgetdc-rlm-engine` (Generation Sandbox)
**Status:** READY FOR PROMPT-DRIVEN IMPLEMENTATION

## 1. Architectural Review of the Current System

A deep audit of the `WidgeTDC` backend reveals a fragmented and legacy-driven document generation pipeline:

### Current Routes & Handlers (The Legacy Monolith)
*   **`docgen.excel.create` / `docgen.powerpoint.create`:** Located in `apps/backend/src/mcp/toolHandlers.ts`. These are basic string-templating or library-wrapper tools. They treat Excel and PPTX as passive output files, not computational models.
*   **`tdc.generate_presentation`:** Located in `apps/backend/src/mcp/tdcHandlers.ts`. Calls `tdcService.generateSolutionPPT`. This is a hardcoded, brittle path that lacks RLM's deep reasoning.
*   **`docgen.foundry.render`:** A newer attempt at unified rendering, but it still relies on Node.js-side construction (`PptxGenJS` or similar) rather than utilizing the Python ecosystem's vastly superior analytical libraries (`pandas`, `openpyxl`, `python-pptx`).

### The Flaw
The current system asks the LLM to output text, and then a static Node.js script tries to format that text into a slide or spreadsheet. This creates "Visual Drift" (text overflowing slides) and breaks financial models (outputting static numbers instead of Excel formulas).

## 2. The Supremacy Integration Design

We are ripping out the Node.js formatting logic and moving all generation to the **RLM Engine's Python Sandbox**. We use the **Alibaba Qwen Data Interpreter** pattern.

### The Unified Path (One Engine to Rule Them All)
1.  **Deprecation:** Delete `tdcHandlers.ts` presentation logic and remove `docgen.*.create` from `apps/backend/src/bootstrap/mcp.ts`.
2.  **The New Route:** Create a single, unified MCP tool: `forge.artifact.generate`.
3.  **The RLM Sandbox:** When `forge.artifact.generate` is called, `masterAgentBridge.ts` delegates the task to the RLM Engine via `POST /api/rlm/ooda/run` with the intent `generate_artifact`.
4.  **The Python Execution:** 
    *   For **Excel**, the RLM agent writes a Python script using `openpyxl` that generates the spreadsheet *with formulas and formatting*, executes it in the sandbox, and returns the binary.
    *   For **PPTX**, the RLM agent generates a **Scholar DAG**, applies the PosterLLaVa text-fitting algorithm, and compiles it via `python-pptx` against a corporate `.potx` master template.

### Folding & RAG Perspective
*   **RAG:** Before generating an artifact, the RLM *must* pull the context via `GraphRAG` from Neo4j (e.g., pulling the exact `StrategicLeverage` nodes for a business case).
*   **Folding:** Generating a 30-slide deck requires massive context. The RLM must use `POST /cognitive/fold` (or our new DAG memory) to compress research steps before initiating the Python generation script, ensuring the generator prompt doesn't exceed token limits.

---

## 3. Implementation Prompt (For the Building Agent)

**Copy-Paste this to the Building Agent in the `WidgeTDC` repository:**

> "IMPLEMENTATION DIRECTIVE: SUPREMACY BATCH 08 (THE OUTPUT FORGE)
>
> **Objective:** Demolish the fragmented Node.js document generators and establish the Python-backed Output Forge as the single, canonical artifact generator.
>
> 1. **Purge the Legacy:** In `apps/backend/src/bootstrap/mcp.ts`, unregister `docgen.powerpoint.create`, `docgen.excel.create`, and `tdc.generate_presentation`. Delete the underlying logic in `toolHandlers.ts` and `tdcHandlers.ts`. There can be only ONE generation path.
> 2. **Register The Forge:** Register a new MCP tool: `forge.artifact.generate`. This tool must delegate the request directly to the Python RLM engine via `POST /api/rlm/ooda/run` using a new `artifact_forge` execution intent.
> 3. **RLM Engine Implementation (`widgetdc-rlm-engine`):**
>    - Create `services/rlm-engine/src/forge_sandbox.py`.
>    - **Excel:** Implement the FinRobot pattern. The agent must write and execute Python code using `pandas` and `openpyxl` to build spreadsheets with *live formulas*, not static text.
>    - **PPTX:** Implement the Scholar DAG pattern using `python-pptx`. The agent must map graph data into pre-defined `.potx` master templates and calculate text overflow automatically.
> 4. **Memory & RAG:** The Forge MUST execute a `GraphRAG` query to fetch the canonical context before generating. It must also utilize context folding (`/cognitive/fold`) to compress the research before feeding it to the Python generation sandbox.
> 5. **Verification:** Ensure `masterAgentBridge.integration.test.ts` is updated to verify the new `forge.artifact.generate` tool returns a valid binary blob or download link.
>
> **NO NODE.JS STRING-TO-PPTX HACKS. ALL GENERATION MUST HAPPEN VIA AST-TO-VISUAL COMPILATION IN PYTHON. GO.**"

---

## 4. Evidence of Readiness
- Integration points mapped to existing `mcp.ts` legacy handlers.
- RLM Engine capabilities (`POST /api/rlm/ooda/run`) correctly targeted for the Python sandbox execution.
- Canonical compliance maintained: No bypasses of the RLM governance loop.