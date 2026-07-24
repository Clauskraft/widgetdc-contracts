import { execFileSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

function gitCheckAttr(attribute: 'eol' | 'text', path: string): string {
  return execFileSync('git', ['check-attr', attribute, '--', path], {
    encoding: 'utf8',
  }).trim()
}

describe('build artifact parity', () => {
  it('pins tracked generated artifacts to repository-local LF output', () => {
    const generatedArtifactPaths = [
      'dist/index.js',
      'dist/capability/contract-core.js',
      'dist/capability/contract-core.d.ts',
      'dist/llm/llm-matrix.json',
      'dist/llm/llm_matrix.py',
      'src/llm/llm-matrix.json',
      'src/llm/llm_matrix.py',
      'schemas/capability/AliasResolutionResultV1.json',
      'python/widgetdc_contracts/capability.py',
    ]

    for (const path of generatedArtifactPaths) {
      expect(gitCheckAttr('text', path)).toBe(`${path}: text: set`)
      expect(gitCheckAttr('eol', path)).toBe(`${path}: eol: lf`)
    }
  })
})
