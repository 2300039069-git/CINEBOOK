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
            query = {"is_active": True}
            if city:
                query["city"] = city
            if category and category != "All":
                query["category"] = category
            cursor = db_manager.db.events.find(query)
            results = []
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                results.append(doc)
            return results
        except Exception:
            pass

    results = list(EVENTS_REPO.values())
    if city:
        results = [e for e in results if e["city"] == city]
    if category and category != "All":
        results = [e for e in results if e["category"] == category]
    return results

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    """Get single event details"""
    if db_manager.is_connected:
        try:
            doc = await db_manager.db.events.find_one({"id": event_id})
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return doc
        except Exception:
            pass

    for e in EVENTS_REPO.values():
        if e["id"] == event_id:
            return e

    raise HTTPException(status_code=404, detail="Event not found")
