from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.movie import MovieResponse, MovieCreate, MovieUpdate
from app.core.database import db_manager
from app.core.seed_data import SEED_MOVIES

router = APIRouter()

# In-memory store fallback when MongoDB is offline
MOVIES_REPO = {m["id"]: m.copy() for m in SEED_MOVIES}

@router.get("", response_model=List[MovieResponse])
async def get_movies(
    city: Optional[str] = Query(None, description="Filter movies by city slug (e.g. mumbai, delhi)"),
    status: Optional[str] = Query(None, description="NOW_SHOWING or UPCOMING"),
    genre: Optional[str] = Query(None, description="Genre name"),
    language: Optional[str] = Query(None, description="Language name"),
    search: Optional[str] = Query(None, description="Search query in title, director, cast")
):
    """List movies with multi-faceted filtering and search"""
    if db_manager.is_connected:
        try:
            query = {}
            if status:
                query["status"] = status
            if city:
                query["cities"] = city
            if genre and genre != "All":
                query["genres"] = genre
            if language and language != "All":
                query["languages"] = language
            if search:
                query["$text"] = {"$search": search}
            
            cursor = db_manager.db.movies.find(query).sort("rating", -1)
            results = []
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                results.append(doc)
            return results
        except Exception as e:
            pass # Fallback to in-memory

    # In-memory filtered response
    results = list(MOVIES_REPO.values())
    if status:
        results = [m for m in results if m["status"] == status]
    if city:
        results = [m for m in results if city in m.get("cities", ["mumbai", "delhi"])]
    if genre and genre != "All":
        results = [m for m in results if genre in m.get("genres", [])]
    if language and language != "All":
        results = [m for m in results if language in m.get("languages", [])]
    if search:
        s_lower = search.lower()
        results = [
            m for m in results
            if s_lower in m["title"].lower() or s_lower in m["director"].lower()
        ]
    return results

@router.get("/featured", response_model=List[MovieResponse])
async def get_featured_movies():
    """Retrieve featured blockbusters for home banner spotlight"""
    if db_manager.is_connected:
        try:
            cursor = db_manager.db.movies.find({"is_featured": True}).limit(5)
            results = []
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                results.append(doc)
            return results
        except Exception:
            pass

    return [m for m in MOVIES_REPO.values() if m.get("is_featured")]

@router.get("/{id_or_slug}", response_model=MovieResponse)
async def get_movie(id_or_slug: str):
    """Get complete movie details by ID or slug"""
    if db_manager.is_connected:
        try:
            doc = await db_manager.db.movies.find_one({
                "$or": [{"id": id_or_slug}, {"slug": id_or_slug}]
            })
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return doc
        except Exception:
            pass

    for m in MOVIES_REPO.values():
        if m["id"] == id_or_slug or m["slug"] == id_or_slug:
            return m

    raise HTTPException(status_code=404, detail="Movie not found")

@router.post("", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
async def create_movie(movie: MovieCreate):
    """Add a new movie listing (Admin endpoint)"""
    new_movie = movie.model_dump()
    new_movie["id"] = f"mov-{len(MOVIES_REPO) + 1:03d}"
    
    if db_manager.is_connected:
        try:
            res = await db_manager.db.movies.insert_one(new_movie)
            new_movie["id"] = str(res.inserted_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    MOVIES_REPO[new_movie["id"]] = new_movie
    return new_movie
