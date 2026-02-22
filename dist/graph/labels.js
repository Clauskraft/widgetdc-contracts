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
], { $id: 'NodeLabel', description: 'Canonical Neo4j node labels' });
//# sourceMappingURL=labels.js.map