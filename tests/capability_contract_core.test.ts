import '../src/formats.js'

import { readFileSync } from 'node:fs'
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
        schemas[case["schema"]].model_validate(case["value"])
        accepted = True
    except ValidationError:
        accepted = False
    if accepted != case["valid"]:
        raise AssertionError(
            f"Pydantic parity mismatch for {case['name']}: expected {case['valid']}, got {accepted}"
        )
`
    const result = spawnSync('python', ['-c', script], {
      cwd: join(repoRoot, 'python'),
      encoding: 'utf-8',
    })

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)
  })
})
