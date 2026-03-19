# SUPREMACY DESIGN 02: Speculative OODA & DAG Memory

**Status:** Canonical Design Draft (Disruptive)
**Stolen IP:** DeepSeek V3 (MTP / SCoT) + Baidu ERNIE 4.5 (Contextual Memory Virtualization) + NVIDIA/Groq (Deterministic Latency)
**Author:** Gemini (Master Architect)

## 1. Executive Summary
Traditional multi-agent systems use sequential, flat reasoning. "Speculative OODA" utilizes a small, blazing-fast draft model (Qwen 1.5B) to generate entire reasoning chains in milliseconds. Our large model (Gemini/RLM) verifies them in one pass. To prevent context loss across thousands of loops, we store memory as a Directed Acyclic Graph (DAG), allowing agents to branch tasks without losing the root context.

## 2. Architecture Diagram

```mermaid
graph TD
    subgraph The 2-Second Decision Loop
        Input[User Request / Mission]
        Router{Bayesian Router}
        Draft1[Draft Agent 1\nQwen-1.5B]
        Draft2[Draft Agent 2\nQwen-1.5B]
        Verify[Verification Gate\nGemini RLM]
    end

    subgraph DAG Memory System (Baidu CMV)
        NodeA((Root Context\nSnapshot))
        NodeB((Branch: Auth Logic))
        NodeC((Branch: DB Logic))
        NodeD((Verified Code\nSnapshot))
    end

    Input --> Router
    Router -->|Speculate Path A| Draft1
    Router -->|Speculate Path B| Draft2
    Draft1 --> Verify
    Draft2 --> Verify
    Verify -->|Commits to| NodeA
    NodeA --> NodeB
    NodeA --> NodeC
    NodeB --> NodeD
    NodeC --> NodeD
```

## 3. Code & Contract Implementation

### 3.1 Pydantic Spec (Python Integration)
Integrating DAG memory into the WidgeTDC cognitive payload.

```python
from pydantic import BaseModel, Field
from typing import List, Optional
from widgetdc_contracts.cognitive import TraceInfo

class DAGSnapshot(BaseModel):
    snapshot_id: str = Field(..., description="Unique hash of the memory state")
    parent_snapshot_id: Optional[str] = Field(None, description="Lineage connection")
    compressed_state: str = Field(..., description="Anchored summary of the context")
    active_tokens: int

class SpeculativeDraft(BaseModel):
    draft_id: str
    proposed_chain_of_thought: List[str]
    confidence_score: float

class OODAVerificationGate(BaseModel):
    trace: TraceInfo
    accepted_draft_id: str
    latency_saved_ms: int
    dag_commit: DAGSnapshot
```

## 4. Integration into WidgeTDC Core
1.  **RLM Update:** The `/api/rlm/ooda/run` endpoint is overhauled. It no longer waits for a single agent to think. It triggers 5 speculative drafts instantly.
2.  **Memory API:** `POST /cognitive/fold` is deprecated in favor of `POST /cognitive/dag/snapshot`. This creates an immutable, version-controlled history of the agent's brain.
