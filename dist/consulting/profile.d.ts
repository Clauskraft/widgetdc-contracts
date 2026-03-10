import { Static } from '@sinclair/typebox';
/** Combined domain identity and its intelligence status */
export declare const DomainHealthProfile: import("@sinclair/typebox").TObject<{
    domain_id: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"strategy_corp">, import("@sinclair/typebox").TLiteral<"deals_ma">, import("@sinclair/typebox").TLiteral<"financial_advisory">, import("@sinclair/typebox").TLiteral<"operations_supply_chain">, import("@sinclair/typebox").TLiteral<"technology_digital">, import("@sinclair/typebox").TLiteral<"ai_analytics">, import("@sinclair/typebox").TLiteral<"cybersecurity">, import("@sinclair/typebox").TLiteral<"risk_compliance_controls">, import("@sinclair/typebox").TLiteral<"tax_legal_adjacent">, import("@sinclair/typebox").TLiteral<"esg_sustainability">, import("@sinclair/typebox").TLiteral<"customer_marketing_sales">, import("@sinclair/typebox").TLiteral<"people_organization">, import("@sinclair/typebox").TLiteral<"pmo_change">, import("@sinclair/typebox").TLiteral<"industry_solutions">, import("@sinclair/typebox").TLiteral<"managed_services_operate">]>;
    health: import("@sinclair/typebox").TObject<{
        score: import("@sinclair/typebox").TNumber;
        trend: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"stable">]>;
        momentum: import("@sinclair/typebox").TNumber;
        resilience: import("@sinclair/typebox").TNumber;
        severity: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"CRITICAL">, import("@sinclair/typebox").TLiteral<"WARNING">, import("@sinclair/typebox").TLiteral<"INFO">, import("@sinclair/typebox").TLiteral<"OPTIMAL">]>;
        last_assessment: import("@sinclair/typebox").TString;
    }>;
    intelligence_assets_count: import("@sinclair/typebox").TInteger;
    risk_rules_triggered: import("@sinclair/typebox").TInteger;
    updated_at: import("@sinclair/typebox").TString;
}>;
export type DomainHealthProfile = Static<typeof DomainHealthProfile>;
//# sourceMappingURL=profile.d.ts.map