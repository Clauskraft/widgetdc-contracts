/**
 * SLA Tracker
 *
 * Computes uptime SLA metrics from health probe history across
 * multiple time windows (hour, day, week, month).
 */

import type { HealthProbeResult, SLARecord } from "./types.js";

/**
 * Compute percentile from a sorted array of numbers.
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

/**
 * Compute SLA records for a service from its probe history.
 * Returns records for hour, day, week, and month windows.
 */
export function computeSLA(serviceId: string, probes: HealthProbeResult[]): SLARecord[] {
  const now = Date.now();
  const windows: { period: SLARecord["period"]; ms: number }[] = [
    { period: "hour", ms: 3600_000 },
    { period: "day", ms: 86400_000 },
    { period: "week", ms: 604800_000 },
    { period: "month", ms: 2592000_000 }, // 30 days
  ];

  return windows.map(({ period, ms }) => {
    const since = now - ms;
    const windowProbes = probes.filter(p => new Date(p.timestamp).getTime() >= since);

    if (windowProbes.length === 0) {
      return {
        serviceId,
        period,
        startDate: new Date(since).toISOString(),
        endDate: new Date().toISOString(),
        totalProbes: 0,
        successfulProbes: 0,
        uptimePercent: 0,
        avgLatencyMs: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
        maxLatencyMs: 0,
        outageMinutes: 0,
      };
    }

    const total = windowProbes.length;
    const successful = windowProbes.filter(p => p.ok).length;
    const uptimePercent = (successful / total) * 100;

    const latencies = windowProbes.map(p => p.latencyMs).sort((a, b) => a - b);
    const avgLatencyMs = latencies.reduce((s, v) => s + v, 0) / latencies.length;

    // Estimate outage minutes: each failed probe represents ~5 minutes of downtime
    const pollIntervalMinutes = 5;
    const failedProbes = total - successful;
    const outageMinutes = failedProbes * pollIntervalMinutes;

    return {
      serviceId,
      period,
      startDate: new Date(since).toISOString(),
      endDate: new Date().toISOString(),
      totalProbes: total,
      successfulProbes: successful,
      uptimePercent: Math.round(uptimePercent * 100) / 100,
      avgLatencyMs: Math.round(avgLatencyMs),
      p95LatencyMs: percentile(latencies, 95),
      p99LatencyMs: percentile(latencies, 99),
      maxLatencyMs: latencies[latencies.length - 1] || 0,
      outageMinutes,
    };
  });
}
