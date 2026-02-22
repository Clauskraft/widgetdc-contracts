#!/usr/bin/env bash
# check-alignment.sh — Verify all consumer repos are aligned with canonical contracts version
#
# Run from contracts repo:
#   bash scripts/check-alignment.sh
#
# Checks all 3 consumers:
#   1. WidgeTDC_fresh (backend)  — package.json git ref tag
#   2. widgetdc-consulting-frontend — package.json git ref tag
#   3. widgetdc-rlm-engine — pyproject.toml git ref tag
#
# Exit codes:
#   0 = all aligned
#   1 = drift detected (prints remediation)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CANONICAL_DIR="$(dirname "$SCRIPT_DIR")"
PARENT_DIR="$(dirname "$CANONICAL_DIR")"

CANONICAL_VERSION=$(node -e "const p=require('path'); console.log(require(p.resolve(process.argv[1],'package.json')).version)" "$CANONICAL_DIR")

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

  # Extract the version tag from the contracts dependency (handles both git+https: and github: formats)
  local pinned
  pinned=$(node -e "
    const p = require('path');
    const pkg = require(p.resolve(process.argv[1], 'package.json'));
    const dep = (pkg.dependencies || {})['@widgetdc/contracts'] || '';
    // Match #vX.Y.Z at end of git URL or github shorthand
    const m = dep.match(/#v([\\d.]+)/);
    console.log(m ? m[1] : 'UNKNOWN');
  " "$dir" 2>/dev/null || echo "ERROR")

  if [ "$pinned" = "$CANONICAL_VERSION" ]; then
    echo "OK:   $name — pinned to v${pinned}"
  elif [ "$pinned" = "UNKNOWN" ]; then
    echo "WARN: $name — @widgetdc/contracts not found in dependencies"
    DRIFT=1
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

  # Extract @vX.Y.Z or @master from the git+https URL in pyproject.toml
  local pinned
  pinned=$(node -e "
    const fs = require('fs');
    const p = require('path');
    const content = fs.readFileSync(p.resolve(process.argv[1], 'pyproject.toml'), 'utf8');
    const m = content.match(/widgetdc-contracts.*@(v?[\\w.]+)#/);
    if (m) {
      const v = m[1].replace(/^v/, '');
      console.log(v === 'master' || v === 'main' ? 'FLOATING:' + m[1] : v);
    } else {
      console.log('UNKNOWN');
    }
  " "$dir" 2>/dev/null || echo "ERROR")

  if [ "$pinned" = "$CANONICAL_VERSION" ]; then
    echo "OK:   $name — pinned to v${pinned}"
  elif [[ "$pinned" == FLOATING:* ]]; then
    local branch="${pinned#FLOATING:}"
    echo "DRIFT: $name — pinned to @${branch} (floating), canonical is v${CANONICAL_VERSION}"
    echo "       Fix: Change @${branch} to @v${CANONICAL_VERSION} in $pyproject"
    DRIFT=1
  elif [ "$pinned" = "UNKNOWN" ]; then
    echo "WARN: $name — widgetdc-contracts not found in pyproject.toml"
    DRIFT=1
  else
    echo "DRIFT: $name — pinned to v${pinned}, canonical is v${CANONICAL_VERSION}"
    echo "       Fix: Change @v${pinned} to @v${CANONICAL_VERSION} in $pyproject"
    DRIFT=1
  fi
}

# ─── Run checks ────────────────────────────────────────────────

# Backend (monorepo — check root package.json where dep is declared)
check_node_consumer "WidgeTDC Backend" "$PARENT_DIR/WidgeTDC_fresh"

# Frontend
check_node_consumer "Consulting Frontend" "$PARENT_DIR/widgetdc-consulting-frontend"

# RLM Engine (Python)
check_python_consumer "RLM Engine" "$PARENT_DIR/widgetdc-rlm-engine"

echo ""
if [ $DRIFT -eq 0 ]; then
  echo "All consumers aligned with v${CANONICAL_VERSION}."
else
  echo "VERSION DRIFT DETECTED — see remediation above."
  exit 1
fi
