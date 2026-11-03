import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  HarvestMaskContract,
  HarvestMaskPolicyError,
  HarvestMaskRefusal,
  assertHarvestWriteMasked,
  createHarvestMask,
  harvestMaskIdentity,
  maskHarvestText,
  type HarvestMaskPolicy,
} from '../src/security/index.js'

// Row 970. Synthetic values only; parts are joined at run time so no file holds a whole credential.
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const readJson = (path: string) => JSON.parse(readFileSync(join(ROOT, path), 'utf-8'))
const policy = readJson(HarvestMaskContract.policy_path) as HarvestMaskPolicy
const fixtures = readJson(HarvestMaskContract.fixtures_path) as {
  schema: string
  must_mask: Array<{ name: string; text_parts: string[]; secret_parts: string[] }>
  must_survive: Array<{ name: string; text: string }>
}

const plantedSecret = 'sk' + '-ant-' + 'aZ3kQ9xP2mL7vB4n'.repeat(3)
const plantedEmail = 'jens.hansen' + '@' + 'example.dk'
const plantedCpr = '010190' + '-' + '1234'

function refusal(text: string): HarvestMaskRefusal {
  try {
    assertHarvestWriteMasked(text)
  } catch (error) {
    if (error instanceof HarvestMaskRefusal) return error
    throw error
  }
  throw new Error('expected the write to be refused')
}

describe('harvest mask contract identity', () => {
  it('is a frozen contract object with a stable $id', () => {
    expect(Object.isFrozen(HarvestMaskContract)).toBe(true)
    expect(HarvestMaskContract.$id).toBe('https://widgetdc.com/contracts/security/harvest-mask.v1')
    expect(HarvestMaskContract.refusal_code).toBe('HARVEST_MASK_UNMASKED_CONTENT')
  })

  it('binds the policy and fixtures ported unchanged from the row 972 pilot', () => {
    const identity = harvestMaskIdentity()
    expect(Object.keys(identity)).toEqual([...HarvestMaskContract.identity_fields])
    expect(identity.policy_schema).toBe('wdc.harvest-mask-policy.v1')
    expect(identity.policy_sha256_jcs).toBe('0542273657e2b30c96916670a3d7dc8600280111fba129ea826a932edfbf78ec')
    expect(identity.fixtures_sha256_jcs).toBe('bfe4154875585c9d83ac5edd5b7374411b55aa52194df487e9cec8dfe3c8f46c')
  })
})

describe('harvest write gate, two-way (row 970 acceptance)', () => {
  it('refuses a planted secret and names only the rule', () => {
    const error = refusal(`deploy log: key ${plantedSecret} accepted`)
    expect(error.code).toBe('HARVEST_MASK_UNMASKED_CONTENT')
    expect(error.hits.anthropic_openai_key).toBe(1)
    expect(error.message).not.toContain(plantedSecret)
    expect(JSON.stringify(error.hits)).not.toContain(plantedSecret)
  })

  it('refuses a planted personal identifier', () => {
    expect(refusal(`contact ${plantedEmail} for access`).hits.email).toBe(1)
    expect(refusal(`cpr ${plantedCpr} on file`).hits.cpr).toBe(1)
  })

  it('passes the same content once masked', () => {
    const raw = `key ${plantedSecret}, contact ${plantedEmail}, cpr ${plantedCpr}`
    const masked = maskHarvestText(raw)
    expect(masked.text).not.toContain(plantedSecret)
    expect(masked.text).not.toContain(plantedEmail)
    expect(masked.text).not.toContain(plantedCpr)
    expect(masked.counts).toEqual({ anthropic_openai_key: 1, email: 1, cpr: 1 })
    expect(() => assertHarvestWriteMasked(masked.text)).not.toThrow()
  })

  it('passes ordinary text unchanged', () => {
    const text = 'RLM Engine Tests failure on main at 2026-11-03T00:23:35Z, run 41561841480'
    expect(maskHarvestText(text).text).toBe(text)
    expect(() => assertHarvestWriteMasked(text)).not.toThrow()
  })
})

describe('harvest mask fixtures', () => {
  it('uses the fixture schema the contract names', () => {
    expect(fixtures.schema).toBe(HarvestMaskContract.fixtures_schema)
    expect(fixtures.must_mask.length).toBeGreaterThan(0)
    expect(fixtures.must_survive.length).toBeGreaterThan(0)
  })

  it.each(fixtures.must_mask.map((c) => [c.name, c] as const))('masks %s, refuses it raw and passes it masked', (_name, c) => {
    const raw = c.text_parts.join('')
    const secret = c.secret_parts.join('')
    const masked = maskHarvestText(raw)
    expect(masked.text).not.toContain(secret)
    expect(Object.keys(refusal(raw).hits).length).toBeGreaterThan(0)
    expect(() => assertHarvestWriteMasked(masked.text)).not.toThrow()
  })

  it.each(fixtures.must_survive.map((c) => [c.name, c] as const))('leaves %s unchanged', (_name, c) => {
    expect(maskHarvestText(c.text).text).toBe(c.text)
    expect(() => assertHarvestWriteMasked(c.text)).not.toThrow()
  })
})

describe('harvest mask policy fails closed by name', () => {
  it('refuses an unsupported policy schema', () => {
    expect(() => createHarvestMask({ ...policy, schema: 'wdc.harvest-mask-policy.v0' })).toThrow(HarvestMaskPolicyError)
    expect(() => createHarvestMask({ ...policy, schema: 'wdc.harvest-mask-policy.v0' })).toThrow(/HARVEST_MASK_POLICY_UNSUPPORTED_SCHEMA/)
  })

  it('refuses a pattern that does not compile', () => {
    const broken = { ...policy, rules: [{ ...policy.rules[0], pattern: '(' }] }
    expect(() => createHarvestMask(broken)).toThrow(/HARVEST_MASK_POLICY_UNSUPPORTED_PATTERN/)
  })
})
