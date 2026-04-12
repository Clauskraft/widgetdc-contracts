/**
 * agent_contract.test.ts — Conformance tests for Phantom Week 2 canonical agent contract.
 *
 * Covers: AgentRequest, AgentResponse, CapabilityEntry, CapabilityMatrix.
 * Ensures snake_case wire format, $id presence, enum sealing, required vs optional.
 */
import { describe, expect, it } from 'vitest'
import { Value } from '@sinclair/typebox/value'
import '../src/formats.js' // register uuid/date-time FormatRegistry checkers
import {
  AgentRequest,
  AgentResponse,
  AgentConflict,
  AgentPriority,
  AgentResponseStatus,
  CapabilityEntry,
  CapabilityMatrix,
  TokenUsage,
} from '../src/agent/agent-contract.js'

const UUID = '550e8400-e29b-41d4-a716-446655440000'

// ─── Schema Identity ($id presence) ──────────────────────────────────────────

describe('agent-contract: schema identity', () => {
  it('AgentRequest has $id', () => {
    expect(AgentRequest.$id).toBe('AgentRequest')
  })
  it('AgentResponse has $id', () => {
    expect(AgentResponse.$id).toBe('AgentResponse')
  })
  it('AgentConflict has $id', () => {
    expect(AgentConflict.$id).toBe('AgentConflict')
  })
  it('CapabilityEntry has $id', () => {
    expect(CapabilityEntry.$id).toBe('CapabilityEntry')
  })
  it('CapabilityMatrix has $id', () => {
    expect(CapabilityMatrix.$id).toBe('CapabilityMatrix')
  })
  it('TokenUsage has $id', () => {
    expect(TokenUsage.$id).toBe('TokenUsage')
  })
})

// ─── Snake-case Wire Format ──────────────────────────────────────────────────

describe('agent-contract: snake_case wire format', () => {
  it('AgentRequest uses snake_case keys only', () => {
    const keys = Object.keys(AgentRequest.properties)
    for (const k of keys) {
      expect(k).toMatch(/^[a-z][a-z0-9_]*$/)
    }
    expect(keys).toContain('request_id')
    expect(keys).toContain('agent_id')
    expect(keys).not.toContain('requestId')
    expect(keys).not.toContain('agentId')
  })

  it('AgentResponse uses snake_case keys only', () => {
    const keys = Object.keys(AgentResponse.properties)
    expect(keys).toContain('request_id')
    expect(keys).toContain('agent_id')
    expect(keys).toContain('tokens_used')
    expect(keys).toContain('cost_dkk')
    expect(keys).not.toContain('tokensUsed')
    expect(keys).not.toContain('costDKK')
  })

  it('CapabilityEntry uses snake_case keys only', () => {
    const keys = Object.keys(CapabilityEntry.properties)
    expect(keys).toContain('max_tokens')
    expect(keys).toContain('cost_per_1k')
    expect(keys).toContain('latency_p50_ms')
    expect(keys).toContain('fallback_to')
    expect(keys).not.toContain('maxTokens')
    expect(keys).not.toContain('fallbackTo')
  })
})

// ─── Valid Payload Acceptance ────────────────────────────────────────────────

describe('agent-contract: valid payloads accepted', () => {
  it('accepts a well-formed AgentRequest', () => {
    const req = {
      request_id: UUID,
      agent_id: 'omega-sentinel',
      task: 'audit graph health',
      capabilities: ['reasoning', 'graph'],
      context: { scope: 'all' },
      priority: 'high',
    }
    expect(Value.Check(AgentRequest, req)).toBe(true)
  })

  it('accepts a well-formed AgentResponse', () => {
    const res = {
      request_id: UUID,
      agent_id: 'omega-sentinel',
      status: 'success',
      output: 'audit complete',
      tokens_used: { input: 120, output: 340 },
      cost_dkk: 0.0042,
      conflicts: [],
    }
    expect(Value.Check(AgentResponse, res)).toBe(true)
  })

  it('accepts a conflict AgentResponse with advisory conflicts', () => {
    const res = {
      request_id: UUID,
      agent_id: 'claude-code',
      status: 'conflict',
      output: '',
      tokens_used: { input: 0, output: 0 },
      cost_dkk: 0,
      conflicts: [{
        other_agent_id: 'cursor',
        other_task: 'build authentication system',
        similarity: 0.82,
        mode: 'advisory',
        suggestion: 'Consider collaborating with cursor',
      }],
    }
    expect(Value.Check(AgentResponse, res)).toBe(true)
  })

  it('accepts a CapabilityEntry without fallback_to (terminal)', () => {
    const entry = {
      provider: 'claude',
      model: 'claude-opus-4-6',
      capabilities: ['reasoning', 'code', 'multilingual'],
      max_tokens: 200000,
      cost_per_1k: { input: 0.015, output: 0.075 },
      latency_p50_ms: 2500,
    }
    expect(Value.Check(CapabilityEntry, entry)).toBe(true)
  })
})

// ─── Invalid Payload Rejection ───────────────────────────────────────────────

describe('agent-contract: invalid payloads rejected', () => {
  it('rejects AgentRequest with camelCase keys', () => {
    const bad = {
      requestId: UUID,
      agentId: 'x',
      task: 't',
      capabilities: [],
      context: {},
      priority: 'low',
    }
    expect(Value.Check(AgentRequest, bad)).toBe(false)
  })

  it('rejects AgentRequest with unknown priority enum value', () => {
    const bad = {
      request_id: UUID,
      agent_id: 'x',
      task: 't',
      capabilities: [],
      context: {},
      priority: 'urgent', // not in enum
    }
    expect(Value.Check(AgentRequest, bad)).toBe(false)
  })

  it('rejects AgentResponse with additional properties', () => {
    const bad = {
      request_id: UUID,
      agent_id: 'x',
      status: 'success',
      output: '',
      tokens_used: { input: 0, output: 0 },
      cost_dkk: 0,
      conflicts: [],
      extra_field: 'should_not_be_here',
    }
    expect(Value.Check(AgentResponse, bad)).toBe(false)
  })

  it('rejects AgentResponse with missing required conflicts array', () => {
    const bad = {
      request_id: UUID,
      agent_id: 'x',
      status: 'success',
      output: '',
      tokens_used: { input: 0, output: 0 },
      cost_dkk: 0,
      // conflicts missing
    }
    expect(Value.Check(AgentResponse, bad)).toBe(false)
  })

  it('rejects negative cost_dkk', () => {
    const bad = {
      request_id: UUID,
      agent_id: 'x',
      status: 'success',
      output: '',
      tokens_used: { input: 0, output: 0 },
      cost_dkk: -1,
      conflicts: [],
    }
    expect(Value.Check(AgentResponse, bad)).toBe(false)
  })

  it('rejects AgentConflict similarity out of [0,1]', () => {
    const bad = {
      other_agent_id: 'x',
      other_task: 't',
      similarity: 1.5,
      mode: 'advisory',
    }
    expect(Value.Check(AgentConflict, bad)).toBe(false)
  })

  it('rejects CapabilityEntry with non-integer max_tokens', () => {
    const bad = {
      provider: 'x',
      model: 'y',
      capabilities: [],
      max_tokens: 1.5,
      cost_per_1k: { input: 0, output: 0 },
      latency_p50_ms: 100,
    }
    expect(Value.Check(CapabilityEntry, bad)).toBe(false)
  })
})

// ─── Enum Sealing ────────────────────────────────────────────────────────────

describe('agent-contract: enums are sealed', () => {
  it('AgentPriority accepts only the 4 defined values', () => {
    expect(Value.Check(AgentPriority, 'low')).toBe(true)
    expect(Value.Check(AgentPriority, 'normal')).toBe(true)
    expect(Value.Check(AgentPriority, 'high')).toBe(true)
    expect(Value.Check(AgentPriority, 'critical')).toBe(true)
    expect(Value.Check(AgentPriority, 'emergency')).toBe(false)
  })

  it('AgentResponseStatus accepts only the 4 defined values', () => {
    expect(Value.Check(AgentResponseStatus, 'success')).toBe(true)
    expect(Value.Check(AgentResponseStatus, 'partial')).toBe(true)
    expect(Value.Check(AgentResponseStatus, 'failed')).toBe(true)
    expect(Value.Check(AgentResponseStatus, 'conflict')).toBe(true)
    expect(Value.Check(AgentResponseStatus, 'done')).toBe(false)
  })
})

// ─── Fallback Chain Semantics ────────────────────────────────────────────────

describe('agent-contract: capability matrix fallback', () => {
  it('CapabilityMatrix accepts entries with fallback chain', () => {
    const matrix = {
      version: '1.0.0',
      entries: [
        {
          provider: 'deepseek',
          model: 'deepseek-chat',
          capabilities: ['reasoning'],
          max_tokens: 64000,
          cost_per_1k: { input: 0.0001, output: 0.0002 },
          latency_p50_ms: 800,
          fallback_to: 'gpt-4o-mini',
        },
        {
          provider: 'openai',
          model: 'gpt-4o-mini',
          capabilities: ['reasoning'],
          max_tokens: 128000,
          cost_per_1k: { input: 0.00015, output: 0.0006 },
          latency_p50_ms: 1200,
          // terminal: no fallback_to
        },
      ],
    }
    expect(Value.Check(CapabilityMatrix, matrix)).toBe(true)
  })
})
