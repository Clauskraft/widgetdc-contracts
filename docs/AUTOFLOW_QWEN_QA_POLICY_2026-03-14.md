# Autoflow Qwen QA Policy

This document makes the current agent operating model explicit and mandatory.

## Canonical Rule

All code changes must pass through `Qwen QA` from now on.

This means:
- every code batch gets a Qwen review request in Linear
- Qwen reviews simplification, ontology drift, contract drift and unnecessary complexity
- code is not considered operationally complete until Qwen feedback has been handled or explicitly triaged

## Roles

- `Codex`
  - implementation owner
  - integration owner
  - runtime hardening owner
- `Qwen3.5`
  - default code QA
  - simplification and drift reviewer
- `Qwen Code Smith`
  - fallback when Qwen review requires MCP, repo reads or runtime/tool verification
- `Claude`
  - deploy/test gate
  - required on deploy-sensitive, runtime-sensitive and contract-sensitive batches
- `Gemini`
  - architecture reviewer
  - required on topology or operating-model shifts

## Mandatory Autoflow

1. Implement the code batch.
2. Run targeted verification.
3. Post status in Linear.
4. Request Qwen QA.
5. Handle or triage Qwen findings.
6. If the batch is deploy-sensitive or contract-sensitive, request Claude gate.
7. Push to `main`.
8. Verify live runtime where relevant.

## Minimum Qwen QA Packet

Every Qwen QA request must include:
- issue identifier
- repo
- files or commit scope
- contracts touched
- tests run
- risk notes
- exact requested output

## Required Qwen Output

Qwen QA should return:
- top findings
- what should be kept
- drift risks
- simplification actions
- phase 2 deferrals

## No-Divergence Rules

Qwen QA must explicitly check drift against:
- canonical block taxonomy
- existing backend contracts
- existing render contracts
- existing Canvas or LibreChat surface contracts
- existing graph truth model

## Practical Rule

If a task touches code, Qwen is in the loop.

If a task also touches runtime, deployment or contracts, Claude is added as gate.
