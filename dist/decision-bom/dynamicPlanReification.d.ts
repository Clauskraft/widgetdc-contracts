/**
 * DynamicPlanReification — Contracts for continuously updated plans and assumption invalidation.
 *
 * Ensures plans (WorkBOM, Slices, Execution Plans) remain dynamically updated
 * based on EventSpine events and Delta Engine AST invalidations.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const PlanSliceState: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"PLANNED">, import("@sinclair/typebox").TLiteral<"IN_PROGRESS">, import("@sinclair/typebox").TLiteral<"BLOCKED">, import("@sinclair/typebox").TLiteral<"EVIDENCE_GATHERED">, import("@sinclair/typebox").TLiteral<"RATIFIED">, import("@sinclair/typebox").TLiteral<"INVALIDATED_BY_MUTATION">]>;
export type PlanSliceState = Static<typeof PlanSliceState>;
export declare const PlanSlice: import("@sinclair/typebox").TObject<{
    slice_id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TString;
    state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"PLANNED">, import("@sinclair/typebox").TLiteral<"IN_PROGRESS">, import("@sinclair/typebox").TLiteral<"BLOCKED">, import("@sinclair/typebox").TLiteral<"EVIDENCE_GATHERED">, import("@sinclair/typebox").TLiteral<"RATIFIED">, import("@sinclair/typebox").TLiteral<"INVALIDATED_BY_MUTATION">]>;
    required_bom_items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    assumptions: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    invalidated_reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    proof_receipt_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
}>;
export type PlanSlice = Static<typeof PlanSlice>;
export declare const PlanItemTransitionEvent: import("@sinclair/typebox").TObject<{
    specversion: import("@sinclair/typebox").TLiteral<"1.0">;
    id: import("@sinclair/typebox").TString;
    source: import("@sinclair/typebox").TLiteral<"wdc:plan-governor">;
    type: import("@sinclair/typebox").TLiteral<"wdc.plan.slice.transitioned">;
    time: import("@sinclair/typebox").TString;
    correlation_id: import("@sinclair/typebox").TString;
    data: import("@sinclair/typebox").TObject<{
        plan_id: import("@sinclair/typebox").TString;
        slice_id: import("@sinclair/typebox").TString;
        from_state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"PLANNED">, import("@sinclair/typebox").TLiteral<"IN_PROGRESS">, import("@sinclair/typebox").TLiteral<"BLOCKED">, import("@sinclair/typebox").TLiteral<"EVIDENCE_GATHERED">, import("@sinclair/typebox").TLiteral<"RATIFIED">, import("@sinclair/typebox").TLiteral<"INVALIDATED_BY_MUTATION">]>;
        to_state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"PLANNED">, import("@sinclair/typebox").TLiteral<"IN_PROGRESS">, import("@sinclair/typebox").TLiteral<"BLOCKED">, import("@sinclair/typebox").TLiteral<"EVIDENCE_GATHERED">, import("@sinclair/typebox").TLiteral<"RATIFIED">, import("@sinclair/typebox").TLiteral<"INVALIDATED_BY_MUTATION">]>;
        trigger_event_id: import("@sinclair/typebox").TString;
        invalidated_assumptions: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        next_best_action: import("@sinclair/typebox").TString;
        reification_timestamp: import("@sinclair/typebox").TString;
    }>;
}>;
export type PlanItemTransitionEvent = Static<typeof PlanItemTransitionEvent>;
export declare const DynamicPlanEnvelope: import("@sinclair/typebox").TObject<{
    plan_id: import("@sinclair/typebox").TString;
    version: import("@sinclair/typebox").TInteger;
    active_head_commit: import("@sinclair/typebox").TString;
    slices: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        slice_id: import("@sinclair/typebox").TString;
        title: import("@sinclair/typebox").TString;
        state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"PLANNED">, import("@sinclair/typebox").TLiteral<"IN_PROGRESS">, import("@sinclair/typebox").TLiteral<"BLOCKED">, import("@sinclair/typebox").TLiteral<"EVIDENCE_GATHERED">, import("@sinclair/typebox").TLiteral<"RATIFIED">, import("@sinclair/typebox").TLiteral<"INVALIDATED_BY_MUTATION">]>;
        required_bom_items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        assumptions: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        invalidated_reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        proof_receipt_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    }>>;
    invariants_verified: import("@sinclair/typebox").TBoolean;
    updated_at: import("@sinclair/typebox").TString;
}>;
export type DynamicPlanEnvelope = Static<typeof DynamicPlanEnvelope>;
//# sourceMappingURL=dynamicPlanReification.d.ts.map