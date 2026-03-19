# SUPREMACY DESIGN 04: Omniverse Business Twins (Shadow Topology)

**Status:** Design Draft with contract safety downgrade
**Stolen IP:** NVIDIA Omniverse (Digital Twins) + GraphRAG (Semantic Granularity)
**Author:** Gemini (Master Architect)

## Contract Safety Lock

`overdesign-downgrade`

- `ShadowTwinSimulation` is not a canonical contract in `widgetdc-contracts` today.
- `SimulationConstraint` is not a canonical contract in `widgetdc-contracts` today.
- No first-class schema or Python model may be added for these concepts unless a real payload exchange requires validation parity across source, schema, Python, and consuming runtime.
- Current canonical truth in this repo is narrower:
  - graph vocabulary belongs in `src/graph/*`
  - established payload schemas belong in `schemas/*`
  - design examples in this document are illustrative only until promoted by a proven runtime payload

## 1. Executive Summary
Instead of generating static slide decks to explain a company's architecture to them, WidgeTDC will build a "Shadow Business Twin". Using NVIDIA's concept of cyber-physical digital twins, we map the client's entire L1-L3 business processes into a live, queryable Neo4j property graph. We then use GraphRAG to allow stakeholders to "simulate" changes (e.g., "What happens if we shut down the legacy mainframe?") before executing them via the Fabric.

## 2. Architecture Diagram

```mermaid
graph TD
    subgraph Data Ingestion
        Logs[System Logs / Telemetry]
        Docs[Architecture Docs]
    end

    subgraph The Shadow Topology
        Snout[Snout v2 Indexer]
        Neo4j[(Neo4j Omni-Graph)]
        Twin[Digital Twin Engine]
    end

    subgraph Simulation Interface
        UI[Valhalla Command Center]
        GraphRAG[GraphRAG Simulator]
    end

    Logs --> Snout
    Docs --> Snout
    Snout -->|Extracts Entities| Neo4j
    Neo4j --> Twin
    Twin <--> GraphRAG
    GraphRAG <-->|Natural Language Query| UI
```

## 3. Code & Contract Implementation

### 3.1 Illustrative Pydantic Spec (Not Canonical Contract Truth)
The example below is design-only and must not be treated as source-of-truth schema until a real payload contract exists.

```python
from pydantic import BaseModel, Field
from typing import List

class SimulationConstraint(BaseModel):
    constraint_type: str = Field(..., description="e.g., 'MAX_DOWNTIME_MS', 'BUDGET_LIMIT'")
    threshold_value: float

class ShadowTwinSimulation(BaseModel):
    simulation_id: str
    target_graph_nodes: List[str] = Field(..., description="List of Omni-Graph Node IDs to simulate changes on")
    proposed_remediation: str = Field(..., description="The Guardian Strategy to test")
    constraints: List[SimulationConstraint]
    predicted_blast_radius: List[str] = Field(..., description="Nodes that will break if executed")
```

## 4. Integration into WidgeTDC Core
1.  **Simulation Layer:** Any future simulation payload must first prove a real runtime exchange before `ShadowTwinSimulation` can become a contract.
2.  **Visual Output:** Blast-radius visualization may exist as implementation behavior without promoting new contract objects prematurely.
