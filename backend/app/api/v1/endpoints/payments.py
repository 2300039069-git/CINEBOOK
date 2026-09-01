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
    """Create Razorpay order for an active booking session"""
    order_data = PaymentService.create_order(
        amount_in_inr=req.amount,
        booking_id=req.booking_id
    )
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

    # 1. Update Booking status to CONFIRMED
    booking = BOOKINGS_STORE.get(req.booking_id)
    if booking:
        booking["booking_status"] = BookingStatus.CONFIRMED
        booking["payment_id"] = req.razorpay_payment_id
        
        # Permanently book the seats
        seat_ids = [s["id"] for s in booking.get("seats", [])]
        await SeatLockService.permanently_book_seats(
            show_id=booking["show_id"],
            lock_token=booking.get("lock_token", ""),
            seat_ids=seat_ids
        )

    if db_manager.is_connected:
        try:
            await db_manager.db.bookings.update_one(
                {"booking_id": req.booking_id},
                {"$set": {
                    "booking_status": BookingStatus.CONFIRMED,
                    "payment_id": req.razorpay_payment_id
                }}
            )
        except Exception:
            pass

    return VerifyPaymentResponse(
        success=True,
        booking_id=req.booking_id,
        payment_id=req.razorpay_payment_id,
        status=PaymentStatus.SUCCESS,
        message="Payment verified successfully. E-ticket generated."
    )
