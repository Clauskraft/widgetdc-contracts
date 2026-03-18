"""Vector embedding support for semantic code search.

Optional module — requires `pip install code-review-graph[embeddings]`.
Falls back gracefully to keyword search when not installed.
"""

from __future__ import annotations

import sqlite3
import struct
from pathlib import Path
from typing import Any

from .graph import GraphNode, GraphStore, node_to_dict

# Lazy imports for optional dependencies
_model = None
_HAS_EMBEDDINGS = None


def _check_available() -> bool:
    """Check if sentence-transformers is installed."""
    global _HAS_EMBEDDINGS
    if _HAS_EMBEDDINGS is None:
        try:
            import numpy  # noqa: F401
            import sentence_transformers  # noqa: F401
            _HAS_EMBEDDINGS = True
        except ImportError:
            _HAS_EMBEDDINGS = False
    return _HAS_EMBEDDINGS


def _get_model():
    """Lazy-load the embedding model."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        # all-MiniLM-L6-v2: fast, 384-dim, good for code/text similarity
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


# ---------------------------------------------------------------------------
# SQLite vector storage (simple blob-based, no external vector DB)
# ---------------------------------------------------------------------------

_EMBEDDINGS_SCHEMA = """
CREATE TABLE IF NOT EXISTS embeddings (
    qualified_name TEXT PRIMARY KEY,
    vector BLOB NOT NULL,
    text_hash TEXT NOT NULL
);
"""


def _encode_vector(vec: list[float]) -> bytes:
    """Encode a float vector as a compact binary blob."""
    return struct.pack(f"{len(vec)}f", *vec)


def _decode_vector(blob: bytes) -> list[float]:
    """Decode a binary blob back to a float vector."""
    n = len(blob) // 4  # 4 bytes per float32
    return list(struct.unpack(f"{n}f", blob))


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(x * x for x in b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _node_to_text(node: GraphNode) -> str:
    """Convert a node to a searchable text representation."""
    parts = [node.name]
    if node.kind != "File":
        parts.append(node.kind.lower())
    if node.parent_name:
        parts.append(f"in {node.parent_name}")
    if node.params:
        parts.append(node.params)
    if node.return_type:
        parts.append(f"returns {node.return_type}")
    if node.language:
        parts.append(node.language)
    return " ".join(parts)


class EmbeddingStore:
    """Manages vector embeddings for graph nodes in SQLite."""

    def __init__(self, db_path: str | Path) -> None:
        self.available = _check_available()
        self.db_path = Path(db_path)
        self._conn = sqlite3.connect(str(self.db_path), timeout=30)
        self._conn.row_factory = sqlite3.Row
        self._conn.executescript(_EMBEDDINGS_SCHEMA)
        self._conn.commit()

    def close(self) -> None:
        self._conn.close()

    def embed_nodes(self, nodes: list[GraphNode], batch_size: int = 64) -> int:
        """Compute and store embeddings for a list of nodes.

        Skips nodes that already have up-to-date embeddings (based on text hash).
        Returns the number of newly embedded nodes.
        """
        if not self.available:
            return 0

        import hashlib
        model = _get_model()

        # Filter to nodes that need embedding
        to_embed: list[tuple[GraphNode, str, str]] = []
        for node in nodes:
            if node.kind == "File":
                continue  # Skip file nodes, they don't have meaningful names
            text = _node_to_text(node)
            text_hash = hashlib.sha256(text.encode()).hexdigest()

            existing = self._conn.execute(
                "SELECT text_hash FROM embeddings WHERE qualified_name = ?",
                (node.qualified_name,),
            ).fetchone()
            if existing and existing["text_hash"] == text_hash:
                continue
            to_embed.append((node, text, text_hash))

        if not to_embed:
            return 0

        # Batch encode
        texts = [t for _, t, _ in to_embed]
        vectors = model.encode(texts, batch_size=batch_size, show_progress_bar=False)

        for (node, _text, text_hash), vec in zip(to_embed, vectors):
            blob = _encode_vector(vec.tolist())
            self._conn.execute(
                """INSERT OR REPLACE INTO embeddings (qualified_name, vector, text_hash)
                   VALUES (?, ?, ?)""",
                (node.qualified_name, blob, text_hash),
            )

        self._conn.commit()
        return len(to_embed)

    def search(self, query: str, limit: int = 20) -> list[tuple[str, float]]:
        """Search for nodes by semantic similarity.

        Returns list of (qualified_name, similarity_score) sorted by score descending.
        Uses chunked processing to limit peak memory usage on large graphs.
        """
        if not self.available:
            return []

        model = _get_model()
        query_vec = model.encode([query], show_progress_bar=False)[0].tolist()

        # Process in chunks to limit peak memory for large codebases
        scored: list[tuple[str, float]] = []
        cursor = self._conn.execute("SELECT qualified_name, vector FROM embeddings")
        chunk_size = 500
        while True:
            rows = cursor.fetchmany(chunk_size)
            if not rows:
                break
            for row in rows:
                vec = _decode_vector(row["vector"])
                sim = _cosine_similarity(query_vec, vec)
                scored.append((row["qualified_name"], sim))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:limit]

    def remove_node(self, qualified_name: str) -> None:
        self._conn.execute(
            "DELETE FROM embeddings WHERE qualified_name = ?", (qualified_name,)
        )
        self._conn.commit()

    def count(self) -> int:
        return self._conn.execute("SELECT COUNT(*) FROM embeddings").fetchone()[0]


def embed_all_nodes(graph_store: GraphStore, embedding_store: EmbeddingStore) -> int:
    """Embed all non-file nodes in the graph. Returns count of newly embedded nodes."""
    if not embedding_store.available:
        return 0

    all_files = graph_store.get_all_files()
    all_nodes: list[GraphNode] = []
    for f in all_files:
        all_nodes.extend(graph_store.get_nodes_by_file(f))

    return embedding_store.embed_nodes(all_nodes)


def semantic_search(
    query: str,
    graph_store: GraphStore,
    embedding_store: EmbeddingStore,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """Search nodes using vector similarity, falling back to keyword search."""
    if embedding_store.available and embedding_store.count() > 0:
        results = embedding_store.search(query, limit=limit)
        output = []
        for qn, score in results:
            node = graph_store.get_node(qn)
            if node:
                d = node_to_dict(node)
                d["similarity_score"] = round(score, 4)
                output.append(d)
        return output

    # Fallback to keyword search
    nodes = graph_store.search_nodes(query, limit=limit)
    return [node_to_dict(n) for n in nodes]
