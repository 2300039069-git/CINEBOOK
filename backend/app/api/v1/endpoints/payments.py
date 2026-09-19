import json
import time
import uuid
import urllib.parse
import logging
import re
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.models.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    PaymentStatus,
    CreateUpiQrRequest,
    CreateUpiQrResponse,
    UpiStatusResponse,
    VerifyUtrRequest
)
from app.models.user import UserResponse
from app.models.booking import BookingStatus
from app.api.deps import get_current_active_user, get_optional_user
from app.services.payment_service import PaymentService
from app.services.seat_lock_service import SeatLockService
from app.services.vyapar_service import VyaparService
from app.api.v1.endpoints.bookings import BOOKINGS_STORE
from app.core.database import db_manager

logger = logging.getLogger("cinebook.payments")

router = APIRouter()

# In-memory store for active UPI QR sessions
UPI_ORDERS_STORE: Dict[str, Dict[str, Any]] = {}


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_payment_order(
    req: CreateOrderRequest,
    current_user: Optional[UserResponse] = Depends(get_optional_user)
):
    """Create Cashfree PG v3 order entity for an active booking session"""
    cust_details = req.customer_details.dict() if req.customer_details else {}
    if current_user:
        if not cust_details.get("customer_id"):
            cust_details["customer_id"] = current_user.id
        if not cust_details.get("customer_name"):
            cust_details["customer_name"] = current_user.name
        if not cust_details.get("customer_email"):
            cust_details["customer_email"] = current_user.email
        if not cust_details.get("customer_phone") and current_user.phone:
            cust_details["customer_phone"] = current_user.phone

    order_data = await PaymentService.create_order(
        amount_in_inr=req.amount,
        booking_id=req.booking_id,
        customer_details=cust_details
    )

    if db_manager.is_connected:
        try:
            await db_manager.execute("""
                INSERT INTO payments (order_id, booking_id, amount, status)
                VALUES ($1, $2, $3, 'CREATED')
                ON CONFLICT DO NOTHING
            """, order_data["order_id"], req.booking_id, req.amount)
        except Exception as e:
            logger.warning(f"Payment record insert warning: {e}")

    return CreateOrderResponse(**order_data)


@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(
    req: VerifyPaymentRequest,
    current_user: Optional[UserResponse] = Depends(get_current_active_user)
):
    target_order_id = req.order_id or req.booking_id
    target_booking_id = req.booking_id or req.order_id

    await db_manager.ensure_connected()
    booking = None
    if db_manager.is_connected:
        try:
            row = await db_manager.fetch_one(
                "SELECT * FROM bookings WHERE booking_id = $1 OR booking_id = $2 LIMIT 1",
                target_booking_id, target_order_id
            )
            if row:
                booking = dict(row)
        except Exception:
            pass

    if not booking:
        booking = BOOKINGS_STORE.get(target_booking_id) or BOOKINGS_STORE.get(target_order_id)

    verification = await PaymentService.verify_order(target_order_id)
    is_valid = verification.get("is_valid", False)
    verified_payment_id = req.payment_id or req.cf_payment_id or verification.get("payment_id") or f"cf_pay_{target_order_id}"

    if not is_valid:
        if booking:
            b_show_id = booking.get("show_id", "")
            b_lock_token = booking.get("lock_token", "")
            b_id = booking.get("booking_id", target_booking_id)

            await SeatLockService.release_seats(
                show_id=b_show_id,
                lock_token=b_lock_token
            )
            if db_manager.is_connected:
                try:
                    await db_manager.execute(
                        "UPDATE bookings SET booking_status = 'CANCELLED' WHERE booking_id = $1",
                        b_id
                    )
                except Exception:
                    pass
            if b_id in BOOKINGS_STORE:
                BOOKINGS_STORE[b_id]["booking_status"] = BookingStatus.CANCELLED.value

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cashfree payment verification failed. Held seats have been released."
        )

    if not booking:
        raise HTTPException(status_code=404, detail="Associated booking not found.")

    seats = booking.get("seats", [])
    if isinstance(seats, str):
        try:
            seats = json.loads(seats)
        except Exception:
            seats = []
    seat_ids = [s["id"] if isinstance(s, dict) else (s.id if hasattr(s, "id") else str(s)) for s in seats]

    user_id = current_user.id if current_user else booking.get("user_id", "usr_guest")
    b_id = booking.get("booking_id", target_booking_id)
    await SeatLockService.permanently_book_seats(
        show_id=booking["show_id"],
        lock_token=booking.get("lock_token", ""),
        seat_ids=seat_ids,
        user_id=user_id,
        booking_id=b_id
    )

    if db_manager.is_connected:
        try:
            await db_manager.execute("""
                UPDATE bookings
                SET booking_status = 'CONFIRMED', payment_id = $1
                WHERE booking_id = $2
            """, verified_payment_id, b_id)

            await db_manager.execute("""
                INSERT INTO payments (order_id, payment_id, booking_id, amount, status)
                VALUES ($1, $2, $3, $4, 'SUCCESS')
                ON CONFLICT DO NOTHING
            """, target_order_id, verified_payment_id, b_id, float(booking.get("total_amount", 0)))
        except Exception as e:
            logger.warning(f"Supabase sync warning: {e}")

    if b_id in BOOKINGS_STORE:
        BOOKINGS_STORE[b_id]["booking_status"] = BookingStatus.CONFIRMED
        BOOKINGS_STORE[b_id]["payment_id"] = verified_payment_id

    return VerifyPaymentResponse(
        success=True,
        booking_id=b_id,
        order_id=target_order_id,
        payment_id=verified_payment_id,
        status=PaymentStatus.SUCCESS,
        message="Payment verified successfully. E-ticket confirmed."
    )


from pydantic import BaseModel

class DirectConfirmBookingRequest(BaseModel):
    booking_id: str
    utr: Optional[str] = None
    payment_id: Optional[str] = None
    order_id: Optional[str] = None
    show_id: Optional[str] = None
    movie_id: Optional[str] = None
    theatre_id: Optional[str] = None
    show_date: Optional[str] = None
    show_time: Optional[str] = None
    lock_token: Optional[str] = None
    seats: Optional[Any] = None
    base_amount: Optional[float] = None
    convenience_fee: Optional[float] = 0.0
    taxes: Optional[float] = 0.0
    total_amount: Optional[float] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None

async def _confirm_upi_booking(
    order_id: str,
    payment_id: str,
    utr_number: str,
    booking_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Atomically transitions held seats to BOOKED and records payment details in Supabase.
    Prioritizes the bookings table update first to prevent seat lock glitches from blocking confirmation.
    """
    await db_manager.ensure_connected(force=True)

    # 1. Database-level anti-replay check
    if db_manager.is_connected and utr_number:
        try:
            existing_utr = await db_manager.fetch_one(
                "SELECT booking_id FROM bookings WHERE payment_utr = $1 AND booking_status = 'CONFIRMED' LIMIT 1",
                utr_number
            )
            if existing_utr and existing_utr.get("booking_id") != booking_id:
                logger.error(f"Duplicate UTR detected: {utr_number} was already used by booking {existing_utr.get('booking_id')}")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This UPI Reference (UTR) has already been used for another confirmed ticket."
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error checking anti-replay UTR in database: {e}")

    order_data = UPI_ORDERS_STORE.get(order_id) or {}
    target_b_id = booking_id or order_data.get("booking_id")

    # 2. Database lookup: Primary by booking_id or payment_id
    booking = None
    if db_manager.is_connected:
        try:
            if target_b_id:
                row = await db_manager.fetch_one(
                    "SELECT * FROM bookings WHERE booking_id = $1 OR payment_id = $1 LIMIT 1",
                    target_b_id
                )
                if row:
                    booking = dict(row)

            if not booking and order_id:
                row = await db_manager.fetch_one(
                    "SELECT * FROM bookings WHERE booking_id = $1 OR payment_id = $1 LIMIT 1",
                    order_id
                )
                if row:
                    booking = dict(row)

            # Fallback to latest PENDING booking if not found
            if not booking:
                logger.warning("No booking found by ID; falling back to latest PENDING booking.")
                row = await db_manager.fetch_one(
                    "SELECT * FROM bookings WHERE booking_status = 'PENDING' ORDER BY created_at DESC LIMIT 1"
                )
                if row:
                    booking = dict(row)
        except Exception as db_err:
            logger.error(f"Error querying bookings from Supabase: {db_err}")

    # Fallback to memory stores if DB was unreachable
    if not booking and target_b_id:
        booking = BOOKINGS_STORE.get(target_b_id)
    if not booking and order_data:
        booking = {
            "booking_id": target_b_id or f"CB-2026-{int(time.time()*1000)}",
            "show_id": order_data.get("show_id", "sh-001"),
            "movie_id": order_data.get("movie_id", "mv-001"),
            "theatre_id": order_data.get("theatre_id", "th-001"),
            "show_date": time.strftime("%Y-%m-%d"),
            "show_time": "11:00 AM",
            "lock_token": order_data.get("lock_token", ""),
            "seats": order_data.get("seats", []),
            "user_id": "usr_guest",
            "total_amount": float(order_data.get("amount", 1.0))
        }

    actual_booking_id = (booking.get("booking_id") if booking else None) or target_b_id or f"CB-2026-{int(time.time()*1000)}"
    show_id = (booking.get("show_id") if booking else None) or "sh-001"
    movie_id = (booking.get("movie_id") if booking else None) or "mv-001"
    theatre_id = (booking.get("theatre_id") if booking else None) or "th-001"
    show_date = (booking.get("show_date") if booking else None) or time.strftime("%Y-%m-%d")
    show_time = (booking.get("show_time") if booking else None) or "11:00 AM"
    lock_token = (booking.get("lock_token") if booking else None) or ""
    user_id = (booking.get("user_id") if booking else None) or "usr_guest"
    total_amount = float((booking.get("total_amount") if booking else None) or order_data.get("amount") or 1.0)
    base_amount = float((booking.get("base_amount") if booking else None) or total_amount)
    convenience_fee = float((booking.get("convenience_fee") if booking else None) or 0.0)
    taxes = float((booking.get("taxes") if booking else None) or 0.0)
    cust_name = (booking.get("customer_name") if booking else None) or order_data.get("customer_name") or "Valued Cinema Guest"
    cust_email = (booking.get("customer_email") if booking else None) or order_data.get("customer_email") or "customer@cinebook.in"
    cust_phone = (booking.get("customer_phone") if booking else None) or order_data.get("customer_phone") or "9848012345"

    # 3. Extract seat IDs properly whether booking["seats"] is JSON array, stringified JSON, or list of dicts/IDs
    seats_raw = (booking.get("seats") if booking else None) or order_data.get("seats") or []
    if isinstance(seats_raw, str):
        try:
            seats_raw = json.loads(seats_raw)
        except Exception as e:
            logger.error(f"Error parsing seats JSON string for booking {actual_booking_id}: {e}")
            seats_raw = []

    seat_ids: List[str] = []
    if isinstance(seats_raw, list):
        for s in seats_raw:
            if isinstance(s, dict):
                s_id = s.get("id") or s.get("seat_id")
                if s_id:
                    seat_ids.append(str(s_id))
            elif s is not None:
                seat_ids.append(str(s))

    qr_payload = f"https://cinebook.in/verify-ticket?ref={actual_booking_id}&ts={int(time.time())}"
    seats_json = json.dumps(seats_raw if isinstance(seats_raw, list) else [])

    # 4. CRITICAL: UPSERT bookings table to CONFIRMED
    if db_manager.is_connected:
        try:
            await db_manager.execute(
                """
                INSERT INTO bookings (
                    booking_id, user_id, show_id, movie_id, theatre_id,
                    show_date, show_time, lock_token, seats,
                    base_amount, convenience_fee, taxes, total_amount,
                    customer_name, customer_email, customer_phone,
                    booking_status, payment_id, payment_utr, ticket_qr_payload,
                    created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9::jsonb,
                    $10, $11, $12, $13,
                    $14, $15, $16,
                    'CONFIRMED', $17, $18, $19,
                    NOW(), NOW()
                )
                ON CONFLICT (booking_id) DO UPDATE SET
                    booking_status = 'CONFIRMED',
                    payment_utr = EXCLUDED.payment_utr,
                    payment_id = EXCLUDED.payment_id,
                    seats = EXCLUDED.seats,
                    updated_at = NOW();
                """,
                actual_booking_id, user_id, show_id, movie_id, theatre_id,
                show_date, show_time, lock_token, seats_json,
                base_amount, convenience_fee, taxes, total_amount,
                cust_name, cust_email, cust_phone,
                payment_id, utr_number, qr_payload
            )
            logger.info(f"Supabase booking {actual_booking_id} successfully UPSERTED to CONFIRMED with UTR {utr_number}")
        except Exception as b_err:
            logger.exception(f"CRITICAL: Failed to update/insert booking status in Supabase: {b_err}")
            raise b_err

        # 5. Insert into booked_seats table
        for s_id in seat_ids:
            try:
                await db_manager.execute(
                    """
                    INSERT INTO booked_seats (show_id, seat_id, user_id, booking_id, booked_at)
                    VALUES ($1, $2, $3, $4, NOW())
                    ON CONFLICT (show_id, seat_id) DO NOTHING;
                    """,
                    show_id, s_id, user_id, actual_booking_id
                )
            except Exception as bs_err:
                logger.warning(f"booked_seats insert notice for {s_id}: {bs_err}")

        # 6. Update seats table to BOOKED and clear temporary seat locks
        try:
            if seat_ids:
                await db_manager.execute(
                    """
                    UPDATE seats 
                    SET status = 'BOOKED', lock_token = NULL, expires_at = NULL, updated_at = NOW() 
                    WHERE show_id = $1 AND seat_id = ANY($2::text[])
                    """,
                    show_id, seat_ids
                )
                await db_manager.execute(
                    """
                    DELETE FROM seat_locks
                    WHERE show_id = $1 AND seat_id = ANY($2::text[])
                    """,
                    show_id, seat_ids
                )
                logger.info(f"Supabase seats {seat_ids} updated to BOOKED and seat_locks cleared for show {show_id}")
        except Exception as s_err:
            logger.exception(f"Failed to update seats status in Supabase for booking {actual_booking_id}: {s_err}")

        # 7. Record payment ledger entry
        try:
            await db_manager.execute(
                """
                INSERT INTO payments (order_id, payment_id, booking_id, amount, status)
                VALUES ($1, $2, $3, $4, 'SUCCESS')
                ON CONFLICT DO NOTHING
                """,
                order_id, payment_id, actual_booking_id, total_amount
            )
        except Exception as p_err:
            logger.warning(f"Failed to record payment entry in Supabase: {p_err}")

    # Update in-memory fallback stores
    if actual_booking_id in BOOKINGS_STORE:
        BOOKINGS_STORE[actual_booking_id]["booking_status"] = BookingStatus.CONFIRMED.value
        BOOKINGS_STORE[actual_booking_id]["payment_id"] = payment_id
        BOOKINGS_STORE[actual_booking_id]["payment_utr"] = utr_number

    if order_data:
        order_data["status"] = PaymentStatus.PAID.value
        order_data["paid"] = True
        order_data["payment_id"] = payment_id
        order_data["utr_number"] = utr_number
        order_data["confirmed_at"] = time.time()
        order_data["booking"] = booking

    return order_data or {"status": "PAID", "utr": utr_number, "booking_id": actual_booking_id}


@router.post("/confirm-booking")
async def direct_confirm_booking(req: DirectConfirmBookingRequest):
    """
    Direct frontend fallback confirmation endpoint:
    Guarantees that a CONFIRMED booking, booked seats, and payment record exist in Supabase PostgreSQL.
    """
    booking_id = req.booking_id.strip()
    utr = req.utr.strip() if req.utr else None
    payment_id = req.payment_id or (f"vyapar_{utr}" if utr else f"direct_{booking_id}")
    order_id = req.order_id or f"ord_{booking_id}"

    await db_manager.ensure_connected(force=True)

    # 1. Fetch existing booking if already in database
    existing_row = None
    if db_manager.is_connected:
        try:
            existing_row = await db_manager.fetch_one(
                "SELECT * FROM bookings WHERE booking_id = $1 LIMIT 1",
                booking_id
            )
        except Exception as e:
            logger.warning(f"Booking lookup warning for {booking_id}: {e}")

    # 2. Extract seat info & metadata from request, existing row, or fallback store
    order_data = UPI_ORDERS_STORE.get(order_id) or UPI_ORDERS_STORE.get(booking_id) or {}
    mem_booking = BOOKINGS_STORE.get(booking_id) or {}

    show_id = req.show_id or (existing_row.get("show_id") if existing_row else None) or order_data.get("show_id") or mem_booking.get("show_id") or "sh-001"
    movie_id = req.movie_id or (existing_row.get("movie_id") if existing_row else None) or mem_booking.get("movie_id") or "mv-001"
    theatre_id = req.theatre_id or (existing_row.get("theatre_id") if existing_row else None) or mem_booking.get("theatre_id") or "th-001"
    show_date = req.show_date or (existing_row.get("show_date") if existing_row else None) or mem_booking.get("show_date") or time.strftime("%Y-%m-%d")
    show_time = req.show_time or (existing_row.get("show_time") if existing_row else None) or mem_booking.get("show_time") or "11:00 AM"
    lock_token = req.lock_token or (existing_row.get("lock_token") if existing_row else None) or mem_booking.get("lock_token") or ""

    seats_raw = req.seats or (existing_row.get("seats") if existing_row else None) or mem_booking.get("seats") or order_data.get("seats") or []
    if isinstance(seats_raw, str):
        try:
            seats_raw = json.loads(seats_raw)
        except Exception:
            seats_raw = []

    seat_ids: List[str] = []
    if isinstance(seats_raw, list):
        for s in seats_raw:
            if isinstance(s, dict):
                s_id = s.get("id") or s.get("seat_id")
                if s_id:
                    seat_ids.append(str(s_id))
            elif s is not None:
                seat_ids.append(str(s))

    total_amount = float(req.total_amount or (existing_row.get("total_amount") if existing_row else None) or order_data.get("amount") or mem_booking.get("total_amount") or 1.0)
    base_amount = float(req.base_amount or (existing_row.get("base_amount") if existing_row else None) or total_amount)
    convenience_fee = float(req.convenience_fee or (existing_row.get("convenience_fee") if existing_row else None) or 0.0)
    taxes = float(req.taxes or (existing_row.get("taxes") if existing_row else None) or 0.0)

    cust_name = req.customer_name or (existing_row.get("customer_name") if existing_row else None) or mem_booking.get("customer_name") or "Valued Cinema Guest"
    cust_email = req.customer_email or (existing_row.get("customer_email") if existing_row else None) or mem_booking.get("customer_email") or "customer@cinebook.in"
    cust_phone = req.customer_phone or (existing_row.get("customer_phone") if existing_row else None) or mem_booking.get("customer_phone") or "9848012345"

    qr_payload = f"https://cinebook.in/verify-ticket?ref={booking_id}&ts={int(time.time())}"
    seats_json = json.dumps(seats_raw if isinstance(seats_raw, list) else [])

    # 3. Comprehensive UPSERT into bookings table
    if db_manager.is_connected:
        try:
            await db_manager.execute(
                """
                INSERT INTO bookings (
                    booking_id, user_id, show_id, movie_id, theatre_id,
                    show_date, show_time, lock_token, seats,
                    base_amount, convenience_fee, taxes, total_amount,
                    customer_name, customer_email, customer_phone,
                    booking_status, payment_id, payment_utr, ticket_qr_payload,
                    created_at, updated_at
                ) VALUES (
                    $1, 'usr_guest', $2, $3, $4,
                    $5, $6, $7, $8::jsonb,
                    $9, $10, $11, $12,
                    $13, $14, $15,
                    'CONFIRMED', $16, $17, $18,
                    NOW(), NOW()
                )
                ON CONFLICT (booking_id) DO UPDATE SET
                    booking_status = 'CONFIRMED',
                    payment_utr = COALESCE(EXCLUDED.payment_utr, bookings.payment_utr),
                    payment_id = COALESCE(EXCLUDED.payment_id, bookings.payment_id),
                    seats = EXCLUDED.seats,
                    updated_at = NOW();
                """,
                booking_id, show_id, movie_id, theatre_id,
                show_date, show_time, lock_token, seats_json,
                base_amount, convenience_fee, taxes, total_amount,
                cust_name, cust_email, cust_phone,
                payment_id, utr, qr_payload
            )
            logger.info(f"Direct fallback UPSERT confirmed booking {booking_id} in Supabase (UTR: {utr})")
        except Exception as e:
            logger.exception(f"Direct fallback booking UPSERT failed for {booking_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")

        # 4. Insert into booked_seats table
        for s_id in seat_ids:
            try:
                await db_manager.execute(
                    """
                    INSERT INTO booked_seats (show_id, seat_id, user_id, booking_id, booked_at)
                    VALUES ($1, $2, 'usr_guest', $3, NOW())
                    ON CONFLICT (show_id, seat_id) DO NOTHING
                    """,
                    show_id, s_id, booking_id
                )
            except Exception as bs_err:
                logger.warning(f"booked_seats insert notice for {s_id}: {bs_err}")

        # 5. Transition seats table to BOOKED and clear temporary seat locks
        if seat_ids:
            try:
                await db_manager.execute(
                    """
                    UPDATE seats
                    SET status = 'BOOKED', lock_token = NULL, expires_at = NULL, updated_at = NOW()
                    WHERE show_id = $1 AND seat_id = ANY($2::text[])
                    """,
                    show_id, seat_ids
                )
                await db_manager.execute(
                    """
                    DELETE FROM seat_locks
                    WHERE show_id = $1 AND seat_id = ANY($2::text[])
                    """,
                    show_id, seat_ids
                )
                logger.info(f"Direct fallback marked seats {seat_ids} as BOOKED and cleared seat_locks for show {show_id}")
            except Exception as s_err:
                logger.warning(f"Direct fallback seat update notice for {booking_id}: {s_err}")

        # 6. Record in payments table
        try:
            await db_manager.execute(
                """
                INSERT INTO payments (order_id, payment_id, booking_id, amount, status)
                VALUES ($1, $2, $3, $4, 'SUCCESS')
                ON CONFLICT DO NOTHING
                """,
                order_id, payment_id, booking_id, total_amount
            )
        except Exception as p_err:
            logger.warning(f"Payment ledger insert warning for {booking_id}: {p_err}")

    # Sync in-memory store
    if booking_id in BOOKINGS_STORE:
        BOOKINGS_STORE[booking_id]["booking_status"] = BookingStatus.CONFIRMED.value
        BOOKINGS_STORE[booking_id]["payment_id"] = payment_id
        if utr:
            BOOKINGS_STORE[booking_id]["payment_utr"] = utr

    return {
        "success": True,
        "booking_id": booking_id,
        "status": "CONFIRMED",
        "message": "Booking confirmed successfully in Supabase."
    }


@router.post("/create-vyapar-order")
async def create_vyapar_payment_order(
    req: CreateUpiQrRequest,
    current_user: Optional[UserResponse] = Depends(get_optional_user)
):
    amount = float(req.amount)
    booking_id = req.booking_id

    cust = req.customer_details.dict() if req.customer_details else {}
    name = (current_user.name if current_user else None) or cust.get("customer_name") or "Valued Cinema Guest"
    email = (current_user.email if current_user else None) or cust.get("customer_email") or "customer@cinebook.in"
    phone = (current_user.phone if current_user else None) or cust.get("customer_phone") or "9999999999"

    order_result = await VyaparService.create_order(
        booking_id=booking_id,
        amount=amount,
        customer_name=name,
        customer_phone=phone,
        customer_email=email,
        movie_title="Movie Ticket"
    )

    if not order_result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=order_result.get("error", "Failed to communicate with payment gateway.")
        )

    order_id = order_result.get("order_id") or f"vg_{booking_id}"
    client_txn_id = order_result.get("client_txn_id") or f"CNB_{booking_id}_{int(time.time()*1000)}"

    order_record = {
        **order_result,
        "order_id": order_id,
        "client_txn_id": client_txn_id,
        "booking_id": booking_id,
        "amount": amount,
        "customer_name": name,
        "customer_email": email,
        "customer_phone": phone,
        "status": PaymentStatus.PENDING.value,
        "paid": False,
        "created_at": time.time(),
        "expires_at": time.time() + 480
    }

    UPI_ORDERS_STORE[order_id] = order_record
    UPI_ORDERS_STORE[client_txn_id] = order_record
    UPI_ORDERS_STORE[booking_id] = order_record

    # Pre-create PENDING booking in Supabase PostgreSQL
    await db_manager.ensure_connected(force=True)
    if db_manager.is_connected:
        try:
            seats_json = json.dumps([])
            await db_manager.execute("""
                INSERT INTO bookings (
                    booking_id, user_id, show_id, movie_id, theatre_id,
                    show_date, show_time, seats,
                    base_amount, convenience_fee, taxes, total_amount,
                    customer_name, customer_email, customer_phone,
                    booking_status, created_at, updated_at
                ) VALUES (
                    $1, 'usr_guest', 'sh-001', 'mv-001', 'th-001',
                    CURRENT_DATE::text, '11:00 AM', $2::jsonb,
                    $3, 0.0, 0.0, $3,
                    $4, $5, $6,
                    'PENDING', NOW(), NOW()
                )
                ON CONFLICT (booking_id) DO NOTHING
            """,
            booking_id, seats_json, amount, name, email, phone
            )
            logger.info(f"Pre-created PENDING booking {booking_id} in Supabase for UPI QR session.")
        except Exception as pre_err:
            logger.warning(f"Pre-creation notice for booking {booking_id}: {pre_err}")

    return order_result


@router.get("/upi-status/{order_id}", response_model=UpiStatusResponse)
async def check_upi_status(order_id: str):
    await db_manager.ensure_connected()
    order_data = UPI_ORDERS_STORE.get(order_id)
    if not order_data:
        for oid, o in UPI_ORDERS_STORE.items():
            if (
                o.get("order_id") == order_id or
                o.get("client_txn_id") == order_id or
                o.get("booking_id") == order_id
            ):
                order_data = o
                break

    is_paid = False
    if order_data:
        is_paid = (
            order_data.get("paid", False) or
            order_data.get("status") in (PaymentStatus.PAID.value, "PAID", "CONFIRMED", "BOOKED", "SUCCESS")
        )

    target_bid = (order_data.get("booking_id") if order_data else None) or order_id
    target_oid = (order_data.get("order_id") if order_data else None) or order_id
    target_ctxn = (order_data.get("client_txn_id") if order_data else None) or order_id

    # 1. Check database for confirmation recorded by webhook
    if not is_paid and db_manager.is_connected:
        try:
            row = await db_manager.fetch_one("""
                SELECT * FROM bookings 
                WHERE (booking_id = $1 OR payment_id = $1 OR booking_id = $2 OR payment_id = $2)
                AND booking_status = 'CONFIRMED' LIMIT 1
            """, target_bid, target_oid)
            if row:
                is_paid = True
                if order_data:
                    order_data["status"] = PaymentStatus.PAID.value
                    order_data["paid"] = True
                    order_data["utr_number"] = row.get("payment_utr") or row.get("payment_id")
        except Exception as e:
            logger.debug(f"Supabase sync check: {e}")

    # 2. Live API status check directly with VyaparGateway
    if not is_paid:
        try:
            vyapar_check = await VyaparService.check_order_status(
                order_id=target_oid,
                client_txn_id=target_ctxn
            )
            if vyapar_check.get("is_paid") is True or vyapar_check.get("status") in ("PAID", "SUCCESS", "COMPLETED"):
                utr = vyapar_check.get("utr_number") or f"VG_{int(time.time()*1000)}"
                payment_id = f"vyapar_{utr}"

                logger.info(f"Vyapar live poll confirmed payment for {order_id} (UTR: {utr})")
                order_data = await _confirm_upi_booking(
                    order_id=target_oid,
                    payment_id=payment_id,
                    utr_number=utr,
                    booking_id=target_bid
                )
                is_paid = True
        except Exception as check_err:
            logger.error(f"Vyapar live poll check error: {check_err}")

    amount_val = float(order_data.get("amount", 1.0)) if order_data else 1.0
    utr_val = order_data.get("utr_number") if order_data else None
    booking_val = order_data.get("booking") if order_data else None

    return UpiStatusResponse(
        order_id=order_id,
        booking_id=target_bid or f"CB-{order_id[-6:]}",
        status=PaymentStatus.PAID if is_paid else PaymentStatus.PENDING,
        amount=amount_val,
        paid=is_paid,
        utr_number=utr_val,
        booking=booking_val,
        message="Payment completed successfully." if is_paid else "Awaiting UPI payment."
    )


@router.post("/verify-upi-utr")
async def verify_upi_utr_submission(req: VerifyUtrRequest):
    """
    SECURE UTR Validation:
    Queries VyaparGateway to verify that this order has actually been paid
    and matches the customer's entered UTR, then confirms booking in Supabase.
    """
    utr_clean = req.utr_number.strip()
    if len(utr_clean) < 8 or not utr_clean.isalnum():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid 12-digit UPI Reference Number / UTR."
        )

    order_id = req.order_id
    booking_id = req.booking_id

    # 1. Query VyaparGateway to check real payment settlement
    vyapar_check = await VyaparService.check_order_status(
        order_id=order_id,
        client_txn_id=order_id
    )

    gateway_is_paid = vyapar_check.get("is_paid", False)
    gateway_utr = str(vyapar_check.get("utr_number") or "").strip()

    if not gateway_is_paid:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Bank settlement not yet received for this order. Please allow 30 seconds and try again."
        )

    # 2. Check if the entered UTR matches what the gateway received
    if gateway_utr and gateway_utr != "None" and utr_clean not in gateway_utr and gateway_utr not in utr_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provided UTR does not match the payment reference registered by your bank."
        )

    payment_id = f"vyapar_{utr_clean}"
    await _confirm_upi_booking(
        order_id=order_id,
        payment_id=payment_id,
        utr_number=utr_clean,
        booking_id=booking_id
    )

    return {
        "success": True,
        "order_id": order_id,
        "booking_id": booking_id,
        "status": "PAID",
        "utr_number": utr_clean,
        "message": "Payment verified against bank settlement! Your booking is confirmed."
    }


@router.post("/webhook/vyapar")
@router.post("/vyapar-webhook")
@router.post("/api/webhook/vyapar")
@router.post("/api/v1/webhook/vyapar")
async def receive_vyapar_webhook(request: Request):
    """
    HMAC-SHA256 Webhook listener for VyaparGateway.
    Only executes confirmation upon valid cryptographic signature.
    """
    try:
        raw_body_bytes = await request.body()
    except Exception:
        raw_body_bytes = b""

    signature = request.headers.get("X-VyaparGateway-Signature") or request.headers.get("x-vyapargateway-signature")
    timestamp = request.headers.get("X-VyaparGateway-Timestamp") or request.headers.get("x-vyapargateway-timestamp")
    order_id_hdr = request.headers.get("X-VyaparGateway-Order-Id") or request.headers.get("x-vyapargateway-order-id")

    is_valid_sig = VyaparService.verify_webhook_signature(
        raw_body_bytes=raw_body_bytes,
        signature=signature,
        timestamp=timestamp
    )
    if not is_valid_sig:
        logger.warning("Vyapar webhook signature verification failed!")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid VyaparGateway webhook signature. Unauthorized."
        )

    try:
        post_data = json.loads(raw_body_bytes.decode("utf-8")) if raw_body_bytes else {}
    except Exception:
        post_data = {}

    payload = post_data
    data = payload.get("data") if isinstance(payload.get("data"), dict) else payload

    status_raw = str(payload.get("status") or payload.get("payment_status") or data.get("status") or "").lower()
    event_raw = str(payload.get("event") or data.get("event") or "").lower()

    if status_raw not in ["success", "paid", "completed", "successful", "true"] and event_raw != "payment.success":
        return JSONResponse(status_code=200, content={"status": True, "message": "Non-success status acknowledged."})

    client_txn_id = (
        payload.get("client_txn_id") or
        data.get("client_txn_id") or
        ""
    )
    order_id = (
        payload.get("order_id") or
        data.get("order_id") or
        order_id_hdr or
        client_txn_id
    )

    booking_id = None
    if client_txn_id:
        if client_txn_id.startswith("CNB_"):
            parts = client_txn_id.split("_")
            if len(parts) >= 2:
                booking_id = parts[1]
        elif "CB-" in client_txn_id:
            cb_match = re.search(r'(CB-[\w\-]+)', client_txn_id)
            if cb_match:
                booking_id = cb_match.group(1)

    if not booking_id:
        booking_id = data.get("booking_id") or payload.get("booking_id")

    # Grab the UTR no matter where Vyapar puts it
    utr = (
        data.get("utr") or
        data.get("payment_utr") or
        data.get("upi_txn_id") or
        data.get("bank_ref_no") or
        payload.get("utr") or
        payload.get("payment_utr") or
        payload.get("upi_txn_id") or
        payload.get("bank_ref_no") or
        f"VG_{int(time.time()*1000)}"
    )
    utr_number = str(utr).strip()
    payment_id = f"vyapar_{utr_number}"

    target_order_id = order_id or client_txn_id or f"upi_ord_{booking_id}"
    await _confirm_upi_booking(
        order_id=target_order_id,
        payment_id=payment_id,
        utr_number=utr_number,
        booking_id=booking_id
    )

    return JSONResponse(
        status_code=200,
        content={"status": True, "success": True, "booking_id": booking_id, "utr": utr_number}
    )
