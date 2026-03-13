/**
 * StoredMessage — Persisted chat message format
 *
 * Extends AgentMessage with storage-layer fields: id, reactions, pinned.
 * Used by the Orchestrator's chat-store (Redis) and any service that
 * persists agent messages.
 *
 * Wire format: snake_case JSON
 */
import { Type } from '@sinclair/typebox';
import { AgentMessage } from './agent-message.js';
export const StoredMessage = Type.Intersect([
    AgentMessage,
    Type.Object({
        /** Storage-assigned unique ID (required for persistence) */
        id: Type.String({
            description: 'Storage-assigned message ID',
        }),
        /** Emoji reactions: emoji → list of agent IDs */
        reactions: Type.Optional(Type.Record(Type.String(), Type.Array(Type.String()), { description: 'Emoji reactions: emoji key → agent IDs who reacted' })),
        /** Whether this message is pinned */
        pinned: Type.Optional(Type.Boolean({
            description: 'Whether this message is pinned in the chat',
        })),
    }),
], {
    $id: 'StoredMessage',
    description: 'Persisted agent message with storage-layer fields (id, reactions, pinned). Extends AgentMessage.',
});
//# sourceMappingURL=stored-message.js.map