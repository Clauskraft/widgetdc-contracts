#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SCHEMAS_DIR="$ROOT_DIR/schemas"
PYTHON_DIR="$ROOT_DIR/python/widgetdc_contracts"
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

# Check prerequisites
if ! command -v datamodel-codegen &> /dev/null; then
  echo "datamodel-code-generator not found. Install with:"
  echo "  pip install 'datamodel-code-generator[http]' pydantic"
  exit 1
fi

if [ ! -d "$SCHEMAS_DIR" ]; then
  echo "No schemas/ directory found. Run 'npm run schemas' first."
  exit 1
fi

# Clean previous output (preserve _base.py)
find "$PYTHON_DIR" -name "*.py" ! -name "_base.py" -delete 2>/dev/null || true
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
# Each schema file → individual model with proper class name (from filename)
for module_dir in "$SCHEMAS_DIR"/*/; do
  module_name=$(basename "$module_dir")
  output_name="$module_name"
  if [ "$module_name" = "http" ]; then
    output_name="http_"
  fi

  echo "Generating: $module_name → $output_name.py"

  # Step 1: Generate each schema file individually with --class-name
  module_tmp="$TMP_DIR/$module_name"
  mkdir -p "$module_tmp"

  for schema_file in "$module_dir"/*.json; do
    schema_name=$(basename "$schema_file" .json)
    datamodel-codegen \
      --input "$schema_file" \
      --input-file-type jsonschema \
      --output "$module_tmp/${schema_name}.py" \
      --output-model-type pydantic_v2.BaseModel \
      --target-python-version 3.12 \
      --use-standard-collections \
      --use-union-operator \
      --field-constraints \
      --enum-field-as-literal all \
      --collapse-root-models \
      --class-name "$schema_name" \
      2>&1 || echo "  Warning: generation for $schema_name had issues"
  done

  # Step 2: Merge individual files into one module file
  {
    echo '"""'
    echo "widgetdc_contracts.${output_name} — Auto-generated Pydantic v2 models."
    echo "Source: @widgetdc/contracts schemas/${module_name}/"
    echo "Do not edit manually — regenerate with: npm run python"
    echo '"""'
    echo ""
    echo "from __future__ import annotations"
    echo ""

    # Collect all unique imports
    imports_file="$TMP_DIR/${module_name}_imports.txt"
    > "$imports_file"
    for py_file in "$module_tmp"/*.py; do
      [ -f "$py_file" ] || continue
      grep -E '^(from |import )' "$py_file" | grep -v '__future__' >> "$imports_file" || true
    done
    sort -u "$imports_file"
    echo ""

    # Extract __all__ entries for the module
    echo -n "__all__ = ["
    first=true
    for schema_file in "$module_dir"/*.json; do
      schema_name=$(basename "$schema_file" .json)
      if [ "$first" = true ]; then
        echo -n "\"$schema_name\""
        first=false
      else
        echo -n ", \"$schema_name\""
      fi
    done
    echo "]"
    echo ""

    # Extract class bodies, renaming top-level 'Model' classes
    for py_file in "$module_tmp"/*.py; do
      [ -f "$py_file" ] || continue
      py_name=$(basename "$py_file" .py)

      # Extract everything after imports (class definitions and constants)
      awk '
        BEGIN { in_body=0 }
        /^(from |import |#)/ && !in_body { next }
        /^$/ && !in_body { next }
        /^"""/ && !in_body { next }
        { in_body=1; print }
      ' "$py_file" | sed "s/class ${py_name}(RootModel/class ${py_name}(RootModel/" | head -100
      echo ""
    done
  } > "$PYTHON_DIR/${output_name}.py"
done

# Generate __init__.py with re-exports
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
