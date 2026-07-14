import { Static } from '@sinclair/typebox';
export declare const DEGRADATION_DECISION_SCHEMA_ID: "https://contracts.widgetdc.dev/execution/degradation-decision.schema.json";
export declare const DegradationDecision: import("@sinclair/typebox").TObject<{
    $id: import("@sinclair/typebox").TLiteral<"https://contracts.widgetdc.dev/execution/degradation-decision.schema.json">;
    decision_id: import("@sinclair/typebox").TString;
    envelope_id: import("@sinclair/typebox").TString;
    risk_class: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"read_only">, import("@sinclair/typebox").TLiteral<"source_mutation">, import("@sinclair/typebox").TLiteral<"governed_mutation">]>;
    trigger: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"missing_optional_specialist">, import("@sinclair/typebox").TLiteral<"missing_required_verifier">, import("@sinclair/typebox").TLiteral<"corrupt_adapter_state">]>;
    decision: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"continue_with_disclosed_coverage_loss">, import("@sinclair/typebox").TLiteral<"assign_human_verifier">, import("@sinclair/typebox").TLiteral<"isolate_adapter_and_use_native_state">, import("@sinclair/typebox").TLiteral<"expected_stop">]>;
    coverage_loss_disclosed: import("@sinclair/typebox").TBoolean;
    alternative_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    next_step: import("@sinclair/typebox").TString;
    claim_ceiling: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"L0">, import("@sinclair/typebox").TLiteral<"L1">, import("@sinclair/typebox").TLiteral<"L2">, import("@sinclair/typebox").TLiteral<"L3">, import("@sinclair/typebox").TLiteral<"L4">, import("@sinclair/typebox").TLiteral<"L5">]>;
    created_at: import("@sinclair/typebox").TString;
}>;
export type DegradationDecision = Static<typeof DegradationDecision>;
//# sourceMappingURL=degradation-decision.d.ts.map