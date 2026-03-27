import { Static } from '@sinclair/typebox';
export declare const LauncherIntent: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"info">, import("@sinclair/typebox").TLiteral<"analyze">, import("@sinclair/typebox").TLiteral<"report">, import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"orchestrate">]>;
export type LauncherIntent = Static<typeof LauncherIntent>;
export declare const LauncherMode: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"tool_only">, import("@sinclair/typebox").TLiteral<"single">, import("@sinclair/typebox").TLiteral<"swarm">]>;
export type LauncherMode = Static<typeof LauncherMode>;
export declare const LauncherRequest: import("@sinclair/typebox").TObject<{
    input: import("@sinclair/typebox").TString;
    intent: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"info">, import("@sinclair/typebox").TLiteral<"analyze">, import("@sinclair/typebox").TLiteral<"report">, import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"orchestrate">]>;
    instruction: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    instructions: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type LauncherRequest = Static<typeof LauncherRequest>;
export declare const LauncherRequestEcho: import("@sinclair/typebox").TObject<{
    input: import("@sinclair/typebox").TString;
    intent: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"info">, import("@sinclair/typebox").TLiteral<"analyze">, import("@sinclair/typebox").TLiteral<"report">, import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"orchestrate">]>;
}>;
export type LauncherRequestEcho = Static<typeof LauncherRequestEcho>;
export declare const LauncherHandoffPayload: import("@sinclair/typebox").TObject<{
    intent: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"info">, import("@sinclair/typebox").TLiteral<"analyze">, import("@sinclair/typebox").TLiteral<"report">, import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"orchestrate">]>;
    prompt: import("@sinclair/typebox").TString;
    executionPath: import("@sinclair/typebox").TString;
}>;
export type LauncherHandoffPayload = Static<typeof LauncherHandoffPayload>;
export declare const LauncherPlanCore: import("@sinclair/typebox").TObject<{
    intent: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"info">, import("@sinclair/typebox").TLiteral<"analyze">, import("@sinclair/typebox").TLiteral<"report">, import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"orchestrate">]>;
    mode: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"tool_only">, import("@sinclair/typebox").TLiteral<"single">, import("@sinclair/typebox").TLiteral<"swarm">]>;
    lineageId: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"planned">, import("@sinclair/typebox").TLiteral<"in_progress">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"failed">]>;
    source: import("@sinclair/typebox").TLiteral<"widgetdc-launcher-prototype">;
    executionPath: import("@sinclair/typebox").TString;
    handoffPayload: import("@sinclair/typebox").TObject<{
        intent: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"info">, import("@sinclair/typebox").TLiteral<"analyze">, import("@sinclair/typebox").TLiteral<"report">, import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"orchestrate">]>;
        prompt: import("@sinclair/typebox").TString;
        executionPath: import("@sinclair/typebox").TString;
    }>;
}>;
export type LauncherPlanCore = Static<typeof LauncherPlanCore>;
export declare const LauncherGovernanceRoutePolicy: import("@sinclair/typebox").TObject<{
    foldingRequired: import("@sinclair/typebox").TBoolean;
    retrievalRequired: import("@sinclair/typebox").TBoolean;
    governanceRequired: import("@sinclair/typebox").TBoolean;
    graphVerificationRequired: import("@sinclair/typebox").TBoolean;
    renderValidationRequired: import("@sinclair/typebox").TBoolean;
}>;
export type LauncherGovernanceRoutePolicy = Static<typeof LauncherGovernanceRoutePolicy>;
export declare const LauncherGovernancePromotionPolicy: import("@sinclair/typebox").TObject<{
    qualityGate: import("@sinclair/typebox").TBoolean;
    policyAlignment: import("@sinclair/typebox").TBoolean;
    graphWriteVerification: import("@sinclair/typebox").TBoolean;
    readBackVerification: import("@sinclair/typebox").TBoolean;
    looseEndGenerationOnFailureOrBlock: import("@sinclair/typebox").TBoolean;
}>;
export type LauncherGovernancePromotionPolicy = Static<typeof LauncherGovernancePromotionPolicy>;
export declare const LauncherGovernanceGate: import("@sinclair/typebox").TObject<{
    gate: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pass">, import("@sinclair/typebox").TLiteral<"fail">, import("@sinclair/typebox").TLiteral<"skip">, import("@sinclair/typebox").TLiteral<"coverage_gap">]>;
    reasonCode: import("@sinclair/typebox").TString;
}>;
export type LauncherGovernanceGate = Static<typeof LauncherGovernanceGate>;
export declare const LauncherGovernanceSummary: import("@sinclair/typebox").TObject<{
    promotionStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"not_promoted">, import("@sinclair/typebox").TLiteral<"blocked">]>;
    looseEnd: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    gates: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        gate: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pass">, import("@sinclair/typebox").TLiteral<"fail">, import("@sinclair/typebox").TLiteral<"skip">, import("@sinclair/typebox").TLiteral<"coverage_gap">]>;
        reasonCode: import("@sinclair/typebox").TString;
    }>>;
    targetKind: import("@sinclair/typebox").TString;
    boundaryOwner: import("@sinclair/typebox").TString;
    routePolicy: import("@sinclair/typebox").TObject<{
        foldingRequired: import("@sinclair/typebox").TBoolean;
        retrievalRequired: import("@sinclair/typebox").TBoolean;
        governanceRequired: import("@sinclair/typebox").TBoolean;
        graphVerificationRequired: import("@sinclair/typebox").TBoolean;
        renderValidationRequired: import("@sinclair/typebox").TBoolean;
    }>;
    promotionPolicy: import("@sinclair/typebox").TObject<{
        qualityGate: import("@sinclair/typebox").TBoolean;
        policyAlignment: import("@sinclair/typebox").TBoolean;
        graphWriteVerification: import("@sinclair/typebox").TBoolean;
        readBackVerification: import("@sinclair/typebox").TBoolean;
        looseEndGenerationOnFailureOrBlock: import("@sinclair/typebox").TBoolean;
    }>;
    disclaimer: import("@sinclair/typebox").TString;
}>;
export type LauncherGovernanceSummary = Static<typeof LauncherGovernanceSummary>;
export declare const LauncherExecutionMetadata: import("@sinclair/typebox").TObject<{
    evidenceDomain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    reasonDomain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    canonicalGovernance: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnknown>;
    retrievalSummary: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    degradedReasoning: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    fallbackToReason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    fallbackFrom: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    fallbackError: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type LauncherExecutionMetadata = Static<typeof LauncherExecutionMetadata>;
export declare const LauncherExecution: import("@sinclair/typebox").TObject<{
    source: import("@sinclair/typebox").TString;
    summary: import("@sinclair/typebox").TString;
    trace: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    metadata: import("@sinclair/typebox").TObject<{
        evidenceDomain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        reasonDomain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        canonicalGovernance: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnknown>;
        retrievalSummary: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        degradedReasoning: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        fallbackToReason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        fallbackFrom: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        fallbackError: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    governance: import("@sinclair/typebox").TObject<{
        promotionStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"not_promoted">, import("@sinclair/typebox").TLiteral<"blocked">]>;
        looseEnd: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        gates: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            gate: import("@sinclair/typebox").TString;
            status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pass">, import("@sinclair/typebox").TLiteral<"fail">, import("@sinclair/typebox").TLiteral<"skip">, import("@sinclair/typebox").TLiteral<"coverage_gap">]>;
            reasonCode: import("@sinclair/typebox").TString;
        }>>;
        targetKind: import("@sinclair/typebox").TString;
        boundaryOwner: import("@sinclair/typebox").TString;
        routePolicy: import("@sinclair/typebox").TObject<{
            foldingRequired: import("@sinclair/typebox").TBoolean;
            retrievalRequired: import("@sinclair/typebox").TBoolean;
            governanceRequired: import("@sinclair/typebox").TBoolean;
            graphVerificationRequired: import("@sinclair/typebox").TBoolean;
            renderValidationRequired: import("@sinclair/typebox").TBoolean;
        }>;
        promotionPolicy: import("@sinclair/typebox").TObject<{
            qualityGate: import("@sinclair/typebox").TBoolean;
            policyAlignment: import("@sinclair/typebox").TBoolean;
            graphWriteVerification: import("@sinclair/typebox").TBoolean;
            readBackVerification: import("@sinclair/typebox").TBoolean;
            looseEndGenerationOnFailureOrBlock: import("@sinclair/typebox").TBoolean;
        }>;
        disclaimer: import("@sinclair/typebox").TString;
    }>;
}>;
export type LauncherExecution = Static<typeof LauncherExecution>;
export declare const LauncherResponse: import("@sinclair/typebox").TObject<{
    request: import("@sinclair/typebox").TObject<{
        input: import("@sinclair/typebox").TString;
        intent: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"info">, import("@sinclair/typebox").TLiteral<"analyze">, import("@sinclair/typebox").TLiteral<"report">, import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"orchestrate">]>;
    }>;
    plan: import("@sinclair/typebox").TObject<{
        intent: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"info">, import("@sinclair/typebox").TLiteral<"analyze">, import("@sinclair/typebox").TLiteral<"report">, import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"orchestrate">]>;
        mode: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"tool_only">, import("@sinclair/typebox").TLiteral<"single">, import("@sinclair/typebox").TLiteral<"swarm">]>;
        lineageId: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"planned">, import("@sinclair/typebox").TLiteral<"in_progress">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"failed">]>;
        source: import("@sinclair/typebox").TLiteral<"widgetdc-launcher-prototype">;
        executionPath: import("@sinclair/typebox").TString;
        handoffPayload: import("@sinclair/typebox").TObject<{
            intent: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"info">, import("@sinclair/typebox").TLiteral<"analyze">, import("@sinclair/typebox").TLiteral<"report">, import("@sinclair/typebox").TLiteral<"research">, import("@sinclair/typebox").TLiteral<"orchestrate">]>;
            prompt: import("@sinclair/typebox").TString;
            executionPath: import("@sinclair/typebox").TString;
        }>;
    }>;
    execution: import("@sinclair/typebox").TObject<{
        source: import("@sinclair/typebox").TString;
        summary: import("@sinclair/typebox").TString;
        trace: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        metadata: import("@sinclair/typebox").TObject<{
            evidenceDomain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            reasonDomain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            canonicalGovernance: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnknown>;
            retrievalSummary: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            degradedReasoning: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            fallbackToReason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            fallbackFrom: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            fallbackError: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>;
        governance: import("@sinclair/typebox").TObject<{
            promotionStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"not_promoted">, import("@sinclair/typebox").TLiteral<"blocked">]>;
            looseEnd: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            gates: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                gate: import("@sinclair/typebox").TString;
                status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pass">, import("@sinclair/typebox").TLiteral<"fail">, import("@sinclair/typebox").TLiteral<"skip">, import("@sinclair/typebox").TLiteral<"coverage_gap">]>;
                reasonCode: import("@sinclair/typebox").TString;
            }>>;
            targetKind: import("@sinclair/typebox").TString;
            boundaryOwner: import("@sinclair/typebox").TString;
            routePolicy: import("@sinclair/typebox").TObject<{
                foldingRequired: import("@sinclair/typebox").TBoolean;
                retrievalRequired: import("@sinclair/typebox").TBoolean;
                governanceRequired: import("@sinclair/typebox").TBoolean;
                graphVerificationRequired: import("@sinclair/typebox").TBoolean;
                renderValidationRequired: import("@sinclair/typebox").TBoolean;
            }>;
            promotionPolicy: import("@sinclair/typebox").TObject<{
                qualityGate: import("@sinclair/typebox").TBoolean;
                policyAlignment: import("@sinclair/typebox").TBoolean;
                graphWriteVerification: import("@sinclair/typebox").TBoolean;
                readBackVerification: import("@sinclair/typebox").TBoolean;
                looseEndGenerationOnFailureOrBlock: import("@sinclair/typebox").TBoolean;
            }>;
            disclaimer: import("@sinclair/typebox").TString;
        }>;
    }>;
}>;
export type LauncherResponse = Static<typeof LauncherResponse>;
export declare const OodaRuntimeContext: import("@sinclair/typebox").TObject<{
    graph_summary: import("@sinclair/typebox").TString;
    source_surface: import("@sinclair/typebox").TString;
    grounding_directive: import("@sinclair/typebox").TString;
    evidence_domain: import("@sinclair/typebox").TString;
    reason_domain: import("@sinclair/typebox").TString;
    report_layout_contract: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    evidence_context: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type OodaRuntimeContext = Static<typeof OodaRuntimeContext>;
export declare const OodaRuntimeRequest: import("@sinclair/typebox").TObject<{
    task: import("@sinclair/typebox").TString;
    task_id: import("@sinclair/typebox").TString;
    instruction: import("@sinclair/typebox").TString;
    instructions: import("@sinclair/typebox").TString;
    context: import("@sinclair/typebox").TObject<{
        graph_summary: import("@sinclair/typebox").TString;
        source_surface: import("@sinclair/typebox").TString;
        grounding_directive: import("@sinclair/typebox").TString;
        evidence_domain: import("@sinclair/typebox").TString;
        reason_domain: import("@sinclair/typebox").TString;
        report_layout_contract: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        evidence_context: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
}>;
export type OodaRuntimeRequest = Static<typeof OodaRuntimeRequest>;
export declare const ReasonRuntimeResponseContract: import("@sinclair/typebox").TObject<{
    jobStatement: import("@sinclair/typebox").TString;
    successShape: import("@sinclair/typebox").TString;
    requiredSections: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    boundaryRules: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    fallbackPolicy: import("@sinclair/typebox").TString;
}>;
export type ReasonRuntimeResponseContract = Static<typeof ReasonRuntimeResponseContract>;
export declare const ReasonRuntimeContext: import("@sinclair/typebox").TObject<{
    response_contract: import("@sinclair/typebox").TObject<{
        jobStatement: import("@sinclair/typebox").TString;
        successShape: import("@sinclair/typebox").TString;
        requiredSections: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        boundaryRules: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        fallbackPolicy: import("@sinclair/typebox").TString;
    }>;
    evidence_domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    reason_domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    enriched_prompt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    _quality_task: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    _skip_knowledge_enrichment: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    _output_mode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    _expected_format: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    require_swarm: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export type ReasonRuntimeContext = Static<typeof ReasonRuntimeContext>;
export declare const ReasonRuntimeRequest: import("@sinclair/typebox").TObject<{
    task: import("@sinclair/typebox").TString;
    domain: import("@sinclair/typebox").TString;
    context: import("@sinclair/typebox").TObject<{
        response_contract: import("@sinclair/typebox").TObject<{
            jobStatement: import("@sinclair/typebox").TString;
            successShape: import("@sinclair/typebox").TString;
            requiredSections: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
            boundaryRules: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
            fallbackPolicy: import("@sinclair/typebox").TString;
        }>;
        evidence_domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        reason_domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        enriched_prompt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        _quality_task: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        _skip_knowledge_enrichment: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        _output_mode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        _expected_format: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        require_swarm: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
}>;
export type ReasonRuntimeRequest = Static<typeof ReasonRuntimeRequest>;
export declare const ReasonRuntimeRouting: import("@sinclair/typebox").TObject<{
    provider: import("@sinclair/typebox").TString;
    model: import("@sinclair/typebox").TString;
    latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export type ReasonRuntimeRouting = Static<typeof ReasonRuntimeRouting>;
export declare const ReasonRuntimeTelemetry: import("@sinclair/typebox").TObject<{
    used_swarm: import("@sinclair/typebox").TBoolean;
    used_rag: import("@sinclair/typebox").TBoolean;
}>;
export type ReasonRuntimeTelemetry = Static<typeof ReasonRuntimeTelemetry>;
export declare const ReasonRuntimeResponse: import("@sinclair/typebox").TObject<{
    recommendation: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    reasoning: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    confidence: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    routing: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        provider: import("@sinclair/typebox").TString;
        model: import("@sinclair/typebox").TString;
        latency_ms: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>>;
    telemetry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        used_swarm: import("@sinclair/typebox").TBoolean;
        used_rag: import("@sinclair/typebox").TBoolean;
    }>>;
    reasoning_chain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
}>;
export type ReasonRuntimeResponse = Static<typeof ReasonRuntimeResponse>;
//# sourceMappingURL=launcher-contracts.d.ts.map