
import sys
from pathlib import Path
from datetime import datetime, timezone
import json

# Ensure we can import our new models
sys.path.insert(0, str(Path.cwd() / "python"))

from widgetdc_contracts.graph import NodeLabel, RelationshipType
from widgetdc_contracts.graph import StrategicLeverage, FabricController
from widgetdc_contracts.orchestrator import RoutingDecision, Intent

def run_cisco_drain_simulation():
    print("--- WidgeTDC Leverage Simulation: Cisco Drain ---")
    now = datetime.now(timezone.utc)
    
    # 1. Define the Leverage Point (The CVSS 10.0 Vulnerability)
    target_shadow_id = "comp_cisco_sdwan_vsmart"
    gap_id = "cve_2026_20127_auth_bypass"
    
    # 2. Calculate Strategic Leverage using FAIR-inspired logic
    # In a real scenario, this would be computed by our Vampire Engine
    leverage = StrategicLeverage(
        leverage_id="lev_cisco_viptela_heist_001",
        target_id=target_shadow_id,
        leverage_type="compliance_gap",
        financial_impact_score=12500000.0, # $12.5M estimated risk for a mid-size Danish enterprise
        remediation_contract_ref="contract_fabric_guardian_v1",
        calculated_at=now
    )
    
    print(f"[Vampire] Strategic Leverage Calculated: {leverage.leverage_id}")
    print(f"[Vampire] Financial Impact Surface: ${leverage.financial_impact_score:,.2f}")
    
    # 3. Create the FabricGuardian (The Exit Path)
    # This represents WidgeTDC taking control of the network fabric
    fabric = FabricController(
        controller_id="wdc_fabric_guardian_alpha",
        fabric_type="software_nvlink",
        active_probes=[
            {"probe_id": "p1", "target_agent": "GEMINI_ARCHITECT", "latency_ms": 12.5},
            {"probe_id": "p2", "target_agent": "CODEX_ENGINEER", "latency_ms": 8.2}
        ],
        identity_tag_mapping={
            "SGT_TRUSTED_INTERNAL": "WIDGETDC_CORE",
            "SGT_EXTERNAL_UNTRUSTED": "CISCO_LEGACY_NODE"
        },
        health_status="optimal"
    )
    
    print(f"[Fabric] FabricGuardian Initialized: {fabric.controller_id}")
    print(f"[Fabric] Latency Optimality: {fabric.health_status} (Probes: {len(fabric.active_probes)})")
    
    # 4. Generate the Routing Decision to Intercept
    decision = RoutingDecision(
        decision_id="dec_interception_cisco_001",
        intent=Intent(
            intent_id="int_logic_liberation",
            capability="verified_recommendation",
            task_domain="audit",
            flow_ref="core-flow-3",
            route_scope=["widgetdc-orchestrator"],
            operator_visible=True,
            scorecard_dimensions=["tri_source_arbitration_divergence"]
        ),
        selected_agent_id="ORCHESTRATOR_MASTER",
        selected_capability="workflow_audit",
        trust_score=0.98,
        reason_code="FABRIC_WIN",
        fabric_route_id=fabric.controller_id,
        vampire_drain_rate=0.85, # We are extracting 85% of the logic value
        target_shadow_id=target_shadow_id,
        evidence_refs=[leverage.leverage_id, gap_id],
        decided_at=now
    )
    
    print(f"[Orchestrator] Interception Decision Made: {decision.reason_code}")
    print(f"[Orchestrator] Vampire Drain Rate: {decision.vampire_drain_rate * 100}%")
    
    # Output the result as a "Leverage Map"
    leverage_map = {
        "status": "VAMPIRIC_DOMINANCE_ESTABLISHED",
        "leverage": leverage.model_dump(),
        "fabric": fabric.model_dump(),
        "decision": decision.model_dump()
    }
    
    with open("arch/simulations/cisco_leverage_map.json", "w") as f:
        json.dump(leverage_map, f, indent=2, default=str)
    
    print(f"--- Simulation Complete. Leverage Map exported to arch/simulations/cisco_leverage_map.json ---")

if __name__ == "__main__":
    # Ensure directory exists
    Path("arch/simulations").mkdir(parents=True, exist_ok=True)
    run_cisco_drain_simulation()
