/**
 * LLM Matrix — Type definitions
 *
 * Canonical types for the cross-service LLM routing matrix. Every service
 * (backend, orchestrator, rlm-engine) MUST route LLM calls through the
 * matrix rather than hardcoding model names.
 *
 * @see llm-matrix.json for the canonical data.
 * @see LlmMatrix for the loader/resolver API.
 */
/** Provider identifier — keys into the `providers` block of the matrix. */
export type ProviderId = 'qwen' | 'deepseek' | 'gemini' | 'openai' | 'anthropic' | 'inception' | 'groq' | 'local';
/** Canonical task taxonomy. Every LLM call maps to exactly one task type. */
export type TaskType = 'attestation' | 'extraction_short' | 'extraction_long' | 'classification' | 'fold_context' | 'chat_standard' | 'chat_premium' | 'code_generation' | 'planning' | 'reasoning_deep' | 'multimodal' | 'ner' | 'self_healing' | 'embedding_text';
/** Provider configuration — how to reach a provider and which env var holds its auth. */
export interface ProviderConfig {
    base_url: string;
    auth_env: string | null;
    openai_compatible: boolean;
    daily_request_cap?: number;
}
/** Model metadata — provider, capabilities, cost, and known weaknesses. */
export interface ModelConfig {
    provider: ProviderId;
    context_window?: number;
    max_output_tokens?: number;
    embedding_dims?: number;
    cost_per_1k_input_usd: number;
    cost_per_1k_output_usd?: number;
    avg_latency_ms: number;
    throughput_tokens_per_sec?: number;
    strengths?: string[];
    weaknesses?: string[];
}
/** Task routing config — ordered fallback chain, env override, kill switch. */
export interface TaskConfig {
    description: string;
    /** Ordered list of model names to try. First succeeding wins. */
    chain: string[];
    /** Env var name that, when set to a model name, bypasses the chain. */
    override_env: string | null;
    /** Env var name that, when set to 'true', disables this task entirely (returns empty chain). */
    disable_env: string | null;
    /** If true, task is disabled unless disable_env is explicitly set to 'false'. Fail-closed default. */
    default_disabled: boolean;
    rationale?: string;
}
/** Top-level matrix document. */
export interface LlmMatrixDocument {
    $id: string;
    $schema?: string;
    version: string;
    updated_at: string;
    description: string;
    providers: Record<ProviderId, ProviderConfig>;
    models: Record<string, ModelConfig>;
    tasks: Record<TaskType, TaskConfig>;
}
/** Resolution result when asking the matrix for a task's effective chain. */
export interface ChainResolution {
    task: TaskType;
    /** Effective ordered list of model names to try. Empty array = task disabled. */
    models: string[];
    /** How the chain was produced: 'default' | 'env_override' | 'disabled' | 'disabled_by_default'. */
    source: 'default' | 'env_override' | 'disabled' | 'disabled_by_default';
    /** If source === 'env_override', the env var name that produced the override. */
    override_env?: string;
    /** If source === 'disabled', the env var name that disabled it. */
    disable_env?: string;
}
//# sourceMappingURL=types.d.ts.map