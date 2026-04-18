/**
 * ProduceRequest — Plugin / orchestrator entrypoint payload for /produce.
 *
 * Office-addin taskpane, LibreChat agents, and future SDKs all POST this
 * shape to `orchestrator/produce`, which forwards to `backend/api/mrp/produce`.
 *
 * Wire format: snake_case JSON.
 */
import { Type, Static } from '@sinclair/typebox'
import { RequestFeatures } from '../mcp/requestFeatures.js'

export const ProductType = Type.Union([
  Type.Literal('architecture'),
  Type.Literal('document'),
  Type.Literal('presentation'),
  Type.Literal('diagram'),
  Type.Literal('pdf'),
  Type.Literal('code'),
], { $id: 'ProductType', description: 'Kind of artifact the MRP pipeline should produce.' })

export type ProductType = Static<typeof ProductType>

export const DocumentFormat = Type.Union([
  Type.Literal('docx'),
  Type.Literal('pdf'),
  Type.Literal('html'),
  Type.Literal('md'),
], { $id: 'DocumentFormat' })

export type DocumentFormat = Static<typeof DocumentFormat>

export const DocumentSection = Type.Object({
  heading: Type.String(),
  content: Type.String(),
  level: Type.Optional(Type.Integer({ minimum: 1, maximum: 6, default: 2 })),
  citations: Type.Optional(Type.Array(Type.String())),
}, { $id: 'DocumentSection' })

export type DocumentSection = Static<typeof DocumentSection>

export const DocumentBom = Type.Object({
  product_type: Type.Literal('document'),
  bom_version: Type.Literal('2.0'),
  title: Type.String(),
  sections: Type.Array(DocumentSection),
  format: Type.Optional(DocumentFormat),
  citations: Type.Optional(Type.Array(Type.String())),
  language: Type.Optional(Type.String()),
}, { $id: 'DocumentBom' })

export type DocumentBom = Static<typeof DocumentBom>

export const ArchitectureBom = Type.Object({
  product_type: Type.Literal('architecture'),
  bom_version: Type.Literal('2.0'),
  blueprint_id: Type.Optional(Type.String()),
  title: Type.String(),
  requirements: Type.Array(Type.String()),
  constraints: Type.Optional(Type.Array(Type.String())),
}, { $id: 'ArchitectureBom' })

export type ArchitectureBom = Static<typeof ArchitectureBom>

export const GenericBom = Type.Object({
  product_type: ProductType,
  bom_version: Type.Literal('2.0'),
}, { $id: 'GenericBom', additionalProperties: true })

export type GenericBom = Static<typeof GenericBom>

export const ProduceRequest = Type.Object({
  product_type: ProductType,
  brief: Type.Optional(Type.String({ description: 'Free-form user intent; resolved to a BOM by briefToSections/RLM fold.' })),
  bom: Type.Optional(Type.Union([DocumentBom, ArchitectureBom, GenericBom])),
  _request_features: Type.Optional(RequestFeatures),
  agent_id: Type.Optional(Type.String({ description: 'Optional WebSocket correlation id for streaming progress.' })),
}, {
  $id: 'ProduceRequest',
  description: 'Plugin → orchestrator /produce payload. Either `brief` or `bom` must be provided.',
})

export type ProduceRequest = Static<typeof ProduceRequest>
