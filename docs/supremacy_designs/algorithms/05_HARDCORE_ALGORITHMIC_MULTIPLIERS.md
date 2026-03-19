# SUPREMACY DESIGN 05: Algorithmic Multipliers (Normalized)

**Status:** `WAIT` before execution (Multiplier 4 Spike Only)
**Canonical Repository Boundaries Enforced:**
- `widgetdc-rlm-engine`: Owner of graph_gardener.py, neo4j_mcp.py, and OODA logic.
- `widgetdc-contracts`: Owner of shared JSON/Pydantic schemas.
- `WidgeTDC`: Owner of core platform orchestration.

## 1. Targeted Spike: Multiplier 04 (Eigenvector & Louvain)
**Objective:** Replace fuzzy RAG search with mathematical SPF (Single Point of Failure) detection.

## Contract Safety Lock

`overdesign-downgrade`

- `AlgorithmicScore` is not a canonical contract in `widgetdc-contracts` today.
- No `AlgorithmicScore.json` schema should be added unless a real payload crosses repo or runtime boundaries and requires validation + Python parity.
- Current canonical truth is narrower:
  - graph labels/relationships remain graph vocabulary in `src/graph/*`
  - existing first-class payload schemas stay limited to consumed contracts such as `StrategicLeverage`, `FabricController`, and `RoutingDecision`

### Integration Path
*   **Schema (Contracts):** Do not define `AlgorithmicScore.json` until a real payload contract is proven.
*   **Logic (RLM-Engine):** Implement `calculate_centrality_metrics` in `widgetdc-rlm-engine/src/neo4j_mcp.py` using Neo4j GDS.
*   **Trigger:** `task_router.py` (Canonical) must ingest centrality scores before dispatching agents.

## 2. Preparatory Design: Multiplier 01 (E-Graphs)
**Objective:** Factor-100x token reduction via Equality Saturation.

### Integration Path
*   **Target:** `widgetdc-rlm-engine/src/graph_gardener.py`.
*   **Action:** Pre-process Tree-sitter ASTs through Rust `egg` bindings before LLM reasoning.

## 3. Deferred Architecture Waves (Future Implementation)
The following multipliers are classified as **Platform Waves** and are currently on `WAIT` pending cross-repo synchronization:
*   **Narwhal/Bullshark (Consensus):** High-frequency BFT swarm consensus.
*   **MCTS + PRM (Reasoning):** Step-wise tree search for OODA loops.
*   **Delta-CRDTs (Memory):** Conflict-free horizontal swarm memory.


---

**FINAL VERDICT:**
By implementing these five multipliers, WidgeTDC moves beyond "AI Chat" and becomes a **National-Scale Deterministic Infrastructure Engine**. We don't guess the architecture; we compute it.

**Core Sentence:**
Snout v2 discovers and normalizes knowledge. LegoFactory decides what is promotable. **The Algorithmic Multipliers execute it with mathematical certainty.** 🏴‍☠️🔥🏦🥚📉
