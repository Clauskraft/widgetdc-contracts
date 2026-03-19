import { Static } from '@sinclair/typebox';
export declare const WorkflowPhase: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"discover">, import("@sinclair/typebox").TLiteral<"define">, import("@sinclair/typebox").TLiteral<"develop">, import("@sinclair/typebox").TLiteral<"deliver">]>;
export type WorkflowPhase = Static<typeof WorkflowPhase>;
export declare const WorkflowType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"delivery">, import("@sinclair/typebox").TLiteral<"audit">, import("@sinclair/typebox").TLiteral<"debate">]>;
export type WorkflowType = Static<typeof WorkflowType>;
export declare const AgentWorkflowEnvelope: import("@sinclair/typebox").TObject<{
    workflow_id: import("@sinclair/typebox").TString;
    workflow_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"delivery">, import("@sinclair/typebox").TLiteral<"audit">, import("@sinclair/typebox").TLiteral<"debate">]>;
    current_phase: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"discover">, import("@sinclair/typebox").TLiteral<"define">, import("@sinclair/typebox").TLiteral<"develop">, import("@sinclair/typebox").TLiteral<"deliver">]>;
    participants: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"Claude">, import("@sinclair/typebox").TLiteral<"Gemini">, import("@sinclair/typebox").TLiteral<"DeepSeek">, import("@sinclair/typebox").TLiteral<"Grok">, import("@sinclair/typebox").TLiteral<"RLM">, import("@sinclair/typebox").TLiteral<"User">, import("@sinclair/typebox").TLiteral<"System">, import("@sinclair/typebox").TLiteral<"Orchestrator">]>, import("@sinclair/typebox").TString]>>;
    primary_surface: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"widgetdc-orchestrator">, import("@sinclair/typebox").TLiteral<"widgetdc-librechat">, import("@sinclair/typebox").TLiteral<"snout">]>;
    flow_ref: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"core-flow-1">, import("@sinclair/typebox").TLiteral<"core-flow-2">, import("@sinclair/typebox").TLiteral<"core-flow-3">]>;
    scorecard_ref: import("@sinclair/typebox").TString;
    reasoning_lineage_visible: import("@sinclair/typebox").TBoolean;
    quorum_consensus: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    compute_mode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"standard">, import("@sinclair/typebox").TLiteral<"extreme">]>>;
    phase_parameters: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
    started_at: import("@sinclair/typebox").TString;
    updated_at: import("@sinclair/typebox").TString;
}>;
export type AgentWorkflowEnvelope = Static<typeof AgentWorkflowEnvelope>;
//# sourceMappingURL=workflow-envelope.d.ts.map