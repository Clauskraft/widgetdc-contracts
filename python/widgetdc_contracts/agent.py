"""
widgetdc_contracts.agent — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/agent/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import Field, RootModel
from typing import Literal

__all__ = ["AgentPersona", "AgentTier", "SignalType"]

class AgentPersona(
    RootModel[
        Literal[
            'RESEARCHER',
            'ENGINEER',
            'CUSTODIAN',
            'ARCHITECT',
            'SENTINEL',
            'ARCHIVIST',
            'HARVESTER',
            'ANALYST',
            'INTEGRATOR',
            'TESTER',
        ]
    ]
):
    root: Literal[
        'RESEARCHER',
        'ENGINEER',
        'CUSTODIAN',
        'ARCHITECT',
        'SENTINEL',
        'ARCHIVIST',
        'HARVESTER',
        'ANALYST',
        'INTEGRATOR',
        'TESTER',
    ] = Field(..., description='RLM Engine agent persona')

class AgentTier(
    RootModel[Literal['ANALYST', 'ASSOCIATE', 'MANAGER', 'PARTNER', 'ARCHITECT']]
):
    root: Literal['ANALYST', 'ASSOCIATE', 'MANAGER', 'PARTNER', 'ARCHITECT'] = Field(
        ..., description='Consulting agent tier (ascending autonomy)'
    )

class SignalType(
    RootModel[
        Literal[
            'task_started',
            'task_completed',
            'task_failed',
            'escalation',
            'quality_gate',
            'tool_executed',
            'deliverable_generated',
            'insight',
            'warning',
        ]
    ]
):
    root: Literal[
        'task_started',
        'task_completed',
        'task_failed',
        'escalation',
        'quality_gate',
        'tool_executed',
        'deliverable_generated',
        'insight',
        'warning',
    ] = Field(..., description='Agent signal event type')

