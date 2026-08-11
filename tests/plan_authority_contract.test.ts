import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { Value } from '@sinclair/typebox/value'
import { describe, expect, it } from 'vitest'
import '../src/formats.js'
import * as orchestratorPackage from '@widgetdc/contracts/orchestrator'

import {
  PLAN_AUTHORITY_SCHEMA_IDS,
  PlanAuthorityAdmissionResultV1,
  PlanAuthorityEnvelopeV1,
  canonicalPlanAuthorityDocumentHashV1,
  hasValidCanonicalPlanAuthorityDocumentHashV1,
} from '../src/orchestrator/index.js'

const repoRoot = process.cwd()
const fixturePath = join(repoRoot, 'tests', 'fixtures', 'plan-authority-v1.json')
const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8')) as {
  golden_vectors: Array<{ name: string; document: Record<string, unknown> }>
  schema_mutations: Array<{
    name: string
    path: string
    operation: 'delete' | 'replace'
    value?: unknown
  }>
  hash_mutations: Array<{ name: string; path: string; value: unknown }>
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function mutate(
  source: Record<string, unknown>,
  path: string,
  operation: 'delete' | 'replace',
  value?: unknown,
): Record<string, unknown> {
  const result = clone(source)
  const segments = path.split('.')
  const leaf = segments.pop()!
  let target = result
  for (const segment of segments) {
    target = target[segment] as Record<string, unknown>
  }
  if (operation === 'delete') {
    Reflect.deleteProperty(target, leaf)
  } else {
    target[leaf] = value
  }
  return result
}

describe('Plan Authority Contract v1', () => {
  const golden = fixture.golden_vectors[0].document

  it('publishes one closed, versioned canonical authority envelope', () => {
    expect(Value.Check(PlanAuthorityEnvelopeV1, golden)).toBe(true)
    expect(hasValidCanonicalPlanAuthorityDocumentHashV1(golden)).toBe(true)
    expect(orchestratorPackage.PlanAuthorityEnvelopeV1.$id).toBe(
      PLAN_AUTHORITY_SCHEMA_IDS.PlanAuthorityEnvelopeV1,
    )
  })

  for (const vector of fixture.schema_mutations) {
    it(`fails closed for ${vector.name}`, () => {
      const candidate = mutate(golden, vector.path, vector.operation, vector.value)
      expect(Value.Check(PlanAuthorityEnvelopeV1, candidate)).toBe(false)
      expect(hasValidCanonicalPlanAuthorityDocumentHashV1(candidate)).toBe(false)
    })
  }

  for (const vector of fixture.hash_mutations) {
    it(`invalidates the canonical hash for ${vector.name}`, () => {
      const candidate = mutate(golden, vector.path, 'replace', vector.value)
      expect(Value.Check(PlanAuthorityEnvelopeV1, candidate)).toBe(true)
      expect(hasValidCanonicalPlanAuthorityDocumentHashV1(candidate)).toBe(false)
      expect(
        canonicalPlanAuthorityDocumentHashV1(candidate),
      ).not.toBe(golden.canonical_document_hash)
    })
  }

  it('admits only fully verified canonical envelopes', () => {
    expect(Value.Check(PlanAuthorityAdmissionResultV1, {
      schema_version: 'wdc.plan_authority_admission_result.v1',
      status: 'admitted',
      plan: golden,
      execution_admitted: true,
    })).toBe(true)

    expect(Value.Check(PlanAuthorityAdmissionResultV1, {
      schema_version: 'wdc.plan_authority_admission_result.v1',
      status: 'admitted',
      plan: golden,
      execution_admitted: false,
    })).toBe(false)
  })

  it('represents legacy input only as an explicit non-admitted rejection', () => {
    const rejection = {
      schema_version: 'wdc.plan_authority_admission_result.v1',
      status: 'rejected',
      reason: 'legacy_unversioned_plan',
      execution_admitted: false,
    }
    expect(Value.Check(PlanAuthorityAdmissionResultV1, rejection)).toBe(true)
    expect(Value.Check(PlanAuthorityAdmissionResultV1, {
      ...rejection,
      execution_admitted: true,
    })).toBe(false)
  })

  it('validates golden and mutation vectors through generated Pydantic models', () => {
    const script = `
import json
from pathlib import Path
from pydantic import ValidationError
from widgetdc_contracts.orchestrator import PlanAuthorityEnvelopeV1

fixtures = json.loads(Path(${JSON.stringify(fixturePath)}).read_text(encoding="utf-8"))
golden = fixtures["golden_vectors"][0]["document"]
PlanAuthorityEnvelopeV1.model_validate(golden)

for mutation in fixtures["schema_mutations"]:
    candidate = json.loads(json.dumps(golden))
    parts = mutation["path"].split(".")
    target = candidate
    for part in parts[:-1]:
        target = target[part]
    if mutation["operation"] == "delete":
        del target[parts[-1]]
    else:
        target[parts[-1]] = mutation.get("value")
    try:
        PlanAuthorityEnvelopeV1.model_validate(candidate)
    except ValidationError:
        continue
    raise AssertionError(f"Pydantic accepted mutation: {mutation['name']}")
`
    const result = spawnSync('python', ['-c', script], {
      cwd: join(repoRoot, 'python'),
      encoding: 'utf-8',
    })
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)
  })
})
