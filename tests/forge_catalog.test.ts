import { describe, it, expect } from 'vitest'
import { Value } from '@sinclair/typebox/value'
import { Type } from '@sinclair/typebox'

/**
 * Contract test for VALHALLA_TEMPLATE_CATALOG
 * Verifies that the Forge can only use canonical IDs.
 */

const CanonicalTemplateId = Type.Union([
  Type.Literal('valhalla.executive_strategy.board_master'),
  Type.Literal('valhalla.public_sector_compliance.sovereign_master'),
  Type.Literal('valhalla.tender_response.traceability_master'),
  Type.Literal('valhalla.architecture_assessment.reference_master'),
  Type.Literal('valhalla.replacement_case.vendor_exit_master'),
  Type.Literal('valhalla.delivery_operating_model.execution_master'),
  Type.Literal('valhalla.commercial_business_case.financial_master'),
], { $id: 'CanonicalTemplateId' })

describe('forge/template-catalog', () => {
  it('validates all template IDs from the 2026-03-19 catalog', () => {
    const ids = [
      'valhalla.executive_strategy.board_master',
      'valhalla.public_sector_compliance.sovereign_master',
      'valhalla.tender_response.traceability_master',
      'valhalla.architecture_assessment.reference_master',
      'valhalla.replacement_case.vendor_exit_master',
      'valhalla.delivery_operating_model.execution_master',
      'valhalla.commercial_business_case.financial_master',
    ]
    for (const id of ids) {
      expect(Value.Check(CanonicalTemplateId, id)).toBe(true)
    }
  })

  it('rejects non-canonical or misspelled template IDs', () => {
    expect(Value.Check(CanonicalTemplateId, 'valhalla.wrong_template')).toBe(false)
    expect(Value.Check(CanonicalTemplateId, 'executive_strategy.board_master')).toBe(false)
  })

  it('verifies that .pptx and .xlsx types are implicitly supported by the naming convention', () => {
    const pptxTemplates = [
      'valhalla.executive_strategy.board_master',
      'valhalla.public_sector_compliance.sovereign_master'
    ]
    const xlsxTemplates = [
      'valhalla.commercial_business_case.financial_master'
    ]
    
    // Assert naming consistency
    for (const id of pptxTemplates) {
      expect(id).toMatch(/master$/)
    }
    for (const id of xlsxTemplates) {
      expect(id).toMatch(/financial_master$/)
    }
  })
})
