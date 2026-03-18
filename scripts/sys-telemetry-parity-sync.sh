#!/usr/bin/env bash
set -euo pipefail

# system-telemetry-parity-sync.sh
# Canonical parity pass for orchestrator telemetry.
# It never injects synthetic wins/fails or trust "jitter".
# It only normalizes real telemetry lines into the canonical TelemetryEntry shape.

WORKSPACE_DIR="${1:-.}"
TELEMETRY_FILE="${WORKSPACE_DIR}/.octo/provider-telemetry.jsonl"
TMP_FILE="${TELEMETRY_FILE}.tmp"
MAX_ENTRIES="${MAX_ENTRIES:-500}"

mkdir -p "$(dirname "$TELEMETRY_FILE")"

log_sync() {
  echo "[sys-sync] $(date +'%H:%M:%S') - $1"
}

normalize_line() {
  local line="$1"
  python - "$line" <<'PY'
import json
import sys
from datetime import datetime, timezone

raw = sys.argv[1]
try:
    payload = json.loads(raw)
except Exception:
    sys.exit(1)

persona = str(payload.get("agent_persona") or payload.get("agent") or "ANALYST").upper()
task_domain = str(payload.get("task_domain") or payload.get("task_type") or "routing").lower()
phase = str(payload.get("phase") or "observe").lower()
outcome = str(payload.get("outcome") or "warning").lower()
scope_owner = str(payload.get("scope_owner") or "widgetdc-orchestrator")
duration = payload.get("duration_ms") or 0
timestamp = payload.get("timestamp")

if not timestamp:
    timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

normalized = {
    "timestamp": timestamp,
    "scope_owner": scope_owner,
    "agent_persona": persona,
    "runtime_identity": payload.get("runtime_identity"),
    "provider_source": payload.get("provider_source") or payload.get("provider"),
    "task_domain": task_domain,
    "capability": payload.get("capability"),
    "phase": phase,
    "outcome": outcome,
    "duration_ms": int(duration),
    "evidence_source": payload.get("evidence_source") or "monitoring_audit_log",
    "trace_id": payload.get("trace_id"),
}

if payload.get("metadata") and isinstance(payload["metadata"], dict):
    normalized["metadata"] = payload["metadata"]

print(json.dumps({k: v for k, v in normalized.items() if v is not None}, separators=(",", ":")))
PY
}

if [[ ! -f "$TELEMETRY_FILE" ]]; then
  log_sync "No telemetry file found. Nothing to normalize."
  exit 0
fi

log_sync "Normalizing telemetry entries in ${TELEMETRY_FILE}"
> "$TMP_FILE"

while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  if normalized="$(normalize_line "$line" 2>/dev/null)"; then
    printf '%s\n' "$normalized" >> "$TMP_FILE"
  else
    log_sync "Skipping invalid telemetry line"
  fi
done < "$TELEMETRY_FILE"

count=$(wc -l < "$TMP_FILE" | tr -d ' ')

if [[ "$count" -gt "$MAX_ENTRIES" ]]; then
  tail -n "$MAX_ENTRIES" "$TMP_FILE" > "${TMP_FILE}.cap"
  mv "${TMP_FILE}.cap" "$TMP_FILE"
  log_sync "Applied ${MAX_ENTRIES}-entry cap"
fi

mv "$TMP_FILE" "$TELEMETRY_FILE"
log_sync "Parity sync complete. No synthetic trust adjustment was applied."
