import { Type } from '@sinclair/typebox';
/**
 * AnalysisArtifact — WAD (WidgeTDC Analysis Document).
 * Portable analysis artifact that renders natively in Open WebUI and Obsidian.
 * Wire format: snake_case JSON.
 *
 * Source: Adoption Blueprint G4.1
 */
// ── Block types ──────────────────────────────────────────────
/** Text content block */
export const TextBlock = Type.Object({
    type: Type.Literal('text'),
    id: Type.String(),
    title: Type.Optional(Type.String()),
    content: Type.String(),
}, { $id: 'TextBlock', description: 'Plain text content block' });
/** Table block with headers and rows */
export const TableBlock = Type.Object({
    type: Type.Literal('table'),
    id: Type.String(),
    title: Type.Optional(Type.String()),
    headers: Type.Array(Type.String()),
    rows: Type.Array(Type.Array(Type.String())),
}, { $id: 'TableBlock', description: 'Tabular data block' });
/** Chart visualization block */
export const ChartBlock = Type.Object({
    type: Type.Literal('chart'),
    id: Type.String(),
    title: Type.Optional(Type.String()),
    chart_type: Type.Union([
        Type.Literal('bar'),
        Type.Literal('line'),
        Type.Literal('radar'),
        Type.Literal('sankey'),
    ]),
    data: Type.Object({}, { additionalProperties: true }),
    config: Type.Optional(Type.Object({}, { additionalProperties: true })),
}, { $id: 'ChartBlock', description: 'Chart visualization block' });
/** Cypher query block with optional cached result */
export const CypherBlock = Type.Object({
    type: Type.Literal('cypher'),
    id: Type.String(),
    title: Type.Optional(Type.String()),
    query: Type.String(),
    cached_result: Type.Optional(Type.Object({}, { additionalProperties: true })),
}, { $id: 'CypherBlock', description: 'Neo4j Cypher query block' });
/** Mermaid diagram block */
export const MermaidBlock = Type.Object({
    type: Type.Literal('mermaid'),
    id: Type.String(),
    title: Type.Optional(Type.String()),
    source: Type.String(),
}, { $id: 'MermaidBlock', description: 'Mermaid diagram source block' });
/** KPI card block */
export const KpiCardBlock = Type.Object({
    type: Type.Literal('kpi_card'),
    id: Type.String(),
    title: Type.Optional(Type.String()),
    label: Type.String(),
    value: Type.Union([Type.Number(), Type.String()]),
    unit: Type.Optional(Type.String()),
    trend: Type.Optional(Type.Union([
        Type.Literal('up'),
        Type.Literal('down'),
        Type.Literal('flat'),
    ])),
}, { $id: 'KpiCardBlock', description: 'Key performance indicator card block' });
/** Deep link block to external tools */
export const DeepLinkBlock = Type.Object({
    type: Type.Literal('deep_link'),
    id: Type.String(),
    title: Type.Optional(Type.String()),
    target: Type.Union([
        Type.Literal('obsidian'),
        Type.Literal('open-webui'),
    ]),
    uri: Type.String(),
    label: Type.String(),
}, { $id: 'DeepLinkBlock', description: 'Deep link to Obsidian or Open WebUI' });
// ── Union of all block types ─────────────────────────────────
/** Discriminated union of all 7 analysis block types */
export const AnalysisBlock = Type.Union([
    TextBlock,
    TableBlock,
    ChartBlock,
    CypherBlock,
    MermaidBlock,
    KpiCardBlock,
    DeepLinkBlock,
], { $id: 'AnalysisBlock', description: 'Analysis content block (discriminated on type)' });
// ── Graph references ─────────────────────────────────────────
/** Optional Neo4j graph references */
export const GraphRefs = Type.Object({
    node_ids: Type.Array(Type.String()),
    domains: Type.Array(Type.String()),
}, { $id: 'GraphRefs', description: 'Neo4j graph node and domain references' });
// ── Top-level artifact ───────────────────────────────────────
/** Artifact source system */
export const ArtifactSource = Type.Union([
    Type.Literal('open-webui'),
    Type.Literal('obsidian'),
    Type.Literal('orchestrator'),
], { $id: 'ArtifactSource', description: 'System that created the artifact' });
/** Artifact lifecycle status */
export const ArtifactStatus = Type.Union([
    Type.Literal('draft'),
    Type.Literal('published'),
    Type.Literal('archived'),
], { $id: 'ArtifactStatus', description: 'Artifact lifecycle status' });
/**
 * AnalysisArtifact — top-level WAD document.
 * Portable analysis artifact with ordered content blocks.
 */
export const AnalysisArtifact = Type.Object({
    $id: Type.String({ description: 'widgetdc:artifact:{uuid}' }),
    $schema: Type.Literal('widgetdc:analysis:v1'),
    title: Type.String(),
    source: ArtifactSource,
    created_at: Type.String({ format: 'date-time', description: 'ISO 8601 timestamp' }),
    updated_at: Type.String({ format: 'date-time', description: 'ISO 8601 timestamp' }),
    created_by: Type.String({ description: 'Agent or user ID' }),
    blocks: Type.Array(AnalysisBlock),
    graph_refs: Type.Optional(GraphRefs),
    tags: Type.Array(Type.String()),
    status: ArtifactStatus,
}, { $id: 'AnalysisArtifact', description: 'WidgeTDC Analysis Document (WAD) — portable analysis artifact' });
//# sourceMappingURL=analysis-artifact.js.map