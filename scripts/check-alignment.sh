#!/usr/bin/env bash
# check-alignment.sh — Verify all consumer repos are aligned with canonical contracts version
#
# Run from contracts repo:
#   bash scripts/check-alignment.sh
#
# Checks all consumers:
#   1. WidgeTDC (backend monorepo)  — package.json git ref tag
#   2. widgetdc-consulting-frontend — package.json git ref tag (if present)
#   3. widgetdc-rlm-engine         — pyproject.toml git ref tag
#
# Exit codes:
#   0 = all aligned
#   1 = drift detected (prints remediation)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CANONICAL_DIR="$(dirname "$SCRIPT_DIR")"
PARENT_DIR="$(dirname "$CANONICAL_DIR")"

# Read canonical version using a helper script file (avoids heredoc path mangling on Windows)
CANONICAL_VERSION=$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync(require('path').resolve(process.argv[1],'package.json'),'utf8')).version)" "$CANONICAL_DIR")

echo "═══════════════════════════════════════════════════════════"
echo "  @widgetdc/contracts — Cross-Repo Version Alignment Check"
echo "  Canonical version: v${CANONICAL_VERSION}"
echo "═══════════════════════════════════════════════════════════"
echo ""

DRIFT=0

# ─── Helper: check a Node.js consumer ───────────────────────────
check_node_consumer() {
  local name="$1"
  local dir="$2"
  local pkg_json="$dir/package.json"

  if [ ! -f "$pkg_json" ]; then
    echo "SKIP: $name — $pkg_json not found"
    return
  fi

  # Extract the version tag from the contracts dependency (handles git+https: and github: formats)
  local pinned
  pinned=$(node -e "
    const p = require('path');
    const pkg = JSON.parse(require('fs').readFileSync(p.resolve(process.argv[1], 'package.json'), 'utf8'));
    const dep = (pkg.dependencies || {})['@widgetdc/contracts'] || '';
    const m = dep.match(/#v([\d.]+)/);
    process.stdout.write(m ? m[1] : 'UNKNOWN');
  " "$dir" 2>/dev/null || echo "ERROR")

  if [ "$pinned" = "$CANONICAL_VERSION" ]; then
    echo "OK:   $name — pinned to v${pinned}"
  elif [ "$pinned" = "UNKNOWN" ]; then
    echo "WARN: $name — @widgetdc/contracts not found in dependencies (may use local path)"
    # Not marking as DRIFT — local path resolution is valid in development
  elif [ "$pinned" = "ERROR" ]; then
    echo "WARN: $name — could not parse package.json"
    DRIFT=1
  else
    echo "DRIFT: $name — pinned to v${pinned}, canonical is v${CANONICAL_VERSION}"
    echo "       Fix: cd $dir && npm install '@widgetdc/contracts@git+https://github.com/Clauskraft/widgetdc-contracts.git#v${CANONICAL_VERSION}'"
    DRIFT=1
  fi
}

# ─── Helper: check the Python consumer (RLM engine) ────────────
check_python_consumer() {
  local name="$1"
  local dir="$2"
  local pyproject="$dir/pyproject.toml"

  if [ ! -f "$pyproject" ]; then
    echo "SKIP: $name — $pyproject not found"
    return
  fi

  # Extract tag = "vX.Y.Z" form used by uv/poetry git deps
  local pinned
  pinned=$(node -e "
    const content = require('fs').readFileSync(require('path').resolve(process.argv[1], 'pyproject.toml'), 'utf8');
    // Match tag = \"vX.Y.Z\" form
    const m = content.match(/widgetdc-contracts[^}]*tag\s*=\s*\"(v?[\w.]+)\"/);
    if (m) {
      const v = m[1].replace(/^v/, '');
      const isFloating = v === 'master' || v === 'main';
      process.stdout.write(isFloating ? 'FLOATING:' + m[1] : v);
    } else {
      // Also try @vX.Y.Z# form (git+ URL style)
      const m2 = content.match(/widgetdc-contracts.*@(v?[\w.]+)#/);
      if (m2) {
        const v = m2[1].replace(/^v/, '');
        process.stdout.write(v === 'master' || v === 'main' ? 'FLOATING:' + m2[1] : v);
      } else {
        process.stdout.write('UNKNOWN');
      }
    }
  " "$dir" 2>/dev/null || echo "ERROR")

  if [ "$pinned" = "$CANONICAL_VERSION" ]; then
    echo "OK:   $name — pinned to v${pinned}"
  elif [[ "$pinned" == FLOATING:* ]]; then
    local branch="${pinned#FLOATING:}"
    echo "DRIFT: $name — pinned to @${branch} (floating), canonical is v${CANONICAL_VERSION}"
    echo "       Fix: Change tag = \"${branch}\" to tag = \"v${CANONICAL_VERSION}\" in $pyproject"
    DRIFT=1
  elif [ "$pinned" = "UNKNOWN" ]; then
    echo "WARN: $name — widgetdc-contracts not found in pyproject.toml"
    DRIFT=1
  elif [ "$pinned" = "ERROR" ]; then
    echo "WARN: $name — could not parse pyproject.toml"
    DRIFT=1
  else
    echo "DRIFT: $name — pinned to v${pinned}, canonical is v${CANONICAL_VERSION}"
    echo "       Fix: Change tag = \"v${pinned}\" to tag = \"v${CANONICAL_VERSION}\" in $pyproject"
    DRIFT=1
  fi
}

# ─── Run checks ────────────────────────────────────────────────

# Backend (monorepo — try both WidgeTDC and WidgeTDC_fresh)
if [ -d "$PARENT_DIR/WidgeTDC" ]; then
  check_node_consumer "WidgeTDC Backend" "$PARENT_DIR/WidgeTDC"
elif [ -d "$PARENT_DIR/WidgeTDC_fresh" ]; then
  check_node_consumer "WidgeTDC Backend" "$PARENT_DIR/WidgeTDC_fresh"
else
  echo "SKIP: WidgeTDC Backend — directory not found"
fi

# Consulting Frontend (optional — may not exist locally)
if [ -d "$PARENT_DIR/widgetdc-consulting-frontend" ]; then
  check_node_consumer "Consulting Frontend" "$PARENT_DIR/widgetdc-consulting-frontend"
else
  echo "SKIP: Consulting Frontend — directory not found locally"
fi

# RLM Engine (Python)
if [ -d "$PARENT_DIR/widgetdc-rlm-engine" ]; then
  check_python_consumer "RLM Engine" "$PARENT_DIR/widgetdc-rlm-engine"
else
  echo "SKIP: RLM Engine — directory not found"
fi

echo ""
if [ $DRIFT -eq 0 ]; then
  echo "All present consumers aligned with v${CANONICAL_VERSION}."
else
  echo "VERSION DRIFT DETECTED — see remediation above."
  exit 1
fi
