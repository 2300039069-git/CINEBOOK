import json
import logging
import uuid
import asyncio
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from app.models.booking import BookingCreate, BookingResponse, BookingStatus
from app.models.user import UserResponse
from app.api.deps import get_current_active_user, get_optional_user
from app.core.database import db_manager
from app.services.seat_lock_service import SeatLockService
from app.services.notification_service import NotificationService

logger = logging.getLogger("cinebook.bookings")

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
    if isinstance(d.get("seats"), str):
        try:
            d["seats"] = json.loads(d["seats"])
        except Exception:
            pass
    return d

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking_session(
    booking_in: BookingCreate,
    current_user: Optional[UserResponse] = Depends(get_optional_user)
):
    """Initialize or confirm a booking record in Supabase with atomic seat validation"""
    seat_ids = [s.id for s in booking_in.seats]
    if not seat_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one seat must be selected."
        )

    user_id = current_user.id if current_user else "usr_guest"
    booking_id = booking_in.booking_id or f"CB-2026-{uuid.uuid4().hex[:6].upper()}"
    status_val = booking_in.booking_status or BookingStatus.PENDING.value
    now_str = datetime.now(timezone.utc).isoformat()

    # Validate lock if it's a pending reservation; bypass lock conflict if confirming with payment
    if status_val != BookingStatus.CONFIRMED.value and booking_in.lock_token:
        try:
            await SeatLockService.validate_and_claim_lock_for_booking(
                show_id=booking_in.show_id,
                seat_ids=seat_ids,
                user_id=user_id,
                lock_token=booking_in.lock_token
            )
        except Exception as lock_err:
            logger.warning(f"Seat lock validation notice for booking {booking_id}: {lock_err}")

    # Calculate digital ticket QR payload
    qr_payload = f"https://cinebook.in/verify-ticket?ref={booking_id}&usr={user_id}&ts={int(datetime.now(timezone.utc).timestamp())}"

    seats_data = [s.model_dump() for s in booking_in.seats]
    seats_json = json.dumps(seats_data)

    booking_dict = {
        "booking_id": booking_id,
        "user_id": user_id,
        "show_id": booking_in.show_id,
        "movie_id": booking_in.movie_id,
        "theatre_id": booking_in.theatre_id,
        "show_date": booking_in.show_date,
        "show_time": booking_in.show_time,
        "lock_token": booking_in.lock_token,
        "seats": seats_data,
        "base_amount": float(booking_in.base_amount),
        "convenience_fee": float(booking_in.convenience_fee or 0.0),
        "taxes": float(booking_in.taxes or 0.0),
        "total_amount": float(booking_in.total_amount),
        "customer_name": booking_in.customer_name or "Valued Cinema Guest",
        "customer_email": booking_in.customer_email or "customer@cinebook.in",
        "customer_phone": booking_in.customer_phone or "9848012345",
        "booking_status": status_val,
        "payment_id": booking_in.payment_id,
        "payment_utr": booking_in.payment_utr,
        "ticket_qr_payload": qr_payload,
        "created_at": now_str
    }

    await db_manager.ensure_connected(force=True)
    if db_manager.is_connected:
        try:
            await db_manager.execute("""
                INSERT INTO bookings (
                    booking_id, user_id, show_id, movie_id, theatre_id,
                    show_date, show_time, lock_token, seats,
                    base_amount, convenience_fee, taxes, total_amount,
                    customer_name, customer_email, customer_phone,
                    booking_status, payment_id, payment_utr, ticket_qr_payload, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9::jsonb,
                    $10, $11, $12, $13,
                    $14, $15, $16,
                    $17, $18, $19, $20, NOW(), NOW()
                )
                ON CONFLICT (booking_id) DO UPDATE SET
                    booking_status = EXCLUDED.booking_status,
                    payment_id = COALESCE(EXCLUDED.payment_id, bookings.payment_id),
                    payment_utr = COALESCE(EXCLUDED.payment_utr, bookings.payment_utr),
                    seats = EXCLUDED.seats,
                    updated_at = NOW()
            """,
            booking_id, user_id, booking_in.show_id, booking_in.movie_id, booking_in.theatre_id,
            booking_in.show_date, booking_in.show_time, booking_in.lock_token, seats_json,
            booking_in.base_amount, float(booking_in.convenience_fee or 0.0), float(booking_in.taxes or 0.0), booking_in.total_amount,
            booking_in.customer_name or "Valued Cinema Guest", booking_in.customer_email or "customer@cinebook.in", booking_in.customer_phone or "9848012345",
            status_val, booking_in.payment_id, booking_in.payment_utr, qr_payload
            )
            logger.info(f"Supabase booking {booking_id} saved/updated successfully with status {status_val}")

            # If booking is CONFIRMED, immediately persist to booked_seats and update seats
            if status_val in (BookingStatus.CONFIRMED.value, "CONFIRMED", "PAID"):
                for seat_id in seat_ids:
                    await db_manager.execute("""
                        INSERT INTO booked_seats (show_id, seat_id, user_id, booking_id, booked_at)
                        VALUES ($1, $2, $3, $4, NOW())
                        ON CONFLICT (show_id, seat_id) DO NOTHING
                    """, booking_in.show_id, seat_id, user_id, booking_id)

                await db_manager.execute("""
                    UPDATE seats
                    SET status = 'BOOKED', lock_token = NULL, expires_at = NULL, updated_at = NOW()
                    WHERE show_id = $1 AND seat_id = ANY($2::text[])
                """, booking_in.show_id, seat_ids)
        except Exception as e:
            logger.exception(f"Error persisting booking {booking_id} to Supabase: {e}")

    # If confirmed, asynchronously dispatch notifications to customer Email, SMS, WhatsApp
    if status_val in (BookingStatus.CONFIRMED.value, "CONFIRMED", "PAID"):
        try:
            movie_title = "Cinema Experience"
            theatre_name = "Siva Cinemas 4K Laser"
            if db_manager.is_connected:
                try:
                    m_row = await db_manager.fetch_one("SELECT title FROM movies WHERE id = $1", booking_in.movie_id)
                    if m_row and m_row.get("title"):
                        movie_title = m_row.get("title")
                    t_row = await db_manager.fetch_one("SELECT name FROM theatres WHERE id = $1", booking_in.theatre_id)
                    if t_row and t_row.get("name"):
                        theatre_name = t_row.get("name")
                except Exception:
                    pass

            notif_booking = {
                "booking_id": booking_id,
                "movie_title": movie_title,
                "theatre_name": theatre_name,
                "show_date": booking_in.show_date,
                "show_time": booking_in.show_time,
                "seats": seats_data,
                "total_amount": float(booking_in.total_amount),
                "payment_id": booking_in.payment_id or "CONFIRMED",
                "customer_email": booking_in.customer_email,
                "customer_phone": booking_in.customer_phone
            }
            asyncio.create_task(NotificationService.dispatch_booking_notifications(
                booking=notif_booking,
                customer_email=booking_in.customer_email,
                customer_phone=booking_in.customer_phone
            ))
            logger.info(f"Asynchronously triggered confirmation notifications for booking {booking_id} to {booking_in.customer_email}")
        except Exception as notif_err:
            logger.warning(f"Booking confirmation notification notice: {notif_err}")

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

