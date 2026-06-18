# LIN-1911 Promotion Protocol — canonical 6-step runbook

> **Status:** Runtime-verified canonical protocol, deployed and validated 2026-06-08.
> Every `production_write` MCP tool MUST use this path. No exceptions.
>
> **Read this BEFORE invoking any tool with `risk_level: production_write`.**

---

## Why this protocol exists

The platform's universal governance gate (`apps/backend/src/mcp/gateway/governanceGateway.ts`) blocks all `production_write` tool calls that don't carry a valid `plan_id` AND an approved approval-token bound to the same `(tool, plan)` tuple. The block is correct — it's how PR #6126 (LIN-1910) closed the GOV-7 trust-on-assertion vulnerability where callers could fabricate `_plan`/`_approval` envelopes.

Pre-LIN-1911, the only known path to satisfy the gate was to mint a HyperAgent plan in the orchestrator AND have its approval visible to backend's approval-store. The two stores didn't sync (LIN-1914), so the protocol failed end-to-end. LIN-1911 closed that gap.

This document is the runbook for the path that now works.

---

## The 6 steps

### Step 1 — Create the HyperAgent plan

```bash
curl -X POST "$BACKEND_URL/api/mrp/hyperagent/create-plan" \
  -H "Authorization: Bearer $WIDGETDC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "<concrete intent>",
    "domain": "<governance-* | engineering-* | data-* etc>",
    "policy_profile": "production_write",
    "estimated_writes": true,
    "correlation_id": "<unique-id-for-this-flow>",
    "steps": [{
      "name": "<step description>",
      "tool": "<exact tool name e.g. graph.promote_phantom_bom_run>",
      "payload": {"tenant_id": "widgetdc-internal"}
    }]
  }'
```

**Response:** `{ "ok": true, "plan_id": "hyp-<uuid>", "status": "approved" }`. Capture `plan_id`.

> Note: `status: "approved"` here means the **plan** is approved by policy — the **execution** still needs operator approval (Step 3).

### Step 2 — Mint the approval-request

Via MCP:

```typescript
wonder.hyperagent.approval_request_create({
  plan_id: "<from step 1>",
  actor_id: "operator:<your-name>",
  tenant_id: "widgetdc-internal",
  risk_level: "production_write",
  target_tool: "<exact tool name>",
  target_action: "<short action description>",
  correlation_id: "<same as step 1>",
  workflow_id: "<flow-tracking-id>",
  description: "<human-readable why operator should approve>",
  expires_in_seconds: 3600,
  server_nonce: "nonce-<unique-id>"
})
```

**Response:** `{ "approval": { "id": "approval_<timestamp>_<random>", "status": "pending" } }`. Capture `approval.id`.

EventSpine event `review_requested` persists.

### Step 3 — Operator approves

**Via Dashboard** (recommended for human flows):
1. Open https://widgetdc-gemini-frontend-production.up.railway.app/dashboard
2. Backend tab → pending request visible with `target_tool`, `actor_id`, `description`
3. Click Approve

**Via direct API** (for CI/agent flows, requires authenticated key):
```bash
curl -X POST "$BACKEND_URL/api/approvals/<approval_id>/approve" \
  -H "Authorization: Bearer $WIDGETDC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"approvedBy": "operator:<your-name>"}'
```

**Response:** `{ "success": true, "request": { "status": "approved" } }`.

### Step 4 — Execute the target tool with `plan_id` in payload

This is the critical part. The tool must receive `plan_id` in its payload — the universal gate auto-resolves the approval via `metadata.target_tool` ↔ `request.operation` matching (PR #6132 + #6134).

```typescript
// Via MCP (preferred when tool is registered in MCP catalog)
<exact_tool_name>({
  plan_id: "<from step 1>",
  // ...tool-specific payload
})
```

```bash
# Via HTTP route (fallback or when MCP schema lacks plan_id field)
curl -X POST "$BACKEND_URL/api/mcp/route" \
  -H "Authorization: Bearer $WIDGETDC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "<exact tool name>",
    "payload": {
      "plan_id": "<from step 1>",
      ...tool-specific fields
    }
  }'
```

**Response:** `{ "success": true, "result": { ..., "event_id": "spine-<timestamp>-<hash>" } }`.

### Step 5 — Verify in target store (R15.5b mandate)

**`tool-success ≠ persistence`.** The tool returning success does NOT prove the canonical store (AuraDB) was mutated. Several write paths return success-shaped responses from secondary stores (Postgres bi-temporal, Redis cache, local fallback) while AuraDB received nothing.

Mandatory read-back:

```typescript
data_graph_read({
  query: `
    MATCH (n {<id-field>: $id})
    RETURN n.<property>, n.<property2>
  `,
  params: { id: "<the id you wrote>" }
})
```

OR

```typescript
eventspine.replay({ correlation_id: "<from step 1>" })
```

If read-back returns 0 results: the write **did not persist**. Do not claim success.

### Step 6 — (Optional) Bind to claim

If this mutation provides evidence for a graduable claim, register the evidence:

```typescript
claims.register({
  plan_id: "<from step 1>",  // gate requires plan_id even on register
  claim_id: "claim:<your-claim>",
  title: "<claim title>",
  target_level: "L1",
  evidence_ref: "evidence:<unique-ref>",
  evidence_refs: ["<eventspine event_id>", "<other-refs>"],
  hold_reason: "<why this stays HOLD until further evidence>",
  target_deployed_sha: "<current backend SHA>",
  claim_boundary: "<scope>",
  tenant_id: "tenant:widgetdc-internal",
  correlation_id: "<from step 1>"
})
```

---

## Runtime-verified usages (as of 2026-06-08)

| Tool | Used in | Result |
|---|---|---|
| `graph.promote_phantom_bom_run` | LIN-1911 A3 keystone | ✅ AuraDB promote |
| `graph.promote_adoption_repo` × 8 | B12 seed-adoption-repos.mjs | ✅ 8 :AdoptionRepo nodes |
| `claims.register` | LIN-1915 acceptance #1 | ✅ claim:agent-adoption-contract-v1 L1/HOLD |
| Post-merge claim hardening canary | Codex PR #6143 | ✅ first GREEN canary post-modernization |

---

## When it fails

| Error code | Meaning | Fix |
|---|---|---|
| `PLAN_REQUIRED` | No `plan_id` in payload, OR plan not found | Run Step 1 first, include `plan_id` in tool call |
| `APPROVAL_REQUIRED` | `plan_id` valid but no approval bound | Run Step 2 + Step 3 |
| `APPROVAL_EXPIRED` | Approval TTL passed | Re-run from Step 2 with longer `expires_in_seconds` |
| `NOT_PENDING` (404 backend) | Approval already approved/rejected | Check status with `GET /api/approvals/<id>` — may already be ready |
| `tool_error` (opaque) | BOM/state precondition not met | Check tool's pre-state requirements (e.g. `decision_bom_pipeline` first for BOM promotion) |

---

## Cross-references

- **WidgeTDC PR #6131** — vault seed for `APPROVAL_WEBHOOK_SECRET` (HMAC)
- **WidgeTDC PR #6132** — backend `resolveApprovalByPlanId` auto-resolve
- **WidgeTDC PR #6134** — match on `metadata.target_tool` / `metadata.tool_name` / `request.operation`
- **WidgeTDC PR #6144** — B18.1+B18.2 streamable emit + session-key (telemetry observability)
- **WidgeTDC PR #6151** — Issue #14 NOT_PENDING/NOT_FOUND structured errors
- **widgetdc-orchestrator PR #426** — sync plan-store auto-approvals into approval-store (LIN-1914)
- **widgetdc-orchestrator PR #427** — seed approval-store for MCP-driven write plans (LIN-1914 round 2)
- **WidgetDC-Gemini-App PR #10** — Dashboard ApprovalQueuePanel (Backend + Orchestrator tabs)
- **WidgetDC-Gemini-App PR #20** — frontend NOT_PENDING/NOT_FOUND handling (Issue #14 frontend)
- **CLAUDE.md R15.5b** — tool-success ≠ persistence (the rule that mandates Step 5)
- **CLAUDE.md R23** — LIN-1911 protocol mandatory for production_write (this document)
- **docs/governance/B20-ADOPTION-PROMOTION-RULE.md** — when adoption claims can promote L0/L1/L2/L3
- **docs/governance/PATTERN_LIBRARY.md** Pattern #1 — Runtime Truth Verification (R15.5b operationalized)

---

## Hash pin

This file is the canonical promotion runbook. B13's agent-instruction parity CI gate enforces hash-equality of this file across all 8 repos (WidgeTDC, widgetdc-orchestrator, widgetdc-rlm-engine, widgetdc-contracts, widgetdc-openclaw, widgetdc-librechat, Obsidian, widgetdc-canvas). Drift fails CI, not review-comment.

Use `scripts/sync-governance-to-sibling-repos.mjs` to propagate changes after editing this file.
