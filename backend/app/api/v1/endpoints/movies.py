from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.movie import MovieResponse, MovieCreate, MovieUpdate
from app.core.database import db_manager
from app.core.seed_data import SEED_MOVIES

router = APIRouter()

# In-memory store fallback when Supabase is offline
MOVIES_REPO = {m["id"]: m.copy() for m in SEED_MOVIES}

@router.get("", response_model=List[MovieResponse])
async def get_movies(
    city: Optional[str] = Query(None, description="Filter movies by city slug (e.g. guntur, vijayawada, mumbai)"),
    status: Optional[str] = Query(None, description="NOW_SHOWING or UPCOMING"),
    genre: Optional[str] = Query(None, description="Genre name"),
    language: Optional[str] = Query(None, description="Language name"),
    search: Optional[str] = Query(None, description="Search query in title, director, cast")
):
    """List movies with multi-faceted filtering and search"""
    if db_manager.is_connected:
        try:
            clauses = ["1=1"]
            params = []

            if status:
                params.append(status)
                clauses.append(f"status = ${len(params)}")

            if genre and genre != "All":
                params.append(f"%{genre}%")
                clauses.append(f"genres::text ILIKE ${len(params)}")

            if language and language != "All":
                params.append(f"%{language}%")
                clauses.append(f"languages::text ILIKE ${len(params)}")

            if city:
                params.append(f"%{city.lower()}%")
                clauses.append(f"cities::text ILIKE ${len(params)}")

            if search:
                params.append(f"%{search}%")
                clauses.append(f"(title ILIKE ${len(params)} OR director ILIKE ${len(params)})")

            query = f"SELECT * FROM movies WHERE {' AND '.join(clauses)} ORDER BY rating DESC;"
            records = await db_manager.fetch_all(query, *params)
            if records:
                return [MovieResponse(**r) for r in records]
        except Exception:
            pass # Fallback to in-memory

    # In-memory filtered response
    results = list(MOVIES_REPO.values())
    if status:
        results = [m for m in results if m["status"] == status]
    if city:
        results = [m for m in results if city.lower() in [c.lower() for c in m.get("cities", ["mumbai", "delhi"])]]
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
            records = await db_manager.fetch_all("SELECT * FROM movies WHERE is_featured = TRUE ORDER BY rating DESC LIMIT 5;")
            if records:
                return [MovieResponse(**r) for r in records]
        except Exception:
            pass

    return [m for m in MOVIES_REPO.values() if m.get("is_featured")]

@router.get("/{id_or_slug}", response_model=MovieResponse)
async def get_movie(id_or_slug: str):
    """Get complete movie details by ID or slug"""
    if db_manager.is_connected:
        try:
            record = await db_manager.fetch_one(
                "SELECT * FROM movies WHERE id = $1 OR slug = $1 LIMIT 1;",
                id_or_slug
            )
            if record:
                return MovieResponse(**record)
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
            await db_manager.execute(
                """
                INSERT INTO movies (
                    id, title, slug, tagline, description, genres, languages,
                    formats, duration, duration_minutes, release_date, rating,
                    votes, censor_rating, poster_url, backdrop_url, trailer_url,
                    director, cast_members, status, is_featured, cities
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7,
                    $8, $9, $10, $11, $12,
                    $13, $14, $15, $16, $17,
                    $18, $19, $20, $21, $22
                ) ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    slug = EXCLUDED.slug;
                """,
                new_movie["id"], new_movie["title"], new_movie["slug"], new_movie.get("tagline"),
                new_movie["description"], new_movie.get("genres", []), new_movie.get("languages", []),
                new_movie.get("formats", ["2D", "3D"]), new_movie["duration"],
                new_movie.get("duration_minutes", 150), new_movie["release_date"],
                new_movie.get("rating", 0.0), new_movie.get("votes", "0"),
                new_movie.get("censor_rating", "UA"), new_movie["poster_url"],
                new_movie["backdrop_url"], new_movie.get("trailer_url"),
                new_movie["director"], new_movie.get("cast", []), new_movie.get("status", "NOW_SHOWING"),
                new_movie.get("is_featured", False), new_movie.get("cities", ["mumbai", "delhi", "bengaluru"])
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    MOVIES_REPO[new_movie["id"]] = new_movie
    return new_movie
