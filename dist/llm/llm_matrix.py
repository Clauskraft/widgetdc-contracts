"""
LlmMatrix — Python mirror of @widgetdc/contracts/llm

Pure data-layer resolver for the canonical LLM task->model routing matrix.
Loads llm-matrix.json (sibling file) and exposes the same API as the
TypeScript LlmMatrix class. Consumers (rlm-engine) perform the actual HTTP
calls to providers using their own client libraries.

Usage:
    from widgetdc_contracts.llm import LlmMatrix

    chain = LlmMatrix.resolve("attestation")
    if not chain.models:
        return  # disabled
    for model_name in chain.models:
        model = LlmMatrix.get_model(model_name)
        provider = LlmMatrix.get_provider(model["provider"])
        api_key = os.environ.get(provider["auth_env"])
        # ... call provider["base_url"] with api_key ...

NB: This file is NOT compiled by the TypeScript tsconfig (which includes
only src/**/*.ts). It lives alongside the JSON so both TS and Python
implementations read from one source of truth.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

# ─── Resolve llm-matrix.json path (same directory as this file) ──────────────
_MATRIX_PATH = Path(__file__).parent / "llm-matrix.json"

with _MATRIX_PATH.open("r", encoding="utf-8") as _f:
    _MATRIX: Dict[str, Any] = json.load(_f)

# ─── Types ───────────────────────────────────────────────────────────────────

ChainSource = Literal["default", "env_override", "disabled", "disabled_by_default"]


@dataclass(frozen=True)
class ChainResolution:
    task: str
    models: List[str]
    source: ChainSource
    override_env: Optional[str] = None
    disable_env: Optional[str] = None


# ─── API ─────────────────────────────────────────────────────────────────────


class LlmMatrix:
    """Canonical LLM task->model resolver. Pure data layer, no HTTP."""

    @classmethod
    def version(cls) -> str:
        return _MATRIX["version"]

    @classmethod
    def resolve(cls, task: str) -> ChainResolution:
        """Resolve the effective fallback chain for a task, applying env overrides."""
        task_cfg = _MATRIX["tasks"].get(task)
        if task_cfg is None:
            raise ValueError(f"[LlmMatrix] Unknown task: {task}")

        # 1. Explicit disable env wins
        disable_env = task_cfg.get("disable_env")
        if disable_env and os.environ.get(disable_env) == "true":
            return ChainResolution(task=task, models=[], source="disabled", disable_env=disable_env)

        # 2. default_disabled: task off unless explicitly enabled
        if task_cfg.get("default_disabled"):
            disable_val = os.environ.get(disable_env) if disable_env else None
            if disable_val != "false":
                return ChainResolution(
                    task=task,
                    models=[],
                    source="disabled_by_default",
                    disable_env=disable_env,
                )

        # 3. Override env var (single-model bypass OR explicit disable)
        override_env = task_cfg.get("override_env")
        if override_env:
            override_val = os.environ.get(override_env)
            if override_val and override_val != "default":
                if override_val == "disabled":
                    return ChainResolution(
                        task=task, models=[], source="disabled", override_env=override_env
                    )
                if override_val not in _MATRIX["models"]:
                    raise ValueError(
                        f"[LlmMatrix] {override_env}={override_val} is not a known model. "
                        f"Known models: {', '.join(_MATRIX['models'].keys())}"
                    )
                return ChainResolution(
                    task=task, models=[override_val], source="env_override", override_env=override_env
                )

        # 4. Default chain
        return ChainResolution(task=task, models=list(task_cfg["chain"]), source="default")

    @classmethod
    def get_model(cls, name: str) -> Dict[str, Any]:
        model = _MATRIX["models"].get(name)
        if model is None:
            raise ValueError(
                f"[LlmMatrix] Unknown model: {name}. Add it to llm-matrix.json under 'models'."
            )
        return model

    @classmethod
    def get_provider(cls, provider_id: str) -> Dict[str, Any]:
        provider = _MATRIX["providers"].get(provider_id)
        if provider is None:
            raise ValueError(f"[LlmMatrix] Unknown provider: {provider_id}")
        return provider

    @classmethod
    def list_tasks(cls) -> List[str]:
        return list(_MATRIX["tasks"].keys())

    @classmethod
    def list_models(cls) -> List[str]:
        return list(_MATRIX["models"].keys())

    @classmethod
    def list_providers(cls) -> List[str]:
        return list(_MATRIX["providers"].keys())

    @classmethod
    def get_task_config(cls, task: str) -> Dict[str, Any]:
        return _MATRIX["tasks"][task]

    @classmethod
    def validate(cls) -> List[str]:
        """Check matrix internal consistency. Returns list of error strings (empty = valid)."""
        errors: List[str] = []

        for model_name, model in _MATRIX["models"].items():
            if model["provider"] not in _MATRIX["providers"]:
                errors.append(
                    f'model "{model_name}" references unknown provider "{model["provider"]}"'
                )

        for task_name, task in _MATRIX["tasks"].items():
            chain = task.get("chain", [])
            if not chain:
                errors.append(f'task "{task_name}" has empty chain')
            for model_name in chain:
                if model_name not in _MATRIX["models"]:
                    errors.append(
                        f'task "{task_name}" chain references unknown model "{model_name}"'
                    )

        env_vars: set = set()
        for task_name, task in _MATRIX["tasks"].items():
            for env_name in (task.get("override_env"), task.get("disable_env")):
                if not env_name:
                    continue
                if env_name in env_vars:
                    errors.append(
                        f'env var "{env_name}" (task "{task_name}") is used by multiple tasks'
                    )
                env_vars.add(env_name)

        return errors

    @classmethod
    def dump_all(cls) -> Dict[str, ChainResolution]:
        return {task: cls.resolve(task) for task in cls.list_tasks()}


__all__ = ["LlmMatrix", "ChainResolution"]
