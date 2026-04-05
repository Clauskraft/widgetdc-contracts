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

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type {
  LlmMatrixDocument,
  TaskType,
  TaskConfig,
  ModelConfig,
  ProviderConfig,
  ProviderId,
  ChainResolution,
} from './types.js'

// Load llm-matrix.json at module init via fs (portable across Node 18/20/22 ESM
// without requiring import attributes, which need module: Node20/NodeNext).
// Startup cost ~1ms; matrix is frozen after load.
const __dirname = dirname(fileURLToPath(import.meta.url))
const matrix: LlmMatrixDocument = JSON.parse(
  readFileSync(join(__dirname, 'llm-matrix.json'), 'utf-8'),
)

/** Read env var with cross-runtime safety (Node + edge). */
function env(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) return process.env[key]
  return undefined
}

export class LlmMatrix {
  /** Canonical matrix version (semver). */
  static get version(): string {
    return matrix.version
  }

  /**
   * Resolve the effective fallback chain for a task, applying env overrides
   * and disable flags. Returns an empty chain if the task is disabled.
   */
  static resolve(task: TaskType): ChainResolution {
    const taskCfg = matrix.tasks[task]
    if (!taskCfg) {
      throw new Error(`[LlmMatrix] Unknown task: ${task}`)
    }

    // 1. Disable env var check (explicit kill switch wins)
    if (taskCfg.disable_env) {
      const disableVal = env(taskCfg.disable_env)
      if (disableVal === 'true') {
        return { task, models: [], source: 'disabled', disable_env: taskCfg.disable_env }
      }
    }

    // 2. default_disabled: task stays disabled unless explicitly opted in
    if (taskCfg.default_disabled) {
      const disableVal = taskCfg.disable_env ? env(taskCfg.disable_env) : undefined
      if (disableVal !== 'false') {
        return {
          task,
          models: [],
          source: 'disabled_by_default',
          disable_env: taskCfg.disable_env ?? undefined,
        }
      }
    }

    // 3. Override env var (single-model bypass OR explicit disable)
    if (taskCfg.override_env) {
      const overrideVal = env(taskCfg.override_env)
      if (overrideVal && overrideVal !== 'default') {
        if (overrideVal === 'disabled') {
          return { task, models: [], source: 'disabled', override_env: taskCfg.override_env }
        }
        // Validate that the override references a known model
        if (!matrix.models[overrideVal]) {
          throw new Error(
            `[LlmMatrix] ${taskCfg.override_env}=${overrideVal} is not a known model. ` +
              `Known models: ${Object.keys(matrix.models).join(', ')}`,
          )
        }
        return {
          task,
          models: [overrideVal],
          source: 'env_override',
          override_env: taskCfg.override_env,
        }
      }
    }

    // 4. Default chain
    return { task, models: [...taskCfg.chain], source: 'default' }
  }

  /** Lookup a model by name. Throws if unknown. */
  static getModel(name: string): ModelConfig {
    const model = matrix.models[name]
    if (!model) {
      throw new Error(
        `[LlmMatrix] Unknown model: ${name}. Add it to llm-matrix.json under "models".`,
      )
    }
    return model
  }

  /** Lookup a provider by id. Throws if unknown. */
  static getProvider(id: ProviderId): ProviderConfig {
    const provider = matrix.providers[id]
    if (!provider) {
      throw new Error(`[LlmMatrix] Unknown provider: ${id}`)
    }
    return provider
  }

  /** List all defined task types. */
  static listTasks(): TaskType[] {
    return Object.keys(matrix.tasks) as TaskType[]
  }

  /** List all defined model names. */
  static listModels(): string[] {
    return Object.keys(matrix.models)
  }

  /** List all defined provider ids. */
  static listProviders(): ProviderId[] {
    return Object.keys(matrix.providers) as ProviderId[]
  }

  /** Get the raw task config (for introspection / tooling). */
  static getTaskConfig(task: TaskType): TaskConfig {
    return matrix.tasks[task]
  }

  /**
   * Validate the matrix for internal consistency:
   *   - every task chain references known models
   *   - every model references a known provider
   *   - override/disable env names are not duplicated
   * Returns an array of error strings (empty = valid).
   */
  static validate(): string[] {
    const errors: string[] = []

    for (const [modelName, model] of Object.entries(matrix.models)) {
      if (!matrix.providers[model.provider]) {
        errors.push(`model "${modelName}" references unknown provider "${model.provider}"`)
      }
    }

    for (const [taskName, task] of Object.entries(matrix.tasks)) {
      if (!Array.isArray(task.chain) || task.chain.length === 0) {
        errors.push(`task "${taskName}" has empty chain`)
      }
      for (const modelName of task.chain) {
        if (!matrix.models[modelName]) {
          errors.push(`task "${taskName}" chain references unknown model "${modelName}"`)
        }
      }
    }

    const envVars = new Set<string>()
    for (const [taskName, task] of Object.entries(matrix.tasks)) {
      for (const envName of [task.override_env, task.disable_env]) {
        if (!envName) continue
        if (envVars.has(envName)) {
          errors.push(`env var "${envName}" (task "${taskName}") is used by multiple tasks`)
        }
        envVars.add(envName)
      }
    }

    return errors
  }

  /**
   * Dump the effective chain for every task under current env. Useful for
   * /health endpoints and debugging.
   */
  static dumpAll(): Record<TaskType, ChainResolution> {
    const result = {} as Record<TaskType, ChainResolution>
    for (const task of this.listTasks()) {
      result[task] = this.resolve(task)
    }
    return result
  }
}
