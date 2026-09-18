from typing import Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class PaymentStatus(str, Enum):
    CREATED = "CREATED"
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    PAID = "PAID"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"

class CustomerDetails(BaseModel):
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None

class CreateOrderRequest(BaseModel):
    booking_id: str
    amount: float  # in INR
    currency: str = "INR"
    customer_details: Optional[CustomerDetails] = None

class CreateOrderResponse(BaseModel):
    order_id: str
    payment_session_id: str
    order_amount: float
    order_currency: str = "INR"
    environment: str = "sandbox"
    booking_id: str
    cf_order_id: Optional[str] = None

class VerifyPaymentRequest(BaseModel):
    booking_id: Optional[str] = None
    order_id: str
    payment_id: Optional[str] = None
    cf_payment_id: Optional[str] = None

class VerifyPaymentResponse(BaseModel):
    success: bool
    booking_id: Optional[str] = None
    order_id: Optional[str] = None
    payment_id: Optional[str] = None
    status: PaymentStatus
    message: str

# --- Direct UPI QR Code Models ---

class CreateUpiQrRequest(BaseModel):
    booking_id: str
    amount: float
    movie_title: Optional[str] = "Movie Ticket"
    customer_details: Optional[CustomerDetails] = None

class CreateUpiQrResponse(BaseModel):
    order_id: str
    booking_id: str
    amount: float
    currency: str = "INR"
    upi_id: str
    payee_name: str
    upi_intent_url: str
    qr_data: str
    expires_in_seconds: int = 300
    status: PaymentStatus = PaymentStatus.PENDING

class UpiStatusResponse(BaseModel):
    order_id: str
    booking_id: str
    status: PaymentStatus
    amount: float
    paid: bool
    utr_number: Optional[str] = None
    booking: Optional[Dict[str, Any]] = None
    message: str

class UpiWebhookPayload(BaseModel):
    order_id: Optional[str] = None
    booking_id: Optional[str] = None
    utr: Optional[str] = None
    utr_number: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = "SUCCESS"
    raw_message: Optional[str] = None
    secret: Optional[str] = None

class VerifyUtrRequest(BaseModel):
    order_id: str
    booking_id: Optional[str] = None
    utr_number: str

