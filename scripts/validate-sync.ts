/**
 * CI validation: regenerates generated artifacts and diffs against committed versions.
 * Exits non-zero if schemas, dist, or Python artifacts are out of sync with source.
 * Run via: npm run validate
 */
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync, readFileSync, readdirSync, statSync, existsSync, rmSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const GENERATED_DIRS = [
  'schemas',
  'dist',
  join('python', 'widgetdc_contracts'),
]

function getAllFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...getAllFiles(full))
    } else {
      results.push(full)
    }
  }
  return results
}

function readComparable(filePath: string): string {
  return readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n')
}

const tempDir = mkdtempSync(join(tmpdir(), 'wdc-validate-'))
let driftDetected = false

function snapshotGeneratedDirs(): void {
  for (const relDir of GENERATED_DIRS) {
    const absDir = join(ROOT, relDir)
    if (existsSync(absDir)) {
      cpSync(absDir, join(tempDir, relDir), { recursive: true })
    }
  }
}

function compareGeneratedDirs(): void {
  for (const relDir of GENERATED_DIRS) {
    const absDir = join(ROOT, relDir)
    const snapshotDir = join(tempDir, relDir)

    for (const newFile of getAllFiles(absDir)) {
      const relPath = relative(absDir, newFile)
      const oldFile = join(snapshotDir, relPath)

      const newContent = readComparable(newFile)
      try {
        const oldContent = readComparable(oldFile)
        if (newContent !== oldContent) {
          console.error(`DRIFT: ${join(relDir, relPath)}`)
          driftDetected = true
        }
      } catch {
        console.error(`NEW: ${join(relDir, relPath)} - exists in source but not committed`)
        driftDetected = true
      }
    }

    for (const oldFile of getAllFiles(snapshotDir)) {
      const relPath = relative(snapshotDir, oldFile)
      const newFile = join(absDir, relPath)
      if (!existsSync(newFile)) {
        console.error(`MISSING: ${join(relDir, relPath)} - committed artifact was not regenerated`)
        driftDetected = true
      }
    }
  }
}

function restoreGeneratedDirs(): void {
  for (const relDir of GENERATED_DIRS) {
    const absDir = join(ROOT, relDir)
    const snapshotDir = join(tempDir, relDir)
    rmSync(absDir, { recursive: true, force: true })
    if (existsSync(snapshotDir)) {
      cpSync(snapshotDir, absDir, { recursive: true })
    }
  }
  rmSync(tempDir, { recursive: true, force: true })
}

snapshotGeneratedDirs()

try {
  console.log('Regenerating generated artifacts from source...')
  execSync('npm run build && npm run schemas && npm run python', { cwd: ROOT, stdio: 'pipe' })
  compareGeneratedDirs()
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message)
  }
  driftDetected = true
} finally {
  restoreGeneratedDirs()
}

if (driftDetected) {
  console.error('\nGenerated artifact drift detected! Run `npm run build && npm run schemas && npm run python` and commit the results.')
  process.exit(1)
} else {
  console.log('All generated artifacts in sync.')
}
