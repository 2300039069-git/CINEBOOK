import os
import hmac
import hashlib
import time
import logging
import httpx
import urllib.parse
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("cinebook.vyapar_service")

class VyaparService:
    """
    Official VyaparGateway API v2.1.0 Integration Service.
    Handles dynamic order creation with BharatPe merchant routing and HMAC-SHA256 webhook signature verification.
    """

    BASE_URL = "https://vyapargateway.com/api/v1"

    @classmethod
    def get_api_key(cls) -> str:
        return getattr(settings, "VYAPAR_API_KEY", "") or os.getenv("VYAPAR_API_KEY", "vg_live_ldyjlAfN9ThqOb2CdAivodK8")

    @classmethod
    def get_webhook_secret(cls) -> str:
        return getattr(settings, "VYAPAR_WEBHOOK_SECRET", "") or os.getenv("VYAPAR_WEBHOOK_SECRET", "")

    @classmethod
    async def create_order(
        cls,
        booking_id: str,
        amount: float,
        customer_name: str = "Valued Cinema Guest",
        customer_phone: str = "8639781668",
        customer_email: str = "customer@cinebook.in",
        movie_title: str = "Movie Ticket"
    ) -> Dict[str, Any]:
        """
        Creates a dynamic payment order using official VyaparGateway API v2.1.0 specification.
        Returns base64 QR image, UPI string, and native mobile deep links for PhonePe, GPay, Paytm, BHIM.
        """
        api_key = cls.get_api_key()
        callback_url = "https://cinebook-backend-i2k9.onrender.com/api/webhook/vyapar"
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

        logger.info(f"Sending order creation to VyaparGateway: {client_txn_id} (Amount: ₹{amount})")

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
                    logger.info(f"VyaparGateway order generated successfully: {order_data.get('order_id')}")
                    
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
                    logger.error(f"VyaparGateway create_order error: {resp.status_code} - {resp.text}")
                    return {
                        "success": False,
                        "status": "FAILED",
                        "error": data.get("detail") or data.get("msg") or "VyaparGateway order creation failed",
                        "booking_id": booking_id
                    }
        except Exception as api_err:
            logger.error(f"VyaparGateway API request failed: {api_err}")
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
        """
        Official VyaparGateway v2.1.0 HMAC-SHA256 Webhook Signature Verification.
        Formula: HMAC_SHA256(secret, `${timestamp}.${raw_body_string}`)
        """
        secret = cls.get_webhook_secret()
        if not secret:
            logger.info("VYAPAR_WEBHOOK_SECRET not set, allowing webhook pass-through.")
            return True

        if not signature or not timestamp:
            logger.warning("Missing X-VyaparGateway-Signature or X-VyaparGateway-Timestamp header.")
            return False

        try:
            raw_body_str = raw_body_bytes.decode("utf-8")
            string_to_sign = f"{timestamp}.{raw_body_str}"
            computed_sig = hmac.new(
                secret.encode("utf-8"),
                string_to_sign.encode("utf-8"),
                hashlib.sha256
            ).hexdigest()

            is_valid = hmac.compare_digest(computed_sig, signature)
            if not is_valid:
                logger.warning(f"Vyapar webhook signature mismatch: computed={computed_sig}, received={signature}")
            return is_valid
        except Exception as sig_err:
            logger.error(f"Webhook signature verification error: {sig_err}")
            return False

    @classmethod
    async def check_order_status(
        cls,
        order_id: Optional[str] = None,
        client_txn_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Queries VyaparGateway API v2.1.0 check_order_status endpoint directly in real-time.
        Endpoint: POST https://vyapargateway.com/api/v1/check_order_status
        """
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
            async with httpx.AsyncClient(timeout=4.0) as client:
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
            logger.debug(f"VyaparGateway check_order_status check error: {e}")

        return {"success": False, "is_paid": False, "status": "PENDING"}
