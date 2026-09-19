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


async def _confirm_upi_booking(
    order_id: str,
    payment_id: str,
    utr_number: str,
    booking_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Atomically transitions held seats to BOOKED and records payment details.
    Guards against UTR replay attacks in the database.
    """
    await db_manager.ensure_connected()

    # 1. Database-level anti-replay check
    if db_manager.is_connected and utr_number:
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

    order_data = UPI_ORDERS_STORE.get(order_id)
    target_b_id = (order_data.get("booking_id") if order_data else None) or booking_id or f"CB-2026-{int(time.time()*1000)}"

    booking = None
    if db_manager.is_connected:
        try:
            row = await db_manager.fetch_one(
                "SELECT * FROM bookings WHERE booking_id = $1 LIMIT 1",
                target_b_id
            )
            if row:
                booking = dict(row)
        except Exception as e:
            logger.warning(f"Error fetching booking for UPI confirmation: {e}")

    if not booking:
        booking = BOOKINGS_STORE.get(target_b_id)

    if not booking and order_data:
        booking = {
            "booking_id": target_b_id,
            "show_id": order_data.get("show_id", "sh-001"),
            "lock_token": order_data.get("lock_token", ""),
            "seats": order_data.get("seats", []),
            "user_id": "usr_guest",
            "total_amount": float(order_data.get("amount", 1.0))
        }
        BOOKINGS_STORE[target_b_id] = booking

    if not booking:
        raise HTTPException(status_code=404, detail="Booking details not found to confirm payment.")

    show_id = booking.get("show_id") or "sh-001"
    lock_token = booking.get("lock_token") or ""
    seats_raw = booking.get("seats", [])
    if isinstance(seats_raw, str):
        try:
            seats_raw = json.loads(seats_raw)
        except Exception:
            seats_raw = []

    seat_ids = [
        s["id"] if isinstance(s, dict) else (s.id if hasattr(s, "id") else str(s))
        for s in seats_raw
    ]

    user_id = booking.get("user_id", "usr_guest")
    await SeatLockService.permanently_book_seats(
        show_id=show_id,
        lock_token=lock_token,
        seat_ids=seat_ids,
        user_id=user_id,
        booking_id=target_b_id
    )

    if db_manager.is_connected:
        try:
            await db_manager.execute("""
                UPDATE bookings
                SET booking_status = 'CONFIRMED', payment_id = $1, payment_utr = $2
                WHERE booking_id = $3
            """, payment_id, utr_number, target_b_id)

            await db_manager.execute("""
                INSERT INTO payments (order_id, payment_id, booking_id, amount, status)
                VALUES ($1, $2, $3, $4, 'SUCCESS')
                ON CONFLICT DO NOTHING
            """, order_id, payment_id, target_b_id, float(booking.get("total_amount", 1.0)))
        except Exception as e:
            logger.warning(f"Supabase sync warning for UPI booking: {e}")

    if target_b_id in BOOKINGS_STORE:
        BOOKINGS_STORE[target_b_id]["booking_status"] = BookingStatus.CONFIRMED.value
        BOOKINGS_STORE[target_b_id]["payment_id"] = payment_id

    if order_data:
        order_data["status"] = PaymentStatus.PAID.value
        order_data["paid"] = True
        order_data["payment_id"] = payment_id
        order_data["utr_number"] = utr_number
        order_data["confirmed_at"] = time.time()
        order_data["booking"] = booking

    return order_data or {"status": "PAID", "utr": utr_number}


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
        "status": PaymentStatus.PENDING.value,
        "paid": False,
        "created_at": time.time(),
        "expires_at": time.time() + 480
    }

    UPI_ORDERS_STORE[order_id] = order_record
    UPI_ORDERS_STORE[client_txn_id] = order_record
    UPI_ORDERS_STORE[booking_id] = order_record

    return order_result


@router.get("/upi-status/{order_id}", response_model=UpiStatusResponse)
async def check_upi_status(order_id: str):
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

    target_bid = order_data.get("booking_id") if order_data else order_id
    target_oid = order_data.get("order_id") if order_data else order_id
    target_ctxn = order_data.get("client_txn_id") if order_data else order_id

    # 1. Check database for confirmation recorded by webhook
    if not is_paid and db_manager.is_connected:
        try:
            row = await db_manager.fetch_one("""
                SELECT * FROM bookings 
                WHERE (booking_id = $1 OR booking_id = $2)
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
                utr = vyapar_check.get("utr_number")
                if not utr:
                    utr = f"VG_{int(time.time()*1000)}"
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
            logger.debug(f"Vyapar live poll check notice: {check_err}")

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
    and matches the customer's entered UTR.
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

    # Direct Supabase update assurance
    if db_manager.is_connected and booking_id:
        try:
            await db_manager.execute(
                """
                UPDATE bookings 
                SET booking_status = 'CONFIRMED', payment_utr = $1, payment_id = $2
                WHERE booking_id = $3
                """,
                utr_number, payment_id, booking_id
            )
        except Exception as db_err:
            logger.warning(f"Supabase direct UTR update notice: {db_err}")

    return JSONResponse(
        status_code=200,
        content={"status": True, "success": True, "booking_id": booking_id, "utr": utr_number}
    )
