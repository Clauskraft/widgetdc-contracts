#!/usr/bin/env node
/**
 * copy-llm-assets — Post-build step
 *
 * tsc does not copy non-TS files to dist/. LlmMatrix.ts imports
 * llm-matrix.json at runtime via ESM `import ... with { type: 'json' }`,
 * so the JSON must physically exist at dist/llm/llm-matrix.json.
 *
 * Also copies the Python mirror to dist/llm/ so it ships with the package.
 */

import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

const assets = [
  { src: 'src/llm/llm-matrix.json', dest: 'dist/llm/llm-matrix.json' },
  { src: 'src/llm/llm_matrix.py', dest: 'dist/llm/llm_matrix.py' },
]

for (const { src, dest } of assets) {
  const srcPath = join(repoRoot, src)
  const destPath = join(repoRoot, dest)

  if (!existsSync(srcPath)) {
    console.error(`[copy-llm-assets] Source not found: ${src}`)
    process.exit(1)
  }

  mkdirSync(dirname(destPath), { recursive: true })
  copyFileSync(srcPath, destPath)
  console.log(`[copy-llm-assets] ${src} -> ${dest}`)
}

console.log('[copy-llm-assets] done')
