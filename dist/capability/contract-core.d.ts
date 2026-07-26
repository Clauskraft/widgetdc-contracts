/**
 * Capability Contract Core v1.
 *
 * These contracts define canonical capability identities, requirements,
 * inert authority references, and fail-closed alias-resolution results.
 * They do not implement a registry, resolver, grant issuer, provider
 * selection, execution binding, graph write, or runtime enforcement.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const CAPABILITY_CONTRACT_SCHEMA_IDS: {
    readonly CapabilityIdentifierV1: "https://widgetdc.com/contracts/capability/CapabilityIdentifierV1.json";
    readonly CanonicalIdentityEnvelopeV1: "https://widgetdc.com/contracts/capability/CanonicalIdentityEnvelopeV1.json";
    readonly CapabilityDefinitionV1: "https://widgetdc.com/contracts/capability/CapabilityDefinitionV1.json";
    readonly CapabilityRequirementV1: "https://widgetdc.com/contracts/capability/CapabilityRequirementV1.json";
    readonly AuthorityGrantRefV1: "https://widgetdc.com/contracts/capability/AuthorityGrantRefV1.json";
    readonly AliasResolutionResultV1: "https://widgetdc.com/contracts/capability/AliasResolutionResultV1.json";
};
export type CapabilityContractSchemaIdV1 = (typeof CAPABILITY_CONTRACT_SCHEMA_IDS)[keyof typeof CAPABILITY_CONTRACT_SCHEMA_IDS];
export declare const CapabilityIdentifierV1: import("@sinclair/typebox").TObject<{
    capability_id: import("@sinclair/typebox").TString;
    definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_document_hash: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.capability_identifier.v1">;
}>;
export type CapabilityIdentifierV1 = Static<typeof CapabilityIdentifierV1>;
export declare const CanonicalIdentityEnvelopeV1: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.canonical_identity_envelope.v1">;
    capability_id: import("@sinclair/typebox").TString;
    canonical_document_hash: import("@sinclair/typebox").TString;
}>;
export type CanonicalIdentityEnvelopeV1 = Static<typeof CanonicalIdentityEnvelopeV1>;
export declare const CapabilityDefinitionV1: import("@sinclair/typebox").TObject<{
    capability_id: import("@sinclair/typebox").TString;
    lifecycle: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"deprecated">, import("@sinclair/typebox").TLiteral<"archived">]>;
    operation_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    risk_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    proof_requirement_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    legacy_aliases: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_document_hash: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.capability_definition.v1">;
}>;
export type CapabilityDefinitionV1 = Static<typeof CapabilityDefinitionV1>;
export declare const CapabilityRequirementV1: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
    selector_kind: import("@sinclair/typebox").TLiteral<"exact">;
    requested_capability_id: import("@sinclair/typebox").TString;
    operation_ref: import("@sinclair/typebox").TString;
    context_ref: import("@sinclair/typebox").TString;
    workbom_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_document_hash: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.capability_requirement.v1">;
}>, import("@sinclair/typebox").TObject<{
    selector_kind: import("@sinclair/typebox").TLiteral<"major_range">;
    capability_domain: import("@sinclair/typebox").TString;
    capability_action: import("@sinclair/typebox").TString;
    minimum_major: import("@sinclair/typebox").TString;
    maximum_major: import("@sinclair/typebox").TString;
    operation_ref: import("@sinclair/typebox").TString;
    context_ref: import("@sinclair/typebox").TString;
    workbom_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_document_hash: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.capability_requirement.v1">;
}>]>;
export type CapabilityRequirementV1 = Static<typeof CapabilityRequirementV1>;
export declare const AuthorityGrantRefV1: import("@sinclair/typebox").TObject<{
    issuer: import("@sinclair/typebox").TString;
    grant_id: import("@sinclair/typebox").TString;
    scope_ref: import("@sinclair/typebox").TString;
    expires_at: import("@sinclair/typebox").TString;
    reference_version: import("@sinclair/typebox").TString;
    reference_only: import("@sinclair/typebox").TLiteral<true>;
    definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_document_hash: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.authority_grant_ref.v1">;
}>;
export type AuthorityGrantRefV1 = Static<typeof AuthorityGrantRefV1>;
declare const VersionIncompatibleAliasResultV1: import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"unresolved">;
    reason: import("@sinclair/typebox").TLiteral<"version_incompatible">;
    matched_capability_id: import("@sinclair/typebox").TRefUnsafe<import("@sinclair/typebox").TObject<{
        capability_id: import("@sinclair/typebox").TString;
        definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
        canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
        hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
        canonical_document_hash: import("@sinclair/typebox").TString;
        schema_version: import("@sinclair/typebox").TLiteral<"wdc.capability_identifier.v1">;
    }>>;
    requested_version_token: import("@sinclair/typebox").TString;
    alias: import("@sinclair/typebox").TString;
    definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_document_hash: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.alias_resolution_result.v1">;
}>;
export type VersionIncompatibleAliasResultV1 = Static<typeof VersionIncompatibleAliasResultV1>;
export declare const AliasResolutionResultV1: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"resolved">;
    match_kind: import("@sinclair/typebox").TLiteral<"exact">;
    capability_id: import("@sinclair/typebox").TString;
    capability_lifecycle: import("@sinclair/typebox").TLiteral<"active">;
    alias: import("@sinclair/typebox").TString;
    definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_document_hash: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.alias_resolution_result.v1">;
}>, import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"unresolved">;
    reason: import("@sinclair/typebox").TLiteral<"unknown_alias">;
    alias: import("@sinclair/typebox").TString;
    definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_document_hash: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.alias_resolution_result.v1">;
}>, import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"unresolved">;
    reason: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"archived_capability">, import("@sinclair/typebox").TLiteral<"deprecated_without_compatibility_policy">]>;
    matched_capability_id: import("@sinclair/typebox").TString;
    alias: import("@sinclair/typebox").TString;
    definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_document_hash: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.alias_resolution_result.v1">;
}>, import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"unresolved">;
    reason: import("@sinclair/typebox").TLiteral<"version_incompatible">;
    matched_capability_id: import("@sinclair/typebox").TRefUnsafe<import("@sinclair/typebox").TObject<{
        capability_id: import("@sinclair/typebox").TString;
        definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
        canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
        hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
        canonical_document_hash: import("@sinclair/typebox").TString;
        schema_version: import("@sinclair/typebox").TLiteral<"wdc.capability_identifier.v1">;
    }>>;
    requested_version_token: import("@sinclair/typebox").TString;
    alias: import("@sinclair/typebox").TString;
    definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_document_hash: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.alias_resolution_result.v1">;
}>, import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"ambiguous">;
    candidate_capability_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    alias: import("@sinclair/typebox").TString;
    definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_document_hash: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.alias_resolution_result.v1">;
}>]>;
export type AliasResolutionResultV1 = Static<typeof AliasResolutionResultV1>;
export interface CanonicalCapabilityDocumentHashInputV1 {
    schema_version: string;
    canonical_document_hash?: unknown;
    [key: string]: unknown;
}
/**
 * Compute a contract document hash using the canonical JSON envelope from
 * normalization/canonical-json. The hash field itself is excluded to avoid a
 * self-referential identity.
 */
export declare function canonicalCapabilityDocumentHashV1(schemaId: CapabilityContractSchemaIdV1, document: CanonicalCapabilityDocumentHashInputV1): `sha256:${string}`;
/**
 * Verify only the canonical document hash. Callers must also validate the
 * document against its matching TypeBox/JSON Schema/Pydantic contract.
 */
export declare function hasValidCanonicalCapabilityDocumentHashV1(schemaId: CapabilityContractSchemaIdV1, document: unknown): boolean;
export {};
//# sourceMappingURL=contract-core.d.ts.map