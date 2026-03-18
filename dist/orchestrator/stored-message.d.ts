/**
 * StoredMessage — Persisted chat message format
 *
 * Extends AgentMessage with storage-layer fields: id, reactions, pinned.
 * Used by the Orchestrator's chat-store (Redis) and any service that
 * persists agent messages.
 *
 * Wire format: snake_case JSON
 */
import { Static } from '@sinclair/typebox';
export declare const StoredMessage: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
    message_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    from: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Claude">, import("@sinclair/typebox").TLiteral<"Gemini">, import("@sinclair/typebox").TLiteral<"DeepSeek">, import("@sinclair/typebox").TLiteral<"Grok">, import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"User">, import("@sinclair/typebox").TLiteral<"System">, import("@sinclair/typebox").TLiteral<"Orchestrator">]>, import("@sinclair/typebox").TString]>;
    to: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Claude">, import("@sinclair/typebox").TLiteral<"Gemini">, import("@sinclair/typebox").TLiteral<"DeepSeek">, import("@sinclair/typebox").TLiteral<"Grok">, import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"User">, import("@sinclair/typebox").TLiteral<"System">, import("@sinclair/typebox").TLiteral<"Orchestrator">]>, import("@sinclair/typebox").TLiteral<"All">, import("@sinclair/typebox").TString]>;
    source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"claude">, import("@sinclair/typebox").TLiteral<"gemini">, import("@sinclair/typebox").TLiteral<"deepseek">, import("@sinclair/typebox").TLiteral<"grok">, import("@sinclair/typebox").TLiteral<"rlm">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"system">, import("@sinclair/typebox").TLiteral<"orchestrator">]>, import("@sinclair/typebox").TString]>;
    thread: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Message">, import("@sinclair/typebox").TLiteral<"Command">, import("@sinclair/typebox").TLiteral<"Answer">, import("@sinclair/typebox").TLiteral<"Handover">, import("@sinclair/typebox").TLiteral<"Alert">, import("@sinclair/typebox").TLiteral<"ToolResult">, import("@sinclair/typebox").TLiteral<"Arbitration">, import("@sinclair/typebox").TLiteral<"Divergence">]>;
    message: import("@sinclair/typebox").TString;
    call_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    thread_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    parent_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    files: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TString;
        size: import("@sinclair/typebox").TNumber;
        type: import("@sinclair/typebox").TString;
    }>>>;
    metadata: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>>;
    timestamp: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>, import("@sinclair/typebox").TObject<{
    /** Storage-assigned unique ID (required for persistence) */
    id: import("@sinclair/typebox").TString;
    /** Emoji reactions: emoji → list of agent IDs */
    reactions: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>>;
    /** Whether this message is pinned */
    pinned: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>]>;
export type StoredMessage = Static<typeof StoredMessage>;
//# sourceMappingURL=stored-message.d.ts.map