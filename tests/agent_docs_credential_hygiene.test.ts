import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('agent docs credential hygiene', () => {
  it('uses env placeholders for bearer examples', () => {
    const docs = ['./CODEX.md', './GEMINI.md', './QWEN.md']
    const hardcodedAuthExamples = []

    for (const doc of docs) {
      const text = readFileSync(doc, 'utf8')
      for (const match of text.matchAll(/Bearer\s+([^'"`\s<]+)/g)) {
        const token = match[1]
        if (!token.startsWith('${')) {
          hardcodedAuthExamples.push({ doc, tokenLength: token.length })
        }
      }
    }

    expect(hardcodedAuthExamples).toEqual([])
  })
})
