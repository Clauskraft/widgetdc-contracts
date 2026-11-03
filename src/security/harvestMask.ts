/**
 * Harvest mask — the write gate for harvested material (row 970).
 *
 * The rules are data in schemas/harvest-mask-policy.v1.json, ported unchanged
 * from the row 972 pilot so pilot receipts keep the same policy hash. This
 * module evaluates them. A missing or changed policy fails by name.
 *
 * Only rule names and hit counts leave this module. Matched text is never
 * returned, logged or put in an error message.
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CANONICALIZATION_VERSION, canonicalizeJson } from '../normalization/canonical-json.js'

export const HARVEST_MASK_POLICY_SCHEMA = 'wdc.harvest-mask-policy.v1' as const
export const HARVEST_MASK_FIXTURES_SCHEMA = 'wdc.harvest-mask-fixtures.v1' as const
export const HARVEST_MASK_EVALUATOR_VERSION = '1.0.0' as const

export const HarvestMaskContract = Object.freeze({
  $id: 'https://widgetdc.com/contracts/security/harvest-mask.v1',
  policy_schema: HARVEST_MASK_POLICY_SCHEMA,
  fixtures_schema: HARVEST_MASK_FIXTURES_SCHEMA,
  evaluator_version: HARVEST_MASK_EVALUATOR_VERSION,
  policy_path: 'schemas/harvest-mask-policy.v1.json',
  fixtures_path: 'schemas/harvest-mask-fixtures.v1.json',
  marker_form: '[REDACTED:<rule>]',
  refusal_code: 'HARVEST_MASK_UNMASKED_CONTENT',
  canonicalization_version: CANONICALIZATION_VERSION,
  identity_fields: [
    'contract_id',
    'evaluator_version',
    'policy_schema',
    'policy_version',
    'policy_sha256_jcs',
    'fixtures_sha256_jcs',
    'canonicalization_version',
    'evaluator_runtime',
    'input_normalization_ref',
  ] as const,
})

export interface HarvestMaskRule {
  name: string
  pattern: string
  flags: string
  keep_prefix_group: number | null
  value_group: number | null
}

export interface HarvestMaskRational {
  numerator: number
  denominator: number
}

export interface HarvestMaskPolicy {
  schema: string
  policy_version: string
  status: string
  marker_form: string
  input_normalization: string
  evaluator_contract: string
  rules: HarvestMaskRule[]
  not_a_value: { pattern: string; flags: string; applies_to: string }
  high_entropy: {
    rule_name: string
    token_pattern: string
    token_flags: string
    exempt_patterns: Array<{ pattern: string; flags: string; why: string }>
    require_digit: boolean
    separated_min_digit_share: HarvestMaskRational
    min_entropy_bits_per_char: HarvestMaskRational
  }
  known_gaps: string[]
}

export type HarvestMaskPolicyErrorCode =
  | 'HARVEST_MASK_POLICY_MISSING'
  | 'HARVEST_MASK_POLICY_UNSUPPORTED_SCHEMA'
  | 'HARVEST_MASK_POLICY_UNSUPPORTED_PATTERN'

export class HarvestMaskPolicyError extends Error {
  constructor(readonly code: HarvestMaskPolicyErrorCode, detail: string) {
    super(`${code}: ${detail}`)
    this.name = 'HarvestMaskPolicyError'
  }
}

export type HarvestMaskCounts = Readonly<Record<string, number>>

/** Thrown when a harvested write still holds content the policy masks. Carries rule names and counts only. */
export class HarvestMaskRefusal extends Error {
  readonly code = HarvestMaskContract.refusal_code
  constructor(readonly hits: HarvestMaskCounts) {
    const summary = Object.keys(hits)
      .sort()
      .map((rule) => `${rule}=${hits[rule]}`)
      .join(',')
    super(`${HarvestMaskContract.refusal_code}: ${summary}`)
    this.name = 'HarvestMaskRefusal'
  }
}

export interface HarvestMaskResult {
  text: string
  counts: HarvestMaskCounts
}

export interface HarvestMaskEvaluator {
  readonly policy: Readonly<HarvestMaskPolicy>
  mask(text: string): HarvestMaskResult
  scan(text: string): { clean: boolean; counts: HarvestMaskCounts }
  assertMasked(text: string): void
}

function compile(pattern: string, flags: string): RegExp {
  try {
    return new RegExp(pattern, flags)
  } catch {
    throw new HarvestMaskPolicyError('HARVEST_MASK_POLICY_UNSUPPORTED_PATTERN', 'a pattern or flag does not compile')
  }
}

function entropyBitsPerChar(text: string): number {
  const counts = new Map<string, number>()
  for (const ch of text) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  let bits = 0
  for (const n of counts.values()) {
    const p = n / text.length
    bits -= p * Math.log2(p)
  }
  return bits
}

/** Builds an evaluator from a policy object. Throws by name on an unsupported schema, pattern or flag. */
export function createHarvestMask(policy: HarvestMaskPolicy): HarvestMaskEvaluator {
  if (policy?.schema !== HARVEST_MASK_POLICY_SCHEMA) {
    throw new HarvestMaskPolicyError('HARVEST_MASK_POLICY_UNSUPPORTED_SCHEMA', 'policy schema is not wdc.harvest-mask-policy.v1')
  }
  const rules = policy.rules.map((rule) => ({ ...rule, re: compile(rule.pattern, rule.flags) }))
  const notAValue = compile(policy.not_a_value.pattern, policy.not_a_value.flags)
  const h = policy.high_entropy
  const token = compile(h.token_pattern, h.token_flags)
  const exempt = h.exempt_patterns.map((e) => compile(e.pattern, e.flags))
  const minEntropy = h.min_entropy_bits_per_char.numerator / h.min_entropy_bits_per_char.denominator
  const minShare = h.separated_min_digit_share.numerator / h.separated_min_digit_share.denominator

  const looksLikeSecretToken = (candidate: string): boolean => {
    if (exempt.some((re) => re.test(candidate))) return false
    const digits = (candidate.match(/\d/g) ?? []).length
    if (h.require_digit && digits === 0) return false
    if (/[-_/]/.test(candidate) && digits / candidate.length < minShare) return false
    return entropyBitsPerChar(candidate) >= minEntropy
  }

  const mask = (text: string): HarvestMaskResult => {
    const counts: Record<string, number> = {}
    let out = String(text)
    for (const rule of rules) {
      rule.re.lastIndex = 0
      out = out.replace(rule.re, (...args: unknown[]) => {
        const whole = args[0] as string
        if (rule.value_group && notAValue.test(String(args[rule.value_group] ?? ''))) return whole
        counts[rule.name] = (counts[rule.name] ?? 0) + 1
        const marker = `[REDACTED:${rule.name}]`
        return rule.keep_prefix_group ? `${String(args[rule.keep_prefix_group] ?? '')}${marker}` : marker
      })
    }
    token.lastIndex = 0
    out = out.replace(token, (candidate: string) => {
      if (!looksLikeSecretToken(candidate)) return candidate
      counts[h.rule_name] = (counts[h.rule_name] ?? 0) + 1
      return `[REDACTED:${h.rule_name}]`
    })
    return { text: out, counts: Object.freeze(counts) }
  }

  const scan = (text: string) => {
    const { counts } = mask(text)
    return { clean: Object.keys(counts).length === 0, counts }
  }

  return Object.freeze({
    policy: Object.freeze(policy),
    mask,
    scan,
    assertMasked(text: string): void {
      const { clean, counts } = scan(text)
      if (!clean) throw new HarvestMaskRefusal(counts)
    },
  })
}

// The data files sit at the package root; the same relative path holds from src/security and dist/security.
const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function readJson(relativePath: string): unknown {
  let raw: string
  try {
    raw = readFileSync(join(PACKAGE_ROOT, relativePath), 'utf-8')
  } catch {
    throw new HarvestMaskPolicyError('HARVEST_MASK_POLICY_MISSING', `${relativePath} cannot be read`)
  }
  return JSON.parse(raw)
}

let defaultEvaluator: HarvestMaskEvaluator | undefined

/** The evaluator for the shipped policy. Loaded on first use, so importing this module reads no file. */
export function harvestMask(): HarvestMaskEvaluator {
  defaultEvaluator ??= createHarvestMask(readJson(HarvestMaskContract.policy_path) as HarvestMaskPolicy)
  return defaultEvaluator
}

/** Masks text with the shipped policy. */
export function maskHarvestText(text: string): HarvestMaskResult {
  return harvestMask().mask(text)
}

/** The write gate: throws HarvestMaskRefusal when the text still holds content the shipped policy masks. */
export function assertHarvestWriteMasked(text: string): void {
  harvestMask().assertMasked(text)
}

export interface HarvestMaskIdentity {
  contract_id: string
  evaluator_version: string
  policy_schema: string
  policy_version: string
  policy_sha256_jcs: string
  fixtures_sha256_jcs: string
  canonicalization_version: string
  evaluator_runtime: string
  input_normalization_ref: string
}

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')

/** The identity a receipt binds: contract, evaluator, runtime, policy and fixtures. Hashes are over canonical JSON, so line endings do not change them. */
export function harvestMaskIdentity(): HarvestMaskIdentity {
  const policy = harvestMask().policy
  const fixtures = readJson(HarvestMaskContract.fixtures_path) as { schema?: string }
  if (fixtures?.schema !== HARVEST_MASK_FIXTURES_SCHEMA) {
    throw new HarvestMaskPolicyError('HARVEST_MASK_POLICY_UNSUPPORTED_SCHEMA', 'fixtures schema is not wdc.harvest-mask-fixtures.v1')
  }
  return {
    contract_id: HarvestMaskContract.$id,
    evaluator_version: HARVEST_MASK_EVALUATOR_VERSION,
    policy_schema: policy.schema,
    policy_version: policy.policy_version,
    policy_sha256_jcs: sha256(canonicalizeJson(policy)),
    fixtures_sha256_jcs: sha256(canonicalizeJson(fixtures)),
    canonicalization_version: CANONICALIZATION_VERSION,
    evaluator_runtime: typeof process !== 'undefined' && process.version ? `node ${process.version}` : 'unknown',
    input_normalization_ref: 'policy.input_normalization',
  }
}
