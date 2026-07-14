import { Static } from '@sinclair/typebox';
export declare const ADAPTER_MANIFEST_SCHEMA_ID: "https://contracts.widgetdc.dev/execution/adapter-manifest.schema.json";
export declare const AdapterManifest: import("@sinclair/typebox").TObject<{
    $id: import("@sinclair/typebox").TLiteral<"https://contracts.widgetdc.dev/execution/adapter-manifest.schema.json">;
    adapter_id: import("@sinclair/typebox").TString;
    adapter_version: import("@sinclair/typebox").TString;
    protocol_version: import("@sinclair/typebox").TLiteral<"1.0.0">;
    supported_workflows: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"discover">, import("@sinclair/typebox").TLiteral<"define">, import("@sinclair/typebox").TLiteral<"develop">, import("@sinclair/typebox").TLiteral<"deliver">]>>;
    supported_roles: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"candidate_writer">, import("@sinclair/typebox").TLiteral<"specialist">, import("@sinclair/typebox").TLiteral<"verifier">]>>;
    input_schema_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    output_schema_ids: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    required_env_names: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    timeout_ms: import("@sinclair/typebox").TInteger;
    cancellation_supported: import("@sinclair/typebox").TBoolean;
    idempotency_supported: import("@sinclair/typebox").TBoolean;
    state_scope: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"isolated_run">, import("@sinclair/typebox").TLiteral<"adapter_local">]>;
    health_check_command: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
}>;
export type AdapterManifest = Static<typeof AdapterManifest>;
//# sourceMappingURL=adapter-manifest.d.ts.map