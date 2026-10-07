/**
 * DynamicPlanReification — Contracts for continuously updated plans and assumption invalidation.
 *
 * Ensures plans (WorkBOM, Slices, Execution Plans) remain dynamically updated
 * based on EventSpine events and Delta Engine AST invalidations.
 *
 * Wire format: snake_case JSON.
 */
import { Type } from '@sinclair/typebox';
export const PlanSliceState = Type.Union([
    Type.Literal('PLANNED'),
    Type.Literal('IN_PROGRESS'),
    Type.Literal('BLOCKED'),
    Type.Literal('EVIDENCE_GATHERED'),
    Type.Literal('RATIFIED'),
    Type.Literal('INVALIDATED_BY_MUTATION'),
], { $id: 'PlanSliceState' });
export const PlanSlice = Type.Object({
    slice_id: Type.String({ minLength: 1, description: 'Slice identifier (e.g. SLICE-001).' }),
    title: Type.String({ minLength: 1 }),
    state: PlanSliceState,
    required_bom_items: Type.Array(Type.String(), { description: 'BOMItem IDs required by this slice.' }),
    assumptions: Type.Array(Type.String(), { description: 'Explicit assumptions this slice depends upon.' }),
    invalidated_reason: Type.Optional(Type.String({ description: 'Explanation if state is INVALIDATED_BY_MUTATION.' })),
    proof_receipt_ids: Type.Array(Type.String(), { description: 'Receipt IDs confirming execution proof.' }),
}, { $id: 'PlanSlice' });
export const PlanItemTransitionEvent = Type.Object({
    specversion: Type.Literal('1.0'),
    id: Type.String({ minLength: 1 }),
    source: Type.Literal('wdc:plan-governor'),
    type: Type.Literal('wdc.plan.slice.transitioned'),
    time: Type.String({ format: 'date-time' }),
    correlation_id: Type.String({ minLength: 1 }),
    data: Type.Object({
        plan_id: Type.String({ minLength: 1 }),
        slice_id: Type.String({ minLength: 1 }),
        from_state: PlanSliceState,
        to_state: PlanSliceState,
        trigger_event_id: Type.String({ description: 'EventSpine event ID that triggered this state transition.' }),
        invalidated_assumptions: Type.Array(Type.String()),
        next_best_action: Type.String({ minLength: 1 }),
        reification_timestamp: Type.String({ format: 'date-time' }),
    }),
}, { $id: 'PlanItemTransitionEvent' });
export const DynamicPlanEnvelope = Type.Object({
    plan_id: Type.String({ minLength: 1 }),
    version: Type.Integer({ minimum: 1 }),
    active_head_commit: Type.String({ pattern: '^[0-9a-f]{40}$' }),
    slices: Type.Array(PlanSlice),
    invariants_verified: Type.Boolean(),
    updated_at: Type.String({ format: 'date-time' }),
}, { $id: 'DynamicPlanEnvelope' });
//# sourceMappingURL=dynamicPlanReification.js.map