/**
 * MrpRouteEnvelope — wire-format envelope for every /api/mrp/* call.
 *
 * The backend's intelligenceInterceptor reads `_request_features`, runs the
 * 12-step chain, and passes `payload` on to the MRP handler. `intent` and
 * `evidence` are carried through for governance enforcement.
 *
 * Wire format: snake_case JSON.
 */
import { Type } from '@sinclair/typebox';
import { RequestFeatures } from './requestFeatures.js';
export const MrpRouteEnvelope = Type.Object({
    tool: Type.String({
        pattern: '^[a-z_]+\\.[a-z_]+$',
        description: 'MRP tool name in namespace.method format (e.g. "mrp.produce", "gdpr.erase").',
    }),
    payload: Type.Record(Type.String(), Type.Unknown(), {
        description: 'Tool-specific payload; shape governed by the individual MRP contracts.',
    }),
    intent: Type.Optional(Type.String({ description: 'Governance intent (required for write tools).' })),
    evidence: Type.Optional(Type.String({ description: 'Governance evidence (required for write tools).' })),
    _trace_id: Type.Optional(Type.String({ format: 'uuid' })),
    _request_features: Type.Optional(RequestFeatures),
}, {
    $id: 'MrpRouteEnvelope',
    description: 'Canonical envelope for /api/mrp/* requests — enables contract-validating middleware and default-on intelligence interception.',
});
//# sourceMappingURL=mrpRoute.js.map