import { Type } from '@sinclair/typebox';
/**
 * Canonical Neo4j node labels used across all 3 services.
 * All labels are PascalCase per convention.
 */
export const NodeLabel = Type.Union([
    // Consulting taxonomy
    Type.Literal('ConsultingDomain'),
    Type.Literal('L1ProcessFlow'),
    Type.Literal('L2SubProcess'),
    Type.Literal('Task'),
    // Engagement
    Type.Literal('Engagement'),
    Type.Literal('Track'),
    // Knowledge & evidence
    Type.Literal('Insight'),
    Type.Literal('StrategicInsight'),
    Type.Literal('Evidence'),
    Type.Literal('Claim'),
    Type.Literal('KnowledgePack'),
    Type.Literal('KnowledgePattern'),
    Type.Literal('Knowledge'),
    // Tools
    Type.Literal('MCPTool'),
    Type.Literal('Tool'),
    Type.Literal('CodeImplementation'),
    // Agents & self-model
    Type.Literal('Agent'),
    Type.Literal('AgentProfile'),
    Type.Literal('Session'),
    Type.Literal('Decision'),
    // Data governance
    Type.Literal('TDCDocument'),
    Type.Literal('SystemSnapshot'),
    Type.Literal('LocalFile'),
    Type.Literal('Entity'),
    Type.Literal('ExpansionSignal'),
    // Security & intelligence
    Type.Literal('CVE'),
    Type.Literal('CyberIntelligence'),
    Type.Literal('Directive'),
    // Methodology & quality
    Type.Literal('Methodology'),
    Type.Literal('KPI'),
    Type.Literal('AIPattern'),
    // Memory
    Type.Literal('Memory'),
    // Legal & regulatory
    Type.Literal('LegalAct'),
    Type.Literal('LegalConstraint'),
    Type.Literal('LegalUpdate'),
    Type.Literal('DanishAuthority'),
    // Financial
    Type.Literal('AnnualReport'),
    Type.Literal('FinancialStatement'),
    // Artifacts & deliverables (P0 — from Claude Artifacts pattern)
    Type.Literal('Artifact'),
    // Execution planning (P1 — from Manus planner_module pattern)
    Type.Literal('TaskPlan'),
    Type.Literal('PlanStep'),
    // User memory (P1 — from GPT-5 bio tool pattern)
    Type.Literal('UserPreference'),
    // Event audit (P1 — from Manus event_stream pattern)
    Type.Literal('EventStreamEntry'),
    // Code projects (P1 — from V0 CodeProject pattern)
    Type.Literal('CodeProject'),
    // Agent configuration (P1 — promoted from in-use AgentPersona)
    Type.Literal('PersonaConfig'),
    // LLM capabilities (P1 — from Claude 4 Opus capability mapping)
    Type.Literal('ModelCapability'),
    // Reusable agent templates (P1 — from GPTs collection pattern)
    Type.Literal('AgentBlueprint'),
    // OSINT & security intelligence (P2)
    Type.Literal('SearchDork'),
    Type.Literal('SecretPattern'),
    Type.Literal('InvestigationCase'),
    // Safety & governance (P2)
    Type.Literal('GuardrailRule'),
    Type.Literal('DataClassification'),
    // Research & knowledge (P2)
    Type.Literal('ResearchTask'),
    Type.Literal('ScopedKnowledge'),
    Type.Literal('DataSourceConfig'),
    Type.Literal('ProjectTemplate'),
    // Pillar 1-12 Dominance labels (P0 — research 2026-03-18)
    Type.Literal('ScavengerProbe'),
    Type.Literal('AdoptedIP'),
    Type.Literal('CompetitorShadow'),
    Type.Literal('GoldenEgg'),
    Type.Literal('FabricController'),
    Type.Literal('ExitPath'),
    Type.Literal('ComplianceGap'),
    Type.Literal('StrategicLeverage'),
    Type.Literal('AuditProof'),
    Type.Literal('CriticalFunction'),
    Type.Literal('ResilienceMetric'),
    Type.Literal('GridFunction'),
    Type.Literal('AnomalyPheromone'),
    Type.Literal('NormalizerConfig'),
], { $id: 'NodeLabel', description: 'Canonical Neo4j node labels' });
//# sourceMappingURL=labels.js.map