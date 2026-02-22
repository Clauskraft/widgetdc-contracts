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
 */

export * from './cognitive/index.js'
export * from './health/index.js'
export * from './http/index.js'
export * from './consulting/index.js'
export * from './agent/index.js'
export * from './graph/index.js'
