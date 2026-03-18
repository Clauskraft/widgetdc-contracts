from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import UUID

class GraphNode(BaseModel):
    id: str
    label: str
    properties: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    source: str
    target: str
    label: str
    weight: float = 1.0
    properties: Dict[str, Any] = {}

class KnowledgeGraph(BaseModel):
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []

class PaperRequest(BaseModel):
    query: str
    max_papers: int = 5
    collection_name: Optional[str] = None

class PaperResponse(BaseModel):
    paper_id: str
    title: str
    authors: List[str]
    publish_date: Optional[str]
    abstract: str
    url: str
    graph: Optional[KnowledgeGraph] = None
