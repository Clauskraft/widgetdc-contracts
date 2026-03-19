# SUPREMACY DESIGN 07: The Omni-Canvas (CRDT & Headless Intelligence)

**Status:** Canonical Implementation Directive  
**Target Repo:** `widgetdc-canvas-main-merge`  
**Author:** Gemini (Master Architect)

## 1. The Core Problem
The current WidgeTDC Canvas relies on a 97KB monolithic Zustand store (`canvasStore.ts`) persisting flat JSON to localStorage. This is a single-player, conflict-prone architecture. When `LibreChat` (the conversational agent) and the user modify the canvas simultaneously, data is lost. Furthermore, the layout engine (`@dagrejs`) is blind to our business ontology.

## 2. The Solution (The "Gypsy Tricks")
We will transform the Canvas into a multi-player, agent-augmented **Visual Operating System** using three hardcore paradigms:

1.  **Conflict-Free Replicated Data Types (Yjs):** Replaces JSON state. Allows concurrent edits from the user and WidgeTDC agents without locks or lost updates.
2.  **Headless Snout v2 Observer:** An invisible React component that listens to Yjs Deltas. When a user creates an edge, the Observer silently triggers a Speculative OODA loop to predict the next logical node.
3.  **Ontological strictness:** Canvas nodes are no longer generic 'entities'. They are strictly bound to `widgetdc-contracts` (e.g., `StrategicLeverage`, `FabricController`).

---

## 3. IMPLEMENTATION DIRECTIVE (For the Canvas Agent)

**Copy-Paste this to the Building Agent in `widgetdc-canvas-main-merge`:**

> "IMPLEMENTATION DIRECTIVE: OMNI-CANVAS SUPREMACY (TDD BATCH)
> 
> **Objective:** Destroy the `canvasStore.ts` JSON monolith. Implement Yjs CRDTs, a Headless Snout v2 Observer, and strict Foundry Ontology mapping.
> 
> **Constraint:** You MUST follow Test-Driven Development. Write the failing `.test.ts` file before touching the source code.
> 
> ### Phase 1: The CRDT Heart Transplant
> 1. **Install:** `yjs`, `y-websocket`, and `zustand-yjs` (or manage Yjs state manually in Zustand).
> 2. **Test Case (`src/store/crdt.test.ts`):** 
>    - *Red:* Create two simulated Yjs clients (`docA` and `docB`) syncing via a simulated provider. Client A adds a node `StrategicLeverage`. Concurrently, Client B adds an edge connecting to it.
>    - *Green:* Assert that both states merge perfectly without overwriting.
> 3. **Implement:** Gut `canvasStore.ts`. Remove `persist` middleware. State must derive entirely from `Y.Map('nodes')` and `Y.Map('edges')`.
> 
> ### Phase 2: Headless Agent Injection
> 1. **Test Case (`src/lib/snoutObserver.test.ts`):**
>    - *Red:* Emit a Yjs delta simulating the user dragging a new `ComplianceGap` node onto the canvas.
>    - *Green:* Mock a WebSocket connection to `rlm-engine`. The Observer must catch the Yjs event, send the graph state, and inject a returned `RemediationStrategy` node into the Y.Doc within 100ms.
> 2. **Implement:** Create `src/components/SnoutObserver.tsx`. It renders `null` but hooks into `ydoc.on('update')`. It acts as the silent co-pilot.
> 
> ### Phase 3: Contract Enforcement
> 1. **Implement:** Delete the 12 generic node types. Update `src/types/canvas.ts` to import `NodeLabel` and `RelationshipType` directly from `@widgetdc/contracts/graph`.
> 2. **Implement:** Replace `@dagrejs/dagre` with a custom layout engine (`src/lib/eigenvectorLayout.ts`) that pulls high-priority nodes to the center based on edge weight.
> 
> **NO UI REDESIGN. FOCUS ONLY ON THE CRDT DATA STRUCTURE AND HEADLESS OBSERVER. GO.**"

---

## 4. Evidence of Readiness
- The `NodeLabel` and `RelationshipType` contracts are verified and ready in `@widgetdc/contracts` (v0.3.0).
- The RLM Engine is prepared to receive partial graph topologies via the `POST /api/rlm/ooda/run` endpoint (Speculative drafting).
