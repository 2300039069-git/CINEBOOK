from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.event import EventResponse, EventCreate
from app.core.database import db_manager
from app.core.seed_data import SEED_EVENTS

router = APIRouter()

EVENTS_REPO = {e["id"]: e.copy() for e in SEED_EVENTS}

@router.get("", response_model=List[EventResponse])
async def get_events(
    city: Optional[str] = Query(None, description="City filter"),
    category: Optional[str] = Query(None, description="Event category")
):
    """List live events, concerts, and comedy shows"""
    if db_manager.is_connected:
        try:
            clauses = ["is_active = TRUE"]
            params = []
            
            if city:
                params.append(city.lower())
                clauses.append(f"LOWER(city) = ${len(params)}")
            if category and category != "All":
                params.append(category)
                clauses.append(f"category = ${len(params)}")
                
            query_sql = f"SELECT * FROM events WHERE {' AND '.join(clauses)} ORDER BY date, time"
            records = await db_manager.fetch_all(query_sql, *params)
            if records:
                return [EventResponse(**r) for r in records]
        except Exception:
            pass

    results = list(EVENTS_REPO.values())
    if city:
        results = [e for e in results if e["city"].lower() == city.lower()]
    if category and category != "All":
        results = [e for e in results if e["category"] == category]
    return [EventResponse(**e) for e in results]

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    """Get single event details"""
    if db_manager.is_connected:
        try:
            record = await db_manager.fetch_one("SELECT * FROM events WHERE id = $1", event_id)
            if record:
                return EventResponse(**record)
        except Exception:
            pass

    for e in EVENTS_REPO.values():
        if e["id"] == event_id:
            return EventResponse(**e)

    raise HTTPException(status_code=404, detail="Event not found")

