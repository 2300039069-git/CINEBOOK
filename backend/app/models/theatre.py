from typing import List, Optional
from pydantic import BaseModel

class ScreenConfig(BaseModel):
    id: str
    name: str
    sound: str = "Dolby Atmos 7.1"
    total_seats: int = 150

class TheatreBase(BaseModel):
    name: str
    slug: str
    city: str
    address: str
    phone: Optional[str] = None
    email: Optional[str] = None
    facilities: List[str] = []
    distance: Optional[str] = None
    cancellation_policy: str = "Refundable up to 2 hours before showtime"
    screens: List[ScreenConfig] = []
    is_active: bool = True

class TheatreCreate(TheatreBase):
    pass

class TheatreResponse(TheatreBase):
    id: str

    class Config:
        from_attributes = True
