"""
widgetdc_contracts.decision_bom — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/decision-bom/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, RootModel
from pydantic import BaseModel
from pydantic import BaseModel, ConfigDict, Field
from pydantic import BaseModel, constr
from pydantic import Field, RootModel
from pydantic import RootModel
from typing import Any
from typing import Literal

__all__ = ["BOMDataClass", "BOMDecisionType", "BOMItem", "BOMItemType", "BOMJurisdictionPolicy", "BOMMethod", "BOMValidationStatus", "ConfigurationSnapshot", "ConfigurationSnapshotApproval", "ConfigurationSnapshotDerivedArtifact", "ConfigurationSnapshotItem", "ConfigurationSnapshotType", "LlmAgnosticResponse", "OutputFormat", "PhantomBOMComposeRequest", "PhantomBOMFramework", "PhantomBOMResponse", "PhantomBOMRouteRequest", "WorkArtifact", "WorkArtifactType", "WorkArtifactVerificationStatus"]

class BOMDataClass(RootModel[Literal['pii', 'confidential', 'public', 'legal']]):
    root: Literal['pii', 'confidential', 'public', 'legal']

class BOMDecisionType(
    RootModel[
        Literal[
            'method_selection',
            'provider_selection',
            'knowledge_pack_selection',
            'fold_strategy',
            'tool_selection',
            'verification_step',
            'skill_route',
        ]
    ]
):
    root: Literal[
        'method_selection',
        'provider_selection',
        'knowledge_pack_selection',
        'fold_strategy',
        'tool_selection',
        'verification_step',
        'skill_route',
    ]

class BOMItem(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(
        ...,
        description='Globally unique BOMItem id.',
        pattern='^bomitem-[a-zA-Z0-9-]{8,}$',
    )
    bom_run_id: str = Field(
        ...,
        description='Parent PhantomBOMRun id (HAS_ITEM edge).',
        pattern='^bomrun-[a-zA-Z0-9-]{8,}$',
    )
    item_type: Literal[
        'provider_call',
        'grounding',
        'compression',
        'routing',
        'tool_invocation',
        'synthesis',
        'verification',
        'skill_selection',
    ]
    decision_type: Literal[
        'method_selection',
        'provider_selection',
        'knowledge_pack_selection',
        'fold_strategy',
        'tool_selection',
        'verification_step',
        'skill_route',
    ]
    data_class: Literal['pii', 'confidential', 'public', 'legal'] | None = None
    authority_requirement: Literal['regulator', 'internal', 'none'] | None = None
    policy_requirement: str = Field(
        ...,
        description='Policy bundle id this item is bound to (empty only if data_class=public).',
    )
    jurisdiction_policy: (
        Literal['EU_ONLY', 'DK_ONLY', 'NO_CN', 'NO_US', 'LOCAL_ONLY', 'NONE'] | None
    ) = None
    method_selected: Literal['RLM', 'RAG', 'Folding', 'LLM', 'MCP']
    method_reason: str = Field(
        ...,
        description='Rationale chain (e.g. "compliance_required → RLM").',
        min_length=1,
    )
    applied_rules: list[str] | None = Field(
        None, description='Ordered MethodSelector rules that fired.'
    )
    sovereignty_enforced: bool | None = Field(
        None,
        description='True if MethodSelector forced fallback due to data_class/jurisdiction.',
    )
    allowed_methods: list[Literal['RLM', 'RAG', 'Folding', 'LLM', 'MCP']] | None = None
    allowed_providers: list[str] | None = None
    denied_providers: list[str] | None = None
    estimated_input_tokens: int | None = Field(None, ge=0)
    source_grounded_required: bool | None = None
    evidence_hash: str | None = Field(
        None,
        description='16-char sha256 prefix of canonical evidence (RFC 8785).',
        pattern='^sha256:[a-f0-9]{16}$',
    )
    signature: str | None = Field(
        None,
        description='Ed25519 signature (RFC 8032). Empty until ToolContractSigner finalises.',
    )
    signing_pubkey_id: str | None = None
    signature_domain: str | None = Field(
        None, description='Default: "widgetdc.bom-item.v1".'
    )
    canonicalization_version: str | None = Field(
        None, description='Default: "jcs-rfc8785-v1".'
    )
    validation_status: Literal['pending', 'passed', 'failed', 'skipped']
    resolved: bool | None = Field(
        None,
        description='True after a typed edge is wired (RESOLVED_BY/ROUTED_BY/etc.).',
    )
    workflow_id: str | None = None
    plan_id: str | None = None
    correlation_id: str | None = Field(
        None, description='ALWAYS required for event spine emission.'
    )
    actor_id: str | None = None
    created_at: AwareDatetime | None = None
    last_audited: AwareDatetime | None = None

class BOMItemType(
    RootModel[
        Literal[
            'provider_call',
            'grounding',
            'compression',
            'routing',
            'tool_invocation',
            'synthesis',
            'verification',
            'skill_selection',
        ]
    ]
):
    root: Literal[
        'provider_call',
        'grounding',
        'compression',
        'routing',
        'tool_invocation',
        'synthesis',
        'verification',
        'skill_selection',
    ]

class BOMJurisdictionPolicy(
    RootModel[Literal['EU_ONLY', 'DK_ONLY', 'NO_CN', 'NO_US', 'LOCAL_ONLY', 'NONE']]
):
    root: Literal['EU_ONLY', 'DK_ONLY', 'NO_CN', 'NO_US', 'LOCAL_ONLY', 'NONE']

class BOMMethod(RootModel[Literal['RLM', 'RAG', 'Folding', 'LLM', 'MCP']]):
    root: Literal['RLM', 'RAG', 'Folding', 'LLM', 'MCP']

class BOMValidationStatus(RootModel[Literal['pending', 'passed', 'failed', 'skipped']]):
    root: Literal['pending', 'passed', 'failed', 'skipped']

class Item(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    bom_item_id: str = Field(..., pattern='^bomitem-[a-zA-Z0-9-]{8,}$')
    method_selected: Literal['RLM', 'RAG', 'Folding', 'LLM', 'MCP']
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16}$')
    validation_status: Literal['pending', 'passed', 'failed', 'skipped'] | None = None


class DerivedArtifact(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    artifact_id: str
    artifact_type: Literal[
        'document', 'decision', 'deliverable', 'config_bundle', 'code_patch', 'report'
    ]
    uri: str | None = None
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16}$')


class Approval(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    approver_id: str
    approval_type: Literal[
        'operator',
        'hyperagent',
        'policy_engine',
        'compliance_officer',
        'claim_promotion',
    ]
    approval_token: str | None = Field(
        None,
        description='Opaque token bound to snapshot id. Required for L3 promotions.',
    )
    approved_at: AwareDatetime


class ConfigurationSnapshot(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., pattern='^configsnap-[a-zA-Z0-9-]{8,}$')
    snapshot_type: Literal['session', 'release', 'tenant', 'demo']
    tenant_id: str | None = None
    feature_model_version: str = Field(
        ..., description='Pin of :FeatureModel{version} (FODA-style feature tree).'
    )
    rule_set_version: str = Field(..., description='Pin of MethodSelector ruleset.')
    route_template_version: str = Field(
        ..., description='Pin of :RouteTemplate{version}.'
    )
    bom_run_id: str = Field(..., pattern='^bomrun-[a-zA-Z0-9-]{8,}$')
    items: list[Item] = Field(
        ..., description='Resolution invariant requires ≥1 BOMItem.', min_length=1
    )
    derived_artifacts: list[DerivedArtifact] | None = None
    approvals: list[Approval] | None = None
    policy_profile: str | None = None
    jurisdiction_policy: (
        Literal['EU_ONLY', 'DK_ONLY', 'NO_CN', 'NO_US', 'LOCAL_ONLY', 'NONE'] | None
    ) = None
    data_class: Literal['pii', 'confidential', 'public', 'legal'] | None = None
    snapshot_hash: str = Field(
        ...,
        description='Full sha256 of canonical payload (RFC 8785 JCS).',
        pattern='^sha256:[a-f0-9]{64}$',
    )
    canonicalization_version: str = Field(..., description='Default: "jcs-rfc8785-v1".')
    signature: str | None = Field(None, description='Ed25519 over snapshot_hash.')
    signing_pubkey_id: str | None = None
    signature_domain: str = Field(
        ..., description='Default: "widgetdc.config-snapshot.v1".'
    )
    previous_snapshot_id: str | None = Field(
        None, pattern='^configsnap-[a-zA-Z0-9-]{8,}$'
    )
    supersedes_reason: str | None = None
    verify_endpoint: str | None = None
    workflow_id: str | None = None
    plan_id: str | None = None
    correlation_id: str | None = None
    actor_id: str | None = None
    created_at: AwareDatetime
    compile_started_at: AwareDatetime | None = None
    last_verified_at: AwareDatetime | None = None

class ConfigurationSnapshotApproval(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    approver_id: str
    approval_type: Literal[
        'operator',
        'hyperagent',
        'policy_engine',
        'compliance_officer',
        'claim_promotion',
    ]
    approval_token: str | None = Field(
        None,
        description='Opaque token bound to snapshot id. Required for L3 promotions.',
    )
    approved_at: AwareDatetime

class ConfigurationSnapshotDerivedArtifact(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    artifact_id: str
    artifact_type: Literal[
        'document', 'decision', 'deliverable', 'config_bundle', 'code_patch', 'report'
    ]
    uri: str | None = None
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16}$')

class ConfigurationSnapshotItem(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    bom_item_id: str = Field(..., pattern='^bomitem-[a-zA-Z0-9-]{8,}$')
    method_selected: Literal['RLM', 'RAG', 'Folding', 'LLM', 'MCP']
    evidence_hash: str | None = Field(None, pattern='^sha256:[a-f0-9]{16}$')
    validation_status: Literal['pending', 'passed', 'failed', 'skipped'] | None = None

class ConfigurationSnapshotType(
    RootModel[Literal['session', 'release', 'tenant', 'demo']]
):
    root: Literal['session', 'release', 'tenant', 'demo']

class LlmAgnosticResponse(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    content: str = Field(
        ..., description='Produced content. Format is declared in `format`.'
    )
    format: Literal['html', 'markdown', 'json', 'pptx', 'docx', 'text'] = Field(
        ..., description='Wire format of the produced content.'
    )
    provider_used: str = Field(
        ..., description='ProviderId of the provider that succeeded.'
    )
    task_type: str = Field(..., description='TaskType used for LlmMatrix routing.')
    model_used: str | None = Field(
        None, description='Specific model name that succeeded.'
    )
    latency_ms: int | None = Field(None, ge=0)
    bom_item_id: str | None = Field(
        None, description='BOMItem ID if this response was persisted to the graph.'
    )
    correlation_id: str | None = None

class OutputFormat(
    RootModel[Literal['html', 'markdown', 'json', 'pptx', 'docx', 'text']]
):
    root: Literal['html', 'markdown', 'json', 'pptx', 'docx', 'text'] = Field(
        ..., description='Wire format of the produced content.'
    )

class PhantomBOMComposeRequest(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    framework: Literal['MECE', 'HDR', 'Pyramid', 'STRIDE'] = Field(
        ..., description='Decomposition framework used by the BOM compiler.'
    )
    brief: str = Field(
        ..., description='Decision brief to decompose.', max_length=2000, min_length=1
    )
    correlation_id: str | None = Field(
        None, description='Passed through to event spine.', max_length=120
    )
    max_items: int | None = Field(
        None, description='Max BOM items to emit (default: 12).', ge=1, le=20
    )

class PhantomBOMFramework(RootModel[Literal['MECE', 'HDR', 'Pyramid', 'STRIDE']]):
    root: Literal['MECE', 'HDR', 'Pyramid', 'STRIDE'] = Field(
        ..., description='Decomposition framework used by the BOM compiler.'
    )

class PhantomBOMResponse(BaseModel):
    success: bool
    data: dict[constr(pattern=r'^(.*)$'), Any]
    metadata: dict[constr(pattern=r'^(.*)$'), Any]

class PhantomBOMRouteRequest(BaseModel):
    pass

class LineageChainItem(RootModel[str]):
    root: str = Field(..., pattern='^bomitem-[a-zA-Z0-9-]{8,}$')


class WorkArtifact(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    id: str = Field(..., pattern='^artifact-[a-zA-Z0-9-]{8,}$')
    artifact_type: Literal[
        'document',
        'decision',
        'deliverable',
        'config_bundle',
        'code_patch',
        'report',
        'graph_snapshot',
        'compliance_evidence',
        'audit_log',
    ]
    bom_run_id: str = Field(..., pattern='^bomrun-[a-zA-Z0-9-]{8,}$')
    produced_by_bom_item_id: str | None = Field(
        None, pattern='^bomitem-[a-zA-Z0-9-]{8,}$'
    )
    name: str | None = None
    uri: str | None = Field(
        None,
        description='Body location (s3://, github://, graph://). Never inline body.',
    )
    mime_type: str | None = None
    size_bytes: int | None = Field(None, ge=0)
    data_class: Literal['pii', 'confidential', 'public', 'legal'] | None = None
    policy_profile: str | None = None
    evidence_hash: str = Field(
        ...,
        description='Full sha256 of canonical payload (RFC 8785 JCS).',
        pattern='^sha256:[a-f0-9]{64}$',
    )
    canonicalization_version: str = Field(..., description='Default: "jcs-rfc8785-v1".')
    signature: str | None = Field(None, description='Ed25519 signature (RFC 8032).')
    signing_pubkey_id: str | None = None
    signature_domain: str = Field(
        ..., description='Default: "widgetdc.work-artifact.v1".'
    )
    verification_status: (
        Literal['pending', 'verified', 'failed', 'expired', 'revoked'] | None
    ) = None
    last_verified_at: AwareDatetime | None = None
    verifier_id: str | None = None
    expires_at: AwareDatetime | None = None
    supersedes_artifact_id: str | None = Field(
        None, pattern='^artifact-[a-zA-Z0-9-]{8,}$'
    )
    lineage_chain: list[LineageChainItem] | None = None
    workflow_id: str | None = None
    plan_id: str | None = None
    correlation_id: str | None = None
    actor_id: str | None = None
    created_at: AwareDatetime
    signed_at: AwareDatetime | None = None

class WorkArtifactType(
    RootModel[
        Literal[
            'document',
            'decision',
            'deliverable',
            'config_bundle',
            'code_patch',
            'report',
            'graph_snapshot',
            'compliance_evidence',
            'audit_log',
        ]
    ]
):
    root: Literal[
        'document',
        'decision',
        'deliverable',
        'config_bundle',
        'code_patch',
        'report',
        'graph_snapshot',
        'compliance_evidence',
        'audit_log',
    ]

class WorkArtifactVerificationStatus(
    RootModel[Literal['pending', 'verified', 'failed', 'expired', 'revoked']]
):
    root: Literal['pending', 'verified', 'failed', 'expired', 'revoked']
