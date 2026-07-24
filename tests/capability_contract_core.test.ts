import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { Value } from '@sinclair/typebox/value'
import { describe, expect, it } from 'vitest'
import * as capabilityPackage from '@widgetdc/contracts/capability'
import {
  AliasResolutionResultV1,
  AuthorityGrantRefV1,
  CapabilityDefinitionV1,
  CapabilityIdentifierV1,
  CapabilityRequirementV1,
  canonicalCapabilityDocumentHashV1,
  hasValidCanonicalCapabilityDocumentHashV1,
  type CapabilityContractSchemaIdV1,
} from '../src/capability/index.js'

type SchemaName =
  | 'CapabilityIdentifierV1'
  | 'CapabilityDefinitionV1'
  | 'CapabilityRequirementV1'
  | 'AuthorityGrantRefV1'
  | 'AliasResolutionResultV1'

interface FixtureCase {
  name: string
  schema: SchemaName
  valid: boolean
  value: Record<string, unknown>
}

interface HashVector {
  name: string
  schema_id: CapabilityContractSchemaIdV1
  document_without_hash: Record<string, unknown>
  expected_hash: `sha256:${string}`
}

interface CapabilityFixtures {
  hash_vectors: HashVector[]
  cases: FixtureCase[]
}

const repoRoot = process.cwd()
const fixturePath = join(repoRoot, 'tests', 'fixtures', 'capability-contract-core-v1.json')
const fixtures = JSON.parse(readFileSync(fixturePath, 'utf-8')) as CapabilityFixtures

const schemas = {
  CapabilityIdentifierV1,
  CapabilityDefinitionV1,
  CapabilityRequirementV1,
  AuthorityGrantRefV1,
  AliasResolutionResultV1,
}

describe('Capability Contract Core v1 fixtures', () => {
  for (const fixture of fixtures.cases) {
    it(`${fixture.valid ? 'accepts' : 'rejects'} ${fixture.name}`, () => {
      expect(Value.Check(schemas[fixture.schema], fixture.value)).toBe(fixture.valid)
    })
  }
})

describe('Capability Contract Core v1 canonical hashes', () => {
  for (const vector of fixtures.hash_vectors) {
    it(`matches fixed vector: ${vector.name}`, () => {
      const expected = canonicalCapabilityDocumentHashV1(
        vector.schema_id,
        vector.document_without_hash,
      )
      expect(expected).toBe(vector.expected_hash)

      const reversed = Object.fromEntries(
        Object.entries(vector.document_without_hash).reverse(),
      )
      expect(canonicalCapabilityDocumentHashV1(vector.schema_id, reversed)).toBe(
        vector.expected_hash,
      )

      const signed = {
        ...vector.document_without_hash,
        canonical_document_hash: vector.expected_hash,
      }
      expect(hasValidCanonicalCapabilityDocumentHashV1(vector.schema_id, signed)).toBe(true)
      expect(hasValidCanonicalCapabilityDocumentHashV1(vector.schema_id, {
        ...signed,
        lifecycle: 'archived',
      })).toBe(false)
    })
  }

  it('fails closed for non-document verification inputs', () => {
    const schemaId = fixtures.hash_vectors[0].schema_id
    for (const input of [null, undefined, 0, 'not-a-document', []]) {
      expect(
        hasValidCanonicalCapabilityDocumentHashV1(schemaId, input as never),
      ).toBe(false)
    }
  })

  it('hashes enumerable __proto__ input instead of dropping it', () => {
    const vector = fixtures.hash_vectors[0]
    const injected = {
      ...vector.document_without_hash,
    }
    Object.defineProperty(injected, '__proto__', {
      value: 'tampered-prototype-member',
      enumerable: true,
      configurable: true,
      writable: true,
    })

    expect(Object.hasOwn(injected, '__proto__')).toBe(true)
    expect(canonicalCapabilityDocumentHashV1(vector.schema_id, injected)).not.toBe(
      vector.expected_hash,
    )
    expect(
      hasValidCanonicalCapabilityDocumentHashV1(vector.schema_id, {
        ...injected,
        canonical_document_hash: vector.expected_hash,
      }),
    ).toBe(false)
  })

  it('requires an own enumerable data-property hash claim', () => {
    const vector = fixtures.hash_vectors[0]
    const unsigned = {
      ...vector.document_without_hash,
    }
    const priorDescriptor = Object.getOwnPropertyDescriptor(
      Object.prototype,
      'canonical_document_hash',
    )

    try {
      Object.defineProperty(Object.prototype, 'canonical_document_hash', {
        value: vector.expected_hash,
        enumerable: false,
        configurable: true,
        writable: true,
      })
      expect(
        hasValidCanonicalCapabilityDocumentHashV1(vector.schema_id, unsigned),
      ).toBe(false)
    } finally {
      if (priorDescriptor) {
        Object.defineProperty(
          Object.prototype,
          'canonical_document_hash',
          priorDescriptor,
        )
      } else {
        Reflect.deleteProperty(Object.prototype, 'canonical_document_hash')
      }
    }

    let accessorRead = false
    const accessorClaim = {
      ...vector.document_without_hash,
    }
    Object.defineProperty(accessorClaim, 'canonical_document_hash', {
      get() {
        accessorRead = true
        return vector.expected_hash
      },
      enumerable: true,
      configurable: true,
    })
    expect(
      hasValidCanonicalCapabilityDocumentHashV1(
        vector.schema_id,
        accessorClaim,
      ),
    ).toBe(false)
    expect(accessorRead).toBe(false)

    const hiddenClaim = {
      ...vector.document_without_hash,
    }
    Object.defineProperty(hiddenClaim, 'canonical_document_hash', {
      value: vector.expected_hash,
      enumerable: false,
      configurable: true,
    })
    expect(
      hasValidCanonicalCapabilityDocumentHashV1(vector.schema_id, hiddenClaim),
    ).toBe(false)
  })

  it('rejects schema ids inherited through the version map prototype', () => {
    const vector = fixtures.hash_vectors[0]
    const rogueSchemaId = 'prototype-polluted-capability-schema'
    const priorDescriptor = Object.getOwnPropertyDescriptor(
      Object.prototype,
      rogueSchemaId,
    )

    try {
      Object.defineProperty(Object.prototype, rogueSchemaId, {
        value: vector.document_without_hash.schema_version,
        enumerable: false,
        configurable: true,
        writable: true,
      })
      expect(() =>
        canonicalCapabilityDocumentHashV1(
          rogueSchemaId as CapabilityContractSchemaIdV1,
          vector.document_without_hash,
        ),
      ).toThrow(/unsupported capability contract schema id/)
    } finally {
      if (priorDescriptor) {
        Object.defineProperty(Object.prototype, rogueSchemaId, priorDescriptor)
      } else {
        Reflect.deleteProperty(Object.prototype, rogueSchemaId)
      }
    }
  })
})

describe('Capability Contract Core v1 generated parity', () => {
  it('is available through the published capability subpath', () => {
    expect(capabilityPackage.CapabilityIdentifierV1.$id).toBe(
      'https://widgetdc.com/contracts/capability/CapabilityIdentifierV1.json',
    )
    expect(capabilityPackage.CapabilityDefinitionV1.$id).toBe(
      'https://widgetdc.com/contracts/capability/CapabilityDefinitionV1.json',
    )
    expect(capabilityPackage.CapabilityRequirementV1.$id).toBe(
      'https://widgetdc.com/contracts/capability/CapabilityRequirementV1.json',
    )
    expect(capabilityPackage.AuthorityGrantRefV1.$id).toBe(
      'https://widgetdc.com/contracts/capability/AuthorityGrantRefV1.json',
    )
    expect(capabilityPackage.AliasResolutionResultV1.$id).toBe(
      'https://widgetdc.com/contracts/capability/AliasResolutionResultV1.json',
    )
    const authorityFixture = fixtures.cases.find(
      (fixture) => fixture.name === 'authority grant reference is inert',
    )
    expect(authorityFixture).toBeDefined()
    expect(
      Value.Check(
        capabilityPackage.AuthorityGrantRefV1,
        authorityFixture!.value,
      ),
    ).toBe(true)
  })

  it('exports exactly the five public JSON Schema roots', () => {
    const moduleDir = join(repoRoot, 'schemas', 'capability')
    const exportedNames = Object.keys(schemas).sort()
    const expectedNames = [
      'AliasResolutionResultV1',
      'AuthorityGrantRefV1',
      'CapabilityDefinitionV1',
      'CapabilityIdentifierV1',
      'CapabilityRequirementV1',
    ]
    expect(exportedNames).toEqual(expectedNames)
    expect(
      readdirSync(moduleDir)
        .filter((fileName) => fileName.endsWith('.json'))
        .sort(),
    ).toEqual(expectedNames.map((name) => `${name}.json`))

    for (const schemaName of expectedNames) {
      const generated = JSON.parse(
        readFileSync(join(moduleDir, `${schemaName}.json`), 'utf-8'),
      )
      const source = JSON.parse(JSON.stringify(schemas[schemaName as SchemaName]))
      expect(generated).toEqual(source)
    }
  })

  it('validates the same fixture corpus through generated Pydantic models', () => {
    const script = `
import hashlib
import json
from pathlib import Path
from pydantic import ValidationError
from widgetdc_contracts.capability import (
    AliasResolutionResultV1,
    AuthorityGrantRefV1,
    CapabilityDefinitionV1,
    CapabilityIdentifierV1,
    CapabilityRequirementV1,
)

schemas = {
    "CapabilityIdentifierV1": CapabilityIdentifierV1,
    "CapabilityDefinitionV1": CapabilityDefinitionV1,
    "CapabilityRequirementV1": CapabilityRequirementV1,
    "AuthorityGrantRefV1": AuthorityGrantRefV1,
    "AliasResolutionResultV1": AliasResolutionResultV1,
}
fixture_path = Path.cwd().parent / "tests" / "fixtures" / "capability-contract-core-v1.json"
fixtures = json.loads(fixture_path.read_text(encoding="utf-8"))

def contains_explicit_none(value):
    if value is None:
        return True
    if isinstance(value, dict):
        return any(contains_explicit_none(item) for item in value.values())
    if isinstance(value, list):
        return any(contains_explicit_none(item) for item in value)
    return False

for vector in fixtures["hash_vectors"]:
    document = dict(vector["document_without_hash"])
    schema_version = document.pop("schema_version")
    document.pop("canonical_document_hash", None)
    envelope = {
        "object_type": vector["schema_id"],
        "payload": document,
        "schema_version": schema_version,
    }
    canonical_input = json.dumps(
        envelope,
        ensure_ascii=False,
        allow_nan=False,
        separators=(",", ":"),
        sort_keys=True,
    )
    observed_hash = "sha256:" + hashlib.sha256(
        canonical_input.encode("utf-8")
    ).hexdigest()
    if observed_hash != vector["expected_hash"]:
        raise AssertionError(
            f"Python hash parity mismatch for {vector['name']}: "
            f"expected {vector['expected_hash']}, got {observed_hash}"
        )

for case in fixtures["cases"]:
    try:
        validated = schemas[case["schema"]].model_validate(case["value"])
        accepted = True
    except ValidationError:
        validated = None
        accepted = False
    if accepted != case["valid"]:
        raise AssertionError(
            f"Pydantic parity mismatch for {case['name']}: expected {case['valid']}, got {accepted}"
        )
    if validated is not None:
        dumped = validated.model_dump(mode="json")
        dumped_json = json.loads(validated.model_dump_json())
        if contains_explicit_none(dumped) or contains_explicit_none(dumped_json):
            raise AssertionError(
                f"Pydantic serialization emitted explicit null for omitted field in {case['name']}"
            )
        if dumped != case["value"] or dumped_json != case["value"]:
            raise AssertionError(
                f"Pydantic wire round-trip mismatch for {case['name']}"
            )

definition_case = next(
    case for case in fixtures["cases"] if case["name"] == "active capability definition"
)
definition_model = CapabilityDefinitionV1.model_validate(definition_case["value"])
mixed_definition = dict(definition_case["value"])
mixed_definition["operation_refs"] = [
    definition_model.operation_refs[0],
    definition_case["value"]["operation_refs"][0],
]
try:
    CapabilityDefinitionV1.model_validate(mixed_definition)
    raise AssertionError("Pydantic accepted duplicate mixed-form operation references")
except ValidationError:
    pass

ambiguous_case = next(
    case
    for case in fixtures["cases"]
    if case["name"] == "ambiguous alias exposes candidates but no selection"
)
ambiguous_model = AliasResolutionResultV1.model_validate(ambiguous_case["value"])
mixed_ambiguous = dict(ambiguous_case["value"])
mixed_ambiguous["candidate_capability_ids"] = [
    ambiguous_model.root.candidate_capability_ids[0],
    ambiguous_case["value"]["candidate_capability_ids"][0],
]
try:
    AliasResolutionResultV1.model_validate(mixed_ambiguous)
    raise AssertionError("Pydantic accepted duplicate mixed-form alias candidates")
except ValidationError:
    pass
`
    const result = spawnSync('python', ['-c', script], {
      cwd: join(repoRoot, 'python'),
      encoding: 'utf-8',
    })

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)
  })
})
