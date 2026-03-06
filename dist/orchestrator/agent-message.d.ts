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
import { Static } from '@sinclair/typebox';
export declare const AgentId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Claude">, import("@sinclair/typebox").TLiteral<"Gemini">, import("@sinclair/typebox").TLiteral<"DeepSeek">, import("@sinclair/typebox").TLiteral<"Grok">, import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"User">, import("@sinclair/typebox").TLiteral<"System">, import("@sinclair/typebox").TLiteral<"Orchestrator">]>;
export type AgentId = Static<typeof AgentId>;
export declare const AgentMessageSource: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"claude">, import("@sinclair/typebox").TLiteral<"gemini">, import("@sinclair/typebox").TLiteral<"deepseek">, import("@sinclair/typebox").TLiteral<"grok">, import("@sinclair/typebox").TLiteral<"rlm">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"system">, import("@sinclair/typebox").TLiteral<"orchestrator">]>;
export type AgentMessageSource = Static<typeof AgentMessageSource>;
export declare const AgentMessageType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Message">, import("@sinclair/typebox").TLiteral<"Command">, import("@sinclair/typebox").TLiteral<"Answer">, import("@sinclair/typebox").TLiteral<"Handover">, import("@sinclair/typebox").TLiteral<"Alert">, import("@sinclair/typebox").TLiteral<"ToolResult">]>;
export type AgentMessageType = Static<typeof AgentMessageType>;
export declare const AgentMessage: import("@sinclair/typebox").TObject<{
    /** Unique message ID (UUID or Notion page ID) */
    message_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** Who sent this message (known agent or custom ID) */
    from: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Claude">, import("@sinclair/typebox").TLiteral<"Gemini">, import("@sinclair/typebox").TLiteral<"DeepSeek">, import("@sinclair/typebox").TLiteral<"Grok">, import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"User">, import("@sinclair/typebox").TLiteral<"System">, import("@sinclair/typebox").TLiteral<"Orchestrator">]>, import("@sinclair/typebox").TString]>;
    /** Who should receive it (or "All" for broadcast) */
    to: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Claude">, import("@sinclair/typebox").TLiteral<"Gemini">, import("@sinclair/typebox").TLiteral<"DeepSeek">, import("@sinclair/typebox").TLiteral<"Grok">, import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"User">, import("@sinclair/typebox").TLiteral<"System">, import("@sinclair/typebox").TLiteral<"Orchestrator">]>, import("@sinclair/typebox").TLiteral<"All">, import("@sinclair/typebox").TString]>;
    /** Technical source identifier (known or custom) */
    source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"claude">, import("@sinclair/typebox").TLiteral<"gemini">, import("@sinclair/typebox").TLiteral<"deepseek">, import("@sinclair/typebox").TLiteral<"grok">, import("@sinclair/typebox").TLiteral<"rlm">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"system">, import("@sinclair/typebox").TLiteral<"orchestrator">]>, import("@sinclair/typebox").TString]>;
    /** Conversation thread identifier (groups related messages) */
    thread: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** Message classification */
    type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Message">, import("@sinclair/typebox").TLiteral<"Command">, import("@sinclair/typebox").TLiteral<"Answer">, import("@sinclair/typebox").TLiteral<"Handover">, import("@sinclair/typebox").TLiteral<"Alert">, import("@sinclair/typebox").TLiteral<"ToolResult">]>;
    /** The actual message content */
    message: import("@sinclair/typebox").TString;
    /** Optional: reference to an OrchestratorToolCall.call_id */
    call_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** ISO timestamp */
    timestamp: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type AgentMessage = Static<typeof AgentMessage>;
//# sourceMappingURL=agent-message.d.ts.map