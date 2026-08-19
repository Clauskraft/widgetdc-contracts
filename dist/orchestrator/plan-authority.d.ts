/**
 * Canonical Plan Authority Contract v1.
 *
 * This module defines the only proof-eligible envelope for admitting a plan to
 * execution. It carries references and verification outcomes; it does not
 * issue actor authority, create approvals, execute plans, or mutate a mission.
 * Legacy or partially bound plans are represented only by a rejected result.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
import '../formats.js';
export declare const PLAN_AUTHORITY_SCHEMA_IDS: {
    readonly PlanAuthorityEnvelopeV1: "https://widgetdc.com/contracts/orchestrator/PlanAuthorityEnvelopeV1.json";
    readonly PlanAuthorityAdmissionResultV1: "https://widgetdc.com/contracts/orchestrator/PlanAuthorityAdmissionResultV1.json";
    readonly PlanAuthorityEnvelopeV2: "https://widgetdc.com/contracts/orchestrator/PlanAuthorityEnvelopeV2.json";
    readonly PlanAuthorityAdmissionResultV2: "https://widgetdc.com/contracts/orchestrator/PlanAuthorityAdmissionResultV2.json";
};
export declare const PlanAuthorityEnvelopeV1: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.plan_authority_envelope.v1">;
    definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_document_hash: import("@sinclair/typebox").TString;
    plan_id: import("@sinclair/typebox").TString;
    plan_version: import("@sinclair/typebox").TInteger;
    mission_id: import("@sinclair/typebox").TString;
    slice_id: import("@sinclair/typebox").TString;
    workbom_id: import("@sinclair/typebox").TString;
    linear_issue: import("@sinclair/typebox").TString;
    exact_head_sha: import("@sinclair/typebox").TString;
    binding_hashes: import("@sinclair/typebox").TObject<{
        mission_bundle_hash: import("@sinclair/typebox").TString;
        workbom_hash: import("@sinclair/typebox").TString;
        success_contract_hash: import("@sinclair/typebox").TString;
        claim_contract_hash: import("@sinclair/typebox").TString;
    }>;
    actor_binding: import("@sinclair/typebox").TObject<{
        actor_id: import("@sinclair/typebox").TString;
        authority_ref: import("@sinclair/typebox").TString;
        required_capability: import("@sinclair/typebox").TLiteral<"mutation:source_code">;
        actor_binding_verified: import("@sinclair/typebox").TLiteral<true>;
    }>;
    approval_binding: import("@sinclair/typebox").TObject<{
        approval_id: import("@sinclair/typebox").TString;
        approved_by: import("@sinclair/typebox").TString;
        approval_signature_ref: import("@sinclair/typebox").TString;
        approval_signature_verified: import("@sinclair/typebox").TLiteral<true>;
        approval_usable: import("@sinclair/typebox").TLiteral<true>;
        issued_at: import("@sinclair/typebox").TString;
        expires_at: import("@sinclair/typebox").TString;
    }>;
    execution_admitted: import("@sinclair/typebox").TLiteral<true>;
}>;
export type PlanAuthorityEnvelopeV1 = Static<typeof PlanAuthorityEnvelopeV1>;
export declare const PlanAuthorityAdmissionResultV1: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.plan_authority_admission_result.v1">;
    status: import("@sinclair/typebox").TLiteral<"admitted">;
    plan: import("@sinclair/typebox").TRefUnsafe<import("@sinclair/typebox").TObject<{
        schema_version: import("@sinclair/typebox").TLiteral<"wdc.plan_authority_envelope.v1">;
        definition_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
        canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
        hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
        canonical_document_hash: import("@sinclair/typebox").TString;
        plan_id: import("@sinclair/typebox").TString;
        plan_version: import("@sinclair/typebox").TInteger;
        mission_id: import("@sinclair/typebox").TString;
        slice_id: import("@sinclair/typebox").TString;
        workbom_id: import("@sinclair/typebox").TString;
        linear_issue: import("@sinclair/typebox").TString;
        exact_head_sha: import("@sinclair/typebox").TString;
        binding_hashes: import("@sinclair/typebox").TObject<{
            mission_bundle_hash: import("@sinclair/typebox").TString;
            workbom_hash: import("@sinclair/typebox").TString;
            success_contract_hash: import("@sinclair/typebox").TString;
            claim_contract_hash: import("@sinclair/typebox").TString;
        }>;
        actor_binding: import("@sinclair/typebox").TObject<{
            actor_id: import("@sinclair/typebox").TString;
            authority_ref: import("@sinclair/typebox").TString;
            required_capability: import("@sinclair/typebox").TLiteral<"mutation:source_code">;
            actor_binding_verified: import("@sinclair/typebox").TLiteral<true>;
        }>;
        approval_binding: import("@sinclair/typebox").TObject<{
            approval_id: import("@sinclair/typebox").TString;
            approved_by: import("@sinclair/typebox").TString;
            approval_signature_ref: import("@sinclair/typebox").TString;
            approval_signature_verified: import("@sinclair/typebox").TLiteral<true>;
            approval_usable: import("@sinclair/typebox").TLiteral<true>;
            issued_at: import("@sinclair/typebox").TString;
            expires_at: import("@sinclair/typebox").TString;
        }>;
        execution_admitted: import("@sinclair/typebox").TLiteral<true>;
    }>>;
    execution_admitted: import("@sinclair/typebox").TLiteral<true>;
}>, import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.plan_authority_admission_result.v1">;
    status: import("@sinclair/typebox").TLiteral<"rejected">;
    reason: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"legacy_unversioned_plan">, import("@sinclair/typebox").TLiteral<"schema_invalid">, import("@sinclair/typebox").TLiteral<"hash_mismatch">, import("@sinclair/typebox").TLiteral<"actor_binding_unverified">, import("@sinclair/typebox").TLiteral<"approval_signature_unverified">, import("@sinclair/typebox").TLiteral<"approval_unusable">, import("@sinclair/typebox").TLiteral<"authority_window_invalid">, import("@sinclair/typebox").TLiteral<"authority_not_yet_valid">, import("@sinclair/typebox").TLiteral<"authority_expired">, import("@sinclair/typebox").TLiteral<"binding_mismatch">]>;
    execution_admitted: import("@sinclair/typebox").TLiteral<false>;
}>]>;
export type PlanAuthorityAdmissionResultV1 = Static<typeof PlanAuthorityAdmissionResultV1>;
export interface PlanAuthorityAdmissionOptionsV1 {
    readonly clock: () => Date;
}
/**
 * Guarded admission boundary. Structural schema validation alone is not an
 * execution authorization because JSON Schema cannot recompute content hashes.
 */
export declare function evaluatePlanAuthorityAdmissionV1(input: unknown, options: PlanAuthorityAdmissionOptionsV1): PlanAuthorityAdmissionResultV1;
export interface CanonicalPlanAuthorityDocumentHashInputV1 {
    schema_version: string;
    canonical_document_hash?: unknown;
    [key: string]: unknown;
}
export declare function canonicalPlanAuthorityDocumentHashV1(document: CanonicalPlanAuthorityDocumentHashInputV1): `sha256:${string}`;
export declare function hasValidCanonicalPlanAuthorityDocumentHashV1(document: unknown): boolean;
export declare const PlanAuthorityEnvelopeV2: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.plan_authority_envelope.v2">;
    definition_version: import("@sinclair/typebox").TLiteral<"2.0.0">;
    canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
    hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
    canonical_payload_hash: import("@sinclair/typebox").TString;
    plan_id: import("@sinclair/typebox").TString;
    approval_id: import("@sinclair/typebox").TString;
    actor_id: import("@sinclair/typebox").TString;
    authority_ref: import("@sinclair/typebox").TString;
    capabilities: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    scope: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    scope_hash: import("@sinclair/typebox").TString;
    issued_at: import("@sinclair/typebox").TString;
    expires_at: import("@sinclair/typebox").TString;
    correlation_id: import("@sinclair/typebox").TString;
    idempotency_key: import("@sinclair/typebox").TString;
    signing_key_id: import("@sinclair/typebox").TString;
    server_signature: import("@sinclair/typebox").TString;
}>;
export type PlanAuthorityEnvelopeV2 = Static<typeof PlanAuthorityEnvelopeV2>;
export declare const PlanAuthorityAdmissionResultV2: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.plan_authority_admission_result.v2">;
    status: import("@sinclair/typebox").TLiteral<"admitted">;
    plan: import("@sinclair/typebox").TRefUnsafe<import("@sinclair/typebox").TObject<{
        schema_version: import("@sinclair/typebox").TLiteral<"wdc.plan_authority_envelope.v2">;
        definition_version: import("@sinclair/typebox").TLiteral<"2.0.0">;
        canonicalization_profile: import("@sinclair/typebox").TLiteral<"jcs-rfc8785-v1">;
        hash_algorithm: import("@sinclair/typebox").TLiteral<"sha256">;
        canonical_payload_hash: import("@sinclair/typebox").TString;
        plan_id: import("@sinclair/typebox").TString;
        approval_id: import("@sinclair/typebox").TString;
        actor_id: import("@sinclair/typebox").TString;
        authority_ref: import("@sinclair/typebox").TString;
        capabilities: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        scope: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        scope_hash: import("@sinclair/typebox").TString;
        issued_at: import("@sinclair/typebox").TString;
        expires_at: import("@sinclair/typebox").TString;
        correlation_id: import("@sinclair/typebox").TString;
        idempotency_key: import("@sinclair/typebox").TString;
        signing_key_id: import("@sinclair/typebox").TString;
        server_signature: import("@sinclair/typebox").TString;
    }>>;
    execution_admitted: import("@sinclair/typebox").TLiteral<true>;
}>, import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.plan_authority_admission_result.v2">;
    status: import("@sinclair/typebox").TLiteral<"rejected">;
    reason: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"schema_invalid">, import("@sinclair/typebox").TLiteral<"scope_hash_mismatch">, import("@sinclair/typebox").TLiteral<"payload_hash_mismatch">, import("@sinclair/typebox").TLiteral<"server_signature_invalid">, import("@sinclair/typebox").TLiteral<"authority_window_invalid">, import("@sinclair/typebox").TLiteral<"authority_not_yet_valid">, import("@sinclair/typebox").TLiteral<"authority_expired">]>;
    execution_admitted: import("@sinclair/typebox").TLiteral<false>;
}>]>;
export type PlanAuthorityAdmissionResultV2 = Static<typeof PlanAuthorityAdmissionResultV2>;
export interface PlanAuthoritySignatureVerificationInputV2 {
    readonly canonical_payload_hash: string;
    readonly signing_key_id: string;
    readonly server_signature: string;
}
export interface PlanAuthorityAdmissionOptionsV2 {
    readonly clock: () => Date;
    readonly verifyServerSignature: (input: Readonly<PlanAuthoritySignatureVerificationInputV2>) => boolean;
}
export interface CanonicalPlanAuthorityPayloadHashInputV2 {
    schema_version: string;
    canonical_payload_hash?: unknown;
    server_signature?: unknown;
    [key: string]: unknown;
}
export declare function canonicalPlanAuthorityScopeHashV2(scope: unknown): `sha256:${string}`;
export declare function canonicalPlanAuthorityPayloadHashV2(document: CanonicalPlanAuthorityPayloadHashInputV2): `sha256:${string}`;
export declare function hasValidCanonicalPlanAuthorityScopeHashV2(document: unknown): boolean;
export declare function hasValidCanonicalPlanAuthorityPayloadHashV2(document: unknown): boolean;
export declare function evaluatePlanAuthorityAdmissionV2(input: unknown, options: PlanAuthorityAdmissionOptionsV2): PlanAuthorityAdmissionResultV2;
//# sourceMappingURL=plan-authority.d.ts.map