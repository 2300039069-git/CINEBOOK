import asyncio
import uuid
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Tuple, Optional
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.database import db_manager

logger = logging.getLogger("cinebook.seat_lock")
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
        await db_manager.ensure_connected()
        cls._cleanup_expired_locks()
        now = datetime.now(timezone.utc)

        # Retrieve Supabase locks if connected
        db_locks = {}
        if db_manager.is_connected:
            try:
                # 1. Permanently booked seats from booked_seats table
                booked_rows = await db_manager.fetch_all(
                    "SELECT seat_id FROM booked_seats WHERE show_id = $1;",
                    show_id
                )
                for r in booked_rows:
                    db_locks[r["seat_id"]] = "BOOKED"

                # 2. Active temporary locks from seat_locks table
                lock_rows = await db_manager.fetch_all(
                    "SELECT seat_id, status, expires_at, is_booked FROM seat_locks WHERE show_id = $1 AND (expires_at > $2 OR status = 'BOOKED' OR is_booked = TRUE);",
                    show_id,
                    now
                )
                for r in lock_rows:
                    if r.get("is_booked") or r.get("status") == "BOOKED":
                        db_locks[r["seat_id"]] = "BOOKED"
                    else:
                        db_locks[r["seat_id"]] = "LOCKED"
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

                    # 2. Check Supabase
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
            await db_manager.ensure_connected()
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
                        if mem_entry.get("lock_token") != lock_token or (mem_entry.get("user_id") and mem_entry.get("user_id") != user_id):
                            raise HTTPException(
                                status_code=status.HTTP_409_CONFLICT,
                                detail="Seat already booked"
                            )

            # 2. Supabase Atomic reservation & conflict checks
            if db_manager.is_connected:
                # Check permanently booked seats
                booked_recs = await db_manager.fetch_all(
                    "SELECT seat_id FROM booked_seats WHERE show_id = $1 AND seat_id = ANY($2);",
                    show_id, seat_ids
                )
                if booked_recs:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Seat already booked"
                    )

                # Check active unexpired locks held by another user
                lock_recs = await db_manager.fetch_all(
                    """
                    SELECT seat_id, user_id, lock_token, status, is_booked, expires_at 
                    FROM seat_locks 
                    WHERE show_id = $1 AND seat_id = ANY($2) AND (expires_at > $3 OR status = 'BOOKED' OR is_booked = TRUE);
                    """,
                    show_id, seat_ids, now
                )
                for r in lock_recs:
                    if r.get("is_booked") or r.get("status") == "BOOKED":
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail="Seat already booked"
                        )
                    if r.get("lock_token") != lock_token or (r.get("user_id") and r.get("user_id") != user_id):
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail="Seat already booked"
                        )

                # Upsert locks atomically in Supabase
                try:
                    for seat_id in seat_ids:
                        await db_manager.execute(
                            """
                            INSERT INTO seat_locks (
                                show_id, seat_id, user_id, lock_token, status, is_booked, locked_at, expires_at
                            ) VALUES (
                                $1, $2, $3, $4, 'LOCKED', FALSE, $5, $6
                            ) ON CONFLICT (show_id, seat_id) DO UPDATE SET
                                user_id = EXCLUDED.user_id,
                                lock_token = EXCLUDED.lock_token,
                                status = 'LOCKED',
                                is_booked = FALSE,
                                locked_at = EXCLUDED.locked_at,
                                expires_at = EXCLUDED.expires_at;
                            """,
                            show_id, seat_id, user_id, lock_token, now, expires_at
                        )
                except Exception as e:
                    logger.error(f"Supabase lock error: {e}")
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
            await db_manager.ensure_connected()
            if db_manager.is_connected:
                try:
                    await db_manager.execute(
                        "DELETE FROM seat_locks WHERE show_id = $1 AND lock_token = $2 AND status = 'LOCKED';",
                        show_id, lock_token
                    )
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
        1. None of the seats are permanently BOOKED in Supabase or memory.
        2. If seats are locked, the active hold belongs to this user/lock_token and is not expired.
        3. Rejects expired or unauthorized hold attempts with HTTP 409 Conflict.
        """
        async with LOCK_MUTEX:
            await db_manager.ensure_connected()
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
                            (lock_token and mem_entry.get("lock_token") and mem_entry.get("lock_token") != lock_token)
                            or (mem_entry.get("user_id") and mem_entry.get("user_id") != user_id and mem_entry.get("lock_token") != lock_token)
                        ):
                            raise HTTPException(
                                status_code=status.HTTP_409_CONFLICT,
                                detail=f"Seat {seat_id} is currently held by another customer."
                            )

            # 2. Supabase checks if connected
            if db_manager.is_connected:
                # Check permanently booked table
                booked_recs = await db_manager.fetch_all(
                    "SELECT seat_id FROM booked_seats WHERE show_id = $1 AND seat_id = ANY($2);",
                    show_id, seat_ids
                )
                if booked_recs:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Seat {booked_recs[0]['seat_id']} is already booked."
                    )

                # Check active seat locks table
                lock_recs = await db_manager.fetch_all(
                    "SELECT seat_id, user_id, lock_token, status, is_booked, expires_at FROM seat_locks WHERE show_id = $1 AND seat_id = ANY($2);",
                    show_id, seat_ids
                )
                for lock_doc in lock_recs:
                    if lock_doc.get("is_booked") is True or lock_doc.get("status") == "BOOKED":
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"Seat {lock_doc['seat_id']} is already booked."
                        )
                    if lock_doc.get("expires_at") and lock_doc.get("expires_at") <= now:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"Seat hold for {lock_doc['seat_id']} has expired. Please select your seats again."
                        )
                    if (
                        (lock_token and lock_doc.get("lock_token") and lock_doc.get("lock_token") != lock_token)
                        or (lock_doc.get("user_id") and lock_doc.get("user_id") != user_id and lock_doc.get("lock_token") != lock_token)
                    ):
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"Seat {lock_doc['seat_id']} is currently held by another customer."
                        )

            # Claim / refresh lock for current booking session
            claim_token = lock_token or f"lock_{user_id}_{uuid.uuid4().hex[:6]}"
            if db_manager.is_connected:
                try:
                    for seat_id in seat_ids:
                        await db_manager.execute(
                            """
                            INSERT INTO seat_locks (
                                show_id, seat_id, user_id, lock_token, status, is_booked, locked_at, expires_at
                            ) VALUES (
                                $1, $2, $3, $4, 'LOCKED', FALSE, $5, $6
                            ) ON CONFLICT (show_id, seat_id) DO UPDATE SET
                                user_id = EXCLUDED.user_id,
                                lock_token = EXCLUDED.lock_token,
                                status = 'LOCKED',
                                is_booked = FALSE,
                                locked_at = EXCLUDED.locked_at,
                                expires_at = EXCLUDED.expires_at;
                            """,
                            show_id, seat_id, user_id, claim_token, now, expires_at
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
        """
        Mark seats permanently BOOKED in Supabase and memory.
        Strictly verifies ownership: if ANY seat is already booked or held by another
        customer/token, rejects immediately with HTTP 409 Conflict rather than overwriting.
        """
        async with LOCK_MUTEX:
            await db_manager.ensure_connected()
            now = datetime.now(timezone.utc)
            max_dt = datetime(2099, 12, 31, 23, 59, 59, tzinfo=timezone.utc)

            # 1. In-memory validation
            for seat_id in seat_ids:
                mem_entry = IN_MEMORY_SEAT_STORE.get((show_id, seat_id))
                if mem_entry:
                    if (mem_entry.get("isBooked") is True or mem_entry.get("status") == "BOOKED") and mem_entry.get("booking_id") != booking_id:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"Seat {seat_id} is already permanently booked by another customer."
                        )
                    if (
                        mem_entry.get("status") == "LOCKED"
                        and mem_entry.get("expires_at", now) > now
                        and (
                            (lock_token and mem_entry.get("lock_token") and mem_entry.get("lock_token") != lock_token)
                            or (mem_entry.get("user_id") and mem_entry.get("user_id") != user_id and mem_entry.get("lock_token") != lock_token)
                        )
                    ):
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"Seat {seat_id} is currently held by another customer."
                        )

            # 2. Supabase DB checks and atomic insert
            if db_manager.is_connected:
                # Check booked_seats
                booked_recs = await db_manager.fetch_all(
                    "SELECT seat_id, user_id, booking_id FROM booked_seats WHERE show_id = $1 AND seat_id = ANY($2);",
                    show_id, seat_ids
                )
                for b_rec in booked_recs:
                    if b_rec.get("booking_id") != booking_id:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"Seat {b_rec['seat_id']} is already permanently booked by another customer."
                        )

                # Check seat_locks
                lock_recs = await db_manager.fetch_all(
                    "SELECT seat_id, user_id, lock_token, status, is_booked, expires_at FROM seat_locks WHERE show_id = $1 AND seat_id = ANY($2);",
                    show_id, seat_ids
                )
                for l_rec in lock_recs:
                    if l_rec.get("is_booked") or l_rec.get("status") == "BOOKED":
                        if l_rec.get("booking_id") != booking_id and (l_rec.get("user_id") != user_id or l_rec.get("lock_token") != lock_token):
                            raise HTTPException(
                                status_code=status.HTTP_409_CONFLICT,
                                detail=f"Seat {l_rec['seat_id']} is already booked."
                            )
                    elif l_rec.get("status") == "LOCKED" and l_rec.get("expires_at", now) > now:
                        if (
                            (lock_token and l_rec.get("lock_token") and l_rec.get("lock_token") != lock_token)
                            or (l_rec.get("user_id") and l_rec.get("user_id") != user_id and l_rec.get("lock_token") != lock_token)
                        ):
                            raise HTTPException(
                                status_code=status.HTTP_409_CONFLICT,
                                detail=f"Seat {l_rec['seat_id']} is currently held by another customer."
                            )

                # Atomic insert into booked_seats with ON CONFLICT DO NOTHING
                for seat_id in seat_ids:
                    await db_manager.execute(
                        """
                        INSERT INTO booked_seats (
                            show_id, seat_id, user_id, booking_id, booked_at
                        ) VALUES (
                            $1, $2, $3, $4, $5
                        ) ON CONFLICT (show_id, seat_id) DO NOTHING;
                        """,
                        show_id, seat_id, user_id, booking_id, now
                    )

                # Re-verify that all requested seats were successfully claimed by this booking
                final_booked = await db_manager.fetch_all(
                    "SELECT seat_id, booking_id FROM booked_seats WHERE show_id = $1 AND seat_id = ANY($2);",
                    show_id, seat_ids
                )
                final_map = {r["seat_id"]: r["booking_id"] for r in final_booked}
                for seat_id in seat_ids:
                    if final_map.get(seat_id) != booking_id:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"Seat {seat_id} was booked by another customer before your payment completed."
                        )

                # Update seat_locks status to BOOKED
                for seat_id in seat_ids:
                    await db_manager.execute(
                        """
                        INSERT INTO seat_locks (
                            show_id, seat_id, user_id, lock_token, status, is_booked, locked_at, expires_at
                        ) VALUES (
                            $1, $2, $3, $4, 'BOOKED', TRUE, $5, $6
                        ) ON CONFLICT (show_id, seat_id) DO UPDATE SET
                            status = 'BOOKED',
                            is_booked = TRUE,
                            user_id = EXCLUDED.user_id,
                            lock_token = EXCLUDED.lock_token,
                            expires_at = EXCLUDED.expires_at;
                        """,
                        show_id, seat_id, user_id, lock_token, now, max_dt
                    )

            # 3. Store in Memory
            for seat_id in seat_ids:
                IN_MEMORY_SEAT_STORE[(show_id, seat_id)] = {
                    "lock_token": lock_token,
                    "user_id": user_id,
                    "booking_id": booking_id,
                    "expires_at": max_dt,
                    "status": "BOOKED",
                    "isBooked": True
                }
