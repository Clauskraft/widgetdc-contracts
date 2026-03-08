# Neo4j Schema — Labels, Indexes, Constraints

## Labels (Post-Migration Target)

| Label | Type | Count (pre-migration) | Notes |
|-------|------|----------------------|-------|
| :IntelligenceAsset | ABSTRACT | 0 (new) | Added to all migrated nodes |
| :StrategicInsight | CONCRETE | 21,596 + 17,986 (from :Insight) | Primary insight type |
| :KnowledgeAsset | CONCRETE | ~5,220 (consolidated) | From Knowledge + KnowledgeChunk + KnowledgeNode |
| :Insight | LEGACY | 17,986 → 0 | Migrated to :StrategicInsight |
| :Knowledge | LEGACY | 2,362 → 0 | Migrated to :KnowledgeAsset |
| :KnowledgeChunk | LEGACY | 2,168 → 0 | Migrated to :KnowledgeAsset |
| :KnowledgeNode | LEGACY | 690 → 0 | Migrated to :KnowledgeAsset |

## Indexes

```cypher
CREATE INDEX asset_source IF NOT EXISTS FOR (n:IntelligenceAsset) ON (n.source);
CREATE INDEX asset_domain IF NOT EXISTS FOR (n:IntelligenceAsset) ON (n.domain);
CREATE INDEX asset_created IF NOT EXISTS FOR (n:IntelligenceAsset) ON (n.created_at);
CREATE INDEX si_insight_type IF NOT EXISTS FOR (n:StrategicInsight) ON (n.insight_type);
CREATE INDEX ka_chunk_hash IF NOT EXISTS FOR (n:KnowledgeAsset) ON (n.chunk_hash);
```

## Constraints

```cypher
CREATE CONSTRAINT asset_id_unique IF NOT EXISTS
FOR (n:IntelligenceAsset) REQUIRE n.asset_id IS UNIQUE;
```

## Existing Indexes (preserve)

Run `SHOW INDEXES` on AuraDB to get current list before migration.
Do NOT drop existing indexes — only add new ones.
