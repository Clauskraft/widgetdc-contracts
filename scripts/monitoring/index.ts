/**
 * Infrastructure Monitoring — Orchestrator
 *
 * Initializes the polling loop, manages state, and exposes the
 * monitoring API for the dashboard. Supports PostgreSQL persistence
 * with graceful in-memory fallback.
 */

import type { MonitoringState, CostEntry, HealthProbeResult, Incident, SLARecord } from "./types.js";
import { fetchServices, fetchMetrics, fetchUsage, fetchDeployments, PROJECT_IDS } from "./railway-client.js";
import { detectStatisticalAnomalies, detectTrendAnomalies, detectCostAnomalies } from "./metrics-processor.js";
import { evaluateRules, acknowledgeAlert, resolveAlert, DEFAULT_RULES } from "./alert-engine.js";
import { NIS2_REQUIREMENTS, mapServicesToRequirements, updateComplianceStatus, complianceSummary } from "./compliance-mapper.js";
import { forecastCosts } from "./forecaster.js";
import { probeServiceDetailed } from "./health-collector.js";
import { computeSLA } from "./sla-tracker.js";
import { correlateIncidents } from "./incident-engine.js";
import { broadcast } from "./sse.js";
import * as db from "./db.js";

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
  healthProbes: new Map(),
  incidents: [],
  slaRecords: new Map(),
};

const MAX_METRICS_HISTORY = 2880;  // 10 days at 5-min intervals
const MAX_ANOMALIES = 500;
const MAX_ALERTS = 1000;
const MAX_ERRORS = 50;
const MAX_PROBES = 2880;

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
  const pollStart = Date.now();
  console.log(`[monitoring][${correlationId}] Starting poll cycle #${state.pollCount + 1}`);

  try {
    // 1. Fetch services
    const services = await fetchServices();
    state.services = services;

    // 2. Enhanced health probes (replaces simple probeServiceHealth)
    for (const svc of services) {
      if (svc.url && svc.status === "active") {
        const fullUrl = svc.url.startsWith("http") ? svc.url : `https://${svc.url}`;
        const probe = await probeServiceDetailed(fullUrl, svc.id);
        // Store latency for dashboard but do NOT override Railway status
        (svc as any).latencyMs = probe.latencyMs;
        (svc as any).healthProbeOk = probe.ok;

        // Store probe history
        const probes = state.healthProbes.get(svc.id) ?? [];
        probes.push(probe);
        if (probes.length > MAX_PROBES) probes.splice(0, probes.length - MAX_PROBES);
        state.healthProbes.set(svc.id, probes);

        // Persist probe to PG
        await db.writeHealthProbe(probe);
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

        // Persist metric
        await db.writeMetric(metric);

        // Persist anomalies
        for (const a of [...statAnomalies, ...trendAnomalies]) {
          await db.writeAnomaly(a);
        }
      }
    }

    // 4. Fetch costs
    for (const pid of PROJECT_IDS) {
      const costs = await fetchUsage(pid);
      if (costs.length > 0) {
        state.dailyCosts.push(...costs);
        // Persist costs
        for (const c of costs) {
          await db.writeCost(c);
        }
      }
    }

    // Seed demo data if no cost data
    seedDemoCosts();

    // Cost anomalies
    const costAnomalies = detectCostAnomalies(state.dailyCosts);
    state.anomalies.push(...costAnomalies);
    for (const a of costAnomalies) {
      await db.writeAnomaly(a);
    }

    // 5. Evaluate alert rules
    const newAlerts = evaluateRules(services, state.metricsHistory, state.anomalies, state.rules, state.alerts);
    state.alerts.push(...newAlerts);

    // Persist new alerts
    for (const a of newAlerts) {
      await db.writeAlert(a);
      // Broadcast new alert via SSE
      broadcast("alert", { id: a.id, severity: a.severity, serviceName: a.serviceName, message: a.message, status: a.status });
    }

    // Persist resolved alerts (auto-resolved by evaluateRules)
    for (const a of state.alerts.filter(a => a.status === "resolved" && a.resolvedAt)) {
      await db.writeAlert(a);
    }

    // 6. Correlate incidents
    const { newIncidents, updatedIncidents } = correlateIncidents(state.alerts, state.incidents, state.services);
    state.incidents.push(...newIncidents);
    for (const inc of [...newIncidents, ...updatedIncidents]) {
      await db.writeIncident(inc);
    }

    // 7. Compute SLA metrics
    for (const svc of services) {
      const probes = state.healthProbes.get(svc.id) ?? [];
      if (probes.length > 0) {
        const slaRecords = computeSLA(svc.id, probes);
        state.slaRecords.set(svc.id, slaRecords);
      }
    }

    // 8. Update compliance
    mapServicesToRequirements(state.compliance, services);
    updateComplianceStatus(state.compliance, services, state.alerts);

    // 9. Update forecast
    state.costForecast = forecastCosts(state.dailyCosts);

    // Trim
    if (state.anomalies.length > MAX_ANOMALIES) state.anomalies.splice(0, state.anomalies.length - MAX_ANOMALIES);
    if (state.alerts.length > MAX_ALERTS) state.alerts.splice(0, state.alerts.length - MAX_ALERTS);

    state.lastPoll = new Date().toISOString();
    state.pollCount++;

    const durationMs = Date.now() - pollStart;
    console.log(
      `[monitoring][${correlationId}] Poll complete: ${services.length} services, ${state.alerts.filter((a) => a.status === "new").length} active alerts, ${durationMs}ms`
    );

    // Broadcast updates via SSE
    broadcast("infrastructure", getInfrastructure());
    broadcast("poll-complete", {
      pollCount: state.pollCount,
      durationMs,
      services: services.length,
      active: services.filter(s => s.status === "active").length,
      newAlerts: newAlerts.length,
    });
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
export async function initMonitoring(): Promise<void> {
  const intervalMs = parseInt(process.env.POLLING_INTERVAL || "300000", 10); // default 5min
  console.log(`[monitoring] Initializing with ${intervalMs / 1000}s poll interval`);

  // Initialize database
  await db.initDb();

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
  db.closeDb().catch(() => {});
}

// ---------------------------------------------------------------------------
// State accessors (for API routes)
// ---------------------------------------------------------------------------
export function getInfrastructure() {
  return {
    services: state.services.map(s => ({
      ...s,
      latencyMs: (s as any).latencyMs,
      healthProbeOk: (s as any).healthProbeOk,
      sla: state.slaRecords.get(s.id)?.[0] ?? null, // day SLA
    })),
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

export async function ackAlert(alertId: string) {
  const result = acknowledgeAlert(state.alerts, alertId);
  if (result) {
    await db.updateAlertStatus(alertId, "acknowledged", result.acknowledgedAt!);
    await db.writeAuditEntry({
      timestamp: new Date().toISOString(),
      entityType: "alert",
      entityId: alertId,
      action: "acknowledged",
      newValue: { status: "acknowledged" },
      actor: "dashboard-user",
    });
    broadcast("alert", { id: result.id, severity: result.severity, serviceName: result.serviceName, message: result.message, status: result.status });
  }
  return result;
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

// ---------------------------------------------------------------------------
// New accessors for enhanced features
// ---------------------------------------------------------------------------
export async function getServiceDetail(serviceId: string) {
  const svc = state.services.find(s => s.id === serviceId || s.name === serviceId);
  if (!svc) return null;

  const probes = state.healthProbes.get(svc.id) ?? [];
  const metrics = state.metricsHistory.get(svc.id) ?? [];
  const slaRecords = state.slaRecords.get(svc.id) ?? [];
  const alerts = state.alerts.filter(a => a.serviceId === svc.id);
  const incidents = state.incidents.filter(i => i.affectedServices.includes(svc.id));

  const slaMap: Record<string, SLARecord> = {};
  for (const r of slaRecords) slaMap[r.period] = r;

  // Fetch deployment history from Railway API
  let deployments = [];
  try {
    deployments = await fetchDeployments(svc.id, 5);
  } catch {
    // Non-critical — return empty if Railway API fails
  }

  return {
    service: { ...svc, latencyMs: (svc as any).latencyMs, healthProbeOk: (svc as any).healthProbeOk },
    metrics: {
      current: { cpu: svc.cpu, memory: svc.memory, latencyMs: (svc as any).latencyMs ?? 0, healthProbeOk: (svc as any).healthProbeOk ?? false },
      history24h: metrics.slice(-288), // 24h at 5-min intervals
      probes24h: probes.slice(-288),
    },
    sla: slaMap,
    alerts: alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20),
    deployments,
    relatedIncidents: incidents,
  };
}

export function getServiceProbes(serviceId: string, hours = 24) {
  const svc = state.services.find(s => s.id === serviceId || s.name === serviceId);
  if (!svc) return [];
  const probes = state.healthProbes.get(svc.id) ?? [];
  const since = Date.now() - hours * 3600_000;
  return probes.filter(p => new Date(p.timestamp).getTime() >= since);
}

export function getServiceSLA(serviceId: string) {
  const svc = state.services.find(s => s.id === serviceId || s.name === serviceId);
  if (!svc) return null;
  return state.slaRecords.get(svc.id) ?? [];
}

export function getIncidents(filters?: { status?: string }) {
  let filtered = state.incidents;
  if (filters?.status) filtered = filtered.filter(i => i.status === filters.status);
  return filtered.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export function getIncident(incidentId: string) {
  return state.incidents.find(i => i.id === incidentId) ?? null;
}

// Rule CRUD
export async function createOrUpdateRule(rule: typeof state.rules[0]) {
  const existing = state.rules.findIndex(r => r.id === rule.id);
  if (existing >= 0) {
    const old = { ...state.rules[existing] };
    state.rules[existing] = rule;
    await db.upsertRule(rule);
    await db.writeAuditEntry({
      timestamp: new Date().toISOString(),
      entityType: "rule",
      entityId: rule.id,
      action: "updated",
      oldValue: old,
      newValue: rule,
      actor: "dashboard-user",
    });
  } else {
    state.rules.push(rule);
    await db.upsertRule(rule);
    await db.writeAuditEntry({
      timestamp: new Date().toISOString(),
      entityType: "rule",
      entityId: rule.id,
      action: "created",
      newValue: rule,
      actor: "dashboard-user",
    });
  }
  return rule;
}

export async function removeRule(ruleId: string) {
  const idx = state.rules.findIndex(r => r.id === ruleId);
  if (idx < 0) return false;
  const old = state.rules[idx];
  state.rules.splice(idx, 1);
  await db.deleteRule(ruleId);
  await db.writeAuditEntry({
    timestamp: new Date().toISOString(),
    entityType: "rule",
    entityId: ruleId,
    action: "deleted",
    oldValue: old,
    actor: "dashboard-user",
  });
  return true;
}
