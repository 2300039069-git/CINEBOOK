from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.theatre import TheatreResponse, TheatreCreate
from app.core.database import db_manager
from app.core.seed_data import SEED_THEATRES

router = APIRouter()

THEATRES_REPO = {t["id"]: t.copy() for t in SEED_THEATRES}

@router.get("", response_model=List[TheatreResponse])
async def get_theatres(
    city: Optional[str] = Query(None, description="Filter theatres by city (e.g. mumbai, delhi)")
):
    """List theatres filtered by city"""
    if db_manager.is_connected:
        try:
            query = {"is_active": True}
            if city:
                query["city"] = city
            cursor = db_manager.db.theatres.find(query)
            results = []
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                results.append(doc)
            return results
        except Exception:
            pass

    results = list(THEATRES_REPO.values())
    if city:
        results = [t for t in results if t["city"] == city or t["city"] == "mumbai"]
    return results

@router.get("/{theatre_id}", response_model=TheatreResponse)
async def get_theatre(theatre_id: str):
    """Get single theatre details and its screens"""
    if db_manager.is_connected:
        try:
            doc = await db_manager.db.theatres.find_one({
                "$or": [{"id": theatre_id}, {"slug": theatre_id}]
            })
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return doc
        except Exception:
            pass

    for t in THEATRES_REPO.values():
        if t["id"] == theatre_id or t["slug"] == theatre_id:
            return t

    raise HTTPException(status_code=404, detail="Theatre not found")

@router.post("", response_model=TheatreResponse, status_code=status.HTTP_201_CREATED)
async def create_theatre(theatre: TheatreCreate):
    """Add a new theatre listing (Admin endpoint)"""
    new_theatre = theatre.model_dump()
    new_theatre["id"] = f"th-{len(THEATRES_REPO) + 1:03d}"
    
    if db_manager.is_connected:
        try:
            res = await db_manager.db.theatres.insert_one(new_theatre)
            new_theatre["id"] = str(res.inserted_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    THEATRES_REPO[new_theatre["id"]] = new_theatre
    return new_theatre
