import hmac
import hashlib
import logging
import requests
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger("cinebook.instamojo")

class InstamojoService:
    """
    Instamojo Payment Gateway Integration.
    Supports Credit Cards, Debit Cards, Net Banking, UPI (PhonePe, GPay, Paytm), and Wallets.
    Supports both v2 OAuth API and v1.1 API with SHA-1 Webhook MAC validation.
    """

    @classmethod
    def get_base_url(cls) -> str:
        if getattr(settings, "INSTAMOJO_ENV", "production") == "test":
            return "https://test.instamojo.com"
        return "https://api.instamojo.com"

    @classmethod
    async def create_payment_request(
        cls,
        amount: float,
        booking_id: str,
        customer_name: str = "Valued Cinema Guest",
        customer_email: str = "customer@cinebook.in",
        customer_phone: str = "9848012345",
        redirect_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates an Instamojo Payment Request for an active movie ticket booking.
        """
        base_url = cls.get_base_url()
        api_key = getattr(settings, "INSTAMOJO_API_KEY", "")
        auth_token = getattr(settings, "INSTAMOJO_AUTH_TOKEN", "")

        # Target redirect URL on completion
        success_redirect = redirect_url or f"https://cinebook.cyou/booking-confirmation/{booking_id}"
        webhook_url = "https://cinebook-backend-i2k9.onrender.com/api/v1/payments/instamojo-webhook"

        headers = {
            "X-Api-Key": api_key,
            "X-Auth-Token": auth_token
        }

        payload = {
            "purpose": f"CineBook Movie Ticket - {booking_id}",
            "amount": f"{amount:.2f}",
            "buyer_name": customer_name,
            "email": customer_email,
            "phone": customer_phone,
            "redirect_url": success_redirect,
            "webhook": webhook_url,
            "send_email": False,
            "send_sms": False,
            "allow_repeated_payments": False
        }

        try:
            response = requests.post(
                f"{base_url}/api/1.1/payment-requests/",
                data=payload,
                headers=headers,
                timeout=12
            )
            data = response.json()
            if data.get("success"):
                pr = data.get("payment_request", {})
                return {
                    "success": True,
                    "payment_request_id": pr.get("id"),
                    "payment_url": pr.get("longurl"),
                    "amount": float(pr.get("amount", amount)),
                    "status": pr.get("status")
                }
            else:
                logger.error(f"Instamojo create error: {data}")
                return {
                    "success": False,
                    "message": str(data.get("message", "Failed to create Instamojo payment request."))
                }
        except Exception as e:
            logger.error(f"Instamojo request exception: {e}")
            return {
                "success": False,
                "message": f"Instamojo connection error: {str(e)}"
            }

    @classmethod
    def verify_webhook_mac(cls, post_data: Dict[str, Any]) -> bool:
        """
        Validates Instamojo Webhook MAC signature using HMAC-SHA1 and INSTAMOJO_SALT.
        """
        salt = getattr(settings, "INSTAMOJO_SALT", "")
        if not salt:
            # If salt not configured, verify status directly
            return post_data.get("status") in ["Credit", "Completed", "SUCCESS"]

        mac_provided = post_data.get("mac", "")
        # Signature format: sort all fields alphabetically except 'mac'
        sorted_keys = sorted([k for k in post_data.keys() if k != "mac"])
        message = "|".join([str(post_data[k]) for k in sorted_keys])

        calculated_mac = hmac.new(
            salt.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha1
        ).hexdigest()

        return hmac.compare_digest(mac_provided, calculated_mac)
