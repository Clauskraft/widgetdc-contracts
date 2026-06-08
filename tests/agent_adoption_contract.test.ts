import { describe, it, expect } from 'vitest'
import '../src/formats.js'
import { Value } from '@sinclair/typebox/value'
import {
  AgentAdoptionContract,
  AgentAdoptionStartupChain,
  AgentAdoptionWritePolicy,
  AgentAdoptionRiskTier,
  computeContractHash,
  verifyContractHash,
} from '../src/adoption/agent-adoption-contract.js'

/**
 * B11 — canonical adoption contract.
 *
 * Tests verify:
 *  1. TypeBox schema parses & validates representative manifests.
 *  2. Round-trip: encode -> JSON -> parse -> validate = same object.
 *  3. Hash field is excluded from its own input (no self-reference).
 *  4. Verification rejects tampered manifests.
 *  5. Required-field enforcement.
 */

// ── Canonical fixture (a Claude-Code-on-WidgeTDC manifest) ──

function fixtureBase(): Omit<typeof AgentAdoptionContract.static, 'hash'> {
  return {
    contract_version: 'v1',
    repo: 'WidgeTDC',
    agent: 'claude-code',
    bridge: 'http-mcp-route',
    required_tools: ['intent_detect', 'srag.query', 'reason_deeply'],
    startup_chain: {
      intent_detect: { required: true, min_confidence: 0.6 },
      rag_query: { tool: 'srag.query', required: true },
      reason: { tool: 'reason_deeply', required: true },
    },
    read_only_write_policy: {
      default_risk: 'staged_write',
      write_requires: { plan: true, approval: true, signature: true },
    },
    telemetry_key: 'adoption.event.v1',
    runtime_probe_fn: 'adoption.conformance.v1',
    created_at: '2026-06-08T12:00:00Z',
  }
}

function fixture(): typeof AgentAdoptionContract.static {
  const base = fixtureBase()
  return { ...base, hash: computeContractHash(base) }
}

// ── Schema validation ───────────────────────────────────────

describe('AgentAdoptionContract — schema validation', () => {
  it('validates the canonical fixture', () => {
    expect(Value.Check(AgentAdoptionContract, fixture())).toBe(true)
  })

  it('rejects a missing contract_version', () => {
    const c = fixture() as Record<string, unknown>
    delete c.contract_version
    expect(Value.Check(AgentAdoptionContract, c)).toBe(false)
  })

  it('rejects an unknown contract_version', () => {
    const c = { ...fixture(), contract_version: 'v2' }
    expect(Value.Check(AgentAdoptionContract, c)).toBe(false)
  })

  it('rejects an empty repo', () => {
    const base = { ...fixtureBase(), repo: '' }
    const c = { ...base, hash: computeContractHash(base) }
    expect(Value.Check(AgentAdoptionContract, c)).toBe(false)
  })

  it('rejects an unknown rag_query tool', () => {
    const c = fixture() as Record<string, unknown>
    ;(c.startup_chain as Record<string, unknown>).rag_query = {
      tool: 'random.tool',
      required: true,
    }
    expect(Value.Check(AgentAdoptionContract, c)).toBe(false)
  })

  it('rejects an unknown default_risk', () => {
    const c = fixture() as Record<string, unknown>
    ;(c.read_only_write_policy as Record<string, unknown>).default_risk = 'gonzo_write'
    expect(Value.Check(AgentAdoptionContract, c)).toBe(false)
  })

  it('rejects a malformed hash (not 64 hex chars)', () => {
    const c = { ...fixture(), hash: 'not-a-real-hash' }
    expect(Value.Check(AgentAdoptionContract, c)).toBe(false)
  })

  it('rejects a malformed created_at', () => {
    const c = { ...fixture(), created_at: 'yesterday' }
    expect(Value.Check(AgentAdoptionContract, c)).toBe(false)
  })

  it('validates all 3 risk tiers', () => {
    for (const tier of ['read_only', 'staged_write', 'production_write']) {
      expect(Value.Check(AgentAdoptionRiskTier, tier)).toBe(true)
    }
    expect(Value.Check(AgentAdoptionRiskTier, 'yolo')).toBe(false)
  })

  it('validates both rag_query tools', () => {
    for (const tool of ['srag.query', 'kg_rag.query']) {
      const chain = {
        intent_detect: { required: true },
        rag_query: { tool, required: true },
        reason: { tool: 'reason_deeply', required: false },
      }
      expect(Value.Check(AgentAdoptionStartupChain, chain)).toBe(true)
    }
  })

  it('startup_chain min_confidence is bounded [0,1]', () => {
    const chain = {
      intent_detect: { required: true, min_confidence: 1.5 },
      rag_query: { tool: 'srag.query' as const, required: true },
      reason: { tool: 'reason_deeply' as const, required: true },
    }
    expect(Value.Check(AgentAdoptionStartupChain, chain)).toBe(false)
  })

  it('write_policy requires all three gate flags', () => {
    const policy = {
      default_risk: 'staged_write' as const,
      write_requires: { plan: true, approval: true },
    }
    expect(Value.Check(AgentAdoptionWritePolicy, policy)).toBe(false)
  })
})

// ── Round-trip (encode -> JSON -> parse -> validate) ────────

describe('AgentAdoptionContract — JSON round-trip', () => {
  it('serialises and parses with identical contents', () => {
    const original = fixture()
    const json = JSON.stringify(original)
    const parsed = JSON.parse(json) as typeof AgentAdoptionContract.static
    expect(Value.Check(AgentAdoptionContract, parsed)).toBe(true)
    expect(parsed).toEqual(original)
  })

  it('round-trip preserves the hash', () => {
    const original = fixture()
    const parsed = JSON.parse(JSON.stringify(original)) as typeof AgentAdoptionContract.static
    expect(verifyContractHash(parsed)).toBe(true)
  })
})

// ── Hash semantics (excludes itself) ────────────────────────

describe('AgentAdoptionContract — hash semantics', () => {
  it('hash is deterministic for the same input', () => {
    const base = fixtureBase()
    expect(computeContractHash(base)).toBe(computeContractHash(base))
  })

  it('hash is stable across key insertion order', () => {
    const base = fixtureBase()
    const reordered = {
      created_at: base.created_at,
      runtime_probe_fn: base.runtime_probe_fn,
      telemetry_key: base.telemetry_key,
      read_only_write_policy: base.read_only_write_policy,
      startup_chain: base.startup_chain,
      required_tools: base.required_tools,
      bridge: base.bridge,
      agent: base.agent,
      repo: base.repo,
      contract_version: base.contract_version,
    }
    expect(computeContractHash(base)).toBe(computeContractHash(reordered as typeof base))
  })

  it('hash excludes its own field (no self-reference)', () => {
    const base = fixtureBase()
    const h1 = computeContractHash(base)
    // Passing in a hash value must not change the result — the function strips it.
    const h2 = computeContractHash({ ...base, hash: 'deadbeef'.repeat(8) })
    expect(h1).toBe(h2)
  })

  it('verifyContractHash returns true for an untampered manifest', () => {
    expect(verifyContractHash(fixture())).toBe(true)
  })

  it('verifyContractHash returns false when any field is tampered', () => {
    const tampered = { ...fixture(), repo: 'EvilRepo' }
    expect(verifyContractHash(tampered)).toBe(false)
  })

  it('hash changes when telemetry_key changes', () => {
    const base = fixtureBase()
    const h1 = computeContractHash(base)
    const h2 = computeContractHash({ ...base, telemetry_key: 'adoption.event.v2' })
    expect(h1).not.toBe(h2)
  })

  it('hash matches the documented sha256 format (64 hex chars)', () => {
    expect(computeContractHash(fixtureBase())).toMatch(/^[0-9a-f]{64}$/)
  })
})

// ── Pydantic parity ─────────────────────────────────────────

import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

describe('AgentAdoptionContract — Pydantic parity', () => {
  it('Pydantic accepts the same JSON the TypeBox accepts', () => {
    const repoRoot = process.cwd()
    const fixtureJson = JSON.stringify(fixture())
    const py = `
import json, sys, os
sys.path.insert(0, os.path.join(${JSON.stringify(repoRoot)}, 'python'))
from widgetdc_contracts.adoption import AgentAdoptionContract
data = json.loads(${JSON.stringify(fixtureJson)})
m = AgentAdoptionContract.model_validate(data)
print(m.hash)
`
    const result = spawnSync('python', ['-c', py], { encoding: 'utf-8' })
    expect(
      result.status,
      `stdout=${result.stdout}\nstderr=${result.stderr}`,
    ).toBe(0)
    expect(result.stdout.trim()).toBe(fixture().hash)
  })

  it('Pydantic rejects a tampered manifest (bad hash pattern)', () => {
    const repoRoot = process.cwd()
    const tampered = JSON.stringify({ ...fixture(), hash: 'not-hex' })
    const py = `
import json, sys, os
from pydantic import ValidationError
sys.path.insert(0, os.path.join(${JSON.stringify(repoRoot)}, 'python'))
from widgetdc_contracts.adoption import AgentAdoptionContract
data = json.loads(${JSON.stringify(tampered)})
try:
  AgentAdoptionContract.model_validate(data)
  print('ACCEPTED')
except ValidationError:
  print('REJECTED')
`
    const result = spawnSync('python', ['-c', py], { encoding: 'utf-8' })
    expect(result.status).toBe(0)
    expect(result.stdout.trim()).toBe('REJECTED')
  })
})
