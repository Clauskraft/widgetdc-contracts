# Changelog

All notable changes to `@widgetdc/contracts` will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Changes on `main` after the `0.11.0` version bump (`65d4e07`); `package.json`
still reads `0.11.0`, so a release needs a bump and a tag.

### Added
- `capability`: canonical capability identity envelope (`a98ab93`, #102).
- `orchestrator`: canonical plan authority contract (`25997ed`, #103, LIN-2384).
- `orchestrator`: plan authority envelope v2 (`c83dfdc`, #104).

## Backfill note

Entries `0.5.0` to `0.11.0` below were reconstructed on 2026-10-05 from the
version-bump commits in `git log -G'"version":' -- package.json` and the commit
subjects between them (the file stopped at `0.4.4`). Version `0.7.0` was never
cut. Tags: only `v0.9.1` exists after `v0.4.4`; the other versions are untagged,
so each heading below names its bump commit instead. This is a history repair,
not a release: nothing is tagged or published by this change.

## [0.11.0] - 2026-07-25 (`65d4e07`)

### Added
- `capability`: version-incompatible capability result (#100, LIN-2267).
- `build`: deterministic generators and artifact parity repair (#97 `a9072dd`,
  #98 `fbbcfa1` LIN-2269, #99 `0aba47d` LIN-2270).

## [0.10.0] - 2026-07-24 (`051aced`)

### Added
- `sovereign execution` contracts (`73a4823`, #94).
- `chat-contract-runtime`: the public `wdc.chat_session.v1` lifecycle contracts
  for backend-owned identity, optimistic concurrency, one-way archival, bounded
  cursor pagination, and strict TypeBox/Pydantic parity (#95, LIN-2265).

## [0.9.2] - 2026-07-14 (`bea58db`)

### Added
- Canonical semantic identity (#93).
- Continuation lifecycle contracts (#92).
- WDC chat runtime contracts (#88) and Demand-to-Proof authority surfaces (#87,
  synced by #89); TypeBox formats exported (#90).
- `agent-adoption-contract.v1`, the canonical adoption contract for the 7-repo
  platform (B11, #76).
- LLM-agnostic consulting contracts: `OutputFormat`, `SkillTaskBinding` and 3 task
  types (#80).

### Fixed
- LLM matrix drift: dead `mercury-2` primary, version sync, frontier Claude tier
  (#84); `infra_fallback` task (#86); Gemini 3 routing (#91).
- Committed the missing generated Pydantic modules (#85).
- Runtime follow-up gates normalised (#78); cron API key passed to the harvest
  workflow (#79).

## [0.9.1] - 2026-06-06 (`b908455`; tag `v0.9.1` was cut later, `3c6f867` 2026-07-01)

### Fixed
- `llm-matrix`: retire EOL `gemini-2.0-flash` in favour of `gemini-2.5-flash` /
  `-lite` (#74).

## [0.9.0] - 2026-06-03 (`7beff26`)

### Added
- Adoption: promote `NotebookSpec` and `DrillContext` to contracts (G4, #72).
- Governance baseline hydration (`d86a0ec`) and LF-forced `*.md` (`22a9e6b`).
- TypeBox schemas for permanent learning aggregates `LLMModelStats`,
  `StrategyStats`, `CandidateScoreStats` (#66).
- Plan 3 EventSpine contract events synced (#62).
- `OPENCLAW_OPERATOR_MCP_KEY` registered in the wallet manifest (#64).

### Fixed
- Claim-grade consumer readback is required (`6e6455b`).

## [0.8.2] - 2026-05-27 (`1c57481`)

### Added
- Contracts adoption readback envelope (#45) and consumer readback evidence
  ingest; platform completion ledger contracts (#50); secrets wallet rotation
  manifest (#52).

### Fixed
- Platform artifact generation gaps (#38); dashboard bearer fallback removed
  (#54); bearer examples redacted from agent docs (#56); Qwen fallback LLM matrix
  synced (#58).

## [0.8.1] - 2026-05-25 (`3e20e73`)

### Added
- Operator-anchored pheromone contracts (#23); canonical governance schemas
  (#24, LIN-997); Phase Epsilon E1 `BOMItem` + `ConfigurationSnapshot` +
  `WorkArtifact` (#25); Stream A schemas `AgenticPattern`, `HyperAgentPlan`,
  `TuningHypothesis` (#28); Wonder Gateway repo contract (#36).

### Fixed
- LLM matrix provider suspension synced; Arch MCP runtime build dependencies
  (#33, #34); harvest workflow routed through the commit endpoint (#29).

## [0.8.0] - 2026-04-20 (`837bcb3`)

### Added
- Fitness helpers (#22).

## [0.6.0] - 2026-04-18 (`da1ca51`)

### Added
- `canvasIntent` + `canvasRule` for the unified canvas (UC1, #21).

## [0.5.0] - 2026-04-18 (`34ef7fb`)

### Added
- MRP envelope, `ProductionOrder` and `AuditHashChain` (#20).

## [0.4.4] - 2026-04-18

### Fixed
- `http/error`: add `$id` to `ApiError` + `ApiErrorCode` schemas (`2791c00`, LIN-859).
  Both were the only public root schemas missing `$id`, breaking `$ref` chain
  lookups in the JSON Schema registry. Without `$id`, `InsightIntegrityGuard`
  rejects any payload carrying these types. Downstream consumers should bump
  the pin to `0.4.4` to unblock error-envelope validation.

## [0.4.3] - 2026-04-09

### Changed
- `llm-matrix`: switch Mercury-2 to gemini-2.0-flash as primary folding model (`602eb8e`)

## [0.4.2] - 2026-04-08

### Changed
- `llm-matrix`: replace claude-sonnet-4 with qwen3-235b-a22b (`e378889`)

## [0.4.1] - 2026-04-07

### Fixed
- `llm-matrix`: sync mirror to WidgeTDC canonical — Wave 5 Phase 1.5 (`1d90cba`)

## [0.4.0] - 2026-04-06

### Added
- `llm/` module — canonical LlmMatrix in @widgetdc/contracts, Wave 1 (`b01be8d`)
- `adoption/` module — RewardVector, Consensus, Rollout, Metrics schemas (LIN-467) (`11c3235`)
- `AnalysisArtifact` TypeBox schema — WAD artifact format (LIN-527) (`b9635eb`)
- Omega Sentinel contracts — canonical SNOUT-3 (LIN-581) (`d7cf6db`)
- Orchestrator launcher and artifact shared contracts (`93e236d`)

### Fixed
- RLM health read-back widened — accept live RLM health payload variants (LIN-347) (`92665a4`)
- Regenerate platform-graph.json (72 → 1018 nodes) (`f082e4a`)

### Changed
- Cross-repo governance baseline + agent instructions added (`73983cb`)

## [0.3.0] - 2026-03-10

### Added
- `orchestrator/` module — AgentHandshake, AgentMessage, OrchestratorToolCall/Result multi-agent orchestration
- Omni-Watch Intelligence integration (Contracts) (`8f93f4d`)
- RSI graph contracts (`81a9db4`)
- MCP client policy contracts (`2f8694b`)
- NormalizationContract — universal normalization contract (LIN-155) (`57fb5d6`)
- Compliance matrix API — contract compliance rows for all platform agents
- Railway runtime readback gate (`28b7b5e`)
- Legal Sentinel node labels and relationship types (`bad3c51`)

### Changed
- AgentHandshake/AgentMessage schemas made extensible (`f541b32`)
- Cross-repo coordination: .cursorrules, hooks, settings, autonomy rule (`11be462`)

## [0.2.0] - 2026-02-22

### Added
- `librechat` and `rag-api` to HealthPulse `ServiceIdentifier` (`e93111b`)
- Cross-repo version alignment checker (`368feee`)
- Version check script for consumer repos (`0322545`)

### Changed
- All three consumers (backend, RLM engine, frontend) now import from contracts v0.2.0

## [0.1.0] - 2026-02-22

### Added
- Initial release with 6 contract modules
- `cognitive/` — CognitiveRequest, CognitiveResponse, IntelligenceEvent
- `health/` — HealthPulse, HealthStatus, DomainProfile
- `http/` — ApiResponse, ApiError, PaginatedResponse
- `consulting/` — DomainId (15 domains), ProcessStatus, DOMAIN_SHORT_IDS
- `agent/` — AgentTier, AgentPersona, SignalType
- `graph/` — NodeLabel, RelationshipType
- JSON Schema generation (`schemas/`)
- Python Pydantic v2 model generation (`python/`)
- Schema drift validation (`npm run validate`)
- 19 test cases covering all modules
