import { describe, it, expect } from 'vitest'
import '../src/formats.js'
import { Value } from '@sinclair/typebox/value'
import { NodeLabel, RelationshipType } from '../src/graph/index.js'

describe('architecture/dominance-labels', () => {
  const dominanceLabels = [
    'ScavengerProbe',
    'AdoptedIP',
    'CompetitorShadow',
    'GoldenEgg',
    'FabricController',
    'ExitPath',
    'ComplianceGap',
    'StrategicLeverage',
    'AuditProof',
    'CriticalFunction',
    'ResilienceMetric',
    'GridFunction',
    'AnomalyPheromone',
    'NormalizerConfig'
  ]

  it('validates all 14 Pillar 1-12 labels', () => {
    for (const label of dominanceLabels) {
      expect(Value.Check(NodeLabel, label)).toBe(true)
    }
  })

  it('rejects non-canonical labels', () => {
    expect(Value.Check(NodeLabel, 'ShadowBroker')).toBe(false)
    expect(Value.Check(NodeLabel, 'VampireEngine')).toBe(false)
  })
})

describe('architecture/dominance-relationships', () => {
  const dominanceRels = [
    'FLOWS_TO',
    'REPRESENTS_VALUE',
    'ADOPTED_FROM',
    'STRATEGIC_VALUE',
    'INTERCEPTS',
    'DRAINS',
    'EXIT_PATH_FOR',
    'REMEDIATES',
    'LEVERAGES',
    'SUPPORTS_CIF',
    'DEPENDS_ON_CTPP',
    'VERIFIES_RESILIENCE',
    'MONITORS_GRID',
    'BRIDGES_OT_IT',
    'REPORTED_AS_NIS2',
    'PROVIDES_FREEDOM_FROM',
    'MAPS_LEGACY_DEBT',
    'GOVERNS_CITIZEN_DATA',
    'NORMALIZED_FROM',
    'PART_OF_HYPERGRAPH',
    'DEVIATES_FROM_BASELINE'
  ]

  it('validates all 21 Pillar 1-12 relationships', () => {
    for (const rel of dominanceRels) {
      expect(Value.Check(RelationshipType, rel)).toBe(true)
    }
  })
})

describe('architecture/viking-simulation-parity', () => {
  // Real data from arch/simulations/viking_leverage_map.json
  const simulationData = {
    leverage: {
      leverage_id: "lev_viking_dominance_001",
      target_id: "comp_danish_energy_grid_legacy",
      leverage_type: "compliance_gap",
      financial_impact_score: 85000000.0,
      remediation_contract_ref: "contract_autonomous_auditor_v1",
      calculated_at: "2026-03-18T14:43:39.665Z"
    },
    fabric: {
      controller_id: "wdc_viking_audit_fabric",
      fabric_type: "software_nvlink",
      health_status: "optimal"
    }
  }

  it('aligns with StrategicLeverage labels and types', () => {
    expect(Value.Check(NodeLabel, 'StrategicLeverage')).toBe(true)
    expect(Value.Check(NodeLabel, 'ComplianceGap')).toBe(true)
    expect(Value.Check(RelationshipType, 'LEVERAGES')).toBe(true)
  })

  it('aligns with FabricController labels and types', () => {
    expect(Value.Check(NodeLabel, 'FabricController')).toBe(true)
    expect(RelationshipType.anyOf.some(r => 'const' in r && r.const === 'CONTROLS')).toBe(true)
  })
})
