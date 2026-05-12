import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const dataSources = JSON.parse(
  readFileSync(join(process.cwd(), 'arch', 'data-sources.json'), 'utf8')
) as {
  sources: Array<{
    id: string
    name: string
    protocol?: string
    status?: string
    description?: string
    governance?: Record<string, unknown>
    quality?: { knownIssues?: string[] }
  }>
  pipelines: Array<{
    id: string
    sources: string[]
    status?: string
  }>
}

function source(id: string) {
  const found = dataSources.sources.find((candidate) => candidate.id === id)
  expect(found, `missing source ${id}`).toBeTruthy()
  return found!
}

describe('document source spine', () => {
  it('keeps Scribd as deprecated reference-only and not a production scraping source', () => {
    const scribd = source('src-scribd')

    expect(scribd.protocol).toBe('deprecated_reference_only')
    expect(scribd.status).toBe('deprecated')
    expect(scribd.governance).toMatchObject({
      productionFacing: false,
      directScrapingAllowed: false,
      replacementStack: 'governed-document-source-spine',
    })
    expect(scribd.quality?.knownIssues?.join(' ')).toContain('Direct Scribd scraping is not production evidence')
  })

  it('defines governed replacements for document discovery, metadata, full text, enrichment, and user-provided intake', () => {
    const expected = [
      'src-openalex-research-graph',
      'src-crossref-doi-metadata',
      'src-core-open-access',
      'src-europepmc-open-access',
      'src-semantic-scholar-enrichment',
      'src-publisher-allowlist-reports',
      'src-governed-document-intake',
    ]

    for (const id of expected) {
      expect(source(id).governance).toMatchObject({
        evidenceRequired: true,
        rightsBoundaryRequired: true,
      })
    }
  })

  it('routes replacement sources through a governed resolver pipeline', () => {
    const pipeline = dataSources.pipelines.find((candidate) => candidate.id === 'pipe-document-source-resolver')

    expect(pipeline).toBeTruthy()
    expect(pipeline?.status).toBe('planned')
    expect(pipeline?.sources).toEqual([
      'src-openalex-research-graph',
      'src-crossref-doi-metadata',
      'src-core-open-access',
      'src-europepmc-open-access',
      'src-semantic-scholar-enrichment',
      'src-publisher-allowlist-reports',
      'src-governed-document-intake',
    ])
  })
})
