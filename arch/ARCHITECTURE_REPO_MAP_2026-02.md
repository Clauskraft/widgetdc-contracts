# WidgeTDC Ecosystem Architecture (2026-02)

Technical architecture map for the WidgeTDC Autonomous Consulting Intelligence Platform.

## Diagram

```mermaid
flowchart TB
  subgraph repos["Repositories"]
    Backend["WidgeTDC\n(backend)"]
    Frontend["widgetdc-consulting-frontend\n(frontend)"]
    RLM["widgetdc-rlm-engine\n(rlm)"]
    Contracts["widgetdc-contracts\n(contracts)"]
    Automation["openclaw-railway-template\n(automation)"]
    Arch["arch-mcp-server-production\n(arch)"]
  end

  subgraph infra["Infrastructure"]
    Neo4j["Neo4j AuraDB"]
    Railway["Railway"]
    GitHub["GitHub"]
    Slack["Slack / OpenClaw cron"]
  end

  Backend -->|"imports @widgetdc/contracts"| Contracts
  Frontend -->|"imports @widgetdc/contracts"| Contracts
  RLM -->|"Python models"| Contracts
  Arch -->|"scripts/arch-mcp-server.ts\nplatform-graph.json"| Contracts

  Frontend -->|"HTTP API + SSE"| Backend
  Automation -->|"MCP tool calls"| Backend
  Backend -->|"CognitiveRequest"| RLM
  Backend -->|"Cypher"| Neo4j

  Arch -->|"GitHub API"| GitHub
  Slack -->|"cron triggers"| Automation

  Backend -.->|"deploy"| Railway
  RLM -.->|"deploy"| Railway
  Arch -.->|"deploy"| Railway
  Automation -.->|"deploy"| Railway
```

## Contract Boundaries

| Contract | Usage |
|----------|-------|
| `ApiResponse` | All HTTP responses (success/error envelope) |
| `CognitiveRequest` / `CognitiveResponse` | Backend ↔ RLM reasoning |
| `HealthPulse` | Health checks across services |

## Primary API Paths

| Path | Service | Purpose |
|------|---------|---------|
| `/api/mcp/route` | Backend | MCP tool routing (OpenClaw, agents) |
| `/api/contracts` | Backend | Runtime contract catalog |
| `/api/analysis` | arch-mcp-server | Architecture analysis |
| `/api/changelog` | arch-mcp-server | GitHub commits |
| `/api/branches` | arch-mcp-server | PRs & unmerged branches |

## Operational Notes

- **Backend + RLM**: Railway only — never run locally
- **Contracts**: Single source of truth; consumers pin `@widgetdc/contracts` v0.2.0
- **OpenClaw automation**: Cron-driven via Slack; policy in `cron-routing.profile.json`
