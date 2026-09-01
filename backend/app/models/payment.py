from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field

class PaymentStatus(str, Enum):
    CREATED = "CREATED"
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class CreateOrderRequest(BaseModel):
    booking_id: str
    amount: float # in INR
    currency: str = "INR"

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int # in paise for Razorpay
    currency: str
    key_id: str
    booking_id: str

class VerifyPaymentRequest(BaseModel):
    booking_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class VerifyPaymentResponse(BaseModel):
    success: bool
    booking_id: str
    payment_id: str
    status: PaymentStatus
    message: str
