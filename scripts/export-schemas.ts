/**
 * Exports all TypeBox schemas to JSON Schema files in schemas/.
 * Schemas with $id use that as filename; others use the export name.
 * Run via: npm run schemas
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
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
import * as orchestrator from '../src/orchestrator/index.js'
import * as opportunities from '../src/opportunities/index.js'
import * as mcp from '../src/mcp/index.js'
import * as adoption from '../src/adoption/index.js'
import * as mrp from '../src/mrp/index.js'
import * as security from '../src/security/index.js'
import * as decisionBom from '../src/decision-bom/index.js'
import * as chatContractRuntime from '../src/chat-contract-runtime/index.js'
import * as continuation from '../src/continuation/index.js'
import * as parl from '../src/parl/index.js'
import * as execution from '../src/execution/index.js'
import * as capability from '../src/capability/index.js'

const modules: Record<string, Record<string, unknown>> = {
  cognitive,
  health,
  http,
  consulting,
  agent,
  graph,
  orchestrator,
  opportunities,
  mcp,
  adoption,
  mrp,
  security,
  'decision-bom': decisionBom,
  'chat-contract-runtime': chatContractRuntime,
  continuation,
  parl,
  execution,
  capability,
}
const capabilityCanonicalRootExports = new Set(
  Object.keys(capability.CAPABILITY_CONTRACT_SCHEMA_IDS),
)

export interface SchemaExportOutput {
  readonly moduleName: string
  readonly exportName: string
  readonly outPath: string
  readonly schema: Record<string, unknown>
}

export interface SchemaExportReceipt {
  readonly completed: true
  readonly exportedCount: number
  readonly writtenCount: number
  readonly skippedCount: number
  readonly schemasDir: string
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
    return `{${entries
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function parseJsonObject(content: string): unknown {
  return JSON.parse(content.replace(/^\uFEFF/, ''))
}

export function writeJsonIfSemanticallyChanged(outPath: string, schema: Record<string, unknown>): boolean {
  const nextContent = `${JSON.stringify(schema, null, 2)}\n`
  if (existsSync(outPath)) {
    const currentContent = readFileSync(outPath, 'utf-8')
    if (currentContent === nextContent) {
      return false
    }
    try {
      if (canonicalJson(parseJsonObject(currentContent)) === canonicalJson(schema)) {
        return false
      }
    } catch {
      // Existing invalid JSON must be replaced by the generated canonical file.
    }
  }

  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, nextContent)
  return true
}

export function collectSchemaExports(
  schemaModules: Record<string, Record<string, unknown>> = modules,
  schemasDir: string = SCHEMAS_DIR,
): SchemaExportOutput[] {
  const outputs: SchemaExportOutput[] = []

  for (const [moduleName, exports] of Object.entries(schemaModules)) {
    for (const [exportName, schema] of Object.entries(exports)) {
      if (
        moduleName === 'capability'
        && !capabilityCanonicalRootExports.has(exportName)
      ) {
        continue
      }

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
      const filename = id.includes('://') ? basename(new URL(id).pathname) : `${id}.json`
      outputs.push({
        moduleName,
        exportName,
        outPath: join(schemasDir, moduleName, filename),
        schema: outSchema,
      })
    }
  }

  return outputs
}

export function commitSchemaExports(
  outputs: readonly SchemaExportOutput[],
  writeJson: (outPath: string, schema: Record<string, unknown>) => boolean = writeJsonIfSemanticallyChanged,
): Pick<SchemaExportReceipt, 'writtenCount' | 'skippedCount'> {
  let writtenCount = 0
  let skippedCount = 0

  for (const output of outputs) {
    if (writeJson(output.outPath, output.schema)) {
      writtenCount++
    } else {
      skippedCount++
    }
  }

  return { writtenCount, skippedCount }
}

export function exportSchemas(): SchemaExportReceipt {
  const outputs = collectSchemaExports()
  const { writtenCount, skippedCount } = commitSchemaExports(outputs)
  return {
    completed: true,
    exportedCount: outputs.length,
    writtenCount,
    skippedCount,
    schemasDir: SCHEMAS_DIR,
  }
}

function main(): void {
  try {
    const receipt = exportSchemas()
    console.log(
      `Exported ${receipt.exportedCount} schemas to ${receipt.schemasDir} `
      + `(${receipt.writtenCount} written, ${receipt.skippedCount} unchanged)`,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Schema export failed before completion receipt: ${message}`)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
