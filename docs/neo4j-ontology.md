# Neo4j Ontology Definition (WidgeTDC)

**Version**: 1.0.0
**Owner**: widgetdc-contracts
**Status**: Defined (pending migration in Fase 6)

## Abstract Types

### :IntelligenceAsset (ABSTRACT)

Base type for all intelligence and knowledge nodes.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| asset_id | STRING | YES, UNIQUE | Stable identifier |
| title | STRING | YES | Human-readable title |
| content | TEXT | NO | Full text content |
| source | STRING | YES | Origin system (rlm, harvester, manual, graphrag, imported) |
| source_type | ENUM | NO | [rlm, harvester, manual, graphrag, imported] |
| domain | STRING | NO | Consulting domain ID (STR, FIN, OPS, etc.) |
| confidence | FLOAT | NO | 0.0-1.0 confidence score |
| created_at | DATETIME | YES | Creation timestamp |
| updated_at | DATETIME | YES | Last modification |

## Concrete Types

### :StrategicInsight EXTENDS :IntelligenceAsset

Strategic findings, trends, risks, and opportunities.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| insight_type | ENUM | NO | [trend, risk, opportunity, pattern] |
| evidence_count | INTEGER | NO | Number of supporting evidence items |
| actionability | FLOAT | NO | 0.0-1.0 actionability score |

**Current count**: 21,596 nodes
**Migration**: Add missing `asset_id`, `source`, `created_at`, `updated_at` where null.

### :KnowledgeAsset EXTENDS :IntelligenceAsset

Knowledge chunks, documents, and harvested content.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| chunk_hash | STRING | NO | Content hash for dedup |
| importance | FLOAT | NO | 0.0-1.0 importance score |
| embedding_id | STRING | NO | Reference to vector embedding |

**Consolidates**: Knowledge (2,362) + KnowledgeChunk (2,168) + KnowledgeNode (690)
**Total**: ~5,220 nodes → :KnowledgeAsset

### :Insight → MIGRATE TO :StrategicInsight

**Current count**: 17,986 nodes
**Migration**: Map existing properties to :StrategicInsight schema, add :IntelligenceAsset label.

## Property Mapping (Existing → Ontology)

### StrategicInsight (21,596 nodes)
```
title          → title (KEEP)
content/text   → content (NORMALIZE)
insight_type   → insight_type (KEEP)
source         → source (KEEP, default 'manual')
confidence     → confidence (KEEP)
created_at     → created_at (KEEP)
NEW: asset_id  → generate UUID where null
NEW: updated_at → copy from created_at where null
```

### Insight (17,986 nodes)
```
title/name     → title (NORMALIZE)
content/text   → content (NORMALIZE)
type/category  → insight_type (MAP)
source         → source (default 'imported')
NEW: asset_id  → generate UUID
NEW: created_at → generate from node ID timestamp or current
NEW: updated_at → same as created_at
ADD LABEL: :StrategicInsight
```

### Knowledge (2,362) + KnowledgeChunk (2,168) + KnowledgeNode (690)
```
title/name     → title (NORMALIZE)
content/text   → content (NORMALIZE)
hash/chunk_hash → chunk_hash (NORMALIZE)
importance     → importance (KEEP)
embedding_id   → embedding_id (KEEP)
source         → source (default 'imported')
NEW: asset_id  → generate UUID
ADD LABEL: :KnowledgeAsset
```

## Migration Plan

1. **Instance model** (50 nodes per label): Validate property mapping correctness
2. **Batch 1**: StrategicInsight — add missing `asset_id`, `updated_at` (21,596 nodes, 22 batches of 1,000)
3. **Batch 2**: Insight → add :StrategicInsight label + mapped properties (17,986 nodes, 18 batches)
4. **Batch 3**: Knowledge + KnowledgeChunk + KnowledgeNode → :KnowledgeAsset (5,220 nodes, 6 batches)
5. **Validation**: Run instance model queries on migrated data
6. **CI check**: Add validation queries to CI pipeline

## Indexes and Constraints

```cypher
CREATE CONSTRAINT asset_id_unique IF NOT EXISTS
FOR (n:IntelligenceAsset) REQUIRE n.asset_id IS UNIQUE;

CREATE INDEX asset_source IF NOT EXISTS
FOR (n:IntelligenceAsset) ON (n.source);

CREATE INDEX asset_domain IF NOT EXISTS
FOR (n:IntelligenceAsset) ON (n.domain);

CREATE INDEX asset_created IF NOT EXISTS
FOR (n:IntelligenceAsset) ON (n.created_at);
```

## Orphan Domain Consolidation (12 domains)

| Orphan Domain | Action | Target |
|---------------|--------|--------|
| Legal & Compliance | MERGE → LEG (Legal Advisory) | Overlap confirmed |
| Data & Privacy | MERGE → CYB (Cybersecurity) | Subset |
| Strategy & M&A | MERGE → STR (Strategy) | Overlap confirmed |
| Digital Transformation | MERGE → DIG (Digital & Analytics) | Overlap confirmed |
| Tax Advisory | MERGE → FIN (Financial) | Subset |
| EU Funding & Projects | MERGE → STR (Strategy) | Related |
| Strategy Consulting | MERGE → STR (Strategy) | Duplicate |
| Risk Management | MERGE → RCM (Risk & Compliance) | Overlap confirmed |
| Technology & Digital | MERGE → TEC (Technology) | Duplicate |
| Strategy & Transformation | MERGE → STR (Strategy) | Duplicate |
| Management Consulting | MERGE → OPS (Operations) | General |
| Risk Advisory | MERGE → RCM (Risk & Compliance) | Duplicate |
