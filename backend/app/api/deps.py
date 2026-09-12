from typing import Generator, Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.models.user import UserResponse, UserRole
from app.core.database import db_manager

security_bearer = HTTPBearer(auto_error=False)

# In-memory users for quick testing / fallback
DEFAULT_USERS_STORE = {
    "usr-admin-dhanush": {
        "id": "usr-admin-dhanush",
        "name": "Dhanush Kancharla (Super Admin)",
        "email": "kancharladhanush2003@gmail.com",
        "phone": "+91 98765 00001",
        "role": UserRole.SUPER_ADMIN,
        "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop",
        "is_active": True,
        "theatre_ids": []
    }
}

async def get_current_user(
    token_auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> UserResponse:
    """Validate JWT token and return currently authenticated user profile"""
    if not token_auth:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = token_auth.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token subject invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    doc = None
    try:
        doc = await db_manager.fetch_one(
            "SELECT * FROM users WHERE id = $1 OR LOWER(email) = LOWER($1);",
            user_id
        )
    except Exception:
        pass

    if doc:
        return UserResponse(**doc)

    if user_id in DEFAULT_USERS_STORE:
        return UserResponse(**DEFAULT_USERS_STORE[user_id])

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="User account not found or has been removed.",
        headers={"WWW-Authenticate": "Bearer"},
    )

async def get_optional_user(
    token_auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Optional[UserResponse]:
    """Return user if valid token present, otherwise None (allows guest operations)"""
    if not token_auth:
        return None
    try:
        return await get_current_user(token_auth)
    except Exception:
        return None

async def get_current_active_user(
    current_user: UserResponse = Depends(get_current_user)
) -> UserResponse:
    """Ensure authenticated user account is active"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been deactivated."
        )
    return current_user

def require_roles(allowed_roles: List[UserRole]):
    """Decorator dependency enforcing role-based access control"""
    async def role_checker(current_user: UserResponse = Depends(get_current_active_user)) -> UserResponse:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {[r.value for r in allowed_roles]}."
            )
        return current_user
    return role_checker
