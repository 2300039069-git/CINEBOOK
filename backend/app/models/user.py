from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, EmailStr, Field

class UserRole(str, Enum):
    CUSTOMER = "CUSTOMER"
    THEATRE_ADMIN = "THEATRE_ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    theatre_ids: List[str] = []
    avatar: Optional[str] = None
    is_active: bool = True

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.CUSTOMER

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    token: str
    new_password: str = Field(..., min_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True

Token.model_rebuild()
