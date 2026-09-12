from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.models.user import UserResponse, UserProfileUpdate, UserRole
from app.api.deps import get_current_active_user, require_roles, DEFAULT_USERS_STORE
from app.core.database import db_manager

router = APIRouter()

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_in: UserProfileUpdate,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Update current user profile information"""
    update_data = profile_in.model_dump(exclude_unset=True)
    
    if db_manager.is_connected and update_data:
        try:
            set_clauses = []
            params = []
            for i, (k, v) in enumerate(update_data.items(), start=1):
                set_clauses.append(f"{k} = ${i}")
                params.append(v)
            params.append(current_user.id)
            query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ${len(params)};"
            await db_manager.execute(query, *params)
        except Exception:
            pass

    if current_user.id in DEFAULT_USERS_STORE:
        DEFAULT_USERS_STORE[current_user.id].update(update_data)

    for k, v in update_data.items():
        setattr(current_user, k, v)

    return current_user

@router.get("", response_model=List[UserResponse])
async def list_all_users(
    admin: UserResponse = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """List all registered users (Super Admin only)"""
    if db_manager.is_connected:
        try:
            records = await db_manager.fetch_all("SELECT * FROM users ORDER BY created_at DESC;")
            if records:
                return [UserResponse(**doc) for doc in records]
        except Exception:
            pass

    return [UserResponse(**u) for u in DEFAULT_USERS_STORE.values()]
