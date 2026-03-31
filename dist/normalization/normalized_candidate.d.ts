import { Static } from '@sinclair/typebox';
/** A candidate normalized from any source family into a common schema */
export declare const NormalizedCandidate: import("@sinclair/typebox").TObject<{
    candidate_id: import("@sinclair/typebox").TString;
    source_family: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"regulatory">, import("@sinclair/typebox").TLiteral<"enterprise">]>;
    source_id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TString;
    content: import("@sinclair/typebox").TString;
    confidence: import("@sinclair/typebox").TNumber;
    metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
    normalized_at: import("@sinclair/typebox").TString;
    normalization_version: import("@sinclair/typebox").TString;
}>;
export type NormalizedCandidate = Static<typeof NormalizedCandidate>;
//# sourceMappingURL=normalized_candidate.d.ts.map