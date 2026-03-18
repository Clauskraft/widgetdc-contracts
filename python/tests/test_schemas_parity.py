import pytest
import json
from pathlib import Path
from pydantic import ValidationError
from widgetdc_contracts.cognitive import CognitiveRequest, CognitiveResponse
from widgetdc_contracts.health import HealthPulse
from widgetdc_contracts.orchestrator import AgentTrustProfile, TelemetryEntry, ScorecardEntry

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
