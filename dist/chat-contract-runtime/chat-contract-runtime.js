/**
 * WDC Chat Contract Runtime — CCR-1 candidate contract surface.
 *
 * These schemas normalize a chat turn before and after a provider draft. They
 * do not invoke providers, emit EventSpine events, execute tools, or promote
 * graph/claim truth. Runtime enforcement remains owned by WidgeTDC.
 *
 * Wire format: snake_case JSON.
 */
import { Type } from '@sinclair/typebox';
import { OutputFormat } from '../decision-bom/outputFormat.js';
import { GovernanceContext, GovernanceDecision, GovernanceRiskLevel, } from '../mcp/governance.js';
import { RequestFeatures } from '../mcp/requestFeatures.js';
export const ChatSourceSurface = Type.Union([
    Type.Literal('chat_ui'),
    Type.Literal('wdc_cli'),
    Type.Literal('mcp_app'),
    Type.Literal('desktop_connector'),
    Type.Literal('api'),
], { $id: 'ChatSourceSurface' });
export const ChatRouteMethod = Type.Union([
    Type.Literal('RAG'),
    Type.Literal('Folding'),
    Type.Literal('RLM'),
    Type.Literal('MCP'),
    Type.Literal('LLM'),
    Type.Literal('HumanReview'),
], { $id: 'ChatRouteMethod' });
export const ChatEvidenceStatus = Type.Union([
    Type.Literal('available'),
    Type.Literal('partial'),
    Type.Literal('unavailable'),
], { $id: 'ChatEvidenceStatus' });
export const ChatCitationIntegrity = Type.Union([
    Type.Literal('verified'),
    Type.Literal('partial'),
    Type.Literal('missing'),
    Type.Literal('hallucinated'),
], { $id: 'ChatCitationIntegrity' });
/**
 * Explicit CCR-1 boundary. A runtime consumer must not infer execution rights
 * from contract availability alone.
 */
export const ChatContractRuntimeBoundary = Type.Object({
    schema_version: Type.Literal('wdc.chat_contract_runtime_boundary.v1'),
    runtime_execution_allowed: Type.Literal(false),
    graph_write_allowed: Type.Literal(false),
    claim_promotion_allowed: Type.Literal(false),
    eventspine_emit_mode: Type.Literal('dry_run_only'),
}, {
    $id: 'ChatContractRuntimeBoundary',
    additionalProperties: false,
    description: 'CCR-1 boundary: contract-only candidate surface. Runtime execution, graph writes, claim promotion, and actual EventSpine emission are forbidden.',
});
/**
 * Client ingress. Deliberately excludes GovernanceContext: the runtime gate
 * constructs server-trusted governance after authentication.
 */
export const WdcChatTurnRequest = Type.Object({
    schema_version: Type.Literal('wdc.chat_turn_request.v1'),
    turn_id: Type.String({ minLength: 1 }),
    session_id: Type.String({ minLength: 1 }),
    source_surface: ChatSourceSurface,
    message: Type.String({ minLength: 1 }),
    locale: Type.Optional(Type.String({ minLength: 1 })),
    attachment_refs: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
    context_refs: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
    request_features: Type.Optional(RequestFeatures),
    created_at: Type.String({ format: 'date-time' }),
}, {
    $id: 'WdcChatTurnRequest',
    additionalProperties: false,
    description: 'Normalized untrusted client ingress for one WDC chat turn. Governance context is intentionally excluded and must be created server-side.',
});
export const ChatRoutePlan = Type.Object({
    schema_version: Type.Literal('wdc.chat_route_plan.v1'),
    route_id: Type.String({ minLength: 1 }),
    turn_id: Type.String({ minLength: 1 }),
    method_sequence: Type.Array(ChatRouteMethod, { minItems: 1 }),
    provider_task: Type.String({ minLength: 1 }),
    risk_level: GovernanceRiskLevel,
    evidence_required: Type.Boolean(),
    fold_required: Type.Boolean(),
    bom_item_ids: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
    governance_context: GovernanceContext,
    policy_decision: Type.Optional(GovernanceDecision),
    route_status: Type.Union([
        Type.Literal('candidate'),
        Type.Literal('accepted'),
        Type.Literal('rejected'),
    ]),
    created_at: Type.String({ format: 'date-time' }),
}, {
    $id: 'ChatRoutePlan',
    additionalProperties: false,
    description: 'Server-side route plan for a normalized chat turn. It reuses the canonical GovernanceContext and may reference BOMItems for staged-write-or-higher work.',
});
export const ChatEvidenceItem = Type.Object({
    evidence_id: Type.String({ minLength: 1 }),
    source_ref: Type.String({ minLength: 1, description: 'Opaque WDC-owned evidence reference; never a provider-supplied citation.' }),
    citation_eligible: Type.Boolean(),
    claim_support: Type.Union([
        Type.Literal('direct'),
        Type.Literal('partial'),
        Type.Literal('contradicted'),
        Type.Literal('none'),
    ]),
    content_hash: Type.Optional(Type.String({ pattern: '^sha256:[a-f0-9]{16,64}$' })),
}, {
    $id: 'ChatEvidenceItem',
    additionalProperties: false,
    description: 'One WDC-owned evidence record that may be cited only when citation_eligible is true.',
});
export const ChatEvidencePack = Type.Object({
    schema_version: Type.Literal('wdc.chat_evidence_pack.v1'),
    evidence_pack_id: Type.String({ minLength: 1 }),
    turn_id: Type.String({ minLength: 1 }),
    route_id: Type.String({ minLength: 1 }),
    evidence_status: ChatEvidenceStatus,
    items: Type.Array(ChatEvidenceItem),
    missing_evidence: Type.Array(Type.String()),
    contradiction_refs: Type.Array(Type.String()),
    created_at: Type.String({ format: 'date-time' }),
}, {
    $id: 'ChatEvidencePack',
    additionalProperties: false,
    description: 'WDC-owned evidence pack for a chat turn. Providers consume evidence references but do not invent citation identities.',
});
export const ChatClaimDraft = Type.Object({
    text: Type.String({ minLength: 1 }),
    evidence_ids: Type.Array(Type.String({ minLength: 1 })),
    support_status: Type.Union([
        Type.Literal('supported'),
        Type.Literal('uncertain'),
        Type.Literal('unsupported'),
    ]),
}, {
    $id: 'ChatClaimDraft',
    additionalProperties: false,
});
export const ChatToolRequest = Type.Object({
    tool: Type.String({ minLength: 1 }),
    payload_ref: Type.Optional(Type.String({ minLength: 1 })),
    requested_risk_level: GovernanceRiskLevel,
}, {
    $id: 'ChatToolRequest',
    additionalProperties: false,
    description: 'Provider-proposed tool request. It is not an execution authorization.',
});
export const ChatPolicyFlag = Type.Object({
    code: Type.String({ minLength: 1 }),
    severity: Type.Union([
        Type.Literal('info'),
        Type.Literal('warning'),
        Type.Literal('blocking'),
    ]),
}, {
    $id: 'ChatPolicyFlag',
    additionalProperties: false,
});
export const ChatRenderHints = Type.Object({
    format: OutputFormat,
    response_length: Type.Optional(Type.Union([
        Type.Literal('short'),
        Type.Literal('standard'),
        Type.Literal('detailed'),
    ])),
    locale: Type.Optional(Type.String({ minLength: 1 })),
}, {
    $id: 'ChatRenderHints',
    additionalProperties: false,
});
/**
 * Provider output constrained to WDC-owned fields. This is a draft only and
 * must pass ChatVerificationReport before it becomes a turn result.
 */
export const WdcChatDraft = Type.Object({
    schema_version: Type.Literal('wdc.chat_draft.v1'),
    draft_id: Type.String({ minLength: 1 }),
    turn_id: Type.String({ minLength: 1 }),
    route_id: Type.String({ minLength: 1 }),
    provider_id: Type.String({ minLength: 1 }),
    model_id: Type.Optional(Type.String({ minLength: 1 })),
    answer: Type.String(),
    claims: Type.Array(ChatClaimDraft),
    citation_ids: Type.Array(Type.String({ minLength: 1 })),
    citation_integrity: ChatCitationIntegrity,
    uncertainty: Type.Union([
        Type.Literal('none'),
        Type.Literal('low'),
        Type.Literal('medium'),
        Type.Literal('high'),
    ]),
    tool_requests: Type.Array(ChatToolRequest),
    policy_flags: Type.Array(ChatPolicyFlag),
    render_hints: ChatRenderHints,
    created_at: Type.String({ format: 'date-time' }),
}, {
    $id: 'WdcChatDraft',
    additionalProperties: false,
    description: 'Provider-neutral structured draft. Citation ids are evidence-pack references and tool requests remain subject to governance.',
});
export const ChatVerificationReport = Type.Object({
    report_id: Type.String({ minLength: 1 }),
    status: Type.Union([
        Type.Literal('passed'),
        Type.Literal('repair_required'),
        Type.Literal('rejected'),
    ]),
    verifier_id: Type.String({ minLength: 1 }),
    evidence_status: ChatEvidenceStatus,
    citation_integrity: ChatCitationIntegrity,
    unsupported_claim_indexes: Type.Array(Type.Integer({ minimum: 0 })),
    allowed_tool_request_indexes: Type.Array(Type.Integer({ minimum: 0 })),
    policy_decision: Type.Optional(GovernanceDecision),
    repair_attempts: Type.Integer({ minimum: 0, maximum: 1 }),
    created_at: Type.String({ format: 'date-time' }),
}, {
    $id: 'ChatVerificationReport',
    additionalProperties: false,
    description: 'WDC verifier outcome for a structured chat draft. A repair loop is bounded to one attempt; a rejected draft must degrade safely.',
});
export const WdcChatTurnResult = Type.Object({
    schema_version: Type.Literal('wdc.chat_turn_result.v1'),
    turn_id: Type.String({ minLength: 1 }),
    route_id: Type.String({ minLength: 1 }),
    draft_id: Type.String({ minLength: 1 }),
    content: Type.String(),
    format: OutputFormat,
    evidence_status: ChatEvidenceStatus,
    citation_integrity: ChatCitationIntegrity,
    verification: ChatVerificationReport,
    citations: Type.Array(Type.String({ minLength: 1 })),
    created_at: Type.String({ format: 'date-time' }),
}, {
    $id: 'WdcChatTurnResult',
    additionalProperties: false,
    description: 'Stable renderer result for a verified WDC chat turn. It is not a provider transcript and does not itself prove runtime deployment or claims.',
});
//# sourceMappingURL=chat-contract-runtime.js.map