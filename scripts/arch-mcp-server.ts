/**
 * Architecture Graph MCP Server (HTTP/SSE)
 *
 * Exposes the WidgeTDC platform architecture graph via MCP tools.
 * Reads platform-graph.json and provides search, stats, dependency
 * queries, cross-repo edge analysis, health scoring, anti-pattern
 * detection, impact analysis, and an intelligence dashboard.
 *
 * Deployed on Railway. Supports both:
 *   - Streamable HTTP transport (2025-11-25) on /mcp
 *   - Legacy SSE transport (2024-11-05) on /sse + /messages
 *
 * Claude Code config (~/.claude.json):
 *   "mcpServers": {
 *     "architecture": {
 *       "type": "sse",
 *       "url": "https://<railway-url>/sse"
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import express from "express";
import cors from "cors";

import {
  analyzeGraph,
  computeImpact,
  validateProposedEdge,
  generateRecommendations,
  type PlatformGraph,
  type GraphNode,
  type GraphEdge,
  type AnalysisResult,
} from "./arch-analysis.js";

import {
  analyzeDataSources,
  type DataSourcesGraph,
  type DataAnalysisResult,
} from "./data-analysis.js";

import {
  initMonitoring,
  stopMonitoring,
  getInfrastructure,
  getAlerts,
  ackAlert,
  getAnomalies,
  getCost,
  getCostForecast,
  getCompliance,
  getComplianceRequirement,
  getRules,
  getErrors,
  getServiceDetail,
  getServiceProbes,
  getServiceSLA,
  getIncidents,
  getIncident,
  createOrUpdateRule,
  removeRule,
} from "./monitoring/index.js";
import { sseHandler } from "./monitoring/sse.js";

// --- GitHub Changelog ---
interface ChangelogCommit {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;
  repo: string;
  repoLabel: string;
  url: string;
}

const GITHUB_REPOS = [
  { owner: "Clauskraft", repo: "WidgeTDC", label: "backend" },
  { owner: "Clauskraft", repo: "widgetdc-consulting-frontend", label: "frontend" },
  { owner: "Clauskraft", repo: "widgetdc-rlm-engine", label: "rlm" },
  { owner: "Clauskraft", repo: "widgetdc-contracts", label: "contracts" },
];

let changelogCache: { data: ChangelogCommit[]; ts: number; since?: string } | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// --- GitHub Branches & PRs ---
interface OpenPR {
  number: number;
  title: string;
  author: string;
  state: string;
  draft: boolean;
  createdAt: string;
  updatedAt: string;
  repo: string;
  repoLabel: string;
  url: string;
  labels: string[];
  reviewStatus: string; // 'approved' | 'changes_requested' | 'review_required' | 'none'
  additions: number;
  deletions: number;
  changedFiles: number;
  baseBranch: string;
  headBranch: string;
}

interface UnmergedBranch {
  name: string;
  repo: string;
  repoLabel: string;
  lastCommitSha: string;
  lastCommitDate: string;
  lastCommitAuthor: string;
  aheadBy: number;
  behindBy: number;
  url: string;
  isStale: boolean; // >30 days without activity
}

let branchesCache: { data: { prs: OpenPR[]; branches: UnmergedBranch[] }; ts: number } | null = null;

async function fetchRepoCommits(
  owner: string,
  repo: string,
  label: string,
  perPage = 30,
  since?: string
): Promise<ChangelogCommit[]> {
  const params = new URLSearchParams({ per_page: String(perPage) });
  if (since) params.set("since", since);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "WidgeTDC-Arch-Server",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `https://api.github.com/repos/${owner}/${repo}/commits?${params}`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    console.warn(`[changelog] GitHub ${res.status} for ${owner}/${repo}: ${res.statusText}`);
    return [];
  }

  const data = await res.json() as any[];
  return data.map((c: any) => ({
    sha: c.sha,
    shortSha: c.sha.slice(0, 7),
    message: c.commit?.message?.split("\n")[0] || "",
    author: c.commit?.author?.name || c.author?.login || "unknown",
    date: c.commit?.author?.date || "",
    repo: label,
    repoLabel: label,
    url: c.html_url || `https://github.com/${owner}/${repo}/commit/${c.sha}`,
  }));
}

async function fetchAllChangelog(since?: string, limit = 100): Promise<{ commits: ChangelogCommit[]; fromCache: boolean; warning?: string }> {
  const cacheKey = since || "__all__";
  if (changelogCache && changelogCache.since === cacheKey && Date.now() - changelogCache.ts < CACHE_TTL) {
    return { commits: changelogCache.data.slice(0, limit), fromCache: true };
  }

  let warning: string | undefined;
  const perPage = Math.min(limit, 100);
  const results = await Promise.allSettled(
    GITHUB_REPOS.map((r) => fetchRepoCommits(r.owner, r.repo, r.label, perPage, since))
  );

  const commits: ChangelogCommit[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      commits.push(...r.value);
    } else {
      warning = "Some repos failed to fetch. Partial results shown.";
      console.warn("[changelog] Fetch error:", r.reason);
    }
  }

  commits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  changelogCache = { data: commits, ts: Date.now(), since: cacheKey };
  return { commits: commits.slice(0, limit), fromCache: false, warning };
}

// --- GitHub Branches & PRs fetchers ---
function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "WidgeTDC-Arch-Server",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function fetchRepoPRs(owner: string, repo: string, label: string): Promise<OpenPR[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`;
  const res = await fetch(url, { headers: ghHeaders() });

  if (!res.ok) {
    console.warn(`[branches] GitHub ${res.status} for ${owner}/${repo}/pulls: ${res.statusText}`);
    return [];
  }

  const data = await res.json() as any[];
  return data.map((pr: any) => ({
    number: pr.number,
    title: pr.title || "",
    author: pr.user?.login || "unknown",
    state: pr.state,
    draft: pr.draft || false,
    createdAt: pr.created_at || "",
    updatedAt: pr.updated_at || "",
    repo: label,
    repoLabel: label,
    url: pr.html_url || "",
    labels: (pr.labels || []).map((l: any) => l.name),
    reviewStatus: "none", // Will be enriched below if possible
    additions: pr.additions || 0,
    deletions: pr.deletions || 0,
    changedFiles: pr.changed_files || 0,
    baseBranch: pr.base?.ref || "main",
    headBranch: pr.head?.ref || "",
  }));
}

async function fetchRepoBranches(owner: string, repo: string, label: string): Promise<UnmergedBranch[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`;
  const res = await fetch(url, { headers: ghHeaders() });

  if (!res.ok) {
    console.warn(`[branches] GitHub ${res.status} for ${owner}/${repo}/branches: ${res.statusText}`);
    return [];
  }

  const data = await res.json() as any[];
  const skipBranches = new Set(["main", "master", "HEAD"]);
  const filtered = data.filter((b: any) => !skipBranches.has(b.name));

  const STALE_THRESHOLD = 30 * 24 * 60 * 60 * 1000; // 30 days
  const branches: UnmergedBranch[] = [];

  // Fetch compare data for each branch (limited concurrency)
  const comparePromises = filtered.map(async (b: any) => {
    try {
      const compareUrl = `https://api.github.com/repos/${owner}/${repo}/compare/main...${encodeURIComponent(b.name)}`;
      const compareRes = await fetch(compareUrl, { headers: ghHeaders() });
      if (!compareRes.ok) return { branch: b, ahead: 0, behind: 0, lastDate: "", lastAuthor: "" };
      const compareData = await compareRes.json() as any;
      const lastCommit = compareData.commits?.[compareData.commits.length - 1];
      return {
        branch: b,
        ahead: compareData.ahead_by || 0,
        behind: compareData.behind_by || 0,
        lastDate: lastCommit?.commit?.author?.date || "",
        lastAuthor: lastCommit?.commit?.author?.name || lastCommit?.author?.login || "unknown",
      };
    } catch {
      return { branch: b, ahead: 0, behind: 0, lastDate: "", lastAuthor: "" };
    }
  });

  const results = await Promise.allSettled(comparePromises);
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const { branch: b, ahead, behind, lastDate, lastAuthor } = r.value;
    const isStale = lastDate ? (Date.now() - new Date(lastDate).getTime()) > STALE_THRESHOLD : false;

    branches.push({
      name: b.name,
      repo: label,
      repoLabel: label,
      lastCommitSha: b.commit?.sha?.slice(0, 7) || "",
      lastCommitDate: lastDate,
      lastCommitAuthor: lastAuthor,
      aheadBy: ahead,
      behindBy: behind,
      url: `https://github.com/${owner}/${repo}/tree/${encodeURIComponent(b.name)}`,
      isStale,
    });
  }

  return branches;
}

async function fetchAllOpenChanges(): Promise<{ prs: OpenPR[]; branches: UnmergedBranch[]; fromCache: boolean; warning?: string }> {
  if (branchesCache && Date.now() - branchesCache.ts < CACHE_TTL) {
    return { ...branchesCache.data, fromCache: true };
  }

  let warning: string | undefined;
  const prResults = await Promise.allSettled(
    GITHUB_REPOS.map((r) => fetchRepoPRs(r.owner, r.repo, r.label))
  );
  const branchResults = await Promise.allSettled(
    GITHUB_REPOS.map((r) => fetchRepoBranches(r.owner, r.repo, r.label))
  );

  const prs: OpenPR[] = [];
  const branches: UnmergedBranch[] = [];

  for (const r of prResults) {
    if (r.status === "fulfilled") prs.push(...r.value);
    else { warning = "Some repos failed to fetch. Partial results shown."; console.warn("[branches] PR fetch error:", r.reason); }
  }
  for (const r of branchResults) {
    if (r.status === "fulfilled") branches.push(...r.value);
    else { warning = warning || "Some repos failed to fetch. Partial results shown."; console.warn("[branches] Branch fetch error:", r.reason); }
  }

  // Sort PRs by most recently updated
  prs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  // Sort branches by last commit date (newest first)
  branches.sort((a, b) => {
    if (!a.lastCommitDate) return 1;
    if (!b.lastCommitDate) return -1;
    return new Date(b.lastCommitDate).getTime() - new Date(a.lastCommitDate).getTime();
  });

  branchesCache = { data: { prs, branches }, ts: Date.now() };
  return { prs, branches, fromCache: false, warning };
}

// --- Resolve graph path ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const GRAPH_PATHS = [
  resolve(__dirname, "../arch/platform-graph.json"),
  resolve(__dirname, "../../arch/platform-graph.json"),
];

// --- Load graph ---
let graph: PlatformGraph | null = null;
let fanIn: Record<string, number> = {};
let depCount: Record<string, number> = {};
let analysisResult: AnalysisResult | null = null;

function loadGraph(): PlatformGraph {
  if (graph) return graph;

  for (const p of GRAPH_PATHS) {
    if (existsSync(p)) {
      graph = JSON.parse(readFileSync(p, "utf-8"));
      console.log(`[arch-mcp] Loaded graph from ${p}`);
      break;
    }
  }

  if (!graph) {
    throw new Error(
      `platform-graph.json not found. Run: cd widgetdc-contracts && npm run arch:aggregate`
    );
  }

  // Precompute metrics
  fanIn = {};
  depCount = {};
  graph.nodes.forEach((n) => {
    fanIn[n.id] = 0;
    depCount[n.id] = 0;
  });
  graph.edges.forEach((e) => {
    if (fanIn[e.target] !== undefined) fanIn[e.target]++;
    if (depCount[e.source] !== undefined) depCount[e.source]++;
  });

  // Run full analysis
  console.log(`[arch-mcp] Running architecture analysis...`);
  analysisResult = analyzeGraph(graph);
  console.log(`[arch-mcp] Analysis complete: ${analysisResult.summary.totalModules} modules, ${analysisResult.summary.antiPatternCount} anti-patterns, ${analysisResult.summary.cycleCount} cycles`);

  return graph;
}

// --- Load DataPulse data sources ---
let dataSourcesGraph: DataSourcesGraph | null = null;
let dataAnalysisResult: DataAnalysisResult | null = null;

function loadDataSources(): DataSourcesGraph {
  if (dataSourcesGraph) return dataSourcesGraph;

  const dsPath = resolve(__dirname, "../arch/data-sources.json");
  if (!existsSync(dsPath)) {
    throw new Error(`data-sources.json not found at ${dsPath}`);
  }

  dataSourcesGraph = JSON.parse(readFileSync(dsPath, "utf-8"));
  console.log(`[datapulse] Loaded data-sources.json from ${dsPath}`);

  // Run analysis
  console.log(`[datapulse] Running data source analysis...`);
  dataAnalysisResult = analyzeDataSources(dataSourcesGraph!);
  console.log(`[datapulse] Analysis complete: ${dataAnalysisResult.summary.totalSources} sources, ${dataAnalysisResult.summary.antiPatternCount} issues, avg health ${dataAnalysisResult.summary.avgHealth}`);

  return dataSourcesGraph!;
}

// --- Register MCP tools on a server instance ---
function registerTools(server: McpServer): void {
  // =====================================================
  // EXISTING TOOLS (7)
  // =====================================================

  // arch_stats
  server.tool(
    "arch_stats",
    "Get system-wide architecture statistics: repos, modules, edges, layers, top modules by fan-in",
    {},
    async () => {
      const g = loadGraph();
      const repos: Record<string, number> = {};
      const layers: Record<string, number> = {};
      g.nodes.forEach((n) => {
        repos[n.repo] = (repos[n.repo] || 0) + 1;
        layers[n.layer] = (layers[n.layer] || 0) + 1;
      });

      const edgeTypes: Record<string, number> = {};
      g.edges.forEach((e) => {
        edgeTypes[e.type] = (edgeTypes[e.type] || 0) + 1;
      });

      const topByFanIn = Object.entries(fanIn)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([id, count]) => ({ id, fanIn: count }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { generated: g.meta.generated, totalNodes: g.meta.nodes, totalEdges: g.meta.edges, repos, layers, edgeTypes, topModulesByFanIn: topByFanIn },
              null, 2
            ),
          },
        ],
      };
    }
  );

  // arch_search
  server.tool(
    "arch_search",
    "Search for modules by name, ID pattern, repo, or layer. Returns matching modules with their metadata.",
    {
      query: z.string().describe("Search term (matches against module ID, label, path)"),
      repo: z.string().optional().describe("Filter by repo: backend, frontend, rlm, contracts"),
      layer: z.string().optional().describe("Filter by layer: services, routes, mcp, components, etc."),
      limit: z.number().int().optional().describe("Max results (default 20)"),
    },
    async ({ query, repo, layer, limit }) => {
      const g = loadGraph();
      const q = query.toLowerCase();
      const max = limit || 20;

      const results = g.nodes
        .filter((n) => {
          if (repo && n.repo !== repo) return false;
          if (layer && n.layer !== layer) return false;
          return n.id.toLowerCase().includes(q) || n.label.toLowerCase().includes(q) || n.path.toLowerCase().includes(q);
        })
        .slice(0, max)
        .map((n) => ({ id: n.id, repo: n.repo, layer: n.layer, path: n.path, fanIn: fanIn[n.id] || 0, dependencies: depCount[n.id] || 0 }));

      return { content: [{ type: "text" as const, text: JSON.stringify({ matches: results.length, results }, null, 2) }] };
    }
  );

  // arch_module
  server.tool(
    "arch_module",
    "Get full details for a specific module: metadata, dependencies, dependents, and cross-repo connections.",
    { moduleId: z.string().describe("Canonical module ID (e.g. backend.services.neo4jService)") },
    async ({ moduleId }) => {
      const g = loadGraph();
      const node = g.nodes.find((n) => n.id === moduleId);

      if (!node) {
        const candidates = g.nodes.filter((n) => n.id.toLowerCase().includes(moduleId.toLowerCase())).slice(0, 5);
        return { content: [{ type: "text" as const, text: JSON.stringify({ error: `Module "${moduleId}" not found`, suggestions: candidates.map((c) => c.id) }, null, 2) }] };
      }

      const deps = g.edges.filter((e) => e.source === moduleId).map((e) => ({ target: e.target, type: e.type }));
      const dependents = g.edges.filter((e) => e.target === moduleId).map((e) => ({ source: e.source, type: e.type }));
      const crossRepo = [...deps, ...dependents].filter((e) => {
        const otherId = "target" in e ? e.target : (e as any).source;
        const other = g.nodes.find((n) => n.id === otherId);
        return other && other.repo !== node.repo;
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            id: node.id, repo: node.repo, layer: node.layer, path: node.path, label: node.label,
            fanIn: fanIn[moduleId] || 0, dependencyCount: deps.length, dependentCount: dependents.length,
            crossRepoConnections: crossRepo.length, dependencies: deps, dependents,
          }, null, 2),
        }],
      };
    }
  );

  // arch_layer
  server.tool(
    "arch_layer",
    "List all modules in a specific layer, optionally filtered by repo. Shows module count, fan-in ranking.",
    {
      layer: z.string().describe("Layer name: services, routes, mcp, components, pages, hooks, store, etc."),
      repo: z.string().optional().describe("Filter by repo: backend, frontend, rlm, contracts"),
    },
    async ({ layer, repo }) => {
      const g = loadGraph();
      const modules = g.nodes
        .filter((n) => n.layer === layer && (!repo || n.repo === repo))
        .map((n) => ({ id: n.id, repo: n.repo, label: n.label, fanIn: fanIn[n.id] || 0, dependencies: depCount[n.id] || 0 }))
        .sort((a, b) => b.fanIn - a.fanIn);

      return { content: [{ type: "text" as const, text: JSON.stringify({ layer, repo: repo || "all", count: modules.length, modules }, null, 2) }] };
    }
  );

  // arch_cross_repo
  server.tool(
    "arch_cross_repo",
    "Show all cross-repo edges: which modules connect across repository boundaries, grouped by repo pair.",
    { edgeType: z.enum(["all", "import", "http", "contract"]).optional().describe("Filter by edge type (default: all)") },
    async ({ edgeType }) => {
      const g = loadGraph();
      const nodeRepo: Record<string, string> = {};
      g.nodes.forEach((n) => (nodeRepo[n.id] = n.repo));

      const crossEdges = g.edges.filter((e) => {
        if (edgeType && edgeType !== "all" && e.type !== edgeType) return false;
        return nodeRepo[e.source] && nodeRepo[e.target] && nodeRepo[e.source] !== nodeRepo[e.target];
      });

      const pairs: Record<string, { count: number; types: Record<string, number>; examples: { source: string; target: string; type: string }[] }> = {};
      for (const e of crossEdges) {
        const key = [nodeRepo[e.source], nodeRepo[e.target]].sort().join(" <-> ");
        if (!pairs[key]) pairs[key] = { count: 0, types: {}, examples: [] };
        pairs[key].count++;
        pairs[key].types[e.type] = (pairs[key].types[e.type] || 0) + 1;
        if (pairs[key].examples.length < 5) pairs[key].examples.push({ source: e.source, target: e.target, type: e.type });
      }

      return { content: [{ type: "text" as const, text: JSON.stringify({ totalCrossRepoEdges: crossEdges.length, repoPairs: pairs }, null, 2) }] };
    }
  );

  // arch_depends_on
  server.tool(
    "arch_depends_on",
    "Find all modules that depend on a given module (reverse dependency lookup). Useful for impact analysis.",
    {
      moduleId: z.string().describe("Canonical module ID to find dependents of"),
      transitive: z.boolean().optional().describe("Include transitive dependents (default: false)"),
    },
    async ({ moduleId, transitive }) => {
      const g = loadGraph();

      if (transitive) {
        const visited = new Set<string>();
        const queue = [moduleId];
        while (queue.length > 0) {
          const current = queue.shift()!;
          if (visited.has(current)) continue;
          visited.add(current);
          g.edges.filter((e) => e.target === current).forEach((e) => { if (!visited.has(e.source)) queue.push(e.source); });
        }
        visited.delete(moduleId);
        return { content: [{ type: "text" as const, text: JSON.stringify({ moduleId, transitive: true, dependentCount: visited.size, dependents: [...visited].sort() }, null, 2) }] };
      }

      const dependents = g.edges.filter((e) => e.target === moduleId).map((e) => ({ source: e.source, type: e.type }));
      return { content: [{ type: "text" as const, text: JSON.stringify({ moduleId, transitive: false, dependentCount: dependents.length, dependents }, null, 2) }] };
    }
  );

  // arch_hotspots
  server.tool(
    "arch_hotspots",
    "Identify architectural hotspots: high fan-in modules, high dependency modules, and potential circular dependencies.",
    {},
    async () => {
      const g = loadGraph();
      const highFanIn = Object.entries(fanIn).filter(([_, v]) => v >= 5).sort((a, b) => b[1] - a[1])
        .map(([id, count]) => { const n = g.nodes.find((n) => n.id === id); return { id, repo: n?.repo, layer: n?.layer, fanIn: count }; });
      const highDeps = Object.entries(depCount).filter(([_, v]) => v >= 10).sort((a, b) => b[1] - a[1])
        .map(([id, count]) => { const n = g.nodes.find((n) => n.id === id); return { id, repo: n?.repo, layer: n?.layer, dependencies: count }; });
      const edgeSet = new Set(g.edges.map((e) => `${e.source}|${e.target}`));
      const circular: { a: string; b: string }[] = [];
      for (const e of g.edges) { if (edgeSet.has(`${e.target}|${e.source}`) && e.source < e.target) circular.push({ a: e.source, b: e.target }); }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            highFanInModules: { count: highFanIn.length, modules: highFanIn.slice(0, 20) },
            highDependencyModules: { count: highDeps.length, modules: highDeps.slice(0, 20) },
            circularDependencies: { count: circular.length, pairs: circular.slice(0, 20) },
          }, null, 2),
        }],
      };
    }
  );

  // =====================================================
  // NEW TOOLS (7) — Architecture Intelligence
  // =====================================================

  // arch_health
  server.tool(
    "arch_health",
    "Get health scores for modules, repos, or layers. Scores 0-100 based on fan-out, instability, cycles, blast radius. Risk: critical (<40), warning (40-69), healthy (>=70).",
    {
      scope: z.enum(["module", "repo", "layer"]).describe("What to get health for"),
      id: z.string().optional().describe("Module ID, repo name, or layer name (omit for all)"),
      risk: z.enum(["critical", "warning", "healthy"]).optional().describe("Filter by risk level"),
      limit: z.number().int().optional().describe("Max results (default 20)"),
    },
    async ({ scope, id, risk, limit }) => {
      loadGraph();
      const a = analysisResult!;
      const max = limit || 20;

      if (scope === "module") {
        let modules = a.modules;
        if (id) modules = modules.filter(m => m.id.toLowerCase().includes(id.toLowerCase()));
        if (risk) modules = modules.filter(m => m.risk === risk);
        modules = modules.sort((a, b) => a.healthScore - b.healthScore).slice(0, max);
        return { content: [{ type: "text" as const, text: JSON.stringify({ scope: "module", count: modules.length, modules }, null, 2) }] };
      }

      if (scope === "repo") {
        let repos = a.repoMetrics;
        if (id) repos = repos.filter(r => r.repo === id);
        return { content: [{ type: "text" as const, text: JSON.stringify({ scope: "repo", repos }, null, 2) }] };
      }

      // layer
      let layers = a.layerMetrics;
      if (id) layers = layers.filter(l => l.layer === id);
      return { content: [{ type: "text" as const, text: JSON.stringify({ scope: "layer", layers }, null, 2) }] };
    }
  );

  // arch_antipatterns
  server.tool(
    "arch_antipatterns",
    "Get all detected anti-patterns: god_module, circular_dependency, layer_violation, shotgun_surgery, feature_envy, orphan_module, hub_module.",
    {
      type: z.enum(["god_module", "circular_dependency", "layer_violation", "shotgun_surgery", "feature_envy", "orphan_module", "hub_module"]).optional().describe("Filter by anti-pattern type"),
      severity: z.enum(["critical", "warning", "info"]).optional().describe("Filter by severity"),
      repo: z.string().optional().describe("Filter by repo"),
      limit: z.number().int().optional().describe("Max results (default 50)"),
    },
    async ({ type, severity, repo, limit }) => {
      loadGraph();
      const a = analysisResult!;
      const max = limit || 50;

      let patterns = a.antiPatterns;
      if (type) patterns = patterns.filter(p => p.type === type);
      if (severity) patterns = patterns.filter(p => p.severity === severity);
      if (repo) {
        const repoModules = new Set(a.modules.filter(m => m.repo === repo).map(m => m.id));
        patterns = patterns.filter(p => repoModules.has(p.moduleId));
      }

      const grouped: Record<string, number> = {};
      patterns.forEach(p => grouped[p.type] = (grouped[p.type] || 0) + 1);

      return { content: [{ type: "text" as const, text: JSON.stringify({
        total: patterns.length,
        byType: grouped,
        patterns: patterns.slice(0, max),
      }, null, 2) }] };
    }
  );

  // arch_dead_code
  server.tool(
    "arch_dead_code",
    "Find orphan modules (zero connectivity), duplicate module names, and bloat indicators.",
    {
      repo: z.string().optional().describe("Filter by repo"),
    },
    async ({ repo }) => {
      loadGraph();
      const a = analysisResult!;

      // Orphans
      let orphans = a.antiPatterns.filter(p => p.type === "orphan_module");
      if (repo) {
        const repoModules = new Set(a.modules.filter(m => m.repo === repo).map(m => m.id));
        orphans = orphans.filter(o => repoModules.has(o.moduleId));
      }

      // Duplicate names (same label in different locations)
      const labelCounts: Record<string, string[]> = {};
      for (const m of a.modules) {
        if (repo && m.repo !== repo) continue;
        if (!labelCounts[m.label]) labelCounts[m.label] = [];
        labelCounts[m.label].push(m.id);
      }
      const duplicates = Object.entries(labelCounts)
        .filter(([_, ids]) => ids.length > 1)
        .map(([label, ids]) => ({ label, count: ids.length, modules: ids }))
        .sort((a, b) => b.count - a.count);

      return { content: [{ type: "text" as const, text: JSON.stringify({
        orphans: { count: orphans.length, modules: orphans.map(o => o.moduleId) },
        duplicateNames: { count: duplicates.length, duplicates: duplicates.slice(0, 20) },
      }, null, 2) }] };
    }
  );

  // arch_impact
  server.tool(
    "arch_impact",
    "What breaks if module X changes? Shows direct dependents, transitive dependents, blast radius, cross-repo impact, and critical path.",
    {
      moduleId: z.string().describe("Module ID to analyze impact for"),
      maxDepth: z.number().int().optional().describe("Max traversal depth (default: unlimited)"),
    },
    async ({ moduleId, maxDepth }) => {
      const g = loadGraph();
      const result = computeImpact(g, moduleId, maxDepth);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // arch_metrics
  server.tool(
    "arch_metrics",
    "Raw instability, fan-in, fan-out, blast radius metrics for modules, repos, or layers.",
    {
      scope: z.enum(["module", "repo", "layer"]).describe("Scope of metrics"),
      id: z.string().optional().describe("Specific module/repo/layer ID"),
      sortBy: z.enum(["health", "instability", "fanIn", "fanOut", "blastRadius"]).optional().describe("Sort field (default: health)"),
      limit: z.number().int().optional().describe("Max results (default 20)"),
    },
    async ({ scope, id, sortBy, limit }) => {
      loadGraph();
      const a = analysisResult!;
      const max = limit || 20;
      const sort = sortBy || "health";

      if (scope === "module") {
        let modules = a.modules;
        if (id) modules = modules.filter(m => m.id.toLowerCase().includes(id.toLowerCase()));

        const sortFns: Record<string, (a: any, b: any) => number> = {
          health: (a, b) => a.healthScore - b.healthScore,
          instability: (a, b) => b.instability - a.instability,
          fanIn: (a, b) => b.fanIn - a.fanIn,
          fanOut: (a, b) => b.fanOut - a.fanOut,
          blastRadius: (a, b) => b.blastRadius - a.blastRadius,
        };
        modules = modules.sort(sortFns[sort] || sortFns.health).slice(0, max);
        return { content: [{ type: "text" as const, text: JSON.stringify({ scope: "module", sortBy: sort, count: modules.length, modules }, null, 2) }] };
      }

      if (scope === "repo") {
        return { content: [{ type: "text" as const, text: JSON.stringify({ scope: "repo", repos: a.repoMetrics }, null, 2) }] };
      }

      return { content: [{ type: "text" as const, text: JSON.stringify({ scope: "layer", layers: a.layerMetrics }, null, 2) }] };
    }
  );

  // arch_recommendations
  server.tool(
    "arch_recommendations",
    "Get prioritized, actionable recommendations for improving architecture health.",
    {
      focus: z.enum(["stability", "architecture", "cleanup"]).optional().describe("Focus area"),
      repo: z.string().optional().describe("Filter by repo"),
    },
    async ({ focus, repo }) => {
      loadGraph();
      const a = analysisResult!;
      const recs = generateRecommendations(a.modules, a.antiPatterns, a.cycles, focus, repo);
      return { content: [{ type: "text" as const, text: JSON.stringify({ count: recs.length, recommendations: recs }, null, 2) }] };
    }
  );

  // arch_validate
  server.tool(
    "arch_validate",
    "Validate a proposed dependency: check for new cycles, layer violations, and blast radius impact.",
    {
      source: z.string().describe("Source module ID"),
      target: z.string().describe("Target module ID"),
    },
    async ({ source, target }) => {
      const g = loadGraph();
      const result = validateProposedEdge(g, source, target);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // =====================================================
  // DATAPULSE TOOLS (7) — Data Intelligence
  // =====================================================

  // data_stats
  server.tool(
    "data_stats",
    "Get DataPulse summary statistics: total sources, avg health, critical/warning counts, stale sources, pipeline status, anti-pattern count.",
    {},
    async () => {
      loadDataSources();
      return { content: [{ type: "text" as const, text: JSON.stringify(dataAnalysisResult!.summary, null, 2) }] };
    }
  );

  // data_search
  server.tool(
    "data_search",
    "Search data sources by name, ID, or category. Returns matching sources with health metrics.",
    {
      query: z.string().describe("Search term (matches ID, name, type, category)"),
      category: z.string().optional().describe("Filter by category: core_infrastructure, enterprise_integration, threat_intelligence, ai_providers, knowledge_acquisition, development, market_data"),
      risk: z.enum(["critical", "warning", "healthy"]).optional().describe("Filter by risk level"),
      limit: z.number().int().optional().describe("Max results (default 20)"),
    },
    async ({ query, category, risk, limit }) => {
      loadDataSources();
      const q = query.toLowerCase();
      const max = limit || 20;

      let sources = dataAnalysisResult!.sources.filter((s) => {
        if (category && s.category !== category) return false;
        if (risk && s.risk !== risk) return false;
        return s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      }).slice(0, max);

      return { content: [{ type: "text" as const, text: JSON.stringify({ matches: sources.length, sources }, null, 2) }] };
    }
  );

  // data_source
  server.tool(
    "data_source",
    "Get full details for a specific data source: health scores, freshness, quality metrics, known issues, consuming pipelines.",
    { sourceId: z.string().describe("Data source ID (e.g. src-neo4j-aura, src-anthropic-api)") },
    async ({ sourceId }) => {
      loadDataSources();
      const ds = dataSourcesGraph!;
      const source = ds.sources.find((s) => s.id === sourceId);
      const metrics = dataAnalysisResult!.sources.find((s) => s.id === sourceId);

      if (!source || !metrics) {
        const suggestions = ds.sources.filter((s) => s.id.toLowerCase().includes(sourceId.toLowerCase())).slice(0, 5).map((s) => s.id);
        return { content: [{ type: "text" as const, text: JSON.stringify({ error: `Source "${sourceId}" not found`, suggestions }, null, 2) }] };
      }

      const pipelines = ds.pipelines.filter((p) => p.sources.includes(sourceId)).map((p) => ({ id: p.id, name: p.name, status: p.status }));

      return { content: [{ type: "text" as const, text: JSON.stringify({
        ...source, ...metrics, consumingPipelines: pipelines,
      }, null, 2) }] };
    }
  );

  // data_category
  server.tool(
    "data_category",
    "Get health metrics aggregated by data source category. Shows avg health, freshness, quality, and source counts per category.",
    { category: z.string().optional().describe("Specific category (omit for all)") },
    async ({ category }) => {
      loadDataSources();
      let cats = dataAnalysisResult!.categoryMetrics;
      if (category) cats = cats.filter((c) => c.category === category);
      return { content: [{ type: "text" as const, text: JSON.stringify({ categories: cats }, null, 2) }] };
    }
  );

  // data_pipelines
  server.tool(
    "data_pipelines",
    "Get all data pipeline metrics: status, source health, risk level. Filter by status.",
    {
      status: z.enum(["active", "degraded", "partial", "planned"]).optional().describe("Filter by pipeline status"),
    },
    async ({ status }) => {
      loadDataSources();
      let pipelines = dataAnalysisResult!.pipelineMetrics;
      if (status) pipelines = pipelines.filter((p) => p.status === status);
      return { content: [{ type: "text" as const, text: JSON.stringify({ count: pipelines.length, pipelines }, null, 2) }] };
    }
  );

  // data_quality
  server.tool(
    "data_quality",
    "Get all detected data quality anti-patterns: stale_source, low_quality, gdpr_risk, single_point_of_failure, etc.",
    {
      type: z.string().optional().describe("Filter by type: stale_source, low_quality, single_point_of_failure, no_consumers, gdpr_risk, high_issue_count, orphan_pipeline, no_monitoring"),
      severity: z.enum(["critical", "warning", "info"]).optional().describe("Filter by severity"),
    },
    async ({ type, severity }) => {
      loadDataSources();
      let patterns = dataAnalysisResult!.antiPatterns;
      if (type) patterns = patterns.filter((p) => p.type === type);
      if (severity) patterns = patterns.filter((p) => p.severity === severity);

      const grouped: Record<string, number> = {};
      patterns.forEach((p) => (grouped[p.type] = (grouped[p.type] || 0) + 1));

      return { content: [{ type: "text" as const, text: JSON.stringify({ total: patterns.length, byType: grouped, patterns }, null, 2) }] };
    }
  );

  // data_lineage
  server.tool(
    "data_lineage",
    "Get the full data lineage graph: source → pipeline → destination edges. Optionally filter by source or pipeline.",
    {
      sourceId: z.string().optional().describe("Filter lineage edges involving this source"),
      pipelineId: z.string().optional().describe("Filter lineage edges for this pipeline"),
    },
    async ({ sourceId, pipelineId }) => {
      loadDataSources();
      let edges = dataAnalysisResult!.lineage;
      if (sourceId) edges = edges.filter((e) => e.source === sourceId || e.target === sourceId);
      if (pipelineId) edges = edges.filter((e) => e.pipeline === pipelineId);
      return { content: [{ type: "text" as const, text: JSON.stringify({ edgeCount: edges.length, edges }, null, 2) }] };
    }
  );
}

// --- Create MCP server factory (one per session) ---
function createMcpServer(): McpServer {
  const server = new McpServer({ name: "widgetdc-architecture", version: "2.0.0" });
  registerTools(server);
  return server;
}

// --- HTTP Server ---
const app = express();
app.use(cors());
app.use(express.json());

// Health check (Railway requirement)
app.get("/health", (_req, res) => {
  const g = loadGraph();
  const a = analysisResult;
  let dp = null;
  try {
    loadDataSources();
    if (dataAnalysisResult) {
      dp = {
        totalSources: dataAnalysisResult.summary.totalSources,
        avgHealth: dataAnalysisResult.summary.avgHealth,
        criticalCount: dataAnalysisResult.summary.criticalCount,
        antiPatternCount: dataAnalysisResult.summary.antiPatternCount,
      };
    }
  } catch {}
  res.json({
    status: "ok",
    service: "arch-mcp-server",
    version: "3.0.0",
    graph: { nodes: g.meta.nodes, edges: g.meta.edges, generated: g.meta.generated },
    analysis: a ? {
      avgHealth: a.summary.avgHealth,
      criticalCount: a.summary.criticalCount,
      antiPatternCount: a.summary.antiPatternCount,
      cycleCount: a.summary.cycleCount,
    } : null,
    datapulse: dp,
  });
});

// --- REST API endpoints for dashboard ---
app.get("/api/analysis", (_req, res) => {
  loadGraph();
  if (!analysisResult) {
    res.status(500).json({ error: "Analysis not ready" });
    return;
  }
  res.json(analysisResult);
});

app.get("/api/impact/:moduleId", (req, res) => {
  const g = loadGraph();
  const moduleId = req.params.moduleId;
  const maxDepth = req.query.maxDepth ? parseInt(req.query.maxDepth as string, 10) : undefined;
  const result = computeImpact(g, moduleId, maxDepth);
  res.json(result);
});

// --- DataPulse REST API ---
app.get("/api/data/analysis", (_req, res) => {
  try {
    loadDataSources();
    if (!dataAnalysisResult) {
      res.status(500).json({ error: "DataPulse analysis not ready" });
      return;
    }
    res.json(dataAnalysisResult);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load data sources", message: e.message });
  }
});

app.get("/api/data/sources", (_req, res) => {
  try {
    const ds = loadDataSources();
    res.json(ds);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load data sources", message: e.message });
  }
});

app.get("/api/data/impact/:sourceId", (req, res) => {
  try {
    loadDataSources();
    const sourceId = req.params.sourceId;
    const ds = dataSourcesGraph!;
    const source = ds.sources.find((s) => s.id === sourceId);
    if (!source) {
      res.status(404).json({ error: `Source "${sourceId}" not found` });
      return;
    }

    const metrics = dataAnalysisResult!.sources.find((s) => s.id === sourceId);
    const consumingPipelines = ds.pipelines.filter((p) => p.sources.includes(sourceId));
    const affectedDestinations = consumingPipelines.flatMap((p) => p.destinations);
    const uniqueDestinations = [...new Set(affectedDestinations)];
    const destDetails = uniqueDestinations.map((did) => ds.destinations.find((d) => d.id === did)).filter(Boolean);

    res.json({
      source: { id: source.id, name: source.name, category: source.category },
      metrics,
      impact: {
        pipelinesAffected: consumingPipelines.length,
        pipelines: consumingPipelines.map((p) => ({ id: p.id, name: p.name, status: p.status })),
        destinationsAffected: destDetails.length,
        destinations: destDetails.map((d: any) => ({ id: d.id, name: d.name, type: d.type })),
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to compute impact", message: e.message });
  }
});

// --- Changelog API ---
app.get("/api/changelog", async (_req, res) => {
  try {
    const since = _req.query.since as string | undefined;
    const limit = _req.query.limit ? parseInt(_req.query.limit as string, 10) : 100;
    const repo = _req.query.repo as string | undefined;

    let result = await fetchAllChangelog(since, Math.min(limit, 500));
    let commits = result.commits;
    if (repo) commits = commits.filter((c) => c.repo === repo);

    res.json({
      commits,
      meta: {
        total: commits.length,
        fromCache: result.fromCache,
        warning: result.warning,
        repos: GITHUB_REPOS.map((r) => r.label),
      },
    });
  } catch (e: any) {
    console.error("[changelog] Error:", e);
    // Return cached data if available
    if (changelogCache) {
      res.json({
        commits: changelogCache.data,
        meta: { total: changelogCache.data.length, fromCache: true, warning: "Error fetching fresh data, showing cached results." },
      });
    } else {
      res.status(500).json({ error: "Failed to fetch changelog", message: e.message });
    }
  }
});

// --- Branches & PRs API ---
app.get("/api/branches", async (_req, res) => {
  try {
    const repo = _req.query.repo as string | undefined;
    let result = await fetchAllOpenChanges();
    let prs = result.prs;
    let branches = result.branches;
    if (repo) {
      prs = prs.filter((p) => p.repo === repo);
      branches = branches.filter((b) => b.repo === repo);
    }

    res.json({
      prs,
      branches,
      meta: {
        total_prs: prs.length,
        total_branches: branches.length,
        stale_branches: branches.filter((b) => b.isStale).length,
        fromCache: result.fromCache,
        warning: result.warning,
        repos: GITHUB_REPOS.map((r) => r.label),
      },
    });
  } catch (e: any) {
    console.error("[branches] Error:", e);
    if (branchesCache) {
      res.json({
        ...branchesCache.data,
        meta: { total_prs: branchesCache.data.prs.length, total_branches: branchesCache.data.branches.length, fromCache: true, warning: "Error fetching fresh data, showing cached results." },
      });
    } else {
      res.status(500).json({ error: "Failed to fetch branches", message: e.message });
    }
  }
});

// --- Architecture Viewers & Dashboard (static) ---
const SCRIPTS_DIR = resolve(__dirname);
const ARCH_DIR = resolve(__dirname, "../arch");

// Serve graph data at multiple paths (viewers try several)
app.get("/platform-graph.json", (_req, res) => res.sendFile(resolve(ARCH_DIR, "platform-graph.json")));
app.get("/arch/platform-graph.json", (_req, res) => res.sendFile(resolve(ARCH_DIR, "platform-graph.json")));

// Viewer routes — Dashboard is now the root
app.get("/", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-dashboard.html")));
app.get("/dashboard", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-dashboard.html")));
app.get("/graph", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-viewer.html")));
app.get("/overview", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-viewer-overview.html")));
app.get("/changelog", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-changelog.html")));
app.get("/branches", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-branches.html")));
app.get("/analysis-report", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-analysis.html")));
// Support original filenames as links (used in view toggle buttons)
app.get("/arch-viewer.html", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-viewer.html")));
app.get("/arch-viewer-overview.html", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-viewer-overview.html")));
app.get("/arch-dashboard.html", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-dashboard.html")));
app.get("/arch-changelog.html", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-changelog.html")));
app.get("/arch-branches.html", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-branches.html")));
app.get("/arch-analysis.html", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "arch-analysis.html")));

// DataPulse views
app.get("/data", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "data-dashboard.html")));
app.get("/data/lineage", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "data-lineage.html")));
app.get("/data-dashboard.html", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "data-dashboard.html")));
app.get("/data-lineage.html", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "data-lineage.html")));

// Infrastructure views
app.get("/infra", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "infra-dashboard.html")));
app.get("/infra-dashboard.html", (_req, res) => res.sendFile(resolve(SCRIPTS_DIR, "infra-dashboard.html")));

// --- Monitoring REST API ---
app.get("/api/monitoring/infrastructure", (_req, res) => {
  try {
    res.json(getInfrastructure());
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get infrastructure", message: e.message });
  }
});

app.get("/api/monitoring/alerts", (req, res) => {
  try {
    const filters = {
      severity: req.query.severity as string | undefined,
      status: req.query.status as string | undefined,
      serviceId: req.query.serviceId as string | undefined,
      projectId: req.query.projectId as string | undefined,
    };
    res.json(getAlerts(filters));
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get alerts", message: e.message });
  }
});

app.post("/api/monitoring/alerts/:id/acknowledge", (req, res) => {
  try {
    const result = ackAlert(req.params.id);
    if (!result) {
      res.status(404).json({ error: "Alert not found or already resolved" });
      return;
    }
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to acknowledge alert", message: e.message });
  }
});

app.get("/api/monitoring/anomalies", (_req, res) => {
  try {
    res.json(getAnomalies());
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get anomalies", message: e.message });
  }
});

app.get("/api/monitoring/cost", (_req, res) => {
  try {
    res.json(getCost());
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get cost data", message: e.message });
  }
});

app.get("/api/monitoring/cost-forecast", (_req, res) => {
  try {
    res.json(getCostForecast());
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get forecast", message: e.message });
  }
});

app.get("/api/monitoring/compliance", (_req, res) => {
  try {
    res.json(getCompliance());
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get compliance", message: e.message });
  }
});

app.get("/api/monitoring/compliance/:id", (req, res) => {
  try {
    const result = getComplianceRequirement(req.params.id);
    if (!result) {
      res.status(404).json({ error: `Requirement "${req.params.id}" not found` });
      return;
    }
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get requirement", message: e.message });
  }
});

app.get("/api/monitoring/rules", (_req, res) => {
  try {
    res.json(getRules());
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get rules", message: e.message });
  }
});

app.get("/api/monitoring/errors", (_req, res) => {
  try {
    res.json({ errors: getErrors() });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get errors", message: e.message });
  }
});

// --- SSE real-time updates ---
app.get("/api/monitoring/sse", sseHandler);

// --- Service detail routes ---
app.get("/api/monitoring/services/:id", async (req, res) => {
  try {
    const detail = await getServiceDetail(req.params.id);
    if (!detail) {
      res.status(404).json({ error: `Service "${req.params.id}" not found` });
      return;
    }
    res.json(detail);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get service detail", message: e.message });
  }
});

app.get("/api/monitoring/services/:id/probes", (req, res) => {
  try {
    const hours = req.query.hours ? parseInt(req.query.hours as string, 10) : 24;
    const probes = getServiceProbes(req.params.id, hours);
    res.json({ probes });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get probes", message: e.message });
  }
});

app.get("/api/monitoring/services/:id/sla", (req, res) => {
  try {
    const sla = getServiceSLA(req.params.id);
    if (!sla) {
      res.status(404).json({ error: `Service "${req.params.id}" not found` });
      return;
    }
    res.json({ sla });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get SLA", message: e.message });
  }
});

// --- Incident routes ---
app.get("/api/monitoring/incidents", (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    res.json({ incidents: getIncidents(status ? { status } : undefined) });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get incidents", message: e.message });
  }
});

app.get("/api/monitoring/incidents/:id", (req, res) => {
  try {
    const incident = getIncident(req.params.id);
    if (!incident) {
      res.status(404).json({ error: `Incident "${req.params.id}" not found` });
      return;
    }
    res.json(incident);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to get incident", message: e.message });
  }
});

// --- Rule CRUD routes ---
app.post("/api/monitoring/rules", async (req, res) => {
  try {
    const rule = req.body;
    if (!rule || !rule.id || !rule.name || !rule.metric || !rule.condition) {
      res.status(400).json({ error: "Invalid rule: requires id, name, metric, condition, threshold, severity" });
      return;
    }
    const result = await createOrUpdateRule({
      id: rule.id,
      name: rule.name,
      metric: rule.metric,
      condition: rule.condition,
      threshold: rule.threshold ?? 0,
      durationMinutes: rule.durationMinutes ?? 0,
      severity: rule.severity ?? "medium",
      enabled: rule.enabled !== false,
    });
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to save rule", message: e.message });
  }
});

app.delete("/api/monitoring/rules/:id", async (req, res) => {
  try {
    const deleted = await removeRule(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: `Rule "${req.params.id}" not found` });
      return;
    }
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to delete rule", message: e.message });
  }
});

// Store active transports
const transports: Record<string, SSEServerTransport | StreamableHTTPServerTransport> = {};

// =============================================================
// Streamable HTTP transport (protocol 2025-11-25) — /mcp
// =============================================================
app.all("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    const existing = transports[sessionId];
    if (existing instanceof StreamableHTTPServerTransport) {
      transport = existing;
    } else {
      res.status(400).json({ jsonrpc: "2.0", error: { code: -32000, message: "Session uses different transport" }, id: null });
      return;
    }
  } else if (!sessionId && req.method === "POST" && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        console.log(`[arch-mcp] StreamableHTTP session: ${sid}`);
        transports[sid] = transport;
      },
    });
    transport.onclose = () => {
      const sid = transport.sessionId;
      if (sid && transports[sid]) delete transports[sid];
    };
    const server = createMcpServer();
    await server.connect(transport);
  } else {
    res.status(400).json({ jsonrpc: "2.0", error: { code: -32000, message: "No valid session" }, id: null });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

// =============================================================
// Legacy SSE transport (protocol 2024-11-05) — /sse + /messages
// =============================================================
app.get("/sse", async (req, res) => {
  console.log(`[arch-mcp] SSE connection from ${req.ip}`);
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;
  res.on("close", () => { delete transports[transport.sessionId]; });
  const server = createMcpServer();
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (transport instanceof SSEServerTransport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send("No SSE transport for sessionId");
  }
});

// --- Start ---
const PORT = parseInt(process.env.PORT || "3100", 10);

// Pre-load graph + data sources
loadGraph();
try { loadDataSources(); } catch (e: any) { console.warn(`[datapulse] Failed to pre-load: ${e.message}`); }

// Initialize infrastructure monitoring (polling loop + DB)
initMonitoring().catch((e: any) => console.warn(`[monitoring] Failed to init: ${e.message}`));

app.listen(PORT, () => {
  console.log(`[arch-mcp] HTTP server listening on port ${PORT}`);
  console.log(`[arch-mcp] Dashboard:  http://localhost:${PORT}/`);
  console.log(`[arch-mcp] Graph:      http://localhost:${PORT}/graph`);
  console.log(`[arch-mcp] Overview:   http://localhost:${PORT}/overview`);
  console.log(`[arch-mcp] DataPulse:  http://localhost:${PORT}/data`);
  console.log(`[arch-mcp] Lineage:    http://localhost:${PORT}/data/lineage`);
  console.log(`[arch-mcp] Infra:      http://localhost:${PORT}/infra`);
  console.log(`[arch-mcp] Changelog:  http://localhost:${PORT}/changelog`);
  console.log(`[arch-mcp] Branches:   http://localhost:${PORT}/branches`);
  console.log(`[arch-mcp] Analysis:   http://localhost:${PORT}/analysis-report`);
  console.log(`[arch-mcp] API Arch:   http://localhost:${PORT}/api/analysis`);
  console.log(`[arch-mcp] API Data:   http://localhost:${PORT}/api/data/analysis`);
  console.log(`[arch-mcp] API Infra:  http://localhost:${PORT}/api/monitoring/infrastructure`);
  console.log(`[arch-mcp] Health:     http://localhost:${PORT}/health`);
  console.log(`[arch-mcp] SSE:        http://localhost:${PORT}/sse`);
  console.log(`[arch-mcp] MCP:        http://localhost:${PORT}/mcp`);
});

process.on("SIGINT", async () => {
  stopMonitoring();
  for (const sid in transports) {
    try { await transports[sid].close(); } catch {}
    delete transports[sid];
  }
  process.exit(0);
});
