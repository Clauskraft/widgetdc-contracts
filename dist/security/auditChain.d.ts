/**
 * AuditHashChainEntry — tamper-evident lineage entry (P1.4).
 *
 * Appended by the backend AuditHashChain service after every
 * ProductionOrder close/fail and every governance-sensitive tool call.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const AuditHashChainEntry: import("@sinclair/typebox").TObject<{
    event_id: import("@sinclair/typebox").TString;
    ts: import("@sinclair/typebox").TString;
    ts_raw: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    tool: import("@sinclair/typebox").TString;
    payload_hash: import("@sinclair/typebox").TString;
    prev_hash: import("@sinclair/typebox").TString;
    entry_hash: import("@sinclair/typebox").TString;
    bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
    actor: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    order_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    compliance_tier: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type AuditHashChainEntry = Static<typeof AuditHashChainEntry>;
export declare const AuditHashChainVerification: import("@sinclair/typebox").TObject<{
    verified: import("@sinclair/typebox").TBoolean;
    head_entry_hash: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    entries_checked: import("@sinclair/typebox").TInteger;
    first_break_event_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    checked_at: import("@sinclair/typebox").TString;
}>;
export type AuditHashChainVerification = Static<typeof AuditHashChainVerification>;
//# sourceMappingURL=auditChain.d.ts.map