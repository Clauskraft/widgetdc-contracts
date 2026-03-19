import { describe, expect, it, vi } from 'vitest'

import {
  AGENT_GOVERNANCE_PROXY_SURFACES,
  fetchGovernanceSurface,
} from '../scripts/agent-governance-proxy.js'

describe('agent governance proxy surface catalog', () => {
  it('defines the canonical five governance surfaces', () => {
    expect(AGENT_GOVERNANCE_PROXY_SURFACES).toEqual([
      {
        id: 'agent-bootstrap',
        route: '/agent-bootstrap',
        backendPath: '/agent-bootstrap',
        contentType: 'application/json',
      },
      {
        id: 'canonical-state',
        route: '/canonical-state',
        backendPath: '/canonical-state',
        contentType: 'application/json',
      },
      {
        id: 'residuals',
        route: '/residuals',
        backendPath: '/residuals',
        contentType: 'application/json',
      },
      {
        id: 'optimization-backlog',
        route: '/optimization-backlog',
        backendPath: '/optimization-backlog',
        contentType: 'application/json',
      },
      {
        id: 'agent-summary',
        route: '/agent-summary',
        backendPath: '/agent-summary',
        contentType: 'text/markdown',
      },
    ])
  })
})

describe('fetchGovernanceSurface', () => {
  it('proxies JSON governance surfaces read-only from backend', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ surface_id: 'canonical_state' }), {
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      }),
    )

    const result = await fetchGovernanceSurface('canonical-state', {
      backendUrl: 'https://backend.example',
      apiKey: 'secret',
      fetchImpl,
    })

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://backend.example/canonical-state',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer secret',
        }),
      }),
    )
    expect(result.status).toBe(200)
    expect(result.contentType).toBe('application/json; charset=utf-8')
    expect(result.body).toEqual({ surface_id: 'canonical_state' })
  })

  it('returns markdown surfaces as text', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response('# Agent Summary', {
        status: 200,
        headers: { 'content-type': 'text/markdown; charset=utf-8' },
      }),
    )

    const result = await fetchGovernanceSurface('agent-summary', {
      backendUrl: 'https://backend.example/',
      fetchImpl,
    })

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://backend.example/agent-summary',
      expect.any(Object),
    )
    expect(result.body).toBe('# Agent Summary')
    expect(result.contentType).toBe('text/markdown; charset=utf-8')
  })
})
