# SUPREMACY DESIGN 08: The Output Forge (Multi-Modal Generation Engine)

**Status:** Canonical Implementation Directive  
**Scope:** World-Class automated generation of PPTX, advanced Excel models, and business reports.  
**Stolen IP:** Alibaba Qwen-Agent (Data Interpreter), AI4Finance FinRobot, Marp / python-pptx (Template Mapping), PosterLLaVa (Layout Algorithms).  
**Author:** Gemini (Master Architect)

## 1. Executive Summary
To sell the WidgeTDC platform at the highest enterprise tiers, it is not enough to show a JSON response or a web dashboard. We must deliver the final consulting artifacts—**World-Class PowerPoint decks, deeply modeled Excel budgets, and heavily illustrated reports**—in minutes, not weeks.

The "Output Forge" replaces manual document crafting by using Agentic Data Interpreters. It treats output generation not as a text-generation problem, but as an **AST-to-Visual compilation** problem.

---

## 2. The Three Output Engines

### 2.1 The "FinRobot" Excel Engine (Financial Modeling)
We borrow the architecture from **AI4Finance's FinRobot** and **Alibaba's Qwen Data Interpreter**. We do not ask the LLM to "write a CSV." We ask it to write a Python script that builds an Excel file.

*   **The Mechanism:** The RLM uses the `openpyxl` and `pandas` Python libraries inside an air-gapped Docker sandbox. 
*   **Capabilities:** 
    *   Generates full 3-statement financial models with linked formulas (e.g., `=SUM(B2:B10)` instead of hardcoded numbers).
    *   Automatically formats cells (currency, percentages, conditional formatting).
    *   Pulls live data via API and injects it into hidden "Data" sheets, building interactive charts on a "Dashboard" sheet.
*   **WidgeTDC Value:** Instantly generate business cases and migration budgets (e.g., "Cost of moving from AWS to Sovereign Cloud") with fully editable formulas for the CFO.

### 2.2 The "Scholar DAG" PPTX Engine (Enterprise Presentations)
We discard raw text-to-slide tools. Instead, we use the **Scholar DAG** concept combined with **python-pptx Placeholder Mapping**.

*   **The Mechanism:** 
    1. **Intent Graph:** The RLM creates a DAG of the presentation's logical flow (Thesis -> Evidence -> Conclusion).
    2. **Master Templates:** We maintain highly branded, corporate `.potx` (PowerPoint Template) files containing strict Slide Masters and named placeholders.
    3. **Layout Optimization:** An algorithm (inspired by PosterLLaVa) calculates text overflow. If text exceeds bounds, the engine either splits the node into two slides or uses Python to incrementally reduce font size.
    4. **Execution:** The `python-pptx` library binds the DAG data directly to the master placeholders.
*   **WidgeTDC Value:** Decks are guaranteed to be 100% brand-compliant, pixel-perfect, and fully editable by the consulting partner.

### 2.3 The "Qwen-VL" Chart & Illustration Engine
*   **The Mechanism:** Integrating Alibaba's **Qwen Data Interpreter** pattern. When a report needs a chart, an agent writes and executes `matplotlib`, `seaborn`, or `plotly` code to generate high-resolution SVGs or PNGs.
*   **Graph Traversals:** For architectural diagrams, the agent queries our Neo4j Omni-Graph, translates the subgraph into `mermaid.js` or `Graphviz` syntax, and compiles it into a vector image to be embedded directly into the PPTX or PDF.
*   **WidgeTDC Value:** No generic stock photos. Every illustration is a deterministic representation of the client's actual data and topology.

---

## 3. Architecture Pipeline

```mermaid
graph TD
    subgraph WidgeTDC Omni-Graph
        Data[(Neo4j Graph & Telemetry)]
    end

    subgraph The Output Forge (Agentic Pipeline)
        Planner[DAG Planner Agent]
        Coder[Qwen-style Code Interpreter\nPython Sandbox]
        Renderer[Layout Engine]
    end

    subgraph Delivery Artifacts
        XLSX[Advanced Excel Model\nopenpyxl]
        PPTX[Enterprise PPTX\npython-pptx]
        PDF[Illustrated Report\nMarp / WeasyPrint]
    end

    Data --> Planner
    Planner -->|Drafts Formulas & Charts| Coder
    Planner -->|Drafts Slide Logic| Renderer
    Coder -->|Generates SVGs| Renderer
    Coder -->|Compiles| XLSX
    Renderer -->|Maps to .potx| PPTX
    Renderer -->|Markdown to PDF| PDF
```

## 4. Integration Directive for WidgeTDC

**Target Repo:** `widgetdc-rlm-engine`

1.  **Interpreter Sandbox:** Implement an execution sandbox (e.g., restricted Docker container) allowing the RLM to run `pandas`, `openpyxl`, and `matplotlib`.
2.  **Asset Templates:** Create a `templates/` directory in the backend containing our premium `.potx` (PowerPoint) and `.xltx` (Excel) masters.
3.  **MCP Tooling:** Expose new MCP tools to the swarm:
    *   `generate_excel_model(data_json, template_name)`
    *   `generate_pptx_deck(dag_json, template_name)`
    *   `generate_vector_chart(query, chart_type)`

**NO MANUAL FORMATTING. THE ENGINE OUTPUTS FINAL DRAFTS READY FOR THE BOARDROOM.**
