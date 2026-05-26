#!/usr/bin/env node
import fs from 'node:fs'
import process from 'node:process'

const cfg = JSON.parse(fs.readFileSync('config/wonder_gateway.json', 'utf8'))
const bearerNames = [cfg.mcp?.bearer_env, ...(cfg.mcp?.fallback_env_names ?? [])].filter(Boolean)
const bearerEnv = bearerNames.find((name) => process.env[name])

const checks = [
  { id: 'config_loaded', status: 'PASS' },
  { id: 'backend_http_route_declared', status: cfg.mcp?.backend_http_route ? 'PASS' : 'FAIL' },
  { id: 'routing_smoke_declared', status: cfg.a2a?.routing_smoke ? 'PASS' : 'FAIL' },
  {
    id: 'bearer_env_available',
    status: bearerEnv ? 'PASS' : 'BLOCKED_MCP_OR_AUTH',
    env_name: bearerEnv ?? null,
  },
]

const failed = checks.some((check) => check.status === 'FAIL' || check.status === 'BLOCKED_MCP_OR_AUTH')

console.log(JSON.stringify({
  repo: cfg.repo_id,
  status: failed ? 'BLOCKED_RUNTIME' : 'PASS',
  evidence_level: 'diagnostic_only',
  checks,
  note: 'Local smoke is diagnostic_only; it is not claim-grade runtime proof.',
}, null, 2))

process.exit(failed ? 1 : 0)
