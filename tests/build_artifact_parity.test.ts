import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function gitCheckAttr(attribute: 'eol' | 'text', path: string): string {
  return execFileSync('git', ['check-attr', attribute, '--', path], {
    encoding: 'utf8',
  }).trim()
}

function initTempGitRepo(): string {
  const repo = mkdtempSync(join(tmpdir(), 'wdc-build-parity-'))
  execFileSync('git', ['init'], { cwd: repo })
  execFileSync('git', ['config', 'user.email', 'parity@example.invalid'], { cwd: repo })
  execFileSync('git', ['config', 'user.name', 'Build Parity Test'], { cwd: repo })
  writeFileSync(join(repo, 'artifact.txt'), 'initial\n', 'utf8')
  execFileSync('git', ['add', 'artifact.txt'], { cwd: repo })
  execFileSync('git', ['commit', '-m', 'initial'], { cwd: repo })
  return repo
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

  it('exposes a fail-closed no-op build status gate', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }

    expect(packageJson.scripts?.['build:parity']).toBe(
      'node scripts/assert-build-artifact-parity.mjs -- npm run build',
    )
    expect(existsSync('scripts/assert-build-artifact-parity.mjs')).toBe(true)
  })

  it('wires the fail-closed build status gate into validation', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }

    expect(packageJson.scripts?.validate).toContain('npm run build:parity')
  })

  it('allows pre-existing tracked source status only when the build preserves it exactly', () => {
    const repo = initTempGitRepo()
    const gateScript = resolve('scripts/assert-build-artifact-parity.mjs')
    try {
      writeFileSync(join(repo, 'artifact.txt'), 'intentional source edit\n', 'utf8')
      execFileSync('node', [gateScript, '--', 'node', '-e', ''], { cwd: repo })
    } finally {
      rmSync(repo, { recursive: true, force: true })
    }
  })

  it('rejects build-induced tracked artifact churn', () => {
    const repo = initTempGitRepo()
    const gateScript = resolve('scripts/assert-build-artifact-parity.mjs')
    try {
      expect(() => execFileSync('node', [
        gateScript,
        '--',
        'node',
        '-e',
        "require('node:fs').writeFileSync('artifact.txt', 'changed by build\\n')",
      ], { cwd: repo })).toThrow()
    } finally {
      rmSync(repo, { recursive: true, force: true })
    }
  })
})
