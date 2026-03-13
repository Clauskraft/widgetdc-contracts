/**
 * AgentMessage — Shared chat message format
 *
 * Used in the Notion Global Chat database AND over WebSocket/SSE
 * for real-time agent↔agent and agent↔user communication.
 *
 * Matches the Notion Global Chat schema:
 *   From, To, Source, Thread, Type, Message, Timestamp
 *
 * Wire format: snake_case JSON
 */
import { Type, Static } from '@sinclair/typebox'

export const AgentId = Type.Union([
  Type.Literal('Claude'),
  Type.Literal('Gemini'),
  Type.Literal('DeepSeek'),
  Type.Literal('Grok'),
  Type.Literal('RLM'),
  Type.Literal('User'),
  Type.Literal('System'),
  Type.Literal('Orchestrator'),
], {
  $id: 'AgentId',
  description: 'Canonical agent identifiers matching Notion Global Chat From/To schema',
})

export type AgentId = Static<typeof AgentId>

export const AgentMessageSource = Type.Union([
  Type.Literal('claude'),
  Type.Literal('gemini'),
  Type.Literal('deepseek'),
  Type.Literal('grok'),
  Type.Literal('rlm'),
  Type.Literal('user'),
  Type.Literal('system'),
  Type.Literal('orchestrator'),
], {
  $id: 'AgentMessageSource',
  description: 'Lowercase source identifier for technical routing',
})

export type AgentMessageSource = Static<typeof AgentMessageSource>

export const AgentMessageType = Type.Union([
  Type.Literal('Message'),     // Free-form chat message
  Type.Literal('Command'),     // Directive to execute something
  Type.Literal('Answer'),      // Response to a previous Command or Question
  Type.Literal('Handover'),    // Formal agent handover (sprint transitions)
  Type.Literal('Alert'),       // System alert or urgent notification
  Type.Literal('ToolResult'),  // Result of an Orchestrator tool call
], {
  $id: 'AgentMessageType',
  description: 'Classification of the message purpose',
})

export type AgentMessageType = Static<typeof AgentMessageType>

export const AgentMessage = Type.Object({
  /** Unique message ID (UUID or Notion page ID) */
  message_id: Type.Optional(Type.String({
    description: 'Unique message identifier (assigned by storage layer)',
  })),

  /** Who sent this message (known agent or custom ID) */
  from: Type.Union([AgentId, Type.String()], {
    description: 'Sender agent ID',
  }),

  /** Who should receive it (or "All" for broadcast) */
  to: Type.Union([AgentId, Type.Literal('All'), Type.String()], {
    description: 'Target recipient or All for broadcast',
  }),

  /** Technical source identifier (known or custom) */
  source: Type.Union([AgentMessageSource, Type.String()], {
    description: 'Technical source identifier (e.g. "claude", "browser")',
  }),

  /** Conversation thread identifier (groups related messages) */
  thread: Type.Optional(Type.String({
    description: 'Thread ID for grouping related messages (e.g. "widgetdc-sprint-march26")',
  })),

  /** Message classification */
  type: AgentMessageType,

  /** The actual message content */
  message: Type.String({
    minLength: 1,
    description: 'Message text content (markdown supported)',
  }),

  /** Optional: reference to an OrchestratorToolCall.call_id */
  call_id: Type.Optional(Type.String({
    description: 'Links this message to a specific tool call (for ToolResult messages)',
  })),

  /** Storage-layer assigned message ID */
  id: Type.Optional(Type.String({
    description: 'Storage-layer assigned message ID (e.g. UUID or Redis-generated)',
  })),

  /** Thread grouping — groups related messages (alias for thread) */
  thread_id: Type.Optional(Type.String({
    description: 'Thread ID for grouping related messages',
  })),

  /** Direct reply-to message ID */
  parent_id: Type.Optional(Type.String({
    description: 'ID of the message this is a direct reply to',
  })),

  /** Attached files */
  files: Type.Optional(Type.Array(Type.Object({
    name: Type.String(),
    size: Type.Number(),
    type: Type.String(),
  }), {
    description: 'File attachments on this message',
  })),

  /** Arbitrary metadata (provider info, conversation_id, etc.) */
  metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown(), {
    description: 'Extensible metadata (e.g. provider, model, duration_ms, conversation_id)',
  })),

  /** ISO timestamp */
  timestamp: Type.Optional(Type.String({
    format: 'date-time',
    description: 'When this message was created',
  })),
}, {
  $id: 'AgentMessage',
  description: 'Shared message format for agent↔agent and agent↔user communication. Matches Notion Global Chat schema.',
})

export type AgentMessage = Static<typeof AgentMessage>
