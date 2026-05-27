import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('strategic audit dashboard credential hygiene', () => {
  const dashboard = readFileSync('./scripts/strategic-audit-dashboard.html', 'utf8')

  it('does not embed bearer token literals', () => {
    const hardcodedBearerLiterals = [...dashboard.matchAll(/Bearer\s+(?!\$\{)[A-Za-z0-9._~+/=-]{6,}/g)]

    expect(hardcodedBearerLiterals).toEqual([])
  })

  it('routes MCP actions through same-origin runtime configuration', () => {
    expect(dashboard).toContain("API + '/api/mcp/route'")
    expect(dashboard).not.toContain('backend-production-d3da.up.railway.app')
  })
})
