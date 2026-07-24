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
import { Type } from '@sinclair/typebox';
import { CANONICALIZATION_VERSION, CONTENT_HASH_ALGORITHM, contentAddressedIdentity, } from '../normalization/canonical-json.js';
export const CAPABILITY_CONTRACT_SCHEMA_IDS = {
    CapabilityIdentifierV1: 'https://widgetdc.com/contracts/capability/CapabilityIdentifierV1.json',
    CapabilityDefinitionV1: 'https://widgetdc.com/contracts/capability/CapabilityDefinitionV1.json',
    CapabilityRequirementV1: 'https://widgetdc.com/contracts/capability/CapabilityRequirementV1.json',
    AuthorityGrantRefV1: 'https://widgetdc.com/contracts/capability/AuthorityGrantRefV1.json',
    AliasResolutionResultV1: 'https://widgetdc.com/contracts/capability/AliasResolutionResultV1.json',
};
const CAPABILITY_SCHEMA_VERSIONS = {
    [CAPABILITY_CONTRACT_SCHEMA_IDS.CapabilityIdentifierV1]: 'wdc.capability_identifier.v1',
    [CAPABILITY_CONTRACT_SCHEMA_IDS.CapabilityDefinitionV1]: 'wdc.capability_definition.v1',
    [CAPABILITY_CONTRACT_SCHEMA_IDS.CapabilityRequirementV1]: 'wdc.capability_requirement.v1',
    [CAPABILITY_CONTRACT_SCHEMA_IDS.AuthorityGrantRefV1]: 'wdc.authority_grant_ref.v1',
    [CAPABILITY_CONTRACT_SCHEMA_IDS.AliasResolutionResultV1]: 'wdc.alias_resolution_result.v1',
};
const CANONICAL_CAPABILITY_URN_PATTERN = '^urn:wdc:capability:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:v[1-9][0-9]*$';
const CANONICAL_CAPABILITY_TOKEN_PATTERN = '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$';
const CANONICAL_MAJOR_PATTERN = '^[1-9][0-9]*$';
const CANONICAL_DOCUMENT_HASH_PATTERN = '^sha256:[0-9a-f]{64}$';
const LEGACY_ALIAS_PATTERN = '^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$';
const RFC3339_UTC_OFFSET_DATE_TIME_PATTERN = '^[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])T(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\\.[0-9]+)?(?:Z|[+-](?:[01][0-9]|2[0-3]):[0-5][0-9])$';
const CanonicalCapabilityId = Type.String({
    pattern: CANONICAL_CAPABILITY_URN_PATTERN,
    description: 'Canonical capability URN. Aliases and compatibility identifiers are never valid here.',
});
const CanonicalMetadataV1 = {
    definition_version: Type.Literal('1.0.0'),
    canonicalization_profile: Type.Literal(CANONICALIZATION_VERSION),
    hash_algorithm: Type.Literal(CONTENT_HASH_ALGORITHM),
    canonical_document_hash: Type.String({
        pattern: CANONICAL_DOCUMENT_HASH_PATTERN,
        description: 'SHA-256 identity over the canonical contract projection, excluding this field itself.',
    }),
};
const OpaqueReference = Type.String({ minLength: 1, maxLength: 512 });
const OperationReference = Type.String({
    pattern: '^operation:[A-Za-z0-9][A-Za-z0-9._/-]*$',
    maxLength: 512,
});
const RiskReference = Type.String({
    pattern: '^risk:[A-Za-z0-9][A-Za-z0-9._/-]*$',
    maxLength: 512,
});
const ProofRequirementReference = Type.String({
    pattern: '^proof:[A-Za-z0-9][A-Za-z0-9._/-]*$',
    maxLength: 512,
});
const ContextReference = Type.String({
    pattern: '^context:[A-Za-z0-9][A-Za-z0-9._/-]*$',
    maxLength: 512,
});
const LegacyAlias = Type.String({
    pattern: LEGACY_ALIAS_PATTERN,
    description: 'Read-only compatibility alias. Colon-free by contract so it cannot be a canonical capability URN.',
});
export const CapabilityIdentifierV1 = Type.Object({
    schema_version: Type.Literal('wdc.capability_identifier.v1'),
    ...CanonicalMetadataV1,
    capability_id: CanonicalCapabilityId,
}, {
    $id: CAPABILITY_CONTRACT_SCHEMA_IDS.CapabilityIdentifierV1,
    additionalProperties: false,
    description: 'Canonical, content-addressed capability identifier. Aliases are deliberately excluded.',
});
export const CapabilityDefinitionV1 = Type.Object({
    schema_version: Type.Literal('wdc.capability_definition.v1'),
    ...CanonicalMetadataV1,
    capability_id: CanonicalCapabilityId,
    lifecycle: Type.Union([
        Type.Literal('active'),
        Type.Literal('deprecated'),
        Type.Literal('archived'),
    ]),
    operation_refs: Type.Array(OperationReference, {
        minItems: 1,
        maxItems: 64,
        uniqueItems: true,
    }),
    risk_refs: Type.Array(RiskReference, {
        minItems: 1,
        maxItems: 64,
        uniqueItems: true,
    }),
    proof_requirement_refs: Type.Array(ProofRequirementReference, {
        minItems: 1,
        maxItems: 64,
        uniqueItems: true,
    }),
    legacy_aliases: Type.Optional(Type.Array(LegacyAlias, {
        minItems: 1,
        maxItems: 64,
        uniqueItems: true,
        description: 'Read-only compatibility metadata. It is neither canonical identity nor authority.',
    })),
}, {
    $id: CAPABILITY_CONTRACT_SCHEMA_IDS.CapabilityDefinitionV1,
    additionalProperties: false,
    description: 'Canonical capability definition. Capability, lifecycle, and evidence references do not convey authority.',
});
const CapabilityRequirementCommonV1 = {
    schema_version: Type.Literal('wdc.capability_requirement.v1'),
    ...CanonicalMetadataV1,
    operation_ref: OperationReference,
    context_ref: ContextReference,
    workbom_id: Type.Optional(Type.String({
        pattern: '^workbom:[A-Za-z0-9][A-Za-z0-9._:-]*$',
        maxLength: 512,
    })),
    correlation_id: Type.Optional(OpaqueReference),
};
const ExactCapabilityRequirementV1 = Type.Object({
    ...CapabilityRequirementCommonV1,
    selector_kind: Type.Literal('exact'),
    requested_capability_id: CanonicalCapabilityId,
}, {
    additionalProperties: false,
    description: 'Exact canonical capability requirement. It cannot select execution machinery or manufacture authority.',
});
const MajorRangeCapabilityRequirementV1 = Type.Object({
    ...CapabilityRequirementCommonV1,
    selector_kind: Type.Literal('major_range'),
    capability_domain: Type.String({
        pattern: CANONICAL_CAPABILITY_TOKEN_PATTERN,
    }),
    capability_action: Type.String({
        pattern: CANONICAL_CAPABILITY_TOKEN_PATTERN,
    }),
    minimum_major: Type.String({ pattern: CANONICAL_MAJOR_PATTERN }),
    maximum_major: Type.String({ pattern: CANONICAL_MAJOR_PATTERN }),
}, {
    additionalProperties: false,
    description: 'Canonical major-version range input. Range ordering and resolution belong to a later resolver slice.',
});
export const CapabilityRequirementV1 = Type.Union([ExactCapabilityRequirementV1, MajorRangeCapabilityRequirementV1], {
    $id: CAPABILITY_CONTRACT_SCHEMA_IDS.CapabilityRequirementV1,
    description: 'Closed capability requirement. Provider, model, tool, skill, pattern, and caller-provided authority selection are excluded.',
});
export const AuthorityGrantRefV1 = Type.Object({
    schema_version: Type.Literal('wdc.authority_grant_ref.v1'),
    ...CanonicalMetadataV1,
    issuer: OpaqueReference,
    grant_id: OpaqueReference,
    scope_ref: OpaqueReference,
    expires_at: Type.String({
        pattern: RFC3339_UTC_OFFSET_DATE_TIME_PATTERN,
        description: 'RFC 3339-shaped wire string with T separator and an explicit Z or numeric UTC offset. Calendar and expiry-policy evaluation are outside this inert-reference contract.',
    }),
    reference_version: Type.String({
        pattern: '^[1-9][0-9]*(?:\\.[0-9]+){0,2}$',
        maxLength: 64,
    }),
    reference_only: Type.Literal(true),
}, {
    $id: CAPABILITY_CONTRACT_SCHEMA_IDS.AuthorityGrantRefV1,
    additionalProperties: false,
    description: 'Inert reference to possible separately issued authority. It contains no grant, policy decision, permission, or signature.',
});
const AliasResolutionCommonV1 = {
    schema_version: Type.Literal('wdc.alias_resolution_result.v1'),
    ...CanonicalMetadataV1,
    alias: LegacyAlias,
};
const ResolvedAliasResultV1 = Type.Object({
    ...AliasResolutionCommonV1,
    status: Type.Literal('resolved'),
    match_kind: Type.Literal('exact'),
    capability_id: CanonicalCapabilityId,
    capability_lifecycle: Type.Literal('active'),
}, {
    additionalProperties: false,
    description: 'An exact alias match to one active capability. Deprecated and archived capabilities cannot use this variant.',
});
const UnknownAliasResultV1 = Type.Object({
    ...AliasResolutionCommonV1,
    status: Type.Literal('unresolved'),
    reason: Type.Literal('unknown_alias'),
}, {
    additionalProperties: false,
    description: 'Unknown alias. No default, fallback, implicit candidate, or provider selection is permitted.',
});
const InactiveAliasResultV1 = Type.Object({
    ...AliasResolutionCommonV1,
    status: Type.Literal('unresolved'),
    reason: Type.Union([
        Type.Literal('archived_capability'),
        Type.Literal('deprecated_without_compatibility_policy'),
    ]),
    matched_capability_id: CanonicalCapabilityId,
}, {
    additionalProperties: false,
    description: 'Exact alias metadata was observed, but its inactive lifecycle fails closed.',
});
const AmbiguousAliasResultV1 = Type.Object({
    ...AliasResolutionCommonV1,
    status: Type.Literal('ambiguous'),
    candidate_capability_ids: Type.Array(CanonicalCapabilityId, {
        minItems: 2,
        maxItems: 64,
        uniqueItems: true,
    }),
}, {
    additionalProperties: false,
    description: 'Multiple exact candidates were observed. No candidate is selected and no fallback is allowed.',
});
export const AliasResolutionResultV1 = Type.Union([
    ResolvedAliasResultV1,
    UnknownAliasResultV1,
    InactiveAliasResultV1,
    AmbiguousAliasResultV1,
], {
    $id: CAPABILITY_CONTRACT_SCHEMA_IDS.AliasResolutionResultV1,
    description: 'Exactly one terminal alias result: resolved, unresolved, or ambiguous. This is a result contract, not a resolver.',
});
function projectCanonicalCapabilityDocumentV1(schemaId, document) {
    if (document === null ||
        typeof document !== 'object' ||
        Array.isArray(document) ||
        Object.getPrototypeOf(document) !== Object.prototype) {
        throw new TypeError('capability contract document must be a plain object');
    }
    if (Object.getOwnPropertySymbols(document).length > 0) {
        throw new TypeError('capability contract document cannot contain symbol properties');
    }
    if (!Object.hasOwn(CAPABILITY_SCHEMA_VERSIONS, schemaId)) {
        throw new TypeError(`unsupported capability contract schema id: ${schemaId}`);
    }
    const expectedSchemaVersion = CAPABILITY_SCHEMA_VERSIONS[schemaId];
    const payload = Object.create(null);
    let schemaVersion;
    for (const key of Object.getOwnPropertyNames(document)) {
        const descriptor = Object.getOwnPropertyDescriptor(document, key);
        if (!descriptor || !descriptor.enumerable || !('value' in descriptor)) {
            throw new TypeError('capability contract members must be enumerable data properties');
        }
        if (key === 'canonical_document_hash')
            continue;
        if (key === 'schema_version') {
            if (typeof descriptor.value !== 'string') {
                throw new TypeError('schema_version must be a string');
            }
            schemaVersion = descriptor.value;
            continue;
        }
        payload[key] = descriptor.value;
    }
    if (schemaVersion !== expectedSchemaVersion) {
        throw new TypeError(`schema_version ${schemaVersion ?? '<missing>'} does not match ${expectedSchemaVersion}`);
    }
    return { schemaVersion, payload };
}
/**
 * Compute a contract document hash using the canonical JSON envelope from
 * normalization/canonical-json. The hash field itself is excluded to avoid a
 * self-referential identity.
 */
export function canonicalCapabilityDocumentHashV1(schemaId, document) {
    const { schemaVersion, payload } = projectCanonicalCapabilityDocumentV1(schemaId, document);
    return contentAddressedIdentity({
        object_type: schemaId,
        schema_version: schemaVersion,
        payload,
    }).id;
}
/**
 * Verify only the canonical document hash. Callers must also validate the
 * document against its matching TypeBox/JSON Schema/Pydantic contract.
 */
export function hasValidCanonicalCapabilityDocumentHashV1(schemaId, document) {
    try {
        const candidate = document;
        const hashDescriptor = Object.getOwnPropertyDescriptor(candidate, 'canonical_document_hash');
        if (!hashDescriptor ||
            !hashDescriptor.enumerable ||
            !('value' in hashDescriptor)) {
            return false;
        }
        const claimedHash = hashDescriptor.value;
        if (typeof claimedHash !== 'string' ||
            !/^sha256:[0-9a-f]{64}$/.test(claimedHash)) {
            return false;
        }
        return canonicalCapabilityDocumentHashV1(schemaId, candidate) === claimedHash;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=contract-core.js.map