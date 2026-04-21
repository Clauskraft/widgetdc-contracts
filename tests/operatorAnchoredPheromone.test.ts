import { Value } from '@sinclair/typebox/value'
import { describe, expect, it } from 'vitest'
import {
  CreateOperatorAnchoredPheromoneRequest,
  HumanSignaledPheromoneTriggerRequest,
} from '../src/mrp/operatorAnchoredPheromone.js'

describe('operatorAnchoredPheromone contracts', () => {
  it('accepts the canonical backend create payload', () => {
    const valid = Value.Check(CreateOperatorAnchoredPheromoneRequest, {
      anchor: {
        anchor_kind: 'web-url',
        resource_uri: 'https://canvas.widgetdc.test/session/123',
        locator_json: {
          pathname: '/session/123',
          surface: 'canvas',
        },
        anchor_text: 'This interaction smells risky.',
      },
      signal_type: 'risk',
      rationale: 'Operator flagged a likely regression before deploy.',
      client_surface: 'canvas',
      strength: 0.72,
      created_by: 'canvas-operator',
    })

    expect(valid).toBe(true)
  })

  it('accepts the canonical orchestrator human-signaled trigger payload', () => {
    const valid = Value.Check(HumanSignaledPheromoneTriggerRequest, {
      source: 'canvas-operator',
      domain: 'neurogenesis',
      label: 'Operator saw a novel opportunity in the active canvas locus.',
      signal_type: 'opportunity',
      client_surface: 'canvas',
      strength: 0.81,
      rationale: 'Promote this into the human-signaled queue.',
      metrics: {
        confidence: 0.81,
        novelty: 0.93,
      },
      anchor: {
        anchor_kind: 'web-url',
        resource_uri: 'https://canvas.widgetdc.test/session/123',
        locator_json: {
          pathname: '/session/123',
          surface: 'canvas',
        },
      },
    })

    expect(valid).toBe(true)
  })
})

