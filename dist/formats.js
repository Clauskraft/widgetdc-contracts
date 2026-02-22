/**
 * TypeBox format validators.
 * Import this module (side-effect) before using Value.Check() on schemas with format annotations.
 */
import { FormatRegistry } from '@sinclair/typebox';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
FormatRegistry.Set('uuid', (value) => UUID_RE.test(value));
FormatRegistry.Set('date-time', (value) => !isNaN(Date.parse(value)));
//# sourceMappingURL=formats.js.map