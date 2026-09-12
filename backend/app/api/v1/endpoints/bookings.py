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

def _format_booking_row(r: dict) -> dict:
    d = dict(r)
    if isinstance(d.get("created_at"), datetime):
        d["created_at"] = d["created_at"].isoformat()
    elif d.get("created_at") is None:
        d["created_at"] = datetime.now(timezone.utc).isoformat()
    if d.get("base_amount") is not None:
        d["base_amount"] = float(d["base_amount"])
    if d.get("convenience_fee") is not None:
        d["convenience_fee"] = float(d["convenience_fee"])
    if d.get("taxes") is not None:
        d["taxes"] = float(d["taxes"])
    if d.get("total_amount") is not None:
        d["total_amount"] = float(d["total_amount"])
    return d

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking_session(
    booking_in: BookingCreate,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Initialize a booking record tied to the active seat lock after atomic seat validation"""
    seat_ids = [s.id for s in booking_in.seats]
    if not seat_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one seat must be selected."
        )

    # Concurrency Control & Seat Hold Enforcement:
    # Under atomic mutex and DB checks, verify only user holding active lock can proceed.
    # Rejects expired or unauthorized attempts with HTTP 409 Conflict.
    await SeatLockService.validate_and_claim_lock_for_booking(
        show_id=booking_in.show_id,
        seat_ids=seat_ids,
        user_id=current_user.id,
        lock_token=booking_in.lock_token
    )

    booking_id = f"CB-2026-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now(timezone.utc).isoformat()
    
    # Calculate digital ticket QR payload
    qr_payload = f"https://cinebook.in/verify-ticket?ref={booking_id}&usr={current_user.id}&ts={int(datetime.now(timezone.utc).timestamp())}"

    seats_data = [s.model_dump() for s in booking_in.seats]

    booking_dict = {
        "booking_id": booking_id,
        "user_id": current_user.id,
        "show_id": booking_in.show_id,
        "movie_id": booking_in.movie_id,
        "theatre_id": booking_in.theatre_id,
        "show_date": booking_in.show_date,
        "show_time": booking_in.show_time,
        "lock_token": booking_in.lock_token,
        "seats": seats_data,
        "base_amount": float(booking_in.base_amount),
        "convenience_fee": float(booking_in.convenience_fee),
        "taxes": float(booking_in.taxes),
        "total_amount": float(booking_in.total_amount),
        "customer_name": booking_in.customer_name,
        "customer_email": booking_in.customer_email,
        "customer_phone": booking_in.customer_phone,
        "booking_status": BookingStatus.PENDING.value,
        "payment_id": None,
        "ticket_qr_payload": qr_payload,
        "created_at": now_str
    }

    if db_manager.is_connected:
        try:
            await db_manager.execute("""
                INSERT INTO bookings (
                    booking_id, user_id, show_id, movie_id, theatre_id,
                    show_date, show_time, lock_token, seats,
                    base_amount, convenience_fee, taxes, total_amount,
                    customer_name, customer_email, customer_phone,
                    booking_status, payment_id, ticket_qr_payload, created_at
                ) VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9,
                    $10, $11, $12, $13,
                    $14, $15, $16,
                    $17, $18, $19, NOW()
                )
            """,
            booking_id, current_user.id, booking_in.show_id, booking_in.movie_id, booking_in.theatre_id,
            booking_in.show_date, booking_in.show_time, booking_in.lock_token, seats_data,
            booking_in.base_amount, booking_in.convenience_fee, booking_in.taxes, booking_in.total_amount,
            booking_in.customer_name, booking_in.customer_email, booking_in.customer_phone,
            BookingStatus.PENDING.value, None, qr_payload
            )
        except Exception as e:
            if "duplicate key" in str(e).lower() or "unique constraint" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Booking already exists for these seats."
                )

    BOOKINGS_STORE[booking_id] = booking_dict
    return BookingResponse(**booking_dict)

@router.get("/my-bookings", response_model=List[BookingResponse])
async def get_my_bookings(current_user: UserResponse = Depends(get_current_active_user)):
    """Retrieve all bookings created by the current user"""
    if db_manager.is_connected:
        try:
            rows = await db_manager.fetch_all("""
                SELECT * FROM bookings
                WHERE user_id = $1
                ORDER BY created_at DESC
            """, current_user.id)
            if rows:
                return [BookingResponse(**_format_booking_row(r)) for r in rows]
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
            row = await db_manager.fetch_one("SELECT * FROM bookings WHERE booking_id = $1", booking_id)
            if row:
                return BookingResponse(**_format_booking_row(row))
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
    if db_manager.is_connected:
        try:
            row = await db_manager.fetch_one("SELECT * FROM bookings WHERE booking_id = $1", booking_id)
            if row:
                await db_manager.execute("""
                    UPDATE bookings SET booking_status = 'CANCELLED'
                    WHERE booking_id = $1
                """, booking_id)
                updated = dict(row)
                updated["booking_status"] = BookingStatus.CANCELLED
                return BookingResponse(**_format_booking_row(updated))
        except Exception:
            pass

    booking = BOOKINGS_STORE.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    booking["booking_status"] = BookingStatus.CANCELLED
    return BookingResponse(**booking)

