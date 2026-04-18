/**
 * BomComponent — common base for `:PhantomComponent`, `:LLMProvider`,
 * `:Pattern`, `:Bid`, and other BOM-level typed nodes.
 *
 * Codifies the normalisation invariants (`bom_version`, `normalization_complete`,
 * `last_audited`) so downstream services can rely on a single shape.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const BomComponentKind: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"phantom_component">, import("@sinclair/typebox").TLiteral<"llm_provider">, import("@sinclair/typebox").TLiteral<"pattern">, import("@sinclair/typebox").TLiteral<"bid">, import("@sinclair/typebox").TLiteral<"slot">, import("@sinclair/typebox").TLiteral<"other">]>;
export type BomComponentKind = Static<typeof BomComponentKind>;
export declare const BomComponent: import("@sinclair/typebox").TObject<{
    component_id: import("@sinclair/typebox").TString;
    kind: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"phantom_component">, import("@sinclair/typebox").TLiteral<"llm_provider">, import("@sinclair/typebox").TLiteral<"pattern">, import("@sinclair/typebox").TLiteral<"bid">, import("@sinclair/typebox").TLiteral<"slot">, import("@sinclair/typebox").TLiteral<"other">]>;
    name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
    normalization_complete: import("@sinclair/typebox").TBoolean;
    last_audited: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    provenance: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    tier: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    capability: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    trust_score: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export type BomComponent = Static<typeof BomComponent>;
//# sourceMappingURL=bomComponent.d.ts.map