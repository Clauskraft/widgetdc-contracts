import { Type, Static } from '@sinclair/typebox'

/**
 * NotebookSpec — Consulting Notebook contract.
 * Interactive notebook with query, insight, data, and action cells.
 * Cells execute sequentially: query via MCP, insight via RLM,
 * data references previous cells, action is pass-through.
 * Wire format: snake_case JSON.
 *
 * Source: Adoption Blueprint G4.20 (notebook)
 */

// ── Cell types ───────────────────────────────────────────────

/** Query cell — executes a query (e.g. via MCP) and caches the result */
export const QueryCell = Type.Object({
  type: Type.Literal('query'),
  id: Type.String(),
  query: Type.String(),
  result: Type.Optional(Type.Unknown()),
}, { $id: 'query_cell', description: 'Notebook query cell (executes a query, caches result)' })

export type QueryCell = Static<typeof QueryCell>

/** Insight cell — generates narrative content (e.g. via RLM) from a prompt */
export const InsightCell = Type.Object({
  type: Type.Literal('insight'),
  id: Type.String(),
  prompt: Type.String(),
  content: Type.Optional(Type.String()),
}, { $id: 'insight_cell', description: 'Notebook insight cell (generates content from a prompt)' })

export type InsightCell = Static<typeof InsightCell>

/** Data cell — references a previous cell and renders its result */
export const DataCell = Type.Object({
  type: Type.Literal('data'),
  id: Type.String(),
  source_cell_id: Type.String(),
  visualization: Type.Optional(Type.Union([
    Type.Literal('table'),
    Type.Literal('chart'),
  ])),
  result: Type.Optional(Type.Unknown()),
}, { $id: 'data_cell', description: 'Notebook data cell (references and visualizes a prior cell result)' })

export type DataCell = Static<typeof DataCell>

/** Action cell — captures a recommendation with an optional Linear issue */
export const ActionCell = Type.Object({
  type: Type.Literal('action'),
  id: Type.String(),
  recommendation: Type.String(),
  linear_issue: Type.Optional(Type.String()),
}, { $id: 'action_cell', description: 'Notebook action cell (recommendation + optional Linear issue)' })

export type ActionCell = Static<typeof ActionCell>

// ── Union of all cell types ──────────────────────────────────

/** Discriminated union of all 4 notebook cell types */
export const NotebookCell = Type.Union([
  QueryCell,
  InsightCell,
  DataCell,
  ActionCell,
], { $id: 'NotebookCell', description: 'Notebook cell (discriminated on type)' })

export type NotebookCell = Static<typeof NotebookCell>

// ── Top-level notebook ───────────────────────────────────────

/**
 * NotebookSpec — top-level consulting notebook document.
 * Ordered cells executed sequentially.
 */
export const NotebookSpec = Type.Object({
  $id: Type.String({ description: 'widgetdc:notebook:{uuid}' }),
  $schema: Type.Literal('widgetdc:notebook:v1'),
  title: Type.String(),
  cells: Type.Array(NotebookCell),
  created_at: Type.String({ format: 'date-time', description: 'ISO 8601 timestamp' }),
  updated_at: Type.String({ format: 'date-time', description: 'ISO 8601 timestamp' }),
  created_by: Type.String({ description: 'Agent or user ID' }),
}, { $id: 'NotebookSpec', description: 'Consulting Notebook — interactive notebook with ordered cells' })

export type NotebookSpec = Static<typeof NotebookSpec>
