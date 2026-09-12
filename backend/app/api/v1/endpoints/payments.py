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
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Create Razorpay order for an active booking session (Requires Authentication)"""
    order_data = PaymentService.create_order(
        amount_in_inr=req.amount,
        booking_id=req.booking_id
    )
    if db_manager.is_connected:
        try:
            await db_manager.execute("""
                INSERT INTO payments (razorpay_order_id, booking_id, amount, status)
                VALUES ($1, $2, $3, 'CREATED')
            """, order_data["order_id"], req.booking_id, req.amount)
        except Exception:
            pass

    return CreateOrderResponse(**order_data)

@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(
    req: VerifyPaymentRequest,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Verify Razorpay cryptographic signature.
    Only upon successful validation are seats transitioned to permanently BOOKED.
    """
    is_valid = PaymentService.verify_signature(
        order_id=req.razorpay_order_id,
        payment_id=req.razorpay_payment_id,
        signature=req.razorpay_signature
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment signature verification failed. Booking cannot be confirmed."
        )

    # 1. Retrieve booking from Supabase DB or memory
    booking = None
    if db_manager.is_connected:
        try:
            row = await db_manager.fetch_one("SELECT * FROM bookings WHERE booking_id = $1", req.booking_id)
            if row:
                booking = dict(row)
        except Exception:
            pass

    if not booking:
        booking = BOOKINGS_STORE.get(req.booking_id)

    if not booking:
        raise HTTPException(status_code=404, detail="Associated booking not found.")

    # 2. Extract seat IDs
    seats = booking.get("seats", [])
    seat_ids = [s["id"] if isinstance(s, dict) else s.id for s in seats]

    # 3. Permanently book the seats in database and memory
    await SeatLockService.permanently_book_seats(
        show_id=booking["show_id"],
        lock_token=booking.get("lock_token", ""),
        seat_ids=seat_ids,
        user_id=current_user.id,
        booking_id=req.booking_id
    )

    # 4. Update Supabase bookings and payments table
    if db_manager.is_connected:
        try:
            await db_manager.execute("""
                UPDATE bookings
                SET booking_status = 'CONFIRMED', payment_id = $1
                WHERE booking_id = $2
            """, req.razorpay_payment_id, req.booking_id)

            await db_manager.execute("""
                INSERT INTO payments (razorpay_order_id, payment_id, booking_id, amount, status)
                VALUES ($1, $2, $3, $4, 'SUCCESS')
                ON CONFLICT (razorpay_order_id) DO UPDATE SET
                    payment_id = EXCLUDED.payment_id,
                    status = 'SUCCESS'
            """, req.razorpay_order_id, req.razorpay_payment_id, req.booking_id, float(booking.get("total_amount", 0)))
        except Exception:
            pass

    # 5. Update in-memory store
    if req.booking_id in BOOKINGS_STORE:
        BOOKINGS_STORE[req.booking_id]["booking_status"] = BookingStatus.CONFIRMED
        BOOKINGS_STORE[req.booking_id]["payment_id"] = req.razorpay_payment_id

    return VerifyPaymentResponse(
        success=True,
        booking_id=req.booking_id,
        payment_id=req.razorpay_payment_id,
        status=PaymentStatus.SUCCESS,
        message="Payment verified successfully. E-ticket generated."
    )

