/**
 * @widgetdc/contracts — Shared type contracts for the WidgeTDC platform
 *
 * Single source of truth for cross-service types.
 * Wire format: snake_case JSON (matching RLM Engine production API).
 *
 * Subpath imports available:
 *   import { CognitiveRequest } from '@widgetdc/contracts/cognitive'
 *   import { HealthPulse } from '@widgetdc/contracts/health'
 *   import { ApiResponse } from '@widgetdc/contracts/http'
 *   import { DomainId } from '@widgetdc/contracts/consulting'
 *   import { AgentTier } from '@widgetdc/contracts/agent'
 *   import { NodeLabel } from '@widgetdc/contracts/graph'
 *   import { AgentHandshake } from '@widgetdc/contracts/orchestrator'
 *   import { SalienceVector } from '@widgetdc/contracts/opportunities'
 *   import { LlmMatrix, TaskType } from '@widgetdc/contracts/llm'
 *   import { ProduceRequest, ProductionOrder } from '@widgetdc/contracts/mrp'
 *   import { AuditHashChainEntry } from '@widgetdc/contracts/security'
 *   import { BOMItem, ConfigurationSnapshot, WorkArtifact } from '@widgetdc/contracts/decision-bom'
 *   import { DemandObject, ExtractionContract } from '@widgetdc/contracts/demand-to-proof'
 *   import { PARLReasonRequest, PARLReasonResponse } from '@widgetdc/contracts/parl'
 *   import { WdcChatTurnRequest, WdcChatTurnResult } from '@widgetdc/contracts/chat-contract-runtime'
 *   import { ContinuationReceipt, ContinuationState } from '@widgetdc/contracts/continuation'
 *   import { ExecutionEnvelope, SynthesisReceipt } from '@widgetdc/contracts/execution'
 */
export * from './cognitive/index.js';
export * from './health/index.js';
export * from './http/index.js';
export * from './consulting/index.js';
export * from './agent/index.js';
export * from './graph/index.js';
export * from './orchestrator/index.js';
export * from './opportunities/index.js';
export * from './mcp/index.js';
export * from './mrp/index.js';
export * from './security/index.js';
export * from './normalization/index.js';
export * from './adoption/index.js';
export * from './llm/index.js';
export * from './decision-bom/index.js';
export * from './demand-to-proof/index.js';
export * from './parl/index.js';
export * from './chat-contract-runtime/index.js';
export * from './continuation/index.js';
export * from './execution/index.js';
//# sourceMappingURL=index.js.map