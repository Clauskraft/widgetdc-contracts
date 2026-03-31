import { Type, Static } from '@sinclair/typebox'

/**
 * ConsensusProposal + Vote — Multi-agent decision protocol.
 * Wire format: snake_case JSON.
 *
 * Source: WidgeTDC lib/consensusProtocol.ts
 */

/** Vote decision options */
export const VoteDecision = Type.Union([
  Type.Literal('approve'),
  Type.Literal('reject'),
  Type.Literal('abstain'),
], { $id: 'VoteDecision', description: 'Consensus vote decision' })

export type VoteDecision = Static<typeof VoteDecision>

/** Consensus outcome states */
export const ConsensusOutcome = Type.Union([
  Type.Literal('committed'),
  Type.Literal('aborted'),
  Type.Literal('pending'),
  Type.Literal('expired'),
], { $id: 'ConsensusOutcome', description: 'Consensus proposal outcome' })

export type ConsensusOutcome = Static<typeof ConsensusOutcome>

/** Individual vote on a proposal */
export const ConsensusVote = Type.Object({
  voter: Type.String({ description: 'Voter agent ID' }),
  decision: VoteDecision,
  confidence: Type.Number({ minimum: 0, maximum: 1, description: 'Confidence 0.0-1.0' }),
  rationale: Type.String({ description: 'Reason for decision' }),
  timestamp: Type.Number({ description: 'Unix timestamp ms' }),
}, { $id: 'ConsensusVote', description: 'Individual vote on a consensus proposal' })

export type ConsensusVote = Static<typeof ConsensusVote>

/** Consensus proposal */
export const ConsensusProposal = Type.Object({
  id: Type.String({ description: 'Proposal ID' }),
  title: Type.String({ description: 'Proposal title' }),
  description: Type.String({ description: 'Detailed description' }),
  proposed_by: Type.String({ description: 'Proposer agent ID' }),
  quorum: Type.Integer({ minimum: 1, description: 'Required voters for quorum' }),
  confidence_threshold: Type.Number({ minimum: 0, maximum: 1, description: 'Min weighted confidence for approval' }),
  expiry_ms: Type.Integer({ description: 'Expiry duration in ms' }),
  created_at: Type.Number({ description: 'Unix timestamp ms' }),
  outcome: ConsensusOutcome,
  votes: Type.Array(ConsensusVote),
}, { $id: 'ConsensusProposal', description: 'Multi-agent consensus proposal' })

export type ConsensusProposal = Static<typeof ConsensusProposal>

/** Consensus evaluation result */
export const ConsensusResult = Type.Object({
  proposal_id: Type.String(),
  outcome: ConsensusOutcome,
  total_votes: Type.Integer(),
  approvals: Type.Integer(),
  rejections: Type.Integer(),
  abstentions: Type.Integer(),
  weighted_confidence: Type.Number({ minimum: 0, maximum: 1 }),
  quorum_met: Type.Boolean(),
  threshold_met: Type.Boolean(),
}, { $id: 'ConsensusResult', description: 'Consensus evaluation result' })

export type ConsensusResult = Static<typeof ConsensusResult>
