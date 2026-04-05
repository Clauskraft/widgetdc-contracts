/**
 * @widgetdc/contracts/llm — Canonical LLM routing matrix
 *
 * Single source of truth for task→model routing across the WidgeTDC platform.
 * Every service (backend, orchestrator, rlm-engine) imports from here.
 *
 * @example
 *   import { LlmMatrix, type TaskType } from '@widgetdc/contracts/llm'
 *   const chain = LlmMatrix.resolve('attestation')
 *   if (chain.models.length === 0) return  // disabled
 *   for (const modelName of chain.models) {
 *     try { return await callProvider(modelName, messages) } catch {}
 *   }
 */

export { LlmMatrix } from './LlmMatrix.js'
export type {
  ProviderId,
  TaskType,
  ProviderConfig,
  ModelConfig,
  TaskConfig,
  LlmMatrixDocument,
  ChainResolution,
} from './types.js'
