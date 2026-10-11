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
import { Static } from '@sinclair/typebox';
export declare const BlockModality: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"code_deterministic">, import("@sinclair/typebox").TLiteral<"live_market_signal">, import("@sinclair/typebox").TLiteral<"parametric_analytical_model">, import("@sinclair/typebox").TLiteral<"normative_policy_text">, import("@sinclair/typebox").TLiteral<"operational_ground_data">, import("@sinclair/typebox").TLiteral<"cognitive_prompt_agent">, import("@sinclair/typebox").TLiteral<"human_gate">]>;
export type BlockModality = Static<typeof BlockModality>;
export declare const NormativeEvaluationEngine: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rego_opa">, import("@sinclair/typebox").TLiteral<"json_logic">, import("@sinclair/typebox").TLiteral<"deterministic_predicate">, import("@sinclair/typebox").TLiteral<"linked_cognitive_agent">, import("@sinclair/typebox").TLiteral<"human_verification_only">]>;
export type NormativeEvaluationEngine = Static<typeof NormativeEvaluationEngine>;
export declare const PortContract: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TString;
    data_type: import("@sinclair/typebox").TString;
    unit_of_measure: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    schema_definition: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
    is_optional: import("@sinclair/typebox").TBoolean;
    allow_implicit_coercion: import("@sinclair/typebox").TLiteral<false>;
}>;
export type PortContract = Static<typeof PortContract>;
export declare const BitemporalAnchor: import("@sinclair/typebox").TObject<{
    valid_from: import("@sinclair/typebox").TString;
    valid_to: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    recorded_at: import("@sinclair/typebox").TString;
    refresh_cadence: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"realtime_stream">, import("@sinclair/typebox").TLiteral<"hourly_tick">, import("@sinclair/typebox").TLiteral<"daily_close">, import("@sinclair/typebox").TLiteral<"event_driven">, import("@sinclair/typebox").TLiteral<"static_immutable">]>;
    ttl_seconds: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    max_staleness_seconds: import("@sinclair/typebox").TInteger;
}>;
export type BitemporalAnchor = Static<typeof BitemporalAnchor>;
export declare const EpistemicConfidence: import("@sinclair/typebox").TObject<{
    confidence_score: import("@sinclair/typebox").TNumber;
    entropy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    variance_tolerance: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    evidence_class: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"measured_sensor_telemetry">, import("@sinclair/typebox").TLiteral<"audited_signed_document">, import("@sinclair/typebox").TLiteral<"statistically_inferred">, import("@sinclair/typebox").TLiteral<"expert_consensus">, import("@sinclair/typebox").TLiteral<"unverified_candidate">]>;
}>;
export type EpistemicConfidence = Static<typeof EpistemicConfidence>;
export declare const BlockEconomics: import("@sinclair/typebox").TObject<{
    currency: import("@sinclair/typebox").TString;
    marginal_cost_unit: import("@sinclair/typebox").TNumber;
    compute_latency_ms_p95: import("@sinclair/typebox").TNumber;
    estimated_tokens: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    marginal_carbon_gCO2e: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    licensing_model: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"open_source">, import("@sinclair/typebox").TLiteral<"internal_proprietary">, import("@sinclair/typebox").TLiteral<"commercial_api_metered">, import("@sinclair/typebox").TLiteral<"per_seat_subscription">]>;
}>;
export type BlockEconomics = Static<typeof BlockEconomics>;
export declare const MarketSignalSpecifics: import("@sinclair/typebox").TObject<{
    feed_source_uri: import("@sinclair/typebox").TString;
    oracle_attestation_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"tls_notary">, import("@sinclair/typebox").TLiteral<"signed_jwt_oracle">, import("@sinclair/typebox").TLiteral<"mutual_tls_direct">, import("@sinclair/typebox").TLiteral<"unattested_rest_poll">]>;
    standard_lot_size: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    order_book_depth_checked: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export declare const NormativePolicySpecifics: import("@sinclair/typebox").TObject<{
    jurisdiction_authority: import("@sinclair/typebox").TString;
    legal_reference_uri: import("@sinclair/typebox").TString;
    evaluation_engine: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rego_opa">, import("@sinclair/typebox").TLiteral<"json_logic">, import("@sinclair/typebox").TLiteral<"deterministic_predicate">, import("@sinclair/typebox").TLiteral<"linked_cognitive_agent">, import("@sinclair/typebox").TLiteral<"human_verification_only">]>;
    deontic_rule_digest: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    linked_cognitive_agent_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const UniversalAssemblyBlock: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TString;
    version: import("@sinclair/typebox").TString;
    modality: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"code_deterministic">, import("@sinclair/typebox").TLiteral<"live_market_signal">, import("@sinclair/typebox").TLiteral<"parametric_analytical_model">, import("@sinclair/typebox").TLiteral<"normative_policy_text">, import("@sinclair/typebox").TLiteral<"operational_ground_data">, import("@sinclair/typebox").TLiteral<"cognitive_prompt_agent">, import("@sinclair/typebox").TLiteral<"human_gate">]>;
    domain: import("@sinclair/typebox").TString;
    required_capabilities: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    provided_capabilities: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    input_ports: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TString;
        data_type: import("@sinclair/typebox").TString;
        unit_of_measure: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        schema_definition: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
        is_optional: import("@sinclair/typebox").TBoolean;
        allow_implicit_coercion: import("@sinclair/typebox").TLiteral<false>;
    }>>;
    output_ports: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TString;
        data_type: import("@sinclair/typebox").TString;
        unit_of_measure: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        schema_definition: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
        is_optional: import("@sinclair/typebox").TBoolean;
        allow_implicit_coercion: import("@sinclair/typebox").TLiteral<false>;
    }>>;
    preconditions: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    postconditions: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    failure_rail: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"fail_closed">, import("@sinclair/typebox").TLiteral<"use_last_valid_with_staleness_flag">, import("@sinclair/typebox").TLiteral<"fallback_to_designated_proxy">, import("@sinclair/typebox").TLiteral<"halt_and_escalate_to_human">]>;
    fallback_block_urn: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    market_signal: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        feed_source_uri: import("@sinclair/typebox").TString;
        oracle_attestation_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"tls_notary">, import("@sinclair/typebox").TLiteral<"signed_jwt_oracle">, import("@sinclair/typebox").TLiteral<"mutual_tls_direct">, import("@sinclair/typebox").TLiteral<"unattested_rest_poll">]>;
        standard_lot_size: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        order_book_depth_checked: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>>;
    normative_policy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        jurisdiction_authority: import("@sinclair/typebox").TString;
        legal_reference_uri: import("@sinclair/typebox").TString;
        evaluation_engine: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"rego_opa">, import("@sinclair/typebox").TLiteral<"json_logic">, import("@sinclair/typebox").TLiteral<"deterministic_predicate">, import("@sinclair/typebox").TLiteral<"linked_cognitive_agent">, import("@sinclair/typebox").TLiteral<"human_verification_only">]>;
        deontic_rule_digest: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        linked_cognitive_agent_ref: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    bitemporal: import("@sinclair/typebox").TObject<{
        valid_from: import("@sinclair/typebox").TString;
        valid_to: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        recorded_at: import("@sinclair/typebox").TString;
        refresh_cadence: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"realtime_stream">, import("@sinclair/typebox").TLiteral<"hourly_tick">, import("@sinclair/typebox").TLiteral<"daily_close">, import("@sinclair/typebox").TLiteral<"event_driven">, import("@sinclair/typebox").TLiteral<"static_immutable">]>;
        ttl_seconds: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        max_staleness_seconds: import("@sinclair/typebox").TInteger;
    }>;
    epistemic: import("@sinclair/typebox").TObject<{
        confidence_score: import("@sinclair/typebox").TNumber;
        entropy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        variance_tolerance: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        evidence_class: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"measured_sensor_telemetry">, import("@sinclair/typebox").TLiteral<"audited_signed_document">, import("@sinclair/typebox").TLiteral<"statistically_inferred">, import("@sinclair/typebox").TLiteral<"expert_consensus">, import("@sinclair/typebox").TLiteral<"unverified_candidate">]>;
    }>;
    economics: import("@sinclair/typebox").TObject<{
        currency: import("@sinclair/typebox").TString;
        marginal_cost_unit: import("@sinclair/typebox").TNumber;
        compute_latency_ms_p95: import("@sinclair/typebox").TNumber;
        estimated_tokens: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        marginal_carbon_gCO2e: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        licensing_model: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"open_source">, import("@sinclair/typebox").TLiteral<"internal_proprietary">, import("@sinclair/typebox").TLiteral<"commercial_api_metered">, import("@sinclair/typebox").TLiteral<"per_seat_subscription">]>;
    }>;
    jurisdiction_policy: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"EU_ONLY">, import("@sinclair/typebox").TLiteral<"DK_ONLY">, import("@sinclair/typebox").TLiteral<"NO_CN">, import("@sinclair/typebox").TLiteral<"NO_US">, import("@sinclair/typebox").TLiteral<"LOCAL_ONLY">, import("@sinclair/typebox").TLiteral<"NONE">]>;
    data_class: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pii">, import("@sinclair/typebox").TLiteral<"confidential">, import("@sinclair/typebox").TLiteral<"public">, import("@sinclair/typebox").TLiteral<"legal">]>;
    content_digest: import("@sinclair/typebox").TString;
    attestation_authority: import("@sinclair/typebox").TString;
    signature: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    lifecycle: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"candidate">, import("@sinclair/typebox").TLiteral<"canary">, import("@sinclair/typebox").TLiteral<"verified">, import("@sinclair/typebox").TLiteral<"deprecated">, import("@sinclair/typebox").TLiteral<"revoked">]>;
}>;
export type UniversalAssemblyBlock = Static<typeof UniversalAssemblyBlock>;
//# sourceMappingURL=universalAssemblyBlock.d.ts.map