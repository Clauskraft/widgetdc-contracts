# DECISION_QUALITY_SCORECARD_2026-03-17

**Date:** 2026-03-17  
**Status:** Canonical Baseline (LF-Q1)  
**Governing Issue:** [LIN-261](https://linear.app/linear-clauskraft/issue/LIN-261/decision-quality-scorecard-baseline-and-review-cadence)  
**Core Sentence:** Snout v2 discovers and normalizes knowledge. LegoFactory decides what is promotable, what is blocked, what becomes a loose end, and what can be surfaced as a verified architectural decision.

## 1. Core Flow Runtime Proofs (LIN-165 Core Flows)

### Flow 1: Consulting Recommendation Chain
- **Scope:** Canonicalization -> Assembly Arbitration -> Consulting Artifact Surface -> Backend Handoff Contract.
- **Runtime Proof:** Verified via `POST /api/intelligence/consulting/recommendation-runtime`.
- **Baseline Integrity:** 10/10 (Accepted handoff payload with complete lineage).
- **Owner:** LegoFactory (Consulting Surface).

### Flow 2: Process Intelligence Loop
- **Scope:** Domain-level loops, process hierarchy (L1/L2/L3), and gap detection.
- **Runtime Proof:** Verified via `BELONGS_TO_DOMAIN`, `HAS_SUBPROCESS`, `HAS_TASK` graph relations.
- **Baseline Integrity:** 9/10 (Hierarchy construction deterministic; some coverage gaps remain).
- **Owner:** Snout v2 / LegoFactory.

### Flow 3: LegoFactory Tri-Source Arbitration
- **Scope:** Reconciliation of Research, Regulatory, and Enterprise sources.
- **Runtime Proof:** Verified via `accepted`, `probable`, `contradicted`, `blocked`, `degraded` states.
- **Baseline Integrity:** 9/10 (Explicit contradiction clustering; DeepSeek fallback active).
- **Owner:** LegoFactory (Arbitration Engine).

## 2. Scorecard Capture Fields (LF-Q1)

These fields are mandatory for all `LIN-165` task batches and recurring reviews.

| Field | Description | Target | Threshold |
| :--- | :--- | :--- | :--- |
| **Normalization Quality** | Ratio of payloads following the universal candidate schema without adapter-specific leaks. | 100% | < 95% (FAIL) |
| **Arbitration Confidence** | Ratio of `accepted` vs `probable` decisions in the tri-source loop. | > 0.85 | < 0.70 (WARN) |
| **Grounding Depth** | Percentage of promoted blocks with explicit evidence lineage in `artifacts/`. | 100% | < 100% (FAIL) |
| **Decision Stability** | Percentage of verified decisions remaining unchanged over a 7-day rolling window. | > 0.95 | < 0.90 (WARN) |
| **Time-to-Verified-Decision** | Average wall-clock time from Signal discovery to verified Decision/Artifact promotion. | < 4h | > 12h (WARN) |

## 3. Residual Risk & Review Cadence

### Review Cadence
- **Weekly Baseline Sync:** Every Tuesday. Targets: `LIN-165 Progress Report` and `LIN-165 Project Schedule`.
- **Monthly Strategy Audit:** Last Thursday of the month. Targets: Master Epic (`LIN-165`) and Strategic Spine.

### Residual Risk Register (2026-03-17)
- **RR-01 (P1):** DeepSeek `401` authentication failures causing reasoning fallback to local/generic providers.
- **RR-02 (P2):** OODA checkpoint read-back drift between `run` and `resume` paths.
- **RR-03 (P2):** Missing automated instrumentation for "Time-to-Verified-Decision" metric.
- **RR-04 (P2):** L1/L2/L3 process hierarchy has confirmed coverage gaps in secondary domains.

## 4. Verification & Promotion Path

1. **Capture:** Scorecard data is captured after each `LIN-165` wave closure.
2. **Review:** Results are reviewed against the baseline during the Weekly Baseline Sync.
3. **Remediation:** Any metric below Threshold triggers an automatic `Remediation Seed` in Linear.
4. **Promotion:** Decisions with `Confidence < 0.85` are marked as `DEGRADED` and blocked from `Production Artifact` status.

---
*Created by Gemini (Architecture & Topology Reviewer) on 2026-03-17.*
