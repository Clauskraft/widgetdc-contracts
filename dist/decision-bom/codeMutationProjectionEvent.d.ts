/**
 * CodeMutationProjectionEvent — CloudEvents 1.0 contract for near-realtime codebase mirroring.
 *
 * Emitted when a git commit/push/deploy occurs, triggering the WDC 18 Delta Engine
 * to compute AST diffs and project impacted BOMItems and Capabilities into Neo4j AuraDB.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const ASTDiffSummary: import("@sinclair/typebox").TObject<{
    symbols_added: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    symbols_modified: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    symbols_removed: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    impacted_bom_items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    impacted_capabilities: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
}>;
export type ASTDiffSummary = Static<typeof ASTDiffSummary>;
export declare const CodeMutationData: import("@sinclair/typebox").TObject<{
    repo: import("@sinclair/typebox").TString;
    commit_sha: import("@sinclair/typebox").TString;
    branch: import("@sinclair/typebox").TString;
    author: import("@sinclair/typebox").TString;
    files_changed: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    ast_diff_summary: import("@sinclair/typebox").TObject<{
        symbols_added: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        symbols_modified: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        symbols_removed: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        impacted_bom_items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        impacted_capabilities: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    }>;
    valid_from: import("@sinclair/typebox").TString;
    observed_at: import("@sinclair/typebox").TString;
}>;
export type CodeMutationData = Static<typeof CodeMutationData>;
export declare const CodeMutationProjectionEvent: import("@sinclair/typebox").TObject<{
    specversion: import("@sinclair/typebox").TLiteral<"1.0">;
    id: import("@sinclair/typebox").TString;
    source: import("@sinclair/typebox").TString;
    type: import("@sinclair/typebox").TLiteral<"wdc.code.mutation.committed">;
    time: import("@sinclair/typebox").TString;
    correlation_id: import("@sinclair/typebox").TString;
    data: import("@sinclair/typebox").TObject<{
        repo: import("@sinclair/typebox").TString;
        commit_sha: import("@sinclair/typebox").TString;
        branch: import("@sinclair/typebox").TString;
        author: import("@sinclair/typebox").TString;
        files_changed: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        ast_diff_summary: import("@sinclair/typebox").TObject<{
            symbols_added: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
            symbols_modified: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
            symbols_removed: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
            impacted_bom_items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
            impacted_capabilities: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        }>;
        valid_from: import("@sinclair/typebox").TString;
        observed_at: import("@sinclair/typebox").TString;
    }>;
}>;
export type CodeMutationProjectionEvent = Static<typeof CodeMutationProjectionEvent>;
//# sourceMappingURL=codeMutationProjectionEvent.d.ts.map