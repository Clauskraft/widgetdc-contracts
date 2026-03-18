import pandas as pd
import numpy as np
import logging
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine

# Set up logging
logger = logging.getLogger(__name__)

# Lazily initialized embedding model
_embedding_model = None

def get_embedding_model() -> SentenceTransformer:
    """Get or initialize the embedding model."""
    global _embedding_model
    if _embedding_model is None:
        model_name = "sentence-transformers/all-MiniLM-L6-v2"
        logger.info(f"Loading SentenceTransformer embedding model: {model_name}")
        _embedding_model = SentenceTransformer(model_name)
    return _embedding_model

def contextual_proximity(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate a set of direct and indirect edges based on shared context (chunks).
    """
    if df.empty:
        return df

    # Melt the dataframe into a list of nodes
    dfg_long = pd.melt(
        df, id_vars=["chunk_id"], value_vars=["node_1", "node_2"], value_name="node"
    )
    dfg_long.drop(columns=["variable"], inplace=True)
    
    # Self join with chunk id as the key will create a link between terms occurring in the same text chunk.
    dfg_wide = pd.merge(dfg_long, dfg_long, on="chunk_id", suffixes=("_1", "_2"))
    
    # Drop self loops
    self_loops_drop = dfg_wide[dfg_wide["node_1"] == dfg_wide["node_2"]].index
    dfg2 = dfg_wide.drop(index=self_loops_drop).reset_index(drop=True)
    
    # Group and count direct edges
    dfg2 = (
        dfg2.groupby(["node_1", "node_2"])
        .agg({"chunk_id": [",".join, "count"]})
        .reset_index()
    )
    dfg2.columns = ["node_1", "node_2", "chunk_id", "count"]
    dfg2.replace("", np.nan, inplace=True)
    dfg2.dropna(subset=["node_1", "node_2"], inplace=True)
    
    # Drop edges with 1 count
    dfg2 = dfg2[dfg2["count"] != 1]
    dfg2["edge"] = "contextual proximity"
    
    # Create a set of indirect edges based on shared intermediate nodes
    indirect_edges = []
    nodes = dfg2[['node_1', 'node_2']].stack().unique()
    
    for node in nodes:
        connected_nodes = pd.concat([
            dfg2[dfg2['node_1'] == node][['node_2', 'chunk_id']],
            dfg2[dfg2['node_2'] == node][['node_1', 'chunk_id']].rename(columns={'node_1': 'node_2'})
        ])
        
        for i in range(len(connected_nodes)):
            for j in range(i + 1, len(connected_nodes)):
                pair = sorted([connected_nodes.iloc[i]['node_2'], connected_nodes.iloc[j]['node_2']])
                chunk_ids = ','.join([connected_nodes.iloc[i]['chunk_id'], connected_nodes.iloc[j]['chunk_id']])
                indirect_edges.append((pair[0], pair[1], node, chunk_ids))
    
    indirect_df = pd.DataFrame(indirect_edges, columns=["node_1", "node_2", "via_node", "chunk_id"])
    indirect_df = (
        indirect_df.groupby(["node_1", "node_2"])
        .agg({"chunk_id": ",".join, "via_node": "count"})
        .reset_index()
    )
    indirect_df.columns = ["node_1", "node_2", "chunk_id", "count"]
    indirect_df["edge"] = "indirect contextual proximity"
    
    final_df = pd.concat([dfg2, indirect_df], ignore_index=True)
    final_df = (
        final_df.groupby(["node_1", "node_2", "edge"])
        .agg({"chunk_id": ",".join, "count": "sum"})
        .reset_index()
    )
    
    return final_df

def generate_embeddings(text_list: List[str]) -> np.ndarray:
    """Generate embeddings for a list of texts."""
    model = get_embedding_model()
    return model.encode(text_list)

def add_embeddings_to_df(df: pd.DataFrame) -> pd.DataFrame:
    """Add embeddings to the DataFrame based on combined text from nodes and edges."""
    if df.empty:
        return df
    df['combined_text'] = df.apply(lambda row: f"{row['node_1']} {row['edge']} {row['node_2']}", axis=1)
    embeddings = generate_embeddings(df['combined_text'].tolist())
    df['embedding'] = list(embeddings)
    return df

def find_relevant_relationships(query: str, df: pd.DataFrame, similarity_threshold: float = 0.5) -> pd.DataFrame:
    """Find relationships semantically relevant to the query."""
    if df.empty or 'embedding' not in df.columns:
        return pd.DataFrame()
    query_embedding = generate_embeddings([query])[0]
    df['similarity'] = df['embedding'].apply(lambda emb: 1 - cosine(query_embedding, emb))
    relevant_rows = df[df['similarity'] >= similarity_threshold].sort_values(by='similarity', ascending=False)
    return relevant_rows
