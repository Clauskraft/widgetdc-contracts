import { Static } from '@sinclair/typebox';
export declare const PlatformCompletionWorkstream: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"completion">, import("@sinclair/typebox").TLiteral<"consolidation">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"adoption">]>;
export type PlatformCompletionWorkstream = Static<typeof PlatformCompletionWorkstream>;
export declare const PlatformCompletionLifecycleState: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"unverified">, import("@sinclair/typebox").TLiteral<"planned">, import("@sinclair/typebox").TLiteral<"in_progress">, import("@sinclair/typebox").TLiteral<"merged">, import("@sinclair/typebox").TLiteral<"deployed">, import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"adopted">, import("@sinclair/typebox").TLiteral<"blocked">]>;
export type PlatformCompletionLifecycleState = Static<typeof PlatformCompletionLifecycleState>;
export declare const PlatformCompletionLedgerEntry: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
    lifecycle_state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"planned">, import("@sinclair/typebox").TLiteral<"in_progress">, import("@sinclair/typebox").TLiteral<"merged">, import("@sinclair/typebox").TLiteral<"deployed">]>;
    runtime_proof_claimed: import("@sinclair/typebox").TLiteral<false>;
    claim_promotion_eligible: import("@sinclair/typebox").TLiteral<false>;
    repo: import("@sinclair/typebox").TString;
    workstream: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"completion">, import("@sinclair/typebox").TLiteral<"consolidation">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"adoption">]>;
    issue_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    pr_number: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    commit_sha: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    deployed_sha: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    evidence_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    updated_at: import("@sinclair/typebox").TString;
}>, import("@sinclair/typebox").TObject<{
    lifecycle_state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"blocked">, import("@sinclair/typebox").TLiteral<"unverified">]>;
    blocker_code: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    runtime_proof_claimed: import("@sinclair/typebox").TLiteral<false>;
    claim_promotion_eligible: import("@sinclair/typebox").TLiteral<false>;
    repo: import("@sinclair/typebox").TString;
    workstream: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"completion">, import("@sinclair/typebox").TLiteral<"consolidation">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"adoption">]>;
    issue_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    pr_number: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    commit_sha: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    deployed_sha: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    evidence_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    updated_at: import("@sinclair/typebox").TString;
}>, import("@sinclair/typebox").TObject<{
    lifecycle_state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"adopted">]>;
    runtime_proof_claimed: import("@sinclair/typebox").TBoolean;
    claim_promotion_eligible: import("@sinclair/typebox").TBoolean;
    repo: import("@sinclair/typebox").TString;
    workstream: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"completion">, import("@sinclair/typebox").TLiteral<"consolidation">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"adoption">]>;
    issue_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    pr_number: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    commit_sha: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    deployed_sha: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    evidence_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    updated_at: import("@sinclair/typebox").TString;
}>]>;
export type PlatformCompletionLedgerEntry = Static<typeof PlatformCompletionLedgerEntry>;
export declare const PlatformCompletionLedger: import("@sinclair/typebox").TObject<{
    schema_version: import("@sinclair/typebox").TLiteral<"platform_completion_ledger.v1">;
    generated_at: import("@sinclair/typebox").TString;
    entries: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
        lifecycle_state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"planned">, import("@sinclair/typebox").TLiteral<"in_progress">, import("@sinclair/typebox").TLiteral<"merged">, import("@sinclair/typebox").TLiteral<"deployed">]>;
        runtime_proof_claimed: import("@sinclair/typebox").TLiteral<false>;
        claim_promotion_eligible: import("@sinclair/typebox").TLiteral<false>;
        repo: import("@sinclair/typebox").TString;
        workstream: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"completion">, import("@sinclair/typebox").TLiteral<"consolidation">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"adoption">]>;
        issue_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        pr_number: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        commit_sha: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        deployed_sha: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        evidence_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        updated_at: import("@sinclair/typebox").TString;
    }>, import("@sinclair/typebox").TObject<{
        lifecycle_state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"blocked">, import("@sinclair/typebox").TLiteral<"unverified">]>;
        blocker_code: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        runtime_proof_claimed: import("@sinclair/typebox").TLiteral<false>;
        claim_promotion_eligible: import("@sinclair/typebox").TLiteral<false>;
        repo: import("@sinclair/typebox").TString;
        workstream: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"completion">, import("@sinclair/typebox").TLiteral<"consolidation">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"adoption">]>;
        issue_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        pr_number: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        commit_sha: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        deployed_sha: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        evidence_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        updated_at: import("@sinclair/typebox").TString;
    }>, import("@sinclair/typebox").TObject<{
        lifecycle_state: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"adopted">]>;
        runtime_proof_claimed: import("@sinclair/typebox").TBoolean;
        claim_promotion_eligible: import("@sinclair/typebox").TBoolean;
        repo: import("@sinclair/typebox").TString;
        workstream: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"completion">, import("@sinclair/typebox").TLiteral<"consolidation">, import("@sinclair/typebox").TLiteral<"routing">, import("@sinclair/typebox").TLiteral<"adoption">]>;
        issue_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        pr_number: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        commit_sha: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        deployed_sha: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        evidence_refs: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        updated_at: import("@sinclair/typebox").TString;
    }>]>>;
}>;
export type PlatformCompletionLedger = Static<typeof PlatformCompletionLedger>;
//# sourceMappingURL=completion-ledger.d.ts.map