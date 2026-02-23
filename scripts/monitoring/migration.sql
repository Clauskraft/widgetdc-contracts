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

-- Cleanup function: delete metrics older than 90 days
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_data() RETURNS void AS $$
BEGIN
  DELETE FROM monitoring_metrics WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM monitoring_anomalies WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM monitoring_costs WHERE date < CURRENT_DATE - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
