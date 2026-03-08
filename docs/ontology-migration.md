# Ontology Migration Runbook

## Prerequisites

- [ ] Ontology defined in docs/neo4j-ontology.md
- [ ] Instance model validated (50 nodes per label)
- [ ] Backup strategy confirmed (AuraDB snapshot)
- [ ] Batch size: 1,000 nodes max per MERGE operation
- [ ] Rollback queries prepared per batch

## Phase 1: StrategicInsight (21,596 nodes, ~22 batches)

Add ontology properties where missing:

```cypher
// Batch template (run with LIMIT 1000, repeat until 0 returned)
MATCH (n:StrategicInsight) WHERE n.asset_id IS NULL
WITH n LIMIT 1000
SET n.asset_id = coalesce(n.id, randomUUID()),
    n.updated_at = coalesce(n.updatedAt, n.lastUpdated, n.ingestedAt, n.harvestedAt, n.createdAt, datetime()),
    n.created_at = coalesce(n.createdAt, n.ingestedAt, n.harvestedAt, datetime()),
    n.source = coalesce(n.source, 'imported'),
    n.title = coalesce(n.title, n.question, left(coalesce(n.content, n.description, n.insight, ''), 100))
SET n:IntelligenceAsset
RETURN count(n) AS migrated
```

Rollback: `MATCH (n:StrategicInsight) WHERE n.asset_id IS NOT NULL REMOVE n:IntelligenceAsset REMOVE n.asset_id`

## Phase 2: Insight → StrategicInsight (17,986 nodes, ~18 batches)

```cypher
MATCH (n:Insight) WHERE NOT n:StrategicInsight
WITH n LIMIT 1000
SET n.asset_id = randomUUID(),
    n.title = coalesce(n.name, n.description, 'Untitled Insight'),
    n.content = coalesce(n.description, ''),
    n.insight_type = coalesce(n.type, 'pattern'),
    n.source = coalesce(n.source, 'imported'),
    n.created_at = coalesce(n.timestamp, datetime()),
    n.updated_at = coalesce(n.timestamp, datetime())
SET n:StrategicInsight:IntelligenceAsset
RETURN count(n) AS migrated
```

Rollback: `MATCH (n:Insight:StrategicInsight) REMOVE n:StrategicInsight:IntelligenceAsset`

## Phase 3: Knowledge types → KnowledgeAsset (~5,220 nodes, ~6 batches)

```cypher
// KnowledgeChunk (2,168)
MATCH (n:KnowledgeChunk) WHERE NOT n:KnowledgeAsset
WITH n LIMIT 1000
SET n.asset_id = coalesce(n.chunk_id, randomUUID()),
    n.title = coalesce(n.title, left(n.content, 100), 'Untitled Chunk'),
    n.source = coalesce(n.source, 'imported'),
    n.created_at = coalesce(n.created_at, datetime()),
    n.updated_at = coalesce(n.created_at, datetime())
SET n:KnowledgeAsset:IntelligenceAsset
RETURN count(n) AS migrated

// Knowledge (2,362)
MATCH (n:Knowledge) WHERE NOT n:KnowledgeAsset
WITH n LIMIT 1000
SET n.asset_id = randomUUID(),
    n.title = coalesce(n.title, n.phrase, n.category, 'Untitled Knowledge'),
    n.content = coalesce(n.content, n.content_snippet, n.phrase, ''),
    n.chunk_hash = coalesce(n.hash, null),
    n.source = coalesce(n.source, 'imported'),
    n.created_at = coalesce(n.ingestedAt, datetime()),
    n.updated_at = coalesce(n.ingestedAt, datetime())
SET n:KnowledgeAsset:IntelligenceAsset
RETURN count(n) AS migrated

// KnowledgeNode (690)
MATCH (n:KnowledgeNode) WHERE NOT n:KnowledgeAsset
WITH n LIMIT 1000
SET n.asset_id = randomUUID(),
    n.title = coalesce(n.name, 'Untitled Node'),
    n.content = coalesce(n.name, ''),
    n.source = coalesce(n.source, 'imported'),
    n.created_at = coalesce(n.harvestedAt, datetime()),
    n.updated_at = coalesce(n.harvestedAt, datetime())
SET n:KnowledgeAsset:IntelligenceAsset
RETURN count(n) AS migrated
```

## Phase 4: Validation

Run queries from docs/ontology-validation-queries.md in monorepo.
All counts should show 0 unmigrated nodes.

## Phase 5: Index Creation

```cypher
CREATE CONSTRAINT asset_id_unique IF NOT EXISTS
FOR (n:IntelligenceAsset) REQUIRE n.asset_id IS UNIQUE;

CREATE INDEX asset_source IF NOT EXISTS FOR (n:IntelligenceAsset) ON (n.source);
CREATE INDEX asset_domain IF NOT EXISTS FOR (n:IntelligenceAsset) ON (n.domain);
CREATE INDEX asset_created IF NOT EXISTS FOR (n:IntelligenceAsset) ON (n.created_at);
```
