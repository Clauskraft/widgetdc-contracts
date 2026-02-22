"""
widgetdc_contracts.consulting — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/consulting/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import Field, RootModel
from typing import Literal

__all__ = ["DomainId", "ProcessStatus"]

class DomainId(
    RootModel[
        Literal[
            'strategy_corp',
            'deals_ma',
            'financial_advisory',
            'operations_supply_chain',
            'technology_digital',
            'ai_analytics',
            'cybersecurity',
            'risk_compliance_controls',
            'tax_legal_adjacent',
            'esg_sustainability',
            'customer_marketing_sales',
            'people_organization',
            'pmo_change',
            'industry_solutions',
            'managed_services_operate',
        ]
    ]
):
    root: Literal[
        'strategy_corp',
        'deals_ma',
        'financial_advisory',
        'operations_supply_chain',
        'technology_digital',
        'ai_analytics',
        'cybersecurity',
        'risk_compliance_controls',
        'tax_legal_adjacent',
        'esg_sustainability',
        'customer_marketing_sales',
        'people_organization',
        'pmo_change',
        'industry_solutions',
        'managed_services_operate',
    ] = Field(..., description='Canonical consulting domain identifier')

class ProcessStatus(RootModel[Literal['live', 'shell', 'new']]):
    root: Literal['live', 'shell', 'new'] = Field(
        ..., description='L1/L2 process maturity status'
    )

