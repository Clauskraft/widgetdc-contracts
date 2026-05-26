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

  it('emits importable Python modules for schema names with hyphens', () => {
    const compile = spawnSync('python', ['-m', 'py_compile', 'python/widgetdc_contracts/__init__.py'], {
      cwd: repoRoot,
      encoding: 'utf-8',
    })

    expect(compile.status, `${compile.stdout}\n${compile.stderr}`).toBe(0)

    const importCheck = spawnSync('python', ['-c', 'import widgetdc_contracts; from widgetdc_contracts import decision_bom'], {
      cwd: join(repoRoot, 'python'),
      encoding: 'utf-8',
    })

    expect(importCheck.status, `${importCheck.stdout}\n${importCheck.stderr}`).toBe(0)
  })
})
