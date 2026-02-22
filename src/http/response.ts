import { Type, Static, TSchema } from '@sinclair/typebox'
import { ApiError } from './error.js'

export const ResponseMetadata = Type.Object({
  request_id: Type.Optional(Type.String()),
  timestamp: Type.Optional(Type.String({ format: 'date-time' })),
  duration_ms: Type.Optional(Type.Integer({ minimum: 0 })),
  correlation_id: Type.Optional(Type.String()),
})

export type ResponseMetadata = Static<typeof ResponseMetadata>

/**
 * Generic API response factory.
 * Use `ApiResponseOf(MySchema)` to create a typed response schema.
 */
export const ApiResponseOf = <T extends TSchema>(dataSchema: T) =>
  Type.Object({
    success: Type.Boolean(),
    data: Type.Optional(dataSchema),
    error: Type.Optional(ApiError),
    metadata: Type.Optional(ResponseMetadata),
  })

/** Concrete untyped version for JSON Schema export */
export const ApiResponse = Type.Object({
  success: Type.Boolean(),
  data: Type.Optional(Type.Unknown()),
  error: Type.Optional(ApiError),
  metadata: Type.Optional(ResponseMetadata),
}, { $id: 'ApiResponse', description: 'Standard API response envelope.' })

/** TypeScript convenience type — use ApiResponse<T> for typed access */
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: Static<typeof ApiError>
  metadata?: Static<typeof ResponseMetadata>
}

export const PaginatedResponse = Type.Object({
  items: Type.Array(Type.Unknown()),
  total: Type.Integer({ minimum: 0 }),
  page: Type.Integer({ minimum: 1 }),
  page_size: Type.Integer({ minimum: 1 }),
  has_more: Type.Boolean(),
}, { $id: 'PaginatedResponse', description: 'Paginated list response.' })

export type PaginatedResponse<T = unknown> = {
  items: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}
