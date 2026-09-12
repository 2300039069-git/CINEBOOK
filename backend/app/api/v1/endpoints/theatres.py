from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.theatre import TheatreResponse, TheatreCreate
from app.core.database import db_manager
from app.core.seed_data import SEED_THEATRES

router = APIRouter()

# In-memory store fallback when Supabase is offline
THEATRES_REPO = {t["id"]: t.copy() for t in SEED_THEATRES}

@router.get("", response_model=List[TheatreResponse])
async def get_theatres(
    city: Optional[str] = Query(None, description="Filter theatres by city (e.g. guntur, vijayawada, mumbai)")
):
    """List theatres filtered by city"""
    if db_manager.is_connected:
        try:
            if city:
                records = await db_manager.fetch_all(
                    "SELECT * FROM theatres WHERE is_active = TRUE AND city ILIKE $1 ORDER BY name ASC;",
                    f"%{city}%"
                )
            else:
                records = await db_manager.fetch_all(
                    "SELECT * FROM theatres WHERE is_active = TRUE ORDER BY name ASC;"
                )
            if records:
                return [TheatreResponse(**r) for r in records]
        except Exception:
            pass

    results = list(THEATRES_REPO.values())
    if city:
        results = [t for t in results if city.lower() in t["city"].lower()]
    return results

@router.get("/{theatre_id}", response_model=TheatreResponse)
async def get_theatre(theatre_id: str):
    """Get single theatre details and its screens"""
    if db_manager.is_connected:
        try:
            record = await db_manager.fetch_one(
                "SELECT * FROM theatres WHERE id = $1 OR slug = $1 LIMIT 1;",
                theatre_id
            )
            if record:
                return TheatreResponse(**record)
        except Exception:
            pass

    for t in THEATRES_REPO.values():
        if t["id"] == theatre_id or t.get("slug") == theatre_id:
            return t

    raise HTTPException(status_code=404, detail="Theatre not found")

@router.post("", response_model=TheatreResponse, status_code=status.HTTP_201_CREATED)
async def create_theatre(theatre: TheatreCreate):
    """Add a new theatre listing (Admin endpoint)"""
    new_theatre = theatre.model_dump()
    new_theatre["id"] = f"th-{len(THEATRES_REPO) + 1:03d}"
    
    if db_manager.is_connected:
        try:
            await db_manager.execute(
                """
                INSERT INTO theatres (
                    id, name, slug, city, address, phone, email,
                    facilities, distance, cancellation_policy, screens,
                    rating, is_active
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7,
                    $8, $9, $10, $11,
                    $12, $13
                ) ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    slug = EXCLUDED.slug,
                    city = EXCLUDED.city;
                """,
                new_theatre["id"], new_theatre["name"], new_theatre.get("slug", new_theatre["name"].lower().replace(" ", "-")),
                new_theatre["city"], new_theatre["address"], new_theatre.get("phone"),
                new_theatre.get("email"), new_theatre.get("facilities", []), new_theatre.get("distance"),
                new_theatre.get("cancellation_policy", "Refundable"), new_theatre.get("screens", []),
                4.5, new_theatre.get("is_active", True)
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    THEATRES_REPO[new_theatre["id"]] = new_theatre
    return new_theatre
