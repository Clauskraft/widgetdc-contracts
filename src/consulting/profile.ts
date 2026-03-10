import { Type, Static } from '@sinclair/typebox'
import { DomainId } from './enums.js'
import { HealthMetrics } from '../health/metrics.js'

/** Combined domain identity and its intelligence status */
export const DomainHealthProfile = Type.Object({
  domain_id: DomainId,
  health: HealthMetrics,
  intelligence_assets_count: Type.Integer({ description: 'Number of linked intelligence assets' }),
  risk_rules_triggered: Type.Integer({ description: 'Count of active risk rules' }),
  updated_at: Type.String({ format: 'date-time' }),
}, { $id: 'DomainHealthProfile', description: 'Combined domain identity and its intelligence status' })

export type DomainHealthProfile = Static<typeof DomainHealthProfile>
