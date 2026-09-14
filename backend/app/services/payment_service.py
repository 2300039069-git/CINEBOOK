import hashlib
import uuid
import logging
import requests
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger("cinebook.payments")

# CASHU Merchant Credentials
CASHU_MERCHANT_ID = getattr(settings, "CASHU_MERCHANT_ID", "YOUR_CASHU_MERCHANT_ID")
CASHU_ENCRYPTION_KEY = getattr(settings, "CASHU_ENCRYPTION_KEY", "YOUR_CASHU_ENCRYPTION_KEY")
CASHU_GATEWAY_URL = getattr(settings, "CASHU_GATEWAY_URL", "https://www.cashu.com/cgi-bin/pcashu.cgi")  # Use sandbox for testing

def create_cashu_payment(order_id: str, amount: float, currency: str = "USD", client_email: str = ""):
    # CASHU token format: SHA256(merchant_id:amount:currency:key)
    raw_str = f"{CASHU_MERCHANT_ID}:{amount:.2f}:{currency}:{CASHU_ENCRYPTION_KEY}".lower()
    token = hashlib.sha256(raw_str.encode("utf-8")).hexdigest()
    
    return {
        "gateway_url": CASHU_GATEWAY_URL,
        "params": {
            "merchant_id": CASHU_MERCHANT_ID,
            "token": token,
            "display_text": f"Booking #{order_id}",
            "currency": currency,
            "amount": f"{amount:.2f}",
            "language": "en",
            "session_id": order_id,
            "txt1": client_email
        }
    }

def verify_cashu_signature(data: dict) -> bool:
    # CASHU verification hash: SHA256(merchant_id:amount:currency:session_id:key)
    raw_str = f"{CASHU_MERCHANT_ID}:{data.get('amount')}:{data.get('currency')}:{data.get('session_id')}:{CASHU_ENCRYPTION_KEY}".lower()
    expected_token = hashlib.sha256(raw_str.encode("utf-8")).hexdigest()
    return expected_token == data.get("verification_token")

class PaymentService:
    @classmethod
    async def create_order(
        cls,
        amount_in_inr: float,
        booking_id: str,
        customer_details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        cust = customer_details or {}
        email = cust.get("customer_email", "customer@cinebook.in")
        cashu_data = create_cashu_payment(
            order_id=booking_id,
            amount=amount_in_inr,
            currency="USD",
            client_email=email
        )
        return {
            "order_id": booking_id,
            "gateway_url": cashu_data["gateway_url"],
            "params": cashu_data["params"],
            "booking_id": booking_id,
            "order_amount": amount_in_inr
        }

    @classmethod
    async def verify_order(cls, order_id: str) -> Dict[str, Any]:
        return {
            "is_valid": True,
            "status": "PAID",
            "payment_id": f"cashu_pay_{order_id}"
        }
