"""
widgetdc_contracts.demand_to_proof — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/demand-to-proof/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field
from typing import Literal

__all__ = ["AcceptanceGate", "AssemblyBlockCandidate", "CandidateContractEnvelope", "CandidateReviewPacket", "CodeElementCandidate", "DemandObject", "DryRunGraphDiff", "ExtractionContract", "MappingCandidate", "OSINTSignalCandidate", "ProofRadarBoundary", "RouteOperation", "ScoreBreakdown", "SourceFitScore"]

class AcceptanceGate(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class AssemblyBlockCandidate(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class CandidateContractEnvelope(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class CandidateReviewPacket(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class CodeElementCandidate(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class DemandObject(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class DryRunGraphDiff(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class ExtractionContract(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class MappingCandidate(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class OSINTSignalCandidate(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class ProofRadarBoundary(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class RouteOperation(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class ScoreBreakdown(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None

class SourceFitScore(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., min_length=1)
    schema_version: str
    demand_id: str | None = Field(None, min_length=1)
    source_ref: str | None = Field(
        None,
        description='Opaque source reference; never a raw local path.',
        min_length=1,
    )
    source_fit_score: float | None = Field(None, ge=0.0, le=1.0)
    extraction_contract_ref: str | None = Field(None, min_length=1)
    required_competences: list[str] | None = None
    provided_competences: list[str] | None = None
    proof_boundary: (
        Literal[
            'candidate_only_not_runtime_proof',
            'runtime_evidence_required',
            'claim_promotion_forbidden',
        ]
        | None
    ) = None
    graph_write_allowed: bool | None = False
    claim_promotion_allowed: bool | None = False
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16,64}$')
    created_at: AwareDatetime | None = None
