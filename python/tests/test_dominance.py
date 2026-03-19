import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from widgetdc_contracts.graph import FabricController, StrategicLeverage
from widgetdc_contracts.orchestrator import RoutingDecision


def load_simulation(name: str) -> dict:
    sim_path = Path(__file__).parent.parent.parent / "arch" / "simulations" / name
    assert sim_path.exists()

    with open(sim_path, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.mark.parametrize(
    ("name", "expected_leverage_id", "expected_controller_id", "expected_decision_id", "expected_drain_rate"),
    [
        ("viking_leverage_map.json", "lev_viking_dominance_001", "wdc_viking_audit_fabric", "dec_viking_intercept_001", 0.95),
        ("cisco_leverage_map.json", "lev_cisco_viptela_heist_001", "wdc_fabric_guardian_alpha", "dec_interception_cisco_001", 0.85),
        ("aws_liberation_map.json", "lev_aws_liberation_001", "wdc_logic_liberator_alpha", "dec_liberation_aws_001", 0.92),
    ],
)
def test_simulation_maps_validate_against_canonical_contracts(
    name: str,
    expected_leverage_id: str,
    expected_controller_id: str,
    expected_decision_id: str,
    expected_drain_rate: float,
):
    data = load_simulation(name)

    leverage = StrategicLeverage(**data["leverage"])
    assert leverage.leverage_id == expected_leverage_id

    fabric = FabricController(**data["fabric"])
    assert fabric.controller_id == expected_controller_id
    assert fabric.health_status == "optimal"

    decision = RoutingDecision(**data["decision"])
    assert decision.decision_id == expected_decision_id
    assert decision.reason_code == "FABRIC_WIN"
    assert decision.vampire_drain_rate == expected_drain_rate

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
