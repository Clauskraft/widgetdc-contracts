import { describe, it, expect } from 'vitest'
import '../src/formats.js' // register uuid + date-time format validators
import { Value } from '@sinclair/typebox/value'
import {
  FabricProof,
  OrchestratorToolCall,
  OrchestratorToolResult,
  OrchestratorToolStatus,
  AgentMessage,
  AgentMessageType,
  AgentId,
  AgentMessageSource,
  AgentHandshake,
  AgentHandshakeStatus,
  AgentCapability,
} from '../src/orchestrator/index.js'

describe('orchestrator/tool-call', () => {
  it('OrchestratorToolCall validates a minimal call', () => {
    const call = {
      call_id: '550e8400-e29b-41d4-a716-446655440000',
      agent_id: 'CAPTAIN_CLAUDE',
      tool_name: 'graph.read_cypher',
      arguments: { query: 'MATCH (n) RETURN count(n)' },
    }
    expect(Value.Check(OrchestratorToolCall, call)).toBe(true)
  })

  it('OrchestratorToolCall validates a full call with all optional fields', () => {
    const call = {
      call_id: '550e8400-e29b-41d4-a716-446655440000',
      agent_id: 'GEMINI_ARCHITECT',
      tool_name: 'audit.lessons',
      arguments: { agentId: 'GEMINI_ARCHITECT' },
      fabric_proof: {
        proof_id: '770e8400-e29b-41d4-a716-446655440099',
        proof_type: 'sgt',
        verification_status: 'verified',
        authorized_tool_namespaces: ['audit'],
        issued_at: '2026-03-19T08:00:00Z',
      },
      trace_id: '660e8400-e29b-41d4-a716-446655440001',
      priority: 'high',
      timeout_ms: 15000,
      emitted_at: '2026-03-06T12:00:00Z',
    }
    expect(Value.Check(OrchestratorToolCall, call)).toBe(true)
  })

  it('FabricProof validates a verified SGT proof', () => {
    const proof = {
      proof_id: '770e8400-e29b-41d4-a716-446655440099',
      proof_type: 'sgt',
      verification_status: 'verified',
      authorized_tool_namespaces: ['shell', 'git'],
      issued_at: '2026-03-19T08:00:00Z',
    }
    expect(Value.Check(FabricProof, proof)).toBe(true)
  })

  it('OrchestratorToolCall rejects invalid tool_name format', () => {
    const call = {
      call_id: '550e8400-e29b-41d4-a716-446655440000',
      agent_id: 'AGENT',
      tool_name: 'invalidToolNameWithoutDot',
      arguments: {},
    }
    expect(Value.Check(OrchestratorToolCall, call)).toBe(false)
  })

  it('OrchestratorToolCall rejects missing required fields', () => {
    const call = {
      call_id: '550e8400-e29b-41d4-a716-446655440000',
      // missing agent_id, tool_name, arguments
    }
    expect(Value.Check(OrchestratorToolCall, call)).toBe(false)
  })

  it('OrchestratorToolCall accepts all priority levels', () => {
    const priorities = ['low', 'normal', 'high', 'critical']
    for (const priority of priorities) {
      const call = {
        call_id: '550e8400-e29b-41d4-a716-446655440000',
        agent_id: 'AGENT',
        tool_name: 'graph.stats',
        arguments: {},
        priority,
      }
      expect(Value.Check(OrchestratorToolCall, call)).toBe(true)
    }
  })
})

describe('orchestrator/tool-result', () => {
  it('OrchestratorToolResult validates a success result', () => {
    const result = {
      call_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'success',
      result: { nodes: 137000, relationships: 1100000 },
      duration_ms: 245,
      completed_at: '2026-03-06T12:00:01Z',
    }
    expect(Value.Check(OrchestratorToolResult, result)).toBe(true)
  })

  it('OrchestratorToolResult validates a null result (error case)', () => {
    const result = {
      call_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'error',
      result: null,
      error_message: 'Neo4j connection refused',
      error_code: 'BACKEND_ERROR',
      duration_ms: 5000,
    }
    expect(Value.Check(OrchestratorToolResult, result)).toBe(true)
  })

  it('OrchestratorToolResult validates a timeout result', () => {
    const result = {
      call_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'timeout',
      result: null,
      error_message: 'Call timed out after 30000ms',
      error_code: 'TIMEOUT',
    }
    expect(Value.Check(OrchestratorToolResult, result)).toBe(true)
  })

  it('OrchestratorToolStatus validates all statuses', () => {
    const statuses = ['success', 'error', 'timeout', 'rate_limited', 'unauthorized']
    for (const s of statuses) {
      expect(Value.Check(OrchestratorToolStatus, s)).toBe(true)
    }
    expect(Value.Check(OrchestratorToolStatus, 'pending')).toBe(false)
  })
})

describe('orchestrator/agent-message', () => {
  it('AgentMessage validates a minimal broadcast message', () => {
    const msg = {
      from: 'Claude',
      to: 'All',
      source: 'claude',
      type: 'Message',
      message: 'Graph seeding complete — 110 synergies written to Neo4j.',
    }
    expect(Value.Check(AgentMessage, msg)).toBe(true)
  })

  it('AgentMessage validates a full command message', () => {
    const msg = {
      message_id: 'notion-page-uuid-123',
      from: 'Claude',
      to: 'Gemini',
      source: 'claude',
      thread: 'widgetdc-sprint-march26',
      type: 'Command',
      message: 'Validate RAG pipeline: run graph.read_cypher MATCH (n:ConsultingDomain) RETURN n LIMIT 5',
      trace_id: '550e8400-e29b-41d4-a716-446655440000',
      timestamp: '2026-03-06T12:00:00Z',
    }
    expect(Value.Check(AgentMessage, msg)).toBe(true)
  })

  it('AgentMessage validates a ToolResult message', () => {
    const msg = {
      from: 'Orchestrator',
      to: 'Claude',
      source: 'orchestrator',
      type: 'ToolResult',
      message: '✅ graph.stats returned 137K nodes, 1.1M rels',
      call_id: '550e8400-e29b-41d4-a716-446655440000',
      timestamp: '2026-03-06T12:00:01Z',
    }
    expect(Value.Check(AgentMessage, msg)).toBe(true)
  })

  it('AgentMessage rejects empty message content', () => {
    const msg = {
      from: 'Claude',
      to: 'All',
      source: 'claude',
      type: 'Message',
      message: '', // empty — should fail minLength: 1
    }
    expect(Value.Check(AgentMessage, msg)).toBe(false)
  })

  it('AgentId validates all canonical agents', () => {
    const agents = ['Claude', 'Gemini', 'DeepSeek', 'Grok', 'RLM', 'User', 'System', 'Orchestrator']
    for (const a of agents) {
      expect(Value.Check(AgentId, a)).toBe(true)
    }
    expect(Value.Check(AgentId, 'GPT')).toBe(false)
  })

  it('AgentMessageType validates all 6 types', () => {
    const types = ['Message', 'Command', 'Answer', 'Handover', 'Alert', 'ToolResult']
    for (const t of types) {
      expect(Value.Check(AgentMessageType, t)).toBe(true)
    }
    expect(Value.Check(AgentMessageType, 'Ping')).toBe(false)
  })

  it('AgentMessageSource validates all sources', () => {
    const sources = ['claude', 'gemini', 'deepseek', 'grok', 'rlm', 'user', 'system', 'orchestrator']
    for (const s of sources) {
      expect(Value.Check(AgentMessageSource, s)).toBe(true)
    }
  })
})

describe('orchestrator/agent-handshake', () => {
  it('AgentHandshake validates a minimal handshake', () => {
    const handshake = {
      agent_id: 'CAPTAIN_CLAUDE',
      display_name: 'Claude',
      source: 'claude',
      status: 'online',
      capabilities: ['graph_read', 'mcp_tools'],
      allowed_tool_namespaces: ['graph', 'audit', 'consulting'],
    }
    expect(Value.Check(AgentHandshake, handshake)).toBe(true)
  })

  it('AgentHandshake validates a full handshake', () => {
    const handshake = {
      agent_id: 'GEMINI_ARCHITECT',
      display_name: 'Gemini',
      source: 'gemini',
      version: 'gemini-2.0-flash',
      status: 'standby',
      capabilities: ['graph_read', 'cognitive_reasoning', 'audit'],
      allowed_tool_namespaces: ['graph', 'knowledge', 'audit'],
      fabric_proof: {
        proof_id: '770e8400-e29b-41d4-a716-446655440099',
        proof_type: 'sgt',
        verification_status: 'verified',
        authorized_tool_namespaces: ['graph', 'audit'],
        issued_at: '2026-03-19T08:00:00Z',
      },
      max_concurrent_calls: 3,
      default_thread: 'widgetdc-sprint-march26',
      registered_at: '2026-03-06T10:00:00Z',
      last_seen_at: '2026-03-06T12:00:00Z',
    }
    expect(Value.Check(AgentHandshake, handshake)).toBe(true)
  })

  it('AgentHandshake allows wildcard tool namespace', () => {
    const handshake = {
      agent_id: 'SUPERUSER_AGENT',
      display_name: 'System',
      source: 'system',
      status: 'online',
      capabilities: ['graph_read', 'graph_write', 'mcp_tools', 'code_execution'],
      allowed_tool_namespaces: ['*'], // superuser
    }
    expect(Value.Check(AgentHandshake, handshake)).toBe(true)
  })

  it('AgentHandshake validates all statuses', () => {
    const statuses = ['online', 'standby', 'offline', 'degraded']
    for (const s of statuses) {
      const handshake = {
        agent_id: 'AGENT',
        display_name: 'Claude',
        source: 'claude',
        status: s,
        capabilities: [],
        allowed_tool_namespaces: [],
      }
      expect(Value.Check(AgentHandshake, handshake)).toBe(true)
    }
  })

  it('AgentCapability validates all 10 capabilities', () => {
    const caps = [
      'graph_read', 'graph_write', 'mcp_tools', 'cognitive_reasoning',
      'document_generation', 'osint', 'code_execution', 'ingestion',
      'git_operations', 'audit',
    ]
    for (const c of caps) {
      expect(Value.Check(AgentCapability, c)).toBe(true)
    }
    expect(Value.Check(AgentCapability, 'super_powers')).toBe(false)
  })
})
