import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Tuple, Optional
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.database import db_manager
from app.models.seat_lock import (
    SeatStatus,
    SeatTier,
    SeatItem,
    SeatRow,
    SeatTierLayout,
    SeatLayoutResponse,
    SeatLockResponse
)

# In-memory lock store: { (show_id, seat_id): { "lock_token": str, "user_id": str, "expires_at": datetime, "status": "LOCKED" | "BOOKED" } }
IN_MEMORY_SEAT_STORE: Dict[Tuple[str, str], dict] = {}
LOCK_MUTEX = asyncio.Lock()

# Initial pre-booked seats for realism
DEFAULT_BOOKED = {
    ("sh-001", "D5"): "BOOKED",
    ("sh-001", "D6"): "BOOKED",
    ("sh-001", "D7"): "BOOKED",
    ("sh-001", "D8"): "BOOKED",
    ("sh-001", "C6"): "BOOKED",
    ("sh-001", "C7"): "BOOKED",
    ("sh-001", "A1"): "BOOKED",
    ("sh-001", "A2"): "BOOKED",
}
for (s_id, seat), st in DEFAULT_BOOKED.items():
    IN_MEMORY_SEAT_STORE[(s_id, seat)] = {
        "lock_token": "init_booked",
        "user_id": "system",
        "expires_at": datetime.max.replace(tzinfo=timezone.utc),
        "status": "BOOKED"
    }

class SeatLockService:
    @staticmethod
    def _cleanup_expired_locks():
        """Remove expired locks from in-memory store"""
        now = datetime.now(timezone.utc)
        expired_keys = [
            k for k, v in IN_MEMORY_SEAT_STORE.items()
            if v["status"] == "LOCKED" and v["expires_at"] <= now
        ]
        for k in expired_keys:
            del IN_MEMORY_SEAT_STORE[k]

    @classmethod
    async def get_show_layout(cls, show_id: str) -> SeatLayoutResponse:
        """Generate full cinema seat map with real-time dynamic statuses"""
        cls._cleanup_expired_locks()
        now = datetime.now(timezone.utc)

        # Retrieve MongoDB locks if connected
        db_locks = {}
        if db_manager.is_connected:
            try:
                cursor = db_manager.db.seat_locks.find({"show_id": show_id})
                async for doc in cursor:
                    if doc.get("expires_at") > now or doc.get("status") == "BOOKED":
                        db_locks[doc["seat_id"]] = doc["status"]
            except Exception:
                pass

        tiers_config = [
            {"tier": SeatTier.RECLINER, "label": "Recliner (Plush Loungers)", "price": 550.0, "rows": ["A", "B"]},
            {"tier": SeatTier.PREMIUM, "label": "Premium (Executive Seating)", "price": 380.0, "rows": ["C", "D", "E", "F"]},
            {"tier": SeatTier.CLASSIC, "label": "Classic (Standard Cinema)", "price": 250.0, "rows": ["G", "H", "J", "K"]},
        ]

        total_seats = 0
        available_count = 0
        locked_count = 0
        booked_count = 0

        layout_tiers = []
        seats_per_row = 14

        for tc in tiers_config:
            tier_rows = []
            for r_letter in tc["rows"]:
                seats_in_row = []
                for num in range(1, seats_per_row + 1):
                    seat_id = f"{r_letter}{num}"
                    total_seats += 1
                    
                    # Determine live status
                    seat_status = SeatStatus.AVAILABLE
                    
                    # 1. Check in-memory store
                    mem_entry = IN_MEMORY_SEAT_STORE.get((show_id, seat_id))
                    if mem_entry:
                        if mem_entry["status"] == "BOOKED":
                            seat_status = SeatStatus.BOOKED
                        elif mem_entry["status"] == "LOCKED" and mem_entry["expires_at"] > now:
                            seat_status = SeatStatus.LOCKED

                    # 2. Check MongoDB
                    if seat_id in db_locks:
                        if db_locks[seat_id] == "BOOKED":
                            seat_status = SeatStatus.BOOKED
                        elif db_locks[seat_id] == "LOCKED":
                            seat_status = SeatStatus.LOCKED

                    if seat_status == SeatStatus.AVAILABLE:
                        available_count += 1
                    elif seat_status == SeatStatus.LOCKED:
                        locked_count += 1
                    elif seat_status == SeatStatus.BOOKED:
                        booked_count += 1

                    seats_in_row.append(SeatItem(
                        id=seat_id,
                        number=num,
                        row=r_letter,
                        tier=tc["tier"],
                        price=tc["price"],
                        status=seat_status,
                        is_aisle_after=(num == 3 or num == 11)
                    ))
                tier_rows.append(SeatRow(row_letter=r_letter, seats=seats_in_row))
            
            layout_tiers.append(SeatTierLayout(
                name=tc["tier"],
                label=tc["label"],
                price=tc["price"],
                rows=tier_rows
            ))

        return SeatLayoutResponse(
            show_id=show_id,
            tiers=layout_tiers,
            total_seats=total_seats,
            available_seats=available_count,
            locked_seats=locked_count,
            booked_seats=booked_count
        )

    @classmethod
    async def lock_seats(cls, show_id: str, seat_ids: List[str], user_id: str, lock_token: Optional[str] = None) -> SeatLockResponse:
        """
        Atomically lock seats for 5 minutes (300s).
        Enforces strict race condition protection: if ANY seat is occupied, fails immediately with HTTP 409 Conflict.
        """
        async with LOCK_MUTEX:
            cls._cleanup_expired_locks()
            now = datetime.now(timezone.utc)
            expires_at = now + timedelta(seconds=settings.SEAT_LOCK_DURATION_SECONDS)
            if not lock_token:
                lock_token = f"lock_{uuid.uuid4().hex}"

            # 1. Atomic In-Memory Verification
            for seat_id in seat_ids:
                mem_entry = IN_MEMORY_SEAT_STORE.get((show_id, seat_id))
                if mem_entry:
                    if mem_entry.get("isBooked") is True or mem_entry.get("status") == "BOOKED":
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail="Seat already booked"
                        )
                    if mem_entry.get("status") == "LOCKED" and mem_entry.get("expires_at") > now:
                        if mem_entry.get("lock_token") != lock_token:
                            raise HTTPException(
                                status_code=status.HTTP_409_CONFLICT,
                                detail="Seat already booked"
                            )

            # 2. MongoDB Atomic reservation with find_one_and_update & isBooked check
            if db_manager.is_connected:
                locked_in_this_batch = []
                try:
                    for seat_id in seat_ids:
                        # Atomic find_one_and_update with isBooked: False
                        doc = await db_manager.db.seat_locks.find_one_and_update(
                            {
                                "show_id": show_id,
                                "seat_id": seat_id,
                                "isBooked": {"$ne": True},
                                "status": {"$ne": "BOOKED"},
                                "$or": [
                                    {"expires_at": {"$lte": now}},
                                    {"lock_token": lock_token},
                                    {"status": {"$exists": False}}
                                ]
                            },
                            {
                                "$set": {
                                    "show_id": show_id,
                                    "seat_id": seat_id,
                                    "user_id": user_id,
                                    "lock_token": lock_token,
                                    "status": "LOCKED",
                                    "isBooked": False,
                                    "locked_at": now,
                                    "expires_at": expires_at
                                }
                            },
                            upsert=True,
                            return_document=True
                        )
                        if not doc:
                            if locked_in_this_batch:
                                await db_manager.db.seat_locks.delete_many({
                                    "show_id": show_id,
                                    "seat_id": {"$in": locked_in_this_batch},
                                    "lock_token": lock_token
                                })
                            raise HTTPException(
                                status_code=status.HTTP_409_CONFLICT,
                                detail="Seat already booked"
                            )
                        locked_in_this_batch.append(seat_id)
                except HTTPException:
                    if locked_in_this_batch:
                        await db_manager.db.seat_locks.delete_many({
                            "show_id": show_id,
                            "seat_id": {"$in": locked_in_this_batch},
                            "lock_token": lock_token
                        })
                    raise
                except Exception:
                    # In case of DB conflict or race condition on unique index
                    if locked_in_this_batch:
                        await db_manager.db.seat_locks.delete_many({
                            "show_id": show_id,
                            "seat_id": {"$in": locked_in_this_batch},
                            "lock_token": lock_token
                        })
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Seat already booked"
                    )

            # 3. Store in Memory
            for seat_id in seat_ids:
                IN_MEMORY_SEAT_STORE[(show_id, seat_id)] = {
                    "lock_token": lock_token,
                    "user_id": user_id,
                    "expires_at": expires_at,
                    "status": "LOCKED",
                    "isBooked": False
                }

            return SeatLockResponse(
                success=True,
                lock_token=lock_token,
                show_id=show_id,
                seat_ids=seat_ids,
                locked_at=now.isoformat(),
                expires_at=expires_at.isoformat(),
                seconds_remaining=settings.SEAT_LOCK_DURATION_SECONDS,
                message=f"Successfully locked {len(seat_ids)} seats."
            )

    @classmethod
    async def release_seats(cls, show_id: str, lock_token: str) -> bool:
        """Release temporary lock when customer cancels checkout or navigates away"""
        async with LOCK_MUTEX:
            if db_manager.is_connected:
                try:
                    await db_manager.db.seat_locks.delete_many({
                        "show_id": show_id,
                        "lock_token": lock_token,
                        "status": "LOCKED"
                    })
                except Exception:
                    pass

            released_keys = [
                k for k, v in IN_MEMORY_SEAT_STORE.items()
                if k[0] == show_id and v.get("lock_token") == lock_token and v.get("status") == "LOCKED"
            ]
            for k in released_keys:
                del IN_MEMORY_SEAT_STORE[k]

            return True

    @classmethod
    async def validate_and_claim_lock_for_booking(
        cls,
        show_id: str,
        seat_ids: List[str],
        user_id: str,
        lock_token: Optional[str] = None
    ) -> bool:
        """
        Pessimistic concurrency lock validation before booking session creation.
        Ensures:
        1. None of the seats are permanently BOOKED in database or memory.
        2. If seats are locked, the active hold belongs to this user/lock_token and is not expired.
        3. Rejects expired or unauthorized hold attempts with HTTP 409 Conflict.
        """
        async with LOCK_MUTEX:
            cls._cleanup_expired_locks()
            now = datetime.now(timezone.utc)
            expires_at = now + timedelta(seconds=settings.SEAT_LOCK_DURATION_SECONDS)

            for seat_id in seat_ids:
                # 1. In-Memory checks
                mem_entry = IN_MEMORY_SEAT_STORE.get((show_id, seat_id))
                if mem_entry:
                    if mem_entry.get("isBooked") is True or mem_entry.get("status") == "BOOKED":
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"Seat {seat_id} is already booked."
                        )
                    if mem_entry.get("status") == "LOCKED":
                        if mem_entry.get("expires_at") <= now:
                            raise HTTPException(
                                status_code=status.HTTP_409_CONFLICT,
                                detail=f"Seat hold for {seat_id} has expired. Please select your seats again."
                            )
                        if (
                            mem_entry.get("user_id")
                            and mem_entry.get("user_id") != user_id
                            and (not lock_token or mem_entry.get("lock_token") != lock_token)
                        ):
                            raise HTTPException(
                                status_code=status.HTTP_409_CONFLICT,
                                detail=f"Seat {seat_id} is currently held by another customer."
                            )

                # 2. MongoDB checks if connected
                if db_manager.is_connected:
                    # Check permanently booked collection
                    booked_doc = await db_manager.db.booked_seats.find_one({
                        "show_id": show_id,
                        "seat_id": seat_id
                    })
                    if booked_doc:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"Seat {seat_id} is already booked."
                        )

                    # Check active seat locks collection
                    lock_doc = await db_manager.db.seat_locks.find_one({
                        "show_id": show_id,
                        "seat_id": seat_id
                    })
                    if lock_doc:
                        if lock_doc.get("isBooked") is True or lock_doc.get("status") == "BOOKED":
                            raise HTTPException(
                                status_code=status.HTTP_409_CONFLICT,
                                detail=f"Seat {seat_id} is already booked."
                            )
                        if lock_doc.get("expires_at") and lock_doc.get("expires_at") <= now:
                            raise HTTPException(
                                status_code=status.HTTP_409_CONFLICT,
                                detail=f"Seat hold for {seat_id} has expired. Please select your seats again."
                            )
                        if (
                            lock_doc.get("user_id")
                            and lock_doc.get("user_id") != user_id
                            and (not lock_token or lock_doc.get("lock_token") != lock_token)
                        ):
                            raise HTTPException(
                                status_code=status.HTTP_409_CONFLICT,
                                detail=f"Seat {seat_id} is currently held by another customer."
                            )

            # Claim / refresh lock for current booking session
            claim_token = lock_token or f"lock_{user_id}_{uuid.uuid4().hex[:6]}"
            if db_manager.is_connected:
                try:
                    for seat_id in seat_ids:
                        await db_manager.db.seat_locks.update_one(
                            {"show_id": show_id, "seat_id": seat_id},
                            {"$set": {
                                "show_id": show_id,
                                "seat_id": seat_id,
                                "user_id": user_id,
                                "lock_token": claim_token,
                                "status": "LOCKED",
                                "isBooked": False,
                                "locked_at": now,
                                "expires_at": expires_at
                            }},
                            upsert=True
                        )
                except Exception:
                    pass

            for seat_id in seat_ids:
                IN_MEMORY_SEAT_STORE[(show_id, seat_id)] = {
                    "lock_token": claim_token,
                    "user_id": user_id,
                    "expires_at": expires_at,
                    "status": "LOCKED",
                    "isBooked": False
                }

            return True

    @classmethod
    async def permanently_book_seats(
        cls,
        show_id: str,
        lock_token: str,
        seat_ids: List[str],
        user_id: str = "confirmed",
        booking_id: str = ""
    ):
        """Mark seats permanently BOOKED after payment signature is verified"""
        async with LOCK_MUTEX:
            now = datetime.now(timezone.utc)
            max_dt = datetime.max.replace(tzinfo=timezone.utc)
            if db_manager.is_connected:
                try:
                    for seat_id in seat_ids:
                        # 1. Insert/upsert into booked_seats collection (enforcing unique compound index)
                        await db_manager.db.booked_seats.update_one(
                            {"show_id": show_id, "seat_id": seat_id},
                            {"$set": {
                                "show_id": show_id,
                                "seat_id": seat_id,
                                "user_id": user_id,
                                "booking_id": booking_id,
                                "booked_at": now
                            }},
                            upsert=True
                        )
                        # 2. Update seat_locks status
                        await db_manager.db.seat_locks.find_one_and_update(
                            {"show_id": show_id, "seat_id": seat_id},
                            {"$set": {
                                "status": "BOOKED",
                                "isBooked": True,
                                "user_id": user_id,
                                "booking_id": booking_id,
                                "expires_at": max_dt
                            }},
                            upsert=True
                        )
                except Exception:
                    pass

            for seat_id in seat_ids:
                IN_MEMORY_SEAT_STORE[(show_id, seat_id)] = {
                    "lock_token": lock_token,
                    "user_id": user_id,
                    "booking_id": booking_id,
                    "expires_at": max_dt,
                    "status": "BOOKED",
                    "isBooked": True
                }
