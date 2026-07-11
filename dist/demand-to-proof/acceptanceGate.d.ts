/**
 * AcceptanceGate — Demand-to-Proof contract authority surface.
 *
 * Candidate-only wire contract used by WDC/DeskSmith contract inventory to
 * make demand, extraction, scoring, routing, mapping, review and dry-run graph
 * diff boundaries explicit before any graph write or claim promotion.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const AcceptanceGate: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    schema_version: import("@sinclair/typebox").TString;
    demand_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    source_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    source_fit_score: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    extraction_contract_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    required_competences: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    provided_competences: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    proof_boundary: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"candidate_only_not_runtime_proof">, import("@sinclair/typebox").TLiteral<"runtime_evidence_required">, import("@sinclair/typebox").TLiteral<"claim_promotion_forbidden">]>>;
    graph_write_allowed: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    claim_promotion_allowed: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    evidence_hash: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    created_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type AcceptanceGate = Static<typeof AcceptanceGate>;
//# sourceMappingURL=acceptanceGate.d.ts.map