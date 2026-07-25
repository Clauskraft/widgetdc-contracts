import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
describe('python generation hygiene', () => {
  it('regenerates Python models from canonical schemas in the current workspace', () => {
    const result = spawnSync('npm run python', {
      cwd: repoRoot,
      encoding: 'utf-8',
      shell: true,
    })

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)

    const graphModule = readFileSync(join(repoRoot, 'python', 'widgetdc_contracts', 'graph.py'), 'utf-8')

    expect(graphModule).toContain("'NormalizerConfig'")
    expect(graphModule).toContain("'DEVIATES_FROM_BASELINE'")
  })

  it('emits importable Python modules for schema names with hyphens', () => {
    const compile = spawnSync('python', ['-m', 'py_compile', 'python/widgetdc_contracts/__init__.py'], {
      cwd: repoRoot,
      encoding: 'utf-8',
    })

    expect(compile.status, `${compile.stdout}\n${compile.stderr}`).toBe(0)

    const importCheck = spawnSync('python', ['-c', 'import widgetdc_contracts; from widgetdc_contracts import decision_bom'], {
      cwd: join(repoRoot, 'python'),
      encoding: 'utf-8',
    })

    expect(importCheck.status, `${importCheck.stdout}\n${importCheck.stderr}`).toBe(0)
  })

  it('uses the exported definition reference and identifier classes throughout chain edges', () => {
    const capabilityModule = readFileSync(
      join(repoRoot, 'python', 'widgetdc_contracts', 'capability.py'),
      'utf-8',
    )
    expect(
      capabilityModule.match(/^class CapabilityIdentifierV1\(/gm),
    ).toHaveLength(1)

    const identityCheck = spawnSync('python', ['-c', `
from widgetdc_contracts.capability import (
    CapabilityChainEdgeV1,
    CapabilityDefinitionRefV1,
    CapabilityIdentifierV1,
)

source_type = CapabilityChainEdgeV1.model_fields["source"].annotation
target_type = CapabilityChainEdgeV1.model_fields["target"].annotation
assert source_type is CapabilityDefinitionRefV1
assert target_type is CapabilityDefinitionRefV1
assert CapabilityDefinitionRefV1.model_fields["capability_identifier"].annotation is CapabilityIdentifierV1
`], {
      cwd: join(repoRoot, 'python'),
      encoding: 'utf-8',
    })

    expect(
      identityCheck.status,
      `${identityCheck.stdout}\n${identityCheck.stderr}`,
    ).toBe(0)
  })

  it('preserves chat-session patch variants in generated Pydantic models', () => {
    const validationScript = `
from pydantic import ValidationError
from widgetdc_contracts.chat_contract_runtime import (
    WdcChatSession,
    WdcChatSessionPage,
    WdcChatSessionPatchRequest,
)

valid = [
    {
        "schema_version": "wdc.chat_session_patch_request.v1",
        "expected_version": 1,
        "title": "Renamed session",
    },
    {
        "schema_version": "wdc.chat_session_patch_request.v1",
        "expected_version": 1,
        "status": "archived",
    },
    {
        "schema_version": "wdc.chat_session_patch_request.v1",
        "expected_version": 1,
        "title": "Renamed and archived",
        "status": "archived",
    },
]

invalid = [
    {
        "schema_version": "wdc.chat_session_patch_request.v1",
        "expected_version": 1,
    },
    {
        "schema_version": "wdc.chat_session_patch_request.v1",
        "expected_version": 1,
        "status": "active",
    },
    {
        "schema_version": "wdc.chat_session_patch_request.v1",
        "expected_version": 1,
        "title": None,
    },
    {
        "schema_version": "wdc.chat_session_patch_request.v1",
        "expected_version": "1",
        "title": "String versions must fail closed",
    },
    {
        "schema_version": "wdc.chat_session_patch_request.v1",
        "expected_version": True,
        "title": "Boolean versions must fail closed",
    },
    {
        "schema_version": "wdc.chat_session_patch_request.v1",
        "expected_version": 1.5,
        "title": "Fractional versions must fail closed",
    },
    {
        "schema_version": "wdc.chat_session_patch_request.v1",
        "expected_version": float("nan"),
        "title": "Non-finite versions must fail closed",
    },
    {
        "schema_version": "wdc.chat_session_patch_request.v1",
        "expected_version": float("inf"),
        "title": "Infinite versions must fail closed",
    },
]

for payload in valid:
    WdcChatSessionPatchRequest.model_validate(payload)

for payload in invalid:
    try:
        WdcChatSessionPatchRequest.model_validate(payload)
    except ValidationError:
        continue
    raise AssertionError(f"unexpectedly accepted invalid patch: {payload!r}")

session = {
    "schema_version": "wdc.chat_session.v1",
    "session_id": "session:opaque-python-parity",
    "title": "Python parity",
    "status": "active",
    "version": 1,
    "created_at": "2026-07-23T08:00:00.000Z",
    "updated_at": "2026-07-23T08:00:00.000Z",
}
session_model = WdcChatSession.model_validate(session)
page = WdcChatSessionPage.model_validate({
    "schema_version": "wdc.chat_session_page.v1",
    "items": [session_model],
    "next_cursor": None,
})
assert isinstance(page.items[0], WdcChatSession)

integral_float_session = WdcChatSession.model_validate({**session, "version": 1.0})
assert integral_float_session.version == 1
assert isinstance(integral_float_session.version, int)

integral_float_patch = WdcChatSessionPatchRequest.model_validate({
    "schema_version": "wdc.chat_session_patch_request.v1",
    "expected_version": 1.0,
    "title": "Integral floats normalize to integers",
})
assert integral_float_patch.root.expected_version == 1
assert isinstance(integral_float_patch.root.expected_version, int)

for invalid_version in ("1", True, 1.5, float("nan"), float("inf")):
    try:
        WdcChatSession.model_validate({**session, "version": invalid_version})
    except ValidationError:
        continue
    raise AssertionError(
        f"unexpectedly accepted non-integer session version: {invalid_version!r}"
    )

try:
    WdcChatSessionPage.model_validate({
        "schema_version": "wdc.chat_session_page.v1",
        "items": [session],
    })
except ValidationError:
    pass
else:
    raise AssertionError("unexpectedly accepted a page without next_cursor")
`
    const validation = spawnSync('python', ['-c', validationScript], {
      cwd: join(repoRoot, 'python'),
      encoding: 'utf-8',
    })

    expect(validation.status, `${validation.stdout}\n${validation.stderr}`).toBe(0)
  })
})
