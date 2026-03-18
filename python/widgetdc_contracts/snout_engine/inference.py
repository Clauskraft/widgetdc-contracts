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
    
    Args:
        df: DataFrame with columns [node_1, node_2, edge, chunk_id]
        
    Returns:
        DataFrame with additional 'indirect contextual proximity' edges.
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
    
    # Drop edges with 1 count (optional, depending on your use case)
    dfg2 = dfg2[dfg2["count"] != 1]
    dfg2["edge"] = "contextual proximity"
    
    # Create a set of indirect edges based on shared intermediate nodes
    indirect_edges = []
    nodes = dfg2[['node_1', 'node_2']].stack().unique()
    
    for node in nodes:
        # Get all nodes directly connected to the current node
        connected_nodes = pd.concat([
            dfg2[dfg2['node_1'] == node][['node_2', 'chunk_id']],
            dfg2[dfg2['node_2'] == node][['node_1', 'chunk_id']].rename(columns={'node_1': 'node_2'})
        ])
        
        # Create pairs of these connected nodes
        for i in range(len(connected_nodes)):
            for j in range(i + 1, len(connected_nodes)):
                pair = sorted([connected_nodes.iloc[i]['node_2'], connected_nodes.iloc[j]['node_2']])
                chunk_ids = ','.join([connected_nodes.iloc[i]['chunk_id'], connected_nodes.iloc[j]['chunk_id']])
                
                indirect_edges.append((pair[0], pair[1], node, chunk_ids))
    
    # Convert indirect edges into a DataFrame and combine with direct edges
    indirect_df = pd.DataFrame(indirect_edges, columns=["node_1", "node_2", "via_node", "chunk_id"])
    
    # Group by to aggregate chunk_ids and count indirect edges
    indirect_df = (
        indirect_df.groupby(["node_1", "node_2"])
        .agg({"chunk_id": ",".join, "via_node": "count"})
        .reset_index()
    )
    indirect_df.columns = ["node_1", "node_2", "chunk_id", "count"]
    indirect_df["edge"] = "indirect contextual proximity"
    
    # Merge indirect edges with the direct edges
    final_df = pd.concat([dfg2, indirect_df], ignore_index=True)
    
    # Handle cases where direct and indirect edges might overlap
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
        
    # Combine node_1, edge, and node_2 into a single text string
    df['combined_text'] = df.apply(lambda row: f"{row['node_1']} {row['edge']} {row['node_2']}", axis=1)
    
    # Generate embeddings for the combined text
    embeddings = generate_embeddings(df['combined_text'].tolist())
    
    # Store embeddings in the DataFrame
    df['embedding'] = list(embeddings)
    
    return df

def find_relevant_relationships(query: str, df: pd.DataFrame, similarity_threshold: float = 0.5) -> pd.DataFrame:
    """
    Find relationships in the graph that are semantically relevant to the query.
    
    Args:
        query: User's natural language query
        df: DataFrame with embeddings
        similarity_threshold: Minimum cosine similarity score
        
    Returns:
        Filtered DataFrame with relevant relationships
    """
    if df.empty or 'embedding' not in df.columns:
        return pd.DataFrame()
        
    # Generate an embedding for the user query
    query_embedding = generate_embeddings([query])[0]
    
    # Compute cosine similarity
    df['similarity'] = df['embedding'].apply(lambda emb: 1 - cosine(query_embedding, emb))
    
    # Filter based on threshold
    relevant_rows = df[df['similarity'] >= similarity_threshold].sort_values(by='similarity', ascending=False)
    
    return relevant_rows
