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

## Wire Format

All contracts use **snake_case** JSON on the wire, matching the existing RLM Engine production API.

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run schemas      # Generate JSON Schema files
npm run test         # Run validation tests
npm run validate     # Verify schemas match source
npm run python       # Generate Python models (requires datamodel-code-generator)
```

## Adding a new type

1. Add TypeBox schema in `src/<module>/` with `$id` property
2. Export from module `index.ts`
3. Run `npm run generate` to rebuild schemas
4. Run `npm test` to validate
5. Commit both source and generated files
