/**
 * UniversalAssemblyBlock — Unified multi-modality building block standard for WDC.
 *
 * Implements the 7 modalities and 9 core invariants triangulated across
 * NotebookLM, WDC Agent Office doctrine, and international standards (RAMI 4.0 IEC 63278,
 * W3C PROV-O, SQL:2011 Bitemporal, UCUM, RFC 8785).
 *
 * Incorporates all 4 architectural ratchets from Qwen peer review:
 *   1. Deontic Evaluation Engine (prevents hidden LLM calls for normative text)
 *   2. Staleness Hard Boundary (prevents stale price / flash-crash execution)
 *   3. Explicit Dimensional Snapping (prevents implicit unit coercion like EUR/t -> DKK/kg)
 *   4. Strict Type vs Instance Separation (AssemblyBlock is immutable catalog asset;
 *      BOMItem is transient runtime activation)
 *
 * Wire format: snake_case JSON.
 */
import { Type, Static } from '@sinclair/typebox'
import { BOMDataClass, BOMJurisdictionPolicy } from './bomItem.js'

export const BlockModality = Type.Union([
  Type.Literal('code_deterministic', { description: 'Pure functions, WASM, compiled algorithms with zero epistemic variance.' }),
  Type.Literal('live_market_signal', { description: 'External market feed, commodity spot price, FX, freight index, or IoT sensor stream.' }),
  Type.Literal('parametric_analytical_model', { description: 'Parametric formula (Little\'s Law, DuPont ROE, EOQ, Black-Scholes, LCA GHG).' }),
  Type.Literal('normative_policy_text', { description: 'Regulatory articles (NIS2, CSRD, GDPR), procurement contracts, or SLA clauses.' }),
  Type.Literal('operational_ground_data', { description: 'Gozinto BOMs, routing steps, workstation capacities, lead times from ERP.' }),
  Type.Literal('cognitive_prompt_agent', { description: 'Cognitive reasoning prompt pattern, Minto pyramid synthesis, multi-agent arbitration.' }),
  Type.Literal('human_gate', { description: 'Asynchronous human sign-off, four-eyes principle, compliance officer approval.' }),
], { $id: 'BlockModality' })

export type BlockModality = Static<typeof BlockModality>

export const NormativeEvaluationEngine = Type.Union([
  Type.Literal('rego_opa', { description: 'Deterministic Open Policy Agent / Rego policy bytecode.' }),
  Type.Literal('json_logic', { description: 'Deterministic JSON Logic predicate tree.' }),
  Type.Literal('deterministic_predicate', { description: 'Compiled pure function predicate.' }),
  Type.Literal('linked_cognitive_agent', { description: 'Explicitly linked cognitive agent with pinned prompt-hash and model.' }),
  Type.Literal('human_verification_only', { description: 'Requires direct human gate evaluation.' }),
], { $id: 'NormativeEvaluationEngine' })

export type NormativeEvaluationEngine = Static<typeof NormativeEvaluationEngine>

export const PortContract = Type.Object({
  name: Type.String({ minLength: 1, description: 'Port name (e.g. "copper_spot_price", "annual_demand", "risk_status").' }),
  data_type: Type.String({ minLength: 1, description: 'Underlying data type, e.g. number, string, boolean, object.' }),
  unit_of_measure: Type.Optional(Type.String({ description: 'Standardized UCUM or ISO 4217 unit, e.g. "DKK/metric_ton", "EUR/MWh", "hours", "kg_CO2e".' })),
  schema_definition: Type.Record(Type.String(), Type.Unknown(), { description: 'JSON Schema / TypeBox definition for port payload.' }),
  is_optional: Type.Boolean({ default: false }),
  allow_implicit_coercion: Type.Literal(false, { default: false, description: 'Ratchet 3: Implicit unit conversion is forbidden. Explicit adapter blocks required.' }),
}, {
  $id: 'PortContract',
  description: 'Typed port interface for AssemblyBlock snapping contracts.',
})

export type PortContract = Static<typeof PortContract>

export const BitemporalAnchor = Type.Object({
  valid_from: Type.String({ format: 'date-time', description: 'When this fact became valid in the real world (T_valid start).' }),
  valid_to: Type.Optional(Type.String({ format: 'date-time', description: 'When this fact ceases to be valid (T_valid end).' })),
  recorded_at: Type.String({ format: 'date-time', description: 'When this fact was transacted/recorded in the system (T_tx).' }),
  refresh_cadence: Type.Union([
    Type.Literal('realtime_stream'),
    Type.Literal('hourly_tick'),
    Type.Literal('daily_close'),
    Type.Literal('event_driven'),
    Type.Literal('static_immutable'),
  ]),
  ttl_seconds: Type.Optional(Type.Integer({ minimum: 0, description: 'Expected time-to-live before revalidation is required.' })),
  max_staleness_seconds: Type.Integer({
    minimum: 1,
    description: 'Ratchet 2: Hard ceiling. If (T_now - T_valid) > max_staleness_seconds, execution must fail-closed.',
  }),
}, {
  $id: 'BitemporalAnchor',
  description: 'Bitemporal validity anchors per SQL:2011.',
})

export type BitemporalAnchor = Static<typeof BitemporalAnchor>

export const EpistemicConfidence = Type.Object({
  confidence_score: Type.Number({ minimum: 0, maximum: 1, description: '1.0 for deterministic code; <1.0 for probabilistic models or feeds.' }),
  entropy: Type.Optional(Type.Number({ minimum: 0, description: 'Shannon entropy H(X) representing information uncertainty.' })),
  variance_tolerance: Type.Optional(Type.Number({ description: 'Permissible variance or standard deviation.' })),
  evidence_class: Type.Union([
    Type.Literal('measured_sensor_telemetry'),
    Type.Literal('audited_signed_document'),
    Type.Literal('statistically_inferred'),
    Type.Literal('expert_consensus'),
    Type.Literal('unverified_candidate'),
  ]),
}, {
  $id: 'EpistemicConfidence',
  description: 'Epistemic uncertainty and proof grading for the block.',
})

export type EpistemicConfidence = Static<typeof EpistemicConfidence>

export const BlockEconomics = Type.Object({
  currency: Type.String({ default: 'DKK', description: 'Settlement currency (ISO 4217).' }),
  marginal_cost_unit: Type.Number({ minimum: 0, description: 'Marginal execution cost per call in specified currency.' }),
  compute_latency_ms_p95: Type.Number({ minimum: 0, description: 'P95 expected latency in milliseconds.' }),
  estimated_tokens: Type.Optional(Type.Integer({ minimum: 0, description: 'Token budget if LLM/cognitive reasoning is involved.' })),
  marginal_carbon_gCO2e: Type.Optional(Type.Number({ minimum: 0, description: 'Estimated GHG Scope 2/3 carbon footprint per invocation.' })),
  licensing_model: Type.Union([
    Type.Literal('open_source'),
    Type.Literal('internal_proprietary'),
    Type.Literal('commercial_api_metered'),
    Type.Literal('per_seat_subscription'),
  ]),
}, {
  $id: 'BlockEconomics',
  description: 'Unit economics and FinOps resource tensor.',
})

export type BlockEconomics = Static<typeof BlockEconomics>

export const MarketSignalSpecifics = Type.Object({
  feed_source_uri: Type.String({ minLength: 1, description: 'Authoritative URI or market symbol (e.g. LME-CU-CASH, NP-DK1-SPOT).' }),
  oracle_attestation_type: Type.Union([
    Type.Literal('tls_notary'),
    Type.Literal('signed_jwt_oracle'),
    Type.Literal('mutual_tls_direct'),
    Type.Literal('unattested_rest_poll'),
  ]),
  standard_lot_size: Type.Optional(Type.Number({ minimum: 0, description: 'Contract standard lot volume (e.g. 25 tonnes for LME copper).' })),
  order_book_depth_checked: Type.Optional(Type.Boolean({ default: false })),
})

export const NormativePolicySpecifics = Type.Object({
  jurisdiction_authority: Type.String({ minLength: 1, description: 'E.g. EU Parliament, Danish FSA, ISO Committee.' }),
  legal_reference_uri: Type.String({ minLength: 1, description: 'Canonical URI to directive, regulation, or contract artifact.' }),
  evaluation_engine: NormativeEvaluationEngine,
  deontic_rule_digest: Type.Optional(Type.String({ pattern: '^sha256:[a-f0-9]{64}$', description: 'SHA-256 of the executable Rego/JSON-logic policy rule.' })),
  linked_cognitive_agent_ref: Type.Optional(Type.String({ description: 'Pinned URN of cognitive prompt agent if interpretive reasoning is needed.' })),
})

export const UniversalAssemblyBlock = Type.Object({
  id: Type.String({
    pattern: '^urn:wdc:block:[a-z0-9_.-]+:[a-z0-9_.-]+:v[0-9]+$',
    description: 'Canonical block URN (e.g. "urn:wdc:block:supply-chain:copper-spot-feed:v1").',
  }),
  title: Type.String({ minLength: 1, description: 'Human-readable title.' }),
  version: Type.String({ pattern: '^[0-9]+\\.[0-9]+\\.[0-9]+$', description: 'SemVer version string.' }),
  modality: BlockModality,
  domain: Type.String({ description: 'Business or functional domain (e.g. Procurement, Energy, CyberNIS2, Finance, Manufacturing).' }),

  // Capability mapping
  required_capabilities: Type.Array(Type.String(), { description: 'Canonical capability URNs this block depends on.' }),
  provided_capabilities: Type.Array(Type.String(), { description: 'Canonical capability URNs this block satisfies.' }),

  // Snapping Ports (Studs and Tubes)
  input_ports: Type.Array(PortContract, { description: 'Input ports with typed schemas and unit dimensions.' }),
  output_ports: Type.Array(PortContract, { description: 'Output ports with guaranteed schemas and unit dimensions.' }),

  // Preconditions & Failure Rails
  preconditions: Type.Array(Type.String(), { description: 'Semantic invariants that MUST hold before invocation.' }),
  postconditions: Type.Array(Type.String(), { description: 'Semantic guarantees produced upon successful termination.' }),
  failure_rail: Type.Union([
    Type.Literal('fail_closed'),
    Type.Literal('use_last_valid_with_staleness_flag'),
    Type.Literal('fallback_to_designated_proxy'),
    Type.Literal('halt_and_escalate_to_human'),
  ]),
  fallback_block_urn: Type.Optional(Type.String({ pattern: '^urn:wdc:block:[a-z0-9_.-]+:[a-z0-9_.-]+:v[0-9]+$' })),

  // Modality-specific extensions
  market_signal: Type.Optional(MarketSignalSpecifics),
  normative_policy: Type.Optional(NormativePolicySpecifics),

  // Anchors, Economics & Epistemics
  bitemporal: BitemporalAnchor,
  epistemic: EpistemicConfidence,
  economics: BlockEconomics,

  // Governance & Sovereignty (harmonized with BOMItem)
  jurisdiction_policy: BOMJurisdictionPolicy,
  data_class: BOMDataClass,

  // Cryptographic Provenance (RFC 8785 CVID)
  content_digest: Type.String({ pattern: '^sha256:[a-f0-9]{64}$', description: 'RFC 8785 Canonical JSON content-addressed SHA-256.' }),
  attestation_authority: Type.String({ description: 'Signing authority identity (agent, CI runner, or operator key).' }),
  signature: Type.Optional(Type.String({ description: 'Ed25519 signature over canonical content digest.' })),
  lifecycle: Type.Union([
    Type.Literal('candidate'),
    Type.Literal('canary'),
    Type.Literal('verified'),
    Type.Literal('deprecated'),
    Type.Literal('revoked'),
  ]),
}, {
  $id: 'UniversalAssemblyBlock',
  description: 'The universal atomic building block standard for WDC multi-domain execution (Plan B).',
  additionalProperties: false,
})

export type UniversalAssemblyBlock = Static<typeof UniversalAssemblyBlock>
