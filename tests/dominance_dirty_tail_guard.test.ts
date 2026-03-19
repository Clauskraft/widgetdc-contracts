import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('dominance dirty-tail guard', () => {
  it('rejects branch-local dominance docs at the canonical docs root', () => {
    const forbiddenDocs = [
      './docs/INTEGRATION_MANIFEST_2026-03-19.md',
      './docs/VALHALLA_ARCHITECTURE_CATALOG_2026-03-18.md',
    ]

    for (const docPath of forbiddenDocs) {
      expect(existsSync(docPath)).toBe(false)
    }
  })

  it('keeps the dashboard free of links to missing dominance docs', () => {
    const dashboard = readFileSync('./arch/dominance_dashboard.html', 'utf8')
    const docRefs = [...dashboard.matchAll(/\.\.\/docs\/([^"'?#\s)]+)/g)].map((match) => match[1])

    for (const relativeDocPath of docRefs) {
      expect(existsSync(resolve('./docs', relativeDocPath))).toBe(true)
    }
  })
})
