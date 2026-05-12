import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const archServerSource = readFileSync(
  join(process.cwd(), 'scripts', 'arch-mcp-server.ts'),
  'utf8'
)

describe('arch branches refresh contract', () => {
  it('lets explicit refresh requests bypass branch cache', () => {
    expect(archServerSource).toContain(
      'async function fetchAllOpenChanges(options: { refresh?: boolean } = {})'
    )
    expect(archServerSource).toContain(
      'if (!options.refresh && branchesCache && Date.now() - branchesCache.ts < CACHE_TTL)'
    )
  })

  it('accepts refresh, cache=false, and force query flags on /api/branches', () => {
    expect(archServerSource).toContain('const refresh =')
    expect(archServerSource).toContain('_req.query.refresh === "true"')
    expect(archServerSource).toContain('_req.query.cache === "false"')
    expect(archServerSource).toContain('_req.query.force === "true"')
    expect(archServerSource).toContain('fetchAllOpenChanges({ refresh })')
  })
})
