# Governance Reference

This repository follows the cross-repo governance baseline defined in [WidgeTDC](https://github.com/Clauskraft/WidgeTDC).

## Canonical Sources (DO NOT DUPLICATE — reference only)

- `GLOBAL_AGENT_GOVERNANCE.md` → [WidgeTDC/GLOBAL_AGENT_GOVERNANCE.md](https://github.com/Clauskraft/WidgeTDC/blob/main/GLOBAL_AGENT_GOVERNANCE.md)
- `GLOBAL_AGENT_EXECUTION_POLICY.md` → [WidgeTDC/GLOBAL_AGENT_EXECUTION_POLICY.md](https://github.com/Clauskraft/WidgeTDC/blob/main/GLOBAL_AGENT_EXECUTION_POLICY.md)
- `MASTER_POLICY.md` → [WidgeTDC/MASTER_POLICY.md](https://github.com/Clauskraft/WidgeTDC/blob/main/MASTER_POLICY.md)

## Why References, Not Copies

Copies drift. When governance rules change in WidgeTDC, copies in satellite repos become stale. This file points to the canonical source so agents always read the latest version.

## Sync Verification

WidgeTDC CI runs `scripts/sync_agent_governance.py` to verify cross-repo alignment.

