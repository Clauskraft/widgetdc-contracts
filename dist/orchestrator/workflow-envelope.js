import { Type } from '@sinclair/typebox';
import { AgentId } from './agent-message.js';
export const WorkflowPhase = Type.Union([
    Type.Literal('discover'),
    Type.Literal('define'),
    Type.Literal('develop'),
    Type.Literal('deliver'),
], {
    $id: 'WorkflowPhase',
    description: 'Canonical orchestration phases, narrowed for orchestrator/librechat/snout usage only.',
});
export const WorkflowType = Type.Union([
    Type.Literal('research'),
    Type.Literal('delivery'),
    Type.Literal('audit'),
    Type.Literal('debate'),
], {
    $id: 'WorkflowType',
    description: 'Workflow families allowed for the scoped orchestration layer.',
});
export const AgentWorkflowEnvelope = Type.Object({
    workflow_id: Type.String({
        description: 'Stable workflow identifier for orchestration lineage.',
    }),
    workflow_type: WorkflowType,
    current_phase: WorkflowPhase,
    participants: Type.Array(Type.Union([AgentId, Type.String()]), {
        minItems: 1,
        uniqueItems: true,
        description: 'Participants involved in the current workflow envelope.',
    }),
    primary_surface: Type.Union([
        Type.Literal('widgetdc-orchestrator'),
        Type.Literal('widgetdc-librechat'),
        Type.Literal('snout'),
    ], {
        description: 'Primary consumer/runtime that owns this workflow envelope.',
    }),
    flow_ref: Type.Union([
        Type.Literal('core-flow-1'),
        Type.Literal('core-flow-2'),
        Type.Literal('core-flow-3'),
    ], {
        description: 'Canonical LIN-165 flow strengthened by this workflow.',
    }),
    scorecard_ref: Type.String({
        description: 'Reference to the decision-quality scorecard batch or evidence packet.',
    }),
    reasoning_lineage_visible: Type.Boolean({
        description: 'Whether the workflow lineage may be surfaced in LibreChat or other approved consumers.',
    }),
    quorum_consensus: Type.Optional(Type.Boolean({
        description: 'Set when a workflow requires explicit agreement before progressing.',
    })),
    started_at: Type.String({
        format: 'date-time',
        description: 'Workflow start timestamp.',
    }),
    updated_at: Type.String({
        format: 'date-time',
        description: 'Last workflow state update timestamp.',
    }),
}, {
    $id: 'AgentWorkflowEnvelope',
    description: 'Minimal workflow envelope for orchestrator routing and lineage. Not a platform-wide execution bus or governance replacement.',
});
//# sourceMappingURL=workflow-envelope.js.map