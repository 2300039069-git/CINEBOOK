import uuid
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
            clauses = ["is_active = TRUE"]
            params = []
            
            if movie_id:
                params.append(movie_id)
                clauses.append(f"movie_id = ${len(params)}")
            if theatre_id:
                params.append(theatre_id)
                clauses.append(f"theatre_id = ${len(params)}")
            if show_date:
                params.append(show_date)
                clauses.append(f"show_date = ${len(params)}")
                
            query_sql = f"SELECT * FROM shows WHERE {' AND '.join(clauses)} ORDER BY show_date, show_time"
            records = await db_manager.fetch_all(query_sql, *params)
            if records:
                return [ShowResponse(**r) for r in records]
        except Exception:
            pass

    results = list(SHOWS_REPO.values())
    if movie_id:
        results = [s for s in results if s["movie_id"] == movie_id]
    if theatre_id:
        results = [s for s in results if s["theatre_id"] == theatre_id]
    if show_date:
        results = [s for s in results if s["show_date"] == show_date]
    return [ShowResponse(**s) for s in results]

@router.get("/{show_id}", response_model=ShowResponse)
async def get_show(show_id: str):
    """Get single show details and tier pricing"""
    if db_manager.is_connected:
        try:
            record = await db_manager.fetch_one("SELECT * FROM shows WHERE id = $1", show_id)
            if record:
                return ShowResponse(**record)
        except Exception:
            pass

    for s in SHOWS_REPO.values():
        if s["id"] == show_id:
            return ShowResponse(**s)

    raise HTTPException(status_code=404, detail="Show not found")

@router.post("", response_model=ShowResponse, status_code=status.HTTP_201_CREATED)
async def create_show(show: ShowCreate):
    """Schedule a new show (Theatre Admin / Super Admin)"""
    new_show = show.model_dump()
    new_show_id = f"sh-{uuid.uuid4().hex[:6]}"
    new_show["id"] = new_show_id
    
    if db_manager.is_connected:
        try:
            await db_manager.execute("""
                INSERT INTO shows (
                    id, movie_id, theatre_id, screen_id, theatre_name, screen_name,
                    format, language, show_date, show_time, tier_price,
                    convenience_fee_per_ticket, tax_percentage, availability, is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            """,
            new_show["id"], new_show["movie_id"], new_show["theatre_id"],
            new_show.get("screen_id", "scr-01"), new_show.get("theatre_name", "Cinema"),
            new_show.get("screen_name", "Audi 1"), new_show.get("format", "2D"),
            new_show.get("language", "Telugu"), new_show["show_date"], new_show["show_time"],
            new_show.get("tier_price", {}), new_show.get("convenience_fee_per_ticket", 25.0),
            new_show.get("tax_percentage", 18.0), new_show.get("availability", "AVAILABLE"),
            new_show.get("is_active", True)
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    SHOWS_REPO[new_show["id"]] = new_show
    return ShowResponse(**new_show)
