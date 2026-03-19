import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
describe('python generation hygiene', () => {
  it('regenerates Python models from canonical schemas in the current workspace', () => {
    const result = spawnSync('npm run python', {
      cwd: repoRoot,
      encoding: 'utf-8',
      shell: true,
    })

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)

    const graphModule = readFileSync(join(repoRoot, 'python', 'widgetdc_contracts', 'graph.py'), 'utf-8')

    expect(graphModule).toContain("'NormalizerConfig'")
    expect(graphModule).toContain("'DEVIATES_FROM_BASELINE'")
  })
})
