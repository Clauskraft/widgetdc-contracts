import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  collectSchemaExports,
  commitSchemaExports,
  writeJsonIfSemanticallyChanged,
  type SchemaExportOutput,
} from '../scripts/export-schemas.js'

function tempPath(fileName: string): string {
  return join(mkdtempSync(join(tmpdir(), 'wdc-schema-determinism-')), fileName)
}

describe('schema generator determinism', () => {
  it('does not rewrite semantically identical JSON with different formatting or EOLs', () => {
    const outPath = tempPath('Schema.json')
    const original = '{\r\n  \"type\": \"object\",\r\n  \"$id\": \"Example\"\r\n}\r\n'
    writeFileSync(outPath, original)

    const changed = writeJsonIfSemanticallyChanged(outPath, {
      $id: 'Example',
      type: 'object',
    })

    expect(changed).toBe(false)
    expect(readFileSync(outPath, 'utf-8')).toBe(original)
  })

  it('writes only when the generated schema changes semantically', () => {
    const outPath = tempPath('Schema.json')
    writeFileSync(outPath, '{\"$id\":\"Example\",\"type\":\"object\"}\n')

    const changed = writeJsonIfSemanticallyChanged(outPath, {
      $id: 'Example',
      type: 'string',
    })

    expect(changed).toBe(true)
    expect(JSON.parse(readFileSync(outPath, 'utf-8'))).toEqual({
      $id: 'Example',
      type: 'string',
    })
  })

  it('plans schema outputs before committing writes', () => {
    const outputs = collectSchemaExports({
      sample: {
        ExampleSchema: {
          $id: 'ExampleSchema',
          type: 'object',
          [Symbol.for('TypeBox.Kind')]: 'Object',
        },
        NOT_A_SCHEMA: 'skip',
      },
    })

    expect(outputs).toHaveLength(1)
    expect(outputs[0]).toMatchObject({
      moduleName: 'sample',
      exportName: 'ExampleSchema',
    })
    expect(outputs[0]?.outPath.replaceAll('\\', '/')).toContain('/schemas/sample/ExampleSchema.json')
  })

  it('exports only registered capability roots, not reusable nested references', () => {
    const outputs = collectSchemaExports({
      capability: {
        CapabilityIdentifierV1: {
          $id: 'CapabilityIdentifierV1',
          type: 'object',
          [Symbol.for('TypeBox.Kind')]: 'Object',
        },
        CapabilityDefinitionRefV1: {
          type: 'object',
          [Symbol.for('TypeBox.Kind')]: 'Object',
        },
      },
    })

    expect(outputs.map(({ exportName }) => exportName)).toEqual([
      'CapabilityIdentifierV1',
    ])
  })

  it('does not return a completion receipt when a generator write fails', () => {
    const outputs: SchemaExportOutput[] = [{
      moduleName: 'sample',
      exportName: 'ExampleSchema',
      outPath: tempPath('Schema.json'),
      schema: { $id: 'ExampleSchema', type: 'object' },
    }]

    expect(() => commitSchemaExports(outputs, () => {
      throw new Error('simulated interrupted generation')
    })).toThrow(/interrupted generation/)
  })
})
