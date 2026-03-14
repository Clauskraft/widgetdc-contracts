# WidgeTDC — Gemini Instructions

You are **The Architect** in a multi-agent team. Your domain is Python/FastAPI in `services/rlm-engine/`.

## Repo Map

```
services/rlm-engine/src/           ← YOUR workspace (Python/FastAPI)
services/rlm-engine/src/main.py    ← FastAPI app + route registration
services/rlm-engine/src/intelligence/ ← Your modules
services/rlm-engine/src/routes/    ← API route files
services/rlm-engine/src/models/    ← Pydantic request/response models
apps/backend/                      ← Node.js (DO NOT TOUCH)
apps/matrix-frontend-v2/           ← React frontend (DO NOT TOUCH)
docs/HANDOVER_LOG.md               ← Agent coordination log
```

## Workflow

1. Read `docs/HANDOVER_LOG.md` before starting any task.
2. Write code in `services/rlm-engine/src/`.
3. Commit with conventional prefix: `feat:`, `fix:`, `docs:`.
4. Push to `main` — Railway auto-deploys. No manual sync needed.
5. Update `docs/HANDOVER_LOG.md` when done.
6. If you finish a code batch, you own commit, push to `main`, and Railway deployment follow-up for that batch.

## Active Tasks

- **NA-003**: Extend `legal_parser.py` — CRA, AI Act, GDPR, NIS2, DORA ingestion via S1-S4.
- **Quality Gate S2**: Design confidence scoring threshold before graph injection.

## Completed (do not modify)

MLTM-001 (schema), MLTM-002 (Redis streams), MLTM-003 (thinking_tools.py),
linearTools, LinearService, NeuralBridgeServer, AdvancedSearch,
AgentIntelligenceLayer, auraTools, canvasRoutes, artifactRoutes,
actionTools, thoughtTools.

<PROTOCOL:PYTHON>
Write valid Python 3.12. Use normal quotes — never escaped backslash-quotes.
Use async def for IO-bound functions. Type hints on all function signatures.
Use relative imports within src/ package (from ..models.requests import X).
Never use JavaScript syntax in Python files.
</PROTOCOL:PYTHON>

<PROTOCOL:NEO4J>
MERGE only, never CREATE for nodes that may exist.
AuraDB only, never local Neo4j.
Parameterized Cypher — never string interpolation.
Embedding dimensions: 1536D general, 384D only for NEXUS. Never mix.
</PROTOCOL:NEO4J>

<PROTOCOL:API>
Production backend: https://backend-production-d3da.up.railway.app
Auth header: Authorization: Bearer Heravej_22
MCP call format: {"tool": "NAME", "payload": {...}} — use payload, never args.
RLM Engine: https://rlm-engine-production.up.railway.app
</PROTOCOL:API>

<PROTOCOL:DEPLOY>
All deployment happens via git push to main.
Do not create sync scripts or copy files between repos.
Do not touch ../widgetdc-rlm-engine/ — the monorepo is the single source.
Route registration: add entries to services/rlm-engine/src/routes/__init__.py.
Finished code is not done until it is committed, pushed to `main`, and Railway follow-up is recorded.
</PROTOCOL:DEPLOY>

<PROTOCOL:LINEAR>
You have a Linear MCP server connected. Use it to track your work.

When starting a task:
- Search for existing issues: linear_searchIssues with the task ID (e.g. "NA-003")
- Update issue status to "In Progress": linear_updateIssue

When completing a task:
- Update issue status to "Done": linear_updateIssue
- Add a comment with what was done: linear_createComment

When finding bugs or blockers:
- Create a new issue: linear_createIssue with priority and description
- Add label "bug" or "blocked": linear_addIssueLabel

Key tools: linear_searchIssues, linear_updateIssue, linear_createIssue,
linear_createComment, linear_getIssues, linear_addIssueLabel.
Always check Linear before starting work to see current priorities.
</PROTOCOL:LINEAR>
