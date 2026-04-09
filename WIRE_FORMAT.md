# Wire Format Rules — @widgetdc/contracts

**Single source of truth for all JSON wire format rules across the WidgeTDC platform.**

See also: `ARCHITECTURE.md Section 9` in the WidgeTDC monorepo for the canonical architecture reference.

---

## Rule 1: All payloads MUST include `$id`

Every JSON payload crossing a service boundary must include the `$id` field. This is enforced by TypeBox schema definitions and validated by `InsightIntegrityGuard`.

```json
{
  "$id": "CognitiveRequest",
  "task": "analyze_market_positioning",
  "reasoning_mode": "deep",
  "context": { "domain": "strategy_corp" }
}
```

**Why**: The `$id` field enables:
- Runtime contract validation via `@sinclair/typebox/value`
- Audit trail — `InsightIntegrityGuard` rejects payloads without `$id` as `CONTRACT_VIOLATION`
- Schema registry lookup — the JSON Schema draft 2020-12 `$id` is the canonical type identifier

**Enforcement**:
- TypeBox schemas MUST declare `$id` at the root: `Type.Object({ ... }, { $id: 'TypeName' })`
- CI blocks on any schema file missing `$id` (see `.github/workflows/ci.yml` — `version-tag-alignment` job)

---

## Rule 2: Wire format MUST use snake_case

All JSON property names on the wire use **snake_case**, matching the RLM Engine production Python API.

**Correct**:
```json
{
  "$id": "CognitiveResponse",
  "reasoning_trace": [...],
  "confidence_score": 0.87,
  "domain_id": "strategy_corp",
  "created_at": "2026-04-09T12:00:00Z"
}
```

**Incorrect** (camelCase — CONTRACT_VIOLATION):
```json
{
  "reasoningTrace": [...],
  "confidenceScore": 0.87,
  "domainId": "strategy_corp",
  "createdAt": "2026-04-09T12:00:00Z"
}
```

**Why**: The RLM Engine is Python/FastAPI. Python conventionally uses snake_case. Mixing casing across the backend/RLM boundary creates silent data loss when fields are dropped during deserialization.

**Enforcement**:
- All TypeBox schemas in `src/` MUST use snake_case property names
- CI detects camelCase property names in schema definitions (see `version-tag-alignment` job)
- Never change wire format without coordinating all 3 consuming repos (Backend, RLM Engine, Frontend)

---

## Rule 3: Version alignment — all consumers pin the same tag

All consumers of `@widgetdc/contracts` MUST pin the same git tag version.

| Consumer | How it pins |
|----------|-------------|
| `WidgeTDC` (backend) | `"@widgetdc/contracts": "git+https://github.com/Clauskraft/widgetdc-contracts.git#vX.Y.Z"` in package.json |
| `widgetdc-rlm-engine` (Python) | `widgetdc-contracts = { git = "...", tag = "vX.Y.Z", ... }` in pyproject.toml |
| `widgetdc-consulting-frontend` | `"@widgetdc/contracts": "git+https://github.com/Clauskraft/widgetdc-contracts.git#vX.Y.Z"` in package.json |

**Current canonical version**: see `package.json` at the root of this repo.

**Verify alignment**: `bash scripts/check-alignment.sh`

---

## Rule 4: `package.json` version MUST match the latest git tag

The `package.json` `version` field must be kept in sync with the git tag on HEAD.

```
package.json:  "version": "0.4.3"
git tag HEAD:  v0.4.3          ← must match
```

CI blocks deploy on mismatch (see `version-tag-alignment` job in `.github/workflows/ci.yml`).

---

## Violation Codes

| Code | Trigger | Severity |
|------|---------|----------|
| `CONTRACT_VIOLATION` | Missing `$id` in payload | ERROR — audit logged to Neo4j |
| `CONTRACT_VIOLATION` | camelCase property in wire payload | ERROR — audit logged to Neo4j |
| `VERSION_DRIFT` | Consumer pinned to wrong contracts version | WARNING → ERROR after 24h |
| `SCHEMA_DRIFT` | Generated schemas out of sync with source | ERROR — blocks CI |

---

## Checklist for Adding a New Contract Type

1. Create TypeBox schema in `src/<module>/` with `$id` and snake_case properties
2. Export from `src/<module>/index.ts`
3. Run `npm run generate` (build + export JSON schemas)
4. Run `npm test` — all tests must pass
5. Commit source AND generated files (`schemas/`, `python/`, `dist/`)
6. Bump `package.json` version (patch for new types, minor for new modules, major for breaking)
7. Create git tag matching the new version: `git tag v<version> && git push --tags`
8. Update CHANGELOG.md
9. Notify consuming repos to update their pinned version
