"""
widgetdc_contracts.graph — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/graph/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, Field
from pydantic import BaseModel, Field
from pydantic import Field, RootModel
from typing import Any
from typing import Literal

__all__ = ["CandidateScoreStats", "CyberIntelligence", "FabricController", "LLMModelStats", "NodeLabel", "RelationshipType", "StrategicLeverage", "StrategyStats"]

class CandidateScoreStats(BaseModel):
    strategy: str = Field(..., description='Strategy the candidate was scored against')
    total_candidates: int = Field(..., ge=0)
    sum_score: float
    sum_evidence_strength: float
    sum_service_fit: float
    sum_policy_fit: float
    sum_prior_success: float
    sum_novelty_bonus: float
    sum_cost_penalty: float
    sum_latency_penalty: float
    sum_contradiction_penalty: float
    avg_score: float
    avg_evidence_strength: float
    avg_service_fit: float
    avg_policy_fit: float
    avg_prior_success: float
    avg_novelty_bonus: float
    avg_cost_penalty: float
    avg_latency_penalty: float
    avg_contradiction_penalty: float
    created_at: AwareDatetime
    updated_at: AwareDatetime

class CyberIntelligence(BaseModel):
    intel_id: str = Field(
        ..., description='Stable identifier for the intelligence node.'
    )
    threat_type: str = Field(
        ...,
        description='Categorization of the threat (e.g. Malware, APT, Phishing, Dork).',
    )
    indicators: list[str] = Field(
        ...,
        description='List of Indicators of Compromise (IoCs) extracted (IPs, Hashes, Domains).',
    )
    stix_alignment: bool | None = Field(
        True,
        description='Alignment status with STIX 2.1 standard (Adoption: CSIS Cyber Defence Feed Pattern).',
    )
    adversary_correlation: dict[str, Any] | None = Field(
        None, description='Mapped MITRE ATT&CK techniques and adversary profiles.'
    )
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    discovered_at: AwareDatetime

class ActiveProbe(BaseModel):
    probe_id: str | None = None
    target_agent: str | None = None
    latency_ms: float | None = None


class FabricController(BaseModel):
    controller_id: str = Field(
        ..., description='Stable identifier for the fabric controller.'
    )
    fabric_type: Literal['software_nvlink', 'cross_repo_bridge', 'external_gateway']
    active_probes: list[ActiveProbe] = Field(
        ...,
        description='List of active health probes monitoring agent-to-agent sties (Adoption: Conscia HTTP Probe Pattern).',
    )
    identity_tag_mapping: dict[str, str] | None = Field(
        None,
        description='Mapping of Scalable Group Tags (SGT) to agent identities (Adoption: Conscia Identity-Based ZTA).',
    )
    health_status: Literal['optimal', 'congested', 'remediating']

class LLMModelStats(BaseModel):
    model: str = Field(..., description='Model identifier (e.g. "gemini-2.0-flash")')
    domain: str = Field(..., description='Routing domain (e.g. "Learning", "Strategy")')
    provider: str | None = Field(None, description='Provider id (set ON CREATE)')
    total_calls: int = Field(..., description='Number of recorded calls', ge=0)
    success_count: int = Field(..., description='Calls with success=true', ge=0)
    total_cost: float = Field(..., description='Sum of cost (USD)')
    total_tokens: int = Field(..., description='Sum of tokens_used', ge=0)
    total_latency_ms: float = Field(..., description='Sum of latency_ms')
    total_quality: float = Field(..., description='Sum of quality_score')
    success_rate: float = Field(
        ..., description='success_count / total_calls', ge=0.0, le=1.0
    )
    avg_cost: float = Field(..., description='total_cost / total_calls (USD/call)')
    avg_tokens: float = Field(..., description='total_tokens / total_calls')
    avg_latency_ms: float = Field(..., description='total_latency_ms / total_calls')
    avg_quality: float = Field(..., description='total_quality / total_calls')
    created_at: AwareDatetime = Field(..., description='ISO datetime; ON CREATE')
    updated_at: AwareDatetime = Field(..., description='ISO datetime; on every flush')

class NodeLabel(
    RootModel[
        Literal[
            'ConsultingDomain',
            'L1ProcessFlow',
            'L2SubProcess',
            'Task',
            'Engagement',
            'Track',
            'Insight',
            'StrategicInsight',
            'Evidence',
            'Claim',
            'KnowledgePack',
            'KnowledgePattern',
            'Knowledge',
            'MCPTool',
            'Tool',
            'CodeImplementation',
            'Agent',
            'AgentProfile',
            'Session',
            'Decision',
            'TDCDocument',
            'SystemSnapshot',
            'LocalFile',
            'Entity',
            'ExpansionSignal',
            'CVE',
            'CyberIntelligence',
            'Directive',
            'Methodology',
            'KPI',
            'AIPattern',
            'Memory',
            'LegalAct',
            'LegalConstraint',
            'LegalUpdate',
            'DanishAuthority',
            'AnnualReport',
            'FinancialStatement',
            'Artifact',
            'TaskPlan',
            'PlanStep',
            'UserPreference',
            'EventStreamEntry',
            'CodeProject',
            'PersonaConfig',
            'ModelCapability',
            'AgentBlueprint',
            'SearchDork',
            'SecretPattern',
            'InvestigationCase',
            'GuardrailRule',
            'DataClassification',
            'ResearchTask',
            'ScopedKnowledge',
            'DataSourceConfig',
            'ProjectTemplate',
            'ScavengerProbe',
            'AdoptedIP',
            'CompetitorShadow',
            'GoldenEgg',
            'FabricController',
            'ExitPath',
            'ComplianceGap',
            'StrategicLeverage',
            'AuditProof',
            'CriticalFunction',
            'ResilienceMetric',
            'GridFunction',
            'AnomalyPheromone',
            'NormalizerConfig',
            'CompoundingStrategy',
            'RefinementObservation',
            'InteractiveWidget',
            'RLMTool',
            'LLMModelStats',
            'StrategyStats',
            'CandidateScoreStats',
        ]
    ]
):
    root: Literal[
        'ConsultingDomain',
        'L1ProcessFlow',
        'L2SubProcess',
        'Task',
        'Engagement',
        'Track',
        'Insight',
        'StrategicInsight',
        'Evidence',
        'Claim',
        'KnowledgePack',
        'KnowledgePattern',
        'Knowledge',
        'MCPTool',
        'Tool',
        'CodeImplementation',
        'Agent',
        'AgentProfile',
        'Session',
        'Decision',
        'TDCDocument',
        'SystemSnapshot',
        'LocalFile',
        'Entity',
        'ExpansionSignal',
        'CVE',
        'CyberIntelligence',
        'Directive',
        'Methodology',
        'KPI',
        'AIPattern',
        'Memory',
        'LegalAct',
        'LegalConstraint',
        'LegalUpdate',
        'DanishAuthority',
        'AnnualReport',
        'FinancialStatement',
        'Artifact',
        'TaskPlan',
        'PlanStep',
        'UserPreference',
        'EventStreamEntry',
        'CodeProject',
        'PersonaConfig',
        'ModelCapability',
        'AgentBlueprint',
        'SearchDork',
        'SecretPattern',
        'InvestigationCase',
        'GuardrailRule',
        'DataClassification',
        'ResearchTask',
        'ScopedKnowledge',
        'DataSourceConfig',
        'ProjectTemplate',
        'ScavengerProbe',
        'AdoptedIP',
        'CompetitorShadow',
        'GoldenEgg',
        'FabricController',
        'ExitPath',
        'ComplianceGap',
        'StrategicLeverage',
        'AuditProof',
        'CriticalFunction',
        'ResilienceMetric',
        'GridFunction',
        'AnomalyPheromone',
        'NormalizerConfig',
        'CompoundingStrategy',
        'RefinementObservation',
        'InteractiveWidget',
        'RLMTool',
        'LLMModelStats',
        'StrategyStats',
        'CandidateScoreStats',
    ] = Field(..., description='Canonical Neo4j node labels')

class RelationshipType(
    RootModel[
        Literal[
            'BELONGS_TO_DOMAIN',
            'HAS_SUBPROCESS',
            'HAS_TASK',
            'PARENT_PROCESS',
            'BELONGS_TO_ENGAGEMENT',
            'BELONGS_TO_TRACK',
            'PROVIDES_INSIGHT',
            'HAS_STRATEGIC_INSIGHT',
            'USES_PROCESS',
            'HAS_TRACK',
            'ASSIGNED_TO',
            'IMPLEMENTS',
            'USES_METHODOLOGY',
            'MEASURES',
            'EVALUATES',
            'HAS_CRITERION',
            'HAS_CAPABILITY',
            'USES_TOOL',
            'USES_FRAMEWORK',
            'CODE_FOR',
            'CONTAINS_PATTERN',
            'SUPPORTED_BY',
            'CITES',
            'IN_DOMAIN',
            'RELATES_TO',
            'IS_A',
            'PROVES',
            'CLAIM_OF',
            'IN_KNOWLEDGE_PACK',
            'FOLLOWS_PATTERN',
            'RELATED_TO',
            'RUNS',
            'RUNS_IN',
            'ACTS_AS',
            'MADE_DECISION',
            'PRODUCED_DECISION',
            'HAS_CONTENT',
            'CITED_IN',
            'SNAPSHOT_OF',
            'REFERENCES',
            'TRIGGERS',
            'VULNERABILITY_OF',
            'HAS_CVE',
            'INSTRUCTED_BY',
            'CONTAINS',
            'MEMBER_OF',
            'CONTROLS',
            'SIMILAR_TO',
            'DUPLICATE_OF',
            'HAS_EXPANSION_SIGNAL',
            'DETECTED_AT',
            'GOVERNED_BY',
            'CONSTRAINS',
            'AMENDS',
            'PUBLISHED_BY',
            'VETOED_BY',
            'REPORTS',
            'EXTRACTED_FROM',
            'PRODUCED_BY',
            'DELIVERED_IN',
            'CONTAINS_STEP',
            'STEP_DEPENDS_ON',
            'PREFERENCE_OF',
            'EMITTED_BY',
            'OCCURRED_IN',
            'PROJECT_CONTAINS',
            'CONFIGURES',
            'TEMPLATE_FOR',
            'TARGETS',
            'DISCOVERED_BY',
            'CASE_CONTAINS',
            'DETECTS_IN',
            'GUARDS',
            'CLASSIFIED_AS',
            'SCOPED_TO',
            'CAPABILITY_OF',
            'FLOWS_TO',
            'REPRESENTS_VALUE',
            'ADOPTED_FROM',
            'STRATEGIC_VALUE',
            'INTERCEPTS',
            'DRAINS',
            'EXIT_PATH_FOR',
            'REMEDIATES',
            'LEVERAGES',
            'SUPPORTS_CIF',
            'DEPENDS_ON_CTPP',
            'VERIFIES_RESILIENCE',
            'MONITORS_GRID',
            'BRIDGES_OT_IT',
            'REPORTED_AS_NIS2',
            'PROVIDES_FREEDOM_FROM',
            'MAPS_LEGACY_DEBT',
            'GOVERNS_CITIZEN_DATA',
            'NORMALIZED_FROM',
            'PART_OF_HYPERGRAPH',
            'DEVIATES_FROM_BASELINE',
            'RECURSIVELY_REFINES',
            'COMPOUNDS_INTO',
            'HOSTS_WIDGET',
        ]
    ]
):
    root: Literal[
        'BELONGS_TO_DOMAIN',
        'HAS_SUBPROCESS',
        'HAS_TASK',
        'PARENT_PROCESS',
        'BELONGS_TO_ENGAGEMENT',
        'BELONGS_TO_TRACK',
        'PROVIDES_INSIGHT',
        'HAS_STRATEGIC_INSIGHT',
        'USES_PROCESS',
        'HAS_TRACK',
        'ASSIGNED_TO',
        'IMPLEMENTS',
        'USES_METHODOLOGY',
        'MEASURES',
        'EVALUATES',
        'HAS_CRITERION',
        'HAS_CAPABILITY',
        'USES_TOOL',
        'USES_FRAMEWORK',
        'CODE_FOR',
        'CONTAINS_PATTERN',
        'SUPPORTED_BY',
        'CITES',
        'IN_DOMAIN',
        'RELATES_TO',
        'IS_A',
        'PROVES',
        'CLAIM_OF',
        'IN_KNOWLEDGE_PACK',
        'FOLLOWS_PATTERN',
        'RELATED_TO',
        'RUNS',
        'RUNS_IN',
        'ACTS_AS',
        'MADE_DECISION',
        'PRODUCED_DECISION',
        'HAS_CONTENT',
        'CITED_IN',
        'SNAPSHOT_OF',
        'REFERENCES',
        'TRIGGERS',
        'VULNERABILITY_OF',
        'HAS_CVE',
        'INSTRUCTED_BY',
        'CONTAINS',
        'MEMBER_OF',
        'CONTROLS',
        'SIMILAR_TO',
        'DUPLICATE_OF',
        'HAS_EXPANSION_SIGNAL',
        'DETECTED_AT',
        'GOVERNED_BY',
        'CONSTRAINS',
        'AMENDS',
        'PUBLISHED_BY',
        'VETOED_BY',
        'REPORTS',
        'EXTRACTED_FROM',
        'PRODUCED_BY',
        'DELIVERED_IN',
        'CONTAINS_STEP',
        'STEP_DEPENDS_ON',
        'PREFERENCE_OF',
        'EMITTED_BY',
        'OCCURRED_IN',
        'PROJECT_CONTAINS',
        'CONFIGURES',
        'TEMPLATE_FOR',
        'TARGETS',
        'DISCOVERED_BY',
        'CASE_CONTAINS',
        'DETECTS_IN',
        'GUARDS',
        'CLASSIFIED_AS',
        'SCOPED_TO',
        'CAPABILITY_OF',
        'FLOWS_TO',
        'REPRESENTS_VALUE',
        'ADOPTED_FROM',
        'STRATEGIC_VALUE',
        'INTERCEPTS',
        'DRAINS',
        'EXIT_PATH_FOR',
        'REMEDIATES',
        'LEVERAGES',
        'SUPPORTS_CIF',
        'DEPENDS_ON_CTPP',
        'VERIFIES_RESILIENCE',
        'MONITORS_GRID',
        'BRIDGES_OT_IT',
        'REPORTED_AS_NIS2',
        'PROVIDES_FREEDOM_FROM',
        'MAPS_LEGACY_DEBT',
        'GOVERNS_CITIZEN_DATA',
        'NORMALIZED_FROM',
        'PART_OF_HYPERGRAPH',
        'DEVIATES_FROM_BASELINE',
        'RECURSIVELY_REFINES',
        'COMPOUNDS_INTO',
        'HOSTS_WIDGET',
    ] = Field(..., description='Canonical Neo4j relationship types')

class StrategicLeverage(BaseModel):
    leverage_id: str = Field(
        ..., description='Stable identifier for the leverage node.'
    )
    target_id: str = Field(
        ...,
        description='Reference to the Target (CompetitorShadow or ComplianceGap) being leveraged.',
    )
    leverage_type: Literal[
        'compliance_gap', 'architectural_lockin', 'operational_inefficiency'
    ]
    financial_impact_score: float = Field(
        ...,
        description='Quantified risk in financial terms (Adoption: Dubex FAIR Risk Framework). Used for board-level negotiation.',
    )
    remediation_contract_ref: str | None = Field(
        None,
        description='Reference to the WidgeTDC contract that resolves the leverage point.',
    )
    calculated_at: AwareDatetime

class StrategyStats(BaseModel):
    strategy: str = Field(
        ...,
        description='Selected reasoning strategy (e.g. "evidence_bounded_reasoning")',
    )
    complexity: str = Field(
        ..., description='Complexity bucket the step ran at (e.g. "medium")'
    )
    total_steps: int = Field(
        ..., description='Number of steps observed at this (strategy, complexity)', ge=0
    )
    retrieval_count: int = Field(..., ge=0)
    folding_count: int = Field(..., ge=0)
    swarm_count: int = Field(..., ge=0)
    retrieval_rate: float = Field(
        ..., description='retrieval_count / total_steps', ge=0.0, le=1.0
    )
    folding_rate: float = Field(..., ge=0.0, le=1.0)
    swarm_rate: float = Field(..., ge=0.0, le=1.0)
    created_at: AwareDatetime
    updated_at: AwareDatetime
