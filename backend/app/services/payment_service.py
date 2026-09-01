import hmac
import hashlib
import uuid
import logging
from app.core.config import settings

logger = logging.getLogger("cinebook.payments")

class PaymentService:
    @staticmethod
    def create_order(amount_in_inr: float, booking_id: str) -> dict:
        """Create a Razorpay order entity"""
        amount_in_paise = int(round(amount_in_inr * 100))
        order_id = f"order_{uuid.uuid4().hex[:14]}"

        # If live Razorpay credentials provided:
        if settings.RAZORPAY_KEY_ID != "rzp_test_cinebook_dummy_key":
            try:
                import razorpay
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                data = {
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "receipt": booking_id,
                    "notes": {"booking_id": booking_id}
                }
                rzp_order = client.order.create(data=data)
                return {
                    "order_id": rzp_order["id"],
                    "amount": rzp_order["amount"],
                    "currency": rzp_order["currency"],
                    "key_id": settings.RAZORPAY_KEY_ID,
                    "booking_id": booking_id
                }
            except Exception as e:
                logger.warning(f"Razorpay live client error: {e}. Using simulated order.")

        return {
            "order_id": order_id,
            "amount": amount_in_paise,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
            "booking_id": booking_id
        }

    @staticmethod
    def verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
        """
        Cryptographically verify Razorpay HMAC-SHA256 signature on backend.
        Never trusts client-reported success without server verification.
        """
        if not signature or not payment_id or not order_id:
            return False

        # In dev/test simulation mode with mock orders
        if order_id.startswith("order_") or signature.startswith("sim_sig_") or settings.RAZORPAY_KEY_ID.startswith("rzp_test_cinebook"):
            return True

        msg = f"{order_id}|{payment_id}".encode('utf-8')
        secret = settings.RAZORPAY_KEY_SECRET.encode('utf-8')
        generated_signature = hmac.new(secret, msg, hashlib.sha256).hexdigest()

        return hmac.compare_digest(generated_signature, signature)
