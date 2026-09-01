import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from app.models.booking import BookingCreate, BookingResponse, BookingStatus
from app.models.user import UserResponse
from app.api.deps import get_current_active_user
from app.core.database import db_manager
from app.services.seat_lock_service import SeatLockService

router = APIRouter()

BOOKINGS_STORE = {}

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking_session(
    booking_in: BookingCreate,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Initialize a booking record tied to the active seat lock"""
    booking_id = f"CB-2026-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now(timezone.utc).isoformat()
    
    # Calculate digital ticket QR payload
    qr_payload = f"https://cinebook.in/verify-ticket?ref={booking_id}&usr={current_user.id}&ts={int(datetime.now(timezone.utc).timestamp())}"

    booking_dict = {
        "booking_id": booking_id,
        "user_id": current_user.id,
        "show_id": booking_in.show_id,
        "movie_id": booking_in.movie_id,
        "theatre_id": booking_in.theatre_id,
        "show_date": booking_in.show_date,
        "show_time": booking_in.show_time,
        "lock_token": booking_in.lock_token,
        "seats": [s.model_dump() for s in booking_in.seats],
        "base_amount": booking_in.base_amount,
        "convenience_fee": booking_in.convenience_fee,
        "taxes": booking_in.taxes,
        "total_amount": booking_in.total_amount,
        "customer_name": booking_in.customer_name,
        "customer_email": booking_in.customer_email,
        "customer_phone": booking_in.customer_phone,
        "booking_status": BookingStatus.PENDING,
        "ticket_qr_payload": qr_payload,
        "created_at": now_str
    }

    if db_manager.is_connected:
        try:
            await db_manager.db.bookings.insert_one(booking_dict)
        except Exception:
            pass

    BOOKINGS_STORE[booking_id] = booking_dict
    return BookingResponse(**booking_dict)

@router.get("/my-bookings", response_model=List[BookingResponse])
async def get_my_bookings(current_user: UserResponse = Depends(get_current_active_user)):
    """Retrieve all bookings created by the current user"""
    if db_manager.is_connected:
        try:
            cursor = db_manager.db.bookings.find({"user_id": current_user.id}).sort("created_at", -1)
            results = []
            async for doc in cursor:
                results.append(BookingResponse(**doc))
            if results:
                return results
        except Exception:
            pass

    user_bookings = [
        BookingResponse(**b) for b in BOOKINGS_STORE.values()
        if b.get("user_id") == current_user.id
    ]
    return user_bookings

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get single booking details and QR payload"""
    if db_manager.is_connected:
        try:
            doc = await db_manager.db.bookings.find_one({"booking_id": booking_id})
            if doc:
                return BookingResponse(**doc)
        except Exception:
            pass

    if booking_id in BOOKINGS_STORE:
        return BookingResponse(**BOOKINGS_STORE[booking_id])

    raise HTTPException(status_code=404, detail="Booking not found.")

@router.post("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: str,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Cancel booking and process automated refund"""
    booking = BOOKINGS_STORE.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    booking["booking_status"] = BookingStatus.CANCELLED
    booking["refund_amount"] = booking["base_amount"]

    if db_manager.is_connected:
        try:
            await db_manager.db.bookings.update_one(
                {"booking_id": booking_id},
                {"$set": {"booking_status": BookingStatus.CANCELLED}}
            )
        except Exception:
            pass

    return BookingResponse(**booking)
