import { Value } from '@sinclair/typebox/value'
import { describe, expect, it } from 'vitest'
import '../src/formats.js' // register uuid/date-time FormatRegistry checkers
import {
  UniversalAssemblyBlock,
  BlockModality,
  PortContract,
  BitemporalAnchor,
  EpistemicConfidence,
  BlockEconomics,
} from '../src/decision-bom/index.js'

describe('UniversalAssemblyBlock Contracts', () => {
  const baseValidBlock: UniversalAssemblyBlock = {
    id: 'urn:wdc:block:supply-chain:copper-spot-feed:v1',
    title: 'LME Copper Grade A Cash Settlement Feed',
    version: '1.0.0',
    modality: 'live_market_signal',
    domain: 'Procurement',
    required_capabilities: ['urn:wdc:capability:market-feed:lme-poller:v1'],
    provided_capabilities: ['urn:wdc:capability:commodity:copper-spot-rate:v1'],
    input_ports: [
      {
        name: 'ticker_symbol',
        data_type: 'string',
        schema_definition: { type: 'string', enum: ['LME-CA-CASH'] },
        is_optional: false,
        allow_implicit_coercion: false,
      },
    ],
    output_ports: [
      {
        name: 'settlement_price',
        data_type: 'number',
        unit_of_measure: 'USD/metric_ton',
        schema_definition: { type: 'number', minimum: 0 },
        is_optional: false,
        allow_implicit_coercion: false,
      },
    ],
    preconditions: ['market_session_open', 'api_rate_limit_headroom > 10'],
    postconditions: ['price_is_positive', 'observed_staleness < max_staleness_seconds'],
    failure_rail: 'use_last_valid_with_staleness_flag',
    fallback_block_urn: 'urn:wdc:block:supply-chain:copper-proxy-estimate:v1',
    market_signal: {
      feed_source_uri: 'https://api.lme.com/v1/cash/copper',
      oracle_attestation_type: 'tls_notary',
      standard_lot_size: 25,
      order_book_depth_checked: true,
    },
    bitemporal: {
      valid_from: '2026-10-11T12:00:00Z',
      valid_to: '2026-10-11T16:00:00Z',
      recorded_at: '2026-10-11T12:00:05Z',
      refresh_cadence: 'hourly_tick',
      ttl_seconds: 3600,
      max_staleness_seconds: 7200, // Ratchet 2: Strict upper ceiling
    },
    epistemic: {
      confidence_score: 0.99,
      entropy: 0.05,
      evidence_class: 'measured_sensor_telemetry',
    },
    economics: {
      currency: 'DKK',
      marginal_cost_unit: 0.15,
      compute_latency_ms_p95: 120,
      licensing_model: 'commercial_api_metered',
    },
    jurisdiction_policy: 'EU_ONLY',
    data_class: 'public',
    content_digest: 'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    attestation_authority: 'agent:market-sentinel',
    lifecycle: 'verified',
  }

  it('GREEN: accepts a fully-populated live_market_signal block with Ratchet 2 staleness ceiling', () => {
    expect(Value.Check(UniversalAssemblyBlock, baseValidBlock)).toBe(true)
  })

  it('GREEN: accepts a normative_policy_text block with Ratchet 1 Rego OPA evaluation engine', () => {
    const policyBlock: UniversalAssemblyBlock = {
      id: 'urn:wdc:block:cyber:nis2-art21-incident-rule:v1',
      title: 'NIS2 Directive Article 21 Security Measure Evaluator',
      version: '1.2.0',
      modality: 'normative_policy_text',
      domain: 'CyberNIS2',
      required_capabilities: ['urn:wdc:capability:audit:asset-telemetry:v1'],
      provided_capabilities: ['urn:wdc:capability:compliance:nis2-status:v1'],
      input_ports: [
        {
          name: 'incident_metrics',
          data_type: 'object',
          schema_definition: { type: 'object' },
          is_optional: false,
          allow_implicit_coercion: false,
        },
      ],
      output_ports: [
        {
          name: 'compliance_verdict',
          data_type: 'string',
          schema_definition: { type: 'string', enum: ['COMPLIANT', 'NON_COMPLIANT'] },
          is_optional: false,
          allow_implicit_coercion: false,
        },
      ],
      preconditions: ['entity_classified_as_essential_or_important'],
      postconditions: ['verdict_recorded_to_eventspine'],
      failure_rail: 'fail_closed',
      normative_policy: {
        jurisdiction_authority: 'European Union / Danish Cyber Security Centre',
        legal_reference_uri: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj',
        evaluation_engine: 'rego_opa', // Ratchet 1: No hidden LLM execution
        deontic_rule_digest: 'sha256:99887766554433221100aabbccddeeff99887766554433221100aabbccddeeff',
      },
      bitemporal: {
        valid_from: '2024-10-17T00:00:00Z',
        recorded_at: '2026-10-11T09:00:00Z',
        refresh_cadence: 'static_immutable',
        max_staleness_seconds: 31536000,
      },
      epistemic: {
        confidence_score: 1.0,
        evidence_class: 'audited_signed_document',
      },
      economics: {
        currency: 'DKK',
        marginal_cost_unit: 0.01,
        compute_latency_ms_p95: 15,
        licensing_model: 'internal_proprietary',
      },
      jurisdiction_policy: 'EU_ONLY',
      data_class: 'legal',
      content_digest: 'sha256:fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
      attestation_authority: 'agent:legal-sentinel',
      lifecycle: 'verified',
    }
    expect(Value.Check(UniversalAssemblyBlock, policyBlock)).toBe(true)
  })

  it('GREEN: accepts a parametric_analytical_model block (Little\'s Law)', () => {
    const littlesLawBlock: UniversalAssemblyBlock = {
      id: 'urn:wdc:block:operations:littles-law-wip-solver:v1',
      title: 'Little\'s Law WIP Calculator (L = lambda * W)',
      version: '1.0.0',
      modality: 'parametric_analytical_model',
      domain: 'Manufacturing',
      required_capabilities: [],
      provided_capabilities: ['urn:wdc:capability:solver:littles-law:v1'],
      input_ports: [
        {
          name: 'arrival_rate_lambda',
          data_type: 'number',
          unit_of_measure: 'units/hour',
          schema_definition: { type: 'number', minimum: 0 },
          is_optional: false,
          allow_implicit_coercion: false,
        },
        {
          name: 'lead_time_w',
          data_type: 'number',
          unit_of_measure: 'hours',
          schema_definition: { type: 'number', minimum: 0 },
          is_optional: false,
          allow_implicit_coercion: false,
        },
      ],
      output_ports: [
        {
          name: 'work_in_progress_l',
          data_type: 'number',
          unit_of_measure: 'units',
          schema_definition: { type: 'number', minimum: 0 },
          is_optional: false,
          allow_implicit_coercion: false,
        },
      ],
      preconditions: ['lambda >= 0', 'W >= 0'],
      postconditions: ['L === lambda * W'],
      failure_rail: 'fail_closed',
      bitemporal: {
        valid_from: '1961-01-01T00:00:00Z',
        recorded_at: '2026-10-11T00:00:00Z',
        refresh_cadence: 'static_immutable',
        max_staleness_seconds: 315360000,
      },
      epistemic: {
        confidence_score: 1.0,
        entropy: 0.0,
        evidence_class: 'audited_signed_document',
      },
      economics: {
        currency: 'DKK',
        marginal_cost_unit: 0.001,
        compute_latency_ms_p95: 1,
        licensing_model: 'open_source',
      },
      jurisdiction_policy: 'NONE',
      data_class: 'public',
      content_digest: 'sha256:112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00',
      attestation_authority: 'agent:math-sentinel',
      lifecycle: 'verified',
    }
    expect(Value.Check(UniversalAssemblyBlock, littlesLawBlock)).toBe(true)
  })

  // -------------------------------------------------------------
  // ADVERSARIAL & GATE HONESTY TESTS (Both directions proven)
  // -------------------------------------------------------------

  it('RED: rejects block with invalid canonical URN format', () => {
    const invalidUrn = {
      ...baseValidBlock,
      id: 'invalid-urn-without-prefix',
    }
    expect(Value.Check(UniversalAssemblyBlock, invalidUrn)).toBe(false)
  })

  it('RED: Ratchet 2 rejects live market signal with missing or non-positive max_staleness_seconds', () => {
    const invalidStaleness = {
      ...baseValidBlock,
      bitemporal: {
        ...baseValidBlock.bitemporal,
        max_staleness_seconds: 0, // Violates minimum: 1
      },
    }
    expect(Value.Check(UniversalAssemblyBlock, invalidStaleness)).toBe(false)
  })

  it('RED: Ratchet 3 rejects port with allow_implicit_coercion: true', () => {
    const invalidCoercion = {
      ...baseValidBlock,
      output_ports: [
        {
          ...baseValidBlock.output_ports[0],
          allow_implicit_coercion: true as false, // Forced breach
        },
      ],
    }
    expect(Value.Check(UniversalAssemblyBlock, invalidCoercion)).toBe(false)
  })

  it('RED: rejects block with unknown modality', () => {
    const unknownModality = {
      ...baseValidBlock,
      modality: 'quantum_teleportation' as any,
    }
    expect(Value.Check(UniversalAssemblyBlock, unknownModality)).toBe(false)
  })
})
