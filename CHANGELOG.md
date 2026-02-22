# Changelog

All notable changes to `@widgetdc/contracts` will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
