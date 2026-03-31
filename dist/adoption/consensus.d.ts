import { Static } from '@sinclair/typebox';
/**
 * ConsensusProposal + Vote — Multi-agent decision protocol.
 * Wire format: snake_case JSON.
 *
 * Source: WidgeTDC lib/consensusProtocol.ts
 */
/** Vote decision options */
export declare const VoteDecision: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"approve">, import("@sinclair/typebox").TLiteral<"reject">, import("@sinclair/typebox").TLiteral<"abstain">]>;
export type VoteDecision = Static<typeof VoteDecision>;
/** Consensus outcome states */
export declare const ConsensusOutcome: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"committed">, import("@sinclair/typebox").TLiteral<"aborted">, import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"expired">]>;
export type ConsensusOutcome = Static<typeof ConsensusOutcome>;
/** Individual vote on a proposal */
export declare const ConsensusVote: import("@sinclair/typebox").TObject<{
    voter: import("@sinclair/typebox").TString;
    decision: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"approve">, import("@sinclair/typebox").TLiteral<"reject">, import("@sinclair/typebox").TLiteral<"abstain">]>;
    confidence: import("@sinclair/typebox").TNumber;
    rationale: import("@sinclair/typebox").TString;
    timestamp: import("@sinclair/typebox").TNumber;
}>;
export type ConsensusVote = Static<typeof ConsensusVote>;
/** Consensus proposal */
export declare const ConsensusProposal: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TString;
    proposed_by: import("@sinclair/typebox").TString;
    quorum: import("@sinclair/typebox").TInteger;
    confidence_threshold: import("@sinclair/typebox").TNumber;
    expiry_ms: import("@sinclair/typebox").TInteger;
    created_at: import("@sinclair/typebox").TNumber;
    outcome: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"committed">, import("@sinclair/typebox").TLiteral<"aborted">, import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"expired">]>;
    votes: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        voter: import("@sinclair/typebox").TString;
        decision: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"approve">, import("@sinclair/typebox").TLiteral<"reject">, import("@sinclair/typebox").TLiteral<"abstain">]>;
        confidence: import("@sinclair/typebox").TNumber;
        rationale: import("@sinclair/typebox").TString;
        timestamp: import("@sinclair/typebox").TNumber;
    }>>;
}>;
export type ConsensusProposal = Static<typeof ConsensusProposal>;
/** Consensus evaluation result */
export declare const ConsensusResult: import("@sinclair/typebox").TObject<{
    proposal_id: import("@sinclair/typebox").TString;
    outcome: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"committed">, import("@sinclair/typebox").TLiteral<"aborted">, import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"expired">]>;
    total_votes: import("@sinclair/typebox").TInteger;
    approvals: import("@sinclair/typebox").TInteger;
    rejections: import("@sinclair/typebox").TInteger;
    abstentions: import("@sinclair/typebox").TInteger;
    weighted_confidence: import("@sinclair/typebox").TNumber;
    quorum_met: import("@sinclair/typebox").TBoolean;
    threshold_met: import("@sinclair/typebox").TBoolean;
}>;
export type ConsensusResult = Static<typeof ConsensusResult>;
//# sourceMappingURL=consensus.d.ts.map