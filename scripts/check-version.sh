#!/usr/bin/env bash
# check-version.sh — Verify installed @widgetdc/contracts matches canonical version
#
# Run from any consumer repo:
#   bash <path-to-contracts>/scripts/check-version.sh [consumer-dir]
#
# Checks:
#   1. @widgetdc/contracts is installed in node_modules
#   2. Installed version matches canonical package.json version
#   3. dist/ has the expected modules

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CANONICAL_DIR="$(dirname "$SCRIPT_DIR")"
CONSUMER_DIR="${1:-.}"

# Read canonical version using node with path.resolve for Windows compat
CANONICAL_VERSION=$(node -e "const p=require('path'); console.log(require(p.resolve(process.argv[1],'package.json')).version)" "$CANONICAL_DIR")

echo "Checking @widgetdc/contracts alignment..."
echo "  Canonical version: $CANONICAL_VERSION"
echo "  Consumer path:     $CONSUMER_DIR"
echo ""

# Check 1: Is the package installed?
INSTALLED_DIR="$CONSUMER_DIR/node_modules/@widgetdc/contracts"
if [ ! -d "$INSTALLED_DIR" ]; then
  echo "FAIL: @widgetdc/contracts not found in $INSTALLED_DIR"
  echo "   Run: npm install"
  exit 1
fi
echo "OK: Package installed"

# Check 2: Version match
if [ -f "$INSTALLED_DIR/package.json" ]; then
  INSTALLED_VERSION=$(node -e "const p=require('path'); console.log(require(p.resolve(process.argv[1],'package.json')).version)" "$INSTALLED_DIR")
  if [ "$INSTALLED_VERSION" = "$CANONICAL_VERSION" ]; then
    echo "OK: Version match: $INSTALLED_VERSION"
  else
    echo "WARN: Version mismatch: installed=$INSTALLED_VERSION canonical=$CANONICAL_VERSION"
    echo "   Run: npm update @widgetdc/contracts"
  fi
else
  echo "WARN: No package.json in installed package"
fi

# Check 3: Expected modules present
EXPECTED_MODULES=("agent" "cognitive" "consulting" "graph" "health" "http")
MISSING=()
for mod in "${EXPECTED_MODULES[@]}"; do
  if [ ! -d "$INSTALLED_DIR/dist/$mod" ]; then
    MISSING+=("$mod")
  fi
done

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "OK: All ${#EXPECTED_MODULES[@]} modules present in dist/"
else
  echo "FAIL: Missing modules: ${MISSING[*]}"
  echo "   The installed package may be from an old tag."
  echo "   Run: npm install @widgetdc/contracts@git+https://github.com/Clauskraft/widgetdc-contracts.git#v${CANONICAL_VERSION}"
  exit 1
fi

# Check 4: Python package (optional — only relevant for Python consumers)
if [ -d "$CANONICAL_DIR/python/widgetdc_contracts" ]; then
  PY_FILES=$(find "$CANONICAL_DIR/python/widgetdc_contracts" -name "*.py" -not -path "*__pycache__*" | wc -l)
  echo "OK: Python package: $PY_FILES files in python/widgetdc_contracts/"
fi

echo ""
echo "All checks passed."
