"""
widgetdc_contracts.graph — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/graph/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import Field, RootModel
from typing import Literal

__all__ = ["NodeLabel", "RelationshipType"]

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
    ] = Field(..., description='Canonical Neo4j node labels')

class RelationshipType(
    RootModel[
        Literal[
            'BELONGS_TO_DOMAIN',
            'HAS_SUBPROCESS',
            'HAS_TASK',
            'PARENT_PROCESS',
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
            'RUNS',
            'MADE_DECISION',
            'HAS_CONTENT',
            'SIMILAR_TO',
            'DUPLICATE_OF',
            'HAS_EXPANSION_SIGNAL',
            'DETECTED_AT',
        ]
    ]
):
    root: Literal[
        'BELONGS_TO_DOMAIN',
        'HAS_SUBPROCESS',
        'HAS_TASK',
        'PARENT_PROCESS',
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
        'RUNS',
        'MADE_DECISION',
        'HAS_CONTENT',
        'SIMILAR_TO',
        'DUPLICATE_OF',
        'HAS_EXPANSION_SIGNAL',
        'DETECTED_AT',
    ] = Field(..., description='Canonical Neo4j relationship types')

