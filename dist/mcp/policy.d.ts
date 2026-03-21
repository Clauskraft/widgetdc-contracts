import { Static } from '@sinclair/typebox';
export declare const McpTransport: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"streamable_http">, import("@sinclair/typebox").TLiteral<"rest">, import("@sinclair/typebox").TLiteral<"sse">, import("@sinclair/typebox").TLiteral<"stdio">]>;
export type McpTransport = Static<typeof McpTransport>;
export declare const McpPolicyRisk: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"moderate">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"critical">]>;
export type McpPolicyRisk = Static<typeof McpPolicyRisk>;
export declare const McpClientLimits: import("@sinclair/typebox").TObject<{
    rate_limit_per_minute: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
}>;
export type McpClientLimits = Static<typeof McpClientLimits>;
export declare const McpClientDiscoveryPolicy: import("@sinclair/typebox").TObject<{
    include_deprecated: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export type McpClientDiscoveryPolicy = Static<typeof McpClientDiscoveryPolicy>;
export declare const McpClientPolicy: import("@sinclair/typebox").TObject<{
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    scopes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    allowed_tools: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    denied_tools: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    allowed_resources: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    denied_resources: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    allowed_transports: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"streamable_http">, import("@sinclair/typebox").TLiteral<"rest">, import("@sinclair/typebox").TLiteral<"sse">, import("@sinclair/typebox").TLiteral<"stdio">]>>>;
    limits: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        rate_limit_per_minute: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    }>>;
    discovery: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        include_deprecated: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>>;
    owner_contact: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type McpClientPolicy = Static<typeof McpClientPolicy>;
export declare const McpToolPolicyMetadata: import("@sinclair/typebox").TObject<{
    capability_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    required_scopes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    risk: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"moderate">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"critical">]>>;
    audience: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    deprecated: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export type McpToolPolicyMetadata = Static<typeof McpToolPolicyMetadata>;
export declare const McpResourcePolicyMetadata: import("@sinclair/typebox").TObject<{
    required_scopes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    audience: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type McpResourcePolicyMetadata = Static<typeof McpResourcePolicyMetadata>;
export declare const McpClientPoliciesDocument: import("@sinclair/typebox").TObject<{
    version: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    defaults: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        scopes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        allowed_tools: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        denied_tools: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        allowed_resources: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        denied_resources: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        allowed_transports: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"streamable_http">, import("@sinclair/typebox").TLiteral<"rest">, import("@sinclair/typebox").TLiteral<"sse">, import("@sinclair/typebox").TLiteral<"stdio">]>>>;
        limits: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            rate_limit_per_minute: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        }>>;
        discovery: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            include_deprecated: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        }>>;
        owner_contact: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    clients: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TObject<{
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        scopes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        allowed_tools: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        denied_tools: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        allowed_resources: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        denied_resources: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        allowed_transports: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"streamable_http">, import("@sinclair/typebox").TLiteral<"rest">, import("@sinclair/typebox").TLiteral<"sse">, import("@sinclair/typebox").TLiteral<"stdio">]>>>;
        limits: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            rate_limit_per_minute: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        }>>;
        discovery: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            include_deprecated: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        }>>;
        owner_contact: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>>;
    tool_metadata: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TObject<{
        capability_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        required_scopes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        risk: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"moderate">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"critical">]>>;
        audience: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        deprecated: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>>>;
    resource_metadata: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TObject<{
        required_scopes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        audience: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>>;
}>;
export type McpClientPoliciesDocument = Static<typeof McpClientPoliciesDocument>;
export declare const McpClientSelfResource: import("@sinclair/typebox").TObject<{
    generated_at: import("@sinclair/typebox").TString;
    client: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    policy_version: import("@sinclair/typebox").TString;
    policy_checksum: import("@sinclair/typebox").TString;
    scopes: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    allowed_transports: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"streamable_http">, import("@sinclair/typebox").TLiteral<"rest">, import("@sinclair/typebox").TLiteral<"sse">, import("@sinclair/typebox").TLiteral<"stdio">]>>;
    limits: import("@sinclair/typebox").TObject<{
        rate_limit_per_minute: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    }>;
    owner_contact: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    allowed_tools: import("@sinclair/typebox").TInteger;
    allowed_resources: import("@sinclair/typebox").TInteger;
}>;
export type McpClientSelfResource = Static<typeof McpClientSelfResource>;
//# sourceMappingURL=policy.d.ts.map