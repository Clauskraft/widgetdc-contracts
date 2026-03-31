import { Type } from '@sinclair/typebox';
/** Canonical source families for tri-source arbitration */
export const SourceFamily = Type.Union([
    Type.Literal('research'),
    Type.Literal('regulatory'),
    Type.Literal('enterprise'),
], { $id: 'SourceFamily', description: 'Canonical source family for tri-source arbitration' });
//# sourceMappingURL=source_family.js.map