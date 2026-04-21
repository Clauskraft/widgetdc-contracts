import { type Static } from '@sinclair/typebox';
export declare const OperatorPheromoneSignalType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"risk">, import("@sinclair/typebox").TLiteral<"novelty">, import("@sinclair/typebox").TLiteral<"question">, import("@sinclair/typebox").TLiteral<"claim">, import("@sinclair/typebox").TLiteral<"contradiction">, import("@sinclair/typebox").TLiteral<"breaking_change">, import("@sinclair/typebox").TLiteral<"opportunity">, import("@sinclair/typebox").TLiteral<"attention">]>;
export type OperatorPheromoneSignalType = Static<typeof OperatorPheromoneSignalType>;
export declare const PheromoneClientSurface: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"canvas">, import("@sinclair/typebox").TLiteral<"word_addin">, import("@sinclair/typebox").TLiteral<"excel_addin">, import("@sinclair/typebox").TLiteral<"web_overlay">, import("@sinclair/typebox").TLiteral<"filesystem_shell">]>;
export type PheromoneClientSurface = Static<typeof PheromoneClientSurface>;
export declare const ResourceAnchorInput: import("@sinclair/typebox").TObject<{
    anchor_kind: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"docx-page">, import("@sinclair/typebox").TLiteral<"docx-paragraph">, import("@sinclair/typebox").TLiteral<"xlsx-cell">, import("@sinclair/typebox").TLiteral<"xlsx-range">, import("@sinclair/typebox").TLiteral<"file">, import("@sinclair/typebox").TLiteral<"folder">, import("@sinclair/typebox").TLiteral<"pdf-page">, import("@sinclair/typebox").TLiteral<"web-url">, import("@sinclair/typebox").TLiteral<"web-selection">, import("@sinclair/typebox").TLiteral<"code-span">]>;
    resource_uri: import("@sinclair/typebox").TString;
    resource_label: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    locator_json: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
    anchor_text: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    content_fingerprint: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type ResourceAnchorInput = Static<typeof ResourceAnchorInput>;
export declare const CreateOperatorAnchoredPheromoneRequest: import("@sinclair/typebox").TObject<{
    anchor: import("@sinclair/typebox").TObject<{
        anchor_kind: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"docx-page">, import("@sinclair/typebox").TLiteral<"docx-paragraph">, import("@sinclair/typebox").TLiteral<"xlsx-cell">, import("@sinclair/typebox").TLiteral<"xlsx-range">, import("@sinclair/typebox").TLiteral<"file">, import("@sinclair/typebox").TLiteral<"folder">, import("@sinclair/typebox").TLiteral<"pdf-page">, import("@sinclair/typebox").TLiteral<"web-url">, import("@sinclair/typebox").TLiteral<"web-selection">, import("@sinclair/typebox").TLiteral<"code-span">]>;
        resource_uri: import("@sinclair/typebox").TString;
        resource_label: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        locator_json: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
        anchor_text: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        content_fingerprint: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    signal_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"risk">, import("@sinclair/typebox").TLiteral<"novelty">, import("@sinclair/typebox").TLiteral<"question">, import("@sinclair/typebox").TLiteral<"claim">, import("@sinclair/typebox").TLiteral<"contradiction">, import("@sinclair/typebox").TLiteral<"breaking_change">, import("@sinclair/typebox").TLiteral<"opportunity">, import("@sinclair/typebox").TLiteral<"attention">]>;
    rationale: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    strength: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    created_by: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    client_surface: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"canvas">, import("@sinclair/typebox").TLiteral<"word_addin">, import("@sinclair/typebox").TLiteral<"excel_addin">, import("@sinclair/typebox").TLiteral<"web_overlay">, import("@sinclair/typebox").TLiteral<"filesystem_shell">]>;
    client_session_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    consent_grant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type CreateOperatorAnchoredPheromoneRequest = Static<typeof CreateOperatorAnchoredPheromoneRequest>;
export declare const CreateOperatorAnchoredPheromoneResponse: import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"accepted">;
    pheromone_id: import("@sinclair/typebox").TString;
    anchor_id: import("@sinclair/typebox").TString;
    inspection_enqueued: import("@sinclair/typebox").TBoolean;
    accepted_at: import("@sinclair/typebox").TString;
    directive_run_id: import("@sinclair/typebox").TString;
}>;
export type CreateOperatorAnchoredPheromoneResponse = Static<typeof CreateOperatorAnchoredPheromoneResponse>;
export declare const PheromoneInspectionVerdict: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"informational">, import("@sinclair/typebox").TLiteral<"relevant">, import("@sinclair/typebox").TLiteral<"novel">, import("@sinclair/typebox").TLiteral<"contradictory">, import("@sinclair/typebox").TLiteral<"breaking">, import("@sinclair/typebox").TLiteral<"incorrect">, import("@sinclair/typebox").TLiteral<"needs_review">]>;
export type PheromoneInspectionVerdict = Static<typeof PheromoneInspectionVerdict>;
export declare const InspectOperatorAnchoredPheromoneResponse: import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TLiteral<"completed">;
    pheromone_id: import("@sinclair/typebox").TString;
    inspection_id: import("@sinclair/typebox").TString;
    verdict: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"informational">, import("@sinclair/typebox").TLiteral<"relevant">, import("@sinclair/typebox").TLiteral<"novel">, import("@sinclair/typebox").TLiteral<"contradictory">, import("@sinclair/typebox").TLiteral<"breaking">, import("@sinclair/typebox").TLiteral<"incorrect">, import("@sinclair/typebox").TLiteral<"needs_review">]>;
    candidate_actions: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
}>;
export type InspectOperatorAnchoredPheromoneResponse = Static<typeof InspectOperatorAnchoredPheromoneResponse>;
export declare const PromoteOperatorAnchoredPheromoneRequest: import("@sinclair/typebox").TObject<{
    target_kind: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"innovation_ticket">, import("@sinclair/typebox").TLiteral<"training_proposal">, import("@sinclair/typebox").TLiteral<"contradiction_review">]>;
}>;
export type PromoteOperatorAnchoredPheromoneRequest = Static<typeof PromoteOperatorAnchoredPheromoneRequest>;
export declare const PromoteOperatorAnchoredPheromoneResponse: import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"accepted">, import("@sinclair/typebox").TLiteral<"rejected">]>;
    pheromone_id: import("@sinclair/typebox").TString;
    target_kind: import("@sinclair/typebox").TString;
    target_id: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    rejection_reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type PromoteOperatorAnchoredPheromoneResponse = Static<typeof PromoteOperatorAnchoredPheromoneResponse>;
export declare const HumanSignaledPheromoneTriggerRequest: import("@sinclair/typebox").TObject<{
    source: import("@sinclair/typebox").TString;
    domain: import("@sinclair/typebox").TString;
    label: import("@sinclair/typebox").TString;
    signal_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"risk">, import("@sinclair/typebox").TLiteral<"novelty">, import("@sinclair/typebox").TLiteral<"question">, import("@sinclair/typebox").TLiteral<"claim">, import("@sinclair/typebox").TLiteral<"contradiction">, import("@sinclair/typebox").TLiteral<"breaking_change">, import("@sinclair/typebox").TLiteral<"opportunity">, import("@sinclair/typebox").TLiteral<"attention">]>;
    client_surface: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"canvas">, import("@sinclair/typebox").TLiteral<"word_addin">, import("@sinclair/typebox").TLiteral<"excel_addin">, import("@sinclair/typebox").TLiteral<"web_overlay">, import("@sinclair/typebox").TLiteral<"filesystem_shell">]>;
    strength: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    rationale: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    metrics: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TNumber>>;
    anchor: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        anchor_kind: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"docx-page">, import("@sinclair/typebox").TLiteral<"docx-paragraph">, import("@sinclair/typebox").TLiteral<"xlsx-cell">, import("@sinclair/typebox").TLiteral<"xlsx-range">, import("@sinclair/typebox").TLiteral<"file">, import("@sinclair/typebox").TLiteral<"folder">, import("@sinclair/typebox").TLiteral<"pdf-page">, import("@sinclair/typebox").TLiteral<"web-url">, import("@sinclair/typebox").TLiteral<"web-selection">, import("@sinclair/typebox").TLiteral<"code-span">]>;
        resource_uri: import("@sinclair/typebox").TString;
        resource_label: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        locator_json: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
        anchor_text: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        content_fingerprint: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export type HumanSignaledPheromoneTriggerRequest = Static<typeof HumanSignaledPheromoneTriggerRequest>;
export declare const HumanSignaledPheromoneTriggerResponse: import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"accepted">, import("@sinclair/typebox").TLiteral<"rejected">]>;
    domain: import("@sinclair/typebox").TString;
    signal_type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"risk">, import("@sinclair/typebox").TLiteral<"novelty">, import("@sinclair/typebox").TLiteral<"question">, import("@sinclair/typebox").TLiteral<"claim">, import("@sinclair/typebox").TLiteral<"contradiction">, import("@sinclair/typebox").TLiteral<"breaking_change">, import("@sinclair/typebox").TLiteral<"opportunity">, import("@sinclair/typebox").TLiteral<"attention">]>;
    client_surface: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"canvas">, import("@sinclair/typebox").TLiteral<"word_addin">, import("@sinclair/typebox").TLiteral<"excel_addin">, import("@sinclair/typebox").TLiteral<"web_overlay">, import("@sinclair/typebox").TLiteral<"filesystem_shell">]>;
    message: import("@sinclair/typebox").TString;
    accepted_at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type HumanSignaledPheromoneTriggerResponse = Static<typeof HumanSignaledPheromoneTriggerResponse>;
//# sourceMappingURL=operatorAnchoredPheromone.d.ts.map