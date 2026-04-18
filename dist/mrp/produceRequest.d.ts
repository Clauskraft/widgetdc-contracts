/**
 * ProduceRequest — Plugin / orchestrator entrypoint payload for /produce.
 *
 * Office-addin taskpane, LibreChat agents, and future SDKs all POST this
 * shape to `orchestrator/produce`, which forwards to `backend/api/mrp/produce`.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const ProductType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"architecture">, import("@sinclair/typebox").TLiteral<"document">, import("@sinclair/typebox").TLiteral<"presentation">, import("@sinclair/typebox").TLiteral<"diagram">, import("@sinclair/typebox").TLiteral<"pdf">, import("@sinclair/typebox").TLiteral<"code">]>;
export type ProductType = Static<typeof ProductType>;
export declare const DocumentFormat: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"docx">, import("@sinclair/typebox").TLiteral<"pdf">, import("@sinclair/typebox").TLiteral<"html">, import("@sinclair/typebox").TLiteral<"md">]>;
export type DocumentFormat = Static<typeof DocumentFormat>;
export declare const DocumentSection: import("@sinclair/typebox").TObject<{
    heading: import("@sinclair/typebox").TString;
    content: import("@sinclair/typebox").TString;
    level: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    citations: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
}>;
export type DocumentSection = Static<typeof DocumentSection>;
export declare const DocumentBom: import("@sinclair/typebox").TObject<{
    product_type: import("@sinclair/typebox").TLiteral<"document">;
    bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
    title: import("@sinclair/typebox").TString;
    sections: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        heading: import("@sinclair/typebox").TString;
        content: import("@sinclair/typebox").TString;
        level: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        citations: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    }>>;
    format: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"docx">, import("@sinclair/typebox").TLiteral<"pdf">, import("@sinclair/typebox").TLiteral<"html">, import("@sinclair/typebox").TLiteral<"md">]>>;
    citations: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    language: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type DocumentBom = Static<typeof DocumentBom>;
export declare const ArchitectureBom: import("@sinclair/typebox").TObject<{
    product_type: import("@sinclair/typebox").TLiteral<"architecture">;
    bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
    blueprint_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    title: import("@sinclair/typebox").TString;
    requirements: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    constraints: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
}>;
export type ArchitectureBom = Static<typeof ArchitectureBom>;
export declare const GenericBom: import("@sinclair/typebox").TObject<{
    product_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"architecture">, import("@sinclair/typebox").TLiteral<"document">, import("@sinclair/typebox").TLiteral<"presentation">, import("@sinclair/typebox").TLiteral<"diagram">, import("@sinclair/typebox").TLiteral<"pdf">, import("@sinclair/typebox").TLiteral<"code">]>;
    bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
}>;
export type GenericBom = Static<typeof GenericBom>;
export declare const ProduceRequest: import("@sinclair/typebox").TObject<{
    product_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"architecture">, import("@sinclair/typebox").TLiteral<"document">, import("@sinclair/typebox").TLiteral<"presentation">, import("@sinclair/typebox").TLiteral<"diagram">, import("@sinclair/typebox").TLiteral<"pdf">, import("@sinclair/typebox").TLiteral<"code">]>;
    brief: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    bom: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
        product_type: import("@sinclair/typebox").TLiteral<"document">;
        bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
        title: import("@sinclair/typebox").TString;
        sections: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            heading: import("@sinclair/typebox").TString;
            content: import("@sinclair/typebox").TString;
            level: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
            citations: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        }>>;
        format: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"docx">, import("@sinclair/typebox").TLiteral<"pdf">, import("@sinclair/typebox").TLiteral<"html">, import("@sinclair/typebox").TLiteral<"md">]>>;
        citations: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        language: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>, import("@sinclair/typebox").TObject<{
        product_type: import("@sinclair/typebox").TLiteral<"architecture">;
        bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
        blueprint_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        title: import("@sinclair/typebox").TString;
        requirements: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        constraints: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    }>, import("@sinclair/typebox").TObject<{
        product_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"architecture">, import("@sinclair/typebox").TLiteral<"document">, import("@sinclair/typebox").TLiteral<"presentation">, import("@sinclair/typebox").TLiteral<"diagram">, import("@sinclair/typebox").TLiteral<"pdf">, import("@sinclair/typebox").TLiteral<"code">]>;
        bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
    }>]>>;
    _request_features: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        task_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"summarize">, import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"review">, import("@sinclair/typebox").TLiteral<"classify">, import("@sinclair/typebox").TLiteral<"translate">, import("@sinclair/typebox").TLiteral<"code">, import("@sinclair/typebox").TLiteral<"reason">, import("@sinclair/typebox").TLiteral<"retrieve">, import("@sinclair/typebox").TLiteral<"compose">, import("@sinclair/typebox").TLiteral<"other">]>;
        language: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        pii_present: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        max_latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        max_cost_usd: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        compliance_tier: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"public">, import("@sinclair/typebox").TLiteral<"internal">, import("@sinclair/typebox").TLiteral<"legal">, import("@sinclair/typebox").TLiteral<"health">]>>;
        reasoning_depth: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    agent_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type ProduceRequest = Static<typeof ProduceRequest>;
//# sourceMappingURL=produceRequest.d.ts.map