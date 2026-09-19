import os
import hmac
import hashlib
import time
import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("cinebook.vyapar_service")

class VyaparService:
    BASE_URL = "https://vyapargateway.com/api/v1"

    @classmethod
    def get_api_key(cls) -> str:
        key = getattr(settings, "VYAPAR_API_KEY", "") or os.getenv("VYAPAR_API_KEY", "")
        if not key:
            logger.error("CRITICAL: VYAPAR_API_KEY environment variable is not configured!")
        return key

    @classmethod
    def get_webhook_secret(cls) -> str:
        return getattr(settings, "VYAPAR_WEBHOOK_SECRET", "") or os.getenv("VYAPAR_WEBHOOK_SECRET", "")

    @classmethod
    async def create_order(
        cls,
        booking_id: str,
        amount: float,
        customer_name: str = "Valued Cinema Guest",
        customer_phone: str = "9999999999",
        customer_email: str = "customer@cinebook.in",
        movie_title: str = "Movie Ticket"
    ) -> Dict[str, Any]:
        api_key = cls.get_api_key()
        if not api_key:
            return {
                "success": False,
                "status": "FAILED",
                "error": "Gateway API Key is not configured on server.",
                "booking_id": booking_id
            }

        callback_url = os.getenv("VYAPAR_WEBHOOK_URL", "https://cinebook-backend-i2k9.onrender.com/api/webhook/vyapar")
        redirect_url = f"https://cinebook.cyou/status?bookingId={booking_id}"
        client_txn_id = f"CNB_{booking_id}_{int(time.time()*1000)}"
        p_info = f"Movie Ticket Booking - {booking_id}"

        headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }

        payload = {
            "client_txn_id": client_txn_id,
            "amount": round(float(amount), 2),
            "p_info": p_info,
            "customer_name": customer_name,
            "customer_mobile": customer_phone,
            "redirect_url": redirect_url,
            "callback_url": callback_url
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{cls.BASE_URL}/create_order",
                    headers=headers,
                    json=payload
                )

                data = resp.json() if resp.text else {}
                if resp.status_code in (200, 201) and data.get("status") is True:
                    order_data = data.get("data", {})
                    return {
                        "success": True,
                        "gateway": "vyapar",
                        "status": "PENDING",
                        "order_id": order_data.get("order_id"),
                        "client_txn_id": client_txn_id,
                        "booking_id": booking_id,
                        "amount": float(order_data.get("amount", amount)),
                        "qr_code": order_data.get("qr_code"),
                        "upi_string": order_data.get("upi_string"),
                        "upi_intent": order_data.get("upi_intent", {}),
                        "payment_url": order_data.get("payment_url"),
                        "merchant_upi_id": order_data.get("merchant_upi_id"),
                        "merchant_name": order_data.get("merchant_name", "Cinebook"),
                        "expires_in_seconds": 480
                    }
                else:
                    return {
                        "success": False,
                        "status": "FAILED",
                        "error": data.get("detail") or data.get("msg") or "Order creation failed",
                        "booking_id": booking_id
                    }
        except Exception as api_err:
            logger.error(f"VyaparGateway create_order network failure: {api_err}")
            return {
                "success": False,
                "status": "FAILED",
                "error": str(api_err),
                "booking_id": booking_id
            }

    @classmethod
    def verify_webhook_signature(
        cls,
        raw_body_bytes: bytes,
        signature: Optional[str],
        timestamp: Optional[str]
    ) -> bool:
        secret = cls.get_webhook_secret()
        if not secret:
            logger.warning("VYAPAR_WEBHOOK_SECRET not set! Webhook signature verification bypassed.")
            return True

        if not signature or not timestamp:
            return False

        try:
            raw_body_str = raw_body_bytes.decode("utf-8")
            string_to_sign = f"{timestamp}.{raw_body_str}"
            computed_sig = hmac.new(
                secret.encode("utf-8"),
                string_to_sign.encode("utf-8"),
                hashlib.sha256
            ).hexdigest()

            return hmac.compare_digest(computed_sig, signature)
        except Exception as sig_err:
            logger.error(f"Webhook signature check error: {sig_err}")
            return False

    @classmethod
    async def check_order_status(
        cls,
        order_id: Optional[str] = None,
        client_txn_id: Optional[str] = None
    ) -> Dict[str, Any]:
        api_key = cls.get_api_key()
        headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }
        payload = {}
        if order_id:
            payload["order_id"] = order_id
        if client_txn_id:
            payload["client_txn_id"] = client_txn_id

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(
                    f"{cls.BASE_URL}/check_order_status",
                    headers=headers,
                    json=payload
                )
                if resp.status_code == 200:
                    data = resp.json()
                    order_info = data.get("data", {})
                    st = str(order_info.get("status") or "").lower()
                    is_paid = st in ["success", "paid", "completed", "successful"]
                    utr = order_info.get("upi_txn_id") or order_info.get("utr") or order_info.get("txn_id")
                    return {
                        "success": True,
                        "is_paid": is_paid,
                        "status": "PAID" if is_paid else (st.upper() if st else "PENDING"),
                        "utr_number": utr,
                        "amount": order_info.get("amount"),
                        "raw_data": order_info
                    }
        except Exception as e:
            logger.debug(f"Vyapar check_order_status check error: {e}")

        return {"success": False, "is_paid": False, "status": "PENDING"}
