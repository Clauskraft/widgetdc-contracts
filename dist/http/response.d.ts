import { Static, TSchema } from '@sinclair/typebox';
import { ApiError } from './error.js';
export declare const ResponseMetadata: import("@sinclair/typebox").TObject<{
    request_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timestamp: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    duration_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type ResponseMetadata = Static<typeof ResponseMetadata>;
/**
 * Generic API response factory.
 * Use `ApiResponseOf(MySchema)` to create a typed response schema.
 */
export declare const ApiResponseOf: <T extends TSchema>(dataSchema: T) => import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TBoolean;
    data: T extends import("@sinclair/typebox").TOptional<infer S extends TSchema> ? import("@sinclair/typebox").TOptional<S> : import("@sinclair/typebox").Ensure<import("@sinclair/typebox").TOptional<T>>;
    error: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">, import("@sinclair/typebox").TLiteral<"AUTH_ERROR">, import("@sinclair/typebox").TLiteral<"NOT_FOUND">, import("@sinclair/typebox").TLiteral<"RATE_LIMIT">, import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">, import("@sinclair/typebox").TLiteral<"TIMEOUT">, import("@sinclair/typebox").TLiteral<"SERVICE_UNAVAILABLE">]>;
        message: import("@sinclair/typebox").TString;
        status_code: import("@sinclair/typebox").TInteger;
        details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>>;
        correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    metadata: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        request_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        timestamp: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        duration_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
/** Concrete untyped version for JSON Schema export */
export declare const ApiResponse: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TBoolean;
    data: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnknown>;
    error: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">, import("@sinclair/typebox").TLiteral<"AUTH_ERROR">, import("@sinclair/typebox").TLiteral<"NOT_FOUND">, import("@sinclair/typebox").TLiteral<"RATE_LIMIT">, import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">, import("@sinclair/typebox").TLiteral<"TIMEOUT">, import("@sinclair/typebox").TLiteral<"SERVICE_UNAVAILABLE">]>;
        message: import("@sinclair/typebox").TString;
        status_code: import("@sinclair/typebox").TInteger;
        details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>>;
        correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    metadata: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        request_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        timestamp: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        duration_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
/** TypeScript convenience type — use ApiResponse<T> for typed access */
export type ApiResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: Static<typeof ApiError>;
    metadata?: Static<typeof ResponseMetadata>;
};
export declare const PaginatedResponse: import("@sinclair/typebox").TObject<{
    items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnknown>;
    total: import("@sinclair/typebox").TInteger;
    page: import("@sinclair/typebox").TInteger;
    page_size: import("@sinclair/typebox").TInteger;
    has_more: import("@sinclair/typebox").TBoolean;
}>;
export type PaginatedResponse<T = unknown> = {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    has_more: boolean;
};
//# sourceMappingURL=response.d.ts.map