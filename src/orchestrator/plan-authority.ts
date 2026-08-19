/**
 * Canonical Plan Authority Contract v1.
 *
 * This module defines the only proof-eligible envelope for admitting a plan to
 * execution. It carries references and verification outcomes; it does not
 * issue actor authority, create approvals, execute plans, or mutate a mission.
 * Legacy or partially bound plans are represented only by a rejected result.
 *
 * Wire format: snake_case JSON.
 */
import { Static, Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import '../formats.js'
import {
  CANONICALIZATION_VERSION,
  CONTENT_HASH_ALGORITHM,
  contentAddressedIdentity,
  type JsonObject,
  type JsonValue,
} from '../normalization/canonical-json.js'

export const PLAN_AUTHORITY_SCHEMA_IDS = {
  PlanAuthorityEnvelopeV1:
    'https://widgetdc.com/contracts/orchestrator/PlanAuthorityEnvelopeV1.json',
  PlanAuthorityAdmissionResultV1:
    'https://widgetdc.com/contracts/orchestrator/PlanAuthorityAdmissionResultV1.json',
  PlanAuthorityEnvelopeV2:
    'https://widgetdc.com/contracts/orchestrator/PlanAuthorityEnvelopeV2.json',
  PlanAuthorityAdmissionResultV2:
    'https://widgetdc.com/contracts/orchestrator/PlanAuthorityAdmissionResultV2.json',
} as const

const PLAN_AUTHORITY_SCHEMA_VERSION = 'wdc.plan_authority_envelope.v1' as const
const HASH_PATTERN = '^sha256:[0-9a-f]{64}$'
const OPAQUE_ID_PATTERN = '^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$'

const BindingHashes = Type.Object({
  mission_bundle_hash: Type.String({ pattern: HASH_PATTERN }),
  workbom_hash: Type.String({ pattern: HASH_PATTERN }),
  success_contract_hash: Type.String({ pattern: HASH_PATTERN }),
  claim_contract_hash: Type.String({ pattern: HASH_PATTERN }),
}, {
  additionalProperties: false,
  description: 'Exact hash tuple that binds the admitted plan to its mission and contracts.',
})

const ActorBinding = Type.Object({
  actor_id: Type.String({ minLength: 1, maxLength: 512 }),
  authority_ref: Type.String({ minLength: 1, maxLength: 512 }),
  required_capability: Type.Literal('mutation:source_code'),
  actor_binding_verified: Type.Literal(true),
}, {
  additionalProperties: false,
  description: 'Verified actor authority required for source mutation.',
})

const ApprovalBinding = Type.Object({
  approval_id: Type.String({ minLength: 1, maxLength: 512 }),
  approved_by: Type.String({ minLength: 1, maxLength: 512 }),
  approval_signature_ref: Type.String({
    pattern: '^signature:[A-Za-z0-9][A-Za-z0-9._:/-]{0,511}$',
  }),
  approval_signature_verified: Type.Literal(true),
  approval_usable: Type.Literal(true),
  issued_at: Type.String({ format: 'date-time' }),
  expires_at: Type.String({ format: 'date-time' }),
}, {
  additionalProperties: false,
  description: 'Usable, verified approval signature and its bounded validity window.',
})

export const PlanAuthorityEnvelopeV1 = Type.Object({
  schema_version: Type.Literal(PLAN_AUTHORITY_SCHEMA_VERSION),
  definition_version: Type.Literal('1.0.0'),
  canonicalization_profile: Type.Literal(CANONICALIZATION_VERSION),
  hash_algorithm: Type.Literal(CONTENT_HASH_ALGORITHM),
  canonical_document_hash: Type.String({
    pattern: HASH_PATTERN,
    description: 'SHA-256 identity over the canonical plan projection, excluding this field.',
  }),
  plan_id: Type.String({
    pattern: '^plan:[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$',
  }),
  plan_version: Type.Integer({ minimum: 1 }),
  mission_id: Type.String({ pattern: OPAQUE_ID_PATTERN }),
  slice_id: Type.String({ pattern: OPAQUE_ID_PATTERN }),
  workbom_id: Type.String({
    pattern: '^(?:taskbom|workbom):[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$',
  }),
  linear_issue: Type.String({ pattern: '^LIN-[1-9][0-9]*$' }),
  exact_head_sha: Type.String({ pattern: '^[0-9a-f]{40}$' }),
  binding_hashes: BindingHashes,
  actor_binding: ActorBinding,
  approval_binding: ApprovalBinding,
  execution_admitted: Type.Literal(true),
}, {
  $id: PLAN_AUTHORITY_SCHEMA_IDS.PlanAuthorityEnvelopeV1,
  additionalProperties: false,
  description: 'Closed, versioned and content-addressed authority envelope for one executable plan.',
})
export type PlanAuthorityEnvelopeV1 = Static<typeof PlanAuthorityEnvelopeV1>

const AdmittedPlanAuthorityResultV1 = Type.Object({
  schema_version: Type.Literal('wdc.plan_authority_admission_result.v1'),
  status: Type.Literal('admitted'),
  plan: Type.Ref(PlanAuthorityEnvelopeV1),
  execution_admitted: Type.Literal(true),
}, { additionalProperties: false })

const RejectedPlanAuthorityResultV1 = Type.Object({
  schema_version: Type.Literal('wdc.plan_authority_admission_result.v1'),
  status: Type.Literal('rejected'),
  reason: Type.Union([
    Type.Literal('legacy_unversioned_plan'),
    Type.Literal('schema_invalid'),
    Type.Literal('hash_mismatch'),
    Type.Literal('actor_binding_unverified'),
    Type.Literal('approval_signature_unverified'),
    Type.Literal('approval_unusable'),
    Type.Literal('authority_window_invalid'),
    Type.Literal('authority_not_yet_valid'),
    Type.Literal('authority_expired'),
    Type.Literal('binding_mismatch'),
  ]),
  execution_admitted: Type.Literal(false),
}, { additionalProperties: false })

export const PlanAuthorityAdmissionResultV1 = Type.Union([
  AdmittedPlanAuthorityResultV1,
  RejectedPlanAuthorityResultV1,
], {
  $id: PLAN_AUTHORITY_SCHEMA_IDS.PlanAuthorityAdmissionResultV1,
  description: 'Terminal fail-closed result: a fully bound plan is admitted, every other input is rejected.',
})
export type PlanAuthorityAdmissionResultV1 = Static<
  typeof PlanAuthorityAdmissionResultV1
>

export interface PlanAuthorityAdmissionOptionsV1 {
  readonly clock: () => Date
}

function rejectedPlanAuthorityAdmissionV1(
  reason: Extract<PlanAuthorityAdmissionResultV1, { status: 'rejected' }>['reason'],
): PlanAuthorityAdmissionResultV1 {
  return {
    schema_version: 'wdc.plan_authority_admission_result.v1',
    status: 'rejected',
    reason,
    execution_admitted: false,
  }
}

const STRICT_RFC3339_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-](\d{2}):(\d{2}))$/

function strictRfc3339EpochMilliseconds(value: string): number | null {
  const match = STRICT_RFC3339_PATTERN.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6])
  const offsetHour = Number(match[7] ?? 0)
  const offsetMinute = Number(match[8] ?? 0)
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()

  if (
    month < 1 || month > 12 ||
    day < 1 || day > daysInMonth ||
    hour > 23 || minute > 59 || second > 59 ||
    offsetHour > 23 || offsetMinute > 59
  ) {
    return null
  }

  const epochMilliseconds = Date.parse(value)
  return Number.isFinite(epochMilliseconds) ? epochMilliseconds : null
}

/**
 * Guarded admission boundary. Structural schema validation alone is not an
 * execution authorization because JSON Schema cannot recompute content hashes.
 */
export function evaluatePlanAuthorityAdmissionV1(
  input: unknown,
  options: PlanAuthorityAdmissionOptionsV1,
): PlanAuthorityAdmissionResultV1 {
  if (!Value.Check(PlanAuthorityEnvelopeV1, input)) {
    return rejectedPlanAuthorityAdmissionV1('schema_invalid')
  }
  if (!hasValidCanonicalPlanAuthorityDocumentHashV1(input)) {
    return rejectedPlanAuthorityAdmissionV1('hash_mismatch')
  }

  const plan = structuredClone(input) as PlanAuthorityEnvelopeV1
  const issuedAt = strictRfc3339EpochMilliseconds(plan.approval_binding.issued_at)
  const expiresAt = strictRfc3339EpochMilliseconds(plan.approval_binding.expires_at)
  let nowEpochMilliseconds: number
  try {
    nowEpochMilliseconds = options.clock().getTime()
  } catch {
    return rejectedPlanAuthorityAdmissionV1('authority_window_invalid')
  }

  if (
    issuedAt === null ||
    expiresAt === null ||
    !Number.isFinite(nowEpochMilliseconds) ||
    issuedAt >= expiresAt
  ) {
    return rejectedPlanAuthorityAdmissionV1('authority_window_invalid')
  }
  if (nowEpochMilliseconds < issuedAt) {
    return rejectedPlanAuthorityAdmissionV1('authority_not_yet_valid')
  }
  if (nowEpochMilliseconds >= expiresAt) {
    return rejectedPlanAuthorityAdmissionV1('authority_expired')
  }

  return {
    schema_version: 'wdc.plan_authority_admission_result.v1',
    status: 'admitted',
    plan,
    execution_admitted: true,
  }
}

export interface CanonicalPlanAuthorityDocumentHashInputV1 {
  schema_version: string
  canonical_document_hash?: unknown
  [key: string]: unknown
}

function projectCanonicalPlanAuthorityDocumentV1(
  document: CanonicalPlanAuthorityDocumentHashInputV1,
): { schemaVersion: string; payload: JsonObject } {
  if (
    document === null ||
    typeof document !== 'object' ||
    Array.isArray(document) ||
    Object.getPrototypeOf(document) !== Object.prototype
  ) {
    throw new TypeError('plan authority document must be a plain object')
  }
  if (Object.getOwnPropertySymbols(document).length > 0) {
    throw new TypeError('plan authority document cannot contain symbol properties')
  }

  const payload = Object.create(null) as JsonObject
  let schemaVersion: string | undefined
  for (const key of Object.getOwnPropertyNames(document)) {
    const descriptor = Object.getOwnPropertyDescriptor(document, key)
    if (!descriptor || !descriptor.enumerable || !('value' in descriptor)) {
      throw new TypeError('plan authority members must be enumerable data properties')
    }
    if (key === 'canonical_document_hash') continue
    if (key === 'schema_version') {
      if (typeof descriptor.value !== 'string') {
        throw new TypeError('schema_version must be a string')
      }
      schemaVersion = descriptor.value
      continue
    }
    payload[key] = descriptor.value as JsonValue
  }

  if (schemaVersion !== PLAN_AUTHORITY_SCHEMA_VERSION) {
    throw new TypeError(
      `schema_version ${schemaVersion ?? '<missing>'} does not match ${PLAN_AUTHORITY_SCHEMA_VERSION}`,
    )
  }

  return { schemaVersion, payload }
}

export function canonicalPlanAuthorityDocumentHashV1(
  document: CanonicalPlanAuthorityDocumentHashInputV1,
): `sha256:${string}` {
  const { schemaVersion, payload } = projectCanonicalPlanAuthorityDocumentV1(document)
  return contentAddressedIdentity({
    object_type: PLAN_AUTHORITY_SCHEMA_IDS.PlanAuthorityEnvelopeV1,
    schema_version: schemaVersion,
    payload,
  }).id
}

export function hasValidCanonicalPlanAuthorityDocumentHashV1(
  document: unknown,
): boolean {
  try {
    const candidate = document as CanonicalPlanAuthorityDocumentHashInputV1
    const descriptor = Object.getOwnPropertyDescriptor(candidate, 'canonical_document_hash')
    if (!descriptor || !descriptor.enumerable || !('value' in descriptor)) return false
    const claimedHash = descriptor.value
    return typeof claimedHash === 'string' &&
      /^sha256:[0-9a-f]{64}$/.test(claimedHash) &&
      canonicalPlanAuthorityDocumentHashV1(candidate) === claimedHash
  } catch {
    return false
  }
}

/**
 * Additive V2 authority envelope. Unlike V1, it carries no caller-authored
 * verification outcomes. Authority is admitted only when an injected
 * server-side verifier accepts the signature over the recomputed payload hash.
 */
const PLAN_AUTHORITY_SCHEMA_VERSION_V2 = 'wdc.plan_authority_envelope.v2' as const
const PLAN_AUTHORITY_SCOPE_SCHEMA_VERSION_V2 = 'wdc.plan_authority_scope.v2' as const

export const PlanAuthorityEnvelopeV2 = Type.Object({
  schema_version: Type.Literal(PLAN_AUTHORITY_SCHEMA_VERSION_V2),
  definition_version: Type.Literal('2.0.0'),
  canonicalization_profile: Type.Literal(CANONICALIZATION_VERSION),
  hash_algorithm: Type.Literal(CONTENT_HASH_ALGORITHM),
  canonical_payload_hash: Type.String({ pattern: HASH_PATTERN }),
  plan_id: Type.String({ pattern: '^plan:[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$' }),
  approval_id: Type.String({
    pattern: '^approval:[A-Za-z0-9][A-Za-z0-9._:/-]{0,511}$',
  }),
  actor_id: Type.String({ minLength: 1, maxLength: 512 }),
  authority_ref: Type.String({ minLength: 1, maxLength: 512 }),
  capabilities: Type.Array(Type.String({ minLength: 1, maxLength: 256 }), {
    minItems: 1,
    maxItems: 128,
    uniqueItems: true,
  }),
  scope: Type.Array(Type.String({ minLength: 1, maxLength: 1024 }), {
    minItems: 1,
    maxItems: 512,
    uniqueItems: true,
  }),
  scope_hash: Type.String({ pattern: HASH_PATTERN }),
  issued_at: Type.String({ format: 'date-time' }),
  expires_at: Type.String({ format: 'date-time' }),
  correlation_id: Type.String({ minLength: 1, maxLength: 512 }),
  idempotency_key: Type.String({ minLength: 1, maxLength: 512 }),
  signing_key_id: Type.String({ minLength: 1, maxLength: 512 }),
  server_signature: Type.String({
    pattern: '^signature:[A-Za-z0-9][A-Za-z0-9._:/-]{0,511}$',
  }),
}, {
  $id: PLAN_AUTHORITY_SCHEMA_IDS.PlanAuthorityEnvelopeV2,
  additionalProperties: false,
  description: 'Server-signed, actor-bound and content-addressed authority for one plan approval.',
})
export type PlanAuthorityEnvelopeV2 = Static<typeof PlanAuthorityEnvelopeV2>

const AdmittedPlanAuthorityResultV2 = Type.Object({
  schema_version: Type.Literal('wdc.plan_authority_admission_result.v2'),
  status: Type.Literal('admitted'),
  plan: Type.Ref(PlanAuthorityEnvelopeV2),
  execution_admitted: Type.Literal(true),
}, { additionalProperties: false })

const RejectedPlanAuthorityResultV2 = Type.Object({
  schema_version: Type.Literal('wdc.plan_authority_admission_result.v2'),
  status: Type.Literal('rejected'),
  reason: Type.Union([
    Type.Literal('schema_invalid'),
    Type.Literal('scope_hash_mismatch'),
    Type.Literal('payload_hash_mismatch'),
    Type.Literal('server_signature_invalid'),
    Type.Literal('authority_window_invalid'),
    Type.Literal('authority_not_yet_valid'),
    Type.Literal('authority_expired'),
  ]),
  execution_admitted: Type.Literal(false),
}, { additionalProperties: false })

export const PlanAuthorityAdmissionResultV2 = Type.Union([
  AdmittedPlanAuthorityResultV2,
  RejectedPlanAuthorityResultV2,
], {
  $id: PLAN_AUTHORITY_SCHEMA_IDS.PlanAuthorityAdmissionResultV2,
  description: 'Fail-closed V2 admission result backed by recomputed hashes and server signature evidence.',
})
export type PlanAuthorityAdmissionResultV2 = Static<
  typeof PlanAuthorityAdmissionResultV2
>

export interface PlanAuthoritySignatureVerificationInputV2 {
  readonly canonical_payload_hash: string
  readonly signing_key_id: string
  readonly server_signature: string
}

export interface PlanAuthorityAdmissionOptionsV2 {
  readonly clock: () => Date
  readonly verifyServerSignature: (
    input: Readonly<PlanAuthoritySignatureVerificationInputV2>,
  ) => boolean
}

export interface CanonicalPlanAuthorityPayloadHashInputV2 {
  schema_version: string
  canonical_payload_hash?: unknown
  server_signature?: unknown
  [key: string]: unknown
}

function rejectedPlanAuthorityAdmissionV2(
  reason: Extract<PlanAuthorityAdmissionResultV2, { status: 'rejected' }>['reason'],
): PlanAuthorityAdmissionResultV2 {
  return {
    schema_version: 'wdc.plan_authority_admission_result.v2',
    status: 'rejected',
    reason,
    execution_admitted: false,
  }
}

function assertPlainEnumerableDataObjectV2(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (
    value === null ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new TypeError(`${label} must be a plain object`)
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new TypeError(`${label} cannot contain symbol properties`)
  }
}

function ownEnumerableDataValueV2(
  object: Record<string, unknown>,
  key: string,
): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(object, key)
  if (!descriptor || !descriptor.enumerable || !('value' in descriptor)) {
    throw new TypeError(`${key} must be an enumerable data property`)
  }
  return descriptor.value
}

export function canonicalPlanAuthorityScopeHashV2(scope: unknown): `sha256:${string}` {
  if (
    !Array.isArray(scope) ||
    scope.length === 0 ||
    scope.some((entry) => typeof entry !== 'string' || entry.length === 0) ||
    new Set(scope).size !== scope.length
  ) {
    throw new TypeError('scope must be a non-empty array of unique non-empty strings')
  }
  return contentAddressedIdentity({
    object_type: `${PLAN_AUTHORITY_SCHEMA_IDS.PlanAuthorityEnvelopeV2}#scope`,
    schema_version: PLAN_AUTHORITY_SCOPE_SCHEMA_VERSION_V2,
    payload: { scope: [...scope] },
  }).id
}

function projectCanonicalPlanAuthorityPayloadV2(
  document: CanonicalPlanAuthorityPayloadHashInputV2,
): JsonObject {
  assertPlainEnumerableDataObjectV2(document, 'plan authority V2 document')
  const payload = Object.create(null) as JsonObject
  let schemaVersion: string | undefined

  for (const key of Object.getOwnPropertyNames(document)) {
    const value = ownEnumerableDataValueV2(document, key)
    if (key === 'canonical_payload_hash' || key === 'server_signature') continue
    if (key === 'schema_version') {
      if (typeof value !== 'string') throw new TypeError('schema_version must be a string')
      schemaVersion = value
      continue
    }
    payload[key] = value as JsonValue
  }

  if (schemaVersion !== PLAN_AUTHORITY_SCHEMA_VERSION_V2) {
    throw new TypeError(
      `schema_version ${schemaVersion ?? '<missing>'} does not match ${PLAN_AUTHORITY_SCHEMA_VERSION_V2}`,
    )
  }
  return payload
}

export function canonicalPlanAuthorityPayloadHashV2(
  document: CanonicalPlanAuthorityPayloadHashInputV2,
): `sha256:${string}` {
  return contentAddressedIdentity({
    object_type: PLAN_AUTHORITY_SCHEMA_IDS.PlanAuthorityEnvelopeV2,
    schema_version: PLAN_AUTHORITY_SCHEMA_VERSION_V2,
    payload: projectCanonicalPlanAuthorityPayloadV2(document),
  }).id
}

export function hasValidCanonicalPlanAuthorityScopeHashV2(document: unknown): boolean {
  try {
    assertPlainEnumerableDataObjectV2(document, 'plan authority V2 document')
    const scope = ownEnumerableDataValueV2(document, 'scope')
    const claimedHash = ownEnumerableDataValueV2(document, 'scope_hash')
    return typeof claimedHash === 'string' &&
      /^sha256:[0-9a-f]{64}$/.test(claimedHash) &&
      canonicalPlanAuthorityScopeHashV2(scope) === claimedHash
  } catch {
    return false
  }
}

export function hasValidCanonicalPlanAuthorityPayloadHashV2(document: unknown): boolean {
  try {
    assertPlainEnumerableDataObjectV2(document, 'plan authority V2 document')
    const claimedHash = ownEnumerableDataValueV2(document, 'canonical_payload_hash')
    return typeof claimedHash === 'string' &&
      /^sha256:[0-9a-f]{64}$/.test(claimedHash) &&
      canonicalPlanAuthorityPayloadHashV2(document as CanonicalPlanAuthorityPayloadHashInputV2) === claimedHash
  } catch {
    return false
  }
}

export function evaluatePlanAuthorityAdmissionV2(
  input: unknown,
  options: PlanAuthorityAdmissionOptionsV2,
): PlanAuthorityAdmissionResultV2 {
  let schemaValid = false
  try {
    schemaValid = Value.Check(PlanAuthorityEnvelopeV2, input)
  } catch {
    schemaValid = false
  }
  if (!schemaValid) {
    return rejectedPlanAuthorityAdmissionV2('schema_invalid')
  }
  if (!hasValidCanonicalPlanAuthorityScopeHashV2(input)) {
    return rejectedPlanAuthorityAdmissionV2('scope_hash_mismatch')
  }
  if (!hasValidCanonicalPlanAuthorityPayloadHashV2(input)) {
    return rejectedPlanAuthorityAdmissionV2('payload_hash_mismatch')
  }

  let plan: PlanAuthorityEnvelopeV2
  try {
    plan = structuredClone(input) as PlanAuthorityEnvelopeV2
  } catch {
    return rejectedPlanAuthorityAdmissionV2('schema_invalid')
  }
  const issuedAt = strictRfc3339EpochMilliseconds(plan.issued_at)
  const expiresAt = strictRfc3339EpochMilliseconds(plan.expires_at)
  let nowEpochMilliseconds: number
  try {
    nowEpochMilliseconds = options.clock().getTime()
  } catch {
    return rejectedPlanAuthorityAdmissionV2('authority_window_invalid')
  }
  if (
    issuedAt === null ||
    expiresAt === null ||
    !Number.isFinite(nowEpochMilliseconds) ||
    issuedAt >= expiresAt
  ) {
    return rejectedPlanAuthorityAdmissionV2('authority_window_invalid')
  }
  if (nowEpochMilliseconds < issuedAt) {
    return rejectedPlanAuthorityAdmissionV2('authority_not_yet_valid')
  }
  if (nowEpochMilliseconds >= expiresAt) {
    return rejectedPlanAuthorityAdmissionV2('authority_expired')
  }

  try {
    const verified = options.verifyServerSignature(Object.freeze({
      canonical_payload_hash: plan.canonical_payload_hash,
      signing_key_id: plan.signing_key_id,
      server_signature: plan.server_signature,
    }))
    if (verified !== true) {
      return rejectedPlanAuthorityAdmissionV2('server_signature_invalid')
    }
  } catch {
    return rejectedPlanAuthorityAdmissionV2('server_signature_invalid')
  }

  return {
    schema_version: 'wdc.plan_authority_admission_result.v2',
    status: 'admitted',
    plan,
    execution_admitted: true,
  }
}
