import uuid
import logging
import httpx
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger("cinebook.payments")

class PaymentService:
    @staticmethod
    def _get_base_url() -> str:
        env = (settings.CASHFREE_ENV or "sandbox").lower()
        if env == "production":
            return "https://api.cashfree.com/pg"
        return "https://sandbox.cashfree.com/pg"

    @classmethod
    async def create_order(
        cls,
        amount_in_inr: float,
        booking_id: str,
        customer_details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a Cashfree PG v3 Order Entity via Cashfree Orders API
        Returns payment_session_id for Cashfree Web/JS Checkout SDK.
        """
        order_amount = round(float(amount_in_inr), 2)
        raw_order_id = str(booking_id or f"CB-2026-{uuid.uuid4().hex[:8].upper()}")
        import re
        order_id = re.sub(r'[^a-zA-Z0-9_-]', '', raw_order_id)[:45]

        cust = customer_details or {}
        raw_phone = str(cust.get("customer_phone") or "9848012345")
        phone_digits = re.sub(r'\D', '', raw_phone)
        if len(phone_digits) > 10 and phone_digits.startswith("91"):
            phone_digits = phone_digits[-10:]
        elif len(phone_digits) > 10:
            phone_digits = phone_digits[-10:]
        if len(phone_digits) != 10:
            phone_digits = "9848012345"

        raw_email = str(cust.get("customer_email") or "customer@cinebook.in").strip()
        email_clean = raw_email if ("@" in raw_email and "." in raw_email) else "customer@cinebook.in"

        raw_id = str(cust.get("customer_id") or f"usr_{uuid.uuid4().hex[:8]}")
        cust_id = re.sub(r'[^a-zA-Z0-9_-]', '', raw_id)[:45]
        if len(cust_id) < 3:
            cust_id = f"usr_{uuid.uuid4().hex[:8]}"

        raw_name = str(cust.get("customer_name") or "Cinema Guest").strip()
        cust_name = raw_name[:50] if len(raw_name) >= 2 else "Cinema Guest"

        cust_email = email_clean
        cust_phone = phone_digits

        base_url = cls._get_base_url()
        headers = {
            "Content-Type": "application/json",
            "x-client-id": settings.CASHFREE_APP_ID,
            "x-client-secret": settings.CASHFREE_SECRET_KEY,
            "x-api-version": settings.CASHFREE_API_VERSION
        }

        payload = {
            "order_id": order_id,
            "order_amount": order_amount,
            "order_currency": "INR",
            "customer_details": {
                "customer_id": cust_id,
                "customer_name": cust_name,
                "customer_email": cust_email,
                "customer_phone": cust_phone
            },
            "order_meta": {
                "return_url": f"https://cinebook.in/checkout?order_id={order_id}"
            },
            "order_note": f"Tickets for booking {order_id}"
        }

        # If live/test Cashfree credentials provided:
        if settings.CASHFREE_APP_ID and not settings.CASHFREE_APP_ID.startswith("dummy"):
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.post(f"{base_url}/orders", json=payload, headers=headers)
                    if 200 <= resp.status_code < 300:
                        data = resp.json()
                        session_id = data.get("payment_session_id")
                        if session_id:
                            return {
                                "order_id": data.get("order_id", order_id),
                                "payment_session_id": session_id,
                                "order_amount": float(data.get("order_amount", order_amount)),
                                "order_currency": data.get("order_currency", "INR"),
                                "environment": (settings.CASHFREE_ENV or "sandbox").lower(),
                                "booking_id": order_id,
                                "cf_order_id": data.get("cf_order_id")
                            }
                    else:
                        logger.warning(f"Cashfree create order returned {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.warning(f"Cashfree API live order error: {e}. Generating simulated session.")

        # Graceful fallback simulation for testing/offline environments
        simulated_session = f"session_{uuid.uuid4().hex}"
        return {
            "order_id": order_id,
            "payment_session_id": simulated_session,
            "order_amount": order_amount,
            "order_currency": "INR",
            "environment": (settings.CASHFREE_ENV or "sandbox").lower(),
            "booking_id": order_id,
            "cf_order_id": None
        }

    @classmethod
    async def verify_order(cls, order_id: str) -> Dict[str, Any]:
        """
        Server-side verification of Cashfree Order Status.
        Queries Cashfree GET /pg/orders/{order_id} to verify status is PAID.
        """
        if not order_id:
            return {"is_valid": False, "status": "FAILED", "payment_id": None}

        base_url = cls._get_base_url()
        headers = {
            "x-client-id": settings.CASHFREE_APP_ID,
            "x-client-secret": settings.CASHFREE_SECRET_KEY,
            "x-api-version": settings.CASHFREE_API_VERSION
        }

        if settings.CASHFREE_APP_ID and not settings.CASHFREE_APP_ID.startswith("dummy"):
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.get(f"{base_url}/orders/{order_id}", headers=headers)
                    if 200 <= resp.status_code < 300:
                        data = resp.json()
                        order_status = data.get("order_status")
                        if order_status == "PAID":
                            payment_id = data.get("cf_order_id") or f"cf_{order_id}"
                            return {
                                "is_valid": True,
                                "status": "PAID",
                                "payment_id": str(payment_id),
                                "data": data
                            }
                        else:
                            return {
                                "is_valid": False,
                                "status": order_status or "FAILED",
                                "payment_id": None,
                                "data": data
                            }
                    else:
                        logger.warning(f"Cashfree verify lookup returned {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.warning(f"Cashfree verify API error: {e}")

        return {"is_valid": False, "status": "FAILED", "payment_id": None}
