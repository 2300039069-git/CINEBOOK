from typing import Dict, Optional
from pydantic import BaseModel

class TierPrice(BaseModel):
    CLASSIC: float = 250.0
    PREMIUM: float = 380.0
    RECLINER: float = 550.0

class ShowBase(BaseModel):
    movie_id: str
    theatre_id: str
    theatre_name: str
    screen_name: str
    format: str = "2D" # 2D, 3D, IMAX 3D, 4DX
    language: str = "English"
    show_date: str # YYYY-MM-DD
    show_time: str # e.g. 10:15 AM
    tier_price: TierPrice
    convenience_fee_per_ticket: float = 25.0
    tax_percentage: float = 18.0
    availability: str = "AVAILABLE" # AVAILABLE, FILLING_FAST, ALMOST_FULL, SOLD_OUT
    is_active: bool = True

class ShowCreate(ShowBase):
    pass

class ShowResponse(ShowBase):
    id: str

    class Config:
        from_attributes = True
