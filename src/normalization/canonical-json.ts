import { createHash } from 'node:crypto'

export const CANONICALIZATION_VERSION = 'jcs-rfc8785-v1' as const
export const CONTENT_HASH_ALGORITHM = 'sha256' as const

export type JsonPrimitive = null | boolean | number | string
export type JsonObject = { [key: string]: JsonValue }
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]

export type CanonicalJsonErrorCode =
  | 'NON_JSON_VALUE'
  | 'NON_FINITE_NUMBER'
  | 'INVALID_UNICODE'
  | 'SPARSE_ARRAY'
  | 'NON_PLAIN_OBJECT'
  | 'INVALID_PROPERTY'
  | 'CYCLIC_VALUE'
  | 'INVALID_IDENTITY_ENVELOPE'

export class CanonicalJsonError extends TypeError {
  constructor(
    readonly code: CanonicalJsonErrorCode,
    message: string,
    readonly path: string = '$',
  ) {
    super(`${code} at ${path}: ${message}`)
    this.name = 'CanonicalJsonError'
  }
}

export interface SemanticIdentityInput {
  object_type: string
  schema_version: string
  payload: JsonValue
}

export interface ContentAddressedIdentity {
  canonicalization_version: typeof CANONICALIZATION_VERSION
  hash_algorithm: typeof CONTENT_HASH_ALGORITHM
  canonical_input: string
  digest: string
  id: `sha256:${string}`
}

function assertValidUnicode(value: string, path: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index)
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new CanonicalJsonError(
          'INVALID_UNICODE',
          'high surrogate is not followed by a low surrogate',
          path,
        )
      }
      index += 1
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new CanonicalJsonError(
        'INVALID_UNICODE',
        'low surrogate is not preceded by a high surrogate',
        path,
      )
    }
  }
}

function propertyPath(parent: string, key: string): string {
  return `${parent}[${JSON.stringify(key)}]`
}

function assertNoCycle(value: object, active: WeakSet<object>, path: string): void {
  if (active.has(value)) {
    throw new CanonicalJsonError(
      'CYCLIC_VALUE',
      'cyclic values cannot be represented as JSON',
      path,
    )
  }
}

function serializeArray(value: unknown[], active: WeakSet<object>, path: string): string {
  if (Object.getPrototypeOf(value) !== Array.prototype) {
    throw new CanonicalJsonError(
      'NON_PLAIN_OBJECT',
      'array subclasses are outside the canonical JSON domain',
      path,
    )
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new CanonicalJsonError(
      'INVALID_PROPERTY',
      'symbol properties are outside the canonical JSON domain',
      path,
    )
  }

  const ownNames = Object.getOwnPropertyNames(value)
  const expectedNames = new Set(['length'])
  for (let index = 0; index < value.length; index += 1) {
    const name = String(index)
    expectedNames.add(name)
    const descriptor = Object.getOwnPropertyDescriptor(value, name)
    if (!descriptor) {
      throw new CanonicalJsonError(
        'SPARSE_ARRAY',
        'array holes are outside the canonical JSON domain',
        `${path}[${index}]`,
      )
    }
    if (!descriptor.enumerable || !('value' in descriptor)) {
      throw new CanonicalJsonError(
        'INVALID_PROPERTY',
        'array elements must be enumerable data properties',
        `${path}[${index}]`,
      )
    }
  }
  if (ownNames.some((name) => !expectedNames.has(name))) {
    throw new CanonicalJsonError(
      'INVALID_PROPERTY',
      'non-index array properties are outside the canonical JSON domain',
      path,
    )
  }

  assertNoCycle(value, active, path)
  active.add(value)
  try {
    const items = value.map((item, index) => serializeJson(item, active, `${path}[${index}]`))
    return `[${items.join(',')}]`
  } finally {
    active.delete(value)
  }
}

function serializeObject(
  value: Record<string, unknown>,
  active: WeakSet<object>,
  path: string,
): string {
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) {
    throw new CanonicalJsonError(
      'NON_PLAIN_OBJECT',
      'only plain records can be represented as canonical JSON objects',
      path,
    )
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new CanonicalJsonError(
      'INVALID_PROPERTY',
      'symbol properties are outside the canonical JSON domain',
      path,
    )
  }

  const keys = Object.getOwnPropertyNames(value)
  const entries = keys.map((key) => {
    assertValidUnicode(key, propertyPath(path, key))
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (!descriptor || !descriptor.enumerable || !('value' in descriptor)) {
      throw new CanonicalJsonError(
        'INVALID_PROPERTY',
        'object members must be enumerable data properties',
        propertyPath(path, key),
      )
    }
    return [key, descriptor.value] as const
  })
  entries.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))

  assertNoCycle(value, active, path)
  active.add(value)
  try {
    return '{' + entries
      .map(([key, item]) =>
        `${JSON.stringify(key)}:${serializeJson(item, active, propertyPath(path, key))}`,
      )
      .join(',') + '}'
  } finally {
    active.delete(value)
  }
}

function serializeJson(value: unknown, active: WeakSet<object>, path: string): string {
  if (value === null) return 'null'

  switch (typeof value) {
    case 'boolean':
      return value ? 'true' : 'false'
    case 'number':
      if (!Number.isFinite(value)) {
        throw new CanonicalJsonError(
          'NON_FINITE_NUMBER',
          'RFC 8785 only admits finite IEEE-754 numbers',
          path,
        )
      }
      return JSON.stringify(value)
    case 'string':
      assertValidUnicode(value, path)
      return JSON.stringify(value)
    case 'object':
      if (Array.isArray(value)) return serializeArray(value, active, path)
      return serializeObject(value as Record<string, unknown>, active, path)
    default:
      throw new CanonicalJsonError(
        'NON_JSON_VALUE',
        `${typeof value} values are outside the canonical JSON domain`,
        path,
      )
  }
}

/**
 * Serialize an in-memory JSON value using RFC 8785 JSON Canonicalization Scheme rules.
 *
 * The function is deliberately stricter than JSON.stringify: values that would be
 * silently omitted, coerced, or replaced with null are rejected instead.
 */
export function canonicalizeJson(value: unknown): string {
  return serializeJson(value, new WeakSet<object>(), '$')
}

function assertIdentityEnvelope(input: unknown): asserts input is SemanticIdentityInput {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new CanonicalJsonError(
      'INVALID_IDENTITY_ENVELOPE',
      'semantic identity input must be a plain object',
    )
  }

  const value = input as Record<string, unknown>
  const prototype = Object.getPrototypeOf(value)
  const keys = Reflect.ownKeys(value)
  const expected = ['object_type', 'payload', 'schema_version']
  const stringKeys = keys.filter((key): key is string => typeof key === 'string').sort()
  if (
    (prototype !== Object.prototype && prototype !== null) ||
    keys.length !== expected.length ||
    stringKeys.length !== expected.length ||
    !expected.every((key, index) => stringKeys[index] === key)
  ) {
    throw new CanonicalJsonError(
      'INVALID_IDENTITY_ENVELOPE',
      'exactly object_type, schema_version, and payload are allowed',
    )
  }

  for (const key of expected) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (!descriptor || !descriptor.enumerable || !('value' in descriptor)) {
      throw new CanonicalJsonError(
        'INVALID_IDENTITY_ENVELOPE',
        'identity members must be enumerable data properties',
        propertyPath('$', key),
      )
    }
  }

  for (const key of ['object_type', 'schema_version'] as const) {
    const identifier = value[key]
    if (
      typeof identifier !== 'string' ||
      identifier.length === 0 ||
      identifier !== identifier.trim()
    ) {
      throw new CanonicalJsonError(
        'INVALID_IDENTITY_ENVELOPE',
        `${key} must be a non-empty string without surrounding whitespace`,
        propertyPath('$', key),
      )
    }
    assertValidUnicode(identifier, propertyPath('$', key))
  }
}

/**
 * Compute a semantic SHA-256 identity over an exact, three-member envelope.
 *
 * Volatile root metadata such as timestamps, actors, and correlation IDs cannot
 * enter the digest. If such data is semantically relevant, the caller must model
 * it explicitly inside payload; otherwise it belongs beside this returned identity.
 */
export function contentAddressedIdentity(input: SemanticIdentityInput): ContentAddressedIdentity {
  assertIdentityEnvelope(input)
  const canonicalInput = canonicalizeJson({
    object_type: input.object_type,
    schema_version: input.schema_version,
    payload: input.payload,
  })
  const digest = createHash(CONTENT_HASH_ALGORITHM)
    .update(canonicalInput, 'utf8')
    .digest('hex')

  return {
    canonicalization_version: CANONICALIZATION_VERSION,
    hash_algorithm: CONTENT_HASH_ALGORITHM,
    canonical_input: canonicalInput,
    digest,
    id: `sha256:${digest}`,
  }
}
