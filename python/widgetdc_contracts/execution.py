"""
widgetdc_contracts.execution — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/execution/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AnyUrl, AwareDatetime, BaseModel, ConfigDict, Field, RootModel
from pydantic import AnyUrl, BaseModel, ConfigDict, Field
from pydantic import AnyUrl, BaseModel, ConfigDict, Field, RootModel
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, RootModel
from pydantic import BaseModel, ConfigDict, Field
from pydantic import RootModel
from typing import Literal

__all__ = ["AdapterRole", "AdapterSelection", "ArtifactCheck", "CandidateArtifact", "EvidenceLevel", "HonestOutcome", "RequiredArtifact", "AdapterManifestSchema", "CandidateBundleSchema", "DegradationDecisionSchema", "ExecutionEnvelopeSchema", "SynthesisReceiptSchema"]

class AdapterRole(RootModel[Literal['candidate_writer', 'specialist', 'verifier']]):
    root: Literal['candidate_writer', 'specialist', 'verifier']

class AdapterSelection(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    adapter_id: str = Field(..., min_length=1)
    adapter_version: str = Field(..., min_length=1)
    role: Literal['candidate_writer', 'specialist', 'verifier']
    required: bool
    certification_ref: str = Field(..., min_length=1)

class ArtifactCheck(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    artifact_type: str = Field(..., min_length=1)
    required_count: int = Field(..., ge=0)
    observed_count: int = Field(..., ge=0)
    schema_valid: bool
    content_readable: bool

class CandidateArtifact(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    artifact_id: str = Field(..., min_length=1)
    artifact_type: str = Field(..., min_length=1)
    schema_id: AnyUrl
    content_ref: str = Field(..., min_length=1)
    content_hash: str = Field(..., min_length=1)

class EvidenceLevel(RootModel[Literal['L0', 'L1', 'L2', 'L3', 'L4', 'L5']]):
    root: Literal['L0', 'L1', 'L2', 'L3', 'L4', 'L5']

class HonestOutcome(
    RootModel[
        Literal[
            'completed_noop',
            'completed_unverified',
            'completed',
            'expected_stop',
            'failed',
        ]
    ]
):
    root: Literal[
        'completed_noop', 'completed_unverified', 'completed', 'expected_stop', 'failed'
    ]

class RequiredArtifact(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    artifact_type: str = Field(..., min_length=1)
    schema_id: AnyUrl
    minimum_count: int = Field(..., ge=0)
    required_for_completion: bool

class RequiredEnvName(RootModel[str]):
    root: str = Field(..., pattern='^[A-Z][A-Z0-9_]*$')


class HealthCheckCommandItem(RootModel[str]):
    root: str = Field(..., min_length=1)


class AdapterManifestSchema(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    field_id: Literal[
        'https://contracts.widgetdc.dev/execution/adapter-manifest.schema.json'
    ] = Field(..., alias='$id')
    adapter_id: str = Field(..., min_length=1)
    adapter_version: str = Field(..., min_length=1)
    protocol_version: Literal['1.0.0']
    supported_workflows: list[Literal['discover', 'define', 'develop', 'deliver']] = (
        Field(..., min_length=1)
    )
    supported_roles: list[Literal['candidate_writer', 'specialist', 'verifier']] = (
        Field(..., min_length=1)
    )
    input_schema_ids: list[AnyUrl]
    output_schema_ids: list[AnyUrl]
    required_env_names: list[RequiredEnvName]
    timeout_ms: int = Field(..., ge=1)
    cancellation_supported: bool
    idempotency_supported: bool
    state_scope: Literal['isolated_run', 'adapter_local']
    health_check_command: list[HealthCheckCommandItem] = Field(..., min_length=1)

class Artifact(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    artifact_id: str = Field(..., min_length=1)
    artifact_type: str = Field(..., min_length=1)
    schema_id: AnyUrl
    content_ref: str = Field(..., min_length=1)
    content_hash: str = Field(..., min_length=1)


class Warning(RootModel[str]):
    root: str = Field(..., min_length=1)


class EvidenceRef(RootModel[str]):
    root: str = Field(..., min_length=1)


class CandidateBundleSchema(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    field_id: Literal[
        'https://contracts.widgetdc.dev/execution/candidate-bundle.schema.json'
    ] = Field(..., alias='$id')
    bundle_id: str = Field(..., min_length=1)
    envelope_id: str = Field(..., min_length=1)
    adapter_id: str = Field(..., min_length=1)
    adapter_version: str = Field(..., min_length=1)
    role: Literal['candidate_writer', 'specialist', 'verifier']
    outcome: Literal[
        'completed_noop', 'completed_unverified', 'completed', 'expected_stop', 'failed'
    ]
    artifacts: list[Artifact]
    warnings: list[Warning]
    evidence_refs: list[EvidenceRef]
    started_at: AwareDatetime
    completed_at: AwareDatetime

class DegradationDecisionSchema(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    field_id: Literal[
        'https://contracts.widgetdc.dev/execution/degradation-decision.schema.json'
    ] = Field(..., alias='$id')
    decision_id: str = Field(..., min_length=1)
    envelope_id: str = Field(..., min_length=1)
    risk_class: Literal['read_only', 'source_mutation', 'governed_mutation']
    trigger: Literal[
        'missing_optional_specialist',
        'missing_required_verifier',
        'corrupt_adapter_state',
    ]
    decision: Literal[
        'continue_with_disclosed_coverage_loss',
        'assign_human_verifier',
        'isolate_adapter_and_use_native_state',
        'expected_stop',
    ]
    coverage_loss_disclosed: bool
    alternative_ref: str | None = Field(None, min_length=1)
    next_step: str = Field(..., min_length=1)
    claim_ceiling: Literal['L0', 'L1', 'L2', 'L3', 'L4', 'L5']
    created_at: AwareDatetime

class SelectedPatternId(RootModel[str]):
    root: str = Field(..., min_length=1)


class Adapter(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    adapter_id: str = Field(..., min_length=1)
    adapter_version: str = Field(..., min_length=1)
    role: Literal['candidate_writer', 'specialist', 'verifier']
    required: bool
    certification_ref: str = Field(..., min_length=1)


class RequiredArtifact(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    artifact_type: str = Field(..., min_length=1)
    schema_id: AnyUrl
    minimum_count: int = Field(..., ge=0)
    required_for_completion: bool


class StopConditionId(RootModel[str]):
    root: str = Field(..., min_length=1)


class ExecutionEnvelopeSchema(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    field_id: Literal[
        'https://contracts.widgetdc.dev/execution/execution-envelope.schema.json'
    ] = Field(..., alias='$id')
    envelope_id: str = Field(..., min_length=1)
    schema_version: Literal['1.0.0']
    task_bom_id: str = Field(..., min_length=1)
    route_envelope_ref: str = Field(..., min_length=1)
    actor_id: str = Field(..., min_length=1)
    target_repo: str = Field(..., min_length=1)
    target_head: str = Field(..., min_length=7)
    controller: Literal['wdc_native']
    workflow: Literal['discover', 'define', 'develop', 'deliver']
    risk_class: Literal['read_only', 'source_mutation', 'governed_mutation']
    selected_pattern_ids: list[SelectedPatternId] = Field(..., min_length=1)
    adapters: list[Adapter]
    required_artifacts: list[RequiredArtifact] = Field(..., min_length=1)
    degradation_policy_id: str = Field(..., min_length=1)
    stop_condition_ids: list[StopConditionId] = Field(..., min_length=1)
    claim_ceiling: Literal['L0', 'L1', 'L2', 'L3', 'L4', 'L5']
    idempotency_key: str = Field(..., min_length=16)
    created_at: AwareDatetime

class ArtifactCheck(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    artifact_type: str = Field(..., min_length=1)
    required_count: int = Field(..., ge=0)
    observed_count: int = Field(..., ge=0)
    schema_valid: bool
    content_readable: bool


class CandidateBundleRef(RootModel[str]):
    root: str = Field(..., min_length=1)


class MissingPerspective(RootModel[str]):
    root: str = Field(..., min_length=1)


class SynthesisReceiptSchema(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    field_id: Literal[
        'https://contracts.widgetdc.dev/execution/synthesis-receipt.schema.json'
    ] = Field(..., alias='$id')
    receipt_id: str = Field(..., min_length=1)
    envelope_id: str = Field(..., min_length=1)
    correlation_id: str = Field(..., min_length=1)
    outcome: Literal[
        'completed_noop', 'completed_unverified', 'completed', 'expected_stop', 'failed'
    ]
    artifact_checks: list[ArtifactCheck]
    candidate_bundle_refs: list[CandidateBundleRef]
    independent_verifier_ref: str | None = Field(None, min_length=1)
    missing_perspectives: list[MissingPerspective]
    next_step: str = Field(..., min_length=1)
    claim_level: Literal['L0', 'L1', 'L2', 'L3', 'L4', 'L5']
    event_spine_ref: str | None = Field(None, min_length=1)
    created_at: AwareDatetime
