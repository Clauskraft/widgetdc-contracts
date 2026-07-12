import { describe, expect, it } from 'vitest'

import { LlmMatrix } from '../src/llm/LlmMatrix.js'
import matrixData from '../src/llm/llm-matrix.json' with { type: 'json' }

describe('llm matrix provider suspension', () => {
  it('keeps the provider-suspension matrix internally valid + version aligned to source', () => {
    // Assert against the JSON source-of-truth (not a hardcoded literal) so a
    // matrix version bump never re-breaks this test. validate() is the real
    // consistency check.
    expect(LlmMatrix.version).toBe((matrixData as { version: string }).version)
    expect(LlmMatrix.version).toMatch(/^\d+\.\d+\.\d+$/)
    expect(LlmMatrix.validate()).toEqual([])
  })

  it('does not expose the unavailable qwen3 model', () => {
    expect(LlmMatrix.listModels()).not.toContain('qwen3-235b-a22b')
  })

  it.each(['reasoning_deep', 'planning', 'chat_premium'] as const)(
    'keeps qwen3 out of the %s reasoning chain',
    (task) => {
      expect(LlmMatrix.getTaskConfig(task).chain).not.toContain('qwen3-235b-a22b')
    },
  )

  it('routes deep reasoning through R1 then V3.2 before paid GPT fallback', () => {
    expect(LlmMatrix.getTaskConfig('reasoning_deep').chain).toEqual([
      'deepseek-reasoner',
      'deepseek-chat',
      'gpt-4o',
    ])
  })

  it('demotes qwen-plus to last resort for attestation', () => {
    expect(LlmMatrix.getTaskConfig('attestation').chain).toEqual([
      'deepseek-chat',
      'gpt-4o-mini',
      'qwen-plus',
    ])
  })
})
