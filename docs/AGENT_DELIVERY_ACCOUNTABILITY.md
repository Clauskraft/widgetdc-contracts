# AGENT DELIVERY ACCOUNTABILITY

Version: 2026-03-14
Status: Canonical delivery accountability policy

## Purpose

Define who is responsible for committing finished code, pushing it to `main`, and following up on Railway deployment status.

## Canonical Rule

- The agent that completes a code batch owns delivery of that batch.
- Delivery means:
  - commit the finished changes
  - push the finished changes to `main`
  - verify the relevant Railway deployment or runtime surface
  - record the outcome in Linear

## Non-Negotiable Rules

- Finished code must not remain uncommitted when the approved backlog item scope is complete.
- Finished code must not remain unpushed when the approved backlog item scope is complete.
- Deploy-sensitive work is not complete until Railway follow-up has been performed.
- `Claude` is the deploy/test gate for deploy-sensitive work, not the default delivery owner for every batch.
- The executing agent remains accountable for follow-up even when another agent reviews, gates, or comments.

## Minimum Delivery Sequence

1. Complete the scoped code batch.
2. Run targeted local verification.
3. Request QA or gate review where policy requires it.
4. Commit the finished batch.
5. Push to `main`.
6. Verify relevant Railway deployment outcome.
7. Record status, commit SHA, and deployment result in Linear.

## Required Deployment Follow-Up

The executing agent must perform at least the relevant subset of:

- health check on the affected Railway service
- targeted production smoke check
- verification that the expected endpoint, tool, route, or behavior is live
- explicit failure note and follow-up issue if deployment verification fails

## Linear Completion Requirements

Every delivered code batch must include:

- `STATUS`
- `SCOPE`
- `FILES/ISSUES TOUCHED`
- `VERIFICATION`
- `COMMIT`
- `PUSH`
- `DEPLOY FOLLOW-UP`
- `NEXT ACTION`

## Failure Handling

If push or deployment follow-up fails:

- mark the work `BLOCKED` or `DELIVERED_WITH_FOLLOWUP`
- state the exact failure point
- state whether code is committed, pushed, and live
- create or link the follow-up backlog item

## Final Rule

Code is not done when it compiles. Code is done when it is committed, pushed, and verified where it runs.
