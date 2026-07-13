/**
 * WDC continuation lifecycle contracts.
 *
 * This module defines source-level cross-service contracts only. It does not
 * execute actions, resume sessions, mutate governance state, or emit events.
 */
import { Static } from '@sinclair/typebox';
export declare const ContinuationPhase: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"authority_changed">, import("@sinclair/typebox").TLiteral<"rehydration_required">, import("@sinclair/typebox").TLiteral<"replanning">, import("@sinclair/typebox").TLiteral<"executing_safe_actions">, import("@sinclair/typebox").TLiteral<"waiting_for_human">, import("@sinclair/typebox").TLiteral<"blocked">, import("@sinclair/typebox").TLiteral<"complete">]>;
export type ContinuationPhase = Static<typeof ContinuationPhase>;
export declare const ContinuationState: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.continuation_state.v1">;
    continuation_id: import("@sinclair/typebox").TString;
    phase: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"authority_changed">, import("@sinclair/typebox").TLiteral<"rehydration_required">, import("@sinclair/typebox").TLiteral<"replanning">, import("@sinclair/typebox").TLiteral<"executing_safe_actions">, import("@sinclair/typebox").TLiteral<"waiting_for_human">, import("@sinclair/typebox").TLiteral<"blocked">, import("@sinclair/typebox").TLiteral<"complete">]>;
    current_authority_ref: import("@sinclair/typebox").TString;
    previous_authority_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    next_safe_action_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    active_human_gate_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    updated_at: import("@sinclair/typebox").TString;
}>;
export type ContinuationState = Static<typeof ContinuationState>;
export declare const BlockerClassification: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"AUTO_RESOLVABLE">, import("@sinclair/typebox").TLiteral<"SAFE_CONTINUE">, import("@sinclair/typebox").TLiteral<"HUMAN_IDENTITY_REQUIRED">, import("@sinclair/typebox").TLiteral<"EXACT_APPROVAL_REQUIRED">, import("@sinclair/typebox").TLiteral<"OWNER_SECRET_ACTION">, import("@sinclair/typebox").TLiteral<"DESTRUCTIVE_ACTION_APPROVAL">, import("@sinclair/typebox").TLiteral<"UNRESOLVABLE_CONFLICT">]>;
export type BlockerClassification = Static<typeof BlockerClassification>;
export declare const ContinuationBlocker: import("@sinclair/typebox").TObject<{
    blocker_id: import("@sinclair/typebox").TString;
    classification: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"AUTO_RESOLVABLE">, import("@sinclair/typebox").TLiteral<"SAFE_CONTINUE">, import("@sinclair/typebox").TLiteral<"HUMAN_IDENTITY_REQUIRED">, import("@sinclair/typebox").TLiteral<"EXACT_APPROVAL_REQUIRED">, import("@sinclair/typebox").TLiteral<"OWNER_SECRET_ACTION">, import("@sinclair/typebox").TLiteral<"DESTRUCTIVE_ACTION_APPROVAL">, import("@sinclair/typebox").TLiteral<"UNRESOLVABLE_CONFLICT">]>;
    description: import("@sinclair/typebox").TString;
    blocks_action_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    evidence_ref: import("@sinclair/typebox").TString;
}>;
export type ContinuationBlocker = Static<typeof ContinuationBlocker>;
export declare const HumanOnlyGate: import("@sinclair/typebox").TObject<{
    gate_id: import("@sinclair/typebox").TString;
    gate_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"oauth_consent">, import("@sinclair/typebox").TLiteral<"identity_verification">, import("@sinclair/typebox").TLiteral<"owner_secret_action">, import("@sinclair/typebox").TLiteral<"destructive_action_approval">]>;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"waiting">, import("@sinclair/typebox").TLiteral<"satisfied">, import("@sinclair/typebox").TLiteral<"expired">]>;
    required_actor: import("@sinclair/typebox").TString;
    prompt: import("@sinclair/typebox").TString;
    resume_action_id: import("@sinclair/typebox").TString;
    created_at: import("@sinclair/typebox").TString;
    satisfied_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type HumanOnlyGate = Static<typeof HumanOnlyGate>;
export declare const PendingSafeAction: import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"pending">;
    executable: import("@sinclair/typebox").TLiteral<true>;
    action_id: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TString;
    action_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rehydrate">, import("@sinclair/typebox").TLiteral<"replan">, import("@sinclair/typebox").TLiteral<"inspect">, import("@sinclair/typebox").TLiteral<"verify">, import("@sinclair/typebox").TLiteral<"resume">, import("@sinclair/typebox").TLiteral<"closeout">]>;
    authority_ref: import("@sinclair/typebox").TString;
}>;
export type PendingSafeAction = Static<typeof PendingSafeAction>;
export declare const ExecutedSafeAction: import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"executed">;
    executable: import("@sinclair/typebox").TLiteral<false>;
    executed_at: import("@sinclair/typebox").TString;
    action_id: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TString;
    action_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rehydrate">, import("@sinclair/typebox").TLiteral<"replan">, import("@sinclair/typebox").TLiteral<"inspect">, import("@sinclair/typebox").TLiteral<"verify">, import("@sinclair/typebox").TLiteral<"resume">, import("@sinclair/typebox").TLiteral<"closeout">]>;
    authority_ref: import("@sinclair/typebox").TString;
}>;
export type ExecutedSafeAction = Static<typeof ExecutedSafeAction>;
export declare const StaleSafeAction: import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"stale">;
    executable: import("@sinclair/typebox").TLiteral<false>;
    stale_reason: import("@sinclair/typebox").TString;
    action_id: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TString;
    action_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rehydrate">, import("@sinclair/typebox").TLiteral<"replan">, import("@sinclair/typebox").TLiteral<"inspect">, import("@sinclair/typebox").TLiteral<"verify">, import("@sinclair/typebox").TLiteral<"resume">, import("@sinclair/typebox").TLiteral<"closeout">]>;
    authority_ref: import("@sinclair/typebox").TString;
}>;
export type StaleSafeAction = Static<typeof StaleSafeAction>;
export declare const NextSafeAction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"pending">;
    executable: import("@sinclair/typebox").TLiteral<true>;
    action_id: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TString;
    action_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rehydrate">, import("@sinclair/typebox").TLiteral<"replan">, import("@sinclair/typebox").TLiteral<"inspect">, import("@sinclair/typebox").TLiteral<"verify">, import("@sinclair/typebox").TLiteral<"resume">, import("@sinclair/typebox").TLiteral<"closeout">]>;
    authority_ref: import("@sinclair/typebox").TString;
}>, import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"executed">;
    executable: import("@sinclair/typebox").TLiteral<false>;
    executed_at: import("@sinclair/typebox").TString;
    action_id: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TString;
    action_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rehydrate">, import("@sinclair/typebox").TLiteral<"replan">, import("@sinclair/typebox").TLiteral<"inspect">, import("@sinclair/typebox").TLiteral<"verify">, import("@sinclair/typebox").TLiteral<"resume">, import("@sinclair/typebox").TLiteral<"closeout">]>;
    authority_ref: import("@sinclair/typebox").TString;
}>, import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"stale">;
    executable: import("@sinclair/typebox").TLiteral<false>;
    stale_reason: import("@sinclair/typebox").TString;
    action_id: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TString;
    action_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rehydrate">, import("@sinclair/typebox").TLiteral<"replan">, import("@sinclair/typebox").TLiteral<"inspect">, import("@sinclair/typebox").TLiteral<"verify">, import("@sinclair/typebox").TLiteral<"resume">, import("@sinclair/typebox").TLiteral<"closeout">]>;
    authority_ref: import("@sinclair/typebox").TString;
}>]>;
export type NextSafeAction = Static<typeof NextSafeAction>;
/**
 * Untrusted continuation ingress. Governance context is intentionally absent;
 * authenticated server-side code owns actor, tenant, scope, and approval data.
 */
export declare const ContinuationRequest: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.continuation_request.v1">;
    continuation_id: import("@sinclair/typebox").TString;
    authority_ref: import("@sinclair/typebox").TString;
    requested_at: import("@sinclair/typebox").TString;
}>;
export type ContinuationRequest = Static<typeof ContinuationRequest>;
export declare const ContinuationReceipt: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"wdc.continuation_receipt.v1">;
    receipt_id: import("@sinclair/typebox").TString;
    continuation_id: import("@sinclair/typebox").TString;
    current_authority_ref: import("@sinclair/typebox").TString;
    continuation_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"continued">, import("@sinclair/typebox").TLiteral<"waiting_for_human">, import("@sinclair/typebox").TLiteral<"blocked">, import("@sinclair/typebox").TLiteral<"complete">]>;
    safe_actions_discovered: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
        status: import("@sinclair/typebox").TLiteral<"pending">;
        executable: import("@sinclair/typebox").TLiteral<true>;
        action_id: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TString;
        action_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rehydrate">, import("@sinclair/typebox").TLiteral<"replan">, import("@sinclair/typebox").TLiteral<"inspect">, import("@sinclair/typebox").TLiteral<"verify">, import("@sinclair/typebox").TLiteral<"resume">, import("@sinclair/typebox").TLiteral<"closeout">]>;
        authority_ref: import("@sinclair/typebox").TString;
    }>, import("@sinclair/typebox").TObject<{
        status: import("@sinclair/typebox").TLiteral<"executed">;
        executable: import("@sinclair/typebox").TLiteral<false>;
        executed_at: import("@sinclair/typebox").TString;
        action_id: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TString;
        action_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rehydrate">, import("@sinclair/typebox").TLiteral<"replan">, import("@sinclair/typebox").TLiteral<"inspect">, import("@sinclair/typebox").TLiteral<"verify">, import("@sinclair/typebox").TLiteral<"resume">, import("@sinclair/typebox").TLiteral<"closeout">]>;
        authority_ref: import("@sinclair/typebox").TString;
    }>, import("@sinclair/typebox").TObject<{
        status: import("@sinclair/typebox").TLiteral<"stale">;
        executable: import("@sinclair/typebox").TLiteral<false>;
        stale_reason: import("@sinclair/typebox").TString;
        action_id: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TString;
        action_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rehydrate">, import("@sinclair/typebox").TLiteral<"replan">, import("@sinclair/typebox").TLiteral<"inspect">, import("@sinclair/typebox").TLiteral<"verify">, import("@sinclair/typebox").TLiteral<"resume">, import("@sinclair/typebox").TLiteral<"closeout">]>;
        authority_ref: import("@sinclair/typebox").TString;
    }>]>>;
    safe_actions_executed: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        status: import("@sinclair/typebox").TLiteral<"executed">;
        executable: import("@sinclair/typebox").TLiteral<false>;
        executed_at: import("@sinclair/typebox").TString;
        action_id: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TString;
        action_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rehydrate">, import("@sinclair/typebox").TLiteral<"replan">, import("@sinclair/typebox").TLiteral<"inspect">, import("@sinclair/typebox").TLiteral<"verify">, import("@sinclair/typebox").TLiteral<"resume">, import("@sinclair/typebox").TLiteral<"closeout">]>;
        authority_ref: import("@sinclair/typebox").TString;
    }>>;
    unexecuted_safe_actions: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        status: import("@sinclair/typebox").TLiteral<"pending">;
        executable: import("@sinclair/typebox").TLiteral<true>;
        action_id: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TString;
        action_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rehydrate">, import("@sinclair/typebox").TLiteral<"replan">, import("@sinclair/typebox").TLiteral<"inspect">, import("@sinclair/typebox").TLiteral<"verify">, import("@sinclair/typebox").TLiteral<"resume">, import("@sinclair/typebox").TLiteral<"closeout">]>;
        authority_ref: import("@sinclair/typebox").TString;
    }>>;
    human_only_gates: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        gate_id: import("@sinclair/typebox").TString;
        gate_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"oauth_consent">, import("@sinclair/typebox").TLiteral<"identity_verification">, import("@sinclair/typebox").TLiteral<"owner_secret_action">, import("@sinclair/typebox").TLiteral<"destructive_action_approval">]>;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"waiting">, import("@sinclair/typebox").TLiteral<"satisfied">, import("@sinclair/typebox").TLiteral<"expired">]>;
        required_actor: import("@sinclair/typebox").TString;
        prompt: import("@sinclair/typebox").TString;
        resume_action_id: import("@sinclair/typebox").TString;
        created_at: import("@sinclair/typebox").TString;
        satisfied_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    blockers: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        blocker_id: import("@sinclair/typebox").TString;
        classification: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"AUTO_RESOLVABLE">, import("@sinclair/typebox").TLiteral<"SAFE_CONTINUE">, import("@sinclair/typebox").TLiteral<"HUMAN_IDENTITY_REQUIRED">, import("@sinclair/typebox").TLiteral<"EXACT_APPROVAL_REQUIRED">, import("@sinclair/typebox").TLiteral<"OWNER_SECRET_ACTION">, import("@sinclair/typebox").TLiteral<"DESTRUCTIVE_ACTION_APPROVAL">, import("@sinclair/typebox").TLiteral<"UNRESOLVABLE_CONFLICT">]>;
        description: import("@sinclair/typebox").TString;
        blocks_action_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        evidence_ref: import("@sinclair/typebox").TString;
    }>>;
    created_at: import("@sinclair/typebox").TString;
}>;
export type ContinuationReceipt = Static<typeof ContinuationReceipt>;
export interface ContinuationReceiptValidation {
    valid: boolean;
    errors: string[];
}
export declare function isLegalContinuationTransition(from: ContinuationPhase, to: ContinuationPhase): boolean;
export declare function validateContinuationReceipt(value: unknown): ContinuationReceiptValidation;
//# sourceMappingURL=continuation.d.ts.map