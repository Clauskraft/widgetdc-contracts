import { Static } from '@sinclair/typebox';
/**
 * NotebookSpec — Consulting Notebook contract.
 * Interactive notebook with query, insight, data, and action cells.
 * Cells execute sequentially: query via MCP, insight via RLM,
 * data references previous cells, action is pass-through.
 * Wire format: snake_case JSON.
 *
 * Source: Adoption Blueprint G4.20 (notebook)
 */
/** Query cell — executes a query (e.g. via MCP) and caches the result */
export declare const QueryCell: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"query">;
    id: import("@sinclair/typebox").TString;
    query: import("@sinclair/typebox").TString;
    result: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnknown>;
}>;
export type QueryCell = Static<typeof QueryCell>;
/** Insight cell — generates narrative content (e.g. via RLM) from a prompt */
export declare const InsightCell: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"insight">;
    id: import("@sinclair/typebox").TString;
    prompt: import("@sinclair/typebox").TString;
    content: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type InsightCell = Static<typeof InsightCell>;
/** Data cell — references a previous cell and renders its result */
export declare const DataCell: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"data">;
    id: import("@sinclair/typebox").TString;
    source_cell_id: import("@sinclair/typebox").TString;
    visualization: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"table">, import("@sinclair/typebox").TLiteral<"chart">]>>;
    result: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnknown>;
}>;
export type DataCell = Static<typeof DataCell>;
/** Action cell — captures a recommendation with an optional Linear issue */
export declare const ActionCell: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"action">;
    id: import("@sinclair/typebox").TString;
    recommendation: import("@sinclair/typebox").TString;
    linear_issue: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type ActionCell = Static<typeof ActionCell>;
/** Discriminated union of all 4 notebook cell types */
export declare const NotebookCell: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"query">;
    id: import("@sinclair/typebox").TString;
    query: import("@sinclair/typebox").TString;
    result: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnknown>;
}>, import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"insight">;
    id: import("@sinclair/typebox").TString;
    prompt: import("@sinclair/typebox").TString;
    content: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>, import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"data">;
    id: import("@sinclair/typebox").TString;
    source_cell_id: import("@sinclair/typebox").TString;
    visualization: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"table">, import("@sinclair/typebox").TLiteral<"chart">]>>;
    result: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnknown>;
}>, import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"action">;
    id: import("@sinclair/typebox").TString;
    recommendation: import("@sinclair/typebox").TString;
    linear_issue: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>]>;
export type NotebookCell = Static<typeof NotebookCell>;
/**
 * NotebookSpec — top-level consulting notebook document.
 * Ordered cells executed sequentially.
 */
export declare const NotebookSpec: import("@sinclair/typebox").TObject<{
    $id: import("@sinclair/typebox").TString;
    $schema: import("@sinclair/typebox").TLiteral<"widgetdc:notebook:v1">;
    title: import("@sinclair/typebox").TString;
    cells: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"query">;
        id: import("@sinclair/typebox").TString;
        query: import("@sinclair/typebox").TString;
        result: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnknown>;
    }>, import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"insight">;
        id: import("@sinclair/typebox").TString;
        prompt: import("@sinclair/typebox").TString;
        content: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>, import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"data">;
        id: import("@sinclair/typebox").TString;
        source_cell_id: import("@sinclair/typebox").TString;
        visualization: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"table">, import("@sinclair/typebox").TLiteral<"chart">]>>;
        result: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnknown>;
    }>, import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"action">;
        id: import("@sinclair/typebox").TString;
        recommendation: import("@sinclair/typebox").TString;
        linear_issue: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>]>>;
    created_at: import("@sinclair/typebox").TString;
    updated_at: import("@sinclair/typebox").TString;
    created_by: import("@sinclair/typebox").TString;
}>;
export type NotebookSpec = Static<typeof NotebookSpec>;
//# sourceMappingURL=notebook-spec.d.ts.map