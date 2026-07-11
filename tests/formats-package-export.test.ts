import { Value } from '@sinclair/typebox/value'
import { describe, expect, it } from 'vitest'

const canonicalChatTurn = {
  schema_version: 'wdc.chat_turn_request.v1',
  turn_id: 'turn:formats-export-test',
  session_id: 'session:formats-export-test',
  source_surface: 'api',
  message: 'Validate the canonical chat ingress.',
  created_at: '2026-07-11T14:00:00.000Z',
}

describe('package format export', () => {
  it('exports TypeBox format registration for runtime schema consumers', async () => {
    const { WdcChatTurnRequest } = await import('@widgetdc/contracts/chat-contract-runtime')

    await import('@widgetdc/contracts/formats')

    expect(Value.Check(WdcChatTurnRequest, canonicalChatTurn)).toBe(true)
  })
})
