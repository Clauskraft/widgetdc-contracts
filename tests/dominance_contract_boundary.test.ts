import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('dominance contract boundary', () => {
  it('keeps doc-only dominance concepts explicitly downgraded until a real payload contract exists', () => {
    const shadowTwinDoc = readFileSync('./docs/supremacy_designs/04_SHADOW_BUSINESS_TWIN.md', 'utf8')
    const multipliersDoc = readFileSync('./docs/supremacy_designs/algorithms/05_HARDCORE_ALGORITHMIC_MULTIPLIERS.md', 'utf8')

    expect(existsSync('./schemas/graph/StrategicLeverage.json')).toBe(true)
    expect(existsSync('./schemas/graph/FabricController.json')).toBe(true)

    expect(existsSync('./schemas/graph/AlgorithmicScore.json')).toBe(false)
    expect(existsSync('./schemas/orchestrator/ShadowTwinSimulation.json')).toBe(false)
    expect(existsSync('./schemas/orchestrator/SimulationConstraint.json')).toBe(false)

    expect(shadowTwinDoc).toContain('overdesign-downgrade')
    expect(shadowTwinDoc).toContain('ShadowTwinSimulation')
    expect(multipliersDoc).toContain('overdesign-downgrade')
    expect(multipliersDoc).toContain('AlgorithmicScore')
  })
})
