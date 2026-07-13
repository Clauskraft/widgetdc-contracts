"""
widgetdc_contracts.continuation — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/continuation/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, RootModel
from pydantic import BaseModel, ConfigDict, Field
from pydantic import BaseModel, ConfigDict, Field, RootModel
from pydantic import RootModel
from typing import Literal

__all__ = ["BlockerClassification", "ContinuationBlocker", "ContinuationPhase", "ContinuationReceipt", "ContinuationRequest", "ContinuationState", "ExecutedSafeAction", "HumanOnlyGate", "NextSafeAction", "PendingSafeAction", "StaleSafeAction"]

class BlockerClassification(
    RootModel[
        Literal[
            'AUTO_RESOLVABLE',
            'SAFE_CONTINUE',
            'HUMAN_IDENTITY_REQUIRED',
            'EXACT_APPROVAL_REQUIRED',
            'OWNER_SECRET_ACTION',
            'DESTRUCTIVE_ACTION_APPROVAL',
            'UNRESOLVABLE_CONFLICT',
        ]
    ]
):
    root: Literal[
        'AUTO_RESOLVABLE',
        'SAFE_CONTINUE',
        'HUMAN_IDENTITY_REQUIRED',
        'EXACT_APPROVAL_REQUIRED',
        'OWNER_SECRET_ACTION',
        'DESTRUCTIVE_ACTION_APPROVAL',
        'UNRESOLVABLE_CONFLICT',
    ]

class BlocksActionId(RootModel[str]):
    root: str = Field(..., min_length=1)


class ContinuationBlocker(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    blocker_id: str = Field(..., min_length=1)
    classification: Literal[
        'AUTO_RESOLVABLE',
        'SAFE_CONTINUE',
        'HUMAN_IDENTITY_REQUIRED',
        'EXACT_APPROVAL_REQUIRED',
        'OWNER_SECRET_ACTION',
        'DESTRUCTIVE_ACTION_APPROVAL',
        'UNRESOLVABLE_CONFLICT',
    ]
    description: str = Field(..., min_length=1)
    blocks_action_ids: list[BlocksActionId] = Field(..., min_length=1)
    evidence_ref: str = Field(..., min_length=1)

class ContinuationPhase(
    RootModel[
        Literal[
            'active',
            'authority_changed',
            'rehydration_required',
            'replanning',
            'executing_safe_actions',
            'waiting_for_human',
            'blocked',
            'complete',
        ]
    ]
):
    root: Literal[
        'active',
        'authority_changed',
        'rehydration_required',
        'replanning',
        'executing_safe_actions',
        'waiting_for_human',
        'blocked',
        'complete',
    ]

class SafeActionsDiscovered(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    action_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    action_type: Literal[
        'rehydrate', 'replan', 'inspect', 'verify', 'resume', 'closeout'
    ]
    authority_ref: str = Field(..., min_length=1)
    status: Literal['pending']
    executable: Literal[True]


class SafeActionsDiscovered1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    action_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    action_type: Literal[
        'rehydrate', 'replan', 'inspect', 'verify', 'resume', 'closeout'
    ]
    authority_ref: str = Field(..., min_length=1)
    status: Literal['executed']
    executable: Literal[False]
    executed_at: AwareDatetime


class SafeActionsDiscovered2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    action_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    action_type: Literal[
        'rehydrate', 'replan', 'inspect', 'verify', 'resume', 'closeout'
    ]
    authority_ref: str = Field(..., min_length=1)
    status: Literal['stale']
    executable: Literal[False]
    stale_reason: str = Field(..., min_length=1)


class SafeActionsExecutedItem(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    action_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    action_type: Literal[
        'rehydrate', 'replan', 'inspect', 'verify', 'resume', 'closeout'
    ]
    authority_ref: str = Field(..., min_length=1)
    status: Literal['executed']
    executable: Literal[False]
    executed_at: AwareDatetime


class UnexecutedSafeAction(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    action_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    action_type: Literal[
        'rehydrate', 'replan', 'inspect', 'verify', 'resume', 'closeout'
    ]
    authority_ref: str = Field(..., min_length=1)
    status: Literal['pending']
    executable: Literal[True]


class HumanOnlyGate(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    gate_id: str = Field(..., min_length=1)
    gate_type: Literal[
        'oauth_consent',
        'identity_verification',
        'owner_secret_action',
        'destructive_action_approval',
    ]
    status: Literal['waiting', 'satisfied', 'expired']
    required_actor: str = Field(..., min_length=1)
    prompt: str = Field(..., min_length=1)
    resume_action_id: str = Field(..., min_length=1)
    created_at: AwareDatetime
    satisfied_at: AwareDatetime | None = None


class BlocksActionId(RootModel[str]):
    root: str = Field(..., min_length=1)


class Blocker(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    blocker_id: str = Field(..., min_length=1)
    classification: Literal[
        'AUTO_RESOLVABLE',
        'SAFE_CONTINUE',
        'HUMAN_IDENTITY_REQUIRED',
        'EXACT_APPROVAL_REQUIRED',
        'OWNER_SECRET_ACTION',
        'DESTRUCTIVE_ACTION_APPROVAL',
        'UNRESOLVABLE_CONFLICT',
    ]
    description: str = Field(..., min_length=1)
    blocks_action_ids: list[BlocksActionId] = Field(..., min_length=1)
    evidence_ref: str = Field(..., min_length=1)


class ContinuationReceipt(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.continuation_receipt.v1']
    receipt_id: str = Field(..., min_length=1)
    continuation_id: str = Field(..., min_length=1)
    current_authority_ref: str = Field(..., min_length=1)
    continuation_status: Literal[
        'continued', 'waiting_for_human', 'blocked', 'complete'
    ]
    safe_actions_discovered: list[
        SafeActionsDiscovered | SafeActionsDiscovered1 | SafeActionsDiscovered2
    ]
    safe_actions_executed: list[SafeActionsExecutedItem]
    unexecuted_safe_actions: list[UnexecutedSafeAction]
    human_only_gates: list[HumanOnlyGate]
    blockers: list[Blocker]
    created_at: AwareDatetime

class ContinuationRequest(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.continuation_request.v1']
    continuation_id: str = Field(..., min_length=1)
    authority_ref: str = Field(..., min_length=1)
    requested_at: AwareDatetime

class NextSafeActionId(RootModel[str]):
    root: str = Field(..., min_length=1)


class ContinuationState(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.continuation_state.v1']
    continuation_id: str = Field(..., min_length=1)
    phase: Literal[
        'active',
        'authority_changed',
        'rehydration_required',
        'replanning',
        'executing_safe_actions',
        'waiting_for_human',
        'blocked',
        'complete',
    ]
    current_authority_ref: str = Field(..., min_length=1)
    previous_authority_ref: str | None = Field(None, min_length=1)
    next_safe_action_ids: list[NextSafeActionId]
    active_human_gate_id: str | None = Field(None, min_length=1)
    updated_at: AwareDatetime

class ExecutedSafeAction(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    action_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    action_type: Literal[
        'rehydrate', 'replan', 'inspect', 'verify', 'resume', 'closeout'
    ]
    authority_ref: str = Field(..., min_length=1)
    status: Literal['executed']
    executable: Literal[False]
    executed_at: AwareDatetime

class HumanOnlyGate(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    gate_id: str = Field(..., min_length=1)
    gate_type: Literal[
        'oauth_consent',
        'identity_verification',
        'owner_secret_action',
        'destructive_action_approval',
    ]
    status: Literal['waiting', 'satisfied', 'expired']
    required_actor: str = Field(..., min_length=1)
    prompt: str = Field(..., min_length=1)
    resume_action_id: str = Field(..., min_length=1)
    created_at: AwareDatetime
    satisfied_at: AwareDatetime | None = None

class NextSafeAction1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    action_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    action_type: Literal[
        'rehydrate', 'replan', 'inspect', 'verify', 'resume', 'closeout'
    ]
    authority_ref: str = Field(..., min_length=1)
    status: Literal['pending']
    executable: Literal[True]


class NextSafeAction2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    action_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    action_type: Literal[
        'rehydrate', 'replan', 'inspect', 'verify', 'resume', 'closeout'
    ]
    authority_ref: str = Field(..., min_length=1)
    status: Literal['executed']
    executable: Literal[False]
    executed_at: AwareDatetime


class NextSafeAction3(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    action_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    action_type: Literal[
        'rehydrate', 'replan', 'inspect', 'verify', 'resume', 'closeout'
    ]
    authority_ref: str = Field(..., min_length=1)
    status: Literal['stale']
    executable: Literal[False]
    stale_reason: str = Field(..., min_length=1)


class NextSafeAction(RootModel[NextSafeAction1 | NextSafeAction2 | NextSafeAction3]):
    root: NextSafeAction1 | NextSafeAction2 | NextSafeAction3

class PendingSafeAction(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    action_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    action_type: Literal[
        'rehydrate', 'replan', 'inspect', 'verify', 'resume', 'closeout'
    ]
    authority_ref: str = Field(..., min_length=1)
    status: Literal['pending']
    executable: Literal[True]

class StaleSafeAction(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    action_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    action_type: Literal[
        'rehydrate', 'replan', 'inspect', 'verify', 'resume', 'closeout'
    ]
    authority_ref: str = Field(..., min_length=1)
    status: Literal['stale']
    executable: Literal[False]
    stale_reason: str = Field(..., min_length=1)
