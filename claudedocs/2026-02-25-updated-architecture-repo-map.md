# WidgeTDC Updated Architecture Repo Map (2026-02-25)

This document provides an updated architecture drawing focused on repositories,
cross-service contracts, and runtime integrations.

## 1) Repository Landscape

```mermaid
flowchart LR
  Contracts["widgetdc-contracts\n(single source of truth)\nTypeBox + JSON Schema + Python models"]

  Backend["WidgeTDC backend repo\n(runtime API + MCP routing)\n(local workspace often named WidgeTDC_fresh)"]
  RLM["widgetdc-rlm-engine\n(FastAPI reasoning engine)"]
  Frontend["widgetdc-consulting-frontend\n(React/Vite client)"]
  OpenClaw["widgetdc-openclaw / openclaw-railway-template\n(agent runtime + cron workflows)"]
  Arch["arch-mcp-server\n(Architecture Intelligence dashboards)"]

  Backend -->|"imports @widgetdc/contracts\n(cognitive/health/http/...)"| Contracts
  RLM -->|"consumes shared contracts\n(via generated models / mapped wire types)"| Contracts
  Frontend -->|"imports @widgetdc/contracts\n(shared enums + DTOs)"| Contracts
  Arch -->|"reads generated architecture assets\n(platform-graph + analysis outputs)"| Contracts

  OpenClaw -->|"calls backend MCP route\n/api/mcp/route"| Backend
  Frontend -->|"HTTP API + SSE"| Backend
  Backend -->|"HTTP calls / event exchange"| RLM
  Arch -->|"GitHub metadata + graph insights\nfor backend/frontend/rlm/contracts"| Backend
  Arch --> Frontend
  Arch --> RLM
  Arch --> Contracts
```

## 2) Contract and Data Flow

```mermaid
flowchart TD
  Source["src/* (TypeBox schemas)\n@widgetdc/contracts"] --> Build["npm run generate\n(build + schema export)"]
  Build --> Schemas["schemas/*\nJSON Schema artifacts"]
  Build --> Dist["dist/*\nTS runtime + type exports"]
  Schemas --> Python["python/widgetdc_contracts/*\nPydantic v2 models"]

  Dist --> BackendUse["Backend imports\n@widgetdc/contracts/*"]
  Dist --> FrontendUse["Frontend imports\n@widgetdc/contracts/*"]
  Python --> RLMUse["RLM model alignment\n(canonical wire compatibility)"]

  BackendUse --> API["Runtime API responses\nApiResponse / ApiError contract targets"]
  RLMUse --> RLMApi["RLM endpoints\nmapped to shared contract semantics"]
  FrontendUse --> UI["UI rendering + validation\nbased on shared enums/types"]
```

## 3) Runtime Service Topology (Production-Oriented)

```mermaid
flowchart LR
  User["Users / Operators"] --> FE["Consulting Frontend"]
  User --> ArchUI["Arch Intelligence UI\n/dashboard /overview /analysis-report"]

  FE -->|"HTTPS"| BE["Backend API\nRailway"]
  ArchUI -->|"REST /api/analysis\n/api/changelog /api/branches"| ArchSvc["Arch MCP Service\nRailway"]
  OpenClawRT["OpenClaw Runtime\nRailway"] -->|"MCP tool calls\n/api/mcp/route"| BE

  BE -->|"Reasoning requests"| RLMEngine["RLM Engine\nRailway (FastAPI)"]
  BE -->|"Graph queries"| Neo4j["Neo4j AuraDB"]
  BE -->|"Cache/session"| Redis["Redis"]
  BE -->|"Persistence"| Postgres["PostgreSQL"]

  ArchSvc -->|"Reads graph + analysis assets"| ContractsArtifacts["widgetdc-contracts\narch/* artifacts"]
  ArchSvc -->|"Git metadata"| GitHub["GitHub APIs"]
```

## 4) Notes for Current State

- Canonical cross-service types are maintained in `widgetdc-contracts`.
- Backend remains the main integration point for frontend, OpenClaw, and RLM workflows.
- Arch MCP service acts as architecture observability/control-plane visualization across repos.
- OpenClaw operates as an external automation layer and should keep output contracts explicit.
