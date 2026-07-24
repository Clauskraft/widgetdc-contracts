"""
widgetdc_contracts.capability — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/capability/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AfterValidator
from pydantic import BaseModel, ConfigDict, Field
from pydantic import BaseModel, ConfigDict, Field, RootModel
from pydantic import BeforeValidator
from typing import Annotated
from typing import Literal

__all__ = ["AliasResolutionResultV1", "AuthorityGrantRefV1", "CapabilityDefinitionV1", "CapabilityIdentifierV1", "CapabilityRequirementV1"]

def _reject_duplicate_items(value: object) -> object:
    if isinstance(value, list):
        seen: list[object] = []
        for item in value:
            if item in seen:
                raise ValueError('Input should contain unique items')
            seen.append(item)
    return value

def _reject_explicit_none(value: object) -> object:
    if value is None:
        raise ValueError('Explicit null is not allowed; omit the field instead')
    return value

def _require_json_boolean(value: object) -> object:
    if type(value) is not bool:
        raise ValueError('Input should be a JSON boolean')
    return value

class _CapabilityContractDumpMixin:
    def model_dump(self, *args: object, **kwargs: object):
        kwargs['exclude_none'] = True
        return super().model_dump(*args, **kwargs)

    def model_dump_json(self, *args: object, **kwargs: object):
        kwargs['exclude_none'] = True
        return super().model_dump_json(*args, **kwargs)

class AliasResolutionResultV11(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.alias_resolution_result.v1']
    definition_version: Literal['1.0.0']
    canonicalization_profile: Literal['jcs-rfc8785-v1']
    hash_algorithm: Literal['sha256']
    canonical_document_hash: str = Field(
        ...,
        description='SHA-256 identity over the canonical contract projection, excluding this field itself.',
        pattern='^sha256:[0-9a-f]{64}$',
    )
    alias: str = Field(
        ...,
        description='Read-only compatibility alias. Colon-free by contract so it cannot be a canonical capability URN.',
        pattern='^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$',
    )
    status: Literal['resolved']
    match_kind: Literal['exact']
    capability_id: str = Field(
        ...,
        description='Canonical capability URN. Aliases and compatibility identifiers are never valid here.',
        pattern='^urn:wdc:capability:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:v[1-9][0-9]*$',
    )
    capability_lifecycle: Literal['active']


class AliasResolutionResultV12(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.alias_resolution_result.v1']
    definition_version: Literal['1.0.0']
    canonicalization_profile: Literal['jcs-rfc8785-v1']
    hash_algorithm: Literal['sha256']
    canonical_document_hash: str = Field(
        ...,
        description='SHA-256 identity over the canonical contract projection, excluding this field itself.',
        pattern='^sha256:[0-9a-f]{64}$',
    )
    alias: str = Field(
        ...,
        description='Read-only compatibility alias. Colon-free by contract so it cannot be a canonical capability URN.',
        pattern='^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$',
    )
    status: Literal['unresolved']
    reason: Literal['unknown_alias']


class AliasResolutionResultV13(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.alias_resolution_result.v1']
    definition_version: Literal['1.0.0']
    canonicalization_profile: Literal['jcs-rfc8785-v1']
    hash_algorithm: Literal['sha256']
    canonical_document_hash: str = Field(
        ...,
        description='SHA-256 identity over the canonical contract projection, excluding this field itself.',
        pattern='^sha256:[0-9a-f]{64}$',
    )
    alias: str = Field(
        ...,
        description='Read-only compatibility alias. Colon-free by contract so it cannot be a canonical capability URN.',
        pattern='^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$',
    )
    status: Literal['unresolved']
    reason: Literal['archived_capability', 'deprecated_without_compatibility_policy']
    matched_capability_id: str = Field(
        ...,
        description='Canonical capability URN. Aliases and compatibility identifiers are never valid here.',
        pattern='^urn:wdc:capability:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:v[1-9][0-9]*$',
    )


class CandidateCapabilityId(RootModel[str]):
    root: str = Field(
        ...,
        description='Canonical capability URN. Aliases and compatibility identifiers are never valid here.',
        pattern='^urn:wdc:capability:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:v[1-9][0-9]*$',
    )


class AliasResolutionResultV14(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.alias_resolution_result.v1']
    definition_version: Literal['1.0.0']
    canonicalization_profile: Literal['jcs-rfc8785-v1']
    hash_algorithm: Literal['sha256']
    canonical_document_hash: str = Field(
        ...,
        description='SHA-256 identity over the canonical contract projection, excluding this field itself.',
        pattern='^sha256:[0-9a-f]{64}$',
    )
    alias: str = Field(
        ...,
        description='Read-only compatibility alias. Colon-free by contract so it cannot be a canonical capability URN.',
        pattern='^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$',
    )
    status: Literal['ambiguous']
    candidate_capability_ids: Annotated[list[CandidateCapabilityId], AfterValidator(_reject_duplicate_items)] = Field(
        ..., max_length=64, min_length=2
    )


class AliasResolutionResultV1(
    _CapabilityContractDumpMixin,
    RootModel[
        AliasResolutionResultV11
        | AliasResolutionResultV12
        | AliasResolutionResultV13
        | AliasResolutionResultV14
    ]
):
    root: (
        AliasResolutionResultV11
        | AliasResolutionResultV12
        | AliasResolutionResultV13
        | AliasResolutionResultV14
    ) = Field(
        ...,
        description='Exactly one terminal alias result: resolved, unresolved, or ambiguous. This is a result contract, not a resolver.',
    )

class AuthorityGrantRefV1(_CapabilityContractDumpMixin, BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.authority_grant_ref.v1']
    definition_version: Literal['1.0.0']
    canonicalization_profile: Literal['jcs-rfc8785-v1']
    hash_algorithm: Literal['sha256']
    canonical_document_hash: str = Field(
        ...,
        description='SHA-256 identity over the canonical contract projection, excluding this field itself.',
        pattern='^sha256:[0-9a-f]{64}$',
    )
    issuer: str = Field(..., max_length=512, min_length=1)
    grant_id: str = Field(..., max_length=512, min_length=1)
    scope_ref: str = Field(..., max_length=512, min_length=1)
    expires_at: str = Field(
        ...,
        description='RFC 3339-shaped wire string with T separator and an explicit Z or numeric UTC offset. Calendar and expiry-policy evaluation are outside this inert-reference contract.',
        pattern='^[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])T(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\\.[0-9]+)?(?:Z|[+-](?:[01][0-9]|2[0-3]):[0-5][0-9])$',
    )
    reference_version: str = Field(
        ..., max_length=64, pattern='^[1-9][0-9]*(?:\\.[0-9]+){0,2}$'
    )
    reference_only: Annotated[Literal[True], BeforeValidator(_require_json_boolean)]

class OperationRef(RootModel[str]):
    root: str = Field(
        ..., max_length=512, pattern='^operation:[A-Za-z0-9][A-Za-z0-9._/-]*$'
    )


class RiskRef(RootModel[str]):
    root: str = Field(..., max_length=512, pattern='^risk:[A-Za-z0-9][A-Za-z0-9._/-]*$')


class ProofRequirementRef(RootModel[str]):
    root: str = Field(
        ..., max_length=512, pattern='^proof:[A-Za-z0-9][A-Za-z0-9._/-]*$'
    )


class LegacyAliase(RootModel[str]):
    root: str = Field(
        ...,
        description='Read-only compatibility alias. Colon-free by contract so it cannot be a canonical capability URN.',
        pattern='^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$',
    )


class CapabilityDefinitionV1(_CapabilityContractDumpMixin, BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.capability_definition.v1']
    definition_version: Literal['1.0.0']
    canonicalization_profile: Literal['jcs-rfc8785-v1']
    hash_algorithm: Literal['sha256']
    canonical_document_hash: str = Field(
        ...,
        description='SHA-256 identity over the canonical contract projection, excluding this field itself.',
        pattern='^sha256:[0-9a-f]{64}$',
    )
    capability_id: str = Field(
        ...,
        description='Canonical capability URN. Aliases and compatibility identifiers are never valid here.',
        pattern='^urn:wdc:capability:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:v[1-9][0-9]*$',
    )
    lifecycle: Literal['active', 'deprecated', 'archived']
    operation_refs: Annotated[list[OperationRef], AfterValidator(_reject_duplicate_items)] = Field(..., max_length=64, min_length=1)
    risk_refs: Annotated[list[RiskRef], AfterValidator(_reject_duplicate_items)] = Field(..., max_length=64, min_length=1)
    proof_requirement_refs: Annotated[list[ProofRequirementRef], AfterValidator(_reject_duplicate_items)] = Field(
        ..., max_length=64, min_length=1
    )
    legacy_aliases: Annotated[Annotated[list[LegacyAliase] | None, AfterValidator(_reject_duplicate_items)], BeforeValidator(_reject_explicit_none)] = Field(
        None,
        description='Read-only compatibility metadata. It is neither canonical identity nor authority.',
        max_length=64,
        min_length=1,
    )

class CapabilityIdentifierV1(_CapabilityContractDumpMixin, BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.capability_identifier.v1']
    definition_version: Literal['1.0.0']
    canonicalization_profile: Literal['jcs-rfc8785-v1']
    hash_algorithm: Literal['sha256']
    canonical_document_hash: str = Field(
        ...,
        description='SHA-256 identity over the canonical contract projection, excluding this field itself.',
        pattern='^sha256:[0-9a-f]{64}$',
    )
    capability_id: str = Field(
        ...,
        description='Canonical capability URN. Aliases and compatibility identifiers are never valid here.',
        pattern='^urn:wdc:capability:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:v[1-9][0-9]*$',
    )

class CapabilityRequirementV11(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.capability_requirement.v1']
    definition_version: Literal['1.0.0']
    canonicalization_profile: Literal['jcs-rfc8785-v1']
    hash_algorithm: Literal['sha256']
    canonical_document_hash: str = Field(
        ...,
        description='SHA-256 identity over the canonical contract projection, excluding this field itself.',
        pattern='^sha256:[0-9a-f]{64}$',
    )
    operation_ref: str = Field(
        ..., max_length=512, pattern='^operation:[A-Za-z0-9][A-Za-z0-9._/-]*$'
    )
    context_ref: str = Field(
        ..., max_length=512, pattern='^context:[A-Za-z0-9][A-Za-z0-9._/-]*$'
    )
    workbom_id: Annotated[str | None, BeforeValidator(_reject_explicit_none)] = Field(
        None, max_length=512, pattern='^workbom:[A-Za-z0-9][A-Za-z0-9._:-]*$'
    )
    correlation_id: Annotated[str | None, BeforeValidator(_reject_explicit_none)] = Field(None, max_length=512, min_length=1)
    selector_kind: Literal['exact']
    requested_capability_id: str = Field(
        ...,
        description='Canonical capability URN. Aliases and compatibility identifiers are never valid here.',
        pattern='^urn:wdc:capability:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:v[1-9][0-9]*$',
    )


class CapabilityRequirementV12(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    schema_version: Literal['wdc.capability_requirement.v1']
    definition_version: Literal['1.0.0']
    canonicalization_profile: Literal['jcs-rfc8785-v1']
    hash_algorithm: Literal['sha256']
    canonical_document_hash: str = Field(
        ...,
        description='SHA-256 identity over the canonical contract projection, excluding this field itself.',
        pattern='^sha256:[0-9a-f]{64}$',
    )
    operation_ref: str = Field(
        ..., max_length=512, pattern='^operation:[A-Za-z0-9][A-Za-z0-9._/-]*$'
    )
    context_ref: str = Field(
        ..., max_length=512, pattern='^context:[A-Za-z0-9][A-Za-z0-9._/-]*$'
    )
    workbom_id: Annotated[str | None, BeforeValidator(_reject_explicit_none)] = Field(
        None, max_length=512, pattern='^workbom:[A-Za-z0-9][A-Za-z0-9._:-]*$'
    )
    correlation_id: Annotated[str | None, BeforeValidator(_reject_explicit_none)] = Field(None, max_length=512, min_length=1)
    selector_kind: Literal['major_range']
    capability_domain: str = Field(..., pattern='^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$')
    capability_action: str = Field(..., pattern='^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$')
    minimum_major: str = Field(..., pattern='^[1-9][0-9]*$')
    maximum_major: str = Field(..., pattern='^[1-9][0-9]*$')


class CapabilityRequirementV1(
    _CapabilityContractDumpMixin,
    RootModel[CapabilityRequirementV11 | CapabilityRequirementV12]
):
    root: CapabilityRequirementV11 | CapabilityRequirementV12 = Field(
        ...,
        description='Closed capability requirement. Provider, model, tool, skill, pattern, and caller-provided authority selection are excluded.',
    )
