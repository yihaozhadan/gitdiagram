from fastapi import APIRouter, Query
from typing import List, Dict
from functools import lru_cache
import inspect

# Import the cache function to access its cache
from .generate import get_cached_github_data

router = APIRouter(prefix="/cache", tags=["Cache"])

@router.get("/diagrams")
async def get_cached_diagrams(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    search: str | None = None
):
    # Get all cached items from the LRU cache
    cache = get_cached_github_data.cache_info()
    cache_dict = inspect.getcache(get_cached_github_data)
    
    # Extract repository information from cache
    diagrams = []
    for key in cache_dict:
        username, repo, _ = key  # Unpack the cache key (username, repo, github_pat)
        if search and search.lower() not in f"{username}/{repo}".lower():
            continue
        diagrams.append({
            "username": username,
            "repo": repo,
            "data": cache_dict[key]
        })
    
    # Calculate pagination
    total = len(diagrams)
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    
    return {
        "diagrams": diagrams[start_idx:end_idx],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
    }
