#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SCHEMAS_DIR="$ROOT_DIR/schemas"
PYTHON_DIR="$ROOT_DIR/python/widgetdc_contracts"

# Check prerequisites
if ! command -v datamodel-codegen &> /dev/null; then
  echo "datamodel-code-generator not found. Install with:"
  echo "  pip install datamodel-code-generator[http] pydantic"
  exit 1
fi

if [ ! -d "$SCHEMAS_DIR" ]; then
  echo "No schemas/ directory found. Run 'npm run schemas' first."
  exit 1
fi

# Clean previous output (preserve _base.py)
find "$PYTHON_DIR" -name "*.py" ! -name "_base.py" ! -name "__init__.py" -delete 2>/dev/null || true
mkdir -p "$PYTHON_DIR"

# Copy base model if not present
if [ ! -f "$PYTHON_DIR/_base.py" ]; then
  cat > "$PYTHON_DIR/_base.py" << 'PYEOF'
"""Base model for all WidgeTDC contracts. Wire format is snake_case."""
from pydantic import BaseModel, ConfigDict


class WidgeTDCBaseModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )
PYEOF
fi

# Generate per-module Python files
for module_dir in "$SCHEMAS_DIR"/*/; do
  module_name=$(basename "$module_dir")
  # Avoid 'http' shadowing stdlib
  output_name="$module_name"
  if [ "$module_name" = "http" ]; then
    output_name="http_"
  fi

  echo "Generating: $module_name → $output_name.py"

  datamodel-codegen \
    --input "$module_dir" \
    --input-file-type jsonschema \
    --output "$PYTHON_DIR/${output_name}.py" \
    --output-model-type pydantic_v2.BaseModel \
    --target-python-version 3.12 \
    --use-standard-collections \
    --use-union-operator \
    --field-constraints \
    --enum-field-as-literal all \
    --collapse-root-models \
    2>&1 || echo "  Warning: generation for $module_name had issues"
done

# Generate __init__.py
cat > "$PYTHON_DIR/__init__.py" << 'PYEOF'
"""
widgetdc-contracts — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts TypeBox schemas.
Do not edit manually — regenerate with: npm run python
"""
PYEOF

for module_dir in "$SCHEMAS_DIR"/*/; do
  module_name=$(basename "$module_dir")
  if [ "$module_name" = "http" ]; then
    echo "from . import http_ as http" >> "$PYTHON_DIR/__init__.py"
  else
    echo "from . import ${module_name}" >> "$PYTHON_DIR/__init__.py"
  fi
done

# Create py.typed marker (PEP 561)
touch "$ROOT_DIR/python/py.typed"

echo ""
echo "Python models generated in $PYTHON_DIR"
