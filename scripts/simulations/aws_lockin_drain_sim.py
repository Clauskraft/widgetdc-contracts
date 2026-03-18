
import sys
from pathlib import Path
from datetime import datetime, timezone
import json

# Ensure we can import our models
sys.path.insert(0, str(Path.cwd() / "python"))

from widgetdc_contracts.graph import NodeLabel, RelationshipType
from widgetdc_contracts.viking import StrategicLeverage, FabricController
from widgetdc_contracts.orchestrator import RoutingDecision, Intent

def run_aws_lockin_drain_simulation():
    print("--- WidgeTDC Leverage Simulation: AWS Logic Liberation ---")
    now = datetime.now(timezone.utc)
    
    # 1. Define the Leverage Point (AWS Bedrock / Step Functions Lock-in)
    target_shadow_id = "comp_aws_bedrock_orchestrator"
    lockin_id = "lockin_proprietary_agent_state_v4"
    
    # 2. Calculate Strategic Leverage (Economic Gravity of AWS)
    # We quantify the cost of remaining in AWS vs. the gain of migration to WDC
    leverage = StrategicLeverage(
        leverage_id="lev_aws_liberation_001",
        target_id=target_shadow_id,
        leverage_type="architectural_lockin",
        financial_impact_score=4500000.0, # $4.5M annual operational debt from proprietary fees
        remediation_contract_ref="contract_logic_liberator_v1",
        calculated_at=now
    )
    
    print(f"[Vampire] Strategic Leverage Calculated: {leverage.leverage_id}")
    print(f"[Vampire] Annual Operational Debt Identified: ${leverage.financial_impact_score:,.2f}")
    
    # 3. Create the LogicLiberator (The Exit Path)
    # This represents Snout v2 mapping proprietary AWS state to WidgeTDC envelopes
    fabric = FabricController(
        controller_id="wdc_logic_liberator_alpha",
        fabric_type="cross_repo_bridge",
        active_probes=[
            {"probe_id": "p1", "target_agent": "SNOUT_EXTRACTOR", "latency_ms": 45.0},
            {"probe_id": "p2", "target_agent": "ORCHESTRATOR_MASTER", "latency_ms": 15.2}
        ],
        identity_tag_mapping={
            "SGT_AWS_LEGACY_STATE": "LOCKED_ASSET",
            "SGT_WIDGETDC_ENVELOPE": "LIBERATED_LOGIC"
        },
        health_status="optimal"
    )
    
    print(f"[Liberator] LogicLiberator Initialized: {fabric.controller_id}")
    print(f"[Liberator] Bridge Status: {fabric.health_status} (Ready for State Extraction)")
    
    # 4. Generate the Routing Decision to DRAIN
    decision = RoutingDecision(
        decision_id="dec_liberation_aws_001",
        intent=Intent(
            intent_id="int_aws_exit_execution",
            capability="guided_decomposition",
            task_domain="decomposition",
            flow_ref="core-flow-2",
            route_scope=["snout", "widgetdc-orchestrator"],
            operator_visible=True,
            scorecard_dimensions=["promotion_precision"]
        ),
        selected_agent_id="ORCHESTRATOR_MASTER",
        selected_capability="guided_decomposition",
        trust_score=0.99,
        reason_code="FABRIC_WIN",
        fabric_route_id=fabric.controller_id,
        vampire_drain_rate=0.92, # We are extracting 92% of the logic state
        target_shadow_id=target_shadow_id,
        evidence_refs=[leverage.leverage_id, lockin_id],
        decided_at=now
    )
    
    print(f"[Orchestrator] Liberation Decision Made: {decision.reason_code}")
    print(f"[Orchestrator] Logic Drain Rate: {decision.vampire_drain_rate * 100}%")
    
    # Output the result as a "Liberation Map"
    liberation_map = {
        "status": "AWS_LOCKIN_INTERCEPTED",
        "leverage": leverage.model_dump(),
        "fabric": fabric.model_dump(),
        "decision": decision.model_dump()
    }
    
    with open("arch/simulations/aws_liberation_map.json", "w") as f:
        json.dump(liberation_map, f, indent=2, default=str)
    
    print(f"--- Simulation Complete. Liberation Map exported to arch/simulations/aws_liberation_map.json ---")

if __name__ == "__main__":
    # Ensure directory exists
    Path("arch/simulations").mkdir(parents=True, exist_ok=True)
    run_aws_lockin_drain_simulation()
