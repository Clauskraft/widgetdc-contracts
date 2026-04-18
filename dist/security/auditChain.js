/**
 * AuditHashChainEntry — tamper-evident lineage entry (P1.4).
 *
 * Appended by the backend AuditHashChain service after every
 * ProductionOrder close/fail and every governance-sensitive tool call.
 *
 * Wire format: snake_case JSON.
 */
import { Type } from '@sinclair/typebox';
export const AuditHashChainEntry = Type.Object({
    event_id: Type.String({ format: 'uuid' }),
    ts: Type.String({ format: 'date-time', description: 'Canonical entry timestamp (UTC).' }),
    ts_raw: Type.Optional(Type.Integer({ description: 'Raw epoch-millis at entry creation for deterministic re-hashing.' })),
    tool: Type.String({ description: 'Fully-qualified tool / event identifier (e.g. "mrp.produce", "gdpr.erase").' }),
    payload_hash: Type.String({ description: 'Hex-encoded SHA-256 of the canonicalised payload.' }),
    prev_hash: Type.String({ description: 'entry_hash of the previous chain entry; "GENESIS" for the first entry.' }),
    entry_hash: Type.String({ description: 'Hex-encoded SHA-256 of (ts_raw || tool || payload_hash || prev_hash).' }),
    bom_version: Type.Literal('2.0'),
    actor: Type.Optional(Type.String({ description: 'Authenticated client/agent id.' })),
    order_id: Type.Optional(Type.String({ format: 'uuid', description: 'Linked :ProductionOrder if any.' })),
    compliance_tier: Type.Optional(Type.String()),
}, {
    $id: 'AuditHashChainEntry',
    description: 'Tamper-evident audit entry; chain is verifiable via /api/audit/verify-chain.',
});
export const AuditHashChainVerification = Type.Object({
    verified: Type.Boolean(),
    head_entry_hash: Type.Optional(Type.String()),
    entries_checked: Type.Integer({ minimum: 0 }),
    first_break_event_id: Type.Optional(Type.String()),
    checked_at: Type.String({ format: 'date-time' }),
}, {
    $id: 'AuditHashChainVerification',
    description: 'Output of chain-verification sweep; exposed via /api/audit/verify-chain.',
});
//# sourceMappingURL=auditChain.js.map