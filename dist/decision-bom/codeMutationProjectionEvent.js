/**
 * CodeMutationProjectionEvent — CloudEvents 1.0 contract for near-realtime codebase mirroring.
 *
 * Emitted when a git commit/push/deploy occurs, triggering the WDC 18 Delta Engine
 * to compute AST diffs and project impacted BOMItems and Capabilities into Neo4j AuraDB.
 *
 * Wire format: snake_case JSON.
 */
import { Type } from '@sinclair/typebox';
export const ASTDiffSummary = Type.Object({
    symbols_added: Type.Array(Type.String(), { description: 'New exported symbols, types, or functions.' }),
    symbols_modified: Type.Array(Type.String(), { description: 'Modified exported symbols, types, or signatures.' }),
    symbols_removed: Type.Array(Type.String(), { description: 'Deleted or renamed symbols.' }),
    impacted_bom_items: Type.Array(Type.String(), { description: 'List of BOMItem IDs directly impacted by this diff.' }),
    impacted_capabilities: Type.Array(Type.String(), { description: 'List of Capability IDs affected by the changed symbols.' }),
}, { $id: 'ASTDiffSummary' });
export const CodeMutationData = Type.Object({
    repo: Type.String({ minLength: 1, description: 'Repository name in WidgeTDC scope.' }),
    commit_sha: Type.String({ pattern: '^[0-9a-f]{40}$', description: 'Canonical 40-character git commit SHA.' }),
    branch: Type.String({ minLength: 1, description: 'Source branch name.' }),
    author: Type.String({ minLength: 1, description: 'Commit author identifier.' }),
    files_changed: Type.Array(Type.String(), { description: 'List of repository-relative file paths touched.' }),
    ast_diff_summary: ASTDiffSummary,
    valid_from: Type.String({ format: 'date-time', description: 'Timestamp when the commit occurred in git.' }),
    observed_at: Type.String({ format: 'date-time', description: 'Timestamp when WDC observed/ingested the change.' }),
}, { $id: 'CodeMutationData' });
export const CodeMutationProjectionEvent = Type.Object({
    specversion: Type.Literal('1.0', { description: 'CloudEvents spec version.' }),
    id: Type.String({ minLength: 1, description: 'Unique event identifier.' }),
    source: Type.String({ pattern: '^wdc:git:[a-zA-Z0-9_.-]+$', description: 'Event source URI matching wdc:git:<repo>.' }),
    type: Type.Literal('wdc.code.mutation.committed', { description: 'Event type identifier.' }),
    time: Type.String({ format: 'date-time', description: 'CloudEvents timestamp.' }),
    correlation_id: Type.String({ minLength: 1, description: 'Correlation ID for EventSpine trace.' }),
    data: CodeMutationData,
}, { $id: 'CodeMutationProjectionEvent' });
//# sourceMappingURL=codeMutationProjectionEvent.js.map