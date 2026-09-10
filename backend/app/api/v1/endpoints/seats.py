from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.seat_lock import (
    SeatLayoutResponse,
    SeatLockRequest,
    SeatLockResponse,
    SeatReleaseRequest
)
from app.models.user import UserResponse
from app.services.seat_lock_service import SeatLockService
from app.api.deps import get_optional_user

router = APIRouter()

@router.get("/{show_id}/layout", response_model=SeatLayoutResponse)
async def get_seat_layout(show_id: str):
    """Retrieve visual cinema seat layout with real-time availability and lock states"""
    return await SeatLockService.get_show_layout(show_id)

@router.post("/lock", response_model=SeatLockResponse)
async def lock_seats(
    req: SeatLockRequest,
    current_user: Optional[UserResponse] = Depends(get_optional_user)
):
    """
    Atomically request a 5-minute lock on requested seats.
    Returns 409 Conflict if any seat is already locked or booked.
    """
    if len(req.seat_ids) == 0 or len(req.seat_ids) > 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can select between 1 and 8 seats per booking session."
        )
    
    user_id = current_user.id if current_user else "guest_session"
    return await SeatLockService.lock_seats(
        show_id=req.show_id,
        seat_ids=req.seat_ids,
        user_id=user_id
    )

@router.post("/release")
async def release_seats(
    req: SeatReleaseRequest,
    current_user: Optional[UserResponse] = Depends(get_optional_user)
):
    """Explicitly release temporary seat lock"""
    await SeatLockService.release_seats(
        show_id=req.show_id,
        lock_token=req.lock_token
    )
    return {"message": "Seat locks successfully released."}
