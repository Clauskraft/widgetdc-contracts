import { Static } from '@sinclair/typebox';
/** Input to the normalization pipeline */
export declare const NormalizationInput: import("@sinclair/typebox").TObject<{
    source_family: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"regulatory">, import("@sinclair/typebox").TLiteral<"enterprise">]>;
    source_id: import("@sinclair/typebox").TString;
    raw_content: import("@sinclair/typebox").TString;
    raw_metadata: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>>;
    pipeline_config: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        strip_html: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        max_content_length: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        extract_title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>>;
}>;
export type NormalizationInput = Static<typeof NormalizationInput>;
/** Successful normalization output */
export declare const NormalizationOutput: import("@sinclair/typebox").TObject<{
    candidate: import("@sinclair/typebox").TObject<{
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
    pipeline_version: import("@sinclair/typebox").TString;
    processing_time_ms: import("@sinclair/typebox").TNumber;
}>;
export type NormalizationOutput = Static<typeof NormalizationOutput>;
/** Normalization error */
export declare const NormalizationError: import("@sinclair/typebox").TObject<{
    source_id: import("@sinclair/typebox").TString;
    source_family: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"regulatory">, import("@sinclair/typebox").TLiteral<"enterprise">]>;
    error_code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"INVALID_CONTENT">, import("@sinclair/typebox").TLiteral<"UNSUPPORTED_FORMAT">, import("@sinclair/typebox").TLiteral<"CONTENT_TOO_LARGE">, import("@sinclair/typebox").TLiteral<"MISSING_REQUIRED_FIELD">, import("@sinclair/typebox").TLiteral<"PIPELINE_ERROR">]>;
    message: import("@sinclair/typebox").TString;
    occurred_at: import("@sinclair/typebox").TString;
}>;
export type NormalizationError = Static<typeof NormalizationError>;
//# sourceMappingURL=normalization_pipeline.d.ts.map