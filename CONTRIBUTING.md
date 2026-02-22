# Contributing to @widgetdc/contracts

This repo is the **single source of truth** for cross-service types in the WidgeTDC platform. Changes here affect 3 consumers: backend, RLM engine, and consulting frontend.

## Rules

### 1. Contracts-first development
If a type is used by more than one service, it **must** be defined here — never in a consumer repo.

### 2. Wire format is snake_case
All JSON on the wire uses `snake_case`. This matches the RLM Engine (Python/FastAPI) production API. Never change this without coordinating all 3 repos.

### 3. Additive changes only (unless major bump)
- Adding new optional fields → **patch** or **minor** bump
- Adding new types/modules → **minor** bump
- Removing/renaming fields, changing required → **major** bump (breaking)

### 4. Always regenerate
After changing any `src/` file:
```bash
npm run generate   # build + export schemas
npm run test       # verify roundtrip
npm run validate   # confirm schemas match source
```

### 5. Update CHANGELOG.md
Every PR must include a CHANGELOG entry under `[Unreleased]`.

## Adding a new type

1. Create TypeBox schema in the appropriate `src/{module}/` directory
2. Re-export from `src/{module}/index.ts`
3. Add test cases in `tests/schemas.test.ts`
4. Run `npm run generate` to produce JSON Schema + dist
5. Update CHANGELOG.md
6. Open PR with consumer impact assessment

## Adding a new module

1. Create `src/{module}/` with schema files and `index.ts`
2. Re-export from `src/index.ts`
3. Add subpath export in `package.json` under `"exports"`
4. Add test suite in `tests/schemas.test.ts`
5. Run `npm run generate`
6. Update CHANGELOG.md and README.md

## Versioning

| Change type | Version bump | Example |
|---|---|---|
| New optional field | Patch (0.1.0 → 0.1.1) | Add `metadata?` to HealthPulse |
| New type or module | Minor (0.1.0 → 0.2.0) | Add `workflow/` module |
| Remove/rename field | Major (0.1.0 → 1.0.0) | Rename `trace_id` → `correlation_id` |
| Change required fields | Major (0.1.0 → 1.0.0) | Make `reasoning` required |

## PR workflow

1. Branch from `master`: `feat/add-X` or `fix/correct-Y`
2. Make changes, run `npm run generate && npm run test && npm run validate`
3. Update CHANGELOG.md and bump version in package.json
4. Open PR — CI runs typecheck, tests, schema validation, and breaking change detection
5. Get code owner review
6. Merge to master
7. Tag release: `git tag v0.2.0 && git push --tags`
