/**
 * WDC continuation lifecycle contracts.
 *
 * This module defines source-level cross-service contracts only. It does not
 * execute actions, resume sessions, mutate governance state, or emit events.
 */
import { Static, Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

export const ContinuationPhase = Type.Union([
  Type.Literal('active'),
  Type.Literal('authority_changed'),
  Type.Literal('rehydration_required'),
  Type.Literal('replanning'),
  Type.Literal('executing_safe_actions'),
  Type.Literal('waiting_for_human'),
  Type.Literal('blocked'),
  Type.Literal('complete'),
], { $id: 'ContinuationPhase' })

export type ContinuationPhase = Static<typeof ContinuationPhase>

export const ContinuationState = Type.Object({
  schema_version: Type.Literal('wdc.continuation_state.v1'),
  continuation_id: Type.String({ minLength: 1 }),
  phase: ContinuationPhase,
  current_authority_ref: Type.String({ minLength: 1 }),
  previous_authority_ref: Type.Optional(Type.String({ minLength: 1 })),
  next_safe_action_ids: Type.Array(Type.String({ minLength: 1 })),
  active_human_gate_id: Type.Optional(Type.String({ minLength: 1 })),
  updated_at: Type.String({ format: 'date-time' }),
}, {
  $id: 'ContinuationState',
  additionalProperties: false,
  description: 'Authority-bound continuation lifecycle state. Authority changes require rehydration and are never terminal.',
})

export type ContinuationState = Static<typeof ContinuationState>

export const BlockerClassification = Type.Union([
  Type.Literal('AUTO_RESOLVABLE'),
  Type.Literal('SAFE_CONTINUE'),
  Type.Literal('HUMAN_IDENTITY_REQUIRED'),
  Type.Literal('EXACT_APPROVAL_REQUIRED'),
  Type.Literal('OWNER_SECRET_ACTION'),
  Type.Literal('DESTRUCTIVE_ACTION_APPROVAL'),
  Type.Literal('UNRESOLVABLE_CONFLICT'),
], { $id: 'BlockerClassification' })

export type BlockerClassification = Static<typeof BlockerClassification>

export const ContinuationBlocker = Type.Object({
  blocker_id: Type.String({ minLength: 1 }),
  classification: BlockerClassification,
  description: Type.String({ minLength: 1 }),
  blocks_action_ids: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
  evidence_ref: Type.String({ minLength: 1 }),
}, {
  $id: 'ContinuationBlocker',
  additionalProperties: false,
})

export type ContinuationBlocker = Static<typeof ContinuationBlocker>

export const HumanOnlyGate = Type.Object({
  gate_id: Type.String({ minLength: 1 }),
  gate_type: Type.Union([
    Type.Literal('oauth_consent'),
    Type.Literal('identity_verification'),
    Type.Literal('owner_secret_action'),
    Type.Literal('destructive_action_approval'),
  ]),
  status: Type.Union([
    Type.Literal('waiting'),
    Type.Literal('satisfied'),
    Type.Literal('expired'),
  ]),
  required_actor: Type.String({ minLength: 1 }),
  prompt: Type.String({ minLength: 1 }),
  resume_action_id: Type.String({ minLength: 1 }),
  created_at: Type.String({ format: 'date-time' }),
  satisfied_at: Type.Optional(Type.String({ format: 'date-time' })),
}, {
  $id: 'HumanOnlyGate',
  additionalProperties: false,
  description: 'A narrowly typed gate for an action that cannot be completed safely by the execution agent.',
})

export type HumanOnlyGate = Static<typeof HumanOnlyGate>

const NextSafeActionFields = {
  action_id: Type.String({ minLength: 1 }),
  description: Type.String({ minLength: 1 }),
  action_type: Type.Union([
    Type.Literal('rehydrate'),
    Type.Literal('replan'),
    Type.Literal('inspect'),
    Type.Literal('verify'),
    Type.Literal('resume'),
    Type.Literal('closeout'),
  ]),
  authority_ref: Type.String({ minLength: 1 }),
}

export const PendingSafeAction = Type.Object({
  ...NextSafeActionFields,
  status: Type.Literal('pending'),
  executable: Type.Literal(true),
}, {
  $id: 'PendingSafeAction',
  additionalProperties: false,
})

export type PendingSafeAction = Static<typeof PendingSafeAction>

export const ExecutedSafeAction = Type.Object({
  ...NextSafeActionFields,
  status: Type.Literal('executed'),
  executable: Type.Literal(false),
  executed_at: Type.String({ format: 'date-time' }),
}, {
  $id: 'ExecutedSafeAction',
  additionalProperties: false,
})

export type ExecutedSafeAction = Static<typeof ExecutedSafeAction>

export const StaleSafeAction = Type.Object({
  ...NextSafeActionFields,
  status: Type.Literal('stale'),
  executable: Type.Literal(false),
  stale_reason: Type.String({ minLength: 1 }),
}, {
  $id: 'StaleSafeAction',
  additionalProperties: false,
})

export type StaleSafeAction = Static<typeof StaleSafeAction>

export const NextSafeAction = Type.Union([
  PendingSafeAction,
  ExecutedSafeAction,
  StaleSafeAction,
], { $id: 'NextSafeAction' })

export type NextSafeAction = Static<typeof NextSafeAction>

/**
 * Untrusted continuation ingress. Governance context is intentionally absent;
 * authenticated server-side code owns actor, tenant, scope, and approval data.
 */
export const ContinuationRequest = Type.Object({
  schema_version: Type.Literal('wdc.continuation_request.v1'),
  continuation_id: Type.String({ minLength: 1 }),
  authority_ref: Type.String({ minLength: 1 }),
  requested_at: Type.String({ format: 'date-time' }),
}, {
  $id: 'ContinuationRequest',
  additionalProperties: false,
})

export type ContinuationRequest = Static<typeof ContinuationRequest>

export const ContinuationReceipt = Type.Object({
  schema_version: Type.Literal('wdc.continuation_receipt.v1'),
  receipt_id: Type.String({ minLength: 1 }),
  continuation_id: Type.String({ minLength: 1 }),
  current_authority_ref: Type.String({ minLength: 1 }),
  continuation_status: Type.Union([
    Type.Literal('continued'),
    Type.Literal('waiting_for_human'),
    Type.Literal('blocked'),
    Type.Literal('complete'),
  ]),
  safe_actions_discovered: Type.Array(NextSafeAction),
  safe_actions_executed: Type.Array(ExecutedSafeAction),
  unexecuted_safe_actions: Type.Array(PendingSafeAction),
  human_only_gates: Type.Array(HumanOnlyGate),
  blockers: Type.Array(ContinuationBlocker),
  created_at: Type.String({ format: 'date-time' }),
}, {
  $id: 'ContinuationReceipt',
  additionalProperties: false,
  description: 'Continuation outcome. Discovered safe actions must execute or be tied to an explicit blocker or waiting human gate.',
})

export type ContinuationReceipt = Static<typeof ContinuationReceipt>

export interface ContinuationReceiptValidation {
  valid: boolean
  errors: string[]
}

const legalTransitions: Readonly<Record<ContinuationPhase, readonly ContinuationPhase[]>> = {
  active: ['authority_changed', 'executing_safe_actions', 'waiting_for_human', 'blocked', 'complete'],
  authority_changed: ['rehydration_required'],
  rehydration_required: ['replanning', 'blocked'],
  replanning: ['executing_safe_actions', 'waiting_for_human', 'blocked'],
  executing_safe_actions: ['authority_changed', 'replanning', 'waiting_for_human', 'blocked', 'complete'],
  waiting_for_human: ['authority_changed', 'rehydration_required', 'replanning', 'blocked'],
  blocked: ['authority_changed', 'rehydration_required', 'replanning'],
  complete: [],
}

export function isLegalContinuationTransition(
  from: ContinuationPhase,
  to: ContinuationPhase,
): boolean {
  return legalTransitions[from].includes(to)
}

export function validateContinuationReceipt(value: unknown): ContinuationReceiptValidation {
  if (!Value.Check(ContinuationReceipt, value)) {
    return { valid: false, errors: ['schema_invalid'] }
  }

  const receipt = value as ContinuationReceipt
  const errors: string[] = []
  const executedIds = new Set(receipt.safe_actions_executed.map((action) => action.action_id))
  const terminalBlockerClasses: ReadonlySet<BlockerClassification> = new Set([
    'EXACT_APPROVAL_REQUIRED',
    'OWNER_SECRET_ACTION',
    'DESTRUCTIVE_ACTION_APPROVAL',
    'UNRESOLVABLE_CONFLICT',
  ])
  const blockedIds = new Set(
    receipt.blockers
      .filter((blocker) => terminalBlockerClasses.has(blocker.classification))
      .flatMap((blocker) => blocker.blocks_action_ids),
  )
  const waitingResumeIds = new Set(
    receipt.human_only_gates
      .filter((gate) => gate.status === 'waiting')
      .map((gate) => gate.resume_action_id),
  )

  for (const action of receipt.unexecuted_safe_actions) {
    if (!blockedIds.has(action.action_id) && !waitingResumeIds.has(action.action_id)) {
      errors.push(`safe_action_execution_obligation_unmet:${action.action_id}`)
    }
  }

  for (const action of receipt.safe_actions_executed) {
    if (action.authority_ref !== receipt.current_authority_ref) {
      errors.push(`executed_action_authority_mismatch:${action.action_id}`)
    }
  }

  for (const action of receipt.safe_actions_discovered) {
    if (action.status === 'stale' && executedIds.has(action.action_id)) {
      errors.push(`stale_action_marked_executed:${action.action_id}`)
    }
  }

  if (
    receipt.continuation_status === 'complete' &&
    (receipt.unexecuted_safe_actions.length > 0 ||
      receipt.human_only_gates.some((gate) => gate.status === 'waiting') ||
      receipt.blockers.length > 0)
  ) {
    errors.push('complete_receipt_has_open_work')
  }

  return { valid: errors.length === 0, errors }
}
