import json
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from app.models.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    PaymentStatus
)
from app.models.user import UserResponse
from app.models.booking import BookingStatus
from app.api.deps import get_current_active_user
from app.services.payment_service import PaymentService
from app.services.seat_lock_service import SeatLockService
from app.api.v1.endpoints.bookings import BOOKINGS_STORE
from app.core.database import db_manager

router = APIRouter()

@router.post("/create-order", response_model=CreateOrderResponse)
async def create_payment_order(
    req: CreateOrderRequest,
    current_user: Optional[UserResponse] = Depends(get_current_active_user)
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
        except Exception:
            try:
                await db_manager.execute("""
                    INSERT INTO payments (razorpay_order_id, booking_id, amount, status)
                    VALUES ($1, $2, $3, 'CREATED')
                    ON CONFLICT DO NOTHING
                """, order_data["order_id"], req.booking_id, req.amount)
            except Exception:
                pass

    return CreateOrderResponse(**order_data)

@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(
    req: VerifyPaymentRequest,
    current_user: Optional[UserResponse] = Depends(get_current_active_user)
):
    """
    Verify Cashfree PG payment status.
    Only upon verified PAID status are seats transitioned to permanently BOOKED.
    """
    target_order_id = req.order_id or req.booking_id
    target_booking_id = req.booking_id or req.order_id

    # 1. Retrieve booking from Supabase DB or memory
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

    # 2. Server-side verification of Cashfree Order
    verification = await PaymentService.verify_order(target_order_id)
    is_valid = verification.get("is_valid", False)
    verified_payment_id = req.payment_id or req.cf_payment_id or verification.get("payment_id") or f"cf_pay_{target_order_id}"

    if not is_valid:
        # Explicitly release any locks held for that booking on payment verification failure
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
            detail="Cashfree payment verification failed or order is not PAID. Held seats have been released."
        )

    if not booking:
        raise HTTPException(status_code=404, detail="Associated booking not found.")

    # 3. Extract seat IDs
    seats = booking.get("seats", [])
    if isinstance(seats, str):
        try:
            seats = json.loads(seats)
        except Exception:
            seats = []
    seat_ids = [s["id"] if isinstance(s, dict) else (s.id if hasattr(s, "id") else str(s)) for s in seats]

    # 4. Permanently book the seats in database and memory
    user_id = current_user.id if current_user else booking.get("user_id", "usr_guest")
    b_id = booking.get("booking_id", target_booking_id)
    await SeatLockService.permanently_book_seats(
        show_id=booking["show_id"],
        lock_token=booking.get("lock_token", ""),
        seat_ids=seat_ids,
        user_id=user_id,
        booking_id=b_id
    )

    # 5. Update Supabase bookings and payments table
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
        except Exception:
            try:
                await db_manager.execute("""
                    INSERT INTO payments (razorpay_order_id, payment_id, booking_id, amount, status)
                    VALUES ($1, $2, $3, $4, 'SUCCESS')
                    ON CONFLICT DO NOTHING
                """, target_order_id, verified_payment_id, b_id, float(booking.get("total_amount", 0)))
            except Exception:
                pass

    # 6. Update in-memory store
    if b_id in BOOKINGS_STORE:
        BOOKINGS_STORE[b_id]["booking_status"] = BookingStatus.CONFIRMED
        BOOKINGS_STORE[b_id]["payment_id"] = verified_payment_id

    return VerifyPaymentResponse(
        success=True,
        booking_id=b_id,
        order_id=target_order_id,
        payment_id=verified_payment_id,
        status=PaymentStatus.SUCCESS,
        message="Cashfree payment verified successfully. E-ticket confirmed."
    )

