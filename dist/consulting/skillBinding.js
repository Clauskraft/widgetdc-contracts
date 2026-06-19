/**
 * SkillTaskBinding — binds a consulting skill file to its LlmMatrix task type
 * and expected output format.
 *
 * Every consulting skill (adopt-consulting-partner, adopt-deliverable, etc.)
 * MUST declare a binding. This ensures that swapping the LLM provider preserves
 * the output contract — the skill's task_type routes through LlmMatrix to the
 * best available provider, but the output_format and methodology are immutable.
 *
 * Wire format: snake_case JSON, $id: SkillTaskBinding
 *
 * Example (skill file frontmatter or registry entry):
 *   {
 *     "skill_id": "adopt-consulting-partner",
 *     "task_type": "consulting_assessment",
 *     "output_format": "html",
 *     "methodology": "pyramid+mece",
 *     "provider_constraints": []
 *   }
 */
import { Type } from '@sinclair/typebox';
/**
 * Consulting-specific TaskType literals — extend widgetdc-contracts/llm TaskType
 * with domain-specific routing keys.
 */
export const ConsultingTaskType = Type.Union([
    Type.Literal('consulting_assessment'),
    Type.Literal('consulting_storyline'),
    Type.Literal('consulting_deliverable'),
], { $id: 'ConsultingTaskType', description: 'Consulting-domain task types for LlmMatrix routing.' });
/**
 * SkillTaskBinding — registry entry for a consulting skill.
 *
 * Stored as :SkillBinding nodes in Neo4j and consumed by the skill loader
 * to verify that every active skill has an LlmMatrix-resolvable task_type.
 */
export const SkillTaskBinding = Type.Object({
    skill_id: Type.String({ description: 'Skill file name without extension, e.g. "adopt-consulting-partner".' }),
    task_type: Type.String({ description: 'LlmMatrix TaskType (including consulting_* extensions).' }),
    output_format: Type.String({ description: 'Expected OutputFormat of this skill\'s primary deliverable.' }),
    methodology: Type.Optional(Type.String({ description: 'Named methodology, e.g. "pyramid+mece" or "swot".' })),
    provider_constraints: Type.Optional(Type.Array(Type.String(), {
        description: 'Explicit ProviderId list if the skill REQUIRES specific capabilities (multimodal, etc.). Empty = any.',
    })),
    harvest_to_graph: Type.Optional(Type.Boolean({
        default: true,
        description: 'If true, skill output MUST be persisted as a WorkArtifact+BOMItem in the graph.',
    })),
    version: Type.Optional(Type.String({ description: 'Semver of this binding definition.' })),
    updated_at: Type.Optional(Type.String({ format: 'date-time' })),
}, {
    $id: 'SkillTaskBinding',
    description: 'Binds a consulting skill to its LlmMatrix task_type + output_format contract. Decouples skill methodology from provider identity.',
    additionalProperties: false,
});
/** Canonical bindings for the 4 core consulting skills. */
export const CANONICAL_SKILL_BINDINGS = [
    {
        skill_id: 'adopt-consulting-partner',
        task_type: 'consulting_assessment',
        output_format: 'html',
        methodology: 'pyramid+mece',
        harvest_to_graph: true,
        version: '1.0.0',
    },
    {
        skill_id: 'adopt-deliverable',
        task_type: 'consulting_deliverable',
        output_format: 'markdown',
        methodology: 'structured-narrative',
        harvest_to_graph: true,
        version: '1.0.0',
    },
    {
        skill_id: 'adopt-storyline-builder',
        task_type: 'consulting_storyline',
        output_format: 'json',
        methodology: 'pyramid+mece',
        harvest_to_graph: true,
        version: '1.0.0',
    },
    {
        skill_id: 'adopt-financial-modeler',
        task_type: 'consulting_deliverable',
        output_format: 'json',
        methodology: 'financial-lineage',
        harvest_to_graph: true,
        version: '1.0.0',
    },
];
//# sourceMappingURL=skillBinding.js.map