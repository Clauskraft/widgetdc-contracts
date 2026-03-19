import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { AgentHandshake } from '../src/orchestrator/agent-handshake.js'

function readJson(path: string): Record<string, any> {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, any>
}

describe('AgentHandshake parity', () => {
  it('keeps capability_index aligned as a scalar string across source, schema, and dist types', () => {
    const schema = readJson('./schemas/orchestrator/AgentHandshake.json')
    const distDts = readFileSync('./dist/orchestrator/agent-handshake.d.ts', 'utf8')

    expect(AgentHandshake.properties.capability_index.type).toBe('string')
    expect(schema.properties.capability_index.type).toBe('string')
    expect(distDts).toContain('capability_index: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>')
    expect(distDts).not.toContain('capability_index: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray')
  })
})
