import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

type JsonRecord = Record<string, unknown>

type RuntimeProofStatus = 'PASS' | 'BLOCKED_RUNTIME'

type RuntimeProofSurface = {
  repo_id: string
  surface_id: string
  runtime_url_env_names: string[]
  health_path: string
  release_path?: string
  required_runtime_proof: {
    deployed_sha_matches: boolean
    runtime_correlation_id: boolean
    eventspine_replay_count_gte: number
  }
}

type RuntimeUrlDetection = {
  env_name: string
  url: string
}

type RuntimeFingerprint = {
  deployed_sha: string | null
  runtime_correlation_id: string | null
  eventspine_replay_count: number | null
}

type RuntimeEvidenceCheck = {
  id: string
  status: RuntimeProofStatus
  expected?: unknown
  observed?: unknown
}

type RuntimeEvidence = {
  repo: string
  surface_id: string
  status: RuntimeProofStatus
  evidence_level: 'runtime_proof' | 'diagnostic_only'
  generated_at: string
  commit: string
  branch: string
  workflow: {
    run_id: string | null
    run_attempt: string | null
    correlation_id: string
  }
  runtime_url: {
    configured: boolean
    env_name: string | null
  }
  runtime: RuntimeFingerprint
  checks: RuntimeEvidenceCheck[]
  note: string
}

const DEFAULT_SURFACE_PATH = 'config/runtime_proof_surface.json'
const DEFAULT_EVIDENCE_PATH = 'runtime-evidence.json'
const PROBE_TIMEOUT_MS = Number(process.env.RUNTIME_PROOF_TIMEOUT_MS || 30000)

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : null
}

function getPath(record: JsonRecord | null, path: string[]): unknown {
  let current: unknown = record
  for (const segment of path) {
    const currentRecord = asRecord(current)
    if (!currentRecord) return undefined
    current = currentRecord[segment]
  }

  return current
}

function firstString(records: Array<JsonRecord | null>, paths: string[][]): string | null {
  for (const record of records) {
    for (const path of paths) {
      const value = getPath(record, path)
      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }
  }

  return null
}

function firstNumber(records: Array<JsonRecord | null>, paths: string[][]): number | null {
  for (const record of records) {
    for (const path of paths) {
      const value = getPath(record, path)
      if (typeof value === 'number' && Number.isFinite(value)) return value
      if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
        return Number(value)
      }
    }
  }

  return null
}

export function normalizeBaseUrl(value: string | undefined): string {
  return String(value || '').trim().replace(/\/+$/, '')
}

export function detectRuntimeUrl(
  env: NodeJS.ProcessEnv,
  envNames: string[],
): RuntimeUrlDetection | null {
  for (const envName of envNames) {
    const url = normalizeBaseUrl(env[envName])
    if (url) return { env_name: envName, url }
  }

  return null
}

export function shaMatches(expectedSha: string, deployedSha: string | null): boolean {
  const expected = expectedSha.trim().toLowerCase()
  const deployed = String(deployedSha || '').trim().toLowerCase()
  if (expected.length < 7 || deployed.length < 7) return false

  return expected.startsWith(deployed) || deployed.startsWith(expected)
}

export function extractRuntimeFingerprint(
  health: JsonRecord | null,
  release: JsonRecord | null,
): RuntimeFingerprint {
  return {
    deployed_sha: firstString([release, health], [
      ['release', 'commitSha'],
      ['release', 'short_commit_sha'],
      ['release', 'commit'],
      ['commitSha'],
      ['short_commit_sha'],
      ['commit'],
      ['data', 'release', 'commitSha'],
      ['data', 'release', 'short_commit_sha'],
    ]),
    runtime_correlation_id: firstString([release, health], [
      ['correlation_id'],
      ['correlationId'],
      ['metadata', 'correlation_id'],
      ['metadata', 'correlationId'],
      ['release', 'correlation_id'],
      ['release', 'correlationId'],
    ]),
    eventspine_replay_count: firstNumber([release, health], [
      ['eventspine_replay_count'],
      ['eventSpineReplayCount'],
      ['event_spine_replay_count'],
      ['eventspine', 'replay_count'],
      ['eventSpine', 'replayCount'],
      ['release', 'eventspine_replay_count'],
      ['release', 'eventSpineReplayCount'],
    ]),
  }
}

export function evaluateRuntimeProof(
  expectedSha: string,
  fingerprint: RuntimeFingerprint,
  required: RuntimeProofSurface['required_runtime_proof'],
): RuntimeEvidenceCheck[] {
  const checks: RuntimeEvidenceCheck[] = []

  if (required.deployed_sha_matches) {
    checks.push({
      id: 'deployed_sha_matches',
      status: shaMatches(expectedSha, fingerprint.deployed_sha) ? 'PASS' : 'BLOCKED_RUNTIME',
      expected: expectedSha,
      observed: fingerprint.deployed_sha,
    })
  }

  if (required.runtime_correlation_id) {
    checks.push({
      id: 'runtime_correlation_id_present',
      status: fingerprint.runtime_correlation_id ? 'PASS' : 'BLOCKED_RUNTIME',
      observed: fingerprint.runtime_correlation_id ? 'present' : null,
    })
  }

  checks.push({
    id: 'eventspine_replay_count_gte',
    status:
      typeof fingerprint.eventspine_replay_count === 'number' &&
      fingerprint.eventspine_replay_count >= required.eventspine_replay_count_gte
        ? 'PASS'
        : 'BLOCKED_RUNTIME',
    expected: required.eventspine_replay_count_gte,
    observed: fingerprint.eventspine_replay_count,
  })

  return checks
}

export function buildRuntimeEvidence(input: {
  surface: RuntimeProofSurface
  expectedSha: string
  branch: string
  runtimeUrl: RuntimeUrlDetection | null
  fingerprint: RuntimeFingerprint
  checks: RuntimeEvidenceCheck[]
}): RuntimeEvidence {
  const status = input.runtimeUrl && input.checks.every((check) => check.status === 'PASS')
    ? 'PASS'
    : 'BLOCKED_RUNTIME'
  const runId = process.env.GITHUB_RUN_ID || null
  const runAttempt = process.env.GITHUB_RUN_ATTEMPT || null

  return {
    repo: input.surface.repo_id,
    surface_id: input.surface.surface_id,
    status,
    evidence_level: status === 'PASS' ? 'runtime_proof' : 'diagnostic_only',
    generated_at: new Date().toISOString(),
    commit: input.expectedSha,
    branch: input.branch,
    workflow: {
      run_id: runId,
      run_attempt: runAttempt,
      correlation_id: `github-actions:${runId || 'local'}:${runAttempt || '1'}`,
    },
    runtime_url: {
      configured: Boolean(input.runtimeUrl),
      env_name: input.runtimeUrl?.env_name || null,
    },
    runtime: input.fingerprint,
    checks: input.runtimeUrl
      ? input.checks
      : [{
          id: 'runtime_url_configured',
          status: 'BLOCKED_RUNTIME',
          observed: false,
        }],
    note: status === 'PASS'
      ? 'Runtime proof requirements passed for this merge commit.'
      : 'Runtime proof is blocked. Do not claim deployed, runtime-proven, or promoted status from this evidence.',
  }
}

async function fetchJson(url: string): Promise<JsonRecord> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    })
    const text = await response.text()
    const data = text ? JSON.parse(text) : {}

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    return data as JsonRecord
  } finally {
    clearTimeout(timeout)
  }
}

function readSurface(): RuntimeProofSurface {
  const surfacePath = process.env.RUNTIME_PROOF_SURFACE_PATH || DEFAULT_SURFACE_PATH
  return JSON.parse(readFileSync(surfacePath, 'utf8')) as RuntimeProofSurface
}

function writeEvidence(evidence: RuntimeEvidence): void {
  const outputPath = process.env.RUNTIME_EVIDENCE_PATH || DEFAULT_EVIDENCE_PATH
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`)

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `status=${evidence.status}\n`)
    appendFileSync(process.env.GITHUB_OUTPUT, `evidence_path=${outputPath}\n`)
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
      '### Runtime Proof Read-back',
      '',
      `- Commit: \`${evidence.commit}\``,
      `- Branch: \`${evidence.branch}\``,
      `- Runtime URL configured: \`${String(evidence.runtime_url.configured)}\``,
      `- Runtime URL env: \`${evidence.runtime_url.env_name || 'none'}\``,
      `- Status: \`${evidence.status}\``,
      `- Evidence level: \`${evidence.evidence_level}\``,
      '',
    ].join('\n'))
  }
}

async function main(): Promise<void> {
  const surface = readSurface()
  const expectedSha = String(process.env.GITHUB_SHA || process.env.EXPECTED_SHA || '').trim()
  const branch = String(process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME || '').trim()

  if (!expectedSha) {
    throw new Error('GITHUB_SHA or EXPECTED_SHA is required')
  }

  const runtimeUrl = detectRuntimeUrl(process.env, surface.runtime_url_env_names)
  if (runtimeUrl) {
    console.log(`::add-mask::${runtimeUrl.url}`)
  }

  let fingerprint: RuntimeFingerprint = {
    deployed_sha: null,
    runtime_correlation_id: null,
    eventspine_replay_count: null,
  }
  let checks: RuntimeEvidenceCheck[] = []

  if (runtimeUrl) {
    const health = await fetchJson(`${runtimeUrl.url}${surface.health_path}`)
    const release = surface.release_path
      ? await fetchJson(`${runtimeUrl.url}${surface.release_path}`).catch(() => null)
      : null

    fingerprint = extractRuntimeFingerprint(health, release)
    checks = evaluateRuntimeProof(expectedSha, fingerprint, surface.required_runtime_proof)
  }

  const evidence = buildRuntimeEvidence({
    surface,
    expectedSha,
    branch,
    runtimeUrl,
    fingerprint,
    checks,
  })

  writeEvidence(evidence)
  console.log(JSON.stringify(evidence, null, 2))

  process.exit(evidence.status === 'PASS' ? 0 : 1)
}

const invokedAsScript = process.argv[1]
if (invokedAsScript && resolve(fileURLToPath(import.meta.url)) === resolve(invokedAsScript)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  })
}
