/**
 * Infrastructure Monitoring — Orchestrator
 *
 * Initializes the polling loop, manages state, and exposes the
 * monitoring API for the dashboard.
 */

import type { MonitoringState, CostEntry } from "./types.js";
import { fetchServices, fetchMetrics, fetchUsage, probeServiceHealth, PROJECT_IDS } from "./railway-client.js";
import { detectStatisticalAnomalies, detectTrendAnomalies, detectCostAnomalies } from "./metrics-processor.js";
import { evaluateRules, acknowledgeAlert, resolveAlert, DEFAULT_RULES } from "./alert-engine.js";
import { NIS2_REQUIREMENTS, mapServicesToRequirements, updateComplianceStatus, complianceSummary } from "./compliance-mapper.js";
import { forecastCosts } from "./forecaster.js";

// ---------------------------------------------------------------------------
// Global monitoring state (in-memory)
// ---------------------------------------------------------------------------
const state: MonitoringState = {
  services: [],
  metricsHistory: new Map(),
  dailyCosts: [],
  alerts: [],
  anomalies: [],
  rules: [...DEFAULT_RULES],
  compliance: [...NIS2_REQUIREMENTS],
  costForecast: null,
  lastPoll: null,
  pollCount: 0,
  errors: [],
};

const MAX_METRICS_HISTORY = 2880;  // 10 days at 5-min intervals
const MAX_ANOMALIES = 500;
const MAX_ALERTS = 1000;
const MAX_ERRORS = 50;

let pollTimer: ReturnType<typeof setInterval> | null = null;
let isPolling = false;

// ---------------------------------------------------------------------------
// Seed demo cost data (used when Railway API doesn't return cost data)
// ---------------------------------------------------------------------------
function seedDemoCosts(): void {
  if (state.dailyCosts.length > 0) return;
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const baseAmount = 2.5 + Math.random() * 1.5; // €2.50-€4.00 per service
    for (const pid of PROJECT_IDS) {
      state.dailyCosts.push({
        date,
        projectId: pid,
        serviceId: "aggregate",
        serviceName: "All Services",
        amount: Math.round(baseAmount * 100) / 100,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Single poll cycle
// ---------------------------------------------------------------------------
async function poll(): Promise<void> {
  if (isPolling) return;
  isPolling = true;
  const correlationId = `poll-${Date.now()}`;
  console.log(`[monitoring][${correlationId}] Starting poll cycle #${state.pollCount + 1}`);

  try {
    // 1. Fetch services
    const services = await fetchServices();
    state.services = services;

    // 2. Health-probe services with URLs (enrichment only — never override Railway status)
    for (const svc of services) {
      if (svc.url && svc.status === "active") {
        const fullUrl = svc.url.startsWith("http") ? svc.url : `https://${svc.url}`;
        const probe = await probeServiceHealth(fullUrl);
        // Store latency for dashboard but do NOT override status.
        // Railway's deployment status is the source of truth.
        (svc as any).latencyMs = probe.latencyMs;
        (svc as any).healthProbeOk = probe.ok;
      }
    }

    // 3. Fetch metrics per service (best-effort)
    for (const svc of services) {
      const metric = await fetchMetrics(svc.id, svc.projectId);
      if (metric) {
        svc.cpu = metric.cpu;
        svc.memory = metric.memory;

        const history = state.metricsHistory.get(svc.id) ?? [];
        history.push(metric);
        if (history.length > MAX_METRICS_HISTORY) history.splice(0, history.length - MAX_METRICS_HISTORY);
        state.metricsHistory.set(svc.id, history);

        // Detect anomalies
        const statAnomalies = detectStatisticalAnomalies(metric, history, svc.name);
        const trendAnomalies = detectTrendAnomalies(history, svc.id, svc.name);
        state.anomalies.push(...statAnomalies, ...trendAnomalies);
      }
    }

    // 4. Fetch costs
    for (const pid of PROJECT_IDS) {
      const costs = await fetchUsage(pid);
      if (costs.length > 0) {
        state.dailyCosts.push(...costs);
      }
    }

    // Seed demo data if no cost data
    seedDemoCosts();

    // Cost anomalies
    const costAnomalies = detectCostAnomalies(state.dailyCosts);
    state.anomalies.push(...costAnomalies);

    // 5. Evaluate alert rules
    const newAlerts = evaluateRules(services, state.metricsHistory, state.anomalies, state.rules, state.alerts);
    state.alerts.push(...newAlerts);

    // 6. Update compliance
    mapServicesToRequirements(state.compliance, services);
    updateComplianceStatus(state.compliance, services, state.alerts);

    // 7. Update forecast
    state.costForecast = forecastCosts(state.dailyCosts);

    // Trim
    if (state.anomalies.length > MAX_ANOMALIES) state.anomalies.splice(0, state.anomalies.length - MAX_ANOMALIES);
    if (state.alerts.length > MAX_ALERTS) state.alerts.splice(0, state.alerts.length - MAX_ALERTS);

    state.lastPoll = new Date().toISOString();
    state.pollCount++;
    console.log(
      `[monitoring][${correlationId}] Poll complete: ${services.length} services, ${state.alerts.filter((a) => a.status === "new").length} active alerts`
    );
  } catch (err: any) {
    const msg = `[${correlationId}] Poll error: ${err.message}`;
    console.error(`[monitoring] ${msg}`);
    state.errors.push(msg);
    if (state.errors.length > MAX_ERRORS) state.errors.splice(0, state.errors.length - MAX_ERRORS);
  } finally {
    isPolling = false;
  }
}

// ---------------------------------------------------------------------------
// Start / Stop
// ---------------------------------------------------------------------------
export function initMonitoring(): void {
  const intervalMs = parseInt(process.env.POLLING_INTERVAL || "300000", 10); // default 5min
  console.log(`[monitoring] Initializing with ${intervalMs / 1000}s poll interval`);

  // First poll immediately
  poll().catch((e) => console.error("[monitoring] Initial poll failed:", e.message));

  // Then schedule
  pollTimer = setInterval(() => {
    poll().catch((e) => console.error("[monitoring] Scheduled poll failed:", e.message));
  }, intervalMs);
}

export function stopMonitoring(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// ---------------------------------------------------------------------------
// State accessors (for API routes)
// ---------------------------------------------------------------------------
export function getInfrastructure() {
  return {
    services: state.services,
    summary: {
      total: state.services.length,
      active: state.services.filter((s) => s.status === "active").length,
      degraded: state.services.filter((s) => s.status !== "active" && s.status !== "unknown").length,
      unknown: state.services.filter((s) => s.status === "unknown").length,
    },
    lastPoll: state.lastPoll,
    pollCount: state.pollCount,
  };
}

export function getAlerts(filters?: { severity?: string; status?: string; serviceId?: string; projectId?: string }) {
  let filtered = state.alerts;
  if (filters?.severity) filtered = filtered.filter((a) => a.severity === filters.severity);
  if (filters?.status) filtered = filtered.filter((a) => a.status === filters.status);
  if (filters?.serviceId) filtered = filtered.filter((a) => a.serviceId === filters.serviceId);
  if (filters?.projectId) filtered = filtered.filter((a) => a.projectId === filters.projectId);
  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function ackAlert(alertId: string) {
  return acknowledgeAlert(state.alerts, alertId);
}

export function getAnomalies() {
  return state.anomalies
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 100);
}

export function getCost() {
  const byDate = new Map<string, number>();
  for (const c of state.dailyCosts) {
    byDate.set(c.date, (byDate.get(c.date) ?? 0) + c.amount);
  }

  const byService = new Map<string, number>();
  for (const c of state.dailyCosts) {
    byService.set(c.serviceName, (byService.get(c.serviceName) ?? 0) + c.amount);
  }

  return {
    daily: [...byDate.entries()]
      .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    byService: [...byService.entries()]
      .map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total),
  };
}

export function getCostForecast() {
  return state.costForecast ?? forecastCosts(state.dailyCosts);
}

export function getCompliance() {
  return {
    requirements: state.compliance,
    summary: complianceSummary(state.compliance),
  };
}

export function getComplianceRequirement(id: string) {
  return state.compliance.find((r) => r.id === id) ?? null;
}

export function getRules() {
  return state.rules;
}

export function getErrors() {
  return state.errors;
}
