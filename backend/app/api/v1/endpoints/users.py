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
    
    if db_manager.is_connected:
        try:
            await db_manager.db.users.update_one(
                {"id": current_user.id},
                {"$set": update_data}
            )
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
            cursor = db_manager.db.users.find({})
            users = []
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                users.append(UserResponse(**doc))
            return users
        except Exception:
            pass

    return [UserResponse(**u) for u in DEFAULT_USERS_STORE.values()]
