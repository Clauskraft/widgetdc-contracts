import { describe, expect, it } from 'vitest'
import {
  CanonicalJsonError,
  canonicalizeJson,
  contentAddressedIdentity,
  type CanonicalJsonErrorCode,
  type JsonValue,
} from '../src/normalization/canonical-json.js'

function expectCanonicalError(
  operation: () => unknown,
  code: CanonicalJsonErrorCode,
): void {
  try {
    operation()
    throw new Error(`Expected CanonicalJsonError(${code})`)
  } catch (error) {
    expect(error).toBeInstanceOf(CanonicalJsonError)
    expect((error as CanonicalJsonError).code).toBe(code)
  }
}

describe('canonicalizeJson', () => {
  it('matches the RFC 8785 serialization example', () => {
    const input = {
      numbers: [333333333.33333329, 1e30, 4.5, 2e-3, 1e-27],
      string: "€$\u000f\nA'B\"\\\"/",
      literals: [null, true, false],
    }

    expect(canonicalizeJson(input)).toBe(
      `{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27],"string":${JSON.stringify(input.string)}}`,
    )
  })

  it('sorts property names by UTF-16 code units at every depth', () => {
    const input = {
      '€': 'euro',
      '\r': 'carriage-return',
      '1': 'one',
      '😀': 'emoji',
      '\u0080': 'control',
      'ö': 'o-umlaut',
      nested: { z: 1, a: 2 },
    }

    expect(canonicalizeJson(input)).toBe(
      '{"\\r":"carriage-return","1":"one","nested":{"a":2,"z":1},"\u0080":"control","ö":"o-umlaut","€":"euro","😀":"emoji"}',
    )
  })

  it('uses ECMAScript number serialization including negative zero', () => {
    expect(canonicalizeJson([-0, 1e-7, 1e21, 0.000001])).toBe(
      '[0,1e-7,1e+21,0.000001]',
    )
  })

  it('rejects non-finite numbers', () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expectCanonicalError(() => canonicalizeJson(value), 'NON_FINITE_NUMBER')
    }
  })

  it('rejects non-JSON primitive values', () => {
    for (const value of [undefined, 1n, Symbol('x'), () => 'x']) {
      expectCanonicalError(
        () => canonicalizeJson(value as unknown as JsonValue),
        'NON_JSON_VALUE',
      )
    }
  })

  it('rejects sparse arrays', () => {
    const sparse = [1, , 3]
    expectCanonicalError(
      () => canonicalizeJson(sparse as unknown as JsonValue),
      'SPARSE_ARRAY',
    )
  })

  it('rejects non-plain objects, accessors, symbols, and hidden properties', () => {
    expectCanonicalError(
      () => canonicalizeJson(new Date('2026-01-01T00:00:00Z') as unknown as JsonValue),
      'NON_PLAIN_OBJECT',
    )

    const accessor: Record<string, unknown> = {}
    Object.defineProperty(accessor, 'value', { enumerable: true, get: () => 1 })
    expectCanonicalError(
      () => canonicalizeJson(accessor as JsonValue),
      'INVALID_PROPERTY',
    )

    const symbolic: Record<string | symbol, unknown> = { value: 1 }
    symbolic[Symbol('hidden')] = 2
    expectCanonicalError(
      () => canonicalizeJson(symbolic as JsonValue),
      'INVALID_PROPERTY',
    )

    const hidden: Record<string, unknown> = { value: 1 }
    Object.defineProperty(hidden, 'secret', { enumerable: false, value: 2 })
    expectCanonicalError(
      () => canonicalizeJson(hidden as JsonValue),
      'INVALID_PROPERTY',
    )
  })

  it('rejects cyclic values', () => {
    const cyclic: Record<string, unknown> = {}
    cyclic.self = cyclic
    expectCanonicalError(
      () => canonicalizeJson(cyclic as JsonValue),
      'CYCLIC_VALUE',
    )
  })

  it('rejects lone Unicode surrogates in values and property names', () => {
    expectCanonicalError(() => canonicalizeJson('\ud800'), 'INVALID_UNICODE')
    expectCanonicalError(
      () => canonicalizeJson({ ['\udc00']: true }),
      'INVALID_UNICODE',
    )
  })
})

describe('contentAddressedIdentity', () => {
  const canonicalInput =
    '{"object_type":"PatternCandidate","payload":{"confidence":0.875,"name":"retry-with-jitter","steps":["detect","backoff","retry"]},"schema_version":"v1"}'
  const digest = 'ee81a7d7cbb942bb35f39f902f03140c8c18071179f626a83840eae8b292f522'

  it('matches the fixed semantic identity vector', () => {
    expect(contentAddressedIdentity({
      object_type: 'PatternCandidate',
      schema_version: 'v1',
      payload: {
        steps: ['detect', 'backoff', 'retry'],
        name: 'retry-with-jitter',
        confidence: 0.875,
      },
    })).toEqual({
      canonicalization_version: 'jcs-rfc8785-v1',
      hash_algorithm: 'sha256',
      canonical_input: canonicalInput,
      digest,
      id: `sha256:${digest}`,
    })
  })

  it('fails closed when root metadata could enter the semantic identity', () => {
    expectCanonicalError(
      () => contentAddressedIdentity({
        object_type: 'PatternCandidate',
        schema_version: 'v1',
        payload: { name: 'retry-with-jitter' },
        created_at: '2026-07-14T00:00:00Z',
      } as never),
      'INVALID_IDENTITY_ENVELOPE',
    )
  })

  it('rejects empty type and schema identifiers', () => {
    expectCanonicalError(
      () => contentAddressedIdentity({
        object_type: '',
        schema_version: 'v1',
        payload: null,
      }),
      'INVALID_IDENTITY_ENVELOPE',
    )
    expectCanonicalError(
      () => contentAddressedIdentity({
        object_type: 'PatternCandidate',
        schema_version: ' ',
        payload: null,
      }),
      'INVALID_IDENTITY_ENVELOPE',
    )
  })

  it('passes 100 deterministic replay cases across key-order permutations', () => {
    for (let index = 0; index < 100; index += 1) {
      const left = contentAddressedIdentity({
        object_type: 'ReplayVector',
        schema_version: 'v1',
        payload: {
          index,
          parity: index % 2 === 0,
          nested: { z: index * 3, a: `vector-${index}` },
          sequence: [index, index + 1, index + 2],
        },
      })
      const right = contentAddressedIdentity({
        payload: {
          sequence: [index, index + 1, index + 2],
          nested: { a: `vector-${index}`, z: index * 3 },
          parity: index % 2 === 0,
          index,
        },
        schema_version: 'v1',
        object_type: 'ReplayVector',
      })

      expect(right).toEqual(left)
      expect(contentAddressedIdentity(JSON.parse(left.canonical_input))).toEqual(left)
    }
  })
})
