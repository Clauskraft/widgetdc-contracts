# DOC-SOURCE-SPINE — Scribd Replacement Boundary

Generated: 2026-05-12

## Verdict

`src-scribd` is deprecated as a production document harvest source.

The replacement path is a governed document source spine:

- `src-openalex-research-graph`
- `src-crossref-doi-metadata`
- `src-core-open-access`
- `src-europepmc-open-access`
- `src-semantic-scholar-enrichment`
- `src-publisher-allowlist-reports`
- `src-governed-document-intake`

## Why

The previous Scribd source depended on session/cookie scraping and HTML extraction. That is not stable runtime evidence and should not be used as a production-facing ingestion source.

## Evidence Contract

Canonical document ingestion requires:

- source identifier
- rights or license boundary
- content hash where content is ingested
- correlation_id
- EventSpine event and replay
- deployed SHA for runtime proof
- graph lineage only through governed typed promotion

## Claim Boundary

This change does not make the replacement stack runtime-proven.

Allowed:

- `src-scribd` is deprecated/reference-only.
- The governed replacement sources are planned and visible in DataPulse config.

Not allowed:

- Claiming OpenAlex/Crossref/CORE/Europe PMC/Semantic Scholar runtime ingestion is live.
- Claiming document intelligence is complete.
- Claiming Scribd freshness is fixed.
- Promoting any ClaimsRegistry entry.

## Verification

Source-level guard:

```bash
npm run test -- tests/doc_source_spine.test.ts
```

Runtime DataPulse may remain YELLOW until the replacement sources have real runtime canary evidence and EventSpine replay.
