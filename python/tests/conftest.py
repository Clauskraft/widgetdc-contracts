from __future__ import annotations

import sys
from pathlib import Path


REPO_PYTHON_ROOT = Path(__file__).resolve().parents[1]

repo_python_root_str = str(REPO_PYTHON_ROOT)
if sys.path[0] != repo_python_root_str:
    sys.path.insert(0, repo_python_root_str)
