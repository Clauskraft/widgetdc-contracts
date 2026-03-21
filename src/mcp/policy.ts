import { Type, Static } from '@sinclair/typebox'

export const McpTransport = Type.Union([
  Type.Literal('streamable_http'),
  Type.Literal('rest'),
  Type.Literal('sse'),
  Type.Literal('stdio'),
], { $id: 'McpTransport' })

export type McpTransport = Static<typeof McpTransport>

export const McpPolicyRisk = Type.Union([
  Type.Literal('low'),
  Type.Literal('moderate'),
  Type.Literal('high'),
  Type.Literal('critical'),
], { $id: 'McpPolicyRisk' })

export type McpPolicyRisk = Static<typeof McpPolicyRisk>

export const McpClientLimits = Type.Object({
  rate_limit_per_minute: Type.Optional(Type.Integer()),
}, {
  $id: 'McpClientLimits',
  description: 'Runtime-enforced rate and payload limits for an MCP client.',
})

export type McpClientLimits = Static<typeof McpClientLimits>

export const McpClientDiscoveryPolicy = Type.Object({
  include_deprecated: Type.Optional(Type.Boolean()),
}, {
  $id: 'McpClientDiscoveryPolicy',
  description: 'Discovery preferences applied after auth-based filtering.',
})

export type McpClientDiscoveryPolicy = Static<typeof McpClientDiscoveryPolicy>

export const McpClientPolicy = Type.Object({
  description: Type.Optional(Type.String()),
  scopes: Type.Optional(Type.Array(Type.String())),
  allowed_tools: Type.Optional(Type.Array(Type.String())),
  denied_tools: Type.Optional(Type.Array(Type.String())),
  allowed_resources: Type.Optional(Type.Array(Type.String())),
  denied_resources: Type.Optional(Type.Array(Type.String())),
  allowed_transports: Type.Optional(Type.Array(McpTransport)),
  limits: Type.Optional(McpClientLimits),
  discovery: Type.Optional(McpClientDiscoveryPolicy),
  owner_contact: Type.Optional(Type.String()),
}, {
  $id: 'McpClientPolicy',
  description: 'Per-client MCP discovery and execution policy.',
})

export type McpClientPolicy = Static<typeof McpClientPolicy>

export const McpToolPolicyMetadata = Type.Object({
  capability_id: Type.Optional(Type.String()),
  required_scopes: Type.Optional(Type.Array(Type.String())),
  risk: Type.Optional(McpPolicyRisk),
  audience: Type.Optional(Type.Array(Type.String())),
  deprecated: Type.Optional(Type.Boolean()),
}, {
  $id: 'McpToolPolicyMetadata',
  description: 'Contract metadata attached to a tool definition for policy-aware discovery.',
})

export type McpToolPolicyMetadata = Static<typeof McpToolPolicyMetadata>

export const McpResourcePolicyMetadata = Type.Object({
  required_scopes: Type.Optional(Type.Array(Type.String())),
  audience: Type.Optional(Type.Array(Type.String())),
  description: Type.Optional(Type.String()),
}, {
  $id: 'McpResourcePolicyMetadata',
  description: 'Contract metadata attached to an MCP resource for policy-aware discovery.',
})

export type McpResourcePolicyMetadata = Static<typeof McpResourcePolicyMetadata>

export const McpClientPoliciesDocument = Type.Object({
  version: Type.String(),
  description: Type.Optional(Type.String()),
  defaults: Type.Optional(McpClientPolicy),
  clients: Type.Optional(Type.Record(Type.String(), McpClientPolicy)),
  tool_metadata: Type.Optional(Type.Record(Type.String(), McpToolPolicyMetadata)),
  resource_metadata: Type.Optional(Type.Record(Type.String(), McpResourcePolicyMetadata)),
}, {
  $id: 'McpClientPoliciesDocument',
  description: 'Canonical policy document for MCP client filtering and enforcement.',
})

export type McpClientPoliciesDocument = Static<typeof McpClientPoliciesDocument>

export const McpClientSelfResource = Type.Object({
  generated_at: Type.String({ format: 'date-time' }),
  client: Type.String(),
  description: Type.Optional(Type.String()),
  policy_version: Type.String(),
  policy_checksum: Type.String(),
  scopes: Type.Array(Type.String()),
  allowed_transports: Type.Array(McpTransport),
  limits: McpClientLimits,
  owner_contact: Type.Optional(Type.String()),
  allowed_tools: Type.Integer(),
  allowed_resources: Type.Integer(),
}, {
  $id: 'McpClientSelfResource',
  description: 'Effective policy surface exposed to an authenticated MCP client via widgetdc://self.',
})

export type McpClientSelfResource = Static<typeof McpClientSelfResource>
