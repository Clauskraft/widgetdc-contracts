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
import { Static } from '@sinclair/typebox';
/**
 * Consulting-specific TaskType literals — extend widgetdc-contracts/llm TaskType
 * with domain-specific routing keys.
 */
export declare const ConsultingTaskType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"consulting_assessment">, import("@sinclair/typebox").TLiteral<"consulting_storyline">, import("@sinclair/typebox").TLiteral<"consulting_deliverable">]>;
export type ConsultingTaskType = Static<typeof ConsultingTaskType>;
/**
 * SkillTaskBinding — registry entry for a consulting skill.
 *
 * Stored as :SkillBinding nodes in Neo4j and consumed by the skill loader
 * to verify that every active skill has an LlmMatrix-resolvable task_type.
 */
export declare const SkillTaskBinding: import("@sinclair/typebox").TObject<{
    skill_id: import("@sinclair/typebox").TString;
    task_type: import("@sinclair/typebox").TString;
    output_format: import("@sinclair/typebox").TString;
    methodology: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    provider_constraints: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    harvest_to_graph: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    version: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    updated_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type SkillTaskBinding = Static<typeof SkillTaskBinding>;
/** Canonical bindings for the 4 core consulting skills. */
export declare const CANONICAL_SKILL_BINDINGS: SkillTaskBinding[];
//# sourceMappingURL=skillBinding.d.ts.map