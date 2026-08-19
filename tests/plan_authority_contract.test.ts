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
  PlanAuthorityAdmissionResultV2,
  PlanAuthorityEnvelopeV1,
  PlanAuthorityEnvelopeV2,
  canonicalPlanAuthorityDocumentHashV1,
  canonicalPlanAuthorityPayloadHashV2,
  canonicalPlanAuthorityScopeHashV2,
  evaluatePlanAuthorityAdmissionV1,
  evaluatePlanAuthorityAdmissionV2,
  hasValidCanonicalPlanAuthorityDocumentHashV1,
  hasValidCanonicalPlanAuthorityPayloadHashV2,
  hasValidCanonicalPlanAuthorityScopeHashV2,
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
const fixtureV2Path = join(repoRoot, 'tests', 'fixtures', 'plan-authority-v2.json')
const fixtureV2 = JSON.parse(readFileSync(fixtureV2Path, 'utf-8')) as {
  golden_vectors: Array<{ name: string; document: Record<string, unknown> }>
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

function rehash(document: Record<string, unknown>): Record<string, unknown> {
  const result = clone(document)
  result.canonical_document_hash = canonicalPlanAuthorityDocumentHashV1(result)
  return result
}

function rehashV2(document: Record<string, unknown>): Record<string, unknown> {
  const result = clone(document)
  result.scope_hash = canonicalPlanAuthorityScopeHashV2(result.scope)
  result.canonical_payload_hash = canonicalPlanAuthorityPayloadHashV2(result)
  return result
}

describe('Plan Authority Contract v1', () => {
  const golden = fixture.golden_vectors[0].document

  it('rejects a stale canonical hash before constructing an admitted result', () => {
    const tampered = mutate(
      golden,
      'exact_head_sha',
      'replace',
      'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    )
    expect(evaluatePlanAuthorityAdmissionV1(tampered, {
      clock: () => new Date('2026-08-11T18:00:00.000Z'),
    })).toEqual({
      schema_version: 'wdc.plan_authority_admission_result.v1',
      status: 'rejected',
      reason: 'hash_mismatch',
      execution_admitted: false,
    })
  })

  it('enforces the half-open approval window at every boundary', () => {
    const evaluateAt = (document: Record<string, unknown>, instant: string) =>
      evaluatePlanAuthorityAdmissionV1(document, {
        clock: () => new Date(instant),
      })
    const withWindow = (issuedAt: string, expiresAt: string) => {
      const document = clone(golden)
      const approval = document.approval_binding as Record<string, unknown>
      approval.issued_at = issuedAt
      approval.expires_at = expiresAt
      return rehash(document)
    }

    expect(evaluateAt(
      withWindow('2026-08-12T00:00:00Z', '2026-08-11T00:00:00Z'),
      '2026-08-11T12:00:00Z',
    )).toMatchObject({ status: 'rejected', reason: 'authority_window_invalid' })
    expect(evaluateAt(golden, '2026-08-11T16:59:59.999Z')).toMatchObject({
      status: 'rejected',
      reason: 'authority_not_yet_valid',
    })
    expect(evaluateAt(golden, '2026-08-12T17:00:00.000Z')).toMatchObject({
      status: 'rejected',
      reason: 'authority_expired',
    })
    expect(evaluateAt(golden, '2026-08-11T17:00:00.000Z')).toMatchObject({
      status: 'admitted',
      execution_admitted: true,
    })
  })

  it('fails closed when the injected clock returns an invalid instant', () => {
    expect(evaluatePlanAuthorityAdmissionV1(golden, {
      clock: () => new Date(Number.NaN),
    })).toEqual({
      schema_version: 'wdc.plan_authority_admission_result.v1',
      status: 'rejected',
      reason: 'authority_window_invalid',
      execution_admitted: false,
    })
  })

  it('captures the clock once and isolates admission from caller mutation', () => {
    let clockFailureResult: unknown
    expect(() => {
      clockFailureResult = evaluatePlanAuthorityAdmissionV1(golden, {
        clock: () => {
          throw new Error('clock unavailable')
        },
      })
    }).not.toThrow()
    expect(clockFailureResult).toMatchObject({
      status: 'rejected',
      reason: 'authority_window_invalid',
    })

    const input = clone(golden)
    let clockCalls = 0
    const admitted = evaluatePlanAuthorityAdmissionV1(input, {
      clock: () => {
        clockCalls += 1
        input.plan_version = 99
        return new Date('2026-08-11T18:00:00.000Z')
      },
    })
    expect(clockCalls).toBe(1)
    expect(admitted).toMatchObject({
      status: 'admitted',
      execution_admitted: true,
      plan: { plan_version: 1 },
    })
    if (admitted.status === 'admitted') {
      expect(admitted.plan).not.toBe(input)
    }
    expect(input.plan_version).toBe(99)
  })

  it('never trusts an incoming admitted wrapper', () => {
    expect(evaluatePlanAuthorityAdmissionV1({
      schema_version: 'wdc.plan_authority_admission_result.v1',
      status: 'admitted',
      plan: golden,
      execution_admitted: true,
    }, {
      clock: () => new Date('2026-08-11T18:00:00.000Z'),
    })).toEqual({
      schema_version: 'wdc.plan_authority_admission_result.v1',
      status: 'rejected',
      reason: 'schema_invalid',
      execution_admitted: false,
    })
  })

  it('requires strict RFC3339 approval timestamps', () => {
    const document = clone(golden)
    const approval = document.approval_binding as Record<string, unknown>
    approval.issued_at = '2026-08-11 17:00:00Z'

    expect(evaluatePlanAuthorityAdmissionV1(rehash(document), {
      clock: () => new Date('2026-08-11T18:00:00.000Z'),
    })).toMatchObject({ status: 'rejected', reason: 'authority_window_invalid' })
  })

  it('publishes one closed, versioned canonical authority envelope', () => {
    expect(Value.Check(PlanAuthorityEnvelopeV1, golden)).toBe(true)
    expect(hasValidCanonicalPlanAuthorityDocumentHashV1(golden)).toBe(true)
    expect(orchestratorPackage.PlanAuthorityEnvelopeV1.$id).toBe(
      PLAN_AUTHORITY_SCHEMA_IDS.PlanAuthorityEnvelopeV1,
    )
  })

  it('references the canonical envelope from the admitted result schema', () => {
    const admittedSchema = (
      PlanAuthorityAdmissionResultV1 as unknown as {
        anyOf: Array<{ properties: { plan?: unknown } }>
      }
    ).anyOf[0]
    expect(admittedSchema.properties.plan).toMatchObject({
      $ref: PLAN_AUTHORITY_SCHEMA_IDS.PlanAuthorityEnvelopeV1,
    })
    expect(Value.Check(
      PlanAuthorityAdmissionResultV1,
      [PlanAuthorityEnvelopeV1],
      {
        schema_version: 'wdc.plan_authority_admission_result.v1',
        status: 'admitted',
        plan: golden,
        execution_admitted: true,
      },
    )).toBe(true)
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
    expect(Value.Check(PlanAuthorityAdmissionResultV1, [PlanAuthorityEnvelopeV1], {
      schema_version: 'wdc.plan_authority_admission_result.v1',
      status: 'admitted',
      plan: golden,
      execution_admitted: true,
    })).toBe(true)

    expect(Value.Check(PlanAuthorityAdmissionResultV1, [PlanAuthorityEnvelopeV1], {
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
    expect(Value.Check(
      PlanAuthorityAdmissionResultV1,
      [PlanAuthorityEnvelopeV1],
      rejection,
    )).toBe(true)
    expect(Value.Check(PlanAuthorityAdmissionResultV1, [PlanAuthorityEnvelopeV1], {
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

  it('deduplicates generated Python authority models without overwriting launcher Plan', () => {
    const pythonModulePath = join(
      repoRoot,
      'python',
      'widgetdc_contracts',
      'orchestrator.py',
    )
    const pythonSource = readFileSync(pythonModulePath, 'utf-8')
    for (const className of [
      'Plan',
      'PlanAuthorityEnvelopeV1',
      'BindingHashes',
      'ActorBinding',
      'ApprovalBinding',
    ]) {
      expect(
        pythonSource.match(new RegExp(`^class ${className}\\(`, 'gm')) ?? [],
        `expected one generated ${className} definition`,
      ).toHaveLength(1)
    }

    const script = `
import json
from pathlib import Path
from widgetdc_contracts.orchestrator import (
    Plan,
    PlanAuthorityAdmissionResultV1,
    PlanAuthorityEnvelopeV1,
)

fixtures = json.loads(Path(${JSON.stringify(fixturePath)}).read_text(encoding="utf-8"))
golden = fixtures["golden_vectors"][0]["document"]
admission = PlanAuthorityAdmissionResultV1.model_validate({
    "schema_version": "wdc.plan_authority_admission_result.v1",
    "status": "admitted",
    "plan": golden,
    "execution_admitted": True,
})
assert type(admission.root.plan) is PlanAuthorityEnvelopeV1

launcher = Plan.model_validate({
    "intent": "info",
    "mode": "single",
    "lineageId": "lineage:launcher-regression",
    "status": "planned",
    "source": "widgetdc-launcher-prototype",
    "executionPath": "/reason",
    "handoffPayload": {
        "intent": "info",
        "prompt": "status",
        "executionPath": "/reason",
    },
})
assert launcher.intent == "info"
`
    const result = spawnSync('python', ['-c', script], {
      cwd: join(repoRoot, 'python'),
      encoding: 'utf-8',
    })
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)
  })
})

describe('Plan Authority Contract v2', () => {
  const golden = fixtureV2.golden_vectors[0].document
  const clock = () => new Date('2026-08-19T02:15:00Z')
  const acceptingVerifier = () => true
  const evaluate = (
    document: unknown,
    verifyServerSignature: () => boolean = acceptingVerifier,
  ) => evaluatePlanAuthorityAdmissionV2(document, { clock, verifyServerSignature })

  it('publishes an additive closed V2 schema without changing V1 identity', () => {
    expect(PLAN_AUTHORITY_SCHEMA_IDS.PlanAuthorityEnvelopeV1).toBe(
      'https://widgetdc.com/contracts/orchestrator/PlanAuthorityEnvelopeV1.json',
    )
    expect(PlanAuthorityEnvelopeV2.$id).toBe(
      PLAN_AUTHORITY_SCHEMA_IDS.PlanAuthorityEnvelopeV2,
    )
    expect(Value.Check(PlanAuthorityEnvelopeV2, golden)).toBe(true)
    expect(hasValidCanonicalPlanAuthorityScopeHashV2(golden)).toBe(true)
    expect(hasValidCanonicalPlanAuthorityPayloadHashV2(golden)).toBe(true)
  })

  it('admits only a canonical envelope accepted by the injected server verifier', () => {
    const observed: unknown[] = []
    const result = evaluatePlanAuthorityAdmissionV2(golden, {
      clock,
      verifyServerSignature: (input) => {
        observed.push(input)
        return true
      },
    })

    expect(result).toMatchObject({
      schema_version: 'wdc.plan_authority_admission_result.v2',
      status: 'admitted',
      execution_admitted: true,
      plan: { actor_id: 'operator:clauskraft@gmail.com' },
    })
    expect(observed).toEqual([{
      canonical_payload_hash: golden.canonical_payload_hash,
      signing_key_id: golden.signing_key_id,
      server_signature: golden.server_signature,
    }])
  })

  it.each([
    ['missing plan id', 'plan_id'],
    ['missing approval id', 'approval_id'],
    ['missing actor', 'actor_id'],
    ['missing authority ref', 'authority_ref'],
    ['missing expiry', 'expires_at'],
    ['missing correlation id', 'correlation_id'],
    ['missing idempotency key', 'idempotency_key'],
    ['missing signing key id', 'signing_key_id'],
    ['missing signature', 'server_signature'],
  ])('fails closed for %s', (_name, field) => {
    expect(evaluate(mutate(golden, field, 'delete'))).toMatchObject({
      status: 'rejected',
      reason: 'schema_invalid',
      execution_admitted: false,
    })
  })

  it('rejects empty or duplicate capability and scope sets', () => {
    for (const [field, value] of [
      ['capabilities', []],
      ['scope', []],
      ['capabilities', ['approval:plan', 'approval:plan']],
      ['scope', ['plan:one', 'plan:one']],
    ] as const) {
      expect(evaluate(mutate(golden, field, 'replace', value))).toMatchObject({
        status: 'rejected',
        reason: 'schema_invalid',
      })
    }
  })

  it('rejects caller-supplied verification outcomes instead of treating them as authority', () => {
    for (const field of [
      'actor_binding_verified',
      'approval_signature_verified',
      'approval_usable',
      'execution_admitted',
    ]) {
      expect(evaluate(mutate(golden, field, 'replace', true))).toMatchObject({
        status: 'rejected',
        reason: 'schema_invalid',
      })
    }
  })

  it('never throws on hostile accessor input', () => {
    const hostile = Object.defineProperty({}, 'schema_version', {
      enumerable: true,
      get: () => {
        throw new Error('caller accessor executed')
      },
    })
    expect(() => evaluate(hostile)).not.toThrow()
    expect(evaluate(hostile)).toMatchObject({
      status: 'rejected',
      reason: 'schema_invalid',
      execution_admitted: false,
    })
  })

  it('recomputes scope and payload hashes before invoking signature verification', () => {
    let verifierCalls = 0
    const verifier = () => {
      verifierCalls += 1
      return true
    }
    const scopeTampered = mutate(golden, 'scope', 'replace', ['plan:other'])
    expect(evaluate(scopeTampered, verifier)).toMatchObject({
      status: 'rejected',
      reason: 'scope_hash_mismatch',
    })
    const actorTampered = mutate(golden, 'actor_id', 'replace', 'operator:other')
    expect(evaluate(actorTampered, verifier)).toMatchObject({
      status: 'rejected',
      reason: 'payload_hash_mismatch',
    })
    const idempotencyTampered = mutate(golden, 'idempotency_key', 'replace', 'idem:other')
    expect(evaluate(idempotencyTampered, verifier)).toMatchObject({
      status: 'rejected',
      reason: 'payload_hash_mismatch',
    })
    expect(verifierCalls).toBe(0)
  })

  it('fails closed when signature verification refuses or throws', () => {
    expect(evaluate(golden, () => false)).toMatchObject({
      status: 'rejected',
      reason: 'server_signature_invalid',
    })
    expect(() => evaluate(golden, () => {
      throw new Error('key service unavailable')
    })).not.toThrow()
    expect(evaluate(golden, () => {
      throw new Error('key service unavailable')
    })).toMatchObject({
      status: 'rejected',
      reason: 'server_signature_invalid',
    })
  })

  it('enforces strict half-open authority time boundaries', () => {
    const evaluateAt = (instant: string, document: Record<string, unknown> = golden) =>
      evaluatePlanAuthorityAdmissionV2(document, {
        clock: () => new Date(instant),
        verifyServerSignature: acceptingVerifier,
      })

    expect(evaluateAt('2026-08-19T01:59:59.999Z')).toMatchObject({
      status: 'rejected',
      reason: 'authority_not_yet_valid',
    })
    expect(evaluateAt('2026-08-19T02:45:00.000Z')).toMatchObject({
      status: 'rejected',
      reason: 'authority_expired',
    })
    expect(evaluateAt('2026-08-19T02:00:00.000Z')).toMatchObject({ status: 'admitted' })

    const malformedWindow = rehashV2(mutate(golden, 'expires_at', 'replace', 'not-a-date'))
    expect(evaluateAt('2026-08-19T02:15:00Z', malformedWindow)).toMatchObject({
      status: 'rejected',
      reason: 'schema_invalid',
    })
  })

  it('publishes an admission schema that cannot encode a false admitted result', () => {
    expect(Value.Check(
      PlanAuthorityAdmissionResultV2,
      [PlanAuthorityEnvelopeV2],
      {
        schema_version: 'wdc.plan_authority_admission_result.v2',
        status: 'admitted',
        plan: golden,
        execution_admitted: true,
      },
    )).toBe(true)
    expect(Value.Check(
      PlanAuthorityAdmissionResultV2,
      [PlanAuthorityEnvelopeV2],
      {
        schema_version: 'wdc.plan_authority_admission_result.v2',
        status: 'admitted',
        plan: golden,
        execution_admitted: false,
      },
    )).toBe(false)
  })

  it('validates the V2 golden vector and fail-closed mutations in generated Python', () => {
    const script = `
import json
from pathlib import Path
from pydantic import ValidationError
from widgetdc_contracts.orchestrator import PlanAuthorityEnvelopeV2

fixtures = json.loads(Path(${JSON.stringify(fixtureV2Path)}).read_text(encoding="utf-8"))
golden = fixtures["golden_vectors"][0]["document"]
PlanAuthorityEnvelopeV2.model_validate(golden)

for field, value in [
    ("capabilities", []),
    ("scope", []),
    ("capabilities", ["approval:plan", "approval:plan"]),
    ("scope", ["plan:one", "plan:one"]),
    ("actor_binding_verified", True),
    ("approval_signature_verified", True),
]:
    candidate = json.loads(json.dumps(golden))
    candidate[field] = value
    try:
        PlanAuthorityEnvelopeV2.model_validate(candidate)
    except ValidationError:
        continue
    raise AssertionError(f"Pydantic accepted fail-closed mutation: {field}")
`
    const result = spawnSync('python', ['-B', '-c', script], {
      cwd: join(repoRoot, 'python'),
      encoding: 'utf-8',
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
    })
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)

    const pythonSource = readFileSync(
      join(repoRoot, 'python', 'widgetdc_contracts', 'orchestrator.py'),
      'utf-8',
    )
    for (const className of ['Capability', 'ScopeItem', 'PlanAuthorityEnvelopeV2']) {
      expect(
        pythonSource.match(new RegExp(`^class ${className}\\(`, 'gm')) ?? [],
        `expected one generated ${className} definition`,
      ).toHaveLength(1)
    }
  })
})
