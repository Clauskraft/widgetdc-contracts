import pytest
import json
from pathlib import Path
from pydantic import ValidationError
from widgetdc_contracts.cognitive import CognitiveRequest, CognitiveResponse
from widgetdc_contracts.health import HealthPulse
from widgetdc_contracts.orchestrator import (
    AgentHandshake,
    AgentTrustProfile,
    FabricProof,
    OrchestratorToolCall,
    ScorecardEntry,
    TelemetryEntry,
)

def test_cognitive_parity():
    # Real trace ID from SITREP
    trace_id = "ENG-LF-C1A-1773766946059"
    
    req = CognitiveRequest(
        task="Deep analysis of M&A target",
        context={"client_id": trace_id},
        reasoning_mode="deep"
    )
    assert req.context["client_id"] == trace_id
    
    res = CognitiveResponse(
        recommendation="Proceed with acquisition",
        reasoning="Based on market analysis...",
        confidence=0.87,
        trace={"trace_id": trace_id, "total_spans": 5, "total_duration_ms": 1200}
    )
    assert res.trace.trace_id == trace_id

def test_health_parity():
    pulse = HealthPulse(
        service="rlm-engine",
        status="starting",
        uptime_seconds=0,
        timestamp="2026-03-18T10:00:00Z"
    )
    assert pulse.service == "rlm-engine"

def test_orchestrator_trust_parity():
    profile = AgentTrustProfile(
        agent_persona="ARCHITECT",
        runtime_identity="masterarchitectwidgetdc",
        provider_source="gemini",
        task_domain="routing",
        success_count=12,
        fail_count=1,
        bayesian_score=0.92,
        prior_weight=5,
        default_prior_score=0.7,
        evidence_source="decision_quality_scorecard",
        scorecard_dimension="arbitration_confidence",
        scope_owner="widgetdc-orchestrator",
        last_verified_at="2026-03-18T10:00:00Z"
    )
    assert profile.agent_persona == "ARCHITECT"
    assert profile.bayesian_score == 0.92


def test_fabric_proof_parity():
    proof = FabricProof(
        proof_id="550e8400-e29b-41d4-a716-446655440010",
        proof_type="sgt",
        verification_status="verified",
        authorized_tool_namespaces=["shell", "git"],
        issued_at="2026-03-19T08:00:00Z",
    )
    assert proof.verification_status == "verified"

    handshake = AgentHandshake(
        agent_id="MASTERARCHITECTWIDGETDC",
        display_name="Master Architect WidgetDC",
        source="gemini",
        status="online",
        capabilities=["graph_read", "mcp_tools"],
        allowed_tool_namespaces=["graph", "audit"],
        fabric_proof=proof,
    )
    assert handshake.fabric_proof is not None

    tool_call = OrchestratorToolCall(
        call_id="550e8400-e29b-41d4-a716-446655440011",
        agent_id="MASTERARCHITECTWIDGETDC",
        tool_name="audit.lessons",
        arguments={"topic": "fabric"},
        fabric_proof=proof,
    )
    assert tool_call.fabric_proof is not None
