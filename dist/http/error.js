import { Type } from '@sinclair/typebox';
export const ApiErrorCode = Type.Union([
    Type.Literal('VALIDATION_ERROR'),
    Type.Literal('AUTH_ERROR'),
    Type.Literal('NOT_FOUND'),
    Type.Literal('RATE_LIMIT'),
    Type.Literal('INTERNAL_ERROR'),
    Type.Literal('TIMEOUT'),
    Type.Literal('SERVICE_UNAVAILABLE'),
]);
export const ApiError = Type.Object({
    code: ApiErrorCode,
    message: Type.String(),
    status_code: Type.Integer({ minimum: 400, maximum: 599 }),
    details: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    correlation_id: Type.Optional(Type.String()),
});
//# sourceMappingURL=error.js.map