import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  HarvestMaskContract,
  HarvestMaskInputTooLarge,
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

  it('binds the 1.1.0 candidate policy, its fixtures and evaluator 1.1.0', () => {
    const identity = harvestMaskIdentity()
    expect(Object.keys(identity)).toEqual([...HarvestMaskContract.identity_fields])
    expect(identity.policy_schema).toBe('wdc.harvest-mask-policy.v1')
    expect(identity.policy_version).toBe('1.1.0-candidate')
    expect(identity.evaluator_version).toBe('1.1.0')
    expect(identity.policy_sha256_jcs).toBe('dfc0e9ed5c9301c54374419358a4e1aed982781a1ad580276631c5ce11514ddb')
    expect(identity.fixtures_sha256_jcs).toBe('505093821aa175186f4dbb4c2859f10801c06d687415038ae468870408758a64')
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

// Row 970 successor: Codex PR110-F1 and PR110-F2, the size cap and malformed input.
const clonePolicy = (): HarvestMaskPolicy => JSON.parse(JSON.stringify(policy))
const evaluatorFor = (p: HarvestMaskPolicy) => createHarvestMask(p)

describe('rule names that collide with Object.prototype (PR110-F1)', () => {
  for (const name of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
    it(`a rule named ${name} reports its hit, refuses the raw text and passes it masked`, () => {
      const p = clonePolicy()
      p.rules = [{ name, pattern: 'canary-[0-9]{6}', flags: 'g', keep_prefix_group: null, value_group: null }, ...p.rules]
      const gate = evaluatorFor(p)
      const raw = 'value canary-' + '481516' + ' end'
      const scan = gate.scan(raw)
      expect(scan.clean).toBe(false)
      expect(Object.prototype.hasOwnProperty.call(scan.counts, name)).toBe(true)
      expect(scan.counts[name]).toBe(1)
      expect(() => gate.assertMasked(raw)).toThrow(HarvestMaskRefusal)
      const masked = gate.mask(raw)
      expect(masked.text).not.toContain('481516')
      expect(() => gate.assertMasked(masked.text)).not.toThrow()
    })

    it(`a high-entropy rule named ${name} reports its hit, refuses the raw text and passes it masked`, () => {
      const p = clonePolicy()
      p.high_entropy = { ...p.high_entropy, rule_name: name }
      const gate = evaluatorFor(p)
      const raw = 'opaque ' + 'Qz7Lx2Vb9Np4Rk6Tm1' + 'Hd8Fs3Gw5Jc0Ye' + ' end'
      const scan = gate.scan(raw)
      expect(scan.clean).toBe(false)
      expect(Object.prototype.hasOwnProperty.call(scan.counts, name)).toBe(true)
      expect(() => gate.assertMasked(raw)).toThrow(HarvestMaskRefusal)
      expect(() => gate.assertMasked(gate.mask(raw).text)).not.toThrow()
    })
  }
})

describe('one immutable policy snapshot binds evaluation and identity (PR110-F2)', () => {
  it('mutating the caller\'s policy after creation changes neither the rules that run nor the identity', () => {
    const original = clonePolicy()
    const gate = evaluatorFor(original)
    const hashBefore = gate.policy_sha256_jcs
    const raw = `key ${plantedSecret}`
    original.rules.length = 0
    original.high_entropy.rule_name = 'changed'
    expect(gate.policy.rules.length).toBe(policy.rules.length)
    expect(gate.policy_sha256_jcs).toBe(hashBefore)
    expect(gate.scan(raw).counts.anthropic_openai_key).toBe(1)
  })

  it('the exposed policy is frozen all the way down', () => {
    const gate = evaluatorFor(clonePolicy())
    expect(Object.isFrozen(gate.policy)).toBe(true)
    expect(Object.isFrozen(gate.policy.rules)).toBe(true)
    expect(Object.isFrozen(gate.policy.rules[0])).toBe(true)
    expect(Object.isFrozen(gate.policy.high_entropy.exempt_patterns[0])).toBe(true)
    expect(() => {
      ;(gate.policy.rules as unknown as unknown[]).length = 0
    }).toThrow(TypeError)
    expect(() => {
      ;(gate.policy.rules[0] as { pattern: string }).pattern = 'x'
    }).toThrow(TypeError)
    expect(gate.policy.rules.length).toBe(policy.rules.length)
  })

  it('the shipped identity hash is the hash of the snapshot the shipped evaluator runs', () => {
    const identity = harvestMaskIdentity()
    expect(identity.policy_sha256_jcs).toBe(evaluatorFor(clonePolicy()).policy_sha256_jcs)
  })
})

describe('input size cap', () => {
  it('the shipped policy names the cap', () => {
    expect(policy.max_input_chars).toBe(4194304)
  })

  it('refuses input over the cap by name, and accepts input at the cap', () => {
    const gate = evaluatorFor({ ...clonePolicy(), max_input_chars: 64 })
    const atCap = 'a'.repeat(64)
    expect(gate.mask(atCap).text).toBe(atCap)
    const over = 'a'.repeat(65)
    expect(() => gate.mask(over)).toThrow(HarvestMaskInputTooLarge)
    expect(() => gate.mask(over)).toThrow(/HARVEST_MASK_INPUT_TOO_LARGE/)
    expect(() => gate.assertMasked(over)).toThrow(HarvestMaskInputTooLarge)
    expect(() => gate.scan(over)).toThrow(HarvestMaskInputTooLarge)
  })
})

describe('worst-case input runs in linear time', () => {
  const n = 262144
  const fill = (unit: string) => unit.repeat(Math.ceil(n / unit.length)).slice(0, n)
  const inputs: Record<string, string> = {
    dotted: fill('a.'),
    dashed: fill('a-'),
    plus: fill('Ab1+'),
    tokens: fill('token'),
    jwt_run: fill('eyJa-'),
    url_run: fill('a://a:'),
    env_open: fill("os.environ.get('A', "),
    quoted_open: fill('token="a '),
  }
  for (const [name, text] of Object.entries(inputs)) {
    it(`${name} at ${n} characters stays well under a quadratic budget`, () => {
      const started = performance.now()
      maskHarvestText(text)
      expect(performance.now() - started).toBeLessThan(3000)
    })
  }
})

describe('a malformed policy fails by name', () => {
  const cases: Array<[string, (p: Record<string, unknown>) => unknown]> = [
    ['not an object', () => 'policy'],
    ['rules missing', (p) => ({ ...p, rules: undefined })],
    ['a rule without a pattern', (p) => ({ ...p, rules: [{ name: 'x', flags: 'g', keep_prefix_group: null, value_group: null }] })],
    ['a rule name that is not a string', (p) => ({ ...p, rules: [{ name: 7, pattern: 'x', flags: 'g', keep_prefix_group: null, value_group: null }] })],
    ['numeric_value missing', (p) => ({ ...p, numeric_value: undefined })],
    ['high_entropy missing', (p) => ({ ...p, high_entropy: undefined })],
    ['a cap that is not a positive integer', (p) => ({ ...p, max_input_chars: 0 })],
  ]
  for (const [name, make] of cases) {
    it(name, () => {
      const bad = make(clonePolicy() as unknown as Record<string, unknown>) as HarvestMaskPolicy
      expect(() => createHarvestMask(bad)).toThrow(HarvestMaskPolicyError)
      expect(() => createHarvestMask(bad)).toThrow(/HARVEST_MASK_POLICY_MALFORMED/)
    })
  }
})
describe('quoted values are masked whole', () => {
  it('a double-quoted passphrase with spaces loses every word, not only the first', () => {
    const raw = 'pass' + 'word: "' + 'correct horse' + ' battery staple"'
    const masked = maskHarvestText(raw).text
    for (const word of ['correct', 'horse', 'battery', 'staple']) expect(masked).not.toContain(word)
    expect(() => assertHarvestWriteMasked(masked)).not.toThrow()
  })
})