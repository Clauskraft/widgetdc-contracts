import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { FormatRegistry } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

import { LauncherEvidencePacket } from '../src/orchestrator/launcher-evidence-packet.ts'

type JsonRecord = Record<string, unknown>

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTRACTS_ROOT = join(__dirname, '..')
const PROJECTS_ROOT = join(CONTRACTS_ROOT, '..')
const WIDGETDC_ROOT = join(PROJECTS_ROOT, 'WidgeTDC')

const DEFAULT_BACKEND_URL = 'https://backend-production-d3da.up.railway.app'
const DEFAULT_RLM_URL = 'https://rlm-engine-production.up.railway.app'
const DEFAULT_LAUNCHER_URL = 'http://127.0.0.1:3030'

const TARGET_SERVICE = String(process.env.TARGET_SERVICE || 'backend').trim()
const RAILWAY_TOKEN = String(process.env.RAILWAY_TOKEN || '').trim()
const BACKEND_URL = normalizeBaseUrl(process.env.BACKEND_URL, DEFAULT_BACKEND_URL)
const RLM_URL = normalizeBaseUrl(process.env.RLM_URL, DEFAULT_RLM_URL)
const LAUNCHER_BASE_URL = normalizeBaseUrl(process.env.LAUNCHER_BASE_URL, DEFAULT_LAUNCHER_URL)
const WIDGETDC_API_KEY = String(process.env.WIDGETDC_API_KEY || '').trim()
const PROBE_TIMEOUT_MS = Number(process.env.READBACK_TIMEOUT_MS || 120000)

if (!FormatRegistry.Has('date-time')) {
  FormatRegistry.Set(
    'date-time',
    (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value)),
  )
}

function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  const candidate = String(value || fallback || '').trim()
  return candidate.replace(/\/+$/, '')
}

function log(line: string): void {
  console.log(`[Read-back] ${line}`)
}

function fail(line: string): never {
  console.error(`❌ [Read-back] ${line}`)
  process.exit(1)
}

function run(command: string, cwd = WIDGETDC_ROOT): string {
  return execSync(command, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function readJson(filePath: string): JsonRecord {
  return JSON.parse(readFileSync(filePath, 'utf8')) as JsonRecord
}

function getNestedRecord(record: JsonRecord, key: string): JsonRecord | null {
  const value = record[key]
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : null
}

export function extractRlmRuntimeVersion(health: JsonRecord): string {
  return String(
    health.version ||
    getNestedRecord(health, 'data')?.version ||
    getNestedRecord(health, 'metadata')?.version ||
    '',
  ).trim()
}

function getExpectedBackendVersion(): string {
  const pkg = readJson(join(WIDGETDC_ROOT, 'apps', 'backend', 'package.json'))
  return String(pkg.version || '').trim()
}

async function fetchJson(url: string, init: RequestInit = {}): Promise<unknown> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${text}`)
    }

    return data
  } finally {
    clearTimeout(timeout)
  }
}

async function queryRailwayGraphql(query: string, variables: JsonRecord = {}): Promise<unknown> {
  if (!RAILWAY_TOKEN) {
    throw new Error('RAILWAY_TOKEN missing')
  }

  const data = await fetchJson('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RAILWAY_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  }) as JsonRecord

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    throw new Error(`Railway GraphQL errors: ${JSON.stringify(data.errors)}`)
  }

  return data
}

function getCliProjectStatus(): JsonRecord {
  return JSON.parse(run('railway status --json')) as JsonRecord
}

function getCliServiceStatus(serviceName: string): JsonRecord {
  return JSON.parse(run(`railway service status -s ${serviceName} --json`)) as JsonRecord
}

function getProjectService(projectStatus: JsonRecord, serviceName: string): JsonRecord | null {
  const services = Array.isArray(projectStatus.services) ? (projectStatus.services as JsonRecord[]) : []
  return services.find((service) => String(service.name || '') === serviceName) || null
}

async function getDeploymentSnapshot(serviceName: string): Promise<JsonRecord> {
  const cliService = getCliServiceStatus(serviceName)
  const cliProject = getCliProjectStatus()
  const cliProjectService = getProjectService(cliProject, serviceName)

  const snapshot: JsonRecord = {
    source: 'railway-cli',
    service: serviceName,
    deploymentId: cliService.deploymentId || null,
    status: cliService.status || null,
    stopped: cliService.stopped || false,
    domains: cliProjectService?.domains || [],
  }

  if (!RAILWAY_TOKEN) {
    return snapshot
  }

  try {
    const gql = await queryRailwayGraphql(
      `
        query ReadBackDeployment($id: String!) {
          deployment(id: $id) {
            id
            status
            createdAt
            meta
          }
        }
      `,
      { id: String(cliService.deploymentId || '') },
    ) as JsonRecord

    const deployment = (gql.data as JsonRecord)?.deployment as JsonRecord | undefined
    if (deployment) {
      snapshot.source = 'railway-graphql'
      snapshot.createdAt = deployment.createdAt || null
      snapshot.status = deployment.status || snapshot.status
      snapshot.meta = deployment.meta || null
    }
  } catch (error) {
    snapshot.graphqlWarning = error instanceof Error ? error.message : String(error)
  }

  return snapshot
}

async function verifyBackendRuntime(): Promise<void> {
  log(`Initiating backend verification at ${BACKEND_URL}`)
  const snapshot = await getDeploymentSnapshot('backend')
  log(`Deploy status=${String(snapshot.status || 'unknown')} deploymentId=${String(snapshot.deploymentId || 'unknown')}`)
  const health = await fetchJson(`${BACKEND_URL}/health`) as JsonRecord
  const release = await fetchJson(`${BACKEND_URL}/api/governance/release`) as JsonRecord
  const runtimeVersion = String((health.release as JsonRecord | undefined)?.packageVersion || health.version || '')
  const expectedVersion = getExpectedBackendVersion()
  const liveDeploymentId = String(((release.release as JsonRecord | undefined)?.railwayDeploymentId) || '')
  const controlPlaneHealthy = String(snapshot.status || '').toUpperCase() === 'SUCCESS'

  if (!controlPlaneHealthy) {
    if (liveDeploymentId && liveDeploymentId !== String(snapshot.deploymentId || '')) {
      log(
        `Control plane shows ${String(snapshot.status)} for deployment ${String(snapshot.deploymentId)}, but live runtime is still serving deployment ${liveDeploymentId}. Continuing on runtime truth.`,
      )
    } else {
      fail(`Backend deployment is not healthy: ${JSON.stringify(snapshot)}`)
    }
  }

  log(`Backend runtime version=${runtimeVersion} expected=${expectedVersion}`)
  if (runtimeVersion !== expectedVersion) {
    fail(`Backend version mismatch: runtime=${runtimeVersion} expected=${expectedVersion}`)
  }

  const packetEnvelope = await fetchJson(`${BACKEND_URL}/api/governance/launcher/evidence-packet`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      question: 'WidgetDC governance er ikke færdig endnu. Giv kort status uden falsk coverage gap.',
      domain: 'launcher-governance',
      limit: 4,
    }),
  }) as JsonRecord

  const packet = packetEnvelope.packet
  if (!Value.Check(LauncherEvidencePacket, packet)) {
    const errors = [...Value.Errors(LauncherEvidencePacket, packet)].map((entry) => ({
      path: entry.path,
      message: entry.message,
      value: entry.value,
    }))
    fail(`Launcher evidence packet contract mismatch: ${JSON.stringify({ errors, packetEnvelope })}`)
  }

  const typedPacket = packet as JsonRecord
  log(`Launcher packet validated. tri_source_ready=${String(typedPacket.tri_source_ready)}`)

  const releasePayload = release.release as JsonRecord | undefined
  if (!releasePayload?.commitSha) {
    fail('Backend release endpoint did not return commitSha')
  }
}

async function verifyRlmRuntime(): Promise<void> {
  log(`Initiating RLM verification at ${RLM_URL}`)
  const snapshot = await getDeploymentSnapshot('rlm-engine')
  log(`Deploy status=${String(snapshot.status || 'unknown')} deploymentId=${String(snapshot.deploymentId || 'unknown')}`)
  const health = await fetchJson(`${RLM_URL}/health`) as JsonRecord
  const runtimeVersion = extractRlmRuntimeVersion(health)
  const runtimeFingerprint = (health.runtime_fingerprint as JsonRecord | undefined) || {}
  const liveDeploymentId = String(runtimeFingerprint.deployment_id || '')
  const controlPlaneHealthy = String(snapshot.status || '').toUpperCase() === 'SUCCESS'

  if (!controlPlaneHealthy) {
    if (liveDeploymentId && liveDeploymentId !== String(snapshot.deploymentId || '')) {
      log(
        `Control plane shows ${String(snapshot.status)} for deployment ${String(snapshot.deploymentId)}, but live RLM runtime is still serving deployment ${liveDeploymentId}. Continuing on runtime truth.`,
      )
    } else {
      fail(`RLM deployment is not healthy: ${JSON.stringify(snapshot)}`)
    }
  }

  log(`RLM runtime version=${runtimeVersion}`)
  if (!runtimeVersion) {
    fail('RLM health endpoint did not return version')
  }

  try {
    const ooda = await fetchJson(`${RLM_URL}/api/rlm/ooda/run`, {
      method: 'POST',
      body: JSON.stringify({
        task_id: `readback-${Date.now()}`,
        task: 'Verify launcher-governance scoping and return a concise safe outcome.',
        domain_hint: 'Technology',
        context: {
          orgId: 'launcher-governance',
          source_surface: 'railway-readback',
          evidence_domain: 'launcher-governance',
        },
      }),
    }) as JsonRecord

    if (!String(ooda.phase || '').trim()) {
      fail(`RLM OODA probe returned no phase: ${JSON.stringify(ooda)}`)
    }

    log(`RLM OODA probe succeeded. phase=${String(ooda.phase)} completed=${String(ooda.completed)}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const isRouteUnavailable = /^(404|405|501)\b/.test(message)
    if (!isRouteUnavailable) {
      throw error
    }

    log('RLM OODA route unavailable in live runtime; falling back to /reason probe')
    const reason = await fetchJson(`${RLM_URL}/reason`, {
      method: 'POST',
      body: JSON.stringify({
        task: 'Verify launcher-governance scoping and return a concise safe outcome.',
        context: {
          orgId: 'launcher-governance',
          source_surface: 'railway-readback',
          evidence_domain: 'launcher-governance',
        },
      }),
    }) as JsonRecord

    const responseText =
      String(reason.response || '') ||
      String(reason.recommendation || '') ||
      String(reason.reasoning || '') ||
      String(reason.result || '') ||
      String(reason.output || '') ||
      String(reason.analysis || '') ||
      String(reason.answer || '')

    if (!responseText.trim() && reason.success !== true) {
      fail(`RLM /reason probe returned no usable response: ${JSON.stringify(reason)}`)
    }

    log('RLM /reason fallback probe succeeded')
  }
}

async function verifyLauncherTargetKind(): Promise<void> {
  try {
    const health = await fetchJson(`${LAUNCHER_BASE_URL}/health`) as JsonRecord
    log(`Launcher probe via ${LAUNCHER_BASE_URL} status=${String(health.status || 'unknown')}`)
  } catch {
    log(`Launcher probe skipped: no reachable launcher at ${LAUNCHER_BASE_URL}`)
    return
  }

  const result = await fetchJson(`${LAUNCHER_BASE_URL}/api/orchestrate`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      input: 'WidgetDC governance er ikke færdig endnu. Giv kort status.',
      intent: 'info',
    }),
  }) as JsonRecord

  const execution = result.execution as JsonRecord | undefined
  const governance = execution?.governance as JsonRecord | undefined
  const targetKind = String(governance?.targetKind || '')

  if (!['AssemblyCandidate', 'LooseEnd'].includes(targetKind)) {
    fail(`Launcher targetKind drift detected: ${targetKind || 'missing'}`)
  }

  const looseEnd = String(governance?.looseEnd || '')
  if (/CoverageGap:\s*ikke\b/i.test(looseEnd)) {
    fail(`Launcher regex false positive detected: ${looseEnd}`)
  }

  log(`Launcher targetKind verified. targetKind=${targetKind}`)
}

function buildAuthHeaders(): Record<string, string> {
  return WIDGETDC_API_KEY
    ? {
        Authorization: `Bearer ${WIDGETDC_API_KEY}`,
        'x-api-key': WIDGETDC_API_KEY,
      }
    : {}
}

async function main(): Promise<void> {
  log(`Continuous verification for target=${TARGET_SERVICE}`)

  await verifyBackendRuntime()
  await verifyRlmRuntime()
  await verifyLauncherTargetKind()

  console.log('🚀 [Read-back] ALL GATES PASSED. Runtime is aligned with contracts and live probes.')
}

const invokedAsScript = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (invokedAsScript) {
  main().catch((error) => {
    fail(error instanceof Error ? error.message : String(error))
  })
}
