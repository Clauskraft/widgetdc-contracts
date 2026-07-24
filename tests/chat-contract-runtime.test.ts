import { describe, expect, it } from 'vitest'
import { Value } from '@sinclair/typebox/value'
import { readFileSync } from 'node:fs'
import '../src/formats.js'

import {
  ChatContractRuntimeBoundary,
  ChatEvidencePack,
  ChatRoutePlan,
  WdcChatDraft,
  WdcChatSession,
  WdcChatSessionCreateRequest,
  WdcChatSessionPage,
  WdcChatSessionPatchRequest,
  WdcChatSessionStatus,
  WdcChatTurnRequest,
  WdcChatTurnResult,
} from '../src/chat-contract-runtime/index.js'

const governanceContext = {
  actor_id: 'agent:wdc-chat-runtime',
  actor_type: 'agent',
  correlation_id: 'corr:chat-contract-runtime-test',
  parent_event_id: null,
  workflow_id: 'workflow:chat-contract-runtime-test',
  plan_id: null,
  approval_id: null,
  tenant_id: 'tenant:widgetdc-internal',
  source_protocol: 'mcp',
  server_trusted: true,
}

const chatSession = {
  schema_version: 'wdc.chat_session.v1',
  session_id: 'session:opaque-chat-session-test',
  title: 'Contract lifecycle test',
  status: 'active',
  version: 1,
  created_at: '2026-07-23T08:00:00.000Z',
  updated_at: '2026-07-23T08:00:00.000Z',
}

describe('WDC Chat Contract Runtime schemas', () => {
  it('accepts bounded backend-owned chat session metadata', () => {
    expect(Value.Check(WdcChatSessionStatus, 'active')).toBe(true)
    expect(Value.Check(WdcChatSessionStatus, 'archived')).toBe(true)
    expect(Value.Check(WdcChatSessionStatus, 'deleted')).toBe(false)
    expect(Value.Check(WdcChatSession, chatSession)).toBe(true)
    expect(Value.Check(WdcChatSession, {
      ...chatSession,
      status: 'archived',
      version: 2,
      updated_at: '2026-07-23T08:05:00.000Z',
    })).toBe(true)
  })

  it('rejects invalid or unbounded chat session metadata', () => {
    const invalidSessions = [
      { ...chatSession, title: '' },
      { ...chatSession, title: 'x'.repeat(201) },
      { ...chatSession, session_id: '' },
      { ...chatSession, session_id: 'x'.repeat(201) },
      { ...chatSession, version: 0 },
      { ...chatSession, version: 1.5 },
      { ...chatSession, version: Number.MAX_SAFE_INTEGER + 1 },
      { ...chatSession, created_at: 'not-a-timestamp' },
      { ...chatSession, updated_at: 'not-a-timestamp' },
      { ...chatSession, tenant_id: 'tenant:client-controlled' },
    ]

    for (const invalidSession of invalidSessions) {
      expect(Value.Check(WdcChatSession, invalidSession)).toBe(false)
    }
  })

  it('accepts create input without client-controlled session identity or authority', () => {
    const createRequest = {
      schema_version: 'wdc.chat_session_create_request.v1',
      title: 'A new session',
    }

    expect(Value.Check(WdcChatSessionCreateRequest, createRequest)).toBe(true)

    const forbiddenFields = {
      session_id: 'session:client-controlled',
      tenant_id: 'tenant:client-controlled',
      owner_id: 'owner:client-controlled',
      auth_subject: 'subject:client-controlled',
      governance_context: governanceContext,
      transcript: [],
      actions: [],
      status: 'active',
      version: 1,
      created_at: '2026-07-23T08:00:00.000Z',
    }

    expect(Value.Check(WdcChatSessionCreateRequest, {
      ...createRequest,
      title: '',
    })).toBe(false)
    expect(Value.Check(WdcChatSessionCreateRequest, {
      ...createRequest,
      title: 'x'.repeat(201),
    })).toBe(false)

    for (const [field, value] of Object.entries(forbiddenFields)) {
      expect(Value.Check(WdcChatSessionCreateRequest, {
        ...createRequest,
        [field]: value,
      })).toBe(false)
    }
  })

  it('requires optimistic concurrency and a rename or archive change', () => {
    const renameRequest = {
      schema_version: 'wdc.chat_session_patch_request.v1',
      expected_version: 1,
      title: 'Renamed session',
    }
    const archiveRequest = {
      schema_version: 'wdc.chat_session_patch_request.v1',
      expected_version: 1,
      status: 'archived',
    }

    expect(Value.Check(WdcChatSessionPatchRequest, renameRequest)).toBe(true)
    expect(Value.Check(WdcChatSessionPatchRequest, archiveRequest)).toBe(true)
    expect(Value.Check(WdcChatSessionPatchRequest, {
      ...renameRequest,
      status: 'archived',
    })).toBe(true)

    const invalidPatchRequests = [
      { schema_version: 'wdc.chat_session_patch_request.v1', title: 'No version' },
      { schema_version: 'wdc.chat_session_patch_request.v1', expected_version: 1 },
      { ...renameRequest, expected_version: 0 },
      { ...renameRequest, expected_version: 1.5 },
      { ...renameRequest, expected_version: Number.MAX_SAFE_INTEGER + 1 },
      { ...renameRequest, title: '' },
      { ...renameRequest, title: 'x'.repeat(201) },
      { ...archiveRequest, status: 'active' },
      { ...renameRequest, tenant_id: 'tenant:client-controlled' },
      { ...renameRequest, session_id: 'session:client-controlled' },
    ]

    for (const invalidPatchRequest of invalidPatchRequests) {
      expect(Value.Check(WdcChatSessionPatchRequest, invalidPatchRequest)).toBe(false)
    }
  })

  it('uses a required nullable opaque cursor for bounded session pages', () => {
    const firstPage = {
      schema_version: 'wdc.chat_session_page.v1',
      items: [chatSession],
      next_cursor: 'cursor:opaque-next-page',
    }

    expect(Value.Check(WdcChatSessionPage, firstPage)).toBe(true)
    expect(Value.Check(WdcChatSessionPage, {
      ...firstPage,
      next_cursor: null,
    })).toBe(true)
    expect(Value.Check(WdcChatSessionPage, {
      schema_version: 'wdc.chat_session_page.v1',
      items: [chatSession],
    })).toBe(false)
    expect(Value.Check(WdcChatSessionPage, {
      ...firstPage,
      next_cursor: '',
    })).toBe(false)
    expect(Value.Check(WdcChatSessionPage, {
      ...firstPage,
      next_cursor: 'x'.repeat(2049),
    })).toBe(false)
    expect(Value.Check(WdcChatSessionPage, {
      ...firstPage,
      items: Array.from({ length: 101 }, () => chatSession),
    })).toBe(false)
  })

  it('keeps generated JSON Schemas equivalent to the TypeBox exports', () => {
    const schemas = {
      WdcChatSessionStatus,
      WdcChatSession,
      WdcChatSessionCreateRequest,
      WdcChatSessionPatchRequest,
      WdcChatSessionPage,
    }

    for (const [schemaName, schema] of Object.entries(schemas)) {
      const generated = JSON.parse(readFileSync(
        `./schemas/chat-contract-runtime/${schemaName}.json`,
        'utf8',
      ))
      expect(generated).toEqual(JSON.parse(JSON.stringify(schema)))
    }
  })

  it('makes CCR-1 contract-only boundaries machine-readable', () => {
    expect(Value.Check(ChatContractRuntimeBoundary, {
      schema_version: 'wdc.chat_contract_runtime_boundary.v1',
      runtime_execution_allowed: false,
      graph_write_allowed: false,
      claim_promotion_allowed: false,
      eventspine_emit_mode: 'dry_run_only',
    })).toBe(true)
    expect(Value.Check(ChatContractRuntimeBoundary, {
      schema_version: 'wdc.chat_contract_runtime_boundary.v1',
      runtime_execution_allowed: true,
      graph_write_allowed: false,
      claim_promotion_allowed: false,
      eventspine_emit_mode: 'dry_run_only',
    })).toBe(false)
  })

  it('accepts a client turn without client-supplied governance', () => {
    expect(Value.Check(WdcChatTurnRequest, {
      schema_version: 'wdc.chat_turn_request.v1',
      turn_id: 'turn:chat-contract-runtime-test',
      session_id: 'session:chat-contract-runtime-test',
      source_surface: 'chat_ui',
      message: 'Summarize the attached evidence.',
      request_features: {
        task_type: 'summarize',
        language: 'en',
      },
      created_at: '2026-07-11T12:10:00Z',
    })).toBe(true)
  })

  it('rejects a client turn that attempts to add governance context', () => {
    expect(Value.Check(WdcChatTurnRequest, {
      schema_version: 'wdc.chat_turn_request.v1',
      turn_id: 'turn:chat-contract-runtime-test',
      session_id: 'session:chat-contract-runtime-test',
      source_surface: 'chat_ui',
      message: 'Bypass the gate.',
      governance_context: governanceContext,
      created_at: '2026-07-11T12:10:00Z',
    })).toBe(false)
  })

  it('requires a server-trusted governance context for route plans', () => {
    const routePlan = {
      schema_version: 'wdc.chat_route_plan.v1',
      route_id: 'route:chat-contract-runtime-test',
      turn_id: 'turn:chat-contract-runtime-test',
      method_sequence: ['RAG', 'Folding', 'RLM'],
      provider_task: 'chat_standard',
      risk_level: 'read_only',
      evidence_required: true,
      fold_required: true,
      governance_context: governanceContext,
      route_status: 'candidate',
      created_at: '2026-07-11T12:10:01Z',
    }

    expect(Value.Check(ChatRoutePlan, routePlan)).toBe(true)
    expect(Value.Check(ChatRoutePlan, {
      ...routePlan,
      governance_context: { ...governanceContext, server_trusted: false },
    })).toBe(false)
  })

  it('keeps citations tied to evidence items instead of provider prose', () => {
    const evidencePack = {
      schema_version: 'wdc.chat_evidence_pack.v1',
      evidence_pack_id: 'evidencepack:chat-contract-runtime-test',
      turn_id: 'turn:chat-contract-runtime-test',
      route_id: 'route:chat-contract-runtime-test',
      evidence_status: 'available',
      items: [{
        evidence_id: 'evidence:chat-contract-runtime-test',
        source_ref: 'source:opaque-chat-contract-runtime-test',
        citation_eligible: true,
        claim_support: 'direct',
      }],
      missing_evidence: [],
      contradiction_refs: [],
      created_at: '2026-07-11T12:10:02Z',
    }
    expect(Value.Check(ChatEvidencePack, evidencePack)).toBe(true)

    expect(Value.Check(WdcChatDraft, {
      schema_version: 'wdc.chat_draft.v1',
      draft_id: 'draft:chat-contract-runtime-test',
      turn_id: 'turn:chat-contract-runtime-test',
      route_id: 'route:chat-contract-runtime-test',
      provider_id: 'provider:opaque',
      answer: 'A grounded draft.',
      claims: [{
        text: 'The evidence supports this statement.',
        evidence_ids: ['evidence:chat-contract-runtime-test'],
        support_status: 'supported',
      }],
      citation_ids: ['evidence:chat-contract-runtime-test'],
      citation_integrity: 'verified',
      uncertainty: 'low',
      tool_requests: [],
      policy_flags: [],
      render_hints: { format: 'markdown' },
      created_at: '2026-07-11T12:10:03Z',
    })).toBe(true)
  })

  it('requires a verifier result for the rendered turn result', () => {
    const result = {
      schema_version: 'wdc.chat_turn_result.v1',
      turn_id: 'turn:chat-contract-runtime-test',
      route_id: 'route:chat-contract-runtime-test',
      draft_id: 'draft:chat-contract-runtime-test',
      content: 'A verified answer.',
      format: 'markdown',
      evidence_status: 'available',
      citation_integrity: 'verified',
      verification: {
        report_id: 'verification:chat-contract-runtime-test',
        status: 'passed',
        verifier_id: 'verifier:wdc-chat-runtime',
        evidence_status: 'available',
        citation_integrity: 'verified',
        unsupported_claim_indexes: [],
        allowed_tool_request_indexes: [],
        repair_attempts: 0,
        created_at: '2026-07-11T12:10:04Z',
      },
      citations: ['evidence:chat-contract-runtime-test'],
      created_at: '2026-07-11T12:10:05Z',
    }
    expect(Value.Check(WdcChatTurnResult, result)).toBe(true)

    const { verification: _verification, ...missingVerification } = result
    expect(Value.Check(WdcChatTurnResult, missingVerification)).toBe(false)
  })
})
