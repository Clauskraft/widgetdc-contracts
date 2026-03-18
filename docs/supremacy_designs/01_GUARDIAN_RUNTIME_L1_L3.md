# SUPREMACY DESIGN 01: The Guardian Runtime & L1-L3 Reconstruction

**Status:** Canonical Design Draft (Disruptive)
**Stolen IP:** SAP Clean Core (Logic Reconstruction) + Apple Ferret-UI (Visual Reasoning) + Palantir (Actionable Ontology)
**Author:** Gemini (Master Architect)

## 1. Executive Summary
The Guardian Runtime eliminates the manual "L2 Sub-Process" consultant tier. Instead of humans reading legacy code to figure out what a business does, the `Snout v2` engine reads the raw L3 Execution layer (legacy ABAP, Python, Java, or UI screenshots via Ferret-UI) and *reverse-engineers* the pure L1 Business Intent. The Guardian Engine then automatically generates an optimal, sovereign, or compliant L3 replacement.

## 2. Architecture Diagram

```mermaid
graph TD
    subgraph Legacy Environment
        L3_Legacy[Legacy L3 Execution\nDirty Code / UI]
    end

    subgraph WidgeTDC Snout v2 Engine
        SAP_Logic[SAP-style Logic Extractor]
        Ferret[Apple Ferret-UI Vision Agent]
    end

    subgraph The Guardian Runtime
        L1_Intent[Reconstructed L1 Intent\nPure Business Logic]
        Remediation_Engine{Guardian Remediation Engine}
        Path_Opt[OPTIMIZED\nDeepSeek Pattern]
        Path_Sov[SOVEREIGN\nMistral Pattern]
        Path_Sec[SECURE\nASML Pattern]
        Path_Com[COMPLIANT\nNIS2 Pattern]
    end

    L3_Legacy -->|AST Parse| SAP_Logic
    L3_Legacy -->|Screen Capture| Ferret
    SAP_Logic -->|Abstracts| L1_Intent
    Ferret -->|Abstracts| L1_Intent
    L1_Intent --> Remediation_Engine
    Remediation_Engine --> Path_Opt
    Remediation_Engine --> Path_Sov
    Remediation_Engine --> Path_Sec
    Remediation_Engine --> Path_Com
```

## 3. Code & Contract Implementation

To make this actionable in our existing system, we introduce two new schemas to `widgetdc-contracts`.

### 3.1 Pydantic Spec (Python Integration)
This code lives in `python/widgetdc_contracts/consulting.py` once generated from the JSON schemas.

```python
from pydantic import BaseModel, Field
from typing import Literal, Optional
from widgetdc_contracts.consulting import DomainId, ProcessStatus

class RemediationStrategy(BaseModel):
    target_id: str = Field(..., description="The ID of the legacy node in Omni-Graph")
    strategy_path: Literal["OPTIMIZED", "COMPLIANT", "SOVEREIGN", "SECURE"]
    transformation_logic: str = Field(..., description="Generated WidgeTDC contract code to replace legacy")
    vampire_drain_potential: float = Field(..., description="Percentage of manual L2 work eliminated (0.0 - 1.0)")

class GuardianProcessMapping(BaseModel):
    domain_id: DomainId
    process_level: Literal["L1_INTENT", "L2_SUBPROCESS", "L3_EXECUTION"]
    current_status: ProcessStatus
    remediation: Optional[RemediationStrategy] = None
```

## 4. Integration into WidgeTDC Core
1.  **Ingestion:** When `MissionService` ingests a new repository, it triggers `GuardianProcessMapping`.
2.  **Analysis:** If the `process_level` is flagged as `L3_EXECUTION` and `current_status` is degraded, the RemediationStrategy is automatically populated.
3.  **Action:** The WidgeTDC UI changes from displaying a "Risk Report" to displaying "One-Click Remediation Paths".
