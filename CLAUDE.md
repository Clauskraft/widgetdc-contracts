# CLAUDE.md — WidgeTDC Contracts

## What is this
Shared type contracts for the WidgeTDC platform. Single source of truth for cross-service types used by backend, RLM engine, and consulting frontend.

## Tech stack
- TypeScript 5.7+, @sinclair/typebox (runtime JSON Schema + compile-time TS types)
- JSON Schema (generated, committed to git)
- Python Pydantic v2 models (generated, committed to git)

## Commands
- `npm run build` — Compile TypeScript
- `npm run schemas` — Export JSON Schema files to schemas/
- `npm run python` — Generate Python models from JSON Schema
- `npm run generate` — Build + schemas (full pipeline)
- `npm run test` — Run validation tests
- `npm run validate` — Check schemas are in sync with source

## Key paths
- `src/` — TypeBox schema definitions (source of truth)
- `schemas/` — Generated JSON Schema files (committed)
- `python/widgetdc_contracts/` — Generated Pydantic v2 models (committed)
- `scripts/` — Build and validation scripts
- `tests/` — Schema roundtrip tests

## Modules
| Module | Purpose |
|--------|---------|
| `cognitive/` | CognitiveRequest, CognitiveResponse, IntelligenceEvent — RLM ↔ Backend |
| `health/` | HealthPulse, HealthStatus, DomainProfile — all services |
| `http/` | ApiResponse, ApiError, PaginatedResponse — all services |
| `consulting/` | DomainId (15 domains), ProcessStatus — taxonomy enums |
| `agent/` | AgentTier, AgentPersona, SignalType — agent hierarchy |
| `graph/` | NodeLabel, RelationshipType — Neo4j schema registry |

## Conventions
- **Wire format**: snake_case JSON (matches RLM production API)
- **TypeBox pattern**: `const X = Type.Object({...})` + `type X = Static<typeof X>`
- **All schemas must have $id**: Required for JSON Schema export
- **Schemas committed to git**: Enables consumption without Node.js build

## Do NOT
- Never change wire format from snake_case without coordinating all 3 repos
- Never edit schemas/ or python/ manually — regenerate from source
- Never add repo-internal types here — only cross-service contracts

## Related services
- **Backend**: Clauskraft/WidgeTDC (WidgeTDC_fresh)
- **RLM Engine**: Clauskraft/widgetdc-rlm-engine
- **Frontend**: Clauskraft/widgetdc-consulting-frontend
