import { Type } from '@sinclair/typebox';
/**
 * Canonical Neo4j relationship types used across all 3 services.
 * All types are UPPER_SNAKE per convention.
 */
export const RelationshipType = Type.Union([
    // Hierarchy & structure
    Type.Literal('BELONGS_TO_DOMAIN'),
    Type.Literal('HAS_SUBPROCESS'),
    Type.Literal('HAS_TASK'),
    Type.Literal('PARENT_PROCESS'),
    // Engagement
    Type.Literal('USES_PROCESS'),
    Type.Literal('HAS_TRACK'),
    Type.Literal('ASSIGNED_TO'),
    Type.Literal('IMPLEMENTS'),
    // Methodology & quality
    Type.Literal('USES_METHODOLOGY'),
    Type.Literal('MEASURES'),
    Type.Literal('EVALUATES'),
    Type.Literal('HAS_CRITERION'),
    // Tools & integration
    Type.Literal('HAS_CAPABILITY'),
    Type.Literal('USES_TOOL'),
    Type.Literal('USES_FRAMEWORK'),
    Type.Literal('CODE_FOR'),
    // Knowledge & evidence
    Type.Literal('CONTAINS_PATTERN'),
    Type.Literal('SUPPORTED_BY'),
    Type.Literal('CITES'),
    Type.Literal('IN_DOMAIN'),
    Type.Literal('RELATES_TO'),
    Type.Literal('IS_A'),
    // Agents & self-model
    Type.Literal('RUNS'),
    Type.Literal('MADE_DECISION'),
    Type.Literal('HAS_CONTENT'),
    // Data quality
    Type.Literal('SIMILAR_TO'),
    Type.Literal('DUPLICATE_OF'),
    // Expansion
    Type.Literal('HAS_EXPANSION_SIGNAL'),
    Type.Literal('DETECTED_AT'),
], { $id: 'RelationshipType', description: 'Canonical Neo4j relationship types' });
//# sourceMappingURL=relationships.js.map