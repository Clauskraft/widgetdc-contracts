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
import { Type, Static } from '@sinclair/typebox'

export const BuilderTrack = Type.Union([
  Type.Literal('textual'),      // DocComposer, markdown pane
  Type.Literal('slide_flow'),   // SlideComposer, slide carousel
  Type.Literal('diagram'),      // DrawioService, drawio embed
  Type.Literal('architecture'), // ArchitectureConfigurator + canvas :Pattern nodes
  Type.Literal('graphical'),    // widgetdc-canvas React-Flow
  Type.Literal('code'),         // PatternBuilder
  Type.Literal('experiment'),   // InventorProxy
], { $id: 'BuilderTrack', description: '7 canonical builder tracks; canvas routes to the right one via configurator rules.' })

export type BuilderTrack = Static<typeof BuilderTrack>

export const PaneId = Type.Union([
  Type.Literal('canvas'),
  Type.Literal('markdown'),
  Type.Literal('slides'),
  Type.Literal('drawio'),
  Type.Literal('split'),
], { $id: 'PaneId' })

export type PaneId = Static<typeof PaneId>

export const CanvasIntent = Type.Object({
  user_text: Type.String({ minLength: 1, description: 'Free-form chat brief from the user.' }),
  surface_hint: Type.Optional(Type.Union([Type.Literal('pane'), Type.Literal('full'), Type.Literal('overlay')])),
  sequence_step: Type.Optional(Type.Integer({ minimum: 0, description: 'Multi-turn counter; >0 enables sticky-track rule.' })),
  prior_track: Type.Optional(BuilderTrack),
  compliance_tier: Type.Optional(Type.Union([
    Type.Literal('public'),
    Type.Literal('internal'),
    Type.Literal('legal'),
    Type.Literal('health'),
  ])),
  host_origin: Type.Optional(Type.String({ description: 'Embedding host URL (e.g. open-webui, librechat, office).' })),
  agent_id: Type.Optional(Type.String()),
}, {
  $id: 'CanvasIntent',
  description: 'Input to CanvasIntentConfigurator.resolve() — free-form brief + context features.',
})

export type CanvasIntent = Static<typeof CanvasIntent>

export const CanvasNodeSeed = Type.Object({
  label: Type.String(),
  type: Type.String({ description: 'CanvasNodeType from widgetdc-canvas (e.g. Artifact, Pattern, Agent).' }),
  payload: Type.Unknown({ description: 'Free-form node payload; shape depends on type.' }),
  pane: Type.Optional(PaneId),
}, { $id: 'CanvasNodeSeed', additionalProperties: true })

export type CanvasNodeSeed = Static<typeof CanvasNodeSeed>

export const CanvasResolution = Type.Object({
  track: BuilderTrack,
  initial_pane: PaneId,
  canvas_session_id: Type.String({ format: 'uuid' }),
  embed_url: Type.String({ format: 'uri', description: 'widgetdc-canvas URL with ?session=<id> — host iframes this.' }),
  pre_seeded_nodes: Type.Optional(Type.Array(CanvasNodeSeed)),
  rationale: Type.Array(Type.String(), { description: 'Ordered list of configurator-rule IDs that matched, most-recent last.' }),
  fold_strategy: Type.Optional(Type.String({ description: 'FoldTier (T1..T7) when input > 5k tokens.' })),
  bom_version: Type.Literal('2.0'),
  resolved_at: Type.String({ format: 'date-time' }),
}, {
  $id: 'CanvasResolution',
  description: 'CanvasIntentConfigurator.resolve() output; consumed by host pipeline/function to render iframe + seed nodes.',
})

export type CanvasResolution = Static<typeof CanvasResolution>

// ───────────────────────────────────────────────────────────────────────────
// postMessage bridge protocol between host (Open WebUI / LibreChat / Office)
// and widgetdc-canvas iframe.
// ───────────────────────────────────────────────────────────────────────────

export const BridgeMessageType = Type.Union([
  Type.Literal('canvas.ready'),          // canvas → host: "I'm mounted"
  Type.Literal('canvas.node.create'),    // host ← canvas: user created a node
  Type.Literal('canvas.node.update'),    // bidirectional
  Type.Literal('canvas.node.delete'),    // bidirectional
  Type.Literal('chat.update'),           // canvas → host: chat should reflect a canvas change
  Type.Literal('chat.message'),          // host → canvas: user sent a chat turn; canvas may update
  Type.Literal('canvas.export'),         // host → canvas: export artifact + close
  Type.Literal('canvas.error'),          // bidirectional error surface
], { $id: 'BridgeMessageType' })

export type BridgeMessageType = Static<typeof BridgeMessageType>

export const BridgeMessage = Type.Object({
  type: BridgeMessageType,
  session_id: Type.String({ format: 'uuid' }),
  payload: Type.Unknown(),
  ts: Type.String({ format: 'date-time' }),
  origin: Type.Optional(Type.String({ description: 'Sender window.location.origin; receiver must validate against allowlist.' })),
}, {
  $id: 'BridgeMessage',
  description: 'Typed envelope for two-way postMessage between host and canvas iframe.',
})

export type BridgeMessage = Static<typeof BridgeMessage>
