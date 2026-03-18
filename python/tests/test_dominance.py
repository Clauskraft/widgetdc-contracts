import pytest
import json
from pathlib import Path
from pydantic import ValidationError
from widgetdc_contracts.viking import StrategicLeverage, FabricController
from widgetdc_contracts.orchestrator import RoutingDecision

def test_viking_simulation_parity():
    # Path to real simulation data
    sim_path = Path(__file__).parent.parent.parent / "arch" / "simulations" / "viking_leverage_map.json"
    assert sim_path.exists()
    
    with open(sim_path, "r") as f:
        data = json.load(f)
    
    # 1. Validate StrategicLeverage
    leverage = StrategicLeverage(**data["leverage"])
    assert leverage.leverage_id == "lev_viking_dominance_001"
    assert leverage.financial_impact_score == 85000000.0
    
    # 2. Validate FabricController
    fabric = FabricController(**data["fabric"])
    assert fabric.controller_id == "wdc_viking_audit_fabric"
    assert fabric.health_status == "optimal"
    
    # 3. Validate RoutingDecision
    decision = RoutingDecision(**data["decision"])
    assert decision.decision_id == "dec_viking_intercept_001"
    assert decision.reason_code == "FABRIC_WIN"
    assert decision.vampire_drain_rate == 0.95

def test_schema_rejection():
    # Test invalid data rejection
    with pytest.raises(ValidationError):
        # Invalid leverage_type
        StrategicLeverage(
            leverage_id="test",
            target_id="test",
            leverage_type="invalid_type",
            financial_impact_score=100,
            calculated_at="2026-03-18T10:00:00Z"
        )
