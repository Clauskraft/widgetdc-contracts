import logging
from typing import Awaitable, Callable, List, Optional, Dict, Any
import importlib
import os
logger = logging.getLogger(__name__)


def _load_aggregator_fetcher():
    try:
        from dotenv import load_dotenv
    except ModuleNotFoundError as exc:
        missing = exc.name or "dotenv"
        raise ImportError(
            "snout_engine.fetch_papers requires host/runtime dependencies. "
            f"Missing import: {missing}. Provide an explicit fetcher callable or "
            "install the required host adapter before promotion."
        ) from exc

    try:
        target = os.getenv(
            "SNOUT_PAPER_SOURCE_FETCHER_PATH",
            "app.services.paper_sources.aggregator:PaperSourceAggregator",
        )
        module_name, attr_name = target.split(":", 1)
        module = importlib.import_module(module_name)
        aggregator_type = getattr(module, attr_name)
    except Exception as exc:
        missing = getattr(exc, "name", None) or target
        raise ImportError(
            "snout_engine.fetch_papers requires a host paper-source adapter. "
            f"Missing import: {missing}. Provide an explicit fetcher callable or "
            "host runtime module before promotion."
        ) from exc

    load_dotenv()
    aggregator = aggregator_type()
    return aggregator.fetch_papers

async def fetch_papers(
    query: str,
    max_docs: int = 5,
    categories: Optional[List[str]] = None,
    date_from: Optional[str] = None,
    sources: Optional[List[str]] = None,
    paper_source_fetcher: Optional[
        Callable[..., Awaitable[List[Dict[str, Any]]]]
    ] = None,
) -> List[Dict[str, Any]]:
    """
    Fetch research papers from multiple sources based on a query.
    
    Args:
        query: Search query
        max_docs: Maximum number of documents to retrieve per source
        categories: Optional list of categories to filter by
        date_from: Optional date filter in format YYYY-MM-DD
        sources: Optional list of sources to use (defaults to all)
        
    Returns:
        List of dictionaries containing paper information
    """
    try:
        fetcher = paper_source_fetcher or _load_aggregator_fetcher()
        papers = await fetcher(
            query=query,
            sources=sources,
            max_docs_per_source=max_docs,
            categories=categories,
            date_from=date_from
        )
        
        logger.info(f"Total papers fetched from all sources: {len(papers)}")
        return papers
        
    except Exception as e:
        if isinstance(e, (ImportError, RuntimeError)):
            raise
        logger.error(f"Error in fetch_papers: {str(e)}", exc_info=True)
        return []
