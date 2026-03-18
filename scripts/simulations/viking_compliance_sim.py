
import sys
from pathlib import Path
from datetime import datetime, timezone
import json

# Ensure we can import our models
sys.path.insert(0, str(Path.cwd() / "python"))

from widgetdc_contracts.graph import NodeLabel, RelationshipType
from widgetdc_contracts.viking import StrategicLeverage, FabricController
from widgetdc_contracts.orchestrator import RoutingDecision, Intent

def run_viking_compliance_simulation():
    print("--- WidgeTDC Leverage Simulation: Viking Compliance ---")
    now = datetime.now(timezone.utc)
    
    # 1. Define the Leverage Point (NIS2 Operational Gap)
    target_shadow_id = "comp_danish_energy_grid_legacy"
    gap_id = "gap_nis2_incident_response_manual_bottleneck"
    
    # 2. Calculate Strategic Leverage (Personal Board Liability)
    # We quantify the fine risk (up to 2% of global turnover) and the board's legal exposure
    leverage = StrategicLeverage(
        leverage_id="lev_viking_dominance_001",
        target_id=target_shadow_id,
        leverage_type="compliance_gap",
        financial_impact_score=85000000.0, # $85M potential fine surface for a large energy entity
        remediation_contract_ref="contract_autonomous_auditor_v1",
        calculated_at=now
    )
    
    print(f"[Vampire] Strategic Leverage Calculated: {leverage.leverage_id}")
    print(f"[Vampire] Board Liability Surface Identified: ${leverage.financial_impact_score:,.2f}")
    
    # 3. Create the AuditProof Fabric (The Remediation Path)
    # This represents WidgeTDC's agents automating the compliance graph
    fabric = FabricController(
        controller_id="wdc_viking_audit_fabric",
        fabric_type="software_nvlink",
        active_probes=[
            {"probe_id": "p1", "target_agent": "SNOUT_EXTRACTOR", "latency_ms": 15.5},
            {"probe_id": "p2", "target_agent": "AUTONOMOUS_AUDITOR", "latency_ms": 10.1}
        ],
        identity_tag_mapping={
            "SGT_MANUAL_COMPLIANCE": "LEGACY_RISK",
            "SGT_WIDGETDC_AUDIT": "VERIFIED_PROOF"
        },
        health_status="optimal"
    )
    
    print(f"[Fabric] Audit Fabric Initialized: {fabric.controller_id}")
    print(f"[Fabric] Status: {fabric.health_status} (Ready for Automated Certification)")
    
    # 4. Generate the Routing Decision to INTERCEPT
    decision = RoutingDecision(
        decision_id="dec_viking_intercept_001",
        intent=Intent(
            intent_id="int_nordic_market_capture",
            capability="verified_recommendation",
            task_domain="audit",
            flow_ref="core-flow-3",
            route_scope=["snout", "widgetdc-orchestrator"],
            operator_visible=True,
            scorecard_dimensions=["operator_acceptance"]
        ),
        selected_agent_id="ORCHESTRATOR_MASTER",
        selected_capability="verified_recommendation",
        trust_score=0.99,
        reason_code="FABRIC_WIN",
        fabric_route_id=fabric.controller_id,
        vampire_drain_rate=0.95, # We are replacing 95% of manual consultancy processes
        target_shadow_id=target_shadow_id,
        evidence_refs=[leverage.leverage_id, gap_id],
        decided_at=now
    )
    
    print(f"[Orchestrator] Viking Interception Decision Made: {decision.reason_code}")
    print(f"[Orchestrator] Consultancy Displacement Rate: {decision.vampire_drain_rate * 100}%")
    
    # Output the result as a "Viking Leverage Map"
    viking_map = {
        "status": "DANISH_COMPLIANCE_MARKET_INTERCEPTED",
        "leverage": leverage.model_dump(),
        "fabric": fabric.model_dump(),
        "decision": decision.model_dump()
    }
    
    with open("arch/simulations/viking_leverage_map.json", "w") as f:
        json.dump(viking_map, f, indent=2, default=str)
    
    print(f"--- Simulation Complete. Viking Map exported to arch/simulations/viking_leverage_map.json ---")

if __name__ == "__main__":
    # Ensure directory exists
    Path("arch/simulations").mkdir(parents=True, exist_ok=True)
    run_viking_compliance_simulation()
