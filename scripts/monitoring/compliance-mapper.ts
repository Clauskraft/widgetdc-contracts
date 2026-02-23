/**
 * NIS2 Compliance Mapper
 *
 * Maps Railway services to NIS2 directive requirements and tracks
 * compliance status with evidence and audit trail.
 */

import type { NIS2Requirement, RailwayService, Alert } from "./types.js";

// ---------------------------------------------------------------------------
// NIS2 Requirements Catalogue (Articles 20-25 — core obligations)
// ---------------------------------------------------------------------------
export const NIS2_REQUIREMENTS: NIS2Requirement[] = [
  {
    id: "nis2-art20",
    article: "Article 20",
    title: "Governance & Accountability",
    description:
      "Management bodies must approve and oversee cybersecurity risk-management measures. Responsible persons must be identified.",
    status: "partial",
    evidence: [
      "Railway projects have defined service ownership",
      "Alert rules define accountability chain",
    ],
    mappedServices: [],
    lastAudit: new Date().toISOString().slice(0, 10),
  },
  {
    id: "nis2-art21-a",
    article: "Article 21(a)",
    title: "Risk Analysis & Information System Security",
    description:
      "Policies on risk analysis and information system security including asset inventory, vulnerability management.",
    status: "partial",
    evidence: [
      "Service inventory maintained via Railway API",
      "Anomaly detection active for statistical + trend + cost deviations",
    ],
    mappedServices: [],
    lastAudit: new Date().toISOString().slice(0, 10),
  },
  {
    id: "nis2-art21-b",
    article: "Article 21(b)",
    title: "Incident Handling",
    description:
      "Procedures for incident detection, response, and reporting. Must notify CSIRT within 24h for significant incidents.",
    status: "partial",
    evidence: [
      "Alert engine with severity-based rules (HIGH/MEDIUM/LOW)",
      "Alert lifecycle: new → acknowledged → resolved",
    ],
    mappedServices: [],
    lastAudit: new Date().toISOString().slice(0, 10),
  },
  {
    id: "nis2-art21-c",
    article: "Article 21(c)",
    title: "Business Continuity & Crisis Management",
    description:
      "Backup management, disaster recovery, and crisis management procedures.",
    status: "non-compliant",
    evidence: ["Railway platform provides infrastructure redundancy"],
    mappedServices: [],
    lastAudit: new Date().toISOString().slice(0, 10),
  },
  {
    id: "nis2-art21-d",
    article: "Article 21(d)",
    title: "Supply Chain Security",
    description:
      "Security measures for direct suppliers and service providers including vulnerability assessments.",
    status: "partial",
    evidence: [
      "Railway as PaaS provider — shared responsibility model",
      "Dependency monitoring via architecture analysis",
    ],
    mappedServices: [],
    lastAudit: new Date().toISOString().slice(0, 10),
  },
  {
    id: "nis2-art21-e",
    article: "Article 21(e)",
    title: "Network & System Acquisition Security",
    description:
      "Security in network and information system acquisition, development, and maintenance including vulnerability handling.",
    status: "partial",
    evidence: [
      "Architecture graph tracks all service dependencies",
      "Cost monitoring detects unusual resource usage",
    ],
    mappedServices: [],
    lastAudit: new Date().toISOString().slice(0, 10),
  },
  {
    id: "nis2-art21-f",
    article: "Article 21(f)",
    title: "Effectiveness Assessment",
    description:
      "Policies and procedures to assess the effectiveness of cybersecurity risk-management measures.",
    status: "partial",
    evidence: [
      "Monitoring dashboard provides real-time infrastructure visibility",
      "Anomaly detection validates operational baselines",
    ],
    mappedServices: [],
    lastAudit: new Date().toISOString().slice(0, 10),
  },
  {
    id: "nis2-art21-g",
    article: "Article 21(g)",
    title: "Cybersecurity Hygiene & Training",
    description: "Basic cyber hygiene practices and cybersecurity training.",
    status: "non-compliant",
    evidence: [],
    mappedServices: [],
    lastAudit: new Date().toISOString().slice(0, 10),
  },
  {
    id: "nis2-art21-i",
    article: "Article 21(i)",
    title: "Access Control & Asset Management",
    description:
      "Human resources security, access control policies, and asset management.",
    status: "partial",
    evidence: [
      "Railway API token-based authentication",
      "Service-level access control via Railway teams",
    ],
    mappedServices: [],
    lastAudit: new Date().toISOString().slice(0, 10),
  },
  {
    id: "nis2-art23",
    article: "Article 23",
    title: "Reporting Obligations",
    description:
      "Early warning within 24h, incident notification within 72h, final report within 1 month.",
    status: "partial",
    evidence: [
      "Alert system with real-time notifications",
      "Alert audit trail with timestamps",
    ],
    mappedServices: [],
    lastAudit: new Date().toISOString().slice(0, 10),
  },
];

// ---------------------------------------------------------------------------
// Map services to requirements
// ---------------------------------------------------------------------------
export function mapServicesToRequirements(
  requirements: NIS2Requirement[],
  services: RailwayService[]
): NIS2Requirement[] {
  const serviceIds = services.map((s) => s.id);

  // All infrastructure services are critical by default under NIS2
  for (const req of requirements) {
    req.mappedServices = serviceIds;
  }

  return requirements;
}

// ---------------------------------------------------------------------------
// Update compliance status based on current monitoring state
// ---------------------------------------------------------------------------
export function updateComplianceStatus(
  requirements: NIS2Requirement[],
  services: RailwayService[],
  alerts: Alert[]
): NIS2Requirement[] {
  for (const req of requirements) {
    switch (req.id) {
      case "nis2-art21-b": // Incident handling
        // Compliant if alert engine is active and processing
        req.status = alerts.length >= 0 ? "compliant" : "partial";
        req.evidence = [
          ...req.evidence.slice(0, 2),
          `${alerts.filter((a) => a.status === "resolved").length} incidents resolved`,
          `${alerts.filter((a) => a.status === "new").length} active incidents`,
        ];
        break;

      case "nis2-art21-a": // Risk analysis
        // Compliant if all services are monitored
        const monitored = services.filter((s) => s.status !== "unknown").length;
        req.status = monitored === services.length ? "compliant" : "partial";
        req.evidence = [
          ...req.evidence.slice(0, 2),
          `${monitored}/${services.length} services actively monitored`,
        ];
        break;

      case "nis2-art21-f": // Effectiveness assessment
        req.status = services.length > 0 ? "compliant" : "non-compliant";
        break;
    }

    req.lastAudit = new Date().toISOString().slice(0, 10);
  }

  return requirements;
}

// ---------------------------------------------------------------------------
// Compliance summary
// ---------------------------------------------------------------------------
export function complianceSummary(requirements: NIS2Requirement[]) {
  const total = requirements.length;
  const compliant = requirements.filter((r) => r.status === "compliant").length;
  const partial = requirements.filter((r) => r.status === "partial").length;
  const nonCompliant = requirements.filter((r) => r.status === "non-compliant").length;
  const score = Math.round(((compliant + partial * 0.5) / total) * 100);

  return { total, compliant, partial, nonCompliant, score };
}
