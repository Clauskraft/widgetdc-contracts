import { Static } from '@sinclair/typebox';
export declare const FabricProof: import("@sinclair/typebox").TObject<{
    proof_id: import("@sinclair/typebox").TString;
    proof_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"sgt">, import("@sinclair/typebox").TString]>;
    verification_status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"unverified">, import("@sinclair/typebox").TLiteral<"expired">, import("@sinclair/typebox").TLiteral<"revoked">]>;
    authorized_tool_namespaces: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    issued_at: import("@sinclair/typebox").TString;
    expires_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    issuer: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    handshake_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type FabricProof = Static<typeof FabricProof>;
//# sourceMappingURL=fabric-proof.d.ts.map