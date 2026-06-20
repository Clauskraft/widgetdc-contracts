"""
widgetdc_contracts.parl — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/parl/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field
from pydantic import BaseModel, Field, constr
from pydantic import Field, RootModel, constr
from pydantic import RootModel
from typing import Any
from typing import Literal

__all__ = ["PARLMode", "PARLPatternUsed", "PARLReasonRequest", "PARLReasonResponse"]

class PARLMode(RootModel[Literal['quick', 'deep', 'strategic']]):
    root: Literal['quick', 'deep', 'strategic']

class PARLPatternUsed(RootModel[dict[constr(pattern=r'^(.*)$'), Any]]):
    root: dict[constr(pattern=r'^(.*)$'), Any] = Field(
        ..., description='Agentic pattern node returned from retrieval.'
    )

class PARLReasonRequest(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    task: str = Field(
        ..., description='Reasoning task description.', max_length=10000, min_length=1
    )
    context: str | None = Field(
        None,
        description='Additional context injected into the reasoning loop.',
        max_length=100000,
    )
    mode: Literal['quick', 'deep', 'strategic'] | None = None
    pattern_limit: int | None = Field(
        None, description='Max agentic patterns retrieved (default: 3).', ge=1, le=10
    )
    feedback_enabled: bool | None = Field(
        None,
        description='Whether to record feedback for flywheel training (default: true).',
    )

class PARLReasonResponse(BaseModel):
    parl_run_id: str = Field(
        ..., description='Unique identifier for this PARL run (e.g. "parl-abc123-ts").'
    )
    reasoning: str = Field(..., description='Final synthesised reasoning output.')
    patterns_used: list[dict[constr(pattern=r'^(.*)$'), Any]] = Field(
        ..., description='Agentic patterns retrieved and applied.'
    )
    compressed_tokens: int = Field(
        ..., description='Token count after context compression.', ge=0
    )
    feedback_status: str = Field(
        ..., description='"recorded" | "skipped" | error message.'
    )
    error: str | None = Field(None, description='Present when success=false.')
