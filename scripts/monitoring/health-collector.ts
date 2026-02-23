/**
 * Enhanced Health Probe Collector
 *
 * Collects operational metrics directly from service /health endpoints.
 * Extracts version, uptime, memory, request count, and error rate from
 * JSON health responses when available.
 */

import type { HealthProbeResult } from "./types.js";

/**
 * Probe a service's /health endpoint and extract detailed metrics.
 */
export async function probeServiceDetailed(
  url: string,
  serviceId: string
): Promise<HealthProbeResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const healthUrl = url.replace(/\/$/, "") + "/health";
    const res = await fetch(healthUrl, { signal: controller.signal });
    clearTimeout(timeout);

    const latencyMs = Date.now() - start;
    let body: any = {};
    try {
      body = await res.json();
    } catch {
      // non-JSON health endpoint — that's fine
    }

    return {
      serviceId,
      timestamp: new Date().toISOString(),
      url: healthUrl,
      ok: res.ok,
      statusCode: res.status,
      latencyMs,
      version: body.version ?? body.v ?? undefined,
      uptime: body.uptime ?? body.uptimeSeconds ?? body.uptime_seconds ?? undefined,
      memoryMb: body.memory?.rss
        ? body.memory.rss / 1048576
        : body.memoryMb ?? body.memory_mb ?? undefined,
      requestCount: body.requests ?? body.requestCount ?? body.request_count ?? undefined,
      errorRate: body.errorRate ?? body.error_rate ?? undefined,
      extras: body,
    };
  } catch {
    return {
      serviceId,
      timestamp: new Date().toISOString(),
      url: url.replace(/\/$/, "") + "/health",
      ok: false,
      statusCode: 0,
      latencyMs: Date.now() - start,
    };
  }
}
