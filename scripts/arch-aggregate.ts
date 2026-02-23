#!/usr/bin/env npx tsx
/**
 * Architecture Graph Aggregator
 *
 * Merges dependency-cruiser (TS/JS) and pydeps (Python) JSON outputs
 * into a unified platform graph with canonical IDs.
 *
 * Run from widgetdc-contracts repo root:
 *   npx tsx scripts/arch-aggregate.ts
 *
 * Or with explicit paths:
 *   npx tsx scripts/arch-aggregate.ts --backend ../WidgeTDC_fresh/arch/backend-graph.json ...
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

// --- Types ---

interface DepCruiserModule {
  source: string;
  dependencies: { resolved: string; module: string; dependencyTypes?: string[] }[];
  orphan?: boolean;
  valid?: boolean;
}

interface DepCruiserOutput {
  modules: DepCruiserModule[];
  summary?: unknown;
}

interface RlmNode {
  id: string;
  path: string;
  deps: string[];
}

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
  meta: {
    generated: string;
    repos: number;
    nodes: number;
    edges: number;
  };
}

// --- Canonical ID generation ---

function inferLayer(filePath: string): string {
  const parts = filePath.replace(/\\/g, "/").toLowerCase();
  if (parts.includes("/routes/")) return "routes";
  if (parts.includes("/services/")) return "services";
  if (parts.includes("/mcp/")) return "mcp";
  if (parts.includes("/controllers/")) return "controllers";
  if (parts.includes("/middleware/")) return "middleware";
  if (parts.includes("/platform/")) return "platform";
  if (parts.includes("/domain/")) return "domain";
  if (parts.includes("/pages/")) return "pages";
  if (parts.includes("/components/")) return "components";
  if (parts.includes("/store/") || parts.includes("/stores/")) return "store";
  if (parts.includes("/hooks/")) return "hooks";
  if (parts.includes("/types/")) return "types";
  if (parts.includes("/lib/")) return "lib";
  if (parts.includes("/utils/")) return "utils";
  if (parts.includes("/config")) return "config";
  if (parts.includes("/contracts/")) return "contracts";
  if (parts.includes("/intelligence/")) return "intelligence";
  if (parts.includes("/context_folding/")) return "context_folding";
  if (parts.includes("/models/")) return "models";
  if (parts.includes("/packages/")) return "packages";
  if (parts.includes("/adapters/")) return "adapters";
  if (parts.includes("/integrations/")) return "integrations";
  if (parts.includes("/bootstrap/")) return "bootstrap";
  return "core";
}

function fileToCanonicalId(repo: string, filePath: string): string {
  let normalized = filePath.replace(/\\/g, "/");

  // Strip common prefixes
  normalized = normalized
    .replace(/^(apps\/backend\/)?src\//, "")
    .replace(/^src\//, "")
    .replace(/^packages\//, "packages.");

  // Strip extensions
  normalized = normalized.replace(/\.(ts|tsx|js|jsx|py)$/, "");

  // Strip /index suffix
  normalized = normalized.replace(/\/index$/, "");

  // Convert path separators to dots
  normalized = normalized.replace(/\//g, ".");

  return `${repo}.${normalized}`;
}

function makeLabel(id: string): string {
  const parts = id.split(".");
  return parts[parts.length - 1] || id;
}

// --- Parsers ---

function parseDepCruiser(
  jsonPath: string,
  repo: string
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const raw: DepCruiserOutput = JSON.parse(readFileSync(jsonPath, "utf-8"));
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  for (const mod of raw.modules) {
    // Skip node_modules and Node.js builtins
    if (mod.source.includes("node_modules")) continue;
    if (!mod.source.includes("/") && !mod.source.includes("\\")) continue;

    const id = fileToCanonicalId(repo, mod.source);
    if (!seen.has(id)) {
      seen.add(id);
      nodes.push({
        id,
        repo,
        layer: inferLayer(mod.source),
        path: mod.source,
        label: makeLabel(id),
      });
    }

    for (const dep of mod.dependencies) {
      if (!dep.resolved || dep.resolved.includes("node_modules")) continue;
      if (!dep.resolved.includes("/") && !dep.resolved.includes("\\")) continue;
      const targetId = fileToCanonicalId(repo, dep.resolved);
      if (!seen.has(targetId)) {
        seen.add(targetId);
        nodes.push({
          id: targetId,
          repo,
          layer: inferLayer(dep.resolved),
          path: dep.resolved,
          label: makeLabel(targetId),
        });
      }
      edges.push({ source: id, target: targetId, type: "import" });
    }
  }

  return { nodes, edges };
}

function parseRlmGraph(
  jsonPath: string
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const raw: RlmNode[] = JSON.parse(readFileSync(jsonPath, "utf-8"));
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  for (const mod of raw) {
    if (!seen.has(mod.id)) {
      seen.add(mod.id);
      nodes.push({
        id: mod.id,
        repo: "rlm",
        layer: inferLayer(mod.path),
        path: mod.path,
        label: makeLabel(mod.id),
      });
    }

    for (const dep of mod.deps) {
      edges.push({ source: mod.id, target: dep, type: "import" });
    }
  }

  return { nodes, edges };
}

// --- Cross-repo edges ---

function addCrossRepoEdges(nodes: GraphNode[], edges: GraphEdge[]): void {
  // HTTP edges: frontend -> backend (API proxy)
  const frontendServices = nodes.filter((n) => n.id.startsWith("frontend.services"));
  const backendRoutes = nodes.filter((n) => n.id.startsWith("backend.routes"));
  for (const svc of frontendServices) {
    for (const route of backendRoutes) {
      edges.push({ source: svc.id, target: route.id, type: "http" });
    }
  }

  // HTTP edges: backend -> rlm (compute proxy)
  const computeRoutes = nodes.filter(
    (n) => n.id.includes("compute") && n.repo === "backend"
  );
  const rlmRoutes = nodes.filter((n) => n.repo === "rlm" && n.layer === "routes");
  for (const cr of computeRoutes) {
    for (const rr of rlmRoutes) {
      edges.push({ source: cr.id, target: rr.id, type: "http" });
    }
  }

  // Contract edges: backend contracts -> contracts repo
  const contractNodes = nodes.filter((n) => n.repo === "contracts");
  const backendContracts = nodes.filter(
    (n) => n.repo === "backend" && n.id.includes("contracts")
  );
  for (const bc of backendContracts) {
    for (const cn of contractNodes) {
      edges.push({ source: bc.id, target: cn.id, type: "contract" });
    }
  }

  // Contract edges: frontend types -> contracts
  const frontendTypes = nodes.filter(
    (n) => n.repo === "frontend" && n.layer === "types"
  );
  for (const ft of frontendTypes) {
    for (const cn of contractNodes) {
      edges.push({ source: ft.id, target: cn.id, type: "contract" });
    }
  }

  // Contract edges: rlm contracts -> contracts repo
  const rlmContracts = nodes.filter(
    (n) => n.repo === "rlm" && n.id.includes("contracts")
  );
  for (const rc of rlmContracts) {
    for (const cn of contractNodes) {
      edges.push({ source: rc.id, target: cn.id, type: "contract" });
    }
  }
}

// --- Main ---

function main(): void {
  const args = process.argv.slice(2);

  function getArg(flag: string, fallback: string): string {
    const idx = args.indexOf(flag);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  }

  // Default paths assume sibling repos: ../WidgeTDC_fresh, ../widgetdc-consulting-frontend, ../widgetdc-rlm-engine
  const backendPath = getArg("--backend", "../WidgeTDC_fresh/arch/backend-graph.json");
  const frontendPath = getArg("--frontend", "../widgetdc-consulting-frontend/arch/frontend-graph.json");
  const contractsPath = getArg("--contracts", "arch/contracts-graph.json");
  const rlmPath = getArg("--rlm", "../widgetdc-rlm-engine/arch/rlm-graph.json");
  const outPath = getArg("--out", "arch/platform-graph.json");

  const allNodes: GraphNode[] = [];
  const allEdges: GraphEdge[] = [];
  let repoCount = 0;

  const sources: { path: string; repo: string; parser: "depcruiser" | "rlm" }[] = [
    { path: backendPath, repo: "backend", parser: "depcruiser" },
    { path: frontendPath, repo: "frontend", parser: "depcruiser" },
    { path: contractsPath, repo: "contracts", parser: "depcruiser" },
    { path: rlmPath, repo: "rlm", parser: "rlm" },
  ];

  for (const src of sources) {
    const absPath = resolve(src.path);
    if (!existsSync(absPath)) {
      console.warn(`[skip] ${src.repo}: ${absPath} not found`);
      continue;
    }
    console.log(`[parse] ${src.repo}: ${absPath}`);
    const { nodes, edges } =
      src.parser === "rlm"
        ? parseRlmGraph(absPath)
        : parseDepCruiser(absPath, src.repo);
    allNodes.push(...nodes);
    allEdges.push(...edges);
    repoCount++;
  }

  // Deduplicate nodes by id
  const nodeMap = new Map<string, GraphNode>();
  for (const n of allNodes) {
    if (!nodeMap.has(n.id)) nodeMap.set(n.id, n);
  }
  const dedupedNodes = Array.from(nodeMap.values());

  // Deduplicate edges
  const edgeSet = new Set<string>();
  const dedupedEdges: GraphEdge[] = [];
  for (const e of allEdges) {
    const key = `${e.source}|${e.target}|${e.type}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      dedupedEdges.push(e);
    }
  }

  // Add cross-repo edges
  addCrossRepoEdges(dedupedNodes, dedupedEdges);

  const graph: PlatformGraph = {
    nodes: dedupedNodes,
    edges: dedupedEdges,
    meta: {
      generated: new Date().toISOString(),
      repos: repoCount,
      nodes: dedupedNodes.length,
      edges: dedupedEdges.length,
    },
  };

  const outDir = dirname(outPath);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  writeFileSync(outPath, JSON.stringify(graph, null, 2));
  console.log(
    `\n[done] ${graph.meta.nodes} nodes, ${graph.meta.edges} edges from ${repoCount} repos -> ${outPath}`
  );
}

main();
