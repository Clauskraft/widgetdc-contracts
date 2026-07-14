export declare const CANONICALIZATION_VERSION: "jcs-rfc8785-v1";
export declare const CONTENT_HASH_ALGORITHM: "sha256";
export declare const CanonicalJsonContract: Readonly<{
    $id: "https://widgetdc.com/contracts/normalization/canonical-json.v1";
    canonicalization_version: "jcs-rfc8785-v1";
    hash_algorithm: "sha256";
    identity_envelope_fields: readonly ["object_type", "payload", "schema_version"];
}>;
export type JsonPrimitive = null | boolean | number | string;
export type JsonObject = {
    [key: string]: JsonValue;
};
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type CanonicalJsonErrorCode = 'NON_JSON_VALUE' | 'NON_FINITE_NUMBER' | 'INVALID_UNICODE' | 'SPARSE_ARRAY' | 'NON_PLAIN_OBJECT' | 'INVALID_PROPERTY' | 'CYCLIC_VALUE' | 'INVALID_IDENTITY_ENVELOPE';
export declare class CanonicalJsonError extends TypeError {
    readonly code: CanonicalJsonErrorCode;
    readonly path: string;
    constructor(code: CanonicalJsonErrorCode, message: string, path?: string);
}
export interface SemanticIdentityInput {
    object_type: string;
    schema_version: string;
    payload: JsonValue;
}
export interface ContentAddressedIdentity {
    canonicalization_version: typeof CANONICALIZATION_VERSION;
    hash_algorithm: typeof CONTENT_HASH_ALGORITHM;
    canonical_input: string;
    digest: string;
    id: `sha256:${string}`;
}
/**
 * Serialize an in-memory JSON value using RFC 8785 JSON Canonicalization Scheme rules.
 *
 * The function is deliberately stricter than JSON.stringify: values that would be
 * silently omitted, coerced, or replaced with null are rejected instead.
 */
export declare function canonicalizeJson(value: unknown): string;
/**
 * Compute a semantic SHA-256 identity over an exact, three-member envelope.
 *
 * Volatile root metadata such as timestamps, actors, and correlation IDs cannot
 * enter the digest. If such data is semantically relevant, the caller must model
 * it explicitly inside payload; otherwise it belongs beside this returned identity.
 */
export declare function contentAddressedIdentity(input: SemanticIdentityInput): ContentAddressedIdentity;
//# sourceMappingURL=canonical-json.d.ts.map