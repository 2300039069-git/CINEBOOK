from typing import Optional
from pydantic import BaseModel

class EventBase(BaseModel):
    title: str
    category: str # Concert, Standup Comedy, Music Festival, Workshop
    city: str
    venue: str
    date: str
    time: str
    banner_url: str
    price_starting: float
    description: str
    is_featured: bool = False
    is_active: bool = True

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: str

    class Config:
        from_attributes = True
