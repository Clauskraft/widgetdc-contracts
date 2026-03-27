import { describe, it, expect } from 'vitest'
import '../src/formats.js' // register uuid + date-time format validators
import { Value } from '@sinclair/typebox/value'
import {
  CognitiveRequest,
  CognitiveResponse,
  IntelligenceEvent,
  HealthPulse,
  HealthStatus,
  DomainProfile,
  ApiError,
  ApiResponse,
  PaginatedResponse,
  DomainId,
  ProcessStatus,
  AgentTier,
  AgentPersona,
  SignalType,
  AgentMessageType,
  AgentTrustProfile,
  ScorecardEntry,
  TelemetryEntry,
  LauncherRequest,
  LauncherResponse,
  OodaRuntimeRequest,
  ReasonRuntimeRequest,
  ReasonRuntimeResponse,
  BackendGovernanceEvidencePacketResponseV1,
  ArtifactChallengeEnvelopeV1,
  ArtifactRequestReviewEnvelopeV1,
  NodeLabel,
  RelationshipType,
  DOMAIN_SHORT_IDS,
} from '../src/index.js'

describe('cognitive/', () => {
  it('CognitiveRequest validates a minimal request', () => {
    const req = {
      task: 'Analyze market positioning',
      context: { domain: 'strategy_corp' },
    }
    expect(Value.Check(CognitiveRequest, req)).toBe(true)
  })

  it('CognitiveRequest validates a full request', () => {
    const req = {
      task: 'Deep analysis of M&A target',
      context: { client_id: 'ENG-LF-C1A-1773766946059' },
      reasoning_mode: 'deep',
      trace_id: '550e8400-e29b-41d4-a716-446655440000',
      source_service: 'backend',
      domain_hint: 'deals_ma',
      constraints: {
        max_tokens: 8000,
        timeout_ms: 30000,
        fold_context: true,
        preferred_provider: 'deepseek',
      },
      recursion_depth: 2,
    }
    expect(Value.Check(CognitiveRequest, req)).toBe(true)
  })

  it('CognitiveRequest rejects empty task', () => {
    const req = { task: '', context: {} }
    expect(Value.Check(CognitiveRequest, req)).toBe(false)
  })

  it('CognitiveResponse validates a full response', () => {
    const res = {
      recommendation: 'Proceed with acquisition',
      reasoning: 'Based on market analysis...',
      confidence: 0.87,
      reasoning_chain: ['Step 1: Market scan', 'Step 2: Valuation'],
      trace: { trace_id: 'ENG-LF-C1A-1773766946059', total_spans: 5, total_duration_ms: 1200 },
      quality: { overall_score: 0.9, parsability: 0.95, relevance: 0.88, completeness: 0.85 },
      routing: { provider: 'deepseek', model: 'deepseek-chat', domain: 'deals_ma', latency_ms: 800, cost: 0.002 },
    }
    expect(Value.Check(CognitiveResponse, res)).toBe(true)
  })

  it('CognitiveResponse allows null recommendation', () => {
    const res = {
      recommendation: null,
      reasoning: 'Insufficient data',
      confidence: 0.1,
    }
    expect(Value.Check(CognitiveResponse, res)).toBe(true)
  })

  it('IntelligenceEvent validates', () => {
    const evt = {
      type: 'routing_decision',
      payload: { model: 'deepseek-chat', reason: 'cost optimization' },
      trace_id: 'ENG-LF-C1A-1773766946059',
      source: 'rlm-engine',
      timestamp: '2026-02-22T10:00:00Z',
    }
    expect(Value.Check(IntelligenceEvent, evt)).toBe(true)
  })
})

describe('health/', () => {
  it('HealthPulse validates a full pulse', () => {
    const pulse = {
      service: 'backend',
      status: 'healthy',
      uptime_seconds: 3600,
      last_request_ms: 45,
      active_sessions: 12,
      modules: { neo4j: 'active', redis: 'active', rlm: 'degraded' },
      resources: { memory_mb: 512, cpu_percent: 35.2, neo4j_connected: true, redis_connected: true, postgres_connected: true },
      last_error: null,
      version: '7.0.0',
      timestamp: '2026-02-22T10:00:00Z',
    }
    expect(Value.Check(HealthPulse, pulse)).toBe(true)
  })

  it('HealthPulse validates minimal pulse', () => {
    const pulse = {
      service: 'rlm-engine',
      status: 'starting',
      uptime_seconds: 0,
      timestamp: '2026-02-22T10:00:00Z',
    }
    expect(Value.Check(HealthPulse, pulse)).toBe(true)
  })

  it('HealthStatus validates', () => {
    const status = {
      service: 'rlm-engine',
      status: 'healthy',
      uptime_seconds: 7200,
      version: '6.0.0',
      components: {
        neo4j: { status: 'connected', latency_ms: 12 },
        cognitive: { status: 'active' },
      },
      meta_learning: { domains_tracked: 15, total_llm_calls: 5000, avg_quality: 0.82 },
    }
    expect(Value.Check(HealthStatus, status)).toBe(true)
  })

  it('DomainProfile validates', () => {
    const profile = {
      name: 'Strategy & Corporate',
      competencies: ['Market Analysis', 'Growth Strategy'],
      frameworks: ['Porter Five Forces', 'BCG Matrix'],
      kpis: ['Revenue Growth', 'Market Share'],
      agent_count: 5,
      strength: 'strong',
    }
    expect(Value.Check(DomainProfile, profile)).toBe(true)
  })
})

describe('http/', () => {
  it('ApiError validates', () => {
    const err = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      status_code: 422,
      details: { field: 'task', issue: 'required' },
      correlation_id: 'ENG-LF-C1A-1773766946059',
    }
    expect(Value.Check(ApiError, err)).toBe(true)
  })

  it('ApiResponse validates success', () => {
    const res = {
      success: true,
      data: { id: 'lev_viking_dominance_001', name: 'Viking_Compliance_Remediation' },
      metadata: { timestamp: '2026-02-22T10:00:00Z', duration_ms: 45 },
    }
    expect(Value.Check(ApiResponse, res)).toBe(true)
  })

  it('ApiResponse validates error', () => {
    const res = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Resource not found', status_code: 404 },
    }
    expect(Value.Check(ApiResponse, res)).toBe(true)
  })

  it('PaginatedResponse validates', () => {
    const res = {
      items: [{ id: 'lev_viking_dominance_001' }, { id: 'lev_viking_dominance_002' }],
      total: 50,
      page: 1,
      page_size: 20,
      has_more: true,
    }
    expect(Value.Check(PaginatedResponse, res)).toBe(true)
  })
})

describe('consulting/', () => {
  it('DomainId validates all 15 domains', () => {
    const domains: string[] = [
      'strategy_corp', 'deals_ma', 'financial_advisory', 'operations_supply_chain',
      'technology_digital', 'ai_analytics', 'cybersecurity', 'risk_compliance_controls',
      'tax_legal_adjacent', 'esg_sustainability', 'customer_marketing_sales',
      'people_organization', 'pmo_change', 'industry_solutions', 'managed_services_operate',
    ]
    for (const d of domains) {
      expect(Value.Check(DomainId, d)).toBe(true)
    }
    expect(Value.Check(DomainId, 'invalid_domain')).toBe(false)
  })

  it('ProcessStatus validates', () => {
    expect(Value.Check(ProcessStatus, 'live')).toBe(true)
    expect(Value.Check(ProcessStatus, 'shell')).toBe(true)
    expect(Value.Check(ProcessStatus, 'new')).toBe(true)
    expect(Value.Check(ProcessStatus, 'deprecated')).toBe(false)
  })

  it('DOMAIN_SHORT_IDS has all 15 entries', () => {
    expect(Object.keys(DOMAIN_SHORT_IDS)).toHaveLength(15)
    expect(DOMAIN_SHORT_IDS.strategy_corp).toBe('STR')
    expect(DOMAIN_SHORT_IDS.cybersecurity).toBe('CYB')
  })
})

describe('agent/', () => {
  it('AgentTier validates all 5 tiers', () => {
    const tiers = ['ANALYST', 'ASSOCIATE', 'MANAGER', 'PARTNER', 'ARCHITECT']
    for (const t of tiers) {
      expect(Value.Check(AgentTier, t)).toBe(true)
    }
    expect(Value.Check(AgentTier, 'INTERN')).toBe(false)
  })

  it('AgentPersona validates all 10 personas', () => {
    const personas = [
      'RESEARCHER', 'ENGINEER', 'CUSTODIAN', 'ARCHITECT', 'SENTINEL',
      'ARCHIVIST', 'HARVESTER', 'ANALYST', 'INTEGRATOR', 'TESTER',
    ]
    for (const p of personas) {
      expect(Value.Check(AgentPersona, p)).toBe(true)
    }
  })

  it('SignalType validates all 9 types', () => {
    const signals = [
      'task_started', 'task_completed', 'task_failed', 'escalation',
      'quality_gate', 'tool_executed', 'deliverable_generated', 'insight', 'warning',
    ]
    for (const s of signals) {
      expect(Value.Check(SignalType, s)).toBe(true)
    }
  })
})

describe('graph/', () => {
  it('NodeLabel validates core labels', () => {
    const labels = ['ConsultingDomain', 'L1ProcessFlow', 'MCPTool', 'Insight', 'Agent', 'CVE']
    for (const l of labels) {
      expect(Value.Check(NodeLabel, l)).toBe(true)
    }
    expect(Value.Check(NodeLabel, 'NonExistentLabel')).toBe(false)
  })

  it('RelationshipType validates core types', () => {
    const rels = ['BELONGS_TO_DOMAIN', 'HAS_SUBPROCESS', 'HAS_CAPABILITY', 'SUPPORTED_BY']
    for (const r of rels) {
      expect(Value.Check(RelationshipType, r)).toBe(true)
    }
    expect(Value.Check(RelationshipType, 'INVALID_REL')).toBe(false)
  })

  it('NodeLabel validates RSI graph labels', () => {
    const labels = ['CompoundingStrategy', 'RefinementObservation', 'InteractiveWidget']
    for (const label of labels) {
      expect(Value.Check(NodeLabel, label)).toBe(true)
    }
  })

  it('RelationshipType validates RSI graph relationships', () => {
    const rels = ['RECURSIVELY_REFINES', 'COMPOUNDS_INTO', 'HOSTS_WIDGET']
    for (const rel of rels) {
      expect(Value.Check(RelationshipType, rel)).toBe(true)
    }
  })
})

describe('orchestrator launcher contracts/', () => {
  it('LauncherRequest validates a minimal info request', () => {
    const req = {
      input: 'Forklar governance status',
      intent: 'info',
    }
    expect(Value.Check(LauncherRequest, req)).toBe(true)
  })

  it('LauncherRequest accepts compatibility instruction aliasing', () => {
    const req = {
      input: 'Kør en orkestreret task',
      intent: 'orchestrate',
      instruction: 'Returner faseplan',
      instructions: 'Returner faseplan',
    }
    expect(Value.Check(LauncherRequest, req)).toBe(true)
  })

  it('LauncherResponse validates shared response core without surface-local fields', () => {
    const res = {
      request: {
        input: 'Lav en analyse',
        intent: 'analyze',
      },
      plan: {
        intent: 'analyze',
        mode: 'single',
        lineageId: 'lineage_20260327120000',
        status: 'planned',
        source: 'widgetdc-launcher-prototype',
        executionPath: 'backend:/api/mcp/route -> rlm:/reason',
        handoffPayload: {
          intent: 'analyze',
          prompt: 'Lav en analyse',
          executionPath: 'backend:/api/mcp/route -> rlm:/reason',
        },
      },
      execution: {
        source: '/reason',
        summary: 'Vurdering: Contracted recommendation',
        trace: ['retrieve', 'reason'],
        metadata: {
          evidenceDomain: 'widgetdc-launcher',
          reasonDomain: 'Strategy',
          degradedReasoning: false,
          canonicalGovernance: {
            arbitrationBacklog: {
              status: 'green',
            },
          },
        },
        governance: {
          promotionStatus: 'not_promoted',
          looseEnd: null,
          gates: [
            { gate: 'quality_check', status: 'pass', reasonCode: 'summary_present' },
          ],
          targetKind: 'LooseEnd',
          boundaryOwner: 'WidgeTDC',
          routePolicy: {
            foldingRequired: true,
            retrievalRequired: true,
            governanceRequired: true,
            graphVerificationRequired: false,
            renderValidationRequired: false,
          },
          promotionPolicy: {
            qualityGate: true,
            policyAlignment: true,
            graphWriteVerification: true,
            readBackVerification: true,
            looseEndGenerationOnFailureOrBlock: true,
          },
          disclaimer: 'These are launcher-local governance checks. They are not canonical LegoFactory decisions and must not be treated as promotion authority.',
        },
      },
    }
    expect(Value.Check(LauncherResponse, res)).toBe(true)
  })

  it('OodaRuntimeRequest validates transitional dual instruction fields', () => {
    const req = {
      task: 'Kør en orkestreret task',
      task_id: 'launcher-ooda-123',
      instruction: 'Returner en faseplan',
      instructions: 'Returner en faseplan',
      context: {
        graph_summary: 'Folded graph summary',
        source_surface: 'widgetdc-launcher-prototype',
        grounding_directive: 'Use only relevant evidence',
        evidence_domain: 'widgetdc-launcher',
        reason_domain: 'Strategy',
      },
    }
    expect(Value.Check(OodaRuntimeRequest, req)).toBe(true)
  })

  it('ReasonRuntimeRequest validates current launcher-compatible context fields', () => {
    const req = {
      task: 'Lav en analyse af kontraktshape',
      domain: 'Strategy',
      context: {
        response_contract: {
          jobStatement: 'Lever en vurdering med tydelig verificering og næste trin.',
          successShape: 'Vurdering, hvad der bør verificeres, og næste trin.',
          requiredSections: ['Vurdering', 'Hvad bør verificeres', 'Næste trin'],
          boundaryRules: ['Ingen falsk sikkerhed'],
          fallbackPolicy: 'Ved degradering skal begrænsning og næste trin siges eksplicit.',
        },
        evidence_domain: 'widgetdc-launcher',
        reason_domain: 'Strategy',
        enriched_prompt: 'Use grounded evidence only.',
        _quality_task: 'Lav en analyse af kontraktshape',
        _skip_knowledge_enrichment: false,
        _output_mode: 'analyze',
        _expected_format: 'structured',
      },
    }
    expect(Value.Check(ReasonRuntimeRequest, req)).toBe(true)
  })

  it('ReasonRuntimeResponse validates launcher-consumed reason output', () => {
    const res = {
      recommendation: 'Contracted recommendation',
      confidence: 0.82,
      routing: {
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        latency_ms: 1234,
      },
      telemetry: {
        used_swarm: false,
        used_rag: true,
      },
      reasoning_chain: ['retrieve', 'reason'],
    }
    expect(Value.Check(ReasonRuntimeResponse, res)).toBe(true)
  })
})

describe('orchestrator artifact contracts/', () => {
  it('BackendGovernanceEvidencePacketResponseV1 validates shared evidence packet response', () => {
    const res = {
      packet_id: 'packet-evidence-contract',
      tri_source_ready: true,
      governance: {
        blocking_reasons: [],
        promotion_status: 'not_promoted',
        can_promote: false,
      },
      families: [
        {
          family: 'research',
          status: 'grounded',
          summary: 'Research evidence is grounded and ready for launcher consumption.',
          evidence_items: [
            {
              id: 'ev-1',
              summary: 'Primary evidence summary',
              score: 0.91,
              title: 'Research packet',
              source_type: 'brief',
            },
          ],
        },
      ],
      question: 'What is the current governance posture?',
      domain: 'widgetdc-launcher',
      created_at: '2026-03-27T10:00:00Z',
      evidence_refs: ['graph://evidence/ev-1'],
    }
    expect(Value.Check(BackendGovernanceEvidencePacketResponseV1, res)).toBe(true)
  })

  it('ArtifactChallengeEnvelopeV1 validates shared challenge envelope', () => {
    const envelope = {
      tool: 'artifacts.challenge',
      artifact_id: 'artifact-contract-001',
      artifact_slug: 'artifact-contract',
      outcome: {
        trace_id: 'trace-1',
        status: 'CHALLENGED',
        reason: 'Lineage mismatch detected',
        evidence_uri: null,
      },
      graph_write: {
        outcome_label: 'Outcome',
        relation_type: 'CHALLENGES',
        target_identity: 'artifact-contract-001',
      },
    }
    expect(Value.Check(ArtifactChallengeEnvelopeV1, envelope)).toBe(true)
  })

  it('ArtifactRequestReviewEnvelopeV1 validates shared request-review envelope', () => {
    const envelope = {
      tool: 'artifacts.action',
      action: 'request-review',
      artifact_id: 'artifact-contract-001',
      graph_write: {
        type: 'ConstructionRequest',
        request_kind: 'REVIEW',
        requested_by: 'launcher-user',
        artifact_id: 'artifact-contract-001',
      },
    }
    expect(Value.Check(ArtifactRequestReviewEnvelopeV1, envelope)).toBe(true)
  })
})

describe('orchestrator/', () => {
  it('AgentMessageType supports arbitration and divergence', () => {
    expect(Value.Check(AgentMessageType, 'Arbitration')).toBe(true)
    expect(Value.Check(AgentMessageType, 'Divergence')).toBe(true)
  })

  it('AgentTrustProfile anchors trust on persona instead of provider identity', () => {
    const profile = {
      agent_persona: 'ARCHITECT',
      runtime_identity: 'masterarchitectwidgetdc',
      provider_source: 'gemini',
      task_domain: 'routing',
      success_count: 12,
      fail_count: 1,
      bayesian_score: 0.92,
      prior_weight: 5,
      default_prior_score: 0.7,
      evidence_source: 'decision_quality_scorecard',
      scorecard_dimension: 'arbitration_confidence',
      scope_owner: 'widgetdc-orchestrator',
      last_verified_at: '2026-03-18T10:00:00Z',
    }
    expect(Value.Check(AgentTrustProfile, profile)).toBe(true)
  })

  it('TelemetryEntry validates normalized runtime telemetry', () => {
    const entry = {
      timestamp: '2026-03-18T10:00:00Z',
      scope_owner: 'widgetdc-orchestrator',
      agent_persona: 'ENGINEER',
      runtime_identity: 'legofactory-worker-1',
      provider_source: 'gemini',
      task_domain: 'decomposition',
      capability: 'diamond-develop',
      phase: 'develop',
      outcome: 'success',
      duration_ms: 2450,
      evidence_source: 'monitoring_audit_log',
      trace_id: 'trace-123',
      metadata: {
        routed: true,
        retries: 1,
      },
    }
    expect(Value.Check(TelemetryEntry, entry)).toBe(true)
  })

  it('ScorecardEntry validates normalization and arbitration metrics', () => {
    const entry = {
      entry_id: 'scorecard-1',
      recorded_at: '2026-03-18T10:00:00Z',
      task_domain: 'routing',
      scope_owner: 'widgetdc-orchestrator',
      dimension: 'normalization_quality',
      metric_name: 'Normalization Quality',
      metric_value: 0.98,
      target_value: 1,
      status: 'pass',
      confidence: 0.91,
      sample_size: 24,
      evidence_refs: ['LIN-261', 'runtime://scorecard/2026-03-18'],
      trust_profile: {
        agent_persona: 'ARCHITECT',
        runtime_identity: 'masterarchitectwidgetdc',
        provider_source: 'gemini',
        task_domain: 'routing',
        success_count: 12,
        fail_count: 1,
        bayesian_score: 0.92,
        prior_weight: 5,
        default_prior_score: 0.7,
        evidence_source: 'decision_quality_scorecard',
        scorecard_dimension: 'arbitration_confidence',
        scope_owner: 'widgetdc-orchestrator',
        last_verified_at: '2026-03-18T10:00:00Z',
      },
      notes: 'Canonical runtime enforcement path is now schema-backed.',
    }
    expect(Value.Check(ScorecardEntry, entry)).toBe(true)
  })
})
