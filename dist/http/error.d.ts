import { Static } from '@sinclair/typebox';
export declare const ApiErrorCode: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">, import("@sinclair/typebox").TLiteral<"AUTH_ERROR">, import("@sinclair/typebox").TLiteral<"NOT_FOUND">, import("@sinclair/typebox").TLiteral<"RATE_LIMIT">, import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">, import("@sinclair/typebox").TLiteral<"TIMEOUT">, import("@sinclair/typebox").TLiteral<"SERVICE_UNAVAILABLE">]>;
export type ApiErrorCode = Static<typeof ApiErrorCode>;
export declare const ApiError: import("@sinclair/typebox").TObject<{
    code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">, import("@sinclair/typebox").TLiteral<"AUTH_ERROR">, import("@sinclair/typebox").TLiteral<"NOT_FOUND">, import("@sinclair/typebox").TLiteral<"RATE_LIMIT">, import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">, import("@sinclair/typebox").TLiteral<"TIMEOUT">, import("@sinclair/typebox").TLiteral<"SERVICE_UNAVAILABLE">]>;
    message: import("@sinclair/typebox").TString;
    status_code: import("@sinclair/typebox").TInteger;
    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>>;
    correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type ApiError = Static<typeof ApiError>;
//# sourceMappingURL=error.d.ts.map