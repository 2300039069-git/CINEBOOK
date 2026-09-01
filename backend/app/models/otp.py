from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole

class SendOTPRequest(BaseModel):
    email: EmailStr
    purpose: str = "REGISTRATION"

class VerifyRegistrationOTPRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    otp: str = Field(..., min_length=6, max_length=6)
    role: UserRole = UserRole.CUSTOMER

class SendResetOTPRequest(BaseModel):
    email: EmailStr

class ResetPasswordWithOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)

class OTPResponse(BaseModel):
    success: bool
    message: str
    email: str
    expires_in_seconds: int = 300
    otp: Optional[str] = None
    email_delivered: bool = False
