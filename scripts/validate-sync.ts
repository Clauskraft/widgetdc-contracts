/**
 * CI validation: regenerates schemas and diffs against committed versions.
 * Exits non-zero if schemas are out of sync with TypeBox source.
 * Run via: npm run validate
 */
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync, readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SCHEMAS_DIR = join(ROOT, 'schemas')

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

// Snapshot current schemas
const tempDir = mkdtempSync(join(tmpdir(), 'wdc-validate-'))
if (existsSync(SCHEMAS_DIR)) {
  cpSync(SCHEMAS_DIR, join(tempDir, 'schemas'), { recursive: true })
}

// Regenerate
console.log('Regenerating schemas from TypeBox source...')
execSync('npm run schemas', { cwd: ROOT, stdio: 'pipe' })

// Compare
const newFiles = getAllFiles(SCHEMAS_DIR)
let driftDetected = false

for (const newFile of newFiles) {
  const relPath = relative(SCHEMAS_DIR, newFile)
  const oldFile = join(tempDir, 'schemas', relPath)

  const newContent = readFileSync(newFile, 'utf-8')
  try {
    const oldContent = readFileSync(oldFile, 'utf-8')
    if (newContent !== oldContent) {
      console.error(`DRIFT: ${relPath}`)
      driftDetected = true
    }
  } catch {
    console.error(`NEW: ${relPath} — exists in source but not committed`)
    driftDetected = true
  }
}

// Restore original
if (existsSync(join(tempDir, 'schemas'))) {
  cpSync(join(tempDir, 'schemas'), SCHEMAS_DIR, { recursive: true })
}

if (driftDetected) {
  console.error('\nSchema drift detected! Run `npm run schemas` and commit the results.')
  process.exit(1)
} else {
  console.log('All schemas in sync.')
}
