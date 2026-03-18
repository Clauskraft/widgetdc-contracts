# SPEC: Orchestrator Bayesian Routing & Multi-Agent Workflows

**Version:** 1.0.0 (Baseline LF-Q1)  
**Date:** 2026-03-17  
**Status:** Approved for Implementation  
**Governing Issue:** [LIN-261](https://linear.app/linear-clauskraft/issue/LIN-261/decision-quality-scorecard-baseline-and-review-cadence)  
**Core Intent:** Transition the platform from static agent assignments to a dynamic, self-optimizing "Agent Bus" powered by Bayesian trust and intent-based routing.

---

## 1. Objective & Strategic Rationale

To achieve the "Architecture Synthesis" goals of `LIN-165`, the WidgeTDC Orchestrator must evolve beyond a simple message relay. This specification introduces a **Meritocratic Orchestration Layer** that automatically selects the highest-performing agent for any given task, using real-time telemetry and a shared trust-model.

### Key Strategic Moats:
- **Provider Agnostic:** Removes reliance on any single LLM as the "Master".
- **Self-Healing:** Agents with failing outcomes are automatically de-prioritized in the routing table.
- **Decision Parity:** All agent outputs are measured against the same `Decision-Quality Scorecard`.

---

## 2. Core Components

### 2.1 Bayesian Trust Engine (The Referee)
The system tracks every agent's performance across specific task types (`coding`, `research`, `strategy`, `audit`).
- **Telemetry Source:** `monitoring_audit_log` (PostgreSQL).
- **Formula:** Bayesian trust score using a Beta distribution (successes + alpha) / (total + alpha + beta).
- **Default Prior:** 0.70 (Weight: 5).

### 2.2 Intent Routing Engine (The Brain)
Every incoming `AgentMessage` of type `Command` or `Question` is passed through the Intent Router.
- **Classification:** Maps prompts to `AgentCapability` (e.g., `knowledge-advise`, `diamond-develop`).
- **Resolution:** Selects the provider with the highest Trust Score for that specific intent and cost-tier.

### 2.3 Universal Workflow Patterns (The "Octo-Flow")
Standardizes multi-agent coordination into four canonical phases:
1.  **Discover (Probe):** OSINT and Signal harvesting (Snout v2).
2.  **Define (Grasp):** Requirements and Architecture Review (Gemini).
3.  **Develop (Tangle):** Implementation and Hardening (Codex).
4.  **Deliver (Ink):** QA, PRD Scoring, and Promotion (Qwen/Claude).

---

## 3. Data Models & Contracts

### 3.1 `AgentTrustProfile`
Stored in `schemas/orchestrator/AgentTrustProfile.json`.
```json
{
  "agent_id": "string",
  "task_domain": "string",
  "success_count": "number",
  "fail_count": "number",
  "bayesian_score": "number",
  "last_verified_at": "date-time"
}
```

### 3.2 `AgentWorkflow`
Stored in `schemas/orchestrator/AgentWorkflow.json`.
```json
{
  "workflow_type": "Embrace | Debate | Research | Audit",
  "current_phase": "Discover | Define | Develop | Deliver",
  "participants": "AgentId[]",
  "quorum_consensus": "boolean",
  "scorecard_ref": "string"
}
```

---

## 4. Implementation Path (Cross-Repo)

### Phase 1: Contract Enforcement (`widgetdc-contracts`)
- [ ] Implement `AgentWorkflow` and `AgentTrustProfile` TypeBox schemas.
- [ ] Export to JSON Schema and Pydantic models.

### Phase 2: Orchestrator Logic (`WidgeTDC/apps/backend`)
- [ ] Implement `IntentRouter.ts` using the Octopus-derived classification regex.
- [ ] Integrate PostgreSQL telemetry read-back into the routing decision.

### Phase 3: Surface Integration (`widgetdc-consulting-frontend` / `LibreChat`)
- [ ] Display `Confidence Badges` (Trust Score) next to agent names in chat.
- [ ] Expose "Reasoning Lineage" (which agents were consulted during the workflow).

---

## 5. Governance & Arbitration (LegoFactory)

The **LegoFactory** acts as the final judge of agent performance. 
- **Arbitration State:** If two agents (e.g., Gemini and Claude) disagree in a `Debate` workflow, the Orchestrator invokes the `quality_gate` defined in the Scorecard.
- **Trust Decay:** Intentional "Jitter" or failed audits trigger a Trust Decay, preventing an agent from dominating a domain if its decision quality drops below 0.85.

---

## 6. Visual Language (Anonymized Indicators)

To maintain platform parity without "triggering" specific provider sensitivities:
- **ðŸ™ ** - Platform Orchestration Active (Multi-Agent).
- **ðŸ”´** - Builder Logic Executing (Codex).
- **ðŸŸ¡** - Architecture Review Executing (Gemini).
- **ðŸ”µ** - Synthesis & Governance Executing (Claude/Qwen).

---
*Verified by Gemini (Architecture & Topology Reviewer) on 2026-03-17.*
