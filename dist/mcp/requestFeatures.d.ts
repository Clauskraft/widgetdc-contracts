/**
 * RequestFeatures — Single source of truth for interceptor-chain inputs.
 *
 * Emitted by plugins / orchestrator, read by every step of the default-on
 * intelligence interceptor (see WidgeTDC/docs/wiring/SYSTEM_WIRING_PLAN.md § 3).
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const RequestTaskType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"summarize">, import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"review">, import("@sinclair/typebox").TLiteral<"classify">, import("@sinclair/typebox").TLiteral<"translate">, import("@sinclair/typebox").TLiteral<"code">, import("@sinclair/typebox").TLiteral<"reason">, import("@sinclair/typebox").TLiteral<"retrieve">, import("@sinclair/typebox").TLiteral<"compose">, import("@sinclair/typebox").TLiteral<"other">]>;
export type RequestTaskType = Static<typeof RequestTaskType>;
export declare const ComplianceTier: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"public">, import("@sinclair/typebox").TLiteral<"internal">, import("@sinclair/typebox").TLiteral<"legal">, import("@sinclair/typebox").TLiteral<"health">]>;
export type ComplianceTier = Static<typeof ComplianceTier>;
export declare const RequestFeatures: import("@sinclair/typebox").TObject<{
    task_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"summarize">, import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"review">, import("@sinclair/typebox").TLiteral<"classify">, import("@sinclair/typebox").TLiteral<"translate">, import("@sinclair/typebox").TLiteral<"code">, import("@sinclair/typebox").TLiteral<"reason">, import("@sinclair/typebox").TLiteral<"retrieve">, import("@sinclair/typebox").TLiteral<"compose">, import("@sinclair/typebox").TLiteral<"other">]>;
    language: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    pii_present: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    max_latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    max_cost_usd: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    compliance_tier: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"public">, import("@sinclair/typebox").TLiteral<"internal">, import("@sinclair/typebox").TLiteral<"legal">, import("@sinclair/typebox").TLiteral<"health">]>>;
    reasoning_depth: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type RequestFeatures = Static<typeof RequestFeatures>;
//# sourceMappingURL=requestFeatures.d.ts.map