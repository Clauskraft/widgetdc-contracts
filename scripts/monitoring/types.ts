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

export interface HealthProbeResult {
  serviceId: string;
  timestamp: string;
  url: string;
  ok: boolean;
  statusCode: number;
  latencyMs: number;
  version?: string;
  uptime?: number;       // seconds
  memoryMb?: number;     // self-reported memory
  requestCount?: number; // from service's metrics
  errorRate?: number;    // from service's error counter
  extras?: Record<string, any>;
}

export interface Incident {
  id: string;
  title: string;
  status: "active" | "investigating" | "resolved";
  severity: "critical" | "high" | "medium" | "low";
  startedAt: string;
  resolvedAt: string | null;
  alertIds: string[];
  affectedServices: string[];
  timeline: IncidentEvent[];
  summary: string | null;
}

export interface IncidentEvent {
  timestamp: string;
  type: "alert_fired" | "alert_resolved" | "service_down" | "service_recovered" | "acknowledged" | "note";
  message: string;
  alertId?: string;
  serviceId?: string;
}

export interface SLARecord {
  serviceId: string;
  period: "hour" | "day" | "week" | "month";
  startDate: string;
  endDate: string;
  totalProbes: number;
  successfulProbes: number;
  uptimePercent: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  maxLatencyMs: number;
  outageMinutes: number;
}

export interface AuditEntry {
  timestamp: string;
  entityType: "rule" | "alert" | "compliance" | "incident";
  entityId: string;
  action: "created" | "updated" | "deleted" | "acknowledged" | "resolved";
  oldValue?: any;
  newValue?: any;
  actor?: string;
}

export interface TelemetryEntry {
  telemetry_id?: string;
  timestamp: string;
  scope_owner: "widgetdc-orchestrator" | "widgetdc-librechat" | "snout";
  agent_persona: "RESEARCHER" | "ENGINEER" | "CUSTODIAN" | "ARCHITECT" | "SENTINEL" | "ARCHIVIST" | "HARVESTER" | "ANALYST" | "INTEGRATOR" | "TESTER";
  runtime_identity?: string;
  provider_source?: string;
  task_domain: "intake" | "decomposition" | "recommendation" | "learning" | "routing" | "audit";
  capability?: string;
  phase: "discover" | "define" | "develop" | "deliver" | "observe" | "orient" | "decide" | "act";
  outcome: "success" | "warning" | "timeout" | "fail" | "blocked";
  duration_ms: number;
  evidence_source: "decision_quality_scorecard" | "monitoring_audit_log" | "operator_feedback" | "runtime_readback";
  trace_id?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface ScorecardEntry {
  entry_id: string;
  recorded_at: string;
  task_domain: "intake" | "decomposition" | "recommendation" | "learning" | "routing" | "audit";
  scope_owner: "widgetdc-orchestrator" | "widgetdc-librechat" | "snout";
  dimension:
    | "prioritization_quality"
    | "decomposition_quality"
    | "promotion_precision"
    | "decision_stability"
    | "operator_acceptance"
    | "normalization_quality"
    | "arbitration_confidence"
    | "time_to_verified_decision"
    | "tri_source_arbitration_divergence";
  metric_name: string;
  metric_value: number;
  target_value?: number;
  status: "pass" | "warn" | "fail" | "pending";
  confidence: number;
  sample_size: number;
  evidence_refs: string[];
  trust_profile?: {
    agent_persona: TelemetryEntry["agent_persona"];
    agent_id?: string;
    runtime_identity?: string;
    provider_source?: string;
    task_domain: ScorecardEntry["task_domain"];
    success_count: number;
    fail_count: number;
    bayesian_score: number;
    prior_weight: number;
    default_prior_score: number;
    evidence_source: TelemetryEntry["evidence_source"];
    scorecard_dimension: ScorecardEntry["dimension"];
    scope_owner: ScorecardEntry["scope_owner"];
    last_verified_at: string;
  };
  notes?: string;
}

export interface ServiceDetail {
  service: RailwayService & { latencyMs?: number; healthProbeOk?: boolean };
  metrics: {
    current: { cpu: number; memory: number; latencyMs: number; healthProbeOk: boolean };
    history24h: ServiceMetric[];
    probes24h: HealthProbeResult[];
  };
  sla: Record<string, SLARecord>;
  alerts: Alert[];
  deployments: Deployment[];
  relatedIncidents: Incident[];
}

export interface Deployment {
  id: string;
  status: string;
  createdAt: string;
  meta?: Record<string, any>;
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
  healthProbes: Map<string, HealthProbeResult[]>;
  incidents: Incident[];
  slaRecords: Map<string, SLARecord[]>;
  telemetryEntries?: TelemetryEntry[];
  scorecardEntries?: ScorecardEntry[];
}
