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
  CapabilityChainEdgeV1,
  CapabilityDefinitionRefV1,
  CapabilityDefinitionV1,
  CapabilityIdentifierV1,
  CapabilityRequirementV1,
  canonicalCapabilityDocumentHashV1,
  evaluateCapabilityChainEdgeCoverage,
  hasValidCanonicalCapabilityDocumentHashV1,
  type CapabilityContractSchemaIdV1,
} from '../src/capability/index.js'

const HASH = `sha256:${'0'.repeat(64)}`
const SOURCE_DEFINITION_HASH = `sha256:${'1'.repeat(64)}`
const TARGET_DEFINITION_HASH = `sha256:${'2'.repeat(64)}`
const EDGE_SCHEMA_ID = (
  'https://widgetdc.com/contracts/capability/CapabilityChainEdgeV1.json'
) as CapabilityContractSchemaIdV1
const IDENTIFIER_SCHEMA_ID = (
  'https://widgetdc.com/contracts/capability/CapabilityIdentifierV1.json'
) as CapabilityContractSchemaIdV1
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
  CapabilityChainEdgeV1,
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

function capabilityIdentifierWithValidHash(
  capabilityId = 'urn:wdc:capability:reasoning:deep-plan:v1',
) {
  const identifier = { ...capabilityIdentifier(), capability_id: capabilityId }
  return {
    ...identifier,
    canonical_document_hash: canonicalCapabilityDocumentHashV1(
      IDENTIFIER_SCHEMA_ID,
      identifier,
    ),
  }
}

function capabilityChainEdge() {
  return {
    schema_version: 'wdc.capability_chain_edge.v1',
    definition_version: '1.0.0',
    canonicalization_profile: 'jcs-rfc8785-v1',
    hash_algorithm: 'sha256',
    canonical_document_hash: HASH,
    source: {
      capability_identifier: capabilityIdentifierWithValidHash(),
      definition_document_hash: SOURCE_DEFINITION_HASH,
    },
    target: {
      capability_identifier: capabilityIdentifierWithValidHash(
        'urn:wdc:capability:contracts:validate-schema:v1',
      ),
      definition_document_hash: TARGET_DEFINITION_HASH,
    },
    edge_property: 'requires',
  }
}

function capabilityChainEdgeWithValidHash() {
  const edge = capabilityChainEdge()
  return {
    ...edge,
    canonical_document_hash: canonicalCapabilityDocumentHashV1(
      EDGE_SCHEMA_ID,
      edge,
    ),
  }
}

function coverageRequirement(sourceRef: string, sourceHash: string) {
  return {
    source_ref: sourceRef,
    source_hash: sourceHash,
    edge: capabilityChainEdgeWithValidHash(),
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
    CapabilityChainEdgeV1,
    CapabilityDefinitionV1,
    CapabilityIdentifierV1,
    CapabilityRequirementV1,
)

schemas = {
    "AliasResolutionResultV1": AliasResolutionResultV1,
    "AuthorityGrantRefV1": AuthorityGrantRefV1,
    "CapabilityChainEdgeV1": CapabilityChainEdgeV1,
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
      'CapabilityChainEdgeV1',
      'CapabilityDefinitionV1',
      'CapabilityIdentifierV1',
      'CapabilityRequirementV1',
    ])
  })
})

describe('Capability Chain Edge v1 identity envelope', () => {
  it('publishes a closed definition reference without conflating its hash with the edge self-hash', () => {
    const edge = capabilityChainEdge()
    const edgeHash = canonicalCapabilityDocumentHashV1(EDGE_SCHEMA_ID, edge)
    const validEdge = { ...edge, canonical_document_hash: edgeHash }

    expect(
      Reflect.get(capabilityPackage, 'CapabilityDefinitionRefV1'),
    ).toBeDefined()
    expect(
      Value.Check(
        CapabilityDefinitionRefV1,
        [CapabilityIdentifierV1],
        validEdge.source,
      ),
    ).toBe(true)
    expect(
      hasValidCanonicalCapabilityDocumentHashV1(EDGE_SCHEMA_ID, {
        ...validEdge,
        canonical_document_hash: validEdge.source.definition_document_hash,
      }),
    ).toBe(false)
    expect(
      hasValidCanonicalCapabilityDocumentHashV1(EDGE_SCHEMA_ID, validEdge),
    ).toBe(true)
  })

  it('publishes a closed endpoint-qualified edge', () => {
    expect(Reflect.get(capabilityPackage, 'CapabilityChainEdgeV1')).toBeDefined()
    expect(
      Value.Check(
        CapabilityChainEdgeV1,
        [CapabilityIdentifierV1],
        capabilityChainEdge(),
      ),
    ).toBe(true)
  })

  it('requires both endpoint definition hashes', () => {
    const missingSourceHash = capabilityChainEdge()
    Reflect.deleteProperty(missingSourceHash.source, 'definition_document_hash')
    expect(
      Value.Check(
        CapabilityChainEdgeV1,
        [CapabilityIdentifierV1],
        missingSourceHash,
      ),
    ).toBe(false)
  })

  it.each(['dispatches_to', 'authorizes', 'selects_provider', 'uses_tool'])(
    'rejects non-capability relation %s',
    (edgeProperty) => {
      expect(
        Value.Check(CapabilityChainEdgeV1, [CapabilityIdentifierV1], {
          ...capabilityChainEdge(),
          edge_property: edgeProperty,
        }),
      ).toBe(false)
    },
  )

  it('keeps endpoint hashes distinct and hashes deterministically', () => {
    const edge = capabilityChainEdge()
    const edgeHash = canonicalCapabilityDocumentHashV1(EDGE_SCHEMA_ID, edge)
    const validEdge = { ...edge, canonical_document_hash: edgeHash }
    expect(
      hasValidCanonicalCapabilityDocumentHashV1(EDGE_SCHEMA_ID, validEdge),
    ).toBe(true)
    expect(edgeHash).not.toBe(validEdge.source.definition_document_hash)
    expect(edgeHash).not.toBe(validEdge.target.definition_document_hash)
    expect(
      canonicalCapabilityDocumentHashV1(
        EDGE_SCHEMA_ID,
        Object.fromEntries(Object.entries(edge).reverse()),
      ),
    ).toBe(edgeHash)
  })

  it('never treats empty 0/0 coverage as passing', () => {
    expect(evaluateCapabilityChainEdgeCoverage([], [])).toEqual({
      status: 'empty',
      required_count: 0,
      routable_count: 0,
      coverage_rate: null,
      passes: false,
    })
  })

  it('reports partial and complete evidence-reference coverage', () => {
    const first = coverageRequirement('archive/first.md', SOURCE_DEFINITION_HASH)
    const second = coverageRequirement('archive/second.md', TARGET_DEFINITION_HASH)
    expect(evaluateCapabilityChainEdgeCoverage(
      [first, second],
      [{ ...first, routability_evidence_ref: 'route:smoke:first' }],
    ).passes).toBe(false)
    expect(evaluateCapabilityChainEdgeCoverage(
      [first, second],
      [
        { ...first, routability_evidence_ref: 'route:smoke:first' },
        { ...second, routability_evidence_ref: 'route:smoke:second' },
      ],
    )).toEqual({
      status: 'complete',
      required_count: 2,
      routable_count: 2,
      coverage_rate: 1,
      passes: true,
    })
  })

  it('deduplicates identical source/hash requirements', () => {
    const first = coverageRequirement('archive/first.md', SOURCE_DEFINITION_HASH)
    expect(evaluateCapabilityChainEdgeCoverage(
      [first, { ...first, edge: { ...first.edge } }],
      [{ ...first, routability_evidence_ref: 'route:smoke:first' }],
    ).required_count).toBe(1)
  })

  it('rejects coverage when a nested identifier hash is forged', () => {
    const required = coverageRequirement('archive/first.md', SOURCE_DEFINITION_HASH)
    const forgedWithoutEdgeHash = {
      ...required.edge,
      source: {
        ...required.edge.source,
        capability_identifier: {
          ...required.edge.source.capability_identifier,
          canonical_document_hash: `sha256:${'a'.repeat(64)}`,
        },
      },
    }
    const forged = {
      ...forgedWithoutEdgeHash,
      canonical_document_hash: canonicalCapabilityDocumentHashV1(
        EDGE_SCHEMA_ID,
        forgedWithoutEdgeHash,
      ),
    }
    expect(evaluateCapabilityChainEdgeCoverage(
      [{ ...required, edge: forged }],
      [{
        ...required,
        edge: forged,
        routability_evidence_ref: 'route:smoke:forged',
      }],
    ).passes).toBe(false)
  })

  it('rejects a rehashed edge missing endpoint definition identity', () => {
    const required = coverageRequirement('archive/first.md', SOURCE_DEFINITION_HASH)
    const incompleteWithoutEdgeHash = {
      ...required.edge,
      source: {
        capability_identifier: required.edge.source.capability_identifier,
      },
    }
    const incomplete = {
      ...incompleteWithoutEdgeHash,
      canonical_document_hash: canonicalCapabilityDocumentHashV1(
        EDGE_SCHEMA_ID,
        incompleteWithoutEdgeHash,
      ),
    }
    const malformed = {
      ...required,
      edge: incomplete as unknown as typeof required.edge,
    }
    expect(evaluateCapabilityChainEdgeCoverage(
      [malformed],
      [{ ...malformed, routability_evidence_ref: 'route:smoke:incomplete' }],
    ).passes).toBe(false)
  })

  it('rejects malformed coverage and evidence references', () => {
    const required = coverageRequirement('archive/first.md', SOURCE_DEFINITION_HASH)
    expect(evaluateCapabilityChainEdgeCoverage(
      [{ ...required, source_ref: '' }],
      [{ ...required, source_ref: '', routability_evidence_ref: 'x' }],
    ).passes).toBe(false)
    expect(evaluateCapabilityChainEdgeCoverage(
      [{ ...required, source_hash: '' }],
      [{ ...required, source_hash: '', routability_evidence_ref: 'x' }],
    ).passes).toBe(false)
    expect(evaluateCapabilityChainEdgeCoverage(
      [required],
      [{ ...required, routability_evidence_ref: ' evidence ' }],
    ).passes).toBe(false)
  })

  it('fails closed for conflicting edges on one source/hash key', () => {
    const required = coverageRequirement('archive/first.md', SOURCE_DEFINITION_HASH)
    const conflictingWithoutHash = {
      ...required.edge,
      edge_property: 'requires' as const,
      target: {
        ...required.edge.target,
        definition_document_hash: `sha256:${'f'.repeat(64)}`,
      },
    }
    const conflicting = {
      ...required,
      edge: {
        ...conflictingWithoutHash,
        canonical_document_hash: canonicalCapabilityDocumentHashV1(
          EDGE_SCHEMA_ID,
          conflictingWithoutHash,
        ),
      },
    }
    expect(evaluateCapabilityChainEdgeCoverage(
      [required, { ...required }, conflicting],
      [{ ...required, routability_evidence_ref: 'route:smoke:first' }],
    ).passes).toBe(false)
  })
})
