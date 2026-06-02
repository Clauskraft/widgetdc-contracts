import { Type, Static } from '@sinclair/typebox'

/**
 * DrillContext — Drill Stack Navigation contract.
 * Hierarchical navigation: Domain → Segment → Framework → KPI → Trend → Recommendation.
 * Tracks the current position and the navigation stack.
 * Wire format: snake_case JSON.
 *
 * Source: Adoption Blueprint G4.15 (drill)
 */

// ── Drill level ──────────────────────────────────────────────

/** A single level on the drill navigation stack */
export const DrillLevel = Type.Object({
  level: Type.String(),
  id: Type.String(),
  label: Type.String(),
}, { $id: 'DrillLevel', description: 'Single level on the drill navigation stack' })

export type DrillLevel = Static<typeof DrillLevel>

// ── Drill context ────────────────────────────────────────────

/**
 * DrillContext — current drill navigation position plus the stack
 * of levels traversed to reach it.
 */
export const DrillContext = Type.Object({
  stack: Type.Array(DrillLevel),
  current_level: Type.String(),
  current_id: Type.String(),
  current_label: Type.String(),
  domain: Type.String(),
}, { $id: 'DrillContext', description: 'Drill navigation context — current position and traversed stack' })

export type DrillContext = Static<typeof DrillContext>
