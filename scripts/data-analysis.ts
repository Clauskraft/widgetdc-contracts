/**
 * Data Source Analysis Engine
 *
 * Pure analysis module — no Express/MCP dependencies.
 * Computes health scores, freshness, quality metrics,
 * detects data anti-patterns, maps lineage, and scores
 * overall data platform health.
 *
 * Mirrors arch-analysis.ts patterns for consistency.
 */

// ─── Types ───────────────────────────────────────────────────────

export interface DataSource {
  id: string;
  name: string;
  type: string;
  category: string;
  protocol: string;
  endpoint: string;
  owner: string;
  description: string;
  schema: Record<string, unknown>;
  freshness: {
    updateFrequency: string;
    lastUpdate: string;
    staleness_threshold_hours: number;
  };
  quality: {
    completeness: number;
    consistency: number;
    accuracy: number;
    knownIssues: string[];
  };
  dependencies: string[];
  consumers: string[];
}

export interface DataPipeline {
  id: string;
  name: string;
  description: string;
  sources: string[];
  destinations: string[];
  schedule: string;
  status: "active" | "degraded" | "planned" | "partial" | "down";
}

export interface DataDestination {
  id: string;
  name: string;
  type: string;
}

export interface DataSourcesGraph {
  meta: { generated: string; version: string; totalSources: number; totalPipelines: number; totalDestinations: number };
  sources: DataSource[];
  pipelines: DataPipeline[];
  destinations: DataDestination[];
}

export interface SourceMetrics {
  id: string;
  name: string;
  type: string;
  category: string;
  owner: string;
  freshnessScore: number;     // 0-100
  qualityScore: number;       // 0-100
  reliabilityScore: number;   // 0-100
  healthScore: number;        // 0-100 composite
  risk: "critical" | "warning" | "healthy";
  isStale: boolean;
  hoursStale: number;
  issueCount: number;
  consumerCount: number;
  dependencyCount: number;
}

export interface DataAntiPattern {
  type: "stale_source" | "low_quality" | "single_point_of_failure" | "no_consumers" | "circular_dependency" | "missing_schema" | "gdpr_risk" | "no_monitoring" | "high_issue_count" | "orphan_pipeline";
  severity: "critical" | "warning" | "info";
  entityId: string;
  entityType: "source" | "pipeline";
  description: string;
  recommendation: string;
  meta?: Record<string, unknown>;
}

export interface LineageEdge {
  source: string;
  target: string;
  pipeline: string;
  type: "ingestion" | "transformation" | "delivery";
}

export interface CategoryMetrics {
  category: string;
  sourceCount: number;
  avgHealth: number;
  avgFreshness: number;
  avgQuality: number;
  criticalCount: number;
  warningCount: number;
  healthyCount: number;
}

export interface PipelineMetrics {
  id: string;
  name: string;
  status: string;
  sourceCount: number;
  destinationCount: number;
  avgSourceHealth: number;
  risk: "critical" | "warning" | "healthy";
}

export interface DataAnalysisResult {
  summary: {
    totalSources: number;
    totalPipelines: number;
    totalDestinations: number;
    avgHealth: number;
    avgFreshness: number;
    avgQuality: number;
    criticalCount: number;
    warningCount: number;
    healthyCount: number;
    staleCount: number;
    antiPatternCount: number;
    activePipelines: number;
    degradedPipelines: number;
    plannedPipelines: number;
  };
  sources: SourceMetrics[];
  antiPatterns: DataAntiPattern[];
  lineage: LineageEdge[];
  categoryMetrics: CategoryMetrics[];
  pipelineMetrics: PipelineMetrics[];
  generated: string;
}

// ─── Freshness scoring ───────────────────────────────────────────

function computeFreshnessScore(source: DataSource): { score: number; isStale: boolean; hoursStale: number } {
  const now = Date.now();
  const lastUpdate = new Date(source.freshness.lastUpdate).getTime();
  const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
  const threshold = source.freshness.staleness_threshold_hours;

  const isStale = hoursSinceUpdate > threshold;
  const hoursStale = Math.max(0, Math.round(hoursSinceUpdate - threshold));

  // Score: 100 if just updated, decays to 0 at 3x threshold
  let score: number;
  if (hoursSinceUpdate <= 0) {
    score = 100;
  } else if (hoursSinceUpdate <= threshold * 0.5) {
    score = 100;
  } else if (hoursSinceUpdate <= threshold) {
    // 100 → 70 as we approach threshold
    score = 100 - ((hoursSinceUpdate - threshold * 0.5) / (threshold * 0.5)) * 30;
  } else if (hoursSinceUpdate <= threshold * 2) {
    // 70 → 30
    score = 70 - ((hoursSinceUpdate - threshold) / threshold) * 40;
  } else {
    // Below 30, floor at 5
    score = Math.max(5, 30 - ((hoursSinceUpdate - threshold * 2) / threshold) * 25);
  }

  return { score: Math.round(score), isStale, hoursStale };
}

// ─── Quality scoring ─────────────────────────────────────────────

function computeQualityScore(source: DataSource): number {
  const q = source.quality;
  // Weighted average: accuracy most important, then completeness, then consistency
  const rawScore = (q.accuracy * 0.4 + q.completeness * 0.35 + q.consistency * 0.25) * 100;

  // Issue penalty: each known issue reduces score
  const issuePenalty = Math.min(25, q.knownIssues.length * 5);

  return Math.max(0, Math.round(rawScore - issuePenalty));
}

// ─── Reliability scoring ─────────────────────────────────────────

function computeReliabilityScore(source: DataSource, pipelines: DataPipeline[]): number {
  let score = 80; // base

  // Protocol reliability
  const reliableProtocols = ["bolt", "postgresql", "redis", "internal"];
  const moderateProtocols = ["https_rest", "https_graphql", "http_rest"];
  const unreliableProtocols = ["https_scrape", "https_rss"];

  if (reliableProtocols.includes(source.protocol)) score += 15;
  else if (moderateProtocols.includes(source.protocol)) score += 5;
  else if (unreliableProtocols.includes(source.protocol)) score -= 10;

  // Consumer count: more consumers = more important = higher reliability needed
  if (source.consumers.length > 3) score += 5;

  // Pipeline status: if pipelines consuming this source are degraded, reduce
  const consumingPipelines = pipelines.filter(p => p.sources.includes(source.id));
  const degradedCount = consumingPipelines.filter(p => p.status === "degraded" || p.status === "down").length;
  if (degradedCount > 0) score -= degradedCount * 10;

  // Known issues reduce reliability
  const criticalIssuePatterns = ["fail", "block", "outage", "down", "error", "broken"];
  const criticalIssues = source.quality.knownIssues.filter(issue =>
    criticalIssuePatterns.some(p => issue.toLowerCase().includes(p))
  );
  score -= criticalIssues.length * 8;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Composite health score ──────────────────────────────────────

function computeHealthScore(freshness: number, quality: number, reliability: number): { score: number; risk: "critical" | "warning" | "healthy" } {
  // Weighted: freshness 30%, quality 40%, reliability 30%
  const score = Math.round(freshness * 0.3 + quality * 0.4 + reliability * 0.3);
  const risk = score < 40 ? "critical" : score < 70 ? "warning" : "healthy";
  return { score, risk };
}

// ─── Anti-pattern detection ──────────────────────────────────────

function detectDataAntiPatterns(
  sources: DataSource[],
  pipelines: DataPipeline[],
  metricsMap: Map<string, SourceMetrics>
): DataAntiPattern[] {
  const patterns: DataAntiPattern[] = [];

  // 1. Stale sources
  for (const [id, m] of metricsMap) {
    if (m.isStale) {
      patterns.push({
        type: "stale_source",
        severity: m.hoursStale > m.freshnessScore ? "critical" : "warning",
        entityId: id,
        entityType: "source",
        description: `Source "${m.name}" is ${m.hoursStale}h beyond its staleness threshold. Last updated ${new Date(sources.find(s => s.id === id)!.freshness.lastUpdate).toISOString()}.`,
        recommendation: `Check connectivity and trigger a manual refresh. Verify the harvester is running.`,
        meta: { hoursStale: m.hoursStale, freshnessScore: m.freshnessScore },
      });
    }
  }

  // 2. Low quality sources
  for (const [id, m] of metricsMap) {
    if (m.qualityScore < 50) {
      patterns.push({
        type: "low_quality",
        severity: m.qualityScore < 30 ? "critical" : "warning",
        entityId: id,
        entityType: "source",
        description: `Source "${m.name}" has quality score ${m.qualityScore}/100. Completeness: ${Math.round(sources.find(s => s.id === id)!.quality.completeness * 100)}%, Accuracy: ${Math.round(sources.find(s => s.id === id)!.quality.accuracy * 100)}%.`,
        recommendation: `Address known issues and implement data validation pipelines.`,
        meta: { qualityScore: m.qualityScore, issueCount: m.issueCount },
      });
    }
  }

  // 3. Single point of failure: source with many consumers but no redundancy
  for (const s of sources) {
    const m = metricsMap.get(s.id)!;
    if (m.consumerCount >= 3 && s.dependencies.length === 0) {
      // Check if any pipeline has alternative sources
      const consumingPipelines = pipelines.filter(p => p.sources.includes(s.id));
      const soloSource = consumingPipelines.filter(p => p.sources.length === 1);
      if (soloSource.length >= 2) {
        patterns.push({
          type: "single_point_of_failure",
          severity: "critical",
          entityId: s.id,
          entityType: "source",
          description: `Source "${s.name}" is the sole data source for ${soloSource.length} pipelines with ${m.consumerCount} total consumers. No failover.`,
          recommendation: `Implement redundant data paths or caching to reduce blast radius if this source goes down.`,
          meta: { consumerCount: m.consumerCount, soloPipelines: soloSource.map(p => p.id) },
        });
      }
    }
  }

  // 4. No consumers — orphan sources
  for (const s of sources) {
    if (s.consumers.length === 0 && s.type !== "compute") {
      patterns.push({
        type: "no_consumers",
        severity: "info",
        entityId: s.id,
        entityType: "source",
        description: `Source "${s.name}" has no consuming pipelines. Potentially unused.`,
        recommendation: `Verify if this source is needed. Either connect it to pipelines or remove to reduce maintenance.`,
      });
    }
  }

  // 5. GDPR risk: non-EU data processing
  for (const s of sources) {
    const gdprKeywords = ["china", "deepseek", "sovereignty"];
    const hasGdprIssue = s.quality.knownIssues.some(issue =>
      gdprKeywords.some(k => issue.toLowerCase().includes(k))
    );
    if (hasGdprIssue) {
      patterns.push({
        type: "gdpr_risk",
        severity: "critical",
        entityId: s.id,
        entityType: "source",
        description: `Source "${s.name}" has GDPR/data sovereignty concerns flagged in known issues.`,
        recommendation: `Ensure DPA (Data Processing Agreement) is in place. Consider EU-based alternatives.`,
      });
    }
  }

  // 6. High issue count
  for (const s of sources) {
    if (s.quality.knownIssues.length >= 4) {
      patterns.push({
        type: "high_issue_count",
        severity: "warning",
        entityId: s.id,
        entityType: "source",
        description: `Source "${s.name}" has ${s.quality.knownIssues.length} known issues. Technical debt accumulating.`,
        recommendation: `Prioritize fixing top issues: ${s.quality.knownIssues[0]}`,
        meta: { issueCount: s.quality.knownIssues.length },
      });
    }
  }

  // 7. Orphan pipelines (planned but no active sources)
  for (const p of pipelines) {
    if (p.status === "planned") {
      patterns.push({
        type: "orphan_pipeline",
        severity: "info",
        entityId: p.id,
        entityType: "pipeline",
        description: `Pipeline "${p.name}" is planned but not yet active. Sources: ${p.sources.join(", ")}.`,
        recommendation: `Prioritize implementation if dependent features need this data.`,
      });
    }
  }

  // 8. Degraded pipelines
  for (const p of pipelines) {
    if (p.status === "degraded") {
      patterns.push({
        type: "no_monitoring",
        severity: "warning",
        entityId: p.id,
        entityType: "pipeline",
        description: `Pipeline "${p.name}" is degraded. May be producing incomplete or unreliable data.`,
        recommendation: `Investigate root cause. Check source availability and transformation errors.`,
      });
    }
  }

  return patterns;
}

// ─── Lineage computation ─────────────────────────────────────────

function computeLineage(graph: DataSourcesGraph): LineageEdge[] {
  const edges: LineageEdge[] = [];

  for (const pipeline of graph.pipelines) {
    // Source → Pipeline (ingestion)
    for (const srcId of pipeline.sources) {
      edges.push({
        source: srcId,
        target: pipeline.id,
        pipeline: pipeline.id,
        type: "ingestion",
      });
    }
    // Pipeline → Destination (delivery)
    for (const destId of pipeline.destinations) {
      edges.push({
        source: pipeline.id,
        target: destId,
        pipeline: pipeline.id,
        type: "delivery",
      });
    }
  }

  return edges;
}

// ─── Category aggregation ────────────────────────────────────────

function aggregateCategoryMetrics(sources: DataSource[], metricsMap: Map<string, SourceMetrics>): CategoryMetrics[] {
  const byCategory = new Map<string, SourceMetrics[]>();
  for (const s of sources) {
    const m = metricsMap.get(s.id);
    if (!m) continue;
    if (!byCategory.has(s.category)) byCategory.set(s.category, []);
    byCategory.get(s.category)!.push(m);
  }

  return [...byCategory.entries()].map(([category, metrics]) => ({
    category,
    sourceCount: metrics.length,
    avgHealth: Math.round(metrics.reduce((s, m) => s + m.healthScore, 0) / metrics.length),
    avgFreshness: Math.round(metrics.reduce((s, m) => s + m.freshnessScore, 0) / metrics.length),
    avgQuality: Math.round(metrics.reduce((s, m) => s + m.qualityScore, 0) / metrics.length),
    criticalCount: metrics.filter(m => m.risk === "critical").length,
    warningCount: metrics.filter(m => m.risk === "warning").length,
    healthyCount: metrics.filter(m => m.risk === "healthy").length,
  })).sort((a, b) => a.avgHealth - b.avgHealth);
}

// ─── Pipeline metrics ────────────────────────────────────────────

function computePipelineMetrics(pipelines: DataPipeline[], metricsMap: Map<string, SourceMetrics>): PipelineMetrics[] {
  return pipelines.map(p => {
    const sourceMetrics = p.sources.map(sid => metricsMap.get(sid)).filter(Boolean) as SourceMetrics[];
    const avgSourceHealth = sourceMetrics.length > 0
      ? Math.round(sourceMetrics.reduce((s, m) => s + m.healthScore, 0) / sourceMetrics.length)
      : 0;

    let risk: "critical" | "warning" | "healthy";
    if (p.status === "down" || p.status === "degraded") risk = "critical";
    else if (p.status === "partial" || p.status === "planned") risk = "warning";
    else if (avgSourceHealth < 50) risk = "warning";
    else risk = "healthy";

    return {
      id: p.id,
      name: p.name,
      status: p.status,
      sourceCount: p.sources.length,
      destinationCount: p.destinations.length,
      avgSourceHealth,
      risk,
    };
  });
}

// ─── Main entry point ────────────────────────────────────────────

export function analyzeDataSources(graph: DataSourcesGraph): DataAnalysisResult {
  const metricsMap = new Map<string, SourceMetrics>();

  // Compute per-source metrics
  for (const source of graph.sources) {
    const { score: freshnessScore, isStale, hoursStale } = computeFreshnessScore(source);
    const qualityScore = computeQualityScore(source);
    const reliabilityScore = computeReliabilityScore(source, graph.pipelines);
    const { score: healthScore, risk } = computeHealthScore(freshnessScore, qualityScore, reliabilityScore);

    metricsMap.set(source.id, {
      id: source.id,
      name: source.name,
      type: source.type,
      category: source.category,
      owner: source.owner,
      freshnessScore,
      qualityScore,
      reliabilityScore,
      healthScore,
      risk,
      isStale,
      hoursStale,
      issueCount: source.quality.knownIssues.length,
      consumerCount: source.consumers.length,
      dependencyCount: source.dependencies.length,
    });
  }

  // Anti-patterns
  const antiPatterns = detectDataAntiPatterns(graph.sources, graph.pipelines, metricsMap);

  // Lineage
  const lineage = computeLineage(graph);

  // Aggregations
  const sources = [...metricsMap.values()];
  const categoryMetrics = aggregateCategoryMetrics(graph.sources, metricsMap);
  const pipelineMetrics = computePipelineMetrics(graph.pipelines, metricsMap);

  // Summary
  const healthSum = sources.reduce((s, m) => s + m.healthScore, 0);
  const freshnessSum = sources.reduce((s, m) => s + m.freshnessScore, 0);
  const qualitySum = sources.reduce((s, m) => s + m.qualityScore, 0);

  return {
    summary: {
      totalSources: sources.length,
      totalPipelines: graph.pipelines.length,
      totalDestinations: graph.destinations.length,
      avgHealth: Math.round(healthSum / sources.length),
      avgFreshness: Math.round(freshnessSum / sources.length),
      avgQuality: Math.round(qualitySum / sources.length),
      criticalCount: sources.filter(m => m.risk === "critical").length,
      warningCount: sources.filter(m => m.risk === "warning").length,
      healthyCount: sources.filter(m => m.risk === "healthy").length,
      staleCount: sources.filter(m => m.isStale).length,
      antiPatternCount: antiPatterns.length,
      activePipelines: graph.pipelines.filter(p => p.status === "active").length,
      degradedPipelines: graph.pipelines.filter(p => p.status === "degraded" || p.status === "down").length,
      plannedPipelines: graph.pipelines.filter(p => p.status === "planned").length,
    },
    sources,
    antiPatterns,
    lineage,
    categoryMetrics,
    pipelineMetrics,
    generated: new Date().toISOString(),
  };
}
