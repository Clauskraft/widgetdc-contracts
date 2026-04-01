import { describe, expect, it } from 'vitest'

import { extractRlmRuntimeVersion } from '../scripts/railway-readback.ts'

describe('railway-readback RLM version extraction', () => {
  it('prefers top-level version when present', () => {
    expect(extractRlmRuntimeVersion({ version: '7.1.5' })).toBe('7.1.5')
  })

  it('falls back to nested data.version from live RLM health payload', () => {
    expect(
      extractRlmRuntimeVersion({
        success: true,
        data: {
          status: 'healthy',
          version: '7.1.5',
        },
        metadata: {
          version: '7.1.5',
        },
      }),
    ).toBe('7.1.5')
  })

  it('falls back to metadata.version when data.version is absent', () => {
    expect(
      extractRlmRuntimeVersion({
        success: true,
        metadata: {
          version: '7.1.5',
        },
      }),
    ).toBe('7.1.5')
  })

  it('handles full live RLM health payload shape', () => {
    const livePayload = {
      success: true,
      data: {
        status: 'healthy',
        service: 'rlm-engine',
        version: '7.1.5',
        startup_complete: true,
        modules_loaded: true,
      },
      metadata: {
        timestamp: '2026-04-02T10:00:00Z',
        service: 'rlm-engine',
        version: '7.1.5',
      },
    }
    expect(extractRlmRuntimeVersion(livePayload)).toBe('7.1.5')
  })

  it('returns empty string when no version is found anywhere', () => {
    expect(extractRlmRuntimeVersion({ success: true })).toBe('')
    expect(extractRlmRuntimeVersion({})).toBe('')
  })

  it('ignores non-object data/metadata fields', () => {
    expect(extractRlmRuntimeVersion({ data: 'not-an-object' })).toBe('')
    expect(extractRlmRuntimeVersion({ metadata: 42 })).toBe('')
    expect(extractRlmRuntimeVersion({ data: null, metadata: ['arr'] })).toBe('')
  })

  it('top-level version wins over nested versions', () => {
    expect(
      extractRlmRuntimeVersion({
        version: '8.0.0',
        data: { version: '7.1.5' },
        metadata: { version: '7.1.5' },
      }),
    ).toBe('8.0.0')
  })

  it('data.version wins over metadata.version when top-level is absent', () => {
    expect(
      extractRlmRuntimeVersion({
        data: { version: '7.2.0' },
        metadata: { version: '7.1.5' },
      }),
    ).toBe('7.2.0')
  })
})
