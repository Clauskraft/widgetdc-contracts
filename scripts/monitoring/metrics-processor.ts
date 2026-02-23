/**
 * Metrics Processing Pipeline
 *
 * Aggregates raw metrics into time-window summaries and detects anomalies
 * using statistical, trend, and cost-based methods.
 */

import type { ServiceMetric, Anomaly, CostEntry } from "./types.js";
import { randomUUID } from "node:crypto";

// ---------------------------------------------------------------------------
// Aggregation — compute mean/max/min for a window
// ---------------------------------------------------------------------------
export interface MetricAggregate {
  serviceId: string;
  window: "1h" | "24h" | "7d" | "30d";
  metric: string;
  mean: number;
  max: number;
  min: number;
  stddev: number;
  count: number;
}

export function aggregate(
  history: ServiceMetric[],
  serviceId: string,
  windowMs: number,
  windowLabel: MetricAggregate["window"]
): MetricAggregate[] {
  const cutoff = Date.now() - windowMs;
  const relevant = history.filter(
    (m) => m.serviceId === serviceId && new Date(m.timestamp).getTime() > cutoff
  );
  if (relevant.length === 0) return [];

  const results: MetricAggregate[] = [];
  for (const metric of ["cpu", "memory"] as const) {
    const vals = relevant.map((m) => m[metric]);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length;

    results.push({
      serviceId,
      window: windowLabel,
      metric,
      mean: round(mean),
      max: Math.max(...vals),
      min: Math.min(...vals),
      stddev: round(Math.sqrt(variance)),
      count: vals.length,
    });
  }
  return results;
}

export function computeAllAggregates(
  history: ServiceMetric[],
  serviceId: string
): MetricAggregate[] {
  return [
    ...aggregate(history, serviceId, 3_600_000, "1h"),
    ...aggregate(history, serviceId, 86_400_000, "24h"),
    ...aggregate(history, serviceId, 604_800_000, "7d"),
    ...aggregate(history, serviceId, 2_592_000_000, "30d"),
  ];
}

// ---------------------------------------------------------------------------
// Anomaly Detection — Statistical (z-score > 2)
// ---------------------------------------------------------------------------
export function detectStatisticalAnomalies(
  current: ServiceMetric,
  history: ServiceMetric[],
  serviceName: string
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const recent = history.filter(
    (m) =>
      m.serviceId === current.serviceId &&
      new Date(m.timestamp).getTime() > Date.now() - 86_400_000
  );
  if (recent.length < 10) return anomalies; // need enough data

  for (const metric of ["cpu", "memory"] as const) {
    const vals = recent.map((m) => m[metric]);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length;
    const stddev = Math.sqrt(variance);

    if (stddev === 0) continue;
    const zScore = (current[metric] - mean) / stddev;

    if (Math.abs(zScore) > 2) {
      anomalies.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        serviceId: current.serviceId,
        serviceName,
        metric,
        value: round(current[metric]),
        expected: round(mean),
        deviation: round(zScore),
        type: "statistical",
      });
    }
  }
  return anomalies;
}

// ---------------------------------------------------------------------------
// Anomaly Detection — Trend (3 consecutive readings increasing >20%)
// ---------------------------------------------------------------------------
export function detectTrendAnomalies(
  history: ServiceMetric[],
  serviceId: string,
  serviceName: string
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const sorted = history
    .filter((m) => m.serviceId === serviceId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (sorted.length < 4) return anomalies;

  for (const metric of ["cpu", "memory"] as const) {
    const last4 = sorted.slice(-4).map((m) => m[metric]);
    let consecutiveIncreases = 0;

    for (let i = 1; i < last4.length; i++) {
      if (last4[i - 1] > 0 && (last4[i] - last4[i - 1]) / last4[i - 1] > 0.2) {
        consecutiveIncreases++;
      } else {
        consecutiveIncreases = 0;
      }
    }

    if (consecutiveIncreases >= 3) {
      anomalies.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        serviceId,
        serviceName,
        metric,
        value: last4[last4.length - 1],
        expected: last4[0],
        deviation: round(((last4[last4.length - 1] - last4[0]) / last4[0]) * 100),
        type: "trend",
      });
    }
  }
  return anomalies;
}

// ---------------------------------------------------------------------------
// Anomaly Detection — Cost (daily spend >15% above 7-day average)
// ---------------------------------------------------------------------------
export function detectCostAnomalies(
  dailyCosts: CostEntry[],
  serviceName?: string
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Group costs by date
  const byDate = new Map<string, number>();
  for (const c of dailyCosts) {
    byDate.set(c.date, (byDate.get(c.date) ?? 0) + c.amount);
  }

  const dates = [...byDate.keys()].sort();
  if (dates.length < 8) return anomalies;

  const last7 = dates.slice(-8, -1).map((d) => byDate.get(d)!);
  const today = byDate.get(dates[dates.length - 1])!;
  const avg7d = last7.reduce((a, b) => a + b, 0) / last7.length;

  if (avg7d > 0 && (today - avg7d) / avg7d > 0.15) {
    anomalies.push({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      serviceId: "aggregate",
      serviceName: serviceName ?? "All Services",
      metric: "daily_cost",
      value: round(today),
      expected: round(avg7d),
      deviation: round(((today - avg7d) / avg7d) * 100),
      type: "cost",
    });
  }

  return anomalies;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function round(n: number): number {
  return Math.round(n * 100) / 100;
}
