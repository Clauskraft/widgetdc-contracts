import { describe, expect, it } from 'vitest'
import { Value } from '@sinclair/typebox/value'
import { LogicReconstructionPacket } from '../src/consulting/index.js'

describe('consulting/logic-reconstruction-packet', () => {
  it('validates a minimal reconstruction packet', () => {
    const packet = {
      source_language: 'python',
      reconstruction_method: 'python_ast',
      contextual_summary: 'Determines whether an order can be approved.',
      intent_graph: {
        nodes: [
          { id: 'fn:approve_order', kind: 'function', label: 'approve_order' },
          { id: 'cond:credit_limit', kind: 'condition', label: 'credit_limit > total' },
        ],
        edges: [
          { source: 'fn:approve_order', target: 'cond:credit_limit', relation: 'checks' },
        ],
      },
      invariant_list: ['credit_limit > total'],
    }

    expect(Value.Check(LogicReconstructionPacket, packet)).toBe(true)
  })
})
