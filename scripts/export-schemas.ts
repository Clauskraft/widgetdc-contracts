/**
 * Exports all TypeBox schemas to JSON Schema files in schemas/.
 * Schemas with $id use that as filename; others use the export name.
 * Run via: npm run schemas
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Kind } from '@sinclair/typebox'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCHEMAS_DIR = join(__dirname, '..', 'schemas')

// Import all modules
import * as cognitive from '../src/cognitive/index.js'
import * as health from '../src/health/index.js'
import * as http from '../src/http/index.js'
import * as consulting from '../src/consulting/index.js'
import * as agent from '../src/agent/index.js'
import * as graph from '../src/graph/index.js'

const modules: Record<string, Record<string, unknown>> = {
  cognitive,
  health,
  http,
  consulting,
  agent,
  graph,
}

let exportedCount = 0

for (const [moduleName, exports] of Object.entries(modules)) {
  for (const [exportName, schema] of Object.entries(exports)) {
    // Skip non-schema exports (types, constants like DOMAIN_SHORT_IDS)
    if (
      !schema ||
      typeof schema !== 'object' ||
      Array.isArray(schema) ||
      !(Kind in (schema as Record<symbol, unknown>))
    ) {
      continue
    }

    const s = schema as Record<string, unknown>
    const id = typeof s.$id === 'string' ? s.$id : exportName
    const outSchema = { ...s, $id: id }
    const outPath = join(SCHEMAS_DIR, moduleName, `${id}.json`)
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, JSON.stringify(outSchema, null, 2) + '\n')
    exportedCount++
  }
}

console.log(`Exported ${exportedCount} schemas to ${SCHEMAS_DIR}`)
