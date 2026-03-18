import { Type } from '@sinclair/typebox';
export const LauncherEvidenceFamily = Type.Union([
    Type.Literal('research'),
    Type.Literal('regulatory'),
    Type.Literal('enterprise'),
], {
    $id: 'LauncherEvidenceFamily',
    description: 'Canonical evidence families used by the launcher routing surface.',
});
export const LauncherEvidenceStatus = Type.Union([
    Type.Literal('grounded'),
    Type.Literal('coverage_gap'),
    Type.Literal('unavailable'),
], {
    $id: 'LauncherEvidenceStatus',
    description: 'Availability state for one evidence family inside the launcher packet.',
});
export const LauncherEvidenceItem = Type.Object({
    id: Type.String({
        description: 'Stable evidence identifier or runtime-derived synthetic key.',
    }),
    family: LauncherEvidenceFamily,
    title: Type.String({
        description: 'Human-readable evidence title suitable for launcher surfacing.',
    }),
    summary: Type.String({
        description: 'Short evidence summary for routing and operator review.',
    }),
    source_type: Type.String({
        description: 'Origin type such as graphrag, regulation, governance_read_model, or runtime_readback.',
    }),
    score: Type.Optional(Type.Number({
        description: 'Relative relevance score when available.',
    })),
    evidence_ref: Type.Optional(Type.String({
        description: 'Reference path, query id, or runtime correlation id for read-back.',
    })),
}, {
    $id: 'LauncherEvidenceItem',
    description: 'One surfaced evidence item inside the launcher packet.',
});
export const LauncherEvidenceFamilyPacket = Type.Object({
    family: LauncherEvidenceFamily,
    status: LauncherEvidenceStatus,
    summary: Type.String({
        description: 'Family-level summary used for launcher reasoning and UI surfacing.',
    }),
    evidence_items: Type.Array(LauncherEvidenceItem, {
        description: 'Top evidence items selected for this family.',
    }),
}, {
    $id: 'LauncherEvidenceFamilyPacket',
    description: 'Per-family launcher evidence payload.',
});
export const LauncherEvidencePacket = Type.Object({
    $id: Type.Literal('orchestrator/launcher-evidence-packet'),
    packet_id: Type.String({
        description: 'Stable packet identifier for routing lineage and read-back.',
    }),
    question: Type.String({
        description: 'Original launcher question used to build the packet.',
    }),
    domain: Type.String({
        description: 'Domain or org scope used during retrieval.',
    }),
    created_at: Type.String({
        format: 'date-time',
        description: 'Timestamp when the packet was created.',
    }),
    tri_source_ready: Type.Boolean({
        description: 'True when research, regulatory, and enterprise families all have usable evidence.',
    }),
    families: Type.Array(LauncherEvidenceFamilyPacket, {
        minItems: 3,
        maxItems: 3,
        description: 'Canonical tri-source evidence families for the launcher surface.',
    }),
    evidence_refs: Type.Array(Type.String(), {
        minItems: 1,
        description: 'References used for routing transparency and later read-back.',
    }),
    governance: Type.Object({
        promotion_status: Type.Union([
            Type.Literal('not_promoted'),
            Type.Literal('blocked'),
        ]),
        can_promote: Type.Boolean({
            description: 'Launcher evidence packets are read-only and cannot promote by themselves.',
        }),
        blocking_reasons: Type.Array(Type.String(), {
            description: 'Coverage gaps or governance blockers detected while building the packet.',
        }),
    }),
}, {
    $id: 'LauncherEvidencePacket',
    description: 'Canonical tri-source evidence packet for launcher routing. Read-only surface for backend and launcher coordination; not a promotion decision.',
});
//# sourceMappingURL=launcher-evidence-packet.js.map