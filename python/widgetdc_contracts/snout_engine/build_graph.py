import os
import logging
import asyncio
import networkx as nx
from typing import List, Dict, Any, Optional
from .models.schemas import KnowledgeGraph, GraphNode, GraphEdge
from .utils.nlp_utils import extract_entities_and_relations

# Set up logging
logger = logging.getLogger(__name__)

async def build_knowledge_graph(text_chunks: List[str]) -> KnowledgeGraph:
    """
    Build a knowledge graph from a list of text chunks.
    """
    all_nodes = {}
    all_edges = []
    
    logger.info(f"Building knowledge graph from {len(text_chunks)} chunks")
    
    for chunk in text_chunks:
        entities, relations = extract_entities_and_relations(chunk)
        
        # Add nodes
        for entity_name, entity_type in entities:
            if entity_name not in all_nodes:
                all_nodes[entity_name] = GraphNode(
                    id=entity_name,
                    label=entity_type,
                    properties={"name": entity_name}
                )
        
        # Add edges
        for source, label, target in relations:
            edge = GraphEdge(
                source=source,
                target=target,
                label=label,
                weight=1.0
            )
            all_edges.append(edge)
            
    return KnowledgeGraph(nodes=list(all_nodes.values()), edges=all_edges)

def convert_to_networkx(kg: KnowledgeGraph) -> nx.Graph:
    """
    Convert KnowledgeGraph to NetworkX graph for analysis.
    """
    G = nx.Graph()
    for node in kg.nodes:
        G.add_node(node.id, label=node.label, **node.properties)
    for edge in kg.edges:
        G.add_edge(edge.source, edge.target, label=edge.label, weight=edge.weight)
    return G
