import { Static } from '@sinclair/typebox';
/**
 * AnalysisArtifact — WAD (WidgeTDC Analysis Document).
 * Portable analysis artifact that renders natively in Open WebUI and Obsidian.
 * Wire format: snake_case JSON.
 *
 * Source: Adoption Blueprint G4.1
 */
/** Text content block */
export declare const TextBlock: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"text">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    content: import("@sinclair/typebox").TString;
}>;
export type TextBlock = Static<typeof TextBlock>;
/** Table block with headers and rows */
export declare const TableBlock: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"table">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    headers: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    rows: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
}>;
export type TableBlock = Static<typeof TableBlock>;
/** Chart visualization block */
export declare const ChartBlock: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"chart">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    chart_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"bar">, import("@sinclair/typebox").TLiteral<"line">, import("@sinclair/typebox").TLiteral<"radar">, import("@sinclair/typebox").TLiteral<"sankey">]>;
    data: import("@sinclair/typebox").TObject<{}>;
    config: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{}>>;
}>;
export type ChartBlock = Static<typeof ChartBlock>;
/** Cypher query block with optional cached result */
export declare const CypherBlock: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"cypher">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    query: import("@sinclair/typebox").TString;
    cached_result: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{}>>;
}>;
export type CypherBlock = Static<typeof CypherBlock>;
/** Mermaid diagram block */
export declare const MermaidBlock: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"mermaid">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    source: import("@sinclair/typebox").TString;
}>;
export type MermaidBlock = Static<typeof MermaidBlock>;
/** KPI card block */
export declare const KpiCardBlock: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"kpi_card">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    label: import("@sinclair/typebox").TString;
    value: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TString]>;
    unit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    trend: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"flat">]>>;
}>;
export type KpiCardBlock = Static<typeof KpiCardBlock>;
/** Deep link block to external tools */
export declare const DeepLinkBlock: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"deep_link">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    target: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"obsidian">, import("@sinclair/typebox").TLiteral<"open-webui">]>;
    uri: import("@sinclair/typebox").TString;
    label: import("@sinclair/typebox").TString;
}>;
export type DeepLinkBlock = Static<typeof DeepLinkBlock>;
/** Discriminated union of all 7 analysis block types */
export declare const AnalysisBlock: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"text">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    content: import("@sinclair/typebox").TString;
}>, import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"table">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    headers: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    rows: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
}>, import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"chart">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    chart_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"bar">, import("@sinclair/typebox").TLiteral<"line">, import("@sinclair/typebox").TLiteral<"radar">, import("@sinclair/typebox").TLiteral<"sankey">]>;
    data: import("@sinclair/typebox").TObject<{}>;
    config: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{}>>;
}>, import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"cypher">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    query: import("@sinclair/typebox").TString;
    cached_result: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{}>>;
}>, import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"mermaid">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    source: import("@sinclair/typebox").TString;
}>, import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"kpi_card">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    label: import("@sinclair/typebox").TString;
    value: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TString]>;
    unit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    trend: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"flat">]>>;
}>, import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TLiteral<"deep_link">;
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    target: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"obsidian">, import("@sinclair/typebox").TLiteral<"open-webui">]>;
    uri: import("@sinclair/typebox").TString;
    label: import("@sinclair/typebox").TString;
}>]>;
export type AnalysisBlock = Static<typeof AnalysisBlock>;
/** Optional Neo4j graph references */
export declare const GraphRefs: import("@sinclair/typebox").TObject<{
    node_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    domains: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
}>;
export type GraphRefs = Static<typeof GraphRefs>;
/** Artifact source system */
export declare const ArtifactSource: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"open-webui">, import("@sinclair/typebox").TLiteral<"obsidian">, import("@sinclair/typebox").TLiteral<"orchestrator">]>;
export type ArtifactSource = Static<typeof ArtifactSource>;
/** Artifact lifecycle status */
export declare const ArtifactStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"published">, import("@sinclair/typebox").TLiteral<"archived">]>;
export type ArtifactStatus = Static<typeof ArtifactStatus>;
/**
 * AnalysisArtifact — top-level WAD document.
 * Portable analysis artifact with ordered content blocks.
 */
export declare const AnalysisArtifact: import("@sinclair/typebox").TObject<{
    $id: import("@sinclair/typebox").TString;
    $schema: import("@sinclair/typebox").TLiteral<"widgetdc:analysis:v1">;
    title: import("@sinclair/typebox").TString;
    source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"open-webui">, import("@sinclair/typebox").TLiteral<"obsidian">, import("@sinclair/typebox").TLiteral<"orchestrator">]>;
    created_at: import("@sinclair/typebox").TString;
    updated_at: import("@sinclair/typebox").TString;
    created_by: import("@sinclair/typebox").TString;
    blocks: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"text">;
        id: import("@sinclair/typebox").TString;
        title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        content: import("@sinclair/typebox").TString;
    }>, import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"table">;
        id: import("@sinclair/typebox").TString;
        title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        headers: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        rows: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    }>, import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"chart">;
        id: import("@sinclair/typebox").TString;
        title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        chart_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"bar">, import("@sinclair/typebox").TLiteral<"line">, import("@sinclair/typebox").TLiteral<"radar">, import("@sinclair/typebox").TLiteral<"sankey">]>;
        data: import("@sinclair/typebox").TObject<{}>;
        config: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{}>>;
    }>, import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"cypher">;
        id: import("@sinclair/typebox").TString;
        title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        query: import("@sinclair/typebox").TString;
        cached_result: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{}>>;
    }>, import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"mermaid">;
        id: import("@sinclair/typebox").TString;
        title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        source: import("@sinclair/typebox").TString;
    }>, import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"kpi_card">;
        id: import("@sinclair/typebox").TString;
        title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        label: import("@sinclair/typebox").TString;
        value: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TString]>;
        unit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        trend: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"flat">]>>;
    }>, import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"deep_link">;
        id: import("@sinclair/typebox").TString;
        title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        target: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"obsidian">, import("@sinclair/typebox").TLiteral<"open-webui">]>;
        uri: import("@sinclair/typebox").TString;
        label: import("@sinclair/typebox").TString;
    }>]>>;
    graph_refs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        node_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        domains: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    }>>;
    tags: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"published">, import("@sinclair/typebox").TLiteral<"archived">]>;
}>;
export type AnalysisArtifact = Static<typeof AnalysisArtifact>;
//# sourceMappingURL=analysis-artifact.d.ts.map