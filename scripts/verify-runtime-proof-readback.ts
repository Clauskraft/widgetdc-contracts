import { execFileSync, spawnSync } from 'node:child_process'
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

type JsonRecord = Record<string, unknown>

type RuntimeProofStatus = 'PASS' | 'BLOCKED_RUNTIME'

type RuntimeProofSurface = {
  repo_id: string
  surface_id: string
  runtime_surface?: RuntimeSurfaceMetadata
  runtime_url_env_names: string[]
  health_path: string
  release_path?: string
  required_runtime_proof: {
    deployed_sha_matches: boolean
    runtime_correlation_id: boolean
    eventspine_replay_count_gte: number
  }
}

type RuntimeSurfaceMetadata = {
  deployment_model: 'standalone_runtime' | 'package_consumer_adoption'
  standalone_runtime: boolean
  adoption_readback_required: boolean
  consumer_repos: string[]
  evidence_anchor?: string
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

type ConsumerAdoptionReadback = {
  configured: boolean
  schema: string | null
  evidence_level: string | null
  package_name: string | null
  package_version: string | null
  contracts_commit_sha: string | null
  consumer_repo: string | null
  consumer_service: string | null
  source_protocol: string | null
  generated_at: string | null
  fingerprint: RuntimeFingerprint
  runtime_proof_claimed: boolean | null
  claim_promotion_eligible: boolean | null
  baseline?: ConsumerAdoptionCommitBaseline
}

type ConsumerAdoptionCommitBaseline = {
  mode: 'exact' | 'proof_pipeline_only_diff' | 'mismatch' | 'non_ancestor' | 'unverified'
  current_commit_sha: string
  contracts_commit_sha: string | null
  is_ancestor: boolean | null
  diff_files: string[] | null
  allowed_diff_files: string[]
}

type ConsumerAdoptionReadbackEnv = {
  CONSUMER_ADOPTION_READBACK_JSON?: string
  CONSUMER_ADOPTION_READBACK_PATH?: string
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
  consumer_adoption_readback?: Omit<ConsumerAdoptionReadback, 'fingerprint'>
  runtime_surface?: RuntimeSurfaceMetadata
  runtime: RuntimeFingerprint
  checks: RuntimeEvidenceCheck[]
  note: string
}

export function resolveBlockedRuntimeExitCode(env: NodeJS.ProcessEnv = process.env): 0 | 1 {
  return env.RUNTIME_PROOF_BLOCKED_EXIT_CODE === '0' ? 0 : 1
}

const DEFAULT_SURFACE_PATH = 'config/runtime_proof_surface.json'
const DEFAULT_EVIDENCE_PATH = 'runtime-evidence.json'
const DEFAULT_PROBE_TIMEOUT_MS = 30000
const PROBE_TIMEOUT_MS = parseProbeTimeoutMs(process.env.RUNTIME_PROOF_TIMEOUT_MS)
const RUNTIME_URL_PLACEHOLDERS = new Set(['-', 'none', 'null', 'undefined', 'n/a', 'na'])
const PROOF_PIPELINE_DIFF_ALLOWLIST = [
  '.github/workflows/agent-delivery-follow-up.yml',
  'scripts/verify-runtime-proof-readback.ts',
  'tests/runtime-proof-readback.test.ts',
]

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

function parseJsonRecord(value: unknown): JsonRecord | null {
  if (typeof value !== 'string') return asRecord(value)
  try {
    return asRecord(JSON.parse(value))
  } catch {
    return null
  }
}

function unwrapConsumerAdoptionReadback(value: unknown): JsonRecord | null {
  const record = parseJsonRecord(value)
  if (!record) return null

  const data = asRecord(record.data)
  const dataResult = parseJsonRecord(data?.result)
  if (dataResult) return dataResult

  const result = parseJsonRecord(record.result)
  if (result) return result

  return record
}

export function normalizeBaseUrl(value: string | undefined): string {
  return String(value || '').trim().replace(/\/+$/, '')
}

function isRuntimeBaseUrl(value: string): boolean {
  if (!value || RUNTIME_URL_PLACEHOLDERS.has(value.toLowerCase())) {
    return false
  }

  try {
    const parsed = new URL(value)
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && Boolean(parsed.hostname)
  } catch {
    return false
  }
}

export function parseProbeTimeoutMs(value: string | undefined): number {
  const parsed = Number(String(value || '').trim())
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PROBE_TIMEOUT_MS
}

export function detectRuntimeUrl(
  env: NodeJS.ProcessEnv,
  envNames: string[],
): RuntimeUrlDetection | null {
  for (const envName of envNames) {
    const url = normalizeBaseUrl(env[envName])
    if (isRuntimeBaseUrl(url)) return { env_name: envName, url }
  }

  return null
}

export function shaMatches(expectedSha: string, deployedSha: string | null): boolean {
  const expected = expectedSha.trim().toLowerCase()
  const deployed = String(deployedSha || '').trim().toLowerCase()
  if (expected.length < 7 || deployed.length < 7) return false

  return expected.startsWith(deployed) || deployed.startsWith(expected)
}

function normalizeRepoPath(path: string): string {
  return path.trim().replace(/\\/g, '/')
}

export function isProofPipelineOnlyDiff(paths: string[]): boolean {
  const allowed = new Set(PROOF_PIPELINE_DIFF_ALLOWLIST)
  return paths.length > 0 && paths.every((path) => allowed.has(normalizeRepoPath(path)))
}

export function buildConsumerAdoptionBaseline(
  currentCommitSha: string,
  contractsCommitSha: string | null,
  input: { isAncestor?: boolean | null; diffFiles?: string[] | null } = {},
): ConsumerAdoptionCommitBaseline {
  const current = currentCommitSha.trim().toLowerCase()
  const observed = String(contractsCommitSha || '').trim().toLowerCase() || null
  const diffFiles = Array.isArray(input.diffFiles)
    ? input.diffFiles.map(normalizeRepoPath).filter(Boolean)
    : input.diffFiles ?? null
  const isAncestor = input.isAncestor ?? null

  if (shaMatches(current, observed)) {
    return {
      mode: 'exact',
      current_commit_sha: current,
      contracts_commit_sha: observed,
      is_ancestor: true,
      diff_files: [],
      allowed_diff_files: PROOF_PIPELINE_DIFF_ALLOWLIST,
    }
  }

  const proofPipelineOnly = isAncestor === true && Array.isArray(diffFiles) && isProofPipelineOnlyDiff(diffFiles)

  return {
    mode: proofPipelineOnly
      ? 'proof_pipeline_only_diff'
      : isAncestor === false
        ? 'non_ancestor'
        : Array.isArray(diffFiles)
          ? 'mismatch'
          : 'unverified',
    current_commit_sha: current,
    contracts_commit_sha: observed,
    is_ancestor: isAncestor,
    diff_files: diffFiles,
    allowed_diff_files: PROOF_PIPELINE_DIFF_ALLOWLIST,
  }
}

function readGitBaselineInputs(
  currentCommitSha: string,
  contractsCommitSha: string | null,
): { isAncestor: boolean | null; diffFiles: string[] | null } {
  const current = currentCommitSha.trim()
  const observed = String(contractsCommitSha || '').trim()
  if (shaMatches(current, observed)) return { isAncestor: true, diffFiles: [] }
  if (!current || !observed) return { isAncestor: null, diffFiles: null }

  const ancestor = spawnSync('git', ['merge-base', '--is-ancestor', observed, current], {
    stdio: 'ignore',
  })
  const isAncestor = ancestor.status === 0 ? true : ancestor.status === 1 ? false : null
  if (isAncestor !== true) return { isAncestor, diffFiles: null }

  try {
    const output = execFileSync('git', ['diff', '--name-only', `${observed}..${current}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return {
      isAncestor,
      diffFiles: output.split(/\r?\n/).map(normalizeRepoPath).filter(Boolean),
    }
  } catch {
    return { isAncestor, diffFiles: null }
  }
}

function withConsumerAdoptionBaseline(
  currentCommitSha: string,
  adoption: ConsumerAdoptionReadback,
): ConsumerAdoptionReadback {
  const baselineInputs = readGitBaselineInputs(currentCommitSha, adoption.contracts_commit_sha)
  return {
    ...adoption,
    baseline: buildConsumerAdoptionBaseline(
      currentCommitSha,
      adoption.contracts_commit_sha,
      baselineInputs,
    ),
  }
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

export function extractConsumerAdoptionReadback(value: unknown): ConsumerAdoptionReadback | null {
  const record = unwrapConsumerAdoptionReadback(value)
  const readback = asRecord(record?.readback)
  if (!record || !readback) return null

  return {
    configured: true,
    schema: firstString([record], [['schema']]),
    evidence_level: firstString([record], [['evidence_level']]),
    package_name: firstString([readback], [['package_name']]),
    package_version: firstString([readback], [['package_version']]),
    contracts_commit_sha: firstString([readback], [['contracts_commit_sha']]),
    consumer_repo: firstString([readback], [['consumer_repo']]),
    consumer_service: firstString([readback], [['consumer_service']]),
    source_protocol: firstString([readback], [['source_protocol']]),
    generated_at: firstString([readback], [['generated_at']]),
    fingerprint: {
      deployed_sha: firstString([readback], [['consumer_deployed_sha']]),
      runtime_correlation_id: firstString([readback], [['runtime_correlation_id']]),
      eventspine_replay_count: firstNumber([readback], [['eventspine_replay_count']]),
    },
    runtime_proof_claimed: typeof readback.runtime_proof_claimed === 'boolean'
      ? readback.runtime_proof_claimed
      : null,
    claim_promotion_eligible: typeof readback.claim_promotion_eligible === 'boolean'
      ? readback.claim_promotion_eligible
      : null,
  }
}

export function readConsumerAdoptionReadbackFromEnv(
  env: ConsumerAdoptionReadbackEnv = process.env,
): ConsumerAdoptionReadback | null {
  const inlineJson = String(env.CONSUMER_ADOPTION_READBACK_JSON || '').trim()
  if (inlineJson) return extractConsumerAdoptionReadback(inlineJson)

  const filePath = String(env.CONSUMER_ADOPTION_READBACK_PATH || '').trim()
  if (!filePath) return null

  return extractConsumerAdoptionReadback(readFileSync(filePath, 'utf8'))
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

export function evaluateConsumerAdoptionReadback(
  expectedSha: string,
  adoption: ConsumerAdoptionReadback | null,
  required: RuntimeProofSurface['required_runtime_proof'],
  baseline = adoption?.baseline ?? (adoption
    ? buildConsumerAdoptionBaseline(expectedSha, adoption.contracts_commit_sha)
    : null),
): RuntimeEvidenceCheck[] {
  if (!adoption) return missingRuntimeUrlChecks({
    repo_id: 'widgetdc-contracts',
    surface_id: 'widgetdc-contracts-merge-runtime-proof',
    runtime_url_env_names: [],
    health_path: '/health',
    required_runtime_proof: required,
    runtime_surface: {
      deployment_model: 'package_consumer_adoption',
      standalone_runtime: false,
      adoption_readback_required: true,
      consumer_repos: [],
    },
  })

  const checks: RuntimeEvidenceCheck[] = [{
    id: 'consumer_adoption_readback_configured',
    status: 'PASS',
    observed: true,
  }, {
    id: 'consumer_evidence_level_claim_grade',
    status: adoption.evidence_level === 'runtime_proof' ? 'PASS' : 'BLOCKED_RUNTIME',
    expected: 'runtime_proof',
    observed: adoption.evidence_level,
  }]

  if (required.deployed_sha_matches) {
    const commitAccepted = baseline?.mode === 'exact' || baseline?.mode === 'proof_pipeline_only_diff'
    checks.push({
      id: 'contracts_commit_sha_matches',
      status: commitAccepted ? 'PASS' : 'BLOCKED_RUNTIME',
      expected: {
        current_commit_sha: expectedSha,
        accepted_modes: ['exact', 'proof_pipeline_only_diff'],
      },
      observed: baseline,
    })
    checks.push({
      id: 'consumer_deployed_sha_present',
      status: adoption.fingerprint.deployed_sha ? 'PASS' : 'BLOCKED_RUNTIME',
      observed: adoption.fingerprint.deployed_sha ? 'present' : null,
    })
  }

  if (required.runtime_correlation_id) {
    checks.push({
      id: 'runtime_correlation_id_present',
      status: adoption.fingerprint.runtime_correlation_id ? 'PASS' : 'BLOCKED_RUNTIME',
      observed: adoption.fingerprint.runtime_correlation_id ? 'present' : null,
    })
  }

  checks.push({
    id: 'eventspine_replay_count_gte',
    status:
      typeof adoption.fingerprint.eventspine_replay_count === 'number' &&
      adoption.fingerprint.eventspine_replay_count >= required.eventspine_replay_count_gte
        ? 'PASS'
        : 'BLOCKED_RUNTIME',
    expected: required.eventspine_replay_count_gte,
    observed: adoption.fingerprint.eventspine_replay_count,
  }, {
    id: 'consumer_runtime_proof_not_claimed',
    status: adoption.runtime_proof_claimed === false ? 'PASS' : 'BLOCKED_RUNTIME',
    expected: false,
    observed: adoption.runtime_proof_claimed,
  }, {
    id: 'consumer_claim_promotion_not_eligible',
    status: adoption.claim_promotion_eligible === false ? 'PASS' : 'BLOCKED_RUNTIME',
    expected: false,
    observed: adoption.claim_promotion_eligible,
  })

  return checks
}

function missingRuntimeUrlChecks(surface: RuntimeProofSurface): RuntimeEvidenceCheck[] {
  if (surface.runtime_surface?.deployment_model === 'package_consumer_adoption') {
    return [{
      id: 'consumer_adoption_readback_configured',
      status: 'BLOCKED_RUNTIME',
      expected: 'deployed consumer or governed runner emits contracts SHA, correlation ID, and EventSpine replay count',
      observed: false,
    }]
  }

  return [{
    id: 'runtime_url_configured',
    status: 'BLOCKED_RUNTIME',
    observed: false,
  }]
}

function blockedRuntimeNote(surface: RuntimeProofSurface): string {
  if (surface.runtime_surface?.deployment_model === 'package_consumer_adoption') {
    return 'Runtime proof is blocked until consumer adoption read-back or a governed deployed runner emits contracts SHA, runtime correlation ID, and EventSpine replay count. Do not claim deployed, runtime-proven, or promoted status from this evidence.'
  }

  return 'Runtime proof is blocked. Do not claim deployed, runtime-proven, or promoted status from this evidence.'
}

export function buildRuntimeEvidence(input: {
  surface: RuntimeProofSurface
  expectedSha: string
  branch: string
  runtimeUrl: RuntimeUrlDetection | null
  consumerAdoptionReadback?: ConsumerAdoptionReadback | null
  fingerprint: RuntimeFingerprint
  checks: RuntimeEvidenceCheck[]
}): RuntimeEvidence {
  const hasEvidenceSource = Boolean(input.runtimeUrl) || Boolean(input.consumerAdoptionReadback)
  const status = hasEvidenceSource && input.checks.every((check) => check.status === 'PASS')
    ? 'PASS'
    : 'BLOCKED_RUNTIME'
  const runId = process.env.GITHUB_RUN_ID || null
  const runAttempt = process.env.GITHUB_RUN_ATTEMPT || null
  let consumerAdoptionReadback: Omit<ConsumerAdoptionReadback, 'fingerprint'> | undefined
  if (input.consumerAdoptionReadback) {
    const { fingerprint: _fingerprint, ...rest } = input.consumerAdoptionReadback
    consumerAdoptionReadback = rest
  }

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
    ...(input.consumerAdoptionReadback
      ? { consumer_adoption_readback: consumerAdoptionReadback }
      : {}),
    runtime_surface: input.surface.runtime_surface,
    runtime: input.fingerprint,
    checks: input.runtimeUrl
      ? input.checks
      : input.consumerAdoptionReadback
        ? input.checks
      : missingRuntimeUrlChecks(input.surface),
    note: status === 'PASS'
      ? input.consumerAdoptionReadback
        ? 'Runtime proof consumer adoption read-back requirements passed for this package adoption baseline. No claim promotion was performed.'
        : 'Runtime proof requirements passed for this merge commit.'
      : blockedRuntimeNote(input.surface),
  }
}

function safeProbeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.name === 'AbortError') {
    return 'request timed out'
  }

  const rawMessage = error instanceof Error ? error.message : String(error || '')
  const sanitized = rawMessage
    .replace(/https?:\/\/[^\s"'<>]+/gi, '[runtime-url]')
    .trim()

  return sanitized || 'runtime probe failed'
}

export async function fetchJson(url: string): Promise<JsonRecord> {
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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`.trim())
    }

    if (!text.trim()) {
      return {}
    }

    try {
      const data = JSON.parse(text) as unknown
      return asRecord(data) || {}
    } catch {
      throw new Error('invalid JSON response')
    }
  } finally {
    clearTimeout(timeout)
  }
}

export async function probeRuntime(
  runtimeUrl: RuntimeUrlDetection,
  surface: RuntimeProofSurface,
  expectedSha: string,
): Promise<{
  fingerprint: RuntimeFingerprint
  checks: RuntimeEvidenceCheck[]
}> {
  try {
    const health = await fetchJson(`${runtimeUrl.url}${surface.health_path}`)
    const release = surface.release_path
      ? await fetchJson(`${runtimeUrl.url}${surface.release_path}`)
      : null

    const fingerprint = extractRuntimeFingerprint(health, release)
    return {
      fingerprint,
      checks: evaluateRuntimeProof(expectedSha, fingerprint, surface.required_runtime_proof),
    }
  } catch (error: unknown) {
    return {
      fingerprint: {
        deployed_sha: null,
        runtime_correlation_id: null,
        eventspine_replay_count: null,
      },
      checks: [{
        id: 'runtime_probe_succeeded',
        status: 'BLOCKED_RUNTIME',
        observed: safeProbeErrorMessage(error),
      }],
    }
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
      `- Consumer adoption read-back configured: \`${String(Boolean(evidence.consumer_adoption_readback?.configured))}\``,
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
  if (runtimeUrl && process.env.GITHUB_ACTIONS === 'true') {
    console.log(`::add-mask::${runtimeUrl.url}`)
  }

  let fingerprint: RuntimeFingerprint = {
    deployed_sha: null,
    runtime_correlation_id: null,
    eventspine_replay_count: null,
  }
  let checks: RuntimeEvidenceCheck[] = []
  const rawConsumerAdoptionReadback = surface.runtime_surface?.deployment_model === 'package_consumer_adoption'
    ? readConsumerAdoptionReadbackFromEnv(process.env)
    : null
  const consumerAdoptionReadback = rawConsumerAdoptionReadback
    ? withConsumerAdoptionBaseline(expectedSha, rawConsumerAdoptionReadback)
    : null

  if (consumerAdoptionReadback) {
    fingerprint = consumerAdoptionReadback.fingerprint
    checks = evaluateConsumerAdoptionReadback(
      expectedSha,
      consumerAdoptionReadback,
      surface.required_runtime_proof,
    )
  } else if (runtimeUrl) {
    const probe = await probeRuntime(runtimeUrl, surface, expectedSha)
    fingerprint = probe.fingerprint
    checks = probe.checks
  }

  const evidence = buildRuntimeEvidence({
    surface,
    expectedSha,
    branch,
    runtimeUrl,
    consumerAdoptionReadback,
    fingerprint,
    checks,
  })

  writeEvidence(evidence)
  console.log(JSON.stringify(evidence, null, 2))

  process.exit(evidence.status === 'PASS' ? 0 : resolveBlockedRuntimeExitCode())
}

const invokedAsScript = process.argv[1]
if (invokedAsScript && resolve(fileURLToPath(import.meta.url)) === resolve(invokedAsScript)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  })
}
