# Changelog

All notable changes to `@widgetdc/contracts` will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
