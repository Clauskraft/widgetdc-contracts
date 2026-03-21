import { describe, expect, it } from 'vitest'

import {
  McpClientPoliciesDocument,
  McpClientSelfResource,
} from '../src/mcp/index.js'

describe('mcp policy contracts', () => {
  it('defines the policy document contract', () => {
    expect(McpClientPoliciesDocument.$id).toBe('McpClientPoliciesDocument')
    expect(McpClientPoliciesDocument.properties.clients).toBeDefined()
    expect(McpClientPoliciesDocument.properties.tool_metadata).toBeDefined()
  })

  it('defines the authenticated self resource contract', () => {
    expect(McpClientSelfResource.$id).toBe('McpClientSelfResource')
    expect(McpClientSelfResource.properties.allowed_tools).toBeDefined()
    expect(McpClientSelfResource.properties.allowed_resources).toBeDefined()
  })
})
