/**
 * Infrastructure Monitoring — Shared Types
 */

export interface RailwayService {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  status: "active" | "deploying" | "building" | "crashed" | "removed" | "unknown";
  lastDeployAt: string | null;
  url: string | null;
  cpu: number;      // 0-100
  memory: number;   // 0-100
  uptime: number;   // percentage 0-100
}

export interface ServiceMetric {
  timestamp: string;
  serviceId: string;
  projectId: string;
  cpu: number;
  memory: number;
  networkRx: number;
  networkTx: number;
}

export interface CostEntry {
  date: string;          // YYYY-MM-DD
  projectId: string;
  serviceId: string;
  serviceName: string;
  amount: number;        // EUR
}

export interface Alert {
  id: string;
  timestamp: string;
  serviceId: string;
  serviceName: string;
  projectId: string;
  severity: "high" | "medium" | "low";
  rule: string;
  message: string;
  status: "new" | "acknowledged" | "resolved";
  acknowledgedAt: string | null;
  resolvedAt: string | null;
}

export interface Anomaly {
  id: string;
  timestamp: string;
  serviceId: string;
  serviceName: string;
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  type: "statistical" | "trend" | "cost";
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: "gt" | "lt" | "eq";
  threshold: number;
  durationMinutes: number;
  severity: "high" | "medium" | "low";
  enabled: boolean;
}

export interface NIS2Requirement {
  id: string;
  article: string;
  title: string;
  description: string;
  status: "compliant" | "partial" | "non-compliant";
  evidence: string[];
  mappedServices: string[];
  lastAudit: string;
}

export interface CostForecast {
  currentDaily: number;
  predicted7d: number;
  predicted30d: number;
  trend: "increasing" | "stable" | "decreasing";
  confidence: number;
  dataPoints: { date: string; actual?: number; predicted?: number }[];
}

export interface MonitoringState {
  services: RailwayService[];
  metricsHistory: Map<string, ServiceMetric[]>;
  dailyCosts: CostEntry[];
  alerts: Alert[];
  anomalies: Anomaly[];
  rules: AlertRule[];
  compliance: NIS2Requirement[];
  costForecast: CostForecast | null;
  lastPoll: string | null;
  pollCount: number;
  errors: string[];
}
