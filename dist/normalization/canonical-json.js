import { createHash } from 'node:crypto';
export const CANONICALIZATION_VERSION = 'jcs-rfc8785-v1';
export const CONTENT_HASH_ALGORITHM = 'sha256';
export const CanonicalJsonContract = Object.freeze({
    $id: 'https://widgetdc.com/contracts/normalization/canonical-json.v1',
    canonicalization_version: CANONICALIZATION_VERSION,
    hash_algorithm: CONTENT_HASH_ALGORITHM,
    identity_envelope_fields: ['object_type', 'payload', 'schema_version'],
});
export class CanonicalJsonError extends TypeError {
    code;
    path;
    constructor(code, message, path = '$') {
        super(`${code} at ${path}: ${message}`);
        this.code = code;
        this.path = path;
        this.name = 'CanonicalJsonError';
    }
}
function assertValidUnicode(value, path) {
    for (let index = 0; index < value.length; index += 1) {
        const codeUnit = value.charCodeAt(index);
        if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
            const next = value.charCodeAt(index + 1);
            if (!(next >= 0xdc00 && next <= 0xdfff)) {
                throw new CanonicalJsonError('INVALID_UNICODE', 'high surrogate is not followed by a low surrogate', path);
            }
            index += 1;
        }
        else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
            throw new CanonicalJsonError('INVALID_UNICODE', 'low surrogate is not preceded by a high surrogate', path);
        }
    }
}
function propertyPath(parent, key) {
    return `${parent}[${JSON.stringify(key)}]`;
}
function assertNoCycle(value, active, path) {
    if (active.has(value)) {
        throw new CanonicalJsonError('CYCLIC_VALUE', 'cyclic values cannot be represented as JSON', path);
    }
}
function serializeArray(value, active, path) {
    if (Object.getPrototypeOf(value) !== Array.prototype) {
        throw new CanonicalJsonError('NON_PLAIN_OBJECT', 'array subclasses are outside the canonical JSON domain', path);
    }
    if (Object.getOwnPropertySymbols(value).length > 0) {
        throw new CanonicalJsonError('INVALID_PROPERTY', 'symbol properties are outside the canonical JSON domain', path);
    }
    const ownNames = Object.getOwnPropertyNames(value);
    const expectedNames = new Set(['length']);
    for (let index = 0; index < value.length; index += 1) {
        const name = String(index);
        expectedNames.add(name);
        const descriptor = Object.getOwnPropertyDescriptor(value, name);
        if (!descriptor) {
            throw new CanonicalJsonError('SPARSE_ARRAY', 'array holes are outside the canonical JSON domain', `${path}[${index}]`);
        }
        if (!descriptor.enumerable || !('value' in descriptor)) {
            throw new CanonicalJsonError('INVALID_PROPERTY', 'array elements must be enumerable data properties', `${path}[${index}]`);
        }
    }
    if (ownNames.some((name) => !expectedNames.has(name))) {
        throw new CanonicalJsonError('INVALID_PROPERTY', 'non-index array properties are outside the canonical JSON domain', path);
    }
    assertNoCycle(value, active, path);
    active.add(value);
    try {
        const items = value.map((item, index) => serializeJson(item, active, `${path}[${index}]`));
        return `[${items.join(',')}]`;
    }
    finally {
        active.delete(value);
    }
}
function serializeObject(value, active, path) {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
        throw new CanonicalJsonError('NON_PLAIN_OBJECT', 'only plain records can be represented as canonical JSON objects', path);
    }
    if (Object.getOwnPropertySymbols(value).length > 0) {
        throw new CanonicalJsonError('INVALID_PROPERTY', 'symbol properties are outside the canonical JSON domain', path);
    }
    const keys = Object.getOwnPropertyNames(value);
    const entries = keys.map((key) => {
        assertValidUnicode(key, propertyPath(path, key));
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (!descriptor || !descriptor.enumerable || !('value' in descriptor)) {
            throw new CanonicalJsonError('INVALID_PROPERTY', 'object members must be enumerable data properties', propertyPath(path, key));
        }
        return [key, descriptor.value];
    });
    entries.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
    assertNoCycle(value, active, path);
    active.add(value);
    try {
        return '{' + entries
            .map(([key, item]) => `${JSON.stringify(key)}:${serializeJson(item, active, propertyPath(path, key))}`)
            .join(',') + '}';
    }
    finally {
        active.delete(value);
    }
}
function serializeJson(value, active, path) {
    if (value === null)
        return 'null';
    switch (typeof value) {
        case 'boolean':
            return value ? 'true' : 'false';
        case 'number':
            if (!Number.isFinite(value)) {
                throw new CanonicalJsonError('NON_FINITE_NUMBER', 'RFC 8785 only admits finite IEEE-754 numbers', path);
            }
            return JSON.stringify(value);
        case 'string':
            assertValidUnicode(value, path);
            return JSON.stringify(value);
        case 'object':
            if (Array.isArray(value))
                return serializeArray(value, active, path);
            return serializeObject(value, active, path);
        default:
            throw new CanonicalJsonError('NON_JSON_VALUE', `${typeof value} values are outside the canonical JSON domain`, path);
    }
}
/**
 * Serialize an in-memory JSON value using RFC 8785 JSON Canonicalization Scheme rules.
 *
 * The function is deliberately stricter than JSON.stringify: values that would be
 * silently omitted, coerced, or replaced with null are rejected instead.
 */
export function canonicalizeJson(value) {
    return serializeJson(value, new WeakSet(), '$');
}
function assertIdentityEnvelope(input) {
    if (input === null || typeof input !== 'object' || Array.isArray(input)) {
        throw new CanonicalJsonError('INVALID_IDENTITY_ENVELOPE', 'semantic identity input must be a plain object');
    }
    const value = input;
    const prototype = Object.getPrototypeOf(value);
    const keys = Reflect.ownKeys(value);
    const expected = ['object_type', 'payload', 'schema_version'];
    const stringKeys = keys.filter((key) => typeof key === 'string').sort();
    if ((prototype !== Object.prototype && prototype !== null) ||
        keys.length !== expected.length ||
        stringKeys.length !== expected.length ||
        !expected.every((key, index) => stringKeys[index] === key)) {
        throw new CanonicalJsonError('INVALID_IDENTITY_ENVELOPE', 'exactly object_type, schema_version, and payload are allowed');
    }
    for (const key of expected) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (!descriptor || !descriptor.enumerable || !('value' in descriptor)) {
            throw new CanonicalJsonError('INVALID_IDENTITY_ENVELOPE', 'identity members must be enumerable data properties', propertyPath('$', key));
        }
    }
    for (const key of ['object_type', 'schema_version']) {
        const identifier = value[key];
        if (typeof identifier !== 'string' ||
            identifier.length === 0 ||
            identifier !== identifier.trim()) {
            throw new CanonicalJsonError('INVALID_IDENTITY_ENVELOPE', `${key} must be a non-empty string without surrounding whitespace`, propertyPath('$', key));
        }
        assertValidUnicode(identifier, propertyPath('$', key));
    }
}
/**
 * Compute a semantic SHA-256 identity over an exact, three-member envelope.
 *
 * Volatile root metadata such as timestamps, actors, and correlation IDs cannot
 * enter the digest. If such data is semantically relevant, the caller must model
 * it explicitly inside payload; otherwise it belongs beside this returned identity.
 */
export function contentAddressedIdentity(input) {
    assertIdentityEnvelope(input);
    const canonicalInput = canonicalizeJson({
        object_type: input.object_type,
        schema_version: input.schema_version,
        payload: input.payload,
    });
    const digest = createHash(CONTENT_HASH_ALGORITHM)
        .update(canonicalInput, 'utf8')
        .digest('hex');
    return {
        canonicalization_version: CANONICALIZATION_VERSION,
        hash_algorithm: CONTENT_HASH_ALGORITHM,
        canonical_input: canonicalInput,
        digest,
        id: `sha256:${digest}`,
    };
}
//# sourceMappingURL=canonical-json.js.map