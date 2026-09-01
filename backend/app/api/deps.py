from typing import Generator, Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.models.user import UserResponse, UserRole
from app.core.database import db_manager

security_bearer = HTTPBearer(auto_error=False)

# In-memory users for quick testing / fallback
DEFAULT_USERS_STORE = {
    "usr-001": {
        "id": "usr-001",
        "name": "Aarav Sharma",
        "email": "aarav.sharma@example.com",
        "phone": "+91 98765 43210",
        "role": UserRole.CUSTOMER,
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
        "is_active": True,
        "theatre_ids": []
    },
    "usr-002": {
        "id": "usr-002",
        "name": "Rajesh Malhotra",
        "email": "theatre@phoenixcinemas.com",
        "phone": "+91 98111 22334",
        "role": UserRole.THEATRE_ADMIN,
        "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
        "is_active": True,
        "theatre_ids": ["th-001"]
    },
    "usr-003": {
        "id": "usr-003",
        "name": "Super Administrator",
        "email": "admin@cinebook.in",
        "phone": "+91 99999 88888",
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
        # Check mock token format for frontend demo mode
        if token.startswith("jwt_"):
            try:
                import base64, json
                mock_data = json.loads(base64.b64decode(token[4:]).decode())
                user_id = mock_data.get("id", "usr-001")
                if user_id in DEFAULT_USERS_STORE:
                    return UserResponse(**DEFAULT_USERS_STORE[user_id])
            except Exception:
                pass

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
    
    if db_manager.is_connected:
        try:
            doc = await db_manager.db.users.find_one({"id": user_id})
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return UserResponse(**doc)
        except Exception:
            pass

    if user_id in DEFAULT_USERS_STORE:
        return UserResponse(**DEFAULT_USERS_STORE[user_id])
    
    # Generate user response if sub is email
    return UserResponse(
        id=user_id,
        name="CineBook User",
        email=user_id if "@" in user_id else f"{user_id}@cinebook.in",
        role=payload.get("role", UserRole.CUSTOMER),
        is_active=True
    )

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
