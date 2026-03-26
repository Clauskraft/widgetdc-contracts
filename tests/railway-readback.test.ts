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
})
