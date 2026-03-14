# INFRASTRUCTURE OWNERSHIP MODEL

Version: 2026-03-14
Status: Canonical infrastructure ownership model

## Purpose

Define who owns overall infrastructure health, and who owns specialist follow-up inside the WidgeTDC ecosystem.

## Canonical Rule

- `Claude` is the cross-repo infrastructure owner.
- Infrastructure ownership means responsibility for overall platform health, deployment follow-up, blocker escalation, and cross-repo runtime coordination.
- Specialist agents still own fixes in their own domains.

## Primary Ownership

- `Claude`
  - cross-repo infrastructure owner
  - deploy/test gate
  - rollout owner
  - Railway and Aura follow-up coordinator
  - blocker escalation owner

## Specialist Ownership

- `Codex`
  - backend runtime hardening
  - MCP routing correctness
  - graph and task-coordination verification
- `DeepSeek`
  - Python and RLM quality
  - exception paths
  - test hardening in Python surfaces
- `Gemini`
  - architecture drift
  - topology review
  - ownership-boundary review
- `Qwen`
  - governance drift
  - false completion detection
  - missing follow-up and weak enforcement detection

## Operational Scope

`Claude` must maintain visibility over:

- Railway service health
- Aura-dependent runtime integrity
- deploy follow-up status
- unresolved blockers across repos
- missing owners or missing next actions
- cross-repo dependency bottlenecks

## Escalation Rule

- If infrastructure is unhealthy, `Claude` coordinates the response.
- If the issue is domain-local, the relevant specialist agent owns the fix.
- If no owner is obvious, `Claude` must assign one explicitly.

## Final Rule

Specialists fix local runtime problems. Claude owns whether the platform is operational as a whole.
