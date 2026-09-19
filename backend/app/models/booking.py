from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime

class BookingStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"

class BookedSeatInfo(BaseModel):
    id: str # "A5"
    row: str
    number: int
    tier: str
    price: float

class BookingCreate(BaseModel):
    booking_id: Optional[str] = None
    show_id: str
    movie_id: str
    theatre_id: str
    show_date: str
    show_time: str
    lock_token: Optional[str] = None
    seats: List[BookedSeatInfo]
    base_amount: float
    convenience_fee: Optional[float] = 0.0
    taxes: Optional[float] = 0.0
    total_amount: float
    customer_name: Optional[str] = "Valued Cinema Guest"
    customer_email: Optional[str] = "customer@cinebook.in"
    customer_phone: Optional[str] = "9848012345"
    booking_status: Optional[str] = "PENDING"
    payment_id: Optional[str] = None
    payment_utr: Optional[str] = None
    order_id: Optional[str] = None

class BookingResponse(BaseModel):
    booking_id: str
    user_id: str
    show_id: str
    movie_id: str
    theatre_id: str
    show_date: str
    show_time: str
    seats: List[BookedSeatInfo]
    base_amount: float
    convenience_fee: float
    taxes: float
    total_amount: float
    payment_id: Optional[str] = None
    payment_utr: Optional[str] = None
    booking_status: BookingStatus = BookingStatus.PENDING
    ticket_qr_payload: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True
