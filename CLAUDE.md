# WidgeTDC Contracts — Shared Type Definitions

TypeBox -> JSON Schema -> Pydantic v2 type contracts for the WidgeTDC platform.

## Repo Map

```
src/
  schemas/           TypeBox schema definitions
  generated/         Auto-generated JSON Schema + Pydantic models
docs/
  neo4j-ontology.md  Formal Neo4j ontology definition (pending)
```

## Essential Commands

```bash
npm run build              # Compile TypeBox schemas
npm run generate           # Generate JSON Schema + Pydantic
npm run test               # Run tests
npm run lint               # ESLint
```

## Rules (Ufravigelige)

1. TypeBox is the single source of truth for all type definitions
2. All JSON payloads must include $id field
3. Wire format: snake_case keys (never camelCase in JSON)
4. Version: 0.2.0
5. Breaking changes require ADR + version bump
6. Neo4j ontology changes require migration runbook

## Danger Zones

- Never change wire format without updating all consumers (6 repos)
- Never remove a field without deprecation period
- snake_case in JSON, camelCase in TypeScript — mapping is explicit

## Ontology (Owner)

This repo owns the formal Neo4j ontology:
- :IntelligenceAsset (abstract) -> :StrategicInsight, :KnowledgeAsset
- ~44,802 nodes pending migration to ontology

## Cross-Repo

Part of WidgeTDC platform (Clauskraft/).
Consumed by: WidgeTDC, rlm-engine, consulting-frontend, orchestrator.

## More Context

- Agent compliance: see monorepo docs/AGENT_COMPLIANCE.md
- Architecture: see monorepo docs/ARCHITECTURE.md
