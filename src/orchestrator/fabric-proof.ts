import { Static, Type } from '@sinclair/typebox'

export const FabricProof = Type.Object({
  proof_id: Type.String({
    format: 'uuid',
    description: 'Unique identifier for the issued fabric proof',
  }),
  proof_type: Type.Union([
    Type.Literal('sgt'),
    Type.String(),
  ], {
    description: 'Fabric proof mechanism identifier',
  }),
  verification_status: Type.Union([
    Type.Literal('verified'),
    Type.Literal('unverified'),
    Type.Literal('expired'),
    Type.Literal('revoked'),
  ], {
    description: 'Verification result for the proof at issuance or last refresh',
  }),
  authorized_tool_namespaces: Type.Array(Type.String(), {
    description: 'Tool namespaces this proof authorizes. ["*"] grants all namespaces.',
  }),
  issued_at: Type.String({ format: 'date-time' }),
  expires_at: Type.Optional(Type.String({ format: 'date-time' })),
  issuer: Type.Optional(Type.String({
    description: 'Canonical issuer of the proof',
  })),
  handshake_id: Type.Optional(Type.String({
    description: 'Associated handshake identifier or fingerprint',
  })),
}, {
  $id: 'FabricProof',
  description: 'Verified immutable fabric proof issued during agent handshake. Used to authorize high-risk delegation and tool execution.',
})

export type FabricProof = Static<typeof FabricProof>
