/**
 * PhantomBOM HTTP wire types — compose + route request/response envelopes.
 *
 * Mirrors Python Pydantic models in rlm-engine/src/models/phantom_bom_requests.py.
 * Endpoints: POST /phantom-bom/compose, POST /phantom-bom/{run_id}/route
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const PhantomBOMFramework: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"MECE">, import("@sinclair/typebox").TLiteral<"HDR">, import("@sinclair/typebox").TLiteral<"Pyramid">, import("@sinclair/typebox").TLiteral<"STRIDE">]>;
export type PhantomBOMFramework = Static<typeof PhantomBOMFramework>;
export declare const PhantomBOMComposeRequest: import("@sinclair/typebox").TObject<{
    framework: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"MECE">, import("@sinclair/typebox").TLiteral<"HDR">, import("@sinclair/typebox").TLiteral<"Pyramid">, import("@sinclair/typebox").TLiteral<"STRIDE">]>;
    brief: import("@sinclair/typebox").TString;
    correlation_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    max_items: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
}>;
export type PhantomBOMComposeRequest = Static<typeof PhantomBOMComposeRequest>;
export declare const PhantomBOMRouteRequest: import("@sinclair/typebox").TObject<{}>;
export type PhantomBOMRouteRequest = Static<typeof PhantomBOMRouteRequest>;
export declare const PhantomBOMResponse: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TBoolean;
    data: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
    metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
}>;
export type PhantomBOMResponse = Static<typeof PhantomBOMResponse>;
//# sourceMappingURL=composeRequest.d.ts.map