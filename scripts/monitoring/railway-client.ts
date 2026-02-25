/**
 * Railway GraphQL API Client
 *
 * Authenticates with RAILWAY_API_TOKEN and fetches service status,
 * metrics, and usage data from two Railway projects.
 */

import type { RailwayService, ServiceMetric, CostEntry, Deployment } from "./types.js";

const RAILWAY_GQL = "https://backboard.railway.app/graphql/v2";

export const PROJECT_IDS = [
  process.env.RAILWAY_PROJECT_1 || "7f5fd3c8-2f76-44a7-b6e4-7a86b2a3dabb",
  process.env.RAILWAY_PROJECT_2 || "c00efc7c-d93b-4804-a7fa-764a2dbd0055",
];

// ---------------------------------------------------------------------------
// GraphQL helper with retry + circuit breaker
// ---------------------------------------------------------------------------
let consecutiveFailures = 0;
const CIRCUIT_OPEN_THRESHOLD = 25;
const CIRCUIT_RESET_MS = 60_000;
let circuitOpenUntil = 0;

async function gql<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const token = process.env.RAILWAY_API_TOKEN;
  if (!token) throw new Error("RAILWAY_API_TOKEN not set");

  if (Date.now() < circuitOpenUntil) {
    throw new Error("Circuit breaker open — Railway API temporarily unavailable");
  }

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);

      const res = await fetch(RAILWAY_GQL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Railway API ${res.status}: ${text.slice(0, 200)}`);
      }

      const json = await res.json();
      if (json.errors?.length) {
        throw new Error(`Railway GQL: ${json.errors[0].message}`);
      }

      consecutiveFailures = 0;
      return json.data as T;
    } catch (err: any) {
      lastErr = err;
      if (attempt < 2) await sleep(1000 * (attempt + 1));
    }
  }

  consecutiveFailures++;
  if (consecutiveFailures >= CIRCUIT_OPEN_THRESHOLD) {
    circuitOpenUntil = Date.now() + CIRCUIT_RESET_MS;
    console.error("[monitoring] Circuit breaker OPEN for 60s");
  }
  throw lastErr!;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Status mapping
// ---------------------------------------------------------------------------
function mapStatus(s: string | undefined): RailwayService["status"] {
  switch (s?.toUpperCase()) {
    case "SUCCESS":
    case "ACTIVE":
      return "active";
    case "DEPLOYING":
      return "deploying";
    case "BUILDING":
      return "building";
    case "CRASHED":
    case "FAILED":
      return "crashed";
    case "REMOVED":
      return "removed";
    default:
      return "unknown";
  }
}

// ---------------------------------------------------------------------------
// Fetch all services from both projects
// ---------------------------------------------------------------------------
export async function fetchServices(): Promise<RailwayService[]> {
  const all: RailwayService[] = [];

  for (const projectId of PROJECT_IDS) {
    try {
      const data = await gql<any>(
        `query($id: String!) {
          project(id: $id) {
            name
            services {
              edges {
                node {
                  id
                  name
                  updatedAt
                  deployments(first: 1) {
                    edges {
                      node {
                        status
                        createdAt
                        staticUrl
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
        { id: projectId }
      );

      const project = data.project;
      if (!project) continue;

      for (const edge of project.services.edges) {
        const svc = edge.node;
        const dep = svc.deployments?.edges?.[0]?.node;
        all.push({
          id: svc.id,
          name: svc.name,
          projectId,
          projectName: project.name,
          status: dep ? mapStatus(dep.status) : "unknown",
          lastDeployAt: dep?.createdAt || null,
          url: dep?.staticUrl ? (dep.staticUrl.startsWith("http") ? dep.staticUrl : `https://${dep.staticUrl}`) : null,
          cpu: 0,
          memory: 0,
          uptime: dep?.status === "SUCCESS" || dep?.status === "ACTIVE" ? 100 : 0,
        });
      }
    } catch (err: any) {
      console.error(`[monitoring] Project ${projectId}: ${err.message}`);
    }
  }

  return all;
}

// ---------------------------------------------------------------------------
// Fetch metrics for a service (best-effort — Railway API may limit access)
// ---------------------------------------------------------------------------
export async function fetchMetrics(
  serviceId: string,
  projectId: string
): Promise<ServiceMetric | null> {
  try {
    const end = new Date().toISOString();
    const start = new Date(Date.now() - 10 * 60_000).toISOString();

    const data = await gql<any>(
      `query($serviceId: String!, $projectId: String!) {
        metrics(
          serviceId: $serviceId
          projectId: $projectId
          measurements: [CPU_USAGE, MEMORY_USAGE, NETWORK_RX, NETWORK_TX]
          startDate: "${start}"
          endDate: "${end}"
        ) {
          measurement
          values { ts value }
        }
      }`,
      { serviceId, projectId }
    );

    if (!data.metrics?.length) return null;

    const latest: Record<string, number> = {};
    for (const m of data.metrics) {
      const vals = m.values;
      if (vals?.length) latest[m.measurement] = vals[vals.length - 1].value;
    }

    return {
      timestamp: new Date().toISOString(),
      serviceId,
      projectId,
      cpu: latest["CPU_USAGE"] ?? 0,
      memory: latest["MEMORY_USAGE"] ?? 0,
      networkRx: latest["NETWORK_RX"] ?? 0,
      networkTx: latest["NETWORK_TX"] ?? 0,
    };
  } catch {
    // Metrics may not be available on all plans
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fetch usage / cost data for a project
// ---------------------------------------------------------------------------
export async function fetchUsage(projectId: string): Promise<CostEntry[]> {
  try {
    const data = await gql<any>(
      `query($id: String!) {
        project(id: $id) {
          name
          services {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }`,
      { id: projectId }
    );

    const project = data.project;
    if (!project) return [];

    const services = project.services?.edges ?? [];
    const today = new Date().toISOString().slice(0, 10);

    return services.map((e: any) => ({
      date: today,
      projectId,
      serviceId: e.node.id,
      serviceName: e.node.name,
      amount: 0,
    }));
  } catch (err: any) {
    console.error(`[monitoring] Usage fetch for ${projectId}: ${err.message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Fetch deployment history for a service (last N deployments)
// ---------------------------------------------------------------------------
export async function fetchDeployments(
  serviceId: string,
  limit: number = 5
): Promise<Deployment[]> {
  try {
    const data = await gql<any>(
      `query($serviceId: String!, $first: Int!) {
        deployments(
          input: { serviceId: $serviceId }
          first: $first
        ) {
          edges {
            node {
              id
              status
              createdAt
              meta {
                repo
                branch
                commitMessage
                commitAuthor
                image
              }
            }
          }
        }
      }`,
      { serviceId, first: limit }
    );

    const edges = data.deployments?.edges ?? [];
    return edges.map((e: any) => ({
      id: e.node.id,
      status: e.node.status,
      createdAt: e.node.createdAt,
      meta: e.node.meta ?? undefined,
    }));
  } catch (err: any) {
    console.error(`[monitoring] Deployments for ${serviceId}: ${err.message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Health-probe services directly (fallback when Railway metrics unavailable)
// ---------------------------------------------------------------------------
export async function probeServiceHealth(url: string): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const res = await fetch(url.replace(/\/$/, "") + "/health", { signal: controller.signal });
    clearTimeout(timeout);
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
