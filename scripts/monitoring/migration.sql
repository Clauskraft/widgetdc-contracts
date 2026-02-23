-- Infrastructure Monitoring Schema
-- Apply to WidgeTDC PostgreSQL database
-- Tables: monitoring_metrics, monitoring_alerts, monitoring_anomalies,
--         monitoring_costs, monitoring_rules

-- Raw metrics (time-series)
CREATE TABLE IF NOT EXISTS monitoring_metrics (
  id            BIGSERIAL PRIMARY KEY,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  service_id    TEXT NOT NULL,
  project_id    TEXT NOT NULL,
  metric_name   TEXT NOT NULL,        -- cpu, memory, network_rx, network_tx
  value         DOUBLE PRECISION NOT NULL,
  CONSTRAINT chk_metric_name CHECK (metric_name IN ('cpu', 'memory', 'network_rx', 'network_tx'))
);

CREATE INDEX IF NOT EXISTS idx_metrics_svc_ts ON monitoring_metrics (service_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_ts ON monitoring_metrics (timestamp DESC);

-- Alerts with lifecycle
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id              UUID PRIMARY KEY,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  service_id      TEXT NOT NULL,
  service_name    TEXT NOT NULL,
  project_id      TEXT NOT NULL,
  severity        TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  rule            TEXT NOT NULL,
  message         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved')),
  acknowledged_at TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON monitoring_alerts (status, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_svc ON monitoring_alerts (service_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON monitoring_alerts (severity, status);

-- Anomalies
CREATE TABLE IF NOT EXISTS monitoring_anomalies (
  id            UUID PRIMARY KEY,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  service_id    TEXT NOT NULL,
  service_name  TEXT NOT NULL,
  metric        TEXT NOT NULL,
  value         DOUBLE PRECISION NOT NULL,
  expected      DOUBLE PRECISION NOT NULL,
  deviation     DOUBLE PRECISION NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('statistical', 'trend', 'cost'))
);

CREATE INDEX IF NOT EXISTS idx_anomalies_ts ON monitoring_anomalies (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_svc ON monitoring_anomalies (service_id, timestamp DESC);

-- Daily cost aggregates (90-day retention)
CREATE TABLE IF NOT EXISTS monitoring_costs (
  id            BIGSERIAL PRIMARY KEY,
  date          DATE NOT NULL,
  project_id    TEXT NOT NULL,
  service_id    TEXT NOT NULL,
  service_name  TEXT NOT NULL,
  amount        NUMERIC(10, 4) NOT NULL,     -- EUR
  currency      TEXT NOT NULL DEFAULT 'EUR',
  UNIQUE (date, project_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_costs_date ON monitoring_costs (date DESC);
CREATE INDEX IF NOT EXISTS idx_costs_project ON monitoring_costs (project_id, date DESC);

-- Alert rules (configurable)
CREATE TABLE IF NOT EXISTS monitoring_rules (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  metric            TEXT NOT NULL,
  condition         TEXT NOT NULL CHECK (condition IN ('gt', 'lt', 'eq')),
  threshold         DOUBLE PRECISION NOT NULL,
  duration_minutes  INTEGER NOT NULL DEFAULT 0,
  severity          TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  enabled           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        TEXT
);

-- Audit trail for rule changes (NIS2 Article 20 compliance)
CREATE TABLE IF NOT EXISTS monitoring_audit_log (
  id          BIGSERIAL PRIMARY KEY,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  entity_type TEXT NOT NULL,            -- 'rule', 'alert', 'compliance'
  entity_id   TEXT NOT NULL,
  action      TEXT NOT NULL,            -- 'created', 'updated', 'deleted', 'acknowledged'
  old_value   JSONB,
  new_value   JSONB,
  actor       TEXT DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON monitoring_audit_log (entity_type, entity_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_ts ON monitoring_audit_log (timestamp DESC);

-- Health probe history (for SLA calculation)
CREATE TABLE IF NOT EXISTS monitoring_health_probes (
  id            BIGSERIAL PRIMARY KEY,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  service_id    TEXT NOT NULL,
  url           TEXT NOT NULL,
  ok            BOOLEAN NOT NULL,
  status_code   INTEGER NOT NULL DEFAULT 0,
  latency_ms    INTEGER NOT NULL,
  version       TEXT,
  uptime_secs   DOUBLE PRECISION,
  memory_mb     DOUBLE PRECISION,
  request_count BIGINT,
  error_rate    DOUBLE PRECISION,
  extras        JSONB
);

CREATE INDEX IF NOT EXISTS idx_probes_svc_ts
  ON monitoring_health_probes (service_id, timestamp DESC);

-- Incidents (correlated alert groups)
CREATE TABLE IF NOT EXISTS monitoring_incidents (
  id              UUID PRIMARY KEY,
  title           TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'investigating', 'resolved')),
  severity        TEXT NOT NULL
                    CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ,
  alert_ids       UUID[] NOT NULL DEFAULT '{}',
  affected_services TEXT[] NOT NULL DEFAULT '{}',
  timeline        JSONB NOT NULL DEFAULT '[]',
  summary         TEXT
);

CREATE INDEX IF NOT EXISTS idx_incidents_status
  ON monitoring_incidents (status, started_at DESC);

-- SLA snapshots (pre-computed for fast queries)
CREATE TABLE IF NOT EXISTS monitoring_sla (
  id            BIGSERIAL PRIMARY KEY,
  service_id    TEXT NOT NULL,
  period        TEXT NOT NULL CHECK (period IN ('hour', 'day', 'week', 'month')),
  start_date    TIMESTAMPTZ NOT NULL,
  end_date      TIMESTAMPTZ NOT NULL,
  total_probes  INTEGER NOT NULL,
  success_probes INTEGER NOT NULL,
  uptime_pct    DOUBLE PRECISION NOT NULL,
  avg_latency   DOUBLE PRECISION NOT NULL,
  p95_latency   DOUBLE PRECISION NOT NULL,
  p99_latency   DOUBLE PRECISION NOT NULL,
  max_latency   DOUBLE PRECISION NOT NULL,
  outage_minutes DOUBLE PRECISION NOT NULL DEFAULT 0,
  UNIQUE (service_id, period, start_date)
);

CREATE INDEX IF NOT EXISTS idx_sla_svc_period
  ON monitoring_sla (service_id, period, start_date DESC);

-- Cleanup function: delete data older than retention periods
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_data() RETURNS void AS $$
BEGIN
  DELETE FROM monitoring_metrics WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM monitoring_anomalies WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM monitoring_costs WHERE date < CURRENT_DATE - INTERVAL '90 days';
  DELETE FROM monitoring_health_probes WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM monitoring_sla WHERE start_date < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;
