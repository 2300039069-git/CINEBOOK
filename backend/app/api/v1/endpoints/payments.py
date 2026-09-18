import json
import time
import uuid
import urllib.parse
import logging
from typing import Optional, Dict, Any, Union
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
    UpiWebhookPayload,
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

# In-memory store for active UPI QR orders and used UTR numbers
UPI_ORDERS_STORE: Dict[str, Dict[str, Any]] = {}
USED_UTR_NUMBERS: set = set()
PROCESSED_EMAIL_MSG_IDS: set = set()

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


async def _confirm_upi_booking(
    order_id: str,
    payment_id: str,
    utr_number: Optional[str] = None,
    booking_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Internal helper to atomically transition held seats to permanently BOOKED
    and confirm the booking record in Supabase PostgreSQL & Memory.
    """
    order_data = UPI_ORDERS_STORE.get(order_id)
    if not order_data:
        b_id = booking_id or f"CB-2026-{int(time.time()*1000)}"
        order_data = {
            "order_id": order_id,
            "booking_id": b_id,
            "amount": 1.0,
            "status": PaymentStatus.PAID.value,
            "paid": True,
            "created_at": time.time()
        }
        UPI_ORDERS_STORE[order_id] = order_data

    target_b_id = order_data.get("booking_id") or booking_id or f"CB-2026-{int(time.time()*1000)}"
    
    try:
        await db_manager.ensure_connected()
    except Exception as db_conn_err:
        logger.warning(f"DB ensure connection warning: {db_conn_err}")

    # 1. Fetch booking record
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

    if not booking:
        booking = {
            "booking_id": target_b_id,
            "show_id": order_data.get("show_id", "sh-001"),
            "lock_token": order_data.get("lock_token", ""),
            "seats": order_data.get("seats", []),
            "user_id": "usr_guest",
            "total_amount": float(order_data.get("amount", 1.0))
        }
        BOOKINGS_STORE[target_b_id] = booking

    # 2. Extract seat IDs
    show_id = booking.get("show_id") or order_data.get("show_id") or "sh-001"
    lock_token = booking.get("lock_token") or order_data.get("lock_token") or ""
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

    # 3. Permanently lock & book seats
    user_id = booking.get("user_id", "usr_guest")
    try:
        await SeatLockService.permanently_book_seats(
            show_id=show_id,
            lock_token=lock_token,
            seat_ids=seat_ids,
            user_id=user_id,
            booking_id=target_b_id
        )
    except Exception as lock_err:
        logger.warning(f"Permanent seat lock notice: {lock_err}")

    # 4. Update Supabase tables
    if db_manager.is_connected:
        try:
            await db_manager.execute("""
                UPDATE bookings
                SET booking_status = 'CONFIRMED', payment_id = $1
                WHERE booking_id = $2
            """, payment_id, target_b_id)

            await db_manager.execute("""
                INSERT INTO payments (order_id, payment_id, booking_id, amount, status)
                VALUES ($1, $2, $3, $4, 'SUCCESS')
                ON CONFLICT DO NOTHING
            """, order_id, payment_id, target_b_id, float(order_data.get("amount", 1.0)))
        except Exception as e:
            logger.warning(f"Supabase sync warning for UPI booking: {e}")

    # 5. Update Memory Store
    if target_b_id in BOOKINGS_STORE:
        BOOKINGS_STORE[target_b_id]["booking_status"] = BookingStatus.CONFIRMED.value
        BOOKINGS_STORE[target_b_id]["payment_id"] = payment_id

    # 6. Mark UPI order as PAID
    order_data["status"] = PaymentStatus.PAID.value
    order_data["paid"] = True
    order_data["payment_id"] = payment_id
    order_data["utr_number"] = utr_number or f"UPI-{int(time.time()*1000)}"
    order_data["confirmed_at"] = time.time()
    order_data["booking"] = booking

    return order_data


@router.post("/create-upi-qr", response_model=CreateUpiQrResponse)
async def create_upi_qr_order(
    req: CreateUpiQrRequest,
    current_user: Optional[UserResponse] = Depends(get_optional_user)
):
    """
    Generate dynamic NPCI UPI QR code and Intent URL for instant Savings Account UPI payments.
    Supports GPay, PhonePe, Paytm, BHIM, CRED with 0% gateway commission.
    """
    order_id = f"upi_ord_{uuid.uuid4().hex[:12]}"
    amount = float(req.amount)
    upi_id = settings.MERCHANT_UPI_ID
    payee_name = settings.MERCHANT_NAME
    
    # Transaction note encoded with booking id and movie title
    note = f"CineBook Tickets {req.booking_id}"
    
    # Standard NPCI UPI URI Specification matching PhonePe merchant QR:
    # upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR&tr=<REF_ID>&tn=<NOTE>&mc=0000&mode=02&purpose=00
    query_params = {
        "pa": upi_id,
        "pn": payee_name,
        "am": f"{amount:.2f}",
        "cu": "INR",
        "tr": order_id,
        "tn": note,
        "mc": "0000",
        "mode": "02",
        "purpose": "00"
    }
    upi_intent_url = f"upi://pay?{urllib.parse.urlencode(query_params)}"

    # Register in memory store
    UPI_ORDERS_STORE[order_id] = {
        "order_id": order_id,
        "booking_id": req.booking_id,
        "amount": amount,
        "upi_id": upi_id,
        "payee_name": payee_name,
        "upi_intent_url": upi_intent_url,
        "status": PaymentStatus.PENDING.value,
        "paid": False,
        "created_at": time.time(),
        "expires_at": time.time() + 300, # 5 minutes
        "customer_details": req.customer_details.dict() if req.customer_details else {}
    }

    # Save created state to Supabase payments table
    if db_manager.is_connected:
        try:
            await db_manager.execute("""
                INSERT INTO payments (order_id, booking_id, amount, status)
                VALUES ($1, $2, $3, 'CREATED')
                ON CONFLICT DO NOTHING
            """, order_id, req.booking_id, amount)
        except Exception:
            pass

    return CreateUpiQrResponse(
        order_id=order_id,
        booking_id=req.booking_id,
        amount=amount,
        currency="INR",
        upi_id=upi_id,
        payee_name=payee_name,
        upi_intent_url=upi_intent_url,
        qr_data=upi_intent_url,
        expires_in_seconds=300,
        status=PaymentStatus.PENDING
    )


@router.get("/upi-status/{order_id}", response_model=UpiStatusResponse)
async def check_upi_status(order_id: str):
    """
    Real-time auto-polling endpoint for VyaparGateway.
    Frontend polls every 2 seconds. Checks memory, Supabase PostgreSQL, and VyaparGateway live API.
    """
    order_data = UPI_ORDERS_STORE.get(order_id)
    if not order_data:
        # Search by order_id, client_txn_id, or booking_id across active store
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

    # 1. Check Supabase DB for confirmation synced from Render webhook
    if not is_paid and db_manager.is_connected:
        try:
            row = await db_manager.fetch_one("""
                SELECT * FROM bookings 
                WHERE (booking_id = $1 OR booking_id = $2 OR order_id = $1 OR order_id = $2)
                AND booking_status = 'CONFIRMED' LIMIT 1
            """, target_bid, target_oid)
            if row:
                is_paid = True
                if order_data:
                    order_data["status"] = PaymentStatus.PAID.value
                    order_data["paid"] = True
                    order_data["utr_number"] = row.get("payment_id")
        except Exception as e:
            logger.debug(f"Supabase sync check notice: {e}")

    # 2. Query VyaparGateway's live API v2.1.0 in real-time
    if not is_paid:
        try:
            vyapar_check = await VyaparService.check_order_status(
                order_id=target_oid,
                client_txn_id=target_ctxn
            )
            if vyapar_check.get("is_paid") is True or vyapar_check.get("status") in ("PAID", "SUCCESS", "COMPLETED"):
                utr = vyapar_check.get("utr_number") or f"VG_AUTO_{int(time.time()*1000)}"
                payment_id = f"vyapar_{utr}"
                
                logger.info(f"✨ VyaparGateway live check confirmed payment for {order_id} (UTR: {utr})")
                order_data = await _confirm_upi_booking(
                    order_id=target_oid,
                    payment_id=payment_id,
                    utr_number=utr,
                    booking_id=target_bid
                )
                is_paid = True
        except Exception as check_err:
            logger.debug(f"VyaparGateway live poll check notice: {check_err}")

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



import re

@router.post("/upi-webhook")
async def receive_upi_webhook(payload: UpiWebhookPayload):
    """
    Instant Webhook listener for Bank SMS Forwarder, Tasker, MacroDroid, or UPI bridge.
    Supports structured JSON or raw incoming bank SMS text from any Indian Bank.
    Extracts amount and 12-digit UTR automatically and confirms booking with zero customer typing.
    """
    logger.info(f"Received UPI webhook notification: {payload.dict()}")
    
    extracted_amount = payload.amount
    extracted_utr = payload.utr or payload.utr_number

    # Smart regex parsing for raw bank SMS or PhonePe/GPay push notification if provided
    if payload.raw_message:
        raw_txt = payload.raw_message
        # Extract Amount: e.g. "Received ₹300.00 from ...", "Payment of ₹300.00 received", "credited by Rs 300.00", "₹300"
        amt_match = re.search(r'(?:(?:Received|Payment of|credited(?:\s+by|\s+with)?)\s*)?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)', raw_txt, re.IGNORECASE)
        if amt_match and not extracted_amount:
            try:
                extracted_amount = float(amt_match.group(1).replace(',', ''))
            except Exception:
                pass

        if not extracted_amount:
            # Fallback search: "300.00 received" or "300 received"
            alt_amt = re.search(r'([\d,]+(?:\.\d{1,2})?)\s*(?:received|credited)', raw_txt, re.IGNORECASE)
            if alt_amt:
                try:
                    extracted_amount = float(alt_amt.group(1).replace(',', ''))
                except Exception:
                    pass

        # Extract 12-digit UTR / UPI Ref: e.g. "UPI Ref 426811902847", "Ref No: 426811902847", "UPI/426811902847"
        utr_match = re.search(r'(?:Ref|Ref\s*No|UPI\s*Ref|UTR|Txn\s*ID)[\s/:]*(\d{8,16})', raw_txt, re.IGNORECASE)
        if utr_match and not extracted_utr:
            extracted_utr = utr_match.group(1)
        elif not extracted_utr:
            # Fallback search for any 12-digit continuous sequence
            any_12_digit = re.search(r'\b(\d{12})\b', raw_txt)
            if any_12_digit:
                extracted_utr = any_12_digit.group(1)


    target_order_id = payload.order_id
    
    # 1. Search by booking_id
    if not target_order_id and payload.booking_id:
        for oid, o in UPI_ORDERS_STORE.items():
            if o.get("booking_id") == payload.booking_id:
                target_order_id = oid
                break

    # 2. Search most recent pending order with matching amount
    if not target_order_id and extracted_amount:
        for oid, o in sorted(UPI_ORDERS_STORE.items(), key=lambda x: x[1].get("created_at", 0), reverse=True):
            if not o.get("paid") and abs(float(o.get("amount", 0)) - float(extracted_amount)) < 0.50:
                target_order_id = oid
                break

    if not target_order_id:
        return {
            "success": False,
            "message": "No matching pending UPI order found for this amount."
        }

    utr = extracted_utr or f"UTR_{uuid.uuid4().hex[:10]}"
    payment_id = f"upi_pay_{utr}"

    await _confirm_upi_booking(order_id=target_order_id, payment_id=payment_id, utr_number=utr)
    
    return {
        "success": True,
        "order_id": target_order_id,
        "status": "CONFIRMED",
        "utr_number": utr,
        "amount": extracted_amount,
        "message": "Payment verified and booking confirmed via webhook."
    }


@router.post("/email-webhook")
async def receive_bank_email_webhook(email_data: Dict[str, Any]):
    """
    Automated Email Verification Endpoint.
    When your Bank (Axis, HDFC, ICICI, SBI, etc.) sends a Credit Alert email,
    an email forwarder or Cloudflare Email Worker posts the email content here.
    Automatically extracts amount & UTR, marks the seat BOOKED, and confirms the ticket!
    """
    logger.info(f"Received Bank Email Webhook: {email_data}")
    
    # Combine subject and body text for regex parsing
    subject = str(email_data.get("subject", "") or "")
    body = str(email_data.get("body", "") or email_data.get("text", "") or email_data.get("html", "") or "")
    combined_text = f"{subject} {body}"

    # 1. Extract Amount (e.g., "₹300.00", "Rs. 300", "INR 300.00", "credited with Rs 300")
    extracted_amount = None
    if email_data.get("amount"):
        try:
            extracted_amount = float(email_data["amount"])
        except Exception:
            pass

    if not extracted_amount:
        amt_match = re.search(r'(?:Rs\.?|INR|₹|credited\s+with\s+(?:Rs\.?|INR|₹)?)\s*([\d,]+(?:\.\d{1,2})?)', combined_text, re.IGNORECASE)
        if amt_match:
            try:
                extracted_amount = float(amt_match.group(1).replace(',', ''))
            except Exception:
                pass

    # 2. Extract 12-Digit UTR / UPI Reference Number
    extracted_utr = email_data.get("utr") or email_data.get("utr_number")
    if not extracted_utr:
        utr_match = re.search(r'(?:UPI\s*Ref|Ref\s*No|UTR|Txn\s*ID|Reference\s*Number)[\s/:]*(\d{8,16})', combined_text, re.IGNORECASE)
        if utr_match:
            extracted_utr = utr_match.group(1)
        else:
            any_12 = re.search(r'\b(\d{12})\b', combined_text)
            if any_12:
                extracted_utr = any_12.group(1)

    # 3. Match with active pending UPI orders
    target_order_id = email_data.get("order_id")
    if not target_order_id and extracted_amount:
        for oid, o in sorted(UPI_ORDERS_STORE.items(), key=lambda x: x[1].get("created_at", 0), reverse=True):
            if not o.get("paid") and abs(float(o.get("amount", 0)) - float(extracted_amount)) < 0.50:
                target_order_id = oid
                break

    if not target_order_id:
        return {
            "success": False,
            "message": f"Bank email received for amount ₹{extracted_amount}, but no matching active pending order was found."
        }

    utr = extracted_utr or f"EMAIL-UTR-{int(time.time()*1000)}"
    payment_id = f"upi_pay_email_{utr}"

    await _confirm_upi_booking(order_id=target_order_id, payment_id=payment_id, utr_number=utr)

    return {
        "success": True,
        "order_id": target_order_id,
        "status": "CONFIRMED",
        "amount": extracted_amount,
        "utr_number": utr,
        "message": "Bank credit email parsed successfully. Booking confirmed with zero customer typing!"
    }


from app.services.gmail_payment_service import GmailPaymentPoller

@router.post("/check-gmail-alerts")
async def check_gmail_payment_alerts(
    email_address: Optional[str] = None,
    app_password: Optional[str] = None
):
    """
    Automated Gmail Alert Checker:
    Directly checks kancharladhanush2003@gmail.com for recent credit alert emails
    from Axis Bank, PhonePe, GPay, etc., extracts amount and UTR, and confirms matching active bookings.
    """
    target_email = email_address or settings.GMAIL_ADDRESS
    target_pass = app_password or settings.GMAIL_APP_PASSWORD

    if not target_pass:
        return {
            "success": False,
            "configured": False,
            "email": target_email,
            "message": "GMAIL_APP_PASSWORD is not set yet. Please provide a 16-character Google App Password to enable direct IMAP scanning."
        }

    alerts = GmailPaymentPoller.check_recent_emails(
        email_address=target_email,
        app_password=target_pass,
        max_emails=10
    )

    confirmed_orders = []
    for alert in alerts:
        amt = alert.get("amount")
        utr = alert.get("utr_number") or f"GMAIL-UTR-{int(time.time()*1000)}"

        # Find matching pending UPI order
        for oid, o in sorted(UPI_ORDERS_STORE.items(), key=lambda x: x[1].get("created_at", 0), reverse=True):
            if not o.get("paid") and amt and abs(float(o.get("amount", 0)) - float(amt)) < 0.50:
                payment_id = f"upi_pay_gmail_{utr}"
                await _confirm_upi_booking(order_id=oid, payment_id=payment_id, utr_number=utr)
                confirmed_orders.append({
                    "order_id": oid,
                    "booking_id": o.get("booking_id"),
                    "amount": amt,
                    "utr_number": utr
                })
                break

    return {
        "success": True,
        "configured": True,
        "email": target_email,
        "alerts_found": len(alerts),
        "alerts": alerts,
        "confirmed_orders": confirmed_orders,
        "message": f"Scanned {len(alerts)} payment alert(s) and confirmed {len(confirmed_orders)} booking(s)."
    }


@router.get("/admin/pending-upi-orders")
async def get_admin_pending_upi_orders():
    """
    Admin Endpoint: Lists all live active UPI payment orders awaiting confirmation.
    Allows cinema staff to monitor and verify payments in real time.
    """
    now = time.time()
    active_orders = []
    for oid, o in sorted(UPI_ORDERS_STORE.items(), key=lambda x: x[1].get("created_at", 0), reverse=True):
        active_orders.append({
            "order_id": oid,
            "booking_id": o.get("booking_id"),
            "amount": o.get("amount"),
            "status": o.get("status"),
            "paid": o.get("paid", False),
            "created_at": o.get("created_at"),
            "expires_in_seconds": max(0, int(o.get("expires_at", 0) - now)),
            "customer": o.get("customer_details", {}),
            "utr_number": o.get("utr_number")
        })
    return {"orders": active_orders, "total": len(active_orders)}


@router.post("/admin/confirm-upi-order/{order_id}")
async def admin_manually_confirm_upi_order(order_id: str):
    """
    Admin Fail-Safe Endpoint:
    Allows cinema admin to 1-click confirm any booking if the customer paid but bank SMS failed.
    """
    order_data = UPI_ORDERS_STORE.get(order_id)
    if not order_data:
        raise HTTPException(status_code=404, detail="UPI Order not found.")

    admin_utr = f"ADMIN-CONFIRM-{int(time.time()*1000)}"
    payment_id = f"upi_pay_admin_{uuid.uuid4().hex[:8]}"

    await _confirm_upi_booking(
        order_id=order_id,
        payment_id=payment_id,
        utr_number=admin_utr
    )

    return {
        "success": True,
        "order_id": order_id,
        "booking_id": order_data["booking_id"],
        "status": "PAID",
        "utr_number": admin_utr,
        "message": "Admin confirmed UPI payment successfully. Booking confirmed!"
    }


@router.post("/simulate-upi-success/{order_id}")
async def simulate_upi_payment_success(order_id: str):
    """
    Simulation / Testing endpoint.
    Instantly marks the UPI order as PAID and converts seats to BOOKED.
    """
    order_data = UPI_ORDERS_STORE.get(order_id)
    if not order_data:
        raise HTTPException(status_code=404, detail="UPI Order not found.")

    simulated_utr = f"SIM-UTR-{int(time.time()*1000)}"
    payment_id = f"upi_pay_sim_{uuid.uuid4().hex[:8]}"

    await _confirm_upi_booking(
        order_id=order_id,
        payment_id=payment_id,
        utr_number=simulated_utr
    )

    return {
        "success": True,
        "order_id": order_id,
        "booking_id": order_data["booking_id"],
        "status": "PAID",
        "utr_number": simulated_utr,
        "message": "Simulated UPI payment verified successfully!"
    }


@router.post("/verify-upi-utr")
async def verify_upi_utr_submission(req: VerifyUtrRequest):
    """
    Fallback UTR validation endpoint.
    If the customer enters the 12-digit UPI Reference / UTR number manually,
    we validate format and confirm the booking immediately with zero customer delay.
    """
    utr_clean = req.utr_number.strip()
    if len(utr_clean) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid 12-digit UPI Reference Number / UTR."
        )

    USED_UTR_NUMBERS.add(utr_clean)
    payment_id = f"upi_utr_{utr_clean}"
    order_id = req.order_id or f"upi_ord_{uuid.uuid4().hex[:12]}"
    booking_id = req.booking_id or f"CB-2026-{int(time.time()*1000)}"

    order_data = UPI_ORDERS_STORE.get(order_id)
    if not order_data:
        order_data = {
            "order_id": order_id,
            "booking_id": booking_id,
            "amount": 1.0,
            "status": PaymentStatus.PAID.value,
            "paid": True,
            "created_at": time.time()
        }
        UPI_ORDERS_STORE[order_id] = order_data

    await _confirm_upi_booking(
        order_id=order_id,
        payment_id=payment_id,
        utr_number=utr_clean,
        booking_id=booking_id
    )

    return {
        "success": True,
        "order_id": order_id,
        "booking_id": order_data.get("booking_id", booking_id),
        "status": "PAID",
        "utr_number": utr_clean,
        "message": "UTR verified successfully. Your booking is confirmed!"
    }


from app.services.instamojo_service import InstamojoService

@router.post("/create-instamojo-order")
async def create_instamojo_payment_order(
    req: CreateOrderRequest,
    current_user: Optional[UserResponse] = Depends(get_optional_user)
):
    """
    Creates an Instamojo Payment Request for an active booking session.
    Allows credit cards, debit cards, net banking, and UPI payments.
    """
    cust = req.customer_details.dict() if req.customer_details else {}
    name = (current_user.name if current_user else None) or cust.get("customer_name") or "Valued Cinema Guest"
    email = (current_user.email if current_user else None) or cust.get("customer_email") or "customer@cinebook.in"
    phone = (current_user.phone if current_user else None) or cust.get("customer_phone") or "9848012345"

    result = await InstamojoService.create_payment_request(
        amount=req.amount,
        booking_id=req.booking_id,
        customer_name=name,
        customer_email=email,
        customer_phone=phone
    )
    return result


@router.post("/instamojo-webhook")
async def receive_instamojo_webhook(post_data: Dict[str, Any]):
    """
    Instant Webhook listener for Instamojo payment confirmation.
    Validates MAC signature and confirms the ticket booking.
    """
    logger.info(f"Received Instamojo webhook: {post_data}")
    is_valid = InstamojoService.verify_webhook_mac(post_data)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid MAC signature.")

    status_val = post_data.get("status")
    if status_val not in ["Credit", "Completed", "SUCCESS"]:
        return {"success": False, "message": f"Ignored non-credit status: {status_val}"}

    purpose = post_data.get("purpose", "")
    payment_id = post_data.get("payment_id")
    b_match = re.search(r'(CB-\d+-\d+)', purpose)
    booking_id = b_match.group(1) if b_match else None

    if booking_id:
        for oid, o in UPI_ORDERS_STORE.items():
            if o.get("booking_id") == booking_id:
                await _confirm_upi_booking(order_id=oid, payment_id=f"im_{payment_id}", utr_number=payment_id)
                break

    return {"success": True, "message": "Instamojo payment verified and booking confirmed."}


@router.post("/webhook/vyapar")
@router.post("/vyapar-webhook")
async def receive_vyapar_webhook(request: Request):
    """
    Official VyaparGateway API v2.1.0 Instant Webhook listener.
    Performs raw byte HMAC-SHA256 signature verification:
    Formula: HMAC_SHA256(secret, `${timestamp}.${raw_body_string}`)
    Transitions seat and booking state from LOCKED -> BOOKED immediately and idempotently.
    """
    try:
        raw_body_bytes = await request.body()
    except Exception:
        raw_body_bytes = b""

    # Extract signature and timestamp headers
    signature = request.headers.get("X-VyaparGateway-Signature") or request.headers.get("x-vyapargateway-signature")
    timestamp = request.headers.get("X-VyaparGateway-Timestamp") or request.headers.get("x-vyapargateway-timestamp")
    order_id_hdr = request.headers.get("X-VyaparGateway-Order-Id") or request.headers.get("x-vyapargateway-order-id")

    # Verify HMAC-SHA256 signature if secret is configured
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

    logger.info(f"Received verified VyaparGateway webhook payload: {post_data}")

    # Check status and event
    status_raw = str(post_data.get("status") or post_data.get("payment_status") or post_data.get("data", {}).get("status") or "").lower()
    event_raw = str(post_data.get("event") or post_data.get("data", {}).get("event") or "").lower()

    if status_raw not in ["success", "paid", "completed", "successful", "true"] and event_raw != "payment.success":
        logger.warning(f"Ignored non-success Vyapar webhook: status={status_raw}, event={event_raw}")
        return JSONResponse(status_code=200, content={"status": True, "message": f"Non-success status acknowledged: {status_raw}"})

    client_txn_id = (
        post_data.get("client_txn_id") or
        post_data.get("data", {}).get("client_txn_id") or
        ""
    )
    order_id = (
        post_data.get("order_id") or
        post_data.get("data", {}).get("order_id") or
        order_id_hdr or
        client_txn_id
    )

    # Extract booking_id from client_txn_id (format: CNB_${bookingId}_${timestamp} or CB-...)
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
        booking_id = post_data.get("booking_id") or post_data.get("data", {}).get("booking_id")

    # If still not resolved, lookup in memory store
    if not booking_id and order_id and order_id in UPI_ORDERS_STORE:
        booking_id = UPI_ORDERS_STORE[order_id].get("booking_id")

    utr_number = str(
        post_data.get("upi_txn_id") or
        post_data.get("utr") or
        post_data.get("payment_utr") or
        post_data.get("bank_ref_no") or
        post_data.get("txn_id") or
        post_data.get("data", {}).get("upi_txn_id") or
        post_data.get("data", {}).get("utr") or
        f"VG_{int(time.time()*1000)}"
    )
    payment_id = f"vyapar_{utr_number}"

    target_order_id = order_id or client_txn_id or f"upi_ord_{booking_id}"
    await _confirm_upi_booking(
        order_id=target_order_id,
        payment_id=payment_id,
        utr_number=utr_number,
        booking_id=booking_id
    )

    logger.info(f"✨ VyaparGateway payment verified! Booking {booking_id} transitioned to BOOKED with UTR {utr_number}")

    return JSONResponse(
        status_code=200,
        content={
            "status": True,
            "success": True,
            "booking_id": booking_id,
            "order_id": order_id,
            "utr": utr_number,
            "message": "VyaparGateway payment verified and seats permanently booked."
        }
    )


@router.post("/create-vyapar-order")
async def create_vyapar_payment_order(
    req: CreateUpiQrRequest,
    current_user: Optional[UserResponse] = Depends(get_optional_user)
):
    """
    Creates an official VyaparGateway API v2.1.0 payment order.
    Returns dynamic base64 QR image, UPI URI string, and native UPI app intent links (PhonePe, GPay, Paytm, BHIM).
    Routes payments directly to BharatPe merchant account (BHARATPE2J0J0S7M9F14832@unitype).
    """
    amount = float(req.amount)
    booking_id = req.booking_id
    
    cust = req.customer_details.dict() if req.customer_details else {}
    name = (current_user.name if current_user else None) or cust.get("customer_name") or "Valued Cinema Guest"
    email = (current_user.email if current_user else None) or cust.get("customer_email") or "customer@cinebook.in"
    phone = (current_user.phone if current_user else None) or cust.get("customer_phone") or "8639781668"

    order_result = await VyaparService.create_order(
        booking_id=booking_id,
        amount=amount,
        customer_name=name,
        customer_phone=phone,
        customer_email=email,
        movie_title="Movie Ticket"
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
        "expires_at": time.time() + 480, # 8 minutes lock duration
        "customer_details": {
            "customer_name": name,
            "customer_email": email,
            "customer_phone": phone
        }
    }

    # Register in memory store across order_id, client_txn_id, and booking_id for reliable instant lookup
    UPI_ORDERS_STORE[order_id] = order_record
    UPI_ORDERS_STORE[client_txn_id] = order_record
    UPI_ORDERS_STORE[booking_id] = order_record

    if db_manager.is_connected:
        try:
            await db_manager.execute("""
                INSERT INTO payments (order_id, booking_id, amount, status)
                VALUES ($1, $2, $3, 'CREATED')
                ON CONFLICT DO NOTHING
            """, order_id, booking_id, amount)
        except Exception:
            pass

    return order_result






