import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { Value } from '@sinclair/typebox/value'
import { describe, expect, it } from 'vitest'
import * as capabilityPackage from '@widgetdc/contracts/capability'

import {
  AliasResolutionResultV1,
  AuthorityGrantRefV1,
  CAPABILITY_CONTRACT_SCHEMA_IDS,
  CanonicalIdentityEnvelopeV1,
  CapabilityDefinitionV1,
  CapabilityIdentifierV1,
  CapabilityRequirementV1,
  canonicalCapabilityDocumentHashV1,
  type CapabilityContractSchemaIdV1,
} from '../src/capability/index.js'

const HASH = `sha256:${'0'.repeat(64)}`
const DEFINITION_HASH = `sha256:${'1'.repeat(64)}`
const repoRoot = process.cwd()

type SchemaName = keyof typeof schemas

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

const schemas = {
  AliasResolutionResultV1,
  AuthorityGrantRefV1,
  CanonicalIdentityEnvelopeV1,
  CapabilityDefinitionV1,
  CapabilityIdentifierV1,
  CapabilityRequirementV1,
}
const fixtures = JSON.parse(
  readFileSync(
    join(repoRoot, 'tests', 'fixtures', 'capability-contract-core-v1.json'),
    'utf-8',
  ),
) as { cases: FixtureCase[], hash_vectors: HashVector[] }

function capabilityIdentifier() {
  return {
    schema_version: 'wdc.capability_identifier.v1',
    definition_version: '1.0.0',
    canonicalization_profile: 'jcs-rfc8785-v1',
    hash_algorithm: 'sha256',
    canonical_document_hash: HASH,
    capability_id: 'urn:wdc:capability:reasoning:deep-plan:v1',
  }
}

function versionIncompatible(requestedVersionToken: string) {
  return {
    schema_version: 'wdc.alias_resolution_result.v1',
    definition_version: '1.0.0',
    canonicalization_profile: 'jcs-rfc8785-v1',
    hash_algorithm: 'sha256',
    canonical_document_hash: HASH,
    alias: 'legacy/reason-deeply',
    status: 'unresolved',
    reason: 'version_incompatible',
    matched_capability_id: capabilityIdentifier(),
    requested_version_token: requestedVersionToken,
  }
}

function canonicalIdentityEnvelope() {
  return {
    schema_version: 'wdc.canonical_identity_envelope.v1',
    capability_id: 'urn:wdc:capability:reasoning:deep-plan:v1',
    canonical_document_hash: DEFINITION_HASH,
  }
}

describe('Capability Contract Core v1 baseline', () => {
  for (const fixture of fixtures.cases) {
    it(`${fixture.valid ? 'accepts' : 'rejects'} ${fixture.name}`, () => {
      expect(
        Value.Check(
          schemas[fixture.schema],
          [CapabilityIdentifierV1],
          fixture.value,
        ),
      ).toBe(fixture.valid)
    })
  }

  for (const vector of fixtures.hash_vectors) {
    it(`matches canonical hash vector: ${vector.name}`, () => {
      expect(
        canonicalCapabilityDocumentHashV1(
          vector.schema_id,
          vector.document_without_hash,
        ),
      ).toBe(vector.expected_hash)
      expect(
        canonicalCapabilityDocumentHashV1(
          vector.schema_id,
          Object.fromEntries(Object.entries(vector.document_without_hash).reverse()),
        ),
      ).toBe(vector.expected_hash)
    })
  }

  it('publishes and materializes exactly the six public roots', () => {
    expect(Object.keys(CAPABILITY_CONTRACT_SCHEMA_IDS).sort()).toEqual(
      Object.keys(schemas).sort(),
    )
    expect(capabilityPackage.CapabilityIdentifierV1.$id).toBe(
      CAPABILITY_CONTRACT_SCHEMA_IDS.CapabilityIdentifierV1,
    )

    const schemaDir = join(repoRoot, 'schemas', 'capability')
    expect(
      readdirSync(schemaDir)
        .filter((fileName) => fileName.endsWith('.json'))
        .sort(),
    ).toEqual(Object.keys(schemas).sort().map((name) => `${name}.json`))
  })

  it('validates the fixture corpus through generated Pydantic models', () => {
    const script = `
import json
from pathlib import Path
from pydantic import ValidationError
from widgetdc_contracts.capability import (
    AliasResolutionResultV1,
    AuthorityGrantRefV1,
    CanonicalIdentityEnvelopeV1,
    CapabilityDefinitionV1,
    CapabilityIdentifierV1,
    CapabilityRequirementV1,
)

schemas = {
    "AliasResolutionResultV1": AliasResolutionResultV1,
    "AuthorityGrantRefV1": AuthorityGrantRefV1,
    "CanonicalIdentityEnvelopeV1": CanonicalIdentityEnvelopeV1,
    "CapabilityDefinitionV1": CapabilityDefinitionV1,
    "CapabilityIdentifierV1": CapabilityIdentifierV1,
    "CapabilityRequirementV1": CapabilityRequirementV1,
}
fixture_path = Path.cwd().parent / "tests" / "fixtures" / "capability-contract-core-v1.json"
fixtures = json.loads(fixture_path.read_text(encoding="utf-8"))

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
        if validated.model_dump(mode="json") != case["value"]:
            raise AssertionError(f"Pydantic wire round-trip mismatch for {case['name']}")
        if json.loads(validated.model_dump_json()) != case["value"]:
            raise AssertionError(f"Pydantic JSON round-trip mismatch for {case['name']}")
`
    const result = spawnSync('python', ['-c', script], {
      cwd: join(repoRoot, 'python'),
      encoding: 'utf-8',
    })
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)
  })
})

describe('Capability Contract Core v1 version-incompatible result', () => {
  it.each(['v1', 'v12'])('accepts exact canonical version token %s', (token) => {
    expect(
      Value.Check(
        AliasResolutionResultV1,
        [CapabilityIdentifierV1],
        versionIncompatible(token),
      ),
    ).toBe(true)
  })

  it.each(['v0', '1', '12', 'v01', 'V1', 'v1.0', 'v-1'])(
    'rejects non-canonical version token %s',
    (token) => {
      expect(
        Value.Check(
          AliasResolutionResultV1,
          [CapabilityIdentifierV1],
          versionIncompatible(token),
        ),
      ).toBe(false)
    },
  )

  it('rejects missing or malformed matched capability identity', () => {
    const missing = versionIncompatible('v2')
    Reflect.deleteProperty(missing, 'matched_capability_id')
    expect(
      Value.Check(AliasResolutionResultV1, [CapabilityIdentifierV1], missing),
    ).toBe(false)

    expect(
      Value.Check(
        AliasResolutionResultV1,
        [CapabilityIdentifierV1],
        {
          ...versionIncompatible('v2'),
          matched_capability_id: 'urn:wdc:capability:reasoning:deep-plan:v1',
        },
      ),
    ).toBe(false)
  })

  it('rejects status/reason confusion and extra properties', () => {
    expect(
      Value.Check(
        AliasResolutionResultV1,
        [CapabilityIdentifierV1],
        { ...versionIncompatible('v2'), status: 'resolved' },
      ),
    ).toBe(false)
    expect(
      Value.Check(
        AliasResolutionResultV1,
        [CapabilityIdentifierV1],
        { ...versionIncompatible('v2'), reason: 'unknown_alias' },
      ),
    ).toBe(false)
    expect(
      Value.Check(
        AliasResolutionResultV1,
        [CapabilityIdentifierV1],
        { ...versionIncompatible('v2'), fallback_provider: 'qwen' },
      ),
    ).toBe(false)
  })

  it('keeps exactly six canonical Capability Core roots', () => {
    expect(Object.keys(CAPABILITY_CONTRACT_SCHEMA_IDS).sort()).toEqual([
      'AliasResolutionResultV1',
      'AuthorityGrantRefV1',
      'CanonicalIdentityEnvelopeV1',
      'CapabilityDefinitionV1',
      'CapabilityIdentifierV1',
      'CapabilityRequirementV1',
    ])
  })
})

describe('Canonical Identity Envelope v1', () => {
  it('publishes a closed reference envelope', () => {
    expect(
      Reflect.get(capabilityPackage, 'CanonicalIdentityEnvelopeV1'),
    ).toBeDefined()
    expect(
      Value.Check(
        CanonicalIdentityEnvelopeV1,
        canonicalIdentityEnvelope(),
      ),
    ).toBe(true)
  })

  it('requires the capability id and authoritative definition hash', () => {
    const missingCapabilityId = canonicalIdentityEnvelope()
    Reflect.deleteProperty(missingCapabilityId, 'capability_id')
    expect(
      Value.Check(CanonicalIdentityEnvelopeV1, missingCapabilityId),
    ).toBe(false)

    const missingHash = canonicalIdentityEnvelope()
    Reflect.deleteProperty(missingHash, 'canonical_document_hash')
    expect(Value.Check(CanonicalIdentityEnvelopeV1, missingHash)).toBe(false)
  })

  it('rejects malformed hashes and aliases in the capability id slot', () => {
    expect(
      Value.Check(CanonicalIdentityEnvelopeV1, {
        ...canonicalIdentityEnvelope(),
        canonical_document_hash: 'sha256:not-a-hash',
      }),
    ).toBe(false)
    expect(
      Value.Check(CanonicalIdentityEnvelopeV1, {
        ...canonicalIdentityEnvelope(),
        capability_id: 'legacy/reason-deeply',
      }),
    ).toBe(false)
  })

  it('rejects extra fields and self-hash metadata', () => {
    expect(
      Value.Check(CanonicalIdentityEnvelopeV1, {
        ...canonicalIdentityEnvelope(),
        selected_provider: 'qwen',
      }),
    ).toBe(false)
    expect(
      Value.Check(CanonicalIdentityEnvelopeV1, {
        ...canonicalIdentityEnvelope(),
        definition_version: '1.0.0',
      }),
    ).toBe(false)
  })
})
