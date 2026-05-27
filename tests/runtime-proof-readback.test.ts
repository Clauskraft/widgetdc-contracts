import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  buildConsumerAdoptionBaseline,
  buildRuntimeEvidence,
  detectRuntimeUrl,
  evaluateRuntimeProof,
  extractConsumerAdoptionReadback,
  evaluateConsumerAdoptionReadback,
  extractRuntimeFingerprint,
  fetchJson,
  normalizeBaseUrl,
  parseProbeTimeoutMs,
  probeRuntime,
  readConsumerAdoptionReadbackFromEnv,
  isProofPipelineOnlyDiff,
  shaMatches,
} from '../scripts/verify-runtime-proof-readback.ts'

const surface = {
  repo_id: 'widgetdc-contracts',
  surface_id: 'widgetdc-contracts-merge-runtime-proof',
  runtime_url_env_names: ['WIDGETDC_CONTRACTS_RUNTIME_URL', 'RAILWAY_URL'],
  health_path: '/health',
  release_path: '/api/governance/release',
  required_runtime_proof: {
    deployed_sha_matches: true,
    runtime_correlation_id: true,
    eventspine_replay_count_gte: 1,
  },
}

describe('runtime proof read-back', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('normalizes runtime URLs without exposing values as evidence', () => {
    expect(normalizeBaseUrl('https://example.test///')).toBe('https://example.test')
    expect(detectRuntimeUrl({
      RAILWAY_URL: 'https://runtime.test/',
    }, surface.runtime_url_env_names)).toEqual({
      env_name: 'RAILWAY_URL',
      url: 'https://runtime.test',
    })
  })

  it('ignores placeholder and invalid runtime URL values before probing', () => {
    const envNames = ['WIDGETDC_CONTRACTS_RUNTIME_URL', 'RAILWAY_URL', 'BACKEND_URL']

    expect(detectRuntimeUrl({
      WIDGETDC_CONTRACTS_RUNTIME_URL: '-',
      RAILWAY_URL: 'runtime.test',
      BACKEND_URL: 'none',
    }, envNames)).toBeNull()

    expect(detectRuntimeUrl({
      WIDGETDC_CONTRACTS_RUNTIME_URL: '-',
      RAILWAY_URL: 'https://runtime.test/',
    }, envNames)).toEqual({
      env_name: 'RAILWAY_URL',
      url: 'https://runtime.test',
    })
  })

  it('marks missing runtime URL as BLOCKED_RUNTIME', () => {
    const evidence = buildRuntimeEvidence({
      surface,
      expectedSha: 'fdf23433a450fc7041b33ef208480469ec4a4bd1',
      branch: 'main',
      runtimeUrl: null,
      fingerprint: {
        deployed_sha: null,
        runtime_correlation_id: null,
        eventspine_replay_count: null,
      },
      checks: [],
    })

    expect(evidence.status).toBe('BLOCKED_RUNTIME')
    expect(evidence.evidence_level).toBe('diagnostic_only')
    expect(evidence.runtime_url.configured).toBe(false)
    expect(JSON.stringify(evidence)).not.toContain('https://')
  })

  it('classifies dependency-only runtime proof as missing consumer adoption read-back', () => {
    const evidence = buildRuntimeEvidence({
      surface: {
        ...surface,
        runtime_surface: {
          deployment_model: 'package_consumer_adoption',
          standalone_runtime: false,
          adoption_readback_required: true,
          consumer_repos: ['WidgeTDC', 'widgetdc-rlm-engine'],
        },
      },
      expectedSha: 'cc9e441f47178ec6289468562af081ba6d76f391',
      branch: 'main',
      runtimeUrl: null,
      fingerprint: {
        deployed_sha: null,
        runtime_correlation_id: null,
        eventspine_replay_count: null,
      },
      checks: [],
    })

    expect(evidence.status).toBe('BLOCKED_RUNTIME')
    expect(evidence.runtime_surface).toEqual({
      deployment_model: 'package_consumer_adoption',
      standalone_runtime: false,
      adoption_readback_required: true,
      consumer_repos: ['WidgeTDC', 'widgetdc-rlm-engine'],
    })
    expect(evidence.checks).toEqual([{
      id: 'consumer_adoption_readback_configured',
      status: 'BLOCKED_RUNTIME',
      expected: 'deployed consumer or governed runner emits contracts SHA, correlation ID, and EventSpine replay count',
      observed: false,
    }])
    expect(evidence.note).toContain('consumer adoption read-back')
  })

  it('blocks diagnostic-only consumer adoption read-back for dependency-only runtime proof', () => {
    const adoption = extractConsumerAdoptionReadback({
      success: true,
      schema: 'ContractsConsumerAdoptionReadbackResult',
      evidence_level: 'diagnostic_only',
      readback: {
        schema_version: 'contracts.consumer_adoption_readback.v1',
        package_name: '@widgetdc/contracts',
        package_version: '0.8.1',
        contracts_commit_sha: '47f82ab0e7a8c4f15453358d57398be703e8d5df',
        consumer_repo: 'Clauskraft/widgetdc-orchestrator',
        consumer_service: 'orchestrator',
        consumer_deployed_sha: 'a84ffcabde541e1fee360cbe3984fdce3db33285',
        source_protocol: 'scheduled_job',
        generated_at: '2026-05-26T20:47:41.396Z',
        runtime_correlation_id: 'lin-1339-contracts-adoption',
        eventspine_replay_count: 1,
        evidence_refs: ['github:Clauskraft/widgetdc-orchestrator#266'],
        runtime_proof_claimed: false,
        claim_promotion_eligible: false,
      },
    })

    expect(adoption?.fingerprint).toEqual({
      deployed_sha: 'a84ffcabde541e1fee360cbe3984fdce3db33285',
      runtime_correlation_id: 'lin-1339-contracts-adoption',
      eventspine_replay_count: 1,
    })

    const checks = evaluateConsumerAdoptionReadback(
      '47f82ab0e7a8c4f15453358d57398be703e8d5df',
      adoption,
      surface.required_runtime_proof,
    )

    const evidence = buildRuntimeEvidence({
      surface: {
        ...surface,
        runtime_surface: {
          deployment_model: 'package_consumer_adoption',
          standalone_runtime: false,
          adoption_readback_required: true,
          consumer_repos: ['widgetdc-orchestrator'],
        },
      },
      expectedSha: '47f82ab0e7a8c4f15453358d57398be703e8d5df',
      branch: 'main',
      runtimeUrl: null,
      consumerAdoptionReadback: adoption,
      fingerprint: adoption?.fingerprint ?? {
        deployed_sha: null,
        runtime_correlation_id: null,
        eventspine_replay_count: null,
      },
      checks,
    })

    expect(checks).toContainEqual({
      id: 'consumer_evidence_level_claim_grade',
      status: 'BLOCKED_RUNTIME',
      expected: 'runtime_proof',
      observed: 'diagnostic_only',
    })
    expect(evidence.status).toBe('BLOCKED_RUNTIME')
    expect(evidence.evidence_level).toBe('diagnostic_only')
    expect(evidence.consumer_adoption_readback).toMatchObject({
      configured: true,
      consumer_repo: 'Clauskraft/widgetdc-orchestrator',
      consumer_service: 'orchestrator',
      evidence_level: 'diagnostic_only',
      runtime_proof_claimed: false,
      claim_promotion_eligible: false,
    })
    expect(evidence.note).toContain('consumer adoption read-back')
  })

  it('accepts claim-grade deployed consumer adoption read-back for dependency-only runtime proof', () => {
    const adoption = extractConsumerAdoptionReadback({
      success: true,
      schema: 'ContractsConsumerAdoptionReadbackResult',
      evidence_level: 'runtime_proof',
      readback: {
        schema_version: 'contracts.consumer_adoption_readback.v1',
        package_name: '@widgetdc/contracts',
        package_version: '0.8.1',
        contracts_commit_sha: '47f82ab0e7a8c4f15453358d57398be703e8d5df',
        consumer_repo: 'Clauskraft/widgetdc-orchestrator',
        consumer_service: 'orchestrator',
        consumer_deployed_sha: 'a84ffcabde541e1fee360cbe3984fdce3db33285',
        source_protocol: 'scheduled_job',
        generated_at: '2026-05-26T20:47:41.396Z',
        runtime_correlation_id: 'lin-1339-contracts-adoption',
        eventspine_replay_count: 1,
        evidence_refs: ['github:Clauskraft/widgetdc-orchestrator#266'],
        runtime_proof_claimed: false,
        claim_promotion_eligible: false,
      },
    })

    const checks = evaluateConsumerAdoptionReadback(
      '47f82ab0e7a8c4f15453358d57398be703e8d5df',
      adoption,
      surface.required_runtime_proof,
    )

    const evidence = buildRuntimeEvidence({
      surface: {
        ...surface,
        runtime_surface: {
          deployment_model: 'package_consumer_adoption',
          standalone_runtime: false,
          adoption_readback_required: true,
          consumer_repos: ['widgetdc-orchestrator'],
        },
      },
      expectedSha: '47f82ab0e7a8c4f15453358d57398be703e8d5df',
      branch: 'main',
      runtimeUrl: null,
      consumerAdoptionReadback: adoption,
      fingerprint: adoption?.fingerprint ?? {
        deployed_sha: null,
        runtime_correlation_id: null,
        eventspine_replay_count: null,
      },
      checks,
    })

    expect(checks.every((check) => check.status === 'PASS')).toBe(true)
    expect(evidence.status).toBe('PASS')
    expect(evidence.evidence_level).toBe('runtime_proof')
    expect(evidence.consumer_adoption_readback).toMatchObject({
      configured: true,
      consumer_repo: 'Clauskraft/widgetdc-orchestrator',
      consumer_service: 'orchestrator',
      evidence_level: 'runtime_proof',
      runtime_proof_claimed: false,
      claim_promotion_eligible: false,
    })
    expect(evidence.note).toContain('consumer adoption read-back requirements passed')
  })

  it('accepts an older consumer adoption SHA when only proof-pipeline files changed', () => {
    const adoption = extractConsumerAdoptionReadback({
      schema: 'ContractsConsumerAdoptionReadbackResult',
      evidence_level: 'runtime_proof',
      readback: {
        package_name: '@widgetdc/contracts',
        package_version: '0.8.1',
        contracts_commit_sha: '47f82ab0e7a8c4f15453358d57398be703e8d5df',
        consumer_repo: 'Clauskraft/widgetdc-orchestrator',
        consumer_service: 'orchestrator',
        consumer_deployed_sha: 'a84ffcabde541e1fee360cbe3984fdce3db33285',
        source_protocol: 'scheduled_job',
        generated_at: '2026-05-26T20:47:41.396Z',
        runtime_correlation_id: 'lin-1339-contracts-adoption',
        eventspine_replay_count: 1,
        runtime_proof_claimed: false,
        claim_promotion_eligible: false,
      },
    })
    const baseline = buildConsumerAdoptionBaseline(
      '3cf6476a3e968d9035a7831a908cc6a019fe5c62',
      adoption?.contracts_commit_sha ?? null,
      {
        isAncestor: true,
        diffFiles: [
          '.github/workflows/agent-delivery-follow-up.yml',
          'scripts/verify-runtime-proof-readback.ts',
          'tests/runtime-proof-readback.test.ts',
        ],
      },
    )

    const checks = evaluateConsumerAdoptionReadback(
      '3cf6476a3e968d9035a7831a908cc6a019fe5c62',
      adoption,
      surface.required_runtime_proof,
      baseline,
    )

    expect(isProofPipelineOnlyDiff(baseline.diff_files ?? [])).toBe(true)
    expect(checks).toContainEqual({
      id: 'contracts_commit_sha_matches',
      status: 'PASS',
      expected: {
        current_commit_sha: '3cf6476a3e968d9035a7831a908cc6a019fe5c62',
        accepted_modes: ['exact', 'proof_pipeline_only_diff'],
      },
      observed: expect.objectContaining({
        mode: 'proof_pipeline_only_diff',
        contracts_commit_sha: '47f82ab0e7a8c4f15453358d57398be703e8d5df',
      }),
    })
    expect(checks.every((check) => check.status === 'PASS')).toBe(true)
  })

  it('blocks an older consumer adoption SHA when runtime package files changed', () => {
    const adoption = extractConsumerAdoptionReadback({
      readback: {
        package_name: '@widgetdc/contracts',
        contracts_commit_sha: '47f82ab0e7a8c4f15453358d57398be703e8d5df',
        consumer_deployed_sha: 'a84ffcabde541e1fee360cbe3984fdce3db33285',
        runtime_correlation_id: 'lin-1339-contracts-adoption',
        eventspine_replay_count: 1,
        runtime_proof_claimed: false,
        claim_promotion_eligible: false,
      },
    })
    const baseline = buildConsumerAdoptionBaseline(
      '3cf6476a3e968d9035a7831a908cc6a019fe5c62',
      adoption?.contracts_commit_sha ?? null,
      {
        isAncestor: true,
        diffFiles: ['src/index.ts'],
      },
    )

    const checks = evaluateConsumerAdoptionReadback(
      '3cf6476a3e968d9035a7831a908cc6a019fe5c62',
      adoption,
      surface.required_runtime_proof,
      baseline,
    )

    expect(checks).toContainEqual({
      id: 'contracts_commit_sha_matches',
      status: 'BLOCKED_RUNTIME',
      expected: {
        current_commit_sha: '3cf6476a3e968d9035a7831a908cc6a019fe5c62',
        accepted_modes: ['exact', 'proof_pipeline_only_diff'],
      },
      observed: expect.objectContaining({
        mode: 'mismatch',
        diff_files: ['src/index.ts'],
      }),
    })
  })

  it('blocks consumer adoption read-back that attempts claim promotion', () => {
    const adoption = extractConsumerAdoptionReadback({
      readback: {
        package_name: '@widgetdc/contracts',
        contracts_commit_sha: '47f82ab0e7a8c4f15453358d57398be703e8d5df',
        consumer_deployed_sha: 'a84ffcabde541e1fee360cbe3984fdce3db33285',
        runtime_correlation_id: 'lin-1339-contracts-adoption',
        eventspine_replay_count: 1,
        runtime_proof_claimed: false,
        claim_promotion_eligible: true,
      },
    })

    const checks = evaluateConsumerAdoptionReadback(
      '47f82ab0e7a8c4f15453358d57398be703e8d5df',
      adoption,
      surface.required_runtime_proof,
    )

    expect(checks).toContainEqual({
      id: 'consumer_claim_promotion_not_eligible',
      status: 'BLOCKED_RUNTIME',
      expected: false,
      observed: true,
    })
  })

  it('loads consumer adoption read-back from environment JSON before workflow evaluation', () => {
    const env = {
      CONSUMER_ADOPTION_READBACK_JSON: JSON.stringify({
        data: {
          result: JSON.stringify({
            schema: 'ContractsConsumerAdoptionReadbackResult',
            evidence_level: 'diagnostic_only',
            readback: {
              package_name: '@widgetdc/contracts',
              package_version: '0.8.1',
              contracts_commit_sha: '47f82ab0e7a8c4f15453358d57398be703e8d5df',
              consumer_repo: 'Clauskraft/widgetdc-orchestrator',
              consumer_service: 'orchestrator',
              consumer_deployed_sha: 'a84ffcabde541e1fee360cbe3984fdce3db33285',
              runtime_correlation_id: 'lin-1339-contracts-adoption',
              eventspine_replay_count: 1,
              runtime_proof_claimed: false,
              claim_promotion_eligible: false,
            },
          }),
        },
      }),
    }

    const adoption = readConsumerAdoptionReadbackFromEnv(env)

    expect(adoption?.consumer_repo).toBe('Clauskraft/widgetdc-orchestrator')
    expect(adoption?.fingerprint.eventspine_replay_count).toBe(1)
    expect(adoption?.runtime_proof_claimed).toBe(false)
    expect(adoption?.claim_promotion_eligible).toBe(false)
  })

  it('accepts short deployed SHA read-back when it prefixes the merge commit', () => {
    expect(shaMatches(
      'fdf23433a450fc7041b33ef208480469ec4a4bd1',
      'fdf23433a450',
    )).toBe(true)
  })

  it('defaults invalid runtime probe timeouts', () => {
    expect(parseProbeTimeoutMs(undefined)).toBe(30000)
    expect(parseProbeTimeoutMs('')).toBe(30000)
    expect(parseProbeTimeoutMs(' ')).toBe(30000)
    expect(parseProbeTimeoutMs('0')).toBe(30000)
    expect(parseProbeTimeoutMs('-1')).toBe(30000)
    expect(parseProbeTimeoutMs('abc')).toBe(30000)
    expect(parseProbeTimeoutMs('2500')).toBe(2500)
  })

  it('extracts runtime proof fields from health and release payloads', () => {
    expect(extractRuntimeFingerprint(
      {
        release: {
          short_commit_sha: 'fdf23433a450',
        },
        metadata: {
          correlation_id: 'corr-runtime-1',
        },
      },
      {
        release: {
          eventspine_replay_count: 2,
        },
      },
    )).toEqual({
      deployed_sha: 'fdf23433a450',
      runtime_correlation_id: 'corr-runtime-1',
      eventspine_replay_count: 2,
    })
  })

  it('requires deployed SHA, runtime correlation id, and EventSpine replay count for PASS', () => {
    const checks = evaluateRuntimeProof(
      'fdf23433a450fc7041b33ef208480469ec4a4bd1',
      {
        deployed_sha: 'fdf23433a450',
        runtime_correlation_id: 'corr-runtime-1',
        eventspine_replay_count: 1,
      },
      surface.required_runtime_proof,
    )

    expect(checks.every((check) => check.status === 'PASS')).toBe(true)
  })

  it('reports non-JSON HTTP failures without parsing the response body', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html></html>', {
      status: 503,
      statusText: 'Service Unavailable',
    })))

    await expect(fetchJson('https://runtime.test/health'))
      .rejects
      .toThrow('HTTP 503 Service Unavailable')
  })

  it('turns runtime probe failures into structured BLOCKED_RUNTIME evidence checks', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('connect ECONNREFUSED https://runtime.test/health')
    }))

    const probe = await probeRuntime(
      {
        env_name: 'WIDGETDC_CONTRACTS_RUNTIME_URL',
        url: 'https://runtime.test',
      },
      surface,
      'fdf23433a450fc7041b33ef208480469ec4a4bd1',
    )

    expect(probe.fingerprint).toEqual({
      deployed_sha: null,
      runtime_correlation_id: null,
      eventspine_replay_count: null,
    })
    expect(probe.checks).toEqual([{
      id: 'runtime_probe_succeeded',
      status: 'BLOCKED_RUNTIME',
      observed: 'connect ECONNREFUSED [runtime-url]',
    }])
    expect(JSON.stringify(probe)).not.toContain('https://runtime.test')
  })

  it('blocks runtime proof when EventSpine replay is absent', () => {
    const checks = evaluateRuntimeProof(
      'fdf23433a450fc7041b33ef208480469ec4a4bd1',
      {
        deployed_sha: 'fdf23433a450',
        runtime_correlation_id: 'corr-runtime-1',
        eventspine_replay_count: null,
      },
      surface.required_runtime_proof,
    )

    expect(checks.some((check) => check.status === 'BLOCKED_RUNTIME')).toBe(true)
  })

  it('marks evidence as runtime_proof only when all runtime checks pass', () => {
    const checks = evaluateRuntimeProof(
      'fdf23433a450fc7041b33ef208480469ec4a4bd1',
      {
        deployed_sha: 'fdf23433a450',
        runtime_correlation_id: 'corr-runtime-1',
        eventspine_replay_count: 3,
      },
      surface.required_runtime_proof,
    )

    const evidence = buildRuntimeEvidence({
      surface,
      expectedSha: 'fdf23433a450fc7041b33ef208480469ec4a4bd1',
      branch: 'main',
      runtimeUrl: {
        env_name: 'WIDGETDC_CONTRACTS_RUNTIME_URL',
        url: 'https://runtime.test',
      },
      fingerprint: {
        deployed_sha: 'fdf23433a450',
        runtime_correlation_id: 'corr-runtime-1',
        eventspine_replay_count: 3,
      },
      checks,
    })

    expect(evidence.status).toBe('PASS')
    expect(evidence.evidence_level).toBe('runtime_proof')
    expect(evidence.runtime_url).toEqual({
      configured: true,
      env_name: 'WIDGETDC_CONTRACTS_RUNTIME_URL',
    })
    expect(JSON.stringify(evidence)).not.toContain('https://runtime.test')
  })
})
