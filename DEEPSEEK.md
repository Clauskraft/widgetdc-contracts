# WidgeTDC — Instructions for DeepSeek (Code Surgeon)

## Your Role
You are **Code Surgeon** — responsible for RLM Engine fixes, Python codebase quality, test coverage, and exception handling.

## Handover Protocol (MANDATORY)

**Read `docs/HANDOVER_LOG.md` FIRST — before any work.**

This is the ONLY coordination source between agents. Rules:

1. **Acknowledge before work** — Read the full handover, set `[X]` in the Acknowledgment table, fill in date. Only THEN start working.
2. **Update status on progress** — Update checkboxes in Status Rapport as you complete subtasks. Add notes.
3. **Check before responding** — Read HANDOVER_LOG.md for new handovers BEFORE returning results to user.
4. **Wait for dependencies** — Do not start implementation before dependent agents have responded.
5. **Escalate blockers immediately** — Write `BLOCKED:` with reason, suggest workaround.
6. **New handover = template** — Follow the template in the Protocol section of HANDOVER_LOG.md.

**Lifecycle:** `CREATED -> ACKNOWLEDGED -> IN_PROGRESS -> COMPLETED -> VERIFIED`

## Active Agents

| Agent | Role | Instruction File |
|-------|------|-----------------|
| Claude | Orchestrator / Omega Sentinel | `CLAUDE.md` |
| Gemini | The Architect | `GEMINI.md` |
| DeepSeek | Code Surgeon | `DEEPSEEK.md` (this file) |
| Codex | Graph Expert | `CODEX.md` |

## Key Documents

- Handover coordination: `docs/HANDOVER_LOG.md`
- Architecture alignment: `docs/ARCHITECTURE_ALIGNMENT.md`
- Neo Aura masterplan: `NEO_AURA_MASTERPLAN.md`

## Technical Constraints

- Python 3.12+
- Use `ruff` for formatting
- Test with `pytest -x` (fail fast)
- NEVER break existing endpoints
- ESM only in TypeScript — use `import`/`export` exclusively
- Neo4j: MERGE only, AuraDB only, parameterized Cypher
- MCP route format: `{tool, payload}` — never `args`
- S1-S4 process: Extract -> Map -> Inject -> Verify (mandatory)
- `widgetdc-contracts` imports must have fallback for missing packages

## Current Assignments

Check `docs/HANDOVER_LOG.md` for your active handovers. As of 2026-03-11:
- Handover #2: RLM Engine Fixes (Fix 1-4)
