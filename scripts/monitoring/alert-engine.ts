/**
 * Alert Rules Engine
 *
 * Evaluates configurable rules against service metrics and manages
 * alert lifecycle (new → acknowledged → resolved).
 */

import type { Alert, AlertRule, RailwayService, ServiceMetric, Anomaly } from "./types.js";
import { randomUUID } from "node:crypto";

// ---------------------------------------------------------------------------
// Default rules
// ---------------------------------------------------------------------------
export const DEFAULT_RULES: AlertRule[] = [
  {
    id: "rule-svc-down",
    name: "Service Down",
    metric: "status",
    condition: "eq",
    threshold: 0, // 0 = not active
    durationMinutes: 5,
    severity: "high",
    enabled: true,
  },
  {
    id: "rule-cpu-high",
    name: "High CPU Usage",
    metric: "cpu",
    condition: "gt",
    threshold: 80,
    durationMinutes: 10,
    severity: "medium",
    enabled: true,
  },
  {
    id: "rule-mem-high",
    name: "High Memory Usage",
    metric: "memory",
    condition: "gt",
    threshold: 85,
    durationMinutes: 0,
    severity: "medium",
    enabled: true,
  },
  {
    id: "rule-cost-spike",
    name: "Cost Increase >15%",
    metric: "daily_cost",
    condition: "gt",
    threshold: 15, // percent above average
    durationMinutes: 0,
    severity: "low",
    enabled: true,
  },
  {
    id: "rule-anomaly",
    name: "Anomaly Detected",
    metric: "anomaly",
    condition: "gt",
    threshold: 0,
    durationMinutes: 0,
    severity: "medium",
    enabled: true,
  },
];

// ---------------------------------------------------------------------------
// Track sustained violations per service+rule for duration-based rules
// ---------------------------------------------------------------------------
const violationStart = new Map<string, number>(); // key: serviceId:ruleId → timestamp

// ---------------------------------------------------------------------------
// Evaluate rules against current state
// ---------------------------------------------------------------------------
export function evaluateRules(
  services: RailwayService[],
  metricsHistory: Map<string, ServiceMetric[]>,
  anomalies: Anomaly[],
  rules: AlertRule[],
  existingAlerts: Alert[]
): Alert[] {
  const newAlerts: Alert[] = [];
  const now = Date.now();

  for (const svc of services) {
    for (const rule of rules) {
      if (!rule.enabled) continue;

      const violated = checkViolation(svc, metricsHistory.get(svc.id) ?? [], anomalies, rule);
      const key = `${svc.id}:${rule.id}`;

      if (violated) {
        if (!violationStart.has(key)) {
          violationStart.set(key, now);
        }
        const elapsed = (now - violationStart.get(key)!) / 60_000;

        // Check duration requirement
        if (elapsed >= rule.durationMinutes) {
          // Don't duplicate alerts for the same service+rule if already active
          const existing = existingAlerts.find(
            (a) =>
              a.serviceId === svc.id &&
              a.rule === rule.id &&
              (a.status === "new" || a.status === "acknowledged")
          );

          if (!existing) {
            newAlerts.push(createAlert(svc, rule));
          }
        }
      } else {
        violationStart.delete(key);
        // Auto-resolve if condition clears
        const active = existingAlerts.find(
          (a) =>
            a.serviceId === svc.id &&
            a.rule === rule.id &&
            (a.status === "new" || a.status === "acknowledged")
        );
        if (active) {
          active.status = "resolved";
          active.resolvedAt = new Date().toISOString();
        }
      }
    }
  }

  return newAlerts;
}

// ---------------------------------------------------------------------------
// Check if a single rule is violated for a service
// ---------------------------------------------------------------------------
function checkViolation(
  svc: RailwayService,
  metrics: ServiceMetric[],
  anomalies: Anomaly[],
  rule: AlertRule
): boolean {
  switch (rule.metric) {
    case "status":
      return svc.status !== "active" && svc.status !== "deploying" && svc.status !== "building";

    case "cpu":
      return svc.cpu > rule.threshold;

    case "memory":
      return svc.memory > rule.threshold;

    case "anomaly":
      return anomalies.some(
        (a) => a.serviceId === svc.id && new Date(a.timestamp).getTime() > Date.now() - 300_000
      );

    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Create a new alert
// ---------------------------------------------------------------------------
function createAlert(svc: RailwayService, rule: AlertRule): Alert {
  return {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    serviceId: svc.id,
    serviceName: svc.name,
    projectId: svc.projectId,
    severity: rule.severity,
    rule: rule.id,
    message: buildMessage(svc, rule),
    status: "new",
    acknowledgedAt: null,
    resolvedAt: null,
  };
}

function buildMessage(svc: RailwayService, rule: AlertRule): string {
  switch (rule.metric) {
    case "status":
      return `Service "${svc.name}" is ${svc.status} (expected active)`;
    case "cpu":
      return `Service "${svc.name}" CPU at ${svc.cpu}% (threshold: ${rule.threshold}%)`;
    case "memory":
      return `Service "${svc.name}" memory at ${svc.memory}% (threshold: ${rule.threshold}%)`;
    case "anomaly":
      return `Anomaly detected on "${svc.name}"`;
    default:
      return `Rule "${rule.name}" triggered on "${svc.name}"`;
  }
}

// ---------------------------------------------------------------------------
// Alert actions
// ---------------------------------------------------------------------------
export function acknowledgeAlert(alerts: Alert[], alertId: string): Alert | null {
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert || alert.status === "resolved") return null;
  alert.status = "acknowledged";
  alert.acknowledgedAt = new Date().toISOString();
  return alert;
}

export function resolveAlert(alerts: Alert[], alertId: string): Alert | null {
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) return null;
  alert.status = "resolved";
  alert.resolvedAt = new Date().toISOString();
  return alert;
}
