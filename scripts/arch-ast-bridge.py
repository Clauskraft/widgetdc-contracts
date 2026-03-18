#!/usr/bin/env python3
"""
AST Graph Bridge for WidgeTDC Architecture Intelligence.

Fail-closed guardrails:
- This script is an internal analysis bridge, not a canonical contracts surface.
- It only runs when the vendored AST engine is actually present.
- It refuses to silently emit partial architecture truth.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).parent.parent.resolve()
PYTHON_ROOT = REPO_ROOT / "python"
AST_GRAPH_ROOT = PYTHON_ROOT / "widgetdc_contracts" / "ast_graph"


def _fatal(message: str) -> int:
    print(f"[ast-bridge] ERROR: {message}", file=sys.stderr)
    return 1


def _require_ast_graph() -> int:
    required_files = [
        AST_GRAPH_ROOT / "incremental.py",
        AST_GRAPH_ROOT / "graph.py",
        AST_GRAPH_ROOT / "visualization.py",
    ]
    missing = [str(path.relative_to(REPO_ROOT)) for path in required_files if not path.exists()]
    if missing:
        return _fatal(
            "AST graph engine is incomplete in this working tree. Missing: "
            + ", ".join(missing)
            + ". Keep Adv Graph internal until the vendored engine is complete."
        )
    return 0

def main():
    guard_status = _require_ast_graph()
    if guard_status != 0:
        return guard_status

    # Ensure Python can find widgetdc_contracts only after the engine guard passes.
    sys.path.insert(0, str(PYTHON_ROOT))

    from widgetdc_contracts.ast_graph.incremental import full_build
    from widgetdc_contracts.ast_graph.graph import GraphStore
    from widgetdc_contracts.ast_graph.visualization import export_graph_data

    repo_root = REPO_ROOT
    db_path = repo_root / "arch" / ".ast_graph.db"
    
    print(f"[ast-bridge] Initializing GraphStore at {db_path}...")
    store = GraphStore(str(db_path))
    
    print(f"[ast-bridge] Running full AST build over {repo_root}...")
    stats = full_build(repo_root, store)
    print(f"[ast-bridge] Build stats: {stats}")
    
    print("[ast-bridge] Exporting graph data...")
    data = export_graph_data(store)
    
    out_path = repo_root / "arch" / "ast-graph.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        
    print(f"[ast-bridge] AST Graph exported to {out_path} ({len(data.get('nodes', []))} nodes, {len(data.get('edges', []))} edges)")

if __name__ == "__main__":
    raise SystemExit(main())
