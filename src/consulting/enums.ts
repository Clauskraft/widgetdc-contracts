import { Type, Static } from '@sinclair/typebox'

/** 15 consulting domains — canonical identifiers matching Neo4j ConsultingDomain nodes */
export const DomainId = Type.Union([
  Type.Literal('strategy_corp'),
  Type.Literal('deals_ma'),
  Type.Literal('financial_advisory'),
  Type.Literal('operations_supply_chain'),
  Type.Literal('technology_digital'),
  Type.Literal('ai_analytics'),
  Type.Literal('cybersecurity'),
  Type.Literal('risk_compliance_controls'),
  Type.Literal('tax_legal_adjacent'),
  Type.Literal('esg_sustainability'),
  Type.Literal('customer_marketing_sales'),
  Type.Literal('people_organization'),
  Type.Literal('pmo_change'),
  Type.Literal('industry_solutions'),
  Type.Literal('managed_services_operate'),
], { $id: 'DomainId', description: 'Canonical consulting domain identifier' })

export type DomainId = Static<typeof DomainId>

export const ProcessStatus = Type.Union([
  Type.Literal('live'),
  Type.Literal('shell'),
  Type.Literal('new'),
], { $id: 'ProcessStatus', description: 'L1/L2 process maturity status' })

export type ProcessStatus = Static<typeof ProcessStatus>

/** Short IDs for each domain — used in canonicalId construction (e.g. STR-01) */
export const DOMAIN_SHORT_IDS: Record<Static<typeof DomainId>, string> = {
  strategy_corp: 'STR',
  deals_ma: 'DEA',
  financial_advisory: 'FIN',
  operations_supply_chain: 'OPS',
  technology_digital: 'TEC',
  ai_analytics: 'AIA',
  cybersecurity: 'CYB',
  risk_compliance_controls: 'RIS',
  tax_legal_adjacent: 'TAX',
  esg_sustainability: 'ESG',
  customer_marketing_sales: 'CMS',
  people_organization: 'PEO',
  pmo_change: 'PMO',
  industry_solutions: 'IND',
  managed_services_operate: 'MSO',
}
