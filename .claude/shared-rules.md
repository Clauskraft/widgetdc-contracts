<!-- SHARED RULES — Auto-synced to all satellite repos via .github/workflows/sync-claude-rules.yml -->
<!-- DO NOT edit this section in satellite repos — changes will be overwritten -->
<!-- Last synced: auto -->

## Autonomi

Når brugeren skriver "100% autonomt" kører agenten **fuldstændigt autonomt** indtil opgaven er udført. Ingen bekræftelser, ingen spørgsmål, ingen pauser. Agenten planlægger, implementerer, tester og verificerer selv. Eneste undtagelse: destruktive git-operationer (force push, reset --hard).

## Shared Rules (synced from WidgeTDC)

8. **MCP route format** — `{"tool":"name","payload":{...}}` — ALDRIG `args`, altid `payload`
9. **Read before write** — ALDRIG opret nye filer under `services/`, `routes/`, `middleware/`, `src/` uden først at læse mindst 2 eksisterende filer i samme mappe
10. **Plan before multi-file changes** — Brug Plan mode før tasks der berører >3 filer
11. **Lesson check at boot** — Kald `audit.lessons` med agentId ved session start. Acknowledge med `audit.acknowledge`.
12. **Contracts** — Cross-service types importeres fra `@widgetdc/contracts`. Wire format: snake_case JSON med `$id`.
13. **Backlog discipline** — intet arbejde uden backlog-item, repo-target, ansvarlig agent, verification path og naeste handling
14. **No false completion** — intet er done uden commit/push/runtime-opfoelgning naar relevant
15. **Repo-local execution** — arbejd i den repo/worktree hvor backlog-item og kode faktisk lever
16. **Direct communication** — agenter kommunikerer direkte; ingen redundante godkendelsesloops inde i godkendt scope

## Agent Compliance (synced from WidgeTDC)

### DO's
- `Authorization: Bearer ${API_KEY}` on all backend calls
- Parameterized Cypher (never string interpolation)
- Production URLs only (backend-production-d3da, rlm-engine-production, AuraDB)
- `[Source: CODE-ID]` citations for StrategicInsight references
- `audit.lessons` before starting a mission
- `audit.run` after major code generation
- Verify every action with read-back, test, or render check
- Clean git state at session end

### DON'Ts
- Call backend without auth header
- Use `require()` — ESM only
- Write to local Neo4j — AuraDB only
- Ignore lessons from `audit.lessons`
- Write >50 lines custom logic when a package solves it
- End a session with unresolved failures or uncommitted changes

## Handover Protocol (MANDATORY — ALL agents, ALL repos)

**Kanonisk source hierarchy:**
- `Linear` er operativ koordineringskilde.
- `config/*.json` er machine policy truth.
- `docs/*.md` er menneskeligt forklaringslag.
- `docs/HANDOVER_LOG.md` er arkiv og indeks, ikke live koordineringskilde.

**Regler:**
1. **Koordiner i Linear foer arbejde** — opret eller opdater issue-status foer implementation.
2. **Status-opdatering** — brug Linear til aktiv status, blockers og afslutning.
3. **Check foer user-kontakt** — verificer i Linear at der ikke er nye blockers eller afhængigheder.
4. **Brug HANDOVER_LOG som arkiv** — laes det for historik eller indeks, ikke som live task board.
5. **Afvent alle agenter** — Start ikke implementation foer afhaengige agenter har responderet.
6. **Blokeringer eskaleres straks** — Skriv `BLOCKED:` med aarsag og workaround i Linear.
7. **Ingen utydelige tasks** — hvert arbejde skal have ejer, repo, scope, verification path og naeste handling.
8. **Ingen skjulte afhaengigheder** — dependencies skal navngives eksplicit foer arbejde starter.
9. **Ingen falsk completion** — intet arbejde er afsluttet uden dokumenteret leverance og opfoelgning.

**Lifecycle:** `CREATED -> ACKNOWLEDGED -> IN_PROGRESS -> COMPLETED -> VERIFIED`

**Aktive agenter:**

| Agent | Rolle | Instruktionsfil |
|-------|-------|----------------|
| Claude | Orchestrator / Omega Sentinel | `CLAUDE.md` |
| Gemini | The Architect | `GEMINI.md` |
| DeepSeek | Code Surgeon | `DEEPSEEK.md` |
| Codex | Graph Expert | `CODEX.md` |

**Noegle-dokumenter:**
- Operativ koordinering: `Linear`
- Handover arkiv/index: `docs/HANDOVER_LOG.md`
- Arkitektur alignment: `docs/ARCHITECTURE_ALIGNMENT.md`
- Neo Aura masterplan: `NEO_AURA_MASTERPLAN.md`
- Governance bundle: `MASTER_POLICY.md` + `config/*.json`

## Cross-Repo Sync

| Layer | Owner | Governs |
|-------|-------|---------|
| **Neo4j AuraDB** | Master data | Agent, Lesson, FailureMemory, StrategicInsight nodes |
| **widgetdc-contracts** | Type contracts | JSON schemas, wire format, `$id` + `snake_case` |
| **CLAUDE.md (each repo)** | Claude agent rules | Boot-time rules synced FROM shared-rules.md |
| **GEMINI.md (each repo)** | Gemini agent rules | Architecture, Neo Aura, algorithm design |
| **DEEPSEEK.md (each repo)** | DeepSeek agent rules | Code fixes, Python, test coverage |
| **CODEX.md (each repo)** | Codex agent rules | Implementation, feature building |
| **Linear** | Coordination | Operational source of truth for active work |
| **HANDOVER_LOG.md** | Archive | Historical handovers and index |

```
POST https://backend-production-d3da.up.railway.app/api/mcp/route
{"tool":"audit.lessons","payload":{"agentId":"YOUR_AGENT_ID"}}
```
