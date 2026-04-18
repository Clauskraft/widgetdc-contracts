/**
 * BomComponent — common base for `:PhantomComponent`, `:LLMProvider`,
 * `:Pattern`, `:Bid`, and other BOM-level typed nodes.
 *
 * Codifies the normalisation invariants (`bom_version`, `normalization_complete`,
 * `last_audited`) so downstream services can rely on a single shape.
 *
 * Wire format: snake_case JSON.
 */
import { Type } from '@sinclair/typebox';
export const BomComponentKind = Type.Union([
    Type.Literal('phantom_component'),
    Type.Literal('llm_provider'),
    Type.Literal('pattern'),
    Type.Literal('bid'),
    Type.Literal('slot'),
    Type.Literal('other'),
], { $id: 'BomComponentKind' });
export const BomComponent = Type.Object({
    component_id: Type.String(),
    kind: BomComponentKind,
    name: Type.Optional(Type.String()),
    bom_version: Type.String({ const: '2.0', description: 'Normalisation-invariant: all BOM-touched nodes carry this.' }),
    normalization_complete: Type.Boolean({ description: 'True when every required field is filled by the ingest pipeline.' }),
    last_audited: Type.Optional(Type.String({ format: 'date-time' })),
    provenance: Type.Optional(Type.String({ description: 'Source tool / service that produced this component.' })),
    tier: Type.Optional(Type.Integer({ minimum: 1, maximum: 3, description: 'Sourcing tier (1=internal, 2=external, 3=pattern-built).' })),
    capability: Type.Optional(Type.String()),
    trust_score: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
}, {
    $id: 'BomComponent',
    description: 'Common BOM-level component shape. Concrete subtypes add their own required fields via schema extension.',
    additionalProperties: true,
});
//# sourceMappingURL=bomComponent.js.map