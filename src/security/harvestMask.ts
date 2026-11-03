/**
 * Harvest mask — the write gate for harvested material (row 970).
 *
 * The rules are data in schemas/harvest-mask-policy.v1.json. This module
 * evaluates them. The evaluator copies the policy once, freezes the copy all
 * the way down, and uses that one snapshot for the rules it runs and for the
 * identity hash it reports, so the two cannot differ. A missing, malformed or
 * unsupported policy fails by name, and input over the policy's size cap is
 * refused by name.
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
export const HARVEST_MASK_EVALUATOR_VERSION = '1.1.0' as const

export const HarvestMaskContract = Object.freeze({
  $id: 'https://widgetdc.com/contracts/security/harvest-mask.v1',
  policy_schema: HARVEST_MASK_POLICY_SCHEMA,
  fixtures_schema: HARVEST_MASK_FIXTURES_SCHEMA,
  evaluator_version: HARVEST_MASK_EVALUATOR_VERSION,
  policy_path: 'schemas/harvest-mask-policy.v1.json',
  fixtures_path: 'schemas/harvest-mask-fixtures.v1.json',
  marker_form: '[REDACTED:<rule>]',
  refusal_code: 'HARVEST_MASK_UNMASKED_CONTENT',
  input_too_large_code: 'HARVEST_MASK_INPUT_TOO_LARGE',
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
  max_input_chars: number
  rules: HarvestMaskRule[]
  not_a_value: { pattern: string; flags: string; applies_to: string }
  numeric_value: { pattern: string; flags: string; exempt_unless_name: string; exempt_unless_name_flags: string }
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
  | 'HARVEST_MASK_POLICY_MALFORMED'
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

/** Thrown when the input is longer than the policy's max_input_chars. Carries the two lengths only. */
export class HarvestMaskInputTooLarge extends Error {
  readonly code = HarvestMaskContract.input_too_large_code
  constructor(readonly length: number, readonly max: number) {
    super(`${HarvestMaskContract.input_too_large_code}: ${length} characters, the cap is ${max}`)
    this.name = 'HarvestMaskInputTooLarge'
  }
}

export interface HarvestMaskResult {
  text: string
  counts: HarvestMaskCounts
}

export interface HarvestMaskEvaluator {
  /** The frozen snapshot the evaluator runs. */
  readonly policy: Readonly<HarvestMaskPolicy>
  /** sha256 over the canonical JSON of that same snapshot. */
  readonly policy_sha256_jcs: string
  mask(text: string): HarvestMaskResult
  scan(text: string): { clean: boolean; counts: HarvestMaskCounts }
  assertMasked(text: string): void
}

const malformed = (detail: string): never => {
  throw new HarvestMaskPolicyError('HARVEST_MASK_POLICY_MALFORMED', detail)
}
const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === 'string'
const isGroup = (value: unknown) => value === null || (Number.isInteger(value) && (value as number) > 0)
const isRational = (value: unknown) =>
  isObject(value) &&
  Number.isFinite(value.numerator) &&
  Number.isFinite(value.denominator) &&
  (value.denominator as number) > 0

/** Checks the shape the evaluator reads, so a bad policy fails by name instead of failing somewhere inside. */
function validate(policy: unknown): asserts policy is HarvestMaskPolicy {
  if (!isObject(policy)) malformed('policy is not an object')
  const p = policy as Record<string, unknown>
  if (p.schema !== HARVEST_MASK_POLICY_SCHEMA) {
    throw new HarvestMaskPolicyError('HARVEST_MASK_POLICY_UNSUPPORTED_SCHEMA', 'policy schema is not wdc.harvest-mask-policy.v1')
  }
  if (!isString(p.policy_version)) malformed('policy_version is not a string')
  if (!Number.isSafeInteger(p.max_input_chars) || (p.max_input_chars as number) <= 0) {
    malformed('max_input_chars is not a positive integer')
  }
  if (!Array.isArray(p.rules)) malformed('rules is not a list')
  for (const rule of p.rules as unknown[]) {
    if (!isObject(rule) || !isString(rule.name) || !isString(rule.pattern) || !isString(rule.flags)) {
      malformed('a rule lacks a string name, pattern or flags')
    }
    const r = rule as Record<string, unknown>
    if (!isGroup(r.keep_prefix_group) || !isGroup(r.value_group)) malformed('a rule group is not null or a positive integer')
  }
  const nav = p.not_a_value
  if (!isObject(nav) || !isString(nav.pattern) || !isString(nav.flags)) malformed('not_a_value lacks a pattern or flags')
  const num = p.numeric_value
  if (
    !isObject(num) ||
    !isString(num.pattern) ||
    !isString(num.flags) ||
    !isString(num.exempt_unless_name) ||
    !isString(num.exempt_unless_name_flags)
  ) {
    malformed('numeric_value lacks a pattern, flags or exempt_unless_name')
  }
  const h = p.high_entropy
  if (!isObject(h) || !isString(h.rule_name) || !isString(h.token_pattern) || !isString(h.token_flags)) {
    malformed('high_entropy lacks a rule_name or token pattern')
  }
  const he = h as Record<string, unknown>
  if (!Array.isArray(he.exempt_patterns)) malformed('high_entropy.exempt_patterns is not a list')
  for (const e of he.exempt_patterns as unknown[]) {
    if (!isObject(e) || !isString(e.pattern) || !isString(e.flags)) malformed('an exempt pattern lacks a pattern or flags')
  }
  if (typeof he.require_digit !== 'boolean') malformed('high_entropy.require_digit is not a boolean')
  if (!isRational(he.separated_min_digit_share) || !isRational(he.min_entropy_bits_per_char)) {
    malformed('a high_entropy ratio is not a positive rational')
  }
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) deepFreeze((value as Record<string, unknown>)[key])
    Object.freeze(value)
  }
  return value
}

/** A JSON round trip: plain data only, no shared references with the caller's object. */
function snapshot(policy: unknown): HarvestMaskPolicy {
  let copy: unknown
  try {
    copy = JSON.parse(JSON.stringify(policy))
  } catch {
    malformed('policy is not plain JSON data')
  }
  validate(copy)
  return deepFreeze(copy)
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

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')

/** Builds an evaluator from a policy object. Throws by name on a malformed policy, an unsupported schema, pattern or flag. */
export function createHarvestMask(policy: HarvestMaskPolicy): HarvestMaskEvaluator {
  const snap = snapshot(policy)
  const policySha = sha256(canonicalizeJson(snap))
  const rules = snap.rules.map((rule) => ({
    name: rule.name,
    keep: rule.keep_prefix_group,
    value: rule.value_group,
    re: compile(rule.pattern, rule.flags),
  }))
  const notAValue = compile(snap.not_a_value.pattern, snap.not_a_value.flags)
  const numeric = compile(snap.numeric_value.pattern, snap.numeric_value.flags)
  const credentialName = compile(snap.numeric_value.exempt_unless_name, snap.numeric_value.exempt_unless_name_flags)
  const h = snap.high_entropy
  const token = compile(h.token_pattern, h.token_flags)
  const exempt = h.exempt_patterns.map((e) => compile(e.pattern, e.flags))
  const minEntropy = h.min_entropy_bits_per_char.numerator / h.min_entropy_bits_per_char.denominator
  const minShare = h.separated_min_digit_share.numerator / h.separated_min_digit_share.denominator
  const maxChars = snap.max_input_chars

  const looksLikeSecretToken = (candidate: string): boolean => {
    if (exempt.some((re) => test(re, candidate))) return false
    const digits = (candidate.match(/\d/g) ?? []).length
    if (h.require_digit && digits === 0) return false
    if (/[-_/]/.test(candidate) && digits / candidate.length < minShare) return false
    return entropyBitsPerChar(candidate) >= minEntropy
  }

  const test = (re: RegExp, text: string) => {
    re.lastIndex = 0
    return re.test(text)
  }
  const isNotAValue = (value: string, name: string): boolean =>
    test(notAValue, value) || (test(numeric, value) && !test(credentialName, name))

  const mask = (text: string): HarvestMaskResult => {
    const input = String(text)
    if (input.length > maxChars) throw new HarvestMaskInputTooLarge(input.length, maxChars)
    // A Map, not a plain object: a rule named __proto__ or constructor must count like any other.
    const counts = new Map<string, number>()
    const hit = (name: string) => counts.set(name, (counts.get(name) ?? 0) + 1)
    let out = input
    for (const rule of rules) {
      rule.re.lastIndex = 0
      out = out.replace(rule.re, (...args: unknown[]) => {
        const whole = args[0] as string
        if (rule.value && isNotAValue(String(args[rule.value] ?? ''), String(rule.keep ? (args[rule.keep] ?? '') : ''))) {
          return whole
        }
        hit(rule.name)
        const marker = `[REDACTED:${rule.name}]`
        return rule.keep ? `${String(args[rule.keep] ?? '')}${marker}` : marker
      })
    }
    token.lastIndex = 0
    out = out.replace(token, (candidate: string) => {
      if (!looksLikeSecretToken(candidate)) return candidate
      hit(h.rule_name)
      return `[REDACTED:${h.rule_name}]`
    })
    // Object.fromEntries defines own properties, so every rule name is an own key.
    return { text: out, counts: Object.freeze(Object.fromEntries(counts)) }
  }

  const scan = (text: string) => {
    const { counts } = mask(text)
    return { clean: Object.keys(counts).length === 0, counts }
  }

  return Object.freeze({
    policy: snap,
    policy_sha256_jcs: policySha,
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
  try {
    return JSON.parse(raw)
  } catch {
    throw new HarvestMaskPolicyError('HARVEST_MASK_POLICY_MALFORMED', `${relativePath} is not valid JSON`)
  }
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

/** The identity a receipt binds: contract, evaluator, runtime, policy and fixtures. Hashes are over canonical JSON, so line endings do not change them. */
export function harvestMaskIdentity(): HarvestMaskIdentity {
  const gate = harvestMask()
  const fixtures = readJson(HarvestMaskContract.fixtures_path) as { schema?: string }
  if (fixtures?.schema !== HARVEST_MASK_FIXTURES_SCHEMA) {
    throw new HarvestMaskPolicyError('HARVEST_MASK_POLICY_UNSUPPORTED_SCHEMA', 'fixtures schema is not wdc.harvest-mask-fixtures.v1')
  }
  return {
    contract_id: HarvestMaskContract.$id,
    evaluator_version: HARVEST_MASK_EVALUATOR_VERSION,
    policy_schema: gate.policy.schema,
    policy_version: gate.policy.policy_version,
    policy_sha256_jcs: gate.policy_sha256_jcs,
    fixtures_sha256_jcs: sha256(canonicalizeJson(fixtures)),
    canonicalization_version: CANONICALIZATION_VERSION,
    evaluator_runtime: typeof process !== 'undefined' && process.version ? `node ${process.version}` : 'unknown',
    input_normalization_ref: 'policy.input_normalization',
  }
}
