# @widgetdc/contracts

Shared type contracts for the WidgeTDC Autonomous Consulting Intelligence Platform.

**Single source of truth** for types used across:
- `WidgeTDC_fresh` (Node/Express backend)
- `widgetdc-rlm-engine` (Python/FastAPI intelligence engine)
- `widgetdc-consulting-frontend` (React/Vite UI)

## Quick Start

### TypeScript (Backend / Frontend)

```bash
npm install @widgetdc/contracts
# or during development:
npm install ../widgetdc-contracts
```

```typescript
import { CognitiveRequest, CognitiveResponse } from '@widgetdc/contracts/cognitive'
import { HealthPulse } from '@widgetdc/contracts/health'
import { DomainId } from '@widgetdc/contracts/consulting'
import { AgentTier } from '@widgetdc/contracts/agent'
import { NodeLabel } from '@widgetdc/contracts/graph'
import { Value } from '@sinclair/typebox/value'

// Runtime validation
if (Value.Check(CognitiveRequest, payload)) {
  // payload is typed as CognitiveRequest
}
```

### Python (RLM Engine)

Copy or symlink `python/widgetdc_contracts/` into your project:

```python
from widgetdc_contracts.cognitive import CognitiveRequest, CognitiveResponse

req = CognitiveRequest(
    task="Analyze market positioning",
    context={"domain": "strategy_corp"},
    reasoning_mode="deep",
)
print(req.model_dump_json())
```

### JSON Schema (Any consumer)

Schemas are in `schemas/` — standard JSON Schema draft 2020-12:

```bash
ls schemas/cognitive/
# CognitiveRequest.json  CognitiveResponse.json  IntelligenceEvent.json  ...
```

## Modules

| Import path | Types | Used by |
|-------------|-------|---------|
| `@widgetdc/contracts/cognitive` | CognitiveRequest, CognitiveResponse, IntelligenceEvent | Backend ↔ RLM |
| `@widgetdc/contracts/health` | HealthPulse, HealthStatus, DomainProfile | All services |
| `@widgetdc/contracts/http` | ApiResponse, ApiError, PaginatedResponse | All services |
| `@widgetdc/contracts/consulting` | DomainId, ProcessStatus, DOMAIN_SHORT_IDS | All services |
| `@widgetdc/contracts/agent` | AgentTier, AgentPersona, SignalType | All services |
| `@widgetdc/contracts/graph` | NodeLabel, RelationshipType | All services |
| `@widgetdc/contracts/orchestrator` | OrchestratorToolCall, OrchestratorToolResult, AgentMessage, AgentHandshake | Orchestrator ↔ All agents |
| `@widgetdc/contracts/adoption` | **AgentAdoptionContract (B11)**, NotebookSpec, AnalysisArtifact, RewardEntry, RolloutEntry | Adoption ladder B11-B20 |

### `AgentAdoptionContract` (B11) — canonical adoption contract

`agent-adoption-contract.v1` is the single machine-readable artefact every agent on every bridge in the 7-repo platform must satisfy. It is the foundation for the adoption ladder:

| Step | Purpose |
|------|---------|
| **B11** | This schema — canonical contract |
| B12 | Repo MERGE nodes (Neo4j `AdoptionRepo` + `AdoptionAgent` + `ADOPTS` edge) |
| B13 | CI parity gate — rejects PRs whose manifest hash does not validate |
| B15 | Runtime conformance probe — `runtime_probe_fn` executes against each bridge |
| B18 | Telemetry — EventSpine emits `telemetry_key` on every adoption tick |
| B19 | Adoption dashboard |
| B20 | L1 → L2 → L3 promotion rule |

```typescript
import {
  AgentAdoptionContract,
  computeContractHash,
  verifyContractHash,
} from '@widgetdc/contracts/adoption'
import { Value } from '@sinclair/typebox/value'

const base = {
  contract_version: 'v1' as const,
  repo: 'WidgeTDC',
  agent: 'claude-code',
  bridge: 'http-mcp-route',
  required_tools: ['intent_detect', 'srag.query', 'reason_deeply'],
  startup_chain: {
    intent_detect: { required: true, min_confidence: 0.6 },
    rag_query: { tool: 'srag.query' as const, required: true },
    reason: { tool: 'reason_deeply' as const, required: true },
  },
  read_only_write_policy: {
    default_risk: 'staged_write' as const,
    write_requires: { plan: true, approval: true, signature: true },
  },
  telemetry_key: 'adoption.event.v1',
  runtime_probe_fn: 'adoption.conformance.v1',
  created_at: new Date().toISOString(),
}
const manifest = { ...base, hash: computeContractHash(base) }

Value.Check(AgentAdoptionContract, manifest) // true
verifyContractHash(manifest)                  // true
```

The `hash` field is sha256 over a stable-stringified copy of the manifest with `hash=""` (no self-reference). Manifest instances live in their own repos (e.g. `WidgeTDC/.adoption-manifest.yaml`).

## Wire Format

All contracts use **snake_case** JSON on the wire, matching the existing RLM Engine production API.

**Full wire format rules**: [`WIRE_FORMAT.md`](./WIRE_FORMAT.md) — includes `$id` requirements, snake_case enforcement, version pinning rules, and violation codes.

Key rules at a glance:
- All payloads crossing service boundaries **MUST** include `$id`
- Property names **MUST** use `snake_case` (never camelCase)
- See `ARCHITECTURE.md Section 9` in the WidgeTDC monorepo for architecture reference

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run schemas      # Generate JSON Schema files
npm run test         # Run validation tests
npm run validate     # Verify schemas match source
npm run python       # Generate Python models (requires datamodel-code-generator)
```

## Architecture

- [Ecosystem architecture map (2026-02)](arch/ARCHITECTURE_REPO_MAP_2026-02.md) — repos, services, contracts, API paths

## Adding a new type

1. Add TypeBox schema in `src/<module>/` with `$id` property
2. Export from module `index.ts`
3. Run `npm run generate` to rebuild schemas
4. Run `npm test` to validate
5. Commit both source and generated files
