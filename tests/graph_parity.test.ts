import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { NodeLabel } from '../src/graph/labels.js'
import { RelationshipType } from '../src/graph/relationships.js'

function readJson(path: string): Record<string, any> {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, any>
}

function literalSetFromUnion(schema: { anyOf?: Array<{ const?: string }> }): Set<string> {
  return new Set((schema.anyOf ?? []).map((entry) => entry.const).filter((value): value is string => typeof value === 'string'))
}

describe('graph parity', () => {
  it('keeps NodeLabel aligned across src, schema, dist, and python generation', () => {
    const schema = readJson('./schemas/graph/NodeLabel.json')
    const distDts = readFileSync('./dist/graph/labels.d.ts', 'utf8')
    const pythonGraph = readFileSync('./python/widgetdc_contracts/graph.py', 'utf8')

    const srcLabels = literalSetFromUnion(NodeLabel)
    const schemaLabels = literalSetFromUnion(schema)

    expect(schemaLabels).toEqual(srcLabels)
    expect(schemaLabels).toContain('CompoundingStrategy')
    expect(schemaLabels).toContain('RefinementObservation')
    expect(schemaLabels).toContain('InteractiveWidget')
    expect(distDts).toContain('NormalizerConfig')
    expect(distDts).toContain('GridFunction')
    expect(distDts).toContain('CompoundingStrategy')
    expect(distDts).toContain('RefinementObservation')
    expect(distDts).toContain('InteractiveWidget')
    expect(pythonGraph).toContain("'NormalizerConfig'")
    expect(pythonGraph).toContain("'GridFunction'")
    expect(pythonGraph).toContain("'CompoundingStrategy'")
    expect(pythonGraph).toContain("'RefinementObservation'")
    expect(pythonGraph).toContain("'InteractiveWidget'")
  })

  it('keeps RelationshipType aligned across src, schema, dist, and python generation', () => {
    const schema = readJson('./schemas/graph/RelationshipType.json')
    const distDts = readFileSync('./dist/graph/relationships.d.ts', 'utf8')
    const pythonGraph = readFileSync('./python/widgetdc_contracts/graph.py', 'utf8')

    const srcRelationships = literalSetFromUnion(RelationshipType)
    const schemaRelationships = literalSetFromUnion(schema)

    expect(schemaRelationships).toEqual(srcRelationships)
    expect(distDts).toContain('DEVIATES_FROM_BASELINE')
    expect(distDts).toContain('GOVERNS_CITIZEN_DATA')
    expect(distDts).toContain('RECURSIVELY_REFINES')
    expect(distDts).toContain('COMPOUNDS_INTO')
    expect(distDts).toContain('HOSTS_WIDGET')
    expect(pythonGraph).toContain("'DEVIATES_FROM_BASELINE'")
    expect(pythonGraph).toContain("'GOVERNS_CITIZEN_DATA'")
    expect(pythonGraph).toContain("'RECURSIVELY_REFINES'")
    expect(pythonGraph).toContain("'COMPOUNDS_INTO'")
    expect(pythonGraph).toContain("'HOSTS_WIDGET'")
  })
})
