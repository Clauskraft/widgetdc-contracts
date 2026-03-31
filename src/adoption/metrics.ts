import { Type, Static } from '@sinclair/typebox'

/**
 * MetricsSummary — Platform intelligence metrics.
 * Wire format: snake_case JSON.
 *
 * Source: WidgeTDC lib/metricsCollector.ts
 */

/** Histogram percentile stats */
export const HistogramStats = Type.Object({
  count: Type.Integer({ minimum: 0 }),
  sum: Type.Number(),
  avg: Type.Number(),
  p50: Type.Number(),
  p95: Type.Number(),
  p99: Type.Number(),
}, { $id: 'HistogramStats', description: 'Histogram percentile statistics' })

export type HistogramStats = Static<typeof HistogramStats>

/** Full metrics summary snapshot */
export const MetricsSummary = Type.Object({
  counters: Type.Record(Type.String(), Type.Number(), { description: 'Counter metrics' }),
  gauges: Type.Record(Type.String(), Type.Number(), { description: 'Gauge metrics' }),
  histograms: Type.Record(Type.String(), HistogramStats, { description: 'Histogram metrics with percentiles' }),
  collected_at: Type.Number({ description: 'Unix timestamp ms' }),
}, { $id: 'MetricsSummary', description: 'Platform metrics summary snapshot' })

export type MetricsSummary = Static<typeof MetricsSummary>

/** MCP tool complexity tier */
export const ComplexityTier = Type.Union([
  Type.Literal('simple'),
  Type.Literal('moderate'),
  Type.Literal('advanced'),
  Type.Literal('complex'),
], { $id: 'ComplexityTier', description: 'MCP tool complexity classification' })

export type ComplexityTier = Static<typeof ComplexityTier>

/** LLM tier for routing */
export const LLMTier = Type.Union([
  Type.Literal(1),
  Type.Literal(2),
  Type.Literal(3),
], { $id: 'LLMTier', description: 'LLM routing tier (1=Flash, 2=Standard, 3=Premium)' })

export type LLMTier = Static<typeof LLMTier>

/** Degradation tier for service health */
export const DegradationTier = Type.Union([
  Type.Literal('full'),
  Type.Literal('cached'),
  Type.Literal('fallback'),
  Type.Literal('static'),
  Type.Literal('unavailable'),
], { $id: 'DegradationTier', description: 'Service degradation tier' })

export type DegradationTier = Static<typeof DegradationTier>
