import { describe, expect, it } from 'vitest'

import { LlmMatrix } from '../src/llm/LlmMatrix.js'

describe('llm matrix provider suspension', () => {
  it('keeps the v1.1.0 provider-suspension matrix internally valid', () => {
    expect(LlmMatrix.version).toBe('1.1.0')
    expect(LlmMatrix.validate()).toEqual([])
  })

  it.each(['reasoning_deep', 'planning', 'chat_premium'] as const)(
    'keeps qwen3 out of the %s reasoning chain',
    (task) => {
      expect(LlmMatrix.getTaskConfig(task).chain).not.toContain('qwen3-235b-a22b')
    },
  )

  it('routes deep reasoning through R1 then V3.2 before paid fallback', () => {
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
