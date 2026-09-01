from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime

class SeatStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    LOCKED = "LOCKED"
    BOOKED = "BOOKED"

class SeatTier(str, Enum):
    CLASSIC = "CLASSIC"
    PREMIUM = "PREMIUM"
    RECLINER = "RECLINER"

class SeatItem(BaseModel):
    id: str # e.g. "A1", "D5"
    number: int
    row: str
    tier: SeatTier = SeatTier.CLASSIC
    price: float
    status: SeatStatus = SeatStatus.AVAILABLE
    is_aisle_after: bool = False

class SeatRow(BaseModel):
    row_letter: str
    seats: List[SeatItem]

class SeatTierLayout(BaseModel):
    name: SeatTier
    label: str
    price: float
    rows: List[SeatRow]

class SeatLayoutResponse(BaseModel):
    show_id: str
    tiers: List[SeatTierLayout]
    total_seats: int
    available_seats: int
    locked_seats: int
    booked_seats: int

class SeatLockRequest(BaseModel):
    show_id: str
    seat_ids: List[str] = Field(..., min_length=1, max_length=8)

class SeatLockResponse(BaseModel):
    success: bool
    lock_token: str
    show_id: str
    seat_ids: List[str]
    locked_at: str
    expires_at: str
    seconds_remaining: int
    message: str

class SeatReleaseRequest(BaseModel):
    show_id: str
    lock_token: str
    seat_ids: Optional[List[str]] = None
