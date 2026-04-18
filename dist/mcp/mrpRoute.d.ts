/**
 * MrpRouteEnvelope — wire-format envelope for every /api/mrp/* call.
 *
 * The backend's intelligenceInterceptor reads `_request_features`, runs the
 * 12-step chain, and passes `payload` on to the MRP handler. `intent` and
 * `evidence` are carried through for governance enforcement.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const MrpRouteEnvelope: import("@sinclair/typebox").TObject<{
    tool: import("@sinclair/typebox").TString;
    payload: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
    intent: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    evidence: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    _trace_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    _request_features: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        task_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"summarize">, import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"review">, import("@sinclair/typebox").TLiteral<"classify">, import("@sinclair/typebox").TLiteral<"translate">, import("@sinclair/typebox").TLiteral<"code">, import("@sinclair/typebox").TLiteral<"reason">, import("@sinclair/typebox").TLiteral<"retrieve">, import("@sinclair/typebox").TLiteral<"compose">, import("@sinclair/typebox").TLiteral<"other">]>;
        language: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        pii_present: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        max_latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        max_cost_usd: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        compliance_tier: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"public">, import("@sinclair/typebox").TLiteral<"internal">, import("@sinclair/typebox").TLiteral<"legal">, import("@sinclair/typebox").TLiteral<"health">]>>;
        reasoning_depth: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export type MrpRouteEnvelope = Static<typeof MrpRouteEnvelope>;
//# sourceMappingURL=mrpRoute.d.ts.map