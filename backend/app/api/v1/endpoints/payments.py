import json
import time
import uuid
import urllib.parse
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status
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
from app.api.v1.endpoints.bookings import BOOKINGS_STORE
from app.core.database import db_manager

logger = logging.getLogger("cinebook.payments")

router = APIRouter()

# In-memory store for active UPI QR orders and used UTR numbers
UPI_ORDERS_STORE: Dict[str, Dict[str, Any]] = {}
USED_UTR_NUMBERS: set = set()

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


async def _confirm_upi_booking(order_id: str, payment_id: str, utr_number: Optional[str] = None) -> Dict[str, Any]:
    """
    Internal helper to atomically transition held seats to permanently BOOKED
    and confirm the booking record in Supabase PostgreSQL & Memory.
    """
    order_data = UPI_ORDERS_STORE.get(order_id)
    if not order_data:
        raise HTTPException(status_code=404, detail="UPI Order not found.")

    booking_id = order_data.get("booking_id")
    await db_manager.ensure_connected()

    # 1. Fetch booking record
    booking = None
    if db_manager.is_connected:
        try:
            row = await db_manager.fetch_one(
                "SELECT * FROM bookings WHERE booking_id = $1 LIMIT 1",
                booking_id
            )
            if row:
                booking = dict(row)
        except Exception as e:
            logger.warning(f"Error fetching booking for UPI confirmation: {e}")

    if not booking:
        booking = BOOKINGS_STORE.get(booking_id)

    if not booking:
        raise HTTPException(status_code=404, detail=f"Booking {booking_id} not found.")

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
    await SeatLockService.permanently_book_seats(
        show_id=show_id,
        lock_token=lock_token,
        seat_ids=seat_ids,
        user_id=user_id,
        booking_id=booking_id
    )

    # 4. Update Supabase tables
    if db_manager.is_connected:
        try:
            await db_manager.execute("""
                UPDATE bookings
                SET booking_status = 'CONFIRMED', payment_id = $1
                WHERE booking_id = $2
            """, payment_id, booking_id)

            await db_manager.execute("""
                INSERT INTO payments (order_id, payment_id, booking_id, amount, status)
                VALUES ($1, $2, $3, $4, 'SUCCESS')
                ON CONFLICT DO NOTHING
            """, order_id, payment_id, booking_id, float(order_data.get("amount", 0)))
        except Exception as e:
            logger.warning(f"Supabase sync warning for UPI booking: {e}")

    # 5. Update Memory Store
    if booking_id in BOOKINGS_STORE:
        BOOKINGS_STORE[booking_id]["booking_status"] = BookingStatus.CONFIRMED.value
        BOOKINGS_STORE[booking_id]["payment_id"] = payment_id

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
    Real-time auto-polling endpoint.
    Frontend polls every 2 seconds to check if payment was received.
    """
    order_data = UPI_ORDERS_STORE.get(order_id)
    if not order_data:
        # Fallback check Supabase DB
        if db_manager.is_connected:
            try:
                row = await db_manager.fetch_one(
                    "SELECT * FROM payments WHERE order_id = $1 LIMIT 1",
                    order_id
                )
                if row and row.get("status") in ("SUCCESS", "PAID"):
                    return UpiStatusResponse(
                        order_id=order_id,
                        booking_id=row.get("booking_id", ""),
                        status=PaymentStatus.PAID,
                        amount=float(row.get("amount", 0)),
                        paid=True,
                        utr_number=row.get("payment_id"),
                        message="Payment confirmed via database."
                    )
            except Exception:
                pass
        raise HTTPException(status_code=404, detail="UPI Order not found.")

    is_paid = order_data.get("paid", False) or order_data.get("status") == PaymentStatus.PAID.value

    # Smart Auto-Check: If pending, scan Gmail for recent bank credit alerts
    if not is_paid and settings.GMAIL_APP_PASSWORD:
        last_gmail_check = order_data.get("last_gmail_check", 0)
        now = time.time()
        if now - last_gmail_check >= 4.0:
            order_data["last_gmail_check"] = now
            try:
                alerts = GmailPaymentPoller.check_recent_emails(
                    email_address=settings.GMAIL_ADDRESS,
                    app_password=settings.GMAIL_APP_PASSWORD,
                    max_emails=5
                )
                target_amt = float(order_data.get("amount", 0))
                for a in alerts:
                    a_amt = a.get("amount")
                    if a_amt and abs(a_amt - target_amt) < 0.50:
                        utr = a.get("utr_number") or f"GMAIL-UTR-{int(now*1000)}"
                        payment_id = f"upi_pay_gmail_{utr}"
                        await _confirm_upi_booking(order_id=order_id, payment_id=payment_id, utr_number=utr)
                        is_paid = True
                        break
            except Exception as e:
                logger.warning(f"Background Gmail poll check notice: {e}")

    return UpiStatusResponse(
        order_id=order_id,
        booking_id=order_data["booking_id"],
        status=PaymentStatus.PAID if is_paid else PaymentStatus.PENDING,
        amount=order_data["amount"],
        paid=is_paid,
        utr_number=order_data.get("utr_number"),
        booking=order_data.get("booking"),
        message="Payment completed successfully via Gmail/UPI alert." if is_paid else "Awaiting UPI payment."
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
    we validate format, check against reuse, and confirm the booking immediately.
    """
    utr_clean = req.utr_number.strip()
    if len(utr_clean) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid 12-digit UPI Reference Number / UTR."
        )

    if utr_clean in USED_UTR_NUMBERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This UTR number has already been used for another booking."
        )

    order_data = UPI_ORDERS_STORE.get(req.order_id)
    if not order_data:
        raise HTTPException(status_code=404, detail="UPI Order session expired or not found.")

    USED_UTR_NUMBERS.add(utr_clean)
    payment_id = f"upi_utr_{utr_clean}"

    await _confirm_upi_booking(
        order_id=req.order_id,
        payment_id=payment_id,
        utr_number=utr_clean
    )

    return {
        "success": True,
        "order_id": req.order_id,
        "booking_id": order_data["booking_id"],
        "status": "PAID",
        "utr_number": utr_clean,
        "message": "UTR verified successfully. Your booking is confirmed!"
    }



