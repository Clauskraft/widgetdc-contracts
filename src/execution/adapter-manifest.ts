import { Static, Type } from '@sinclair/typebox'
import { AdapterRole } from './execution-envelope.js'

export const ADAPTER_MANIFEST_SCHEMA_ID =
  'https://contracts.widgetdc.dev/execution/adapter-manifest.schema.json' as const

export const AdapterManifest = Type.Object(
  {
    $id: Type.Literal(ADAPTER_MANIFEST_SCHEMA_ID),
    adapter_id: Type.String({ minLength: 1 }),
    adapter_version: Type.String({ minLength: 1 }),
    protocol_version: Type.Literal('1.0.0'),
    supported_workflows: Type.Array(
      Type.Union([
        Type.Literal('discover'),
        Type.Literal('define'),
        Type.Literal('develop'),
        Type.Literal('deliver'),
      ]),
      { minItems: 1, uniqueItems: true },
    ),
    supported_roles: Type.Array(AdapterRole, { minItems: 1, uniqueItems: true }),
    input_schema_ids: Type.Array(Type.String({ format: 'uri' }), { uniqueItems: true }),
    output_schema_ids: Type.Array(Type.String({ format: 'uri' }), { minItems: 1, uniqueItems: true }),
    required_env_names: Type.Array(Type.String({ pattern: '^[A-Z][A-Z0-9_]*$' }), {
      uniqueItems: true,
    }),
    timeout_ms: Type.Integer({ minimum: 1 }),
    cancellation_supported: Type.Boolean(),
    idempotency_supported: Type.Boolean(),
    state_scope: Type.Union([Type.Literal('isolated_run'), Type.Literal('adapter_local')]),
    health_check_command: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
  },
  {
    $id: ADAPTER_MANIFEST_SCHEMA_ID,
    title: 'WDC Adapter Manifest',
    additionalProperties: false,
  },
)
export type AdapterManifest = Static<typeof AdapterManifest>
