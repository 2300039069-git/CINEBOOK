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
