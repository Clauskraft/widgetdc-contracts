"""
widgetdc_contracts.consulting — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/consulting/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from typing import Literal

from pydantic import AwareDatetime, BaseModel, Field, RootModel

__all__ = [
    "DomainHealthProfile",
    "DomainId",
    "GuardianProcessMapping",
    "ProcessStatus",
    "RemediationStrategy",
]


class Health(BaseModel):
    score: float = Field(
        ..., description="Aggregated health score (0-100)", ge=0.0, le=100.0
    )
    trend: Literal["up", "down", "stable"] = Field(
        ..., description="Directional health trend"
    )
    momentum: float = Field(..., description="Rate of change per day")
    resilience: float = Field(..., description="Ability to recover from health dips")
    severity: Literal["CRITICAL", "WARNING", "INFO", "OPTIMAL"] = Field(
        ..., description="CIA 3-tier risk severity classification"
    )
    last_assessment: AwareDatetime = Field(
        ..., description="ISO-8601 timestamp of last analysis"
    )


class DomainHealthProfile(BaseModel):
    domain_id: Literal[
        "strategy_corp",
        "deals_ma",
        "financial_advisory",
        "operations_supply_chain",
        "technology_digital",
        "ai_analytics",
        "cybersecurity",
        "risk_compliance_controls",
        "tax_legal_adjacent",
        "esg_sustainability",
        "customer_marketing_sales",
        "people_organization",
        "pmo_change",
        "industry_solutions",
        "managed_services_operate",
    ] = Field(..., description="Canonical consulting domain identifier")
    health: Health = Field(
        ...,
        description="CIA Health Metrics for consulting domains and intelligence assets",
    )
    intelligence_assets_count: int = Field(
        ..., description="Number of linked intelligence assets"
    )
    risk_rules_triggered: int = Field(..., description="Count of active risk rules")
    updated_at: AwareDatetime


class DomainId(
    RootModel[
        Literal[
            "strategy_corp",
            "deals_ma",
            "financial_advisory",
            "operations_supply_chain",
            "technology_digital",
            "ai_analytics",
            "cybersecurity",
            "risk_compliance_controls",
            "tax_legal_adjacent",
            "esg_sustainability",
            "customer_marketing_sales",
            "people_organization",
            "pmo_change",
            "industry_solutions",
            "managed_services_operate",
        ]
    ]
):
    root: Literal[
        "strategy_corp",
        "deals_ma",
        "financial_advisory",
        "operations_supply_chain",
        "technology_digital",
        "ai_analytics",
        "cybersecurity",
        "risk_compliance_controls",
        "tax_legal_adjacent",
        "esg_sustainability",
        "customer_marketing_sales",
        "people_organization",
        "pmo_change",
        "industry_solutions",
        "managed_services_operate",
    ] = Field(..., description="Canonical consulting domain identifier")


class Remediation(BaseModel):
    strategy: Literal["OPTIMIZED", "COMPLIANT", "SOVEREIGN", "SECURE"]
    vampire_drain_potential: float = Field(..., ge=0.0, le=1.0)
    fabric_insertion_point: str | None = None


class GuardianProcessMapping(BaseModel):
    domain_id: Literal[
        "strategy_corp",
        "deals_ma",
        "financial_advisory",
        "operations_supply_chain",
        "technology_digital",
        "ai_analytics",
        "cybersecurity",
        "risk_compliance_controls",
        "tax_legal_adjacent",
        "esg_sustainability",
        "customer_marketing_sales",
        "people_organization",
        "pmo_change",
        "industry_solutions",
        "managed_services_operate",
    ] = Field(..., description="Canonical consulting domain identifier")
    process_level: Literal["L1_INTENT", "L2_SUBPROCESS", "L3_EXECUTION"]
    current_status: Literal["live", "shell", "new"] = Field(
        ..., description="L1/L2 process maturity status"
    )
    remediation: Remediation | None = None


class ProcessStatus(RootModel[Literal["live", "shell", "new"]]):
    root: Literal["live", "shell", "new"] = Field(
        ..., description="L1/L2 process maturity status"
    )


class RemediationStrategy(BaseModel):
    target_id: str = Field(..., description="The ID of the legacy node in Omni-Graph")
    strategy_path: Literal["OPTIMIZED", "COMPLIANT", "SOVEREIGN", "SECURE"]
    transformation_logic: str = Field(
        ..., description="Generated WidgeTDC contract code to replace legacy"
    )
    sovereignty_score: float | None = Field(None, ge=0.0, le=1.0)
