import { Static, Type } from '@sinclair/typebox'

export const OctopusProviderMappingStatus = Type.Union([
  Type.Literal('runtime_valid'),
  Type.Literal('runtime_invalid'),
  Type.Literal('unverified'),
], {
  $id: 'OctopusProviderMappingStatus',
  description: 'Runtime validity of the requested Octopus persona to spawn-agent mapping.',
})

export type OctopusProviderMappingStatus = Static<typeof OctopusProviderMappingStatus>

export const OctopusProviderMapping = Type.Object({
  requested_persona: Type.String({
    description: 'Persona requested by the skill or plan, for example backend-architect.',
  }),
  spawn_agent: Type.String({
    description: 'Actual spawn agent observed in the local Octopus runtime.',
  }),
  mapping_status: OctopusProviderMappingStatus,
}, {
  $id: 'OctopusProviderMapping',
  additionalProperties: false,
  description: 'Observed Octopus persona mapping used to route provider work.',
})

export type OctopusProviderMapping = Static<typeof OctopusProviderMapping>

export const RoutingEvidenceStatus = Type.Union([
  Type.Literal('pending'),
  Type.Literal('artifact_ready'),
  Type.Literal('empty_artifact'),
  Type.Literal('timeout'),
  Type.Literal('failed'),
], {
  $id: 'RoutingEvidenceStatus',
  description: 'Readback status for an Octopus routing artifact.',
})

export type RoutingEvidenceStatus = Static<typeof RoutingEvidenceStatus>

const RoutingEvidenceReadbackCommon = {
  schema_version: Type.Literal('routing_evidence_readback.v1'),
  route_id: Type.String({
    minLength: 1,
    description: 'Stable identifier for the chained route that produced the evidence.',
  }),
  provider_mapping: OctopusProviderMapping,
  runtime_proof_claimed: Type.Literal(false),
  claim_promotion_eligible: Type.Literal(false),
  checked_at: Type.String({
    format: 'date-time',
    description: 'Timestamp when the routing artifact was checked.',
  }),
} as const

const RoutingEvidenceArtifactReady = Type.Object({
  ...RoutingEvidenceReadbackCommon,
  evidence_status: Type.Literal('artifact_ready'),
  artifact_ref: Type.String({
    minLength: 1,
    description: 'Observed non-empty artifact path or durable artifact reference.',
  }),
  artifact_bytes: Type.Integer({
    minimum: 1,
    description: 'Observed artifact byte size. artifact_ready requires a non-empty artifact.',
  }),
  polled: Type.Literal(true),
}, {
  additionalProperties: false,
})

const RoutingEvidenceNotReady = Type.Object({
  ...RoutingEvidenceReadbackCommon,
  evidence_status: Type.Union([
    Type.Literal('pending'),
    Type.Literal('empty_artifact'),
    Type.Literal('timeout'),
    Type.Literal('failed'),
  ]),
  artifact_ref: Type.Optional(Type.String({
    minLength: 1,
    description: 'Artifact path or reference when one was observed.',
  })),
  artifact_bytes: Type.Optional(Type.Integer({
    minimum: 0,
    description: 'Observed artifact byte size when available.',
  })),
  polled: Type.Boolean({
    description: 'Whether the route was polled after dispatch.',
  }),
}, {
  additionalProperties: false,
})

export const RoutingEvidenceReadback = Type.Union([
  RoutingEvidenceArtifactReady,
  RoutingEvidenceNotReady,
], {
  $id: 'RoutingEvidenceReadback',
  description:
    'Readback envelope for Octopus routing evidence. It never claims runtime proof or claim-promotion eligibility.',
})

export type RoutingEvidenceReadback = Static<typeof RoutingEvidenceReadback>
