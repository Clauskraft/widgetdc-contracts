export const AGENT_GOVERNANCE_PROXY_SURFACES = [
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
] as const

export type AgentGovernanceProxySurfaceId = typeof AGENT_GOVERNANCE_PROXY_SURFACES[number]['id']

interface FetchGovernanceSurfaceOptions {
  backendUrl: string
  apiKey?: string
  fetchImpl?: typeof fetch
}

export interface GovernanceSurfaceResponse {
  status: number
  contentType: string
  body: unknown
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

export async function fetchGovernanceSurface(
  surfaceId: AgentGovernanceProxySurfaceId,
  options: FetchGovernanceSurfaceOptions,
): Promise<GovernanceSurfaceResponse> {
  const surface = AGENT_GOVERNANCE_PROXY_SURFACES.find((candidate) => candidate.id === surfaceId)
  if (!surface) {
    throw new Error(`Unknown governance surface: ${surfaceId}`)
  }

  const fetchImpl = options.fetchImpl ?? fetch
  const response = await fetchImpl(`${normalizeBaseUrl(options.backendUrl)}${surface.backendPath}`, {
    method: 'GET',
    headers: {
      ...(options.apiKey ? { Authorization: `Bearer ${options.apiKey}` } : {}),
    },
  })

  const contentType = response.headers.get('content-type') ?? surface.contentType
  const body =
    contentType.includes('application/json')
      ? await response.json()
      : await response.text()

  return {
    status: response.status,
    contentType,
    body,
  }
}
