import { Static } from '@sinclair/typebox';
/**
 * DrillContext — Drill Stack Navigation contract.
 * Hierarchical navigation: Domain → Segment → Framework → KPI → Trend → Recommendation.
 * Tracks the current position and the navigation stack.
 * Wire format: snake_case JSON.
 *
 * Source: Adoption Blueprint G4.15 (drill)
 */
/** A single level on the drill navigation stack */
export declare const DrillLevel: import("@sinclair/typebox").TObject<{
    level: import("@sinclair/typebox").TString;
    id: import("@sinclair/typebox").TString;
    label: import("@sinclair/typebox").TString;
}>;
export type DrillLevel = Static<typeof DrillLevel>;
/**
 * DrillContext — current drill navigation position plus the stack
 * of levels traversed to reach it.
 */
export declare const DrillContext: import("@sinclair/typebox").TObject<{
    stack: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        level: import("@sinclair/typebox").TString;
        id: import("@sinclair/typebox").TString;
        label: import("@sinclair/typebox").TString;
    }>>;
    current_level: import("@sinclair/typebox").TString;
    current_id: import("@sinclair/typebox").TString;
    current_label: import("@sinclair/typebox").TString;
    domain: import("@sinclair/typebox").TString;
}>;
export type DrillContext = Static<typeof DrillContext>;
//# sourceMappingURL=drill-context.d.ts.map