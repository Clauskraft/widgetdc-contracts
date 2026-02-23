/**
 * Incident Correlation Engine
 *
 * Groups related alerts into incidents for operational clarity.
 * Correlation rules:
 *   1. Temporal proximity: alerts within 5 min -> same incident
 *   2. Service affinity: multiple alerts for same service -> same incident
 *   3. Auto-resolve: incident resolves when ALL constituent alerts resolve
 */

import type { Alert, Incident, IncidentEvent, RailwayService } from "./types.js";
import { randomUUID } from "node:crypto";

const TEMPORAL_WINDOW_MS = 5 * 60_000; // 5 minutes

/**
 * Process alerts and correlate them into incidents.
 * Returns new and updated incidents.
 */
export function correlateIncidents(
  alerts: Alert[],
  existingIncidents: Incident[],
  services: RailwayService[]
): { newIncidents: Incident[]; updatedIncidents: Incident[] } {
  const newIncidents: Incident[] = [];
  const updatedIncidents: Incident[] = [];

  // Find alerts not yet assigned to any incident
  const assignedAlertIds = new Set<string>();
  for (const inc of existingIncidents) {
    for (const aid of inc.alertIds) assignedAlertIds.add(aid);
  }

  const unassigned = alerts.filter(
    a => !assignedAlertIds.has(a.id) && (a.status === "new" || a.status === "acknowledged")
  );

  // Try to add unassigned alerts to existing active incidents
  for (const alert of unassigned) {
    const alertTime = new Date(alert.timestamp).getTime();

    // Find an active incident this alert can join
    let matched = false;
    for (const incident of existingIncidents) {
      if (incident.status === "resolved") continue;

      const incidentTime = new Date(incident.startedAt).getTime();
      const lastEventTime = incident.timeline.length > 0
        ? new Date(incident.timeline[incident.timeline.length - 1].timestamp).getTime()
        : incidentTime;

      // Temporal proximity: within window of incident start or last event
      const temporalMatch = Math.abs(alertTime - lastEventTime) <= TEMPORAL_WINDOW_MS;
      // Service affinity: same service already in incident
      const serviceMatch = incident.affectedServices.includes(alert.serviceId);

      if (temporalMatch || serviceMatch) {
        incident.alertIds.push(alert.id);
        if (!incident.affectedServices.includes(alert.serviceId)) {
          incident.affectedServices.push(alert.serviceId);
        }
        incident.timeline.push({
          timestamp: alert.timestamp,
          type: "alert_fired",
          message: alert.message,
          alertId: alert.id,
          serviceId: alert.serviceId,
        });

        // Upgrade severity if needed
        const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        if ((severityOrder[alert.severity] || 0) > (severityOrder[incident.severity] || 0)) {
          incident.severity = alert.severity as Incident["severity"];
        }

        incident.title = generateTitle(incident);
        if (!updatedIncidents.includes(incident)) updatedIncidents.push(incident);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Create new incident
      const svc = services.find(s => s.id === alert.serviceId);
      const incident: Incident = {
        id: randomUUID(),
        title: `${alert.severity.toUpperCase()} — ${svc?.name || alert.serviceName} ${alert.rule === "rule-svc-down" ? "down" : "alert"}`,
        status: "active",
        severity: alert.severity as Incident["severity"],
        startedAt: alert.timestamp,
        resolvedAt: null,
        alertIds: [alert.id],
        affectedServices: [alert.serviceId],
        timeline: [{
          timestamp: alert.timestamp,
          type: "alert_fired",
          message: alert.message,
          alertId: alert.id,
          serviceId: alert.serviceId,
        }],
        summary: null,
      };
      newIncidents.push(incident);
    }
  }

  // Check for auto-resolution: all constituent alerts resolved
  for (const incident of existingIncidents) {
    if (incident.status === "resolved") continue;

    const allResolved = incident.alertIds.every(aid => {
      const alert = alerts.find(a => a.id === aid);
      return alert?.status === "resolved";
    });

    if (allResolved && incident.alertIds.length > 0) {
      incident.status = "resolved";
      incident.resolvedAt = new Date().toISOString();
      incident.timeline.push({
        timestamp: new Date().toISOString(),
        type: "alert_resolved",
        message: "All constituent alerts resolved — incident auto-resolved",
      });
      incident.summary = generateSummary(incident, services);
      if (!updatedIncidents.includes(incident)) updatedIncidents.push(incident);
    }
  }

  // Handle acknowledged alerts -> update incident timeline
  for (const incident of existingIncidents) {
    if (incident.status === "resolved") continue;

    for (const aid of incident.alertIds) {
      const alert = alerts.find(a => a.id === aid && a.status === "acknowledged");
      if (alert) {
        const alreadyAcked = incident.timeline.some(
          e => e.type === "acknowledged" && e.alertId === aid
        );
        if (!alreadyAcked && alert.acknowledgedAt) {
          incident.timeline.push({
            timestamp: alert.acknowledgedAt,
            type: "acknowledged",
            message: `Alert acknowledged: ${alert.message}`,
            alertId: aid,
            serviceId: alert.serviceId,
          });
          if (!updatedIncidents.includes(incident)) updatedIncidents.push(incident);
        }
      }
    }
  }

  return { newIncidents, updatedIncidents };
}

function generateTitle(incident: Incident): string {
  const count = incident.affectedServices.length;
  return `${incident.severity.toUpperCase()} — ${count} service${count > 1 ? "s" : ""} affected`;
}

function generateSummary(incident: Incident, services: RailwayService[]): string {
  const svcNames = incident.affectedServices
    .map(id => services.find(s => s.id === id)?.name || id)
    .join(", ");
  const duration = incident.resolvedAt
    ? Math.round((new Date(incident.resolvedAt).getTime() - new Date(incident.startedAt).getTime()) / 60_000)
    : 0;
  return `Incident affecting ${svcNames}. Duration: ${duration}min. ${incident.alertIds.length} alert(s) correlated.`;
}
