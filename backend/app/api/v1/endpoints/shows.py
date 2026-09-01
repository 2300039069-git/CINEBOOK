from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.show import ShowResponse, ShowCreate
from app.core.database import db_manager
from app.core.seed_data import SEED_SHOWS

router = APIRouter()

SHOWS_REPO = {s["id"]: s.copy() for s in SEED_SHOWS}

@router.get("", response_model=List[ShowResponse])
async def get_shows(
    movie_id: Optional[str] = Query(None, description="Movie ID filter"),
    theatre_id: Optional[str] = Query(None, description="Theatre ID filter"),
    show_date: Optional[str] = Query(None, description="Date filter YYYY-MM-DD")
):
    """Retrieve shows matching movie, theatre, or date query"""
    if db_manager.is_connected:
        try:
            query = {"is_active": True}
            if movie_id:
                query["movie_id"] = movie_id
            if theatre_id:
                query["theatre_id"] = theatre_id
            if show_date:
                query["show_date"] = show_date
            
            cursor = db_manager.db.shows.find(query)
            results = []
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                results.append(doc)
            return results
        except Exception:
            pass

    results = list(SHOWS_REPO.values())
    if movie_id:
        results = [s for s in results if s["movie_id"] == movie_id]
    if theatre_id:
        results = [s for s in results if s["theatre_id"] == theatre_id]
    return results

@router.get("/{show_id}", response_model=ShowResponse)
async def get_show(show_id: str):
    """Get single show details and tier pricing"""
    if db_manager.is_connected:
        try:
            doc = await db_manager.db.shows.find_one({"id": show_id})
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return doc
        except Exception:
            pass

    for s in SHOWS_REPO.values():
        if s["id"] == show_id:
            return s

    raise HTTPException(status_code=404, detail="Show not found")

@router.post("", response_model=ShowResponse, status_code=status.HTTP_201_CREATED)
async def create_show(show: ShowCreate):
    """Schedule a new show (Theatre Admin / Super Admin)"""
    new_show = show.model_dump()
    new_show["id"] = f"sh-{len(SHOWS_REPO) + 1:03d}"
    
    if db_manager.is_connected:
        try:
            res = await db_manager.db.shows.insert_one(new_show)
            new_show["id"] = str(res.inserted_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    SHOWS_REPO[new_show["id"]] = new_show
    return new_show
