/**
 * PostgreSQL Persistence Layer
 *
 * Dual-write strategy: in-memory cache + PostgreSQL for historical data.
 * Graceful degradation — if DATABASE_URL is not set, all functions become no-ops.
 */

import type { ServiceMetric, Alert, CostEntry, Anomaly, AlertRule } from "./types.js";
import type { HealthProbeResult, Incident, AuditEntry } from "./types.js";

let pool: any = null;
let pgAvailable = false;
let warningLogged = false;

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------
export async function initDb(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    if (!warningLogged) {
      console.warn("[monitoring][db] DATABASE_URL not set — running in-memory only mode");
      warningLogged = true;
    }
    return;
  }

  try {
    const pg = await import("pg");
    const Pool = pg.default?.Pool ?? pg.Pool;
    pool = new Pool({
      connectionString: dbUrl,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl: dbUrl.includes(".internal") ? false : (dbUrl.includes("railway") || dbUrl.includes("neon")) ? { rejectUnauthorized: false } : undefined,
    });

    // Test connection
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
    } finally {
      client.release();
    }

    // Run migrations
    await runMigrations();
    pgAvailable = true;
    console.log("[monitoring][db] PostgreSQL connected and migrations applied");
  } catch (err: any) {
    console.error("[monitoring][db] Failed to connect to PostgreSQL:", err.message);
    console.warn("[monitoring][db] Falling back to in-memory only mode");
    pool = null;
    pgAvailable = false;
  }
}

async function runMigrations(): Promise<void> {
  if (!pool) return;
  const { readFileSync } = await import("node:fs");
  const { resolve, dirname } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const sql = readFileSync(resolve(__dirname, "migration.sql"), "utf-8");
  await pool.query(sql);
}

export function isDbAvailable(): boolean {
  return pgAvailable;
}

// ---------------------------------------------------------------------------
// Helper — safe query that returns empty on failure
// ---------------------------------------------------------------------------
async function query(text: string, params?: any[]): Promise<any> {
  if (!pgAvailable || !pool) return { rows: [] };
  try {
    return await pool.query(text, params);
  } catch (err: any) {
    console.error("[monitoring][db] Query error:", err.message);
    return { rows: [] };
  }
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------
export async function writeMetric(m: ServiceMetric): Promise<void> {
  if (!pgAvailable) return;
  const metrics = [
    { name: "cpu", value: m.cpu },
    { name: "memory", value: m.memory },
    { name: "network_rx", value: m.networkRx },
    { name: "network_tx", value: m.networkTx },
  ];
  for (const met of metrics) {
    if (met.value !== 0) {
      await query(
        `INSERT INTO monitoring_metrics (timestamp, service_id, project_id, metric_name, value)
         VALUES ($1, $2, $3, $4, $5)`,
        [m.timestamp, m.serviceId, m.projectId, met.name, met.value]
      );
    }
  }
}

export async function readMetrics(serviceId: string, since: Date): Promise<ServiceMetric[]> {
  const result = await query(
    `SELECT timestamp, service_id, project_id, metric_name, value
     FROM monitoring_metrics
     WHERE service_id = $1 AND timestamp >= $2
     ORDER BY timestamp ASC`,
    [serviceId, since.toISOString()]
  );
  // Group by timestamp
  const grouped = new Map<string, any>();
  for (const row of result.rows) {
    const ts = row.timestamp.toISOString();
    if (!grouped.has(ts)) {
      grouped.set(ts, { timestamp: ts, serviceId: row.service_id, projectId: row.project_id, cpu: 0, memory: 0, networkRx: 0, networkTx: 0 });
    }
    const entry = grouped.get(ts)!;
    if (row.metric_name === "cpu") entry.cpu = row.value;
    else if (row.metric_name === "memory") entry.memory = row.value;
    else if (row.metric_name === "network_rx") entry.networkRx = row.value;
    else if (row.metric_name === "network_tx") entry.networkTx = row.value;
  }
  return [...grouped.values()];
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------
export async function writeAlert(a: Alert): Promise<void> {
  if (!pgAvailable) return;
  await query(
    `INSERT INTO monitoring_alerts (id, timestamp, service_id, service_name, project_id, severity, rule, message, status, acknowledged_at, resolved_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (id) DO UPDATE SET status = $9, acknowledged_at = $10, resolved_at = $11`,
    [a.id, a.timestamp, a.serviceId, a.serviceName, a.projectId, a.severity, a.rule, a.message, a.status, a.acknowledgedAt, a.resolvedAt]
  );
}

export async function updateAlertStatus(id: string, status: string, timestamp: string): Promise<void> {
  if (!pgAvailable) return;
  if (status === "acknowledged") {
    await query(`UPDATE monitoring_alerts SET status = $1, acknowledged_at = $2 WHERE id = $3`, [status, timestamp, id]);
  } else if (status === "resolved") {
    await query(`UPDATE monitoring_alerts SET status = $1, resolved_at = $2 WHERE id = $3`, [status, timestamp, id]);
  }
}

export async function readAlerts(filters?: { severity?: string; status?: string; serviceId?: string; limit?: number }): Promise<Alert[]> {
  let sql = `SELECT * FROM monitoring_alerts WHERE 1=1`;
  const params: any[] = [];
  let idx = 1;
  if (filters?.severity) { sql += ` AND severity = $${idx++}`; params.push(filters.severity); }
  if (filters?.status) { sql += ` AND status = $${idx++}`; params.push(filters.status); }
  if (filters?.serviceId) { sql += ` AND service_id = $${idx++}`; params.push(filters.serviceId); }
  sql += ` ORDER BY timestamp DESC LIMIT $${idx}`;
  params.push(filters?.limit || 500);

  const result = await query(sql, params);
  return result.rows.map((r: any) => ({
    id: r.id,
    timestamp: r.timestamp?.toISOString?.() ?? r.timestamp,
    serviceId: r.service_id,
    serviceName: r.service_name,
    projectId: r.project_id,
    severity: r.severity,
    rule: r.rule,
    message: r.message,
    status: r.status,
    acknowledgedAt: r.acknowledged_at?.toISOString?.() ?? r.acknowledged_at ?? null,
    resolvedAt: r.resolved_at?.toISOString?.() ?? r.resolved_at ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Costs
// ---------------------------------------------------------------------------
export async function writeCost(c: CostEntry): Promise<void> {
  if (!pgAvailable) return;
  await query(
    `INSERT INTO monitoring_costs (date, project_id, service_id, service_name, amount)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (date, project_id, service_id) DO UPDATE SET amount = $5, service_name = $4`,
    [c.date, c.projectId, c.serviceId, c.serviceName, c.amount]
  );
}

export async function readCosts(since: Date): Promise<CostEntry[]> {
  const result = await query(
    `SELECT date, project_id, service_id, service_name, amount FROM monitoring_costs WHERE date >= $1 ORDER BY date ASC`,
    [since.toISOString().slice(0, 10)]
  );
  return result.rows.map((r: any) => ({
    date: typeof r.date === "string" ? r.date : r.date.toISOString().slice(0, 10),
    projectId: r.project_id,
    serviceId: r.service_id,
    serviceName: r.service_name,
    amount: parseFloat(r.amount),
  }));
}

// ---------------------------------------------------------------------------
// Health Probes
// ---------------------------------------------------------------------------
export async function writeHealthProbe(probe: HealthProbeResult): Promise<void> {
  if (!pgAvailable) return;
  await query(
    `INSERT INTO monitoring_health_probes (timestamp, service_id, url, ok, status_code, latency_ms, version, uptime_secs, memory_mb, request_count, error_rate, extras)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [probe.timestamp, probe.serviceId, probe.url, probe.ok, probe.statusCode, probe.latencyMs,
     probe.version ?? null, probe.uptime ?? null, probe.memoryMb ?? null,
     probe.requestCount ?? null, probe.errorRate ?? null, probe.extras ? JSON.stringify(probe.extras) : null]
  );
}

export async function readHealthProbes(serviceId: string, since: Date): Promise<HealthProbeResult[]> {
  const result = await query(
    `SELECT * FROM monitoring_health_probes WHERE service_id = $1 AND timestamp >= $2 ORDER BY timestamp ASC`,
    [serviceId, since.toISOString()]
  );
  return result.rows.map((r: any) => ({
    serviceId: r.service_id,
    timestamp: r.timestamp?.toISOString?.() ?? r.timestamp,
    url: r.url,
    ok: r.ok,
    statusCode: r.status_code,
    latencyMs: r.latency_ms,
    version: r.version ?? undefined,
    uptime: r.uptime_secs ?? undefined,
    memoryMb: r.memory_mb ?? undefined,
    requestCount: r.request_count ? Number(r.request_count) : undefined,
    errorRate: r.error_rate ?? undefined,
    extras: r.extras ?? undefined,
  }));
}

// ---------------------------------------------------------------------------
// Anomalies
// ---------------------------------------------------------------------------
export async function writeAnomaly(a: Anomaly): Promise<void> {
  if (!pgAvailable) return;
  await query(
    `INSERT INTO monitoring_anomalies (id, timestamp, service_id, service_name, metric, value, expected, deviation, type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [a.id, a.timestamp, a.serviceId, a.serviceName, a.metric, a.value, a.expected, a.deviation, a.type]
  );
}

// ---------------------------------------------------------------------------
// Rules (CRUD)
// ---------------------------------------------------------------------------
export async function readRules(): Promise<AlertRule[]> {
  const result = await query(`SELECT * FROM monitoring_rules ORDER BY created_at ASC`);
  return result.rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    metric: r.metric,
    condition: r.condition,
    threshold: r.threshold,
    durationMinutes: r.duration_minutes,
    severity: r.severity,
    enabled: r.enabled,
  }));
}

export async function upsertRule(r: AlertRule): Promise<void> {
  if (!pgAvailable) return;
  await query(
    `INSERT INTO monitoring_rules (id, name, metric, condition, threshold, duration_minutes, severity, enabled, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (id) DO UPDATE SET name = $2, metric = $3, condition = $4, threshold = $5, duration_minutes = $6, severity = $7, enabled = $8, updated_at = NOW()`,
    [r.id, r.name, r.metric, r.condition, r.threshold, r.durationMinutes, r.severity, r.enabled]
  );
}

export async function deleteRule(id: string): Promise<void> {
  if (!pgAvailable) return;
  await query(`DELETE FROM monitoring_rules WHERE id = $1`, [id]);
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------
export async function writeAuditEntry(entry: AuditEntry): Promise<void> {
  if (!pgAvailable) return;
  await query(
    `INSERT INTO monitoring_audit_log (timestamp, entity_type, entity_id, action, old_value, new_value, actor)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [entry.timestamp, entry.entityType, entry.entityId, entry.action,
     entry.oldValue ? JSON.stringify(entry.oldValue) : null,
     entry.newValue ? JSON.stringify(entry.newValue) : null,
     entry.actor || "system"]
  );
}

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------
export async function writeIncident(i: Incident): Promise<void> {
  if (!pgAvailable) return;
  await query(
    `INSERT INTO monitoring_incidents (id, title, status, severity, started_at, resolved_at, alert_ids, affected_services, timeline, summary)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (id) DO UPDATE SET status = $3, severity = $4, resolved_at = $6, alert_ids = $7, affected_services = $8, timeline = $9, summary = $10`,
    [i.id, i.title, i.status, i.severity, i.startedAt, i.resolvedAt,
     i.alertIds, i.affectedServices, JSON.stringify(i.timeline), i.summary]
  );
}

export async function readIncidents(filters?: { status?: string; limit?: number }): Promise<Incident[]> {
  let sql = `SELECT * FROM monitoring_incidents WHERE 1=1`;
  const params: any[] = [];
  let idx = 1;
  if (filters?.status) { sql += ` AND status = $${idx++}`; params.push(filters.status); }
  sql += ` ORDER BY started_at DESC LIMIT $${idx}`;
  params.push(filters?.limit || 100);

  const result = await query(sql, params);
  return result.rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    severity: r.severity,
    startedAt: r.started_at?.toISOString?.() ?? r.started_at,
    resolvedAt: r.resolved_at?.toISOString?.() ?? r.resolved_at ?? null,
    alertIds: r.alert_ids || [],
    affectedServices: r.affected_services || [],
    timeline: typeof r.timeline === "string" ? JSON.parse(r.timeline) : r.timeline || [],
    summary: r.summary ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------
export async function runCleanup(): Promise<void> {
  if (!pgAvailable) return;
  await query(`SELECT cleanup_old_monitoring_data()`);
}

// ---------------------------------------------------------------------------
// Shutdown
// ---------------------------------------------------------------------------
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    pgAvailable = false;
  }
}
