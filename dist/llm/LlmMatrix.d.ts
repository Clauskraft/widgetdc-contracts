/**
 * LlmMatrix — canonical LLM task→model resolver
 *
 * Pure data-layer API: resolves the effective fallback chain for a task
 * given current environment variables. Does NOT perform HTTP calls —
 * consumers (backend, orchestrator, rlm-engine) are responsible for
 * invoking the provider API using their own HTTP client.
 *
 * Usage:
 *   import { LlmMatrix } from '@widgetdc/contracts/llm'
 *   const chain = LlmMatrix.resolve('attestation')
 *   if (chain.models.length === 0) return  // disabled
 *   for (const modelName of chain.models) {
 *     const model = LlmMatrix.getModel(modelName)
 *     const provider = LlmMatrix.getProvider(model.provider)
 *     // ... call provider.base_url with process.env[provider.auth_env] ...
 *   }
 */
import type { TaskType, TaskConfig, ModelConfig, ProviderConfig, ProviderId, ChainResolution } from './types.js';
export declare class LlmMatrix {
    /** Canonical matrix version (semver). */
    static get version(): string;
    /**
     * Resolve the effective fallback chain for a task, applying env overrides
     * and disable flags. Returns an empty chain if the task is disabled.
     */
    static resolve(task: TaskType): ChainResolution;
    /** Lookup a model by name. Throws if unknown. */
    static getModel(name: string): ModelConfig;
    /** Lookup a provider by id. Throws if unknown. */
    static getProvider(id: ProviderId): ProviderConfig;
    /** List all defined task types. */
    static listTasks(): TaskType[];
    /** List all defined model names. */
    static listModels(): string[];
    /** List all defined provider ids. */
    static listProviders(): ProviderId[];
    /** Get the raw task config (for introspection / tooling). */
    static getTaskConfig(task: TaskType): TaskConfig;
    /**
     * Validate the matrix for internal consistency:
     *   - every task chain references known models
     *   - every model references a known provider
     *   - override/disable env names are not duplicated
     * Returns an array of error strings (empty = valid).
     */
    static validate(): string[];
    /**
     * Dump the effective chain for every task under current env. Useful for
     * /health endpoints and debugging.
     */
    static dumpAll(): Record<TaskType, ChainResolution>;
}
//# sourceMappingURL=LlmMatrix.d.ts.map