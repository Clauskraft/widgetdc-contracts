"""
widgetdc_contracts.decision_bom — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/decision-bom/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, RootModel
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, constr
from pydantic import AwareDatetime, BaseModel, Field
from pydantic import BaseModel
from pydantic import BaseModel, ConfigDict, Field
from pydantic import BaseModel, Field
from pydantic import BaseModel, Field, constr
from pydantic import BaseModel, constr
from pydantic import Field, RootModel
from pydantic import RootModel
from typing import Any
from typing import Any, Literal
from typing import Literal

__all__ = ["BOMDataClass", "BOMDecisionType", "BOMItem", "BOMItemType", "BOMJurisdictionPolicy", "BOMMethod", "BOMValidationStatus", "BitemporalAnchor", "BlockEconomics", "BlockModality", "ConfigurationSnapshot", "ConfigurationSnapshotApproval", "ConfigurationSnapshotDerivedArtifact", "ConfigurationSnapshotItem", "ConfigurationSnapshotType", "EpistemicConfidence", "LlmAgnosticResponse", "MarketSignalSpecifics", "NormativeEvaluationEngine", "NormativePolicySpecifics", "OutputFormat", "PhantomBOMComposeRequest", "PhantomBOMFramework", "PhantomBOMResponse", "PhantomBOMRouteRequest", "PortContract", "UniversalAssemblyBlock", "WorkArtifact", "WorkArtifactType", "WorkArtifactVerificationStatus"]

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

class BitemporalAnchor(BaseModel):
    valid_from: AwareDatetime = Field(
        ...,
        description='When this fact became valid in the real world (T_valid start).',
    )
    valid_to: AwareDatetime | None = Field(
        None, description='When this fact ceases to be valid (T_valid end).'
    )
    recorded_at: AwareDatetime = Field(
        ..., description='When this fact was transacted/recorded in the system (T_tx).'
    )
    refresh_cadence: Literal[
        'realtime_stream',
        'hourly_tick',
        'daily_close',
        'event_driven',
        'static_immutable',
    ]
    ttl_seconds: int | None = Field(
        None, description='Expected time-to-live before revalidation is required.', ge=0
    )
    max_staleness_seconds: int = Field(
        ...,
        description='Ratchet 2: Hard ceiling. If (T_now - T_valid) > max_staleness_seconds, execution must fail-closed.',
        ge=1,
    )

class BlockEconomics(BaseModel):
    currency: str = Field(..., description='Settlement currency (ISO 4217).')
    marginal_cost_unit: float = Field(
        ...,
        description='Marginal execution cost per call in specified currency.',
        ge=0.0,
    )
    compute_latency_ms_p95: float = Field(
        ..., description='P95 expected latency in milliseconds.', ge=0.0
    )
    estimated_tokens: int | None = Field(
        None, description='Token budget if LLM/cognitive reasoning is involved.', ge=0
    )
    marginal_carbon_gCO2e: float | None = Field(
        None,
        description='Estimated GHG Scope 2/3 carbon footprint per invocation.',
        ge=0.0,
    )
    licensing_model: Literal[
        'open_source',
        'internal_proprietary',
        'commercial_api_metered',
        'per_seat_subscription',
    ]

class BlockModality(
    RootModel[
        Literal[
            'code_deterministic',
            'live_market_signal',
            'parametric_analytical_model',
            'normative_policy_text',
            'operational_ground_data',
            'cognitive_prompt_agent',
            'human_gate',
        ]
    ]
):
    root: Literal[
        'code_deterministic',
        'live_market_signal',
        'parametric_analytical_model',
        'normative_policy_text',
        'operational_ground_data',
        'cognitive_prompt_agent',
        'human_gate',
    ]

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

class EpistemicConfidence(BaseModel):
    confidence_score: float = Field(
        ...,
        description='1.0 for deterministic code; <1.0 for probabilistic models or feeds.',
        ge=0.0,
        le=1.0,
    )
    entropy: float | None = Field(
        None,
        description='Shannon entropy H(X) representing information uncertainty.',
        ge=0.0,
    )
    variance_tolerance: float | None = Field(
        None, description='Permissible variance or standard deviation.'
    )
    evidence_class: Literal[
        'measured_sensor_telemetry',
        'audited_signed_document',
        'statistically_inferred',
        'expert_consensus',
        'unverified_candidate',
    ]

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

class MarketSignalSpecifics(BaseModel):
    feed_source_uri: str = Field(
        ...,
        description='Authoritative URI or market symbol (e.g. LME-CU-CASH, NP-DK1-SPOT).',
        min_length=1,
    )
    oracle_attestation_type: Literal[
        'tls_notary', 'signed_jwt_oracle', 'mutual_tls_direct', 'unattested_rest_poll'
    ]
    standard_lot_size: float | None = Field(
        None,
        description='Contract standard lot volume (e.g. 25 tonnes for LME copper).',
        ge=0.0,
    )
    order_book_depth_checked: bool | None = False

class NormativeEvaluationEngine(
    RootModel[
        Literal[
            'rego_opa',
            'json_logic',
            'deterministic_predicate',
            'linked_cognitive_agent',
            'human_verification_only',
        ]
    ]
):
    root: Literal[
        'rego_opa',
        'json_logic',
        'deterministic_predicate',
        'linked_cognitive_agent',
        'human_verification_only',
    ]

class NormativePolicySpecifics(BaseModel):
    jurisdiction_authority: str = Field(
        ..., description='E.g. EU Parliament, Danish FSA, ISO Committee.', min_length=1
    )
    legal_reference_uri: str = Field(
        ...,
        description='Canonical URI to directive, regulation, or contract artifact.',
        min_length=1,
    )
    evaluation_engine: Literal[
        'rego_opa',
        'json_logic',
        'deterministic_predicate',
        'linked_cognitive_agent',
        'human_verification_only',
    ]
    deontic_rule_digest: str | None = Field(
        None,
        description='SHA-256 of the executable Rego/JSON-logic policy rule.',
        pattern='^sha256:[a-f0-9]{64}$',
    )
    linked_cognitive_agent_ref: str | None = Field(
        None,
        description='Pinned URN of cognitive prompt agent if interpretive reasoning is needed.',
    )

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

class PortContract(BaseModel):
    name: str = Field(
        ...,
        description='Port name (e.g. "copper_spot_price", "annual_demand", "risk_status").',
        min_length=1,
    )
    data_type: str = Field(
        ...,
        description='Underlying data type, e.g. number, string, boolean, object.',
        min_length=1,
    )
    unit_of_measure: str | None = Field(
        None,
        description='Standardized UCUM or ISO 4217 unit, e.g. "DKK/metric_ton", "EUR/MWh", "hours", "kg_CO2e".',
    )
    schema_definition: dict[constr(pattern=r'^(.*)$'), Any] = Field(
        ..., description='JSON Schema / TypeBox definition for port payload.'
    )
    is_optional: bool
    allow_implicit_coercion: Literal[False] = Field(
        ...,
        description='Ratchet 3: Implicit unit conversion is forbidden. Explicit adapter blocks required.',
    )

class InputPort(BaseModel):
    name: str = Field(
        ...,
        description='Port name (e.g. "copper_spot_price", "annual_demand", "risk_status").',
        min_length=1,
    )
    data_type: str = Field(
        ...,
        description='Underlying data type, e.g. number, string, boolean, object.',
        min_length=1,
    )
    unit_of_measure: str | None = Field(
        None,
        description='Standardized UCUM or ISO 4217 unit, e.g. "DKK/metric_ton", "EUR/MWh", "hours", "kg_CO2e".',
    )
    schema_definition: dict[constr(pattern=r'^(.*)$'), Any] = Field(
        ..., description='JSON Schema / TypeBox definition for port payload.'
    )
    is_optional: bool
    allow_implicit_coercion: Literal[False] = Field(
        ...,
        description='Ratchet 3: Implicit unit conversion is forbidden. Explicit adapter blocks required.',
    )


class OutputPort(BaseModel):
    name: str = Field(
        ...,
        description='Port name (e.g. "copper_spot_price", "annual_demand", "risk_status").',
        min_length=1,
    )
    data_type: str = Field(
        ...,
        description='Underlying data type, e.g. number, string, boolean, object.',
        min_length=1,
    )
    unit_of_measure: str | None = Field(
        None,
        description='Standardized UCUM or ISO 4217 unit, e.g. "DKK/metric_ton", "EUR/MWh", "hours", "kg_CO2e".',
    )
    schema_definition: dict[constr(pattern=r'^(.*)$'), Any] = Field(
        ..., description='JSON Schema / TypeBox definition for port payload.'
    )
    is_optional: bool
    allow_implicit_coercion: Literal[False] = Field(
        ...,
        description='Ratchet 3: Implicit unit conversion is forbidden. Explicit adapter blocks required.',
    )


class MarketSignal(BaseModel):
    feed_source_uri: str = Field(
        ...,
        description='Authoritative URI or market symbol (e.g. LME-CU-CASH, NP-DK1-SPOT).',
        min_length=1,
    )
    oracle_attestation_type: Literal[
        'tls_notary', 'signed_jwt_oracle', 'mutual_tls_direct', 'unattested_rest_poll'
    ]
    standard_lot_size: float | None = Field(
        None,
        description='Contract standard lot volume (e.g. 25 tonnes for LME copper).',
        ge=0.0,
    )
    order_book_depth_checked: bool | None = False


class NormativePolicy(BaseModel):
    jurisdiction_authority: str = Field(
        ..., description='E.g. EU Parliament, Danish FSA, ISO Committee.', min_length=1
    )
    legal_reference_uri: str = Field(
        ...,
        description='Canonical URI to directive, regulation, or contract artifact.',
        min_length=1,
    )
    evaluation_engine: Literal[
        'rego_opa',
        'json_logic',
        'deterministic_predicate',
        'linked_cognitive_agent',
        'human_verification_only',
    ]
    deontic_rule_digest: str | None = Field(
        None,
        description='SHA-256 of the executable Rego/JSON-logic policy rule.',
        pattern='^sha256:[a-f0-9]{64}$',
    )
    linked_cognitive_agent_ref: str | None = Field(
        None,
        description='Pinned URN of cognitive prompt agent if interpretive reasoning is needed.',
    )


class Bitemporal(BaseModel):
    valid_from: AwareDatetime = Field(
        ...,
        description='When this fact became valid in the real world (T_valid start).',
    )
    valid_to: AwareDatetime | None = Field(
        None, description='When this fact ceases to be valid (T_valid end).'
    )
    recorded_at: AwareDatetime = Field(
        ..., description='When this fact was transacted/recorded in the system (T_tx).'
    )
    refresh_cadence: Literal[
        'realtime_stream',
        'hourly_tick',
        'daily_close',
        'event_driven',
        'static_immutable',
    ]
    ttl_seconds: int | None = Field(
        None, description='Expected time-to-live before revalidation is required.', ge=0
    )
    max_staleness_seconds: int = Field(
        ...,
        description='Ratchet 2: Hard ceiling. If (T_now - T_valid) > max_staleness_seconds, execution must fail-closed.',
        ge=1,
    )


class Epistemic(BaseModel):
    confidence_score: float = Field(
        ...,
        description='1.0 for deterministic code; <1.0 for probabilistic models or feeds.',
        ge=0.0,
        le=1.0,
    )
    entropy: float | None = Field(
        None,
        description='Shannon entropy H(X) representing information uncertainty.',
        ge=0.0,
    )
    variance_tolerance: float | None = Field(
        None, description='Permissible variance or standard deviation.'
    )
    evidence_class: Literal[
        'measured_sensor_telemetry',
        'audited_signed_document',
        'statistically_inferred',
        'expert_consensus',
        'unverified_candidate',
    ]


class Economics(BaseModel):
    currency: str = Field(..., description='Settlement currency (ISO 4217).')
    marginal_cost_unit: float = Field(
        ...,
        description='Marginal execution cost per call in specified currency.',
        ge=0.0,
    )
    compute_latency_ms_p95: float = Field(
        ..., description='P95 expected latency in milliseconds.', ge=0.0
    )
    estimated_tokens: int | None = Field(
        None, description='Token budget if LLM/cognitive reasoning is involved.', ge=0
    )
    marginal_carbon_gCO2e: float | None = Field(
        None,
        description='Estimated GHG Scope 2/3 carbon footprint per invocation.',
        ge=0.0,
    )
    licensing_model: Literal[
        'open_source',
        'internal_proprietary',
        'commercial_api_metered',
        'per_seat_subscription',
    ]


class UniversalAssemblyBlock(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: str = Field(
        ...,
        description='Canonical block URN (e.g. "urn:wdc:block:supply-chain:copper-spot-feed:v1").',
        pattern='^urn:wdc:block:[a-z0-9_.-]+:[a-z0-9_.-]+:v[0-9]+$',
    )
    title: str = Field(..., description='Human-readable title.', min_length=1)
    version: str = Field(
        ..., description='SemVer version string.', pattern='^[0-9]+\\.[0-9]+\\.[0-9]+$'
    )
    modality: Literal[
        'code_deterministic',
        'live_market_signal',
        'parametric_analytical_model',
        'normative_policy_text',
        'operational_ground_data',
        'cognitive_prompt_agent',
        'human_gate',
    ]
    domain: str = Field(
        ...,
        description='Business or functional domain (e.g. Procurement, Energy, CyberNIS2, Finance, Manufacturing).',
    )
    required_capabilities: list[str] = Field(
        ..., description='Canonical capability URNs this block depends on.'
    )
    provided_capabilities: list[str] = Field(
        ..., description='Canonical capability URNs this block satisfies.'
    )
    input_ports: list[InputPort] = Field(
        ..., description='Input ports with typed schemas and unit dimensions.'
    )
    output_ports: list[OutputPort] = Field(
        ..., description='Output ports with guaranteed schemas and unit dimensions.'
    )
    preconditions: list[str] = Field(
        ..., description='Semantic invariants that MUST hold before invocation.'
    )
    postconditions: list[str] = Field(
        ..., description='Semantic guarantees produced upon successful termination.'
    )
    failure_rail: Literal[
        'fail_closed',
        'use_last_valid_with_staleness_flag',
        'fallback_to_designated_proxy',
        'halt_and_escalate_to_human',
    ]
    fallback_block_urn: str | None = Field(
        None, pattern='^urn:wdc:block:[a-z0-9_.-]+:[a-z0-9_.-]+:v[0-9]+$'
    )
    market_signal: MarketSignal | None = None
    normative_policy: NormativePolicy | None = None
    bitemporal: Bitemporal = Field(
        ..., description='Bitemporal validity anchors per SQL:2011.'
    )
    epistemic: Epistemic = Field(
        ..., description='Epistemic uncertainty and proof grading for the block.'
    )
    economics: Economics = Field(
        ..., description='Unit economics and FinOps resource tensor.'
    )
    jurisdiction_policy: Literal[
        'EU_ONLY', 'DK_ONLY', 'NO_CN', 'NO_US', 'LOCAL_ONLY', 'NONE'
    ]
    data_class: Literal['pii', 'confidential', 'public', 'legal']
    content_digest: str = Field(
        ...,
        description='RFC 8785 Canonical JSON content-addressed SHA-256.',
        pattern='^sha256:[a-f0-9]{64}$',
    )
    attestation_authority: str = Field(
        ...,
        description='Signing authority identity (agent, CI runner, or operator key).',
    )
    signature: str | None = Field(
        None, description='Ed25519 signature over canonical content digest.'
    )
    lifecycle: Literal['candidate', 'canary', 'verified', 'deprecated', 'revoked']

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
