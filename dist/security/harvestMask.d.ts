export declare const HARVEST_MASK_POLICY_SCHEMA: "wdc.harvest-mask-policy.v1";
export declare const HARVEST_MASK_FIXTURES_SCHEMA: "wdc.harvest-mask-fixtures.v1";
export declare const HARVEST_MASK_EVALUATOR_VERSION: "1.0.0";
export declare const HarvestMaskContract: Readonly<{
    $id: "https://widgetdc.com/contracts/security/harvest-mask.v1";
    policy_schema: "wdc.harvest-mask-policy.v1";
    fixtures_schema: "wdc.harvest-mask-fixtures.v1";
    evaluator_version: "1.0.0";
    policy_path: "schemas/harvest-mask-policy.v1.json";
    fixtures_path: "schemas/harvest-mask-fixtures.v1.json";
    marker_form: "[REDACTED:<rule>]";
    refusal_code: "HARVEST_MASK_UNMASKED_CONTENT";
    canonicalization_version: "jcs-rfc8785-v1";
    identity_fields: readonly ["contract_id", "evaluator_version", "policy_schema", "policy_version", "policy_sha256_jcs", "fixtures_sha256_jcs", "canonicalization_version", "evaluator_runtime", "input_normalization_ref"];
}>;
export interface HarvestMaskRule {
    name: string;
    pattern: string;
    flags: string;
    keep_prefix_group: number | null;
    value_group: number | null;
}
export interface HarvestMaskRational {
    numerator: number;
    denominator: number;
}
export interface HarvestMaskPolicy {
    schema: string;
    policy_version: string;
    status: string;
    marker_form: string;
    input_normalization: string;
    evaluator_contract: string;
    rules: HarvestMaskRule[];
    not_a_value: {
        pattern: string;
        flags: string;
        applies_to: string;
    };
    high_entropy: {
        rule_name: string;
        token_pattern: string;
        token_flags: string;
        exempt_patterns: Array<{
            pattern: string;
            flags: string;
            why: string;
        }>;
        require_digit: boolean;
        separated_min_digit_share: HarvestMaskRational;
        min_entropy_bits_per_char: HarvestMaskRational;
    };
    known_gaps: string[];
}
export type HarvestMaskPolicyErrorCode = 'HARVEST_MASK_POLICY_MISSING' | 'HARVEST_MASK_POLICY_UNSUPPORTED_SCHEMA' | 'HARVEST_MASK_POLICY_UNSUPPORTED_PATTERN';
export declare class HarvestMaskPolicyError extends Error {
    readonly code: HarvestMaskPolicyErrorCode;
    constructor(code: HarvestMaskPolicyErrorCode, detail: string);
}
export type HarvestMaskCounts = Readonly<Record<string, number>>;
/** Thrown when a harvested write still holds content the policy masks. Carries rule names and counts only. */
export declare class HarvestMaskRefusal extends Error {
    readonly hits: HarvestMaskCounts;
    readonly code: "HARVEST_MASK_UNMASKED_CONTENT";
    constructor(hits: HarvestMaskCounts);
}
export interface HarvestMaskResult {
    text: string;
    counts: HarvestMaskCounts;
}
export interface HarvestMaskEvaluator {
    readonly policy: Readonly<HarvestMaskPolicy>;
    mask(text: string): HarvestMaskResult;
    scan(text: string): {
        clean: boolean;
        counts: HarvestMaskCounts;
    };
    assertMasked(text: string): void;
}
/** Builds an evaluator from a policy object. Throws by name on an unsupported schema, pattern or flag. */
export declare function createHarvestMask(policy: HarvestMaskPolicy): HarvestMaskEvaluator;
/** The evaluator for the shipped policy. Loaded on first use, so importing this module reads no file. */
export declare function harvestMask(): HarvestMaskEvaluator;
/** Masks text with the shipped policy. */
export declare function maskHarvestText(text: string): HarvestMaskResult;
/** The write gate: throws HarvestMaskRefusal when the text still holds content the shipped policy masks. */
export declare function assertHarvestWriteMasked(text: string): void;
export interface HarvestMaskIdentity {
    contract_id: string;
    evaluator_version: string;
    policy_schema: string;
    policy_version: string;
    policy_sha256_jcs: string;
    fixtures_sha256_jcs: string;
    canonicalization_version: string;
    evaluator_runtime: string;
    input_normalization_ref: string;
}
/** The identity a receipt binds: contract, evaluator, runtime, policy and fixtures. Hashes are over canonical JSON, so line endings do not change them. */
export declare function harvestMaskIdentity(): HarvestMaskIdentity;
//# sourceMappingURL=harvestMask.d.ts.map