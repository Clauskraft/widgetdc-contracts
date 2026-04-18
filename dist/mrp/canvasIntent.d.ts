/**
 * Canvas intent + resolution — UC1 of delegated-chasing-minsky plan.
 *
 * ConfiguratorEngine-principle applied to builder-surface selection.  The
 * orchestrator's `canvas_builder` MCP tool emits a CanvasIntent from a
 * free-form chat brief; the backend's CanvasIntentConfigurator resolves
 * it into a CanvasResolution that tells the host how to render.
 *
 * Wire format: snake_case JSON.
 */
import { Static } from '@sinclair/typebox';
export declare const BuilderTrack: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"textual">, import("@sinclair/typebox").TLiteral<"slide_flow">, import("@sinclair/typebox").TLiteral<"diagram">, import("@sinclair/typebox").TLiteral<"architecture">, import("@sinclair/typebox").TLiteral<"graphical">, import("@sinclair/typebox").TLiteral<"code">, import("@sinclair/typebox").TLiteral<"experiment">]>;
export type BuilderTrack = Static<typeof BuilderTrack>;
export declare const PaneId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"canvas">, import("@sinclair/typebox").TLiteral<"markdown">, import("@sinclair/typebox").TLiteral<"slides">, import("@sinclair/typebox").TLiteral<"drawio">, import("@sinclair/typebox").TLiteral<"split">]>;
export type PaneId = Static<typeof PaneId>;
export declare const CanvasIntent: import("@sinclair/typebox").TObject<{
    user_text: import("@sinclair/typebox").TString;
    surface_hint: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pane">, import("@sinclair/typebox").TLiteral<"full">, import("@sinclair/typebox").TLiteral<"overlay">]>>;
    sequence_step: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    prior_track: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"textual">, import("@sinclair/typebox").TLiteral<"slide_flow">, import("@sinclair/typebox").TLiteral<"diagram">, import("@sinclair/typebox").TLiteral<"architecture">, import("@sinclair/typebox").TLiteral<"graphical">, import("@sinclair/typebox").TLiteral<"code">, import("@sinclair/typebox").TLiteral<"experiment">]>>;
    compliance_tier: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"public">, import("@sinclair/typebox").TLiteral<"internal">, import("@sinclair/typebox").TLiteral<"legal">, import("@sinclair/typebox").TLiteral<"health">]>>;
    host_origin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    agent_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type CanvasIntent = Static<typeof CanvasIntent>;
export declare const CanvasNodeSeed: import("@sinclair/typebox").TObject<{
    label: import("@sinclair/typebox").TString;
    type: import("@sinclair/typebox").TString;
    payload: import("@sinclair/typebox").TUnknown;
    pane: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"canvas">, import("@sinclair/typebox").TLiteral<"markdown">, import("@sinclair/typebox").TLiteral<"slides">, import("@sinclair/typebox").TLiteral<"drawio">, import("@sinclair/typebox").TLiteral<"split">]>>;
}>;
export type CanvasNodeSeed = Static<typeof CanvasNodeSeed>;
export declare const CanvasResolution: import("@sinclair/typebox").TObject<{
    track: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"textual">, import("@sinclair/typebox").TLiteral<"slide_flow">, import("@sinclair/typebox").TLiteral<"diagram">, import("@sinclair/typebox").TLiteral<"architecture">, import("@sinclair/typebox").TLiteral<"graphical">, import("@sinclair/typebox").TLiteral<"code">, import("@sinclair/typebox").TLiteral<"experiment">]>;
    initial_pane: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"canvas">, import("@sinclair/typebox").TLiteral<"markdown">, import("@sinclair/typebox").TLiteral<"slides">, import("@sinclair/typebox").TLiteral<"drawio">, import("@sinclair/typebox").TLiteral<"split">]>;
    canvas_session_id: import("@sinclair/typebox").TString;
    embed_url: import("@sinclair/typebox").TString;
    pre_seeded_nodes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        label: import("@sinclair/typebox").TString;
        type: import("@sinclair/typebox").TString;
        payload: import("@sinclair/typebox").TUnknown;
        pane: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"canvas">, import("@sinclair/typebox").TLiteral<"markdown">, import("@sinclair/typebox").TLiteral<"slides">, import("@sinclair/typebox").TLiteral<"drawio">, import("@sinclair/typebox").TLiteral<"split">]>>;
    }>>>;
    rationale: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    fold_strategy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    bom_version: import("@sinclair/typebox").TLiteral<"2.0">;
    resolved_at: import("@sinclair/typebox").TString;
}>;
export type CanvasResolution = Static<typeof CanvasResolution>;
export declare const BridgeMessageType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"canvas.ready">, import("@sinclair/typebox").TLiteral<"canvas.node.create">, import("@sinclair/typebox").TLiteral<"canvas.node.update">, import("@sinclair/typebox").TLiteral<"canvas.node.delete">, import("@sinclair/typebox").TLiteral<"chat.update">, import("@sinclair/typebox").TLiteral<"chat.message">, import("@sinclair/typebox").TLiteral<"canvas.export">, import("@sinclair/typebox").TLiteral<"canvas.error">]>;
export type BridgeMessageType = Static<typeof BridgeMessageType>;
export declare const BridgeMessage: import("@sinclair/typebox").TObject<{
    type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"canvas.ready">, import("@sinclair/typebox").TLiteral<"canvas.node.create">, import("@sinclair/typebox").TLiteral<"canvas.node.update">, import("@sinclair/typebox").TLiteral<"canvas.node.delete">, import("@sinclair/typebox").TLiteral<"chat.update">, import("@sinclair/typebox").TLiteral<"chat.message">, import("@sinclair/typebox").TLiteral<"canvas.export">, import("@sinclair/typebox").TLiteral<"canvas.error">]>;
    session_id: import("@sinclair/typebox").TString;
    payload: import("@sinclair/typebox").TUnknown;
    ts: import("@sinclair/typebox").TString;
    origin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type BridgeMessage = Static<typeof BridgeMessage>;
//# sourceMappingURL=canvasIntent.d.ts.map