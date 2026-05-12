# LIN-1089 DataPulse Scribd Refresh Evidence

Date: 2026-05-12

## Verdict

`BLOCKED_RUNTIME_SOURCE_REFRESH`

The Architecture Cockpit DataPulse warning is valid. `src-scribd` remains critical/stale and must not be cleared by editing timestamps or lowering thresholds.

## Runtime Readback

Backend health readback:

- backend status: `healthy`
- backend deployed short SHA: `e4711801a92d`

Architecture Cockpit DataPulse readback:

- endpoint: `https://arch-mcp-server-production.up.railway.app/api/data/analysis`
- generated: `2026-05-11T15:28:55.326Z`
- total critical sources: `1`
- average health: `55`
- critical source: `src-scribd`

`src-scribd` live metrics:

- name: `Scribd Document Intelligence`
- category: `knowledge_acquisition`
- freshness score: `5`
- quality score: `41`
- reliability score: `52`
- health score: `34`
- risk: `critical`
- stale: `true`
- hours stale: `1863`
- issue count: `4`

Branch hygiene readback after contracts PR #30 and Platform Modules PR #50:

- endpoint: `/api/branches?refresh=true`
- open PRs: `0`
- branches: `66`
- stale branches: `0`
- from cache: `false`

## Source Of Truth

Static source definition:

- file: `arch/data-sources.json`
- source id: `src-scribd`
- last update: `2026-02-16T00:00:00Z`
- update frequency: `weekly`
- staleness threshold: `168` hours
- pipeline: `pipe-scribd-harvester`
- pipeline status: `degraded`

Known quality issues from the source definition:

- scraping blocked intermittently, estimated 30 percent failure rate
- no structured metadata extraction
- document dedup not implemented, estimated 15 percent duplicates
- table extraction accuracy varies

## Refresh Path Assessment

Backend read-only/source inspection found Scribd harvest paths:

- `harvest.docs.scribd`
- `harvest.docs.scribd.cloud`
- `ingestion.scribd`
- Python browser/cookie harvest scripts under `apps/backend/python/`
- TypeScript adapters under `apps/backend/src/harvest/sources/`

The safe refresh could not be executed in this session because:

- local runtime env has no `SCRIBD_SESSION_ID`
- local runtime env has no `SCRIBD_BROWSER_PROFILE_DIR`
- local runtime env has no `SCRIBD_COOKIES`
- local runtime env has no Neo4j/Aura credentials for local write verification
- `harvest.docs.scribd` and `harvest.docs.scribd.cloud` do not expose a confirmed dry-run contract in the handler path
- the harvest path may write to graph/storage and therefore requires governed operator approval before execution

## Non-Actions

The following were intentionally not done:

- no edit to `arch/data-sources.json` freshness timestamp
- no threshold lowering
- no graph write
- no ClaimsRegistry mutation
- no GOV2/enforce change
- no claim promotion
- no unapproved Scribd harvest execution

## Read-Only Audit Command

Use:

```bash
npm run datapulse:scribd:audit
```

Expected current result:

- status: `BLOCKED_RUNTIME_SOURCE_REFRESH`
- source: `src-scribd`
- reason includes current health/freshness/staleness

## Required Operator Approval For Actual Refresh

Before running a harvest that can write to graph/storage, require explicit approval:

```text
JEG GODKENDER: run governed Scribd DataPulse refresh for src-scribd using approved runtime credentials and record evidence only.
```

After approval, the refresh must:

- use server-side credentials only
- not print cookies or bearer tokens
- route through governed runtime tooling
- emit or reference durable evidence
- update `arch/data-sources.json` only after real refresh evidence exists
- rerun `/api/data/analysis`
- rerun Architecture Cockpit monitor

## Claim Boundary

This docket does not support any platform claim promotion. Architecture Cockpit remains:

- static compliance: GREEN
- branch hygiene: GREEN
- DataPulse Scribd source: YELLOW/BLOCKED
