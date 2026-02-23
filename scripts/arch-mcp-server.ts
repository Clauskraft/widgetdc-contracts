#!/usr/bin/env npx tsx
/**
 * Architecture Graph MCP Server
 *
 * Exposes the WidgeTDC platform architecture graph via MCP tools.
 * Reads platform-graph.json and provides search, stats, dependency
 * queries, and cross-repo edge analysis.
 *
 * Usage:
 *   npx tsx scripts/arch-mcp-server.ts
 *
 * Claude Code config (~/.claude/settings.json):
 *   "mcpServers": {
 *     "architecture": {
 *       "command": "npx",
 *       "args": ["tsx", "C:/Users/claus/Projects/widgetdc-contracts/scripts/arch-mcp-server.ts"]
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// --- Resolve graph path ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const GRAPH_PATHS = [
  resolve(__dirname, "../arch/platform-graph.json"),
  resolve(__dirname, "../../arch/platform-graph.json"),
];

interface GraphNode {
  id: string;
  repo: string;
  layer: string;
  path: string;
  label: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: "import" | "http" | "contract";
}

interface PlatformGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta: { generated: string; repos: number; nodes: number; edges: number };
}

// --- Load graph ---
let graph: PlatformGraph | null = null;
let fanIn: Record<string, number> = {};
let depCount: Record<string, number> = {};

function loadGraph(): PlatformGraph {
  if (graph) return graph;

  for (const p of GRAPH_PATHS) {
    if (existsSync(p)) {
      graph = JSON.parse(readFileSync(p, "utf-8"));
      console.error(`[arch-mcp] Loaded graph from ${p}`);
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

  return graph;
}

// --- Create MCP server ---
const server = new McpServer({
  name: "widgetdc-architecture",
  version: "1.0.0",
});

// ============================================================
// Tool: arch.stats
// ============================================================
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
            {
              generated: g.meta.generated,
              totalNodes: g.meta.nodes,
              totalEdges: g.meta.edges,
              repos,
              layers,
              edgeTypes,
              topModulesByFanIn: topByFanIn,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ============================================================
// Tool: arch.search
// ============================================================
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
        return (
          n.id.toLowerCase().includes(q) ||
          n.label.toLowerCase().includes(q) ||
          n.path.toLowerCase().includes(q)
        );
      })
      .slice(0, max)
      .map((n) => ({
        id: n.id,
        repo: n.repo,
        layer: n.layer,
        path: n.path,
        fanIn: fanIn[n.id] || 0,
        dependencies: depCount[n.id] || 0,
      }));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ matches: results.length, results }, null, 2),
        },
      ],
    };
  }
);

// ============================================================
// Tool: arch.module
// ============================================================
server.tool(
  "arch_module",
  "Get full details for a specific module: metadata, dependencies, dependents, and cross-repo connections.",
  {
    moduleId: z.string().describe("Canonical module ID (e.g. backend.services.neo4jService)"),
  },
  async ({ moduleId }) => {
    const g = loadGraph();
    const node = g.nodes.find((n) => n.id === moduleId);

    if (!node) {
      // Try partial match
      const candidates = g.nodes
        .filter((n) => n.id.toLowerCase().includes(moduleId.toLowerCase()))
        .slice(0, 5);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: `Module "${moduleId}" not found`,
                suggestions: candidates.map((c) => c.id),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    const deps = g.edges
      .filter((e) => e.source === moduleId)
      .map((e) => ({ target: e.target, type: e.type }));

    const dependents = g.edges
      .filter((e) => e.target === moduleId)
      .map((e) => ({ source: e.source, type: e.type }));

    const crossRepo = [...deps, ...dependents].filter((e) => {
      const otherId = "target" in e ? e.target : (e as any).source;
      const other = g.nodes.find((n) => n.id === otherId);
      return other && other.repo !== node.repo;
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              id: node.id,
              repo: node.repo,
              layer: node.layer,
              path: node.path,
              label: node.label,
              fanIn: fanIn[moduleId] || 0,
              dependencyCount: deps.length,
              dependentCount: dependents.length,
              crossRepoConnections: crossRepo.length,
              dependencies: deps,
              dependents,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ============================================================
// Tool: arch.layer
// ============================================================
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
      .filter((n) => {
        if (n.layer !== layer) return false;
        if (repo && n.repo !== repo) return false;
        return true;
      })
      .map((n) => ({
        id: n.id,
        repo: n.repo,
        label: n.label,
        fanIn: fanIn[n.id] || 0,
        dependencies: depCount[n.id] || 0,
      }))
      .sort((a, b) => b.fanIn - a.fanIn);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              layer,
              repo: repo || "all",
              count: modules.length,
              modules,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ============================================================
// Tool: arch.cross_repo
// ============================================================
server.tool(
  "arch_cross_repo",
  "Show all cross-repo edges: which modules connect across repository boundaries, grouped by repo pair.",
  {
    edgeType: z
      .enum(["all", "import", "http", "contract"])
      .optional()
      .describe("Filter by edge type (default: all)"),
  },
  async ({ edgeType }) => {
    const g = loadGraph();
    const nodeRepo: Record<string, string> = {};
    g.nodes.forEach((n) => (nodeRepo[n.id] = n.repo));

    const crossEdges = g.edges.filter((e) => {
      if (edgeType && edgeType !== "all" && e.type !== edgeType) return false;
      return nodeRepo[e.source] && nodeRepo[e.target] && nodeRepo[e.source] !== nodeRepo[e.target];
    });

    // Group by repo pair
    const pairs: Record<string, { count: number; types: Record<string, number>; examples: { source: string; target: string; type: string }[] }> = {};
    for (const e of crossEdges) {
      const key = [nodeRepo[e.source], nodeRepo[e.target]].sort().join(" <-> ");
      if (!pairs[key]) pairs[key] = { count: 0, types: {}, examples: [] };
      pairs[key].count++;
      pairs[key].types[e.type] = (pairs[key].types[e.type] || 0) + 1;
      if (pairs[key].examples.length < 5) {
        pairs[key].examples.push({ source: e.source, target: e.target, type: e.type });
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              totalCrossRepoEdges: crossEdges.length,
              repoPairs: pairs,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ============================================================
// Tool: arch.depends_on
// ============================================================
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
      // BFS for transitive dependents
      const visited = new Set<string>();
      const queue = [moduleId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);
        g.edges
          .filter((e) => e.target === current)
          .forEach((e) => {
            if (!visited.has(e.source)) queue.push(e.source);
          });
      }
      visited.delete(moduleId);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                moduleId,
                transitive: true,
                dependentCount: visited.size,
                dependents: [...visited].sort(),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Direct dependents only
    const dependents = g.edges
      .filter((e) => e.target === moduleId)
      .map((e) => ({ source: e.source, type: e.type }));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              moduleId,
              transitive: false,
              dependentCount: dependents.length,
              dependents,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ============================================================
// Tool: arch.hotspots
// ============================================================
server.tool(
  "arch_hotspots",
  "Identify architectural hotspots: high fan-in modules, high dependency modules, and potential circular dependencies.",
  {},
  async () => {
    const g = loadGraph();

    const highFanIn = Object.entries(fanIn)
      .filter(([_, v]) => v >= 5)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => {
        const n = g.nodes.find((n) => n.id === id);
        return { id, repo: n?.repo, layer: n?.layer, fanIn: count };
      });

    const highDeps = Object.entries(depCount)
      .filter(([_, v]) => v >= 10)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => {
        const n = g.nodes.find((n) => n.id === id);
        return { id, repo: n?.repo, layer: n?.layer, dependencies: count };
      });

    // Detect simple circular deps (A→B and B→A)
    const edgeSet = new Set(g.edges.map((e) => `${e.source}|${e.target}`));
    const circular: { a: string; b: string }[] = [];
    for (const e of g.edges) {
      if (edgeSet.has(`${e.target}|${e.source}`) && e.source < e.target) {
        circular.push({ a: e.source, b: e.target });
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              highFanInModules: { count: highFanIn.length, modules: highFanIn.slice(0, 20) },
              highDependencyModules: { count: highDeps.length, modules: highDeps.slice(0, 20) },
              circularDependencies: { count: circular.length, pairs: circular.slice(0, 20) },
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ============================================================
// Start server
// ============================================================
async function main() {
  // Pre-load graph to fail fast
  loadGraph();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[arch-mcp] Server running on stdio");
}

main().catch((err) => {
  console.error("[arch-mcp] Fatal:", err);
  process.exit(1);
});
