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
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CANONICALIZATION_VERSION, canonicalizeJson } from '../normalization/canonical-json.js';
export const HARVEST_MASK_POLICY_SCHEMA = 'wdc.harvest-mask-policy.v1';
export const HARVEST_MASK_FIXTURES_SCHEMA = 'wdc.harvest-mask-fixtures.v1';
export const HARVEST_MASK_EVALUATOR_VERSION = '1.0.0';
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
    ],
});
export class HarvestMaskPolicyError extends Error {
    code;
    constructor(code, detail) {
        super(`${code}: ${detail}`);
        this.code = code;
        this.name = 'HarvestMaskPolicyError';
    }
}
/** Thrown when a harvested write still holds content the policy masks. Carries rule names and counts only. */
export class HarvestMaskRefusal extends Error {
    hits;
    code = HarvestMaskContract.refusal_code;
    constructor(hits) {
        const summary = Object.keys(hits)
            .sort()
            .map((rule) => `${rule}=${hits[rule]}`)
            .join(',');
        super(`${HarvestMaskContract.refusal_code}: ${summary}`);
        this.hits = hits;
        this.name = 'HarvestMaskRefusal';
    }
}
function compile(pattern, flags) {
    try {
        return new RegExp(pattern, flags);
    }
    catch {
        throw new HarvestMaskPolicyError('HARVEST_MASK_POLICY_UNSUPPORTED_PATTERN', 'a pattern or flag does not compile');
    }
}
function entropyBitsPerChar(text) {
    const counts = new Map();
    for (const ch of text)
        counts.set(ch, (counts.get(ch) ?? 0) + 1);
    let bits = 0;
    for (const n of counts.values()) {
        const p = n / text.length;
        bits -= p * Math.log2(p);
    }
    return bits;
}
/** Builds an evaluator from a policy object. Throws by name on an unsupported schema, pattern or flag. */
export function createHarvestMask(policy) {
    if (policy?.schema !== HARVEST_MASK_POLICY_SCHEMA) {
        throw new HarvestMaskPolicyError('HARVEST_MASK_POLICY_UNSUPPORTED_SCHEMA', 'policy schema is not wdc.harvest-mask-policy.v1');
    }
    const rules = policy.rules.map((rule) => ({ ...rule, re: compile(rule.pattern, rule.flags) }));
    const notAValue = compile(policy.not_a_value.pattern, policy.not_a_value.flags);
    const h = policy.high_entropy;
    const token = compile(h.token_pattern, h.token_flags);
    const exempt = h.exempt_patterns.map((e) => compile(e.pattern, e.flags));
    const minEntropy = h.min_entropy_bits_per_char.numerator / h.min_entropy_bits_per_char.denominator;
    const minShare = h.separated_min_digit_share.numerator / h.separated_min_digit_share.denominator;
    const looksLikeSecretToken = (candidate) => {
        if (exempt.some((re) => re.test(candidate)))
            return false;
        const digits = (candidate.match(/\d/g) ?? []).length;
        if (h.require_digit && digits === 0)
            return false;
        if (/[-_/]/.test(candidate) && digits / candidate.length < minShare)
            return false;
        return entropyBitsPerChar(candidate) >= minEntropy;
    };
    const mask = (text) => {
        const counts = {};
        let out = String(text);
        for (const rule of rules) {
            rule.re.lastIndex = 0;
            out = out.replace(rule.re, (...args) => {
                const whole = args[0];
                if (rule.value_group && notAValue.test(String(args[rule.value_group] ?? '')))
                    return whole;
                counts[rule.name] = (counts[rule.name] ?? 0) + 1;
                const marker = `[REDACTED:${rule.name}]`;
                return rule.keep_prefix_group ? `${String(args[rule.keep_prefix_group] ?? '')}${marker}` : marker;
            });
        }
        token.lastIndex = 0;
        out = out.replace(token, (candidate) => {
            if (!looksLikeSecretToken(candidate))
                return candidate;
            counts[h.rule_name] = (counts[h.rule_name] ?? 0) + 1;
            return `[REDACTED:${h.rule_name}]`;
        });
        return { text: out, counts: Object.freeze(counts) };
    };
    const scan = (text) => {
        const { counts } = mask(text);
        return { clean: Object.keys(counts).length === 0, counts };
    };
    return Object.freeze({
        policy: Object.freeze(policy),
        mask,
        scan,
        assertMasked(text) {
            const { clean, counts } = scan(text);
            if (!clean)
                throw new HarvestMaskRefusal(counts);
        },
    });
}
// The data files sit at the package root; the same relative path holds from src/security and dist/security.
const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
function readJson(relativePath) {
    let raw;
    try {
        raw = readFileSync(join(PACKAGE_ROOT, relativePath), 'utf-8');
    }
    catch {
        throw new HarvestMaskPolicyError('HARVEST_MASK_POLICY_MISSING', `${relativePath} cannot be read`);
    }
    return JSON.parse(raw);
}
let defaultEvaluator;
/** The evaluator for the shipped policy. Loaded on first use, so importing this module reads no file. */
export function harvestMask() {
    defaultEvaluator ??= createHarvestMask(readJson(HarvestMaskContract.policy_path));
    return defaultEvaluator;
}
/** Masks text with the shipped policy. */
export function maskHarvestText(text) {
    return harvestMask().mask(text);
}
/** The write gate: throws HarvestMaskRefusal when the text still holds content the shipped policy masks. */
export function assertHarvestWriteMasked(text) {
    harvestMask().assertMasked(text);
}
const sha256 = (text) => createHash('sha256').update(text).digest('hex');
/** The identity a receipt binds: contract, evaluator, runtime, policy and fixtures. Hashes are over canonical JSON, so line endings do not change them. */
export function harvestMaskIdentity() {
    const policy = harvestMask().policy;
    const fixtures = readJson(HarvestMaskContract.fixtures_path);
    if (fixtures?.schema !== HARVEST_MASK_FIXTURES_SCHEMA) {
        throw new HarvestMaskPolicyError('HARVEST_MASK_POLICY_UNSUPPORTED_SCHEMA', 'fixtures schema is not wdc.harvest-mask-fixtures.v1');
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
    };
}
//# sourceMappingURL=harvestMask.js.map