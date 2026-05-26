import { describe, expect, it } from 'vitest'

import {
  buildRuntimeEvidence,
  detectRuntimeUrl,
  evaluateRuntimeProof,
  extractRuntimeFingerprint,
  normalizeBaseUrl,
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
  it('normalizes runtime URLs without exposing values as evidence', () => {
    expect(normalizeBaseUrl('https://example.test///')).toBe('https://example.test')
    expect(detectRuntimeUrl({
      RAILWAY_URL: 'https://runtime.test/',
    }, surface.runtime_url_env_names)).toEqual({
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

  it('accepts short deployed SHA read-back when it prefixes the merge commit', () => {
    expect(shaMatches(
      'fdf23433a450fc7041b33ef208480469ec4a4bd1',
      'fdf23433a450',
    )).toBe(true)
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
})
