import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from app.models.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    UserRole
)
from app.models.otp import (
    SendOTPRequest,
    VerifyRegistrationOTPRequest,
    SendResetOTPRequest,
    ResetPasswordWithOTPRequest,
    OTPResponse
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token
)
from app.core.database import db_manager
from app.api.deps import get_current_active_user, DEFAULT_USERS_STORE
from app.services.otp_service import OTPService

logger = logging.getLogger("cinebook.auth")

router = APIRouter()

USERS_DATABASE = {
    "kancharladhanush2003@gmail.com": {
        "id": "usr-admin-dhanush",
        "name": "Dhanush Kancharla (Super Admin)",
        "email": "kancharladhanush2003@gmail.com",
        "password_hash": get_password_hash("AdminPass@2026"),
        "phone": "+91 98765 00001",
        "role": UserRole.SUPER_ADMIN,
        "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop",
        "is_active": True,
        "theatre_ids": []
    }
}

# --- 1. REGISTRATION WITH OTP FLOW ---

@router.post("/send-registration-otp", response_model=OTPResponse)
async def send_registration_otp(req: SendOTPRequest):
    """Generate and dispatch 6-digit OTP directly to customer's email inbox"""
    email_clean = req.email.lower()
    
    if db_manager.is_connected:
        try:
            existing = await db_manager.fetch_one("SELECT id FROM users WHERE email = $1;", email_clean)
            if existing:
                raise HTTPException(status_code=400, detail="An account with this email is already registered. Please sign in.")
        except HTTPException:
            raise
        except Exception:
            pass

    if email_clean in USERS_DATABASE:
        raise HTTPException(status_code=400, detail="An account with this email is already registered. Please sign in.")

    code, ttl, delivered, delivery_msg = await OTPService.create_otp(email=email_clean, purpose="REGISTRATION")
    
    msg = (
        f"6-digit verification code sent to {email_clean}. Please check your inbox."
        if delivered
        else f"Verification code generated for {email_clean}."
    )
    
    return OTPResponse(
        success=True,
        message=msg,
        email=email_clean,
        expires_in_seconds=ttl,
        otp=code,
        email_delivered=delivered
    )

@router.post("/verify-registration-otp", response_model=Token, status_code=status.HTTP_201_CREATED)
async def verify_registration_otp(req: VerifyRegistrationOTPRequest):
    """Validate 6-digit OTP, create user in Supabase, and issue JWT access token"""
    email_clean = req.email.lower()
    
    is_valid = await OTPService.verify_otp(email=email_clean, code=req.otp, purpose="REGISTRATION")
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please check your email and try again."
        )

    new_user_id = f"usr-{uuid.uuid4().hex[:8]}"
    hashed_pwd = get_password_hash(req.password)
    now_dt = datetime.now(timezone.utc)

    user_dict = {
        "id": new_user_id,
        "name": req.name,
        "email": email_clean,
        "phone": req.phone,
        "password_hash": hashed_pwd,
        "role": req.role.value if hasattr(req.role, "value") else str(req.role),
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
        "is_active": True,
        "theatre_ids": [],
        "created_at": now_dt
    }

    if db_manager.is_connected:
        try:
            await db_manager.execute(
                """
                INSERT INTO users (id, name, email, phone, password_hash, role, avatar, is_active, theatre_ids, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (email) DO UPDATE SET
                    name = EXCLUDED.name,
                    phone = EXCLUDED.phone,
                    password_hash = EXCLUDED.password_hash;
                """,
                new_user_id, req.name, email_clean, req.phone, hashed_pwd,
                user_dict["role"], user_dict["avatar"], True, [], now_dt
            )
        except Exception as e:
            logger.warning(f"Supabase user insert error: {e}")

    USERS_DATABASE[email_clean] = user_dict
    DEFAULT_USERS_STORE[new_user_id] = user_dict

    token_str = create_access_token(subject=new_user_id, role=user_dict["role"])
    user_response = UserResponse(
        id=new_user_id,
        name=req.name,
        email=email_clean,
        phone=req.phone,
        role=req.role,
        avatar=user_dict["avatar"],
        is_active=True,
        theatre_ids=[]
    )

    return Token(access_token=token_str, user=user_response)

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(req: UserCreate):
    """Direct user registration into Supabase and token issuance"""
    email_clean = req.email.strip().lower()
    
    try:
        existing = await db_manager.fetch_one("SELECT id FROM users WHERE LOWER(email) = $1;", email_clean)
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email is already registered. Please sign in.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking existing user: {e}")

    if email_clean in USERS_DATABASE:
        raise HTTPException(status_code=400, detail="An account with this email is already registered. Please sign in.")

    new_user_id = f"usr-{uuid.uuid4().hex[:8]}"
    hashed_pwd = get_password_hash(req.password)
    now_dt = datetime.now(timezone.utc)

    user_dict = {
        "id": new_user_id,
        "name": req.name.strip(),
        "email": email_clean,
        "phone": req.phone.strip() if req.phone else None,
        "password_hash": hashed_pwd,
        "role": req.role.value if hasattr(req.role, "value") else str(req.role),
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
        "is_active": True,
        "theatre_ids": [],
        "created_at": now_dt
    }

    try:
        await db_manager.execute(
            """
            INSERT INTO users (id, name, email, phone, password_hash, role, avatar, is_active, theatre_ids, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                phone = EXCLUDED.phone,
                password_hash = EXCLUDED.password_hash;
            """,
            new_user_id, user_dict["name"], email_clean, user_dict["phone"], hashed_pwd,
            user_dict["role"], user_dict["avatar"], True, [], now_dt
        )
    except Exception as e:
        logger.error(f"Supabase user registration insert error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user in database. Please try again."
        )

    USERS_DATABASE[email_clean] = user_dict
    DEFAULT_USERS_STORE[new_user_id] = user_dict

    token_str = create_access_token(subject=new_user_id, role=user_dict["role"])
    user_response = UserResponse(
        id=new_user_id,
        name=user_dict["name"],
        email=email_clean,
        phone=user_dict["phone"],
        role=req.role,
        avatar=user_dict["avatar"],
        is_active=True,
        theatre_ids=[]
    )

    return Token(access_token=token_str, user=user_response)

# --- 2. FORGOT PASSWORD WITH OTP FLOW ---

@router.post("/send-reset-otp", response_model=OTPResponse)
async def send_reset_otp(req: SendResetOTPRequest):
    """Generate and dispatch 6-digit OTP for password reset directly to customer's email"""
    email_clean = req.email.lower()
    
    code, ttl, delivered, delivery_msg = await OTPService.create_otp(email=email_clean, purpose="FORGOT_PASSWORD")
    
    msg = (
        f"Password reset verification code sent to {email_clean}. Please check your inbox."
        if delivered
        else f"Password reset verification code generated for {email_clean}."
    )

    return OTPResponse(
        success=True,
        message=msg,
        email=email_clean,
        expires_in_seconds=ttl,
        otp=code,
        email_delivered=delivered
    )

@router.post("/verify-reset-otp")
async def verify_reset_otp(req: ResetPasswordWithOTPRequest):
    """Verify OTP and update user password in Supabase"""
    email_clean = req.email.lower()

    is_valid = await OTPService.verify_otp(email=email_clean, code=req.otp, purpose="FORGOT_PASSWORD")
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code. Please check your email and try again."
        )

    new_hash = get_password_hash(req.new_password)

    if db_manager.is_connected:
        try:
            await db_manager.execute(
                "UPDATE users SET password_hash = $1 WHERE email = $2;",
                new_hash, email_clean
            )
        except Exception as e:
            logger.warning(f"Supabase password update error: {e}")

    if email_clean in USERS_DATABASE:
        USERS_DATABASE[email_clean]["password_hash"] = new_hash

    return {"success": True, "message": "Password reset successfully. You can now sign in with your new password."}

# --- 3. STANDARD LOGIN & ME ---

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Authenticate user with email/password and issue JWT token"""
    email_lower = credentials.email.strip().lower()
    user_doc = None

    try:
        user_doc = await db_manager.fetch_one("SELECT * FROM users WHERE LOWER(email) = $1;", email_lower)
    except Exception as e:
        logger.error(f"Supabase login lookup error: {e}")

    if not user_doc and email_lower in USERS_DATABASE:
        user_doc = USERS_DATABASE[email_lower]

    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    if not verify_password(credentials.password, user_doc.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    user_id = str(user_doc.get("id"))
    role_val = user_doc.get("role", "CUSTOMER")
    
    token_str = create_access_token(subject=user_id, role=role_val)
    user_response = UserResponse(
        id=user_id,
        name=user_doc.get("name"),
        email=user_doc.get("email"),
        phone=user_doc.get("phone"),
        role=UserRole(role_val) if role_val in UserRole.__members__ else UserRole.CUSTOMER,
        avatar=user_doc.get("avatar"),
        is_active=user_doc.get("is_active", True),
        theatre_ids=user_doc.get("theatre_ids") or []
    )

    return Token(access_token=token_str, user=user_response)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_active_user)):
    """Retrieve profile of the currently authenticated user"""
    return current_user
