/**
 * Architecture Analysis Engine
 *
 * Pure analysis module — no Express/MCP dependencies.
 * Computes metrics, detects anti-patterns, finds cycles,
 * scores health, and runs impact analysis on the platform graph.
 */

// ─── Types ───────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  repo: string;
  layer: string;
  path: string;
  label: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "import" | "http" | "contract";
}

export interface PlatformGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta: { generated: string; repos: number; nodes: number; edges: number };
}

export interface ModuleMetrics {
  id: string;
  repo: string;
  layer: string;
  label: string;
  fanIn: number;       // Ca — afferent coupling
  fanOut: number;      // Ce — efferent coupling
  instability: number; // I = Ce / (Ca + Ce), 0=stable, 1=unstable
  blastRadius: number; // transitive dependent count
  healthScore: number; // 0-100 composite
  risk: "critical" | "warning" | "healthy";
  inCycle: boolean;
}

export interface AntiPattern {
  type: "god_module" | "circular_dependency" | "layer_violation" | "shotgun_surgery" | "feature_envy" | "orphan_module" | "hub_module";
  severity: "critical" | "warning" | "info";
  moduleId: string;
  description: string;
  recommendation: string;
  meta?: Record<string, unknown>;
}

export interface CycleDependency {
  nodes: string[];
  crossRepo: boolean;
  size: number;
}

export interface ImpactResult {
  moduleId: string;
  directDependents: string[];
  transitiveDependents: string[];
  blastRadius: number;
  crossRepoImpact: Record<string, number>;
  criticalPath: string[];
}

export interface ValidationResult {
  source: string;
  target: string;
  valid: boolean;
  issues: string[];
  newCycles: CycleDependency[];
  layerViolation: boolean;
  impactedModules: number;
}

export interface RepoMetrics {
  repo: string;
  moduleCount: number;
  avgHealth: number;
  criticalCount: number;
  warningCount: number;
  healthyCount: number;
  antiPatternCount: number;
  cycleCount: number;
}

export interface LayerMetrics {
  layer: string;
  moduleCount: number;
  avgHealth: number;
  avgInstability: number;
  repos: string[];
}

export interface AnalysisResult {
  summary: {
    totalModules: number;
    totalEdges: number;
    avgHealth: number;
    criticalCount: number;
    warningCount: number;
    healthyCount: number;
    orphanCount: number;
    cycleCount: number;
    antiPatternCount: number;
  };
  modules: ModuleMetrics[];
  antiPatterns: AntiPattern[];
  cycles: CycleDependency[];
  repoMetrics: RepoMetrics[];
  layerMetrics: LayerMetrics[];
  generated: string;
}

// ─── Layer ordering for violation detection ──────────────────────

const LAYER_ORDER: Record<string, number> = {
  config: 0, types: 0, contracts: 0,
  utils: 1, lib: 1, models: 1, packages: 1,
  adapters: 2, integrations: 2,
  services: 3, domain: 3, intelligence: 3, core: 3, store: 3,
  platform: 4, middleware: 4, hooks: 4,
  controllers: 5, mcp: 5, components: 5,
  routes: 6, pages: 6,
  bootstrap: 7,
};

function layerOrd(layer: string): number {
  return LAYER_ORDER[layer] ?? 3; // default to mid-level
}

// ─── Adjacency helpers ───────────────────────────────────────────

interface AdjacencyIndex {
  outgoing: Map<string, string[]>;  // source → targets
  incoming: Map<string, string[]>;  // target → sources
  nodeMap: Map<string, GraphNode>;
}

function buildIndex(graph: PlatformGraph): AdjacencyIndex {
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  const nodeMap = new Map<string, GraphNode>();

  for (const n of graph.nodes) {
    nodeMap.set(n.id, n);
    outgoing.set(n.id, []);
    incoming.set(n.id, []);
  }
  for (const e of graph.edges) {
    outgoing.get(e.source)?.push(e.target);
    incoming.get(e.target)?.push(e.source);
  }
  return { outgoing, incoming, nodeMap };
}

// ─── Tarjan's SCC ────────────────────────────────────────────────

export function detectCycles(graph: PlatformGraph): CycleDependency[] {
  const adj = new Map<string, string[]>();
  for (const n of graph.nodes) adj.set(n.id, []);
  for (const e of graph.edges) adj.get(e.source)?.push(e.target);

  const nodeRepo = new Map<string, string>();
  for (const n of graph.nodes) nodeRepo.set(n.id, n.repo);

  let index = 0;
  const stack: string[] = [];
  const onStack = new Set<string>();
  const indices = new Map<string, number>();
  const lowlinks = new Map<string, number>();
  const sccs: string[][] = [];

  function strongconnect(v: string) {
    indices.set(v, index);
    lowlinks.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);

    for (const w of adj.get(v) || []) {
      if (!indices.has(w)) {
        strongconnect(w);
        lowlinks.set(v, Math.min(lowlinks.get(v)!, lowlinks.get(w)!));
      } else if (onStack.has(w)) {
        lowlinks.set(v, Math.min(lowlinks.get(v)!, indices.get(w)!));
      }
    }

    if (lowlinks.get(v) === indices.get(v)) {
      const scc: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        scc.push(w);
      } while (w !== v);
      if (scc.length > 1) sccs.push(scc);
    }
  }

  for (const n of graph.nodes) {
    if (!indices.has(n.id)) strongconnect(n.id);
  }

  return sccs.map(nodes => {
    const repos = new Set(nodes.map(id => nodeRepo.get(id)!));
    return { nodes, crossRepo: repos.size > 1, size: nodes.length };
  });
}

// ─── Blast radius (BFS on reverse edges) ─────────────────────────

function computeBlastRadius(moduleId: string, incoming: Map<string, string[]>): Set<string> {
  const visited = new Set<string>();
  const queue = [moduleId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const dep of incoming.get(current) || []) {
      if (!visited.has(dep)) queue.push(dep);
    }
  }
  visited.delete(moduleId);
  return visited;
}

// ─── Health score ────────────────────────────────────────────────

function computeHealthScoreValue(
  fanIn: number,
  fanOut: number,
  instability: number,
  inCycle: boolean,
  blastRadius: number
): { score: number; risk: "critical" | "warning" | "healthy" } {
  let score = 100;

  // Fan-out penalty: >10 deps = increasingly bad
  if (fanOut > 10) score -= Math.min(25, (fanOut - 10) * 1.5);

  // Instability penalty for highly-depended-upon unstable modules
  if (fanIn > 5 && instability > 0.7) score -= 15;

  // Cycle involvement
  if (inCycle) score -= 20;

  // Blast radius penalty
  if (blastRadius > 50) score -= 20;
  else if (blastRadius > 20) score -= 10;
  else if (blastRadius > 10) score -= 5;

  // Hub penalty: extremely high fan-in
  if (fanIn > 50) score -= 15;
  else if (fanIn > 30) score -= 10;

  score = Math.max(0, Math.min(100, Math.round(score)));
  const risk = score < 40 ? "critical" : score < 70 ? "warning" : "healthy";
  return { score, risk };
}

// ─── Anti-pattern detection ──────────────────────────────────────

function detectAntiPatterns(
  graph: PlatformGraph,
  metricsMap: Map<string, ModuleMetrics>,
  cycles: CycleDependency[],
  idx: AdjacencyIndex
): AntiPattern[] {
  const patterns: AntiPattern[] = [];
  const nodeMap = idx.nodeMap;

  // 1. God modules
  for (const [id, m] of metricsMap) {
    if (m.fanIn > 15 || m.fanOut > 15) {
      const maxCoupling = Math.max(m.fanIn, m.fanOut);
      patterns.push({
        type: "god_module",
        severity: maxCoupling > 30 ? "critical" : "warning",
        moduleId: id,
        description: `God module: fanIn=${m.fanIn}, fanOut=${m.fanOut}. Too many responsibilities.`,
        recommendation: `Split into smaller modules with single responsibility. Extract cohesive groups of dependencies.`,
        meta: { fanIn: m.fanIn, fanOut: m.fanOut },
      });
    }
  }

  // 2. Circular dependencies (from SCC)
  for (const cycle of cycles) {
    for (const nodeId of cycle.nodes) {
      patterns.push({
        type: "circular_dependency",
        severity: cycle.crossRepo ? "critical" : "warning",
        moduleId: nodeId,
        description: `In cycle of ${cycle.size} modules${cycle.crossRepo ? " (CROSS-REPO)" : ""}. Cycle members: ${cycle.nodes.slice(0, 5).join(", ")}${cycle.nodes.length > 5 ? "..." : ""}`,
        recommendation: `Break cycle by introducing an interface/abstraction or inverting the dependency direction.`,
        meta: { cycleSize: cycle.size, crossRepo: cycle.crossRepo, cycleMembers: cycle.nodes },
      });
    }
  }

  // 3. Layer violations
  for (const e of graph.edges) {
    const sourceNode = nodeMap.get(e.source);
    const targetNode = nodeMap.get(e.target);
    if (!sourceNode || !targetNode) continue;
    const srcOrd = layerOrd(sourceNode.layer);
    const tgtOrd = layerOrd(targetNode.layer);
    // Higher layer number importing from higher layer is OK.
    // Lower layer importing from higher layer is a violation.
    if (srcOrd < tgtOrd && tgtOrd - srcOrd > 1) {
      patterns.push({
        type: "layer_violation",
        severity: "warning",
        moduleId: e.source,
        description: `Layer violation: ${sourceNode.layer}(${srcOrd}) → ${targetNode.layer}(${tgtOrd}). Lower layer depends on higher layer: ${e.source} → ${e.target}`,
        recommendation: `Introduce an abstraction in a shared lower layer, or move the dependency target down.`,
        meta: { source: e.source, target: e.target, sourceLayer: sourceNode.layer, targetLayer: targetNode.layer },
      });
    }
  }

  // 4. Shotgun surgery (very high fan-in)
  for (const [id, m] of metricsMap) {
    if (m.fanIn > 30) {
      patterns.push({
        type: "shotgun_surgery",
        severity: m.fanIn > 80 ? "critical" : "warning",
        moduleId: id,
        description: `Shotgun surgery risk: ${m.fanIn} modules depend on this. Any change here ripples across ${m.blastRadius} modules transitively.`,
        recommendation: `Stabilize the API surface. Consider versioning or extracting a stable interface.`,
        meta: { fanIn: m.fanIn, blastRadius: m.blastRadius },
      });
    }
  }

  // 5. Feature envy (>60% deps point to different repo)
  for (const [id, m] of metricsMap) {
    const outEdges = idx.outgoing.get(id) || [];
    if (outEdges.length < 3) continue;
    const node = nodeMap.get(id);
    if (!node) continue;
    const crossRepoCount = outEdges.filter(t => {
      const tn = nodeMap.get(t);
      return tn && tn.repo !== node.repo;
    }).length;
    if (crossRepoCount / outEdges.length > 0.6) {
      patterns.push({
        type: "feature_envy",
        severity: "warning",
        moduleId: id,
        description: `Feature envy: ${crossRepoCount}/${outEdges.length} dependencies (${Math.round(crossRepoCount / outEdges.length * 100)}%) point to other repos.`,
        recommendation: `Consider moving this module to the repo it depends on most, or extract a shared contract.`,
        meta: { crossRepoRatio: crossRepoCount / outEdges.length, crossRepoCount },
      });
    }
  }

  // 6. Orphan modules
  const entryLayers = new Set(["routes", "pages", "bootstrap", "mcp"]);
  for (const [id, m] of metricsMap) {
    if (m.fanIn === 0 && m.fanOut === 0) {
      const node = nodeMap.get(id);
      if (node && !entryLayers.has(node.layer)) {
        patterns.push({
          type: "orphan_module",
          severity: "info",
          moduleId: id,
          description: `Orphan module: zero incoming and outgoing edges. Potentially dead code.`,
          recommendation: `Verify if this module is still needed. Remove if unused, or add proper imports.`,
        });
      }
    }
  }

  // 7. Hub modules
  for (const [id, m] of metricsMap) {
    if (m.fanIn > 50) {
      patterns.push({
        type: "hub_module",
        severity: "critical",
        moduleId: id,
        description: `Hub module: ${m.fanIn} dependents. Central point of failure — any change has massive blast radius (${m.blastRadius}).`,
        recommendation: `Freeze API surface, add comprehensive tests, consider splitting responsibilities.`,
        meta: { fanIn: m.fanIn, blastRadius: m.blastRadius },
      });
    }
  }

  return patterns;
}

// ─── Impact analysis ─────────────────────────────────────────────

export function computeImpact(graph: PlatformGraph, moduleId: string, maxDepth?: number): ImpactResult {
  const idx = buildIndex(graph);
  const node = idx.nodeMap.get(moduleId);
  if (!node) {
    return { moduleId, directDependents: [], transitiveDependents: [], blastRadius: 0, crossRepoImpact: {}, criticalPath: [] };
  }

  const directDependents = idx.incoming.get(moduleId) || [];

  // BFS for transitive with depth tracking
  const visited = new Map<string, number>(); // id → depth
  const parent = new Map<string, string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: moduleId, depth: 0 }];
  const limit = maxDepth ?? 100;

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.set(id, depth);
    if (depth >= limit) continue;
    for (const dep of idx.incoming.get(id) || []) {
      if (!visited.has(dep)) {
        parent.set(dep, id);
        queue.push({ id: dep, depth: depth + 1 });
      }
    }
  }
  visited.delete(moduleId);

  // Cross-repo impact
  const crossRepoImpact: Record<string, number> = {};
  for (const [depId] of visited) {
    const depNode = idx.nodeMap.get(depId);
    if (depNode) {
      crossRepoImpact[depNode.repo] = (crossRepoImpact[depNode.repo] || 0) + 1;
    }
  }

  // Critical path: find the longest chain
  let longestPath: string[] = [];
  for (const [depId, depth] of visited) {
    if (depth > longestPath.length) {
      const path: string[] = [];
      let cur: string | undefined = depId;
      while (cur && cur !== moduleId) {
        path.unshift(cur);
        cur = parent.get(cur);
      }
      path.unshift(moduleId);
      if (path.length > longestPath.length) longestPath = path;
    }
  }

  return {
    moduleId,
    directDependents,
    transitiveDependents: [...visited.keys()],
    blastRadius: visited.size,
    crossRepoImpact,
    criticalPath: longestPath,
  };
}

// ─── Validate proposed edge ──────────────────────────────────────

export function validateProposedEdge(graph: PlatformGraph, source: string, target: string): ValidationResult {
  const idx = buildIndex(graph);
  const issues: string[] = [];

  const srcNode = idx.nodeMap.get(source);
  const tgtNode = idx.nodeMap.get(target);

  if (!srcNode) issues.push(`Source module "${source}" not found in graph`);
  if (!tgtNode) issues.push(`Target module "${target}" not found in graph`);

  if (issues.length > 0) {
    return { source, target, valid: false, issues, newCycles: [], layerViolation: false, impactedModules: 0 };
  }

  // Check layer violation
  const srcOrd = layerOrd(srcNode!.layer);
  const tgtOrd = layerOrd(tgtNode!.layer);
  const layerViolation = srcOrd < tgtOrd && tgtOrd - srcOrd > 1;
  if (layerViolation) {
    issues.push(`Layer violation: ${srcNode!.layer}(${srcOrd}) → ${tgtNode!.layer}(${tgtOrd})`);
  }

  // Check for new cycles by temporarily adding edge
  const tempGraph: PlatformGraph = {
    ...graph,
    edges: [...graph.edges, { source, target, type: "import" }],
  };
  const newCycles = detectCycles(tempGraph);
  const existingCycles = detectCycles(graph);
  const existingCycleKeys = new Set(existingCycles.map(c => c.nodes.sort().join("|")));
  const addedCycles = newCycles.filter(c => !existingCycleKeys.has(c.nodes.sort().join("|")));

  if (addedCycles.length > 0) {
    issues.push(`Creates ${addedCycles.length} new cycle(s)`);
  }

  // Count impacted modules
  const impact = computeImpact(tempGraph, source);

  return {
    source,
    target,
    valid: issues.length === 0,
    issues,
    newCycles: addedCycles,
    layerViolation,
    impactedModules: impact.blastRadius,
  };
}

// ─── Repo & layer aggregation ────────────────────────────────────

export function aggregateRepoMetrics(
  modules: ModuleMetrics[],
  antiPatterns: AntiPattern[],
  cycles: CycleDependency[]
): RepoMetrics[] {
  const byRepo = new Map<string, ModuleMetrics[]>();
  for (const m of modules) {
    if (!byRepo.has(m.repo)) byRepo.set(m.repo, []);
    byRepo.get(m.repo)!.push(m);
  }

  const apByRepo = new Map<string, number>();
  for (const ap of antiPatterns) {
    const mod = modules.find(m => m.id === ap.moduleId);
    if (mod) apByRepo.set(mod.repo, (apByRepo.get(mod.repo) || 0) + 1);
  }

  return [...byRepo.entries()].map(([repo, mods]) => {
    const healthSum = mods.reduce((s, m) => s + m.healthScore, 0);
    const repoCycles = cycles.filter(c => c.nodes.some(id => mods.some(m => m.id === id)));
    return {
      repo,
      moduleCount: mods.length,
      avgHealth: Math.round(healthSum / mods.length),
      criticalCount: mods.filter(m => m.risk === "critical").length,
      warningCount: mods.filter(m => m.risk === "warning").length,
      healthyCount: mods.filter(m => m.risk === "healthy").length,
      antiPatternCount: apByRepo.get(repo) || 0,
      cycleCount: repoCycles.length,
    };
  });
}

export function aggregateLayerMetrics(modules: ModuleMetrics[]): LayerMetrics[] {
  const byLayer = new Map<string, ModuleMetrics[]>();
  for (const m of modules) {
    if (!byLayer.has(m.layer)) byLayer.set(m.layer, []);
    byLayer.get(m.layer)!.push(m);
  }

  return [...byLayer.entries()].map(([layer, mods]) => ({
    layer,
    moduleCount: mods.length,
    avgHealth: Math.round(mods.reduce((s, m) => s + m.healthScore, 0) / mods.length),
    avgInstability: +(mods.reduce((s, m) => s + m.instability, 0) / mods.length).toFixed(2),
    repos: [...new Set(mods.map(m => m.repo))],
  }));
}

// ─── Recommendations ─────────────────────────────────────────────

export interface Recommendation {
  priority: number; // 1=highest
  category: "critical" | "structural" | "cleanup";
  title: string;
  description: string;
  modules: string[];
}

export function generateRecommendations(
  modules: ModuleMetrics[],
  antiPatterns: AntiPattern[],
  cycles: CycleDependency[],
  focus?: string,
  repo?: string
): Recommendation[] {
  const recs: Recommendation[] = [];
  let filteredAP = antiPatterns;
  if (repo) filteredAP = filteredAP.filter(ap => {
    const m = modules.find(mod => mod.id === ap.moduleId);
    return m && m.repo === repo;
  });

  // Critical hubs
  const hubs = filteredAP.filter(ap => ap.type === "hub_module" && ap.severity === "critical");
  if (hubs.length > 0 && (!focus || focus === "stability")) {
    recs.push({
      priority: 1,
      category: "critical",
      title: `Stabilize ${hubs.length} critical hub module(s)`,
      description: `These modules are depended on by 50+ others. Freeze their API, add integration tests, and consider introducing facade patterns.`,
      modules: hubs.map(h => h.moduleId),
    });
  }

  // Cross-repo cycles
  const crossRepoCycles = cycles.filter(c => c.crossRepo);
  if (crossRepoCycles.length > 0 && (!focus || focus === "architecture")) {
    recs.push({
      priority: 1,
      category: "critical",
      title: `Break ${crossRepoCycles.length} cross-repo circular dependencies`,
      description: `Cross-repo cycles create tight coupling between services. Use contracts/events to decouple.`,
      modules: [...new Set(crossRepoCycles.flatMap(c => c.nodes))],
    });
  }

  // Shotgun surgery
  const shotguns = filteredAP.filter(ap => ap.type === "shotgun_surgery" && ap.severity === "critical");
  if (shotguns.length > 0 && (!focus || focus === "stability")) {
    recs.push({
      priority: 2,
      category: "structural",
      title: `Address ${shotguns.length} shotgun surgery risks`,
      description: `Modules with 80+ dependents. Changes ripple widely. Add versioned interfaces.`,
      modules: shotguns.map(s => s.moduleId),
    });
  }

  // God modules
  const gods = filteredAP.filter(ap => ap.type === "god_module" && ap.severity === "critical");
  if (gods.length > 0 && (!focus || focus === "architecture")) {
    recs.push({
      priority: 2,
      category: "structural",
      title: `Split ${gods.length} god module(s)`,
      description: `Modules with 30+ connections. Extract cohesive submodules.`,
      modules: gods.map(g => g.moduleId),
    });
  }

  // Orphan cleanup
  const orphans = filteredAP.filter(ap => ap.type === "orphan_module");
  if (orphans.length > 10 && (!focus || focus === "cleanup")) {
    recs.push({
      priority: 3,
      category: "cleanup",
      title: `Review ${orphans.length} orphan modules (potential dead code)`,
      description: `These modules have no imports and no dependents. Verify and remove if unused.`,
      modules: orphans.map(o => o.moduleId),
    });
  }

  // Layer violations
  const violations = filteredAP.filter(ap => ap.type === "layer_violation");
  if (violations.length > 0 && (!focus || focus === "architecture")) {
    recs.push({
      priority: 2,
      category: "structural",
      title: `Fix ${violations.length} layer violation(s)`,
      description: `Lower-level modules importing from higher layers breaks the dependency rule.`,
      modules: [...new Set(violations.map(v => v.moduleId))],
    });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}

// ─── Main entry point ────────────────────────────────────────────

export function analyzeGraph(graph: PlatformGraph): AnalysisResult {
  const idx = buildIndex(graph);

  // 1. Compute per-module metrics
  const cycles = detectCycles(graph);
  const cycleNodeIds = new Set(cycles.flatMap(c => c.nodes));

  const metricsMap = new Map<string, ModuleMetrics>();
  const blastRadiusCache = new Map<string, number>();

  // First pass: fan-in/fan-out
  for (const n of graph.nodes) {
    const fanIn = (idx.incoming.get(n.id) || []).length;
    const fanOut = (idx.outgoing.get(n.id) || []).length;
    const instability = fanIn + fanOut === 0 ? 0 : +(fanOut / (fanIn + fanOut)).toFixed(3);
    metricsMap.set(n.id, {
      id: n.id,
      repo: n.repo,
      layer: n.layer,
      label: n.label,
      fanIn,
      fanOut,
      instability,
      blastRadius: 0,
      healthScore: 100,
      risk: "healthy",
      inCycle: cycleNodeIds.has(n.id),
    });
  }

  // Second pass: blast radius (only for modules with fanIn > 0 to avoid wasted BFS)
  for (const [id, m] of metricsMap) {
    if (m.fanIn > 0) {
      const br = computeBlastRadius(id, idx.incoming);
      m.blastRadius = br.size;
      blastRadiusCache.set(id, br.size);
    }
  }

  // Third pass: health scores
  for (const [, m] of metricsMap) {
    const { score, risk } = computeHealthScoreValue(m.fanIn, m.fanOut, m.instability, m.inCycle, m.blastRadius);
    m.healthScore = score;
    m.risk = risk;
  }

  // 2. Anti-patterns
  const antiPatterns = detectAntiPatterns(graph, metricsMap, cycles, idx);

  // 3. Aggregations
  const modules = [...metricsMap.values()];
  const repoMetrics = aggregateRepoMetrics(modules, antiPatterns, cycles);
  const layerMetrics = aggregateLayerMetrics(modules);

  // 4. Summary
  const healthSum = modules.reduce((s, m) => s + m.healthScore, 0);
  const orphanCount = antiPatterns.filter(ap => ap.type === "orphan_module").length;

  return {
    summary: {
      totalModules: modules.length,
      totalEdges: graph.edges.length,
      avgHealth: Math.round(healthSum / modules.length),
      criticalCount: modules.filter(m => m.risk === "critical").length,
      warningCount: modules.filter(m => m.risk === "warning").length,
      healthyCount: modules.filter(m => m.risk === "healthy").length,
      orphanCount,
      cycleCount: cycles.length,
      antiPatternCount: antiPatterns.length,
    },
    modules,
    antiPatterns,
    cycles,
    repoMetrics,
    layerMetrics,
    generated: new Date().toISOString(),
  };
}
